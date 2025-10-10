import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { confirm, alert } from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import ManagerNavbar from '../../components/layout/ManagerNavbar';
import type { User, Role } from '../../types';

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'manager' | 'cashier'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'cashier' as Role
  });

  const isSuperuser = apiService.isSuperuserManager(user);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getUsers();
      const userData: User[] = Array.isArray(response) ? response : [];
      setUsers(userData);
    } catch (error: any) {
      setUsers([]);
      if (users.length > 0) {
        await alert('Terjadi kesalahan saat memuat data user!', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' ? true : u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const displayUsers = filteredUsers.filter(u => String(u.id) !== String(user?.id));
  const cashierCount = displayUsers.filter(u => u.role === 'cashier').length;
  const managerCount = displayUsers.filter(u => u.role === 'manager').length;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage] = useState<number>(9);
  const totalPages = Math.max(1, Math.ceil(displayUsers.length / perPage));
  const paginatedUsers = displayUsers.slice((currentPage - 1) * perPage, currentPage * perPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages]);

  const handleAddUser = () => {
    setEditingUser(null);
    setIsSubmitting(false);
    setFormData({
      name: '',
      username: '',
      password: '',
      confirmPassword: '',
      role: 'cashier'
    });
    setIsModalOpen(true);
  };

  const handleEditUser = (editUser: User) => {
    if (!isSuperuser && editUser.role === 'manager') {
      alert('Anda tidak memiliki izin untuk mengedit manager!', 'error');
      return;
    }
    
    setEditingUser(editUser);
    setIsSubmitting(false);
    setFormData({
      name: editUser.name,
      username: editUser.username,
      password: '',
      confirmPassword: '',
      role: editUser.role
    });
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (deleteUser: User) => {
    if (deleteUser.id === user?.id) {
      await alert('Anda tidak bisa menghapus akun sendiri!', 'error');
      return;
    }

    if (!isSuperuser && deleteUser.role !== 'cashier') {
      await alert('Hanya superuser yang dapat menghapus user dengan role ini!', 'error');
      return;
    }

    const confirmed = await confirm(
      `Apakah Anda yakin ingin menghapus user "${deleteUser.name}"?`,
      'Hapus User'
    );
    
    if (confirmed) {
      try {
        await apiService.deleteUser(deleteUser.id);
        setUsers(prev => prev.filter(u => u.id !== deleteUser.id));
        await alert('User berhasil dihapus!', 'success');
      } catch (error: any) {

        await alert('Terjadi kesalahan saat menghapus user!', 'error');
      }
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!editingUser && formData.password !== formData.confirmPassword) {
      await alert('Password dan konfirmasi password tidak sama!', 'error');
      setIsSubmitting(false);
      return;
    }

    if (!formData.name.trim() || !formData.username.trim()) {
      await alert('Nama dan username harus diisi!', 'error');
      setIsSubmitting(false);
      return;
    }

    if (!editingUser && !formData.password.trim()) {
      await alert('Password harus diisi untuk user baru!', 'error');
      setIsSubmitting(false);
      return;
    }
    
    const usernameExists = users.some(u => 
      u.username.toLowerCase() === formData.username.toLowerCase().trim() && 
      u.id !== editingUser?.id
    );
    
    if (usernameExists) {
      await alert('Username sudah digunakan! Silakan pilih username lain.', 'error');
      setIsSubmitting(false);
      return;
    }
    
    if (formData.username.trim().length < 3) {
      await alert('Username minimal 3 karakter!', 'error');
      setIsSubmitting(false);
      return;
    }
    
    if (formData.name.trim().length < 2) {
      await alert('Nama minimal 2 karakter!', 'error');
      setIsSubmitting(false);
      return;
    }
    
    if (!editingUser && formData.password.length < 3) {
      await alert('Password minimal 3 karakter!', 'error');
      setIsSubmitting(false);
      return;
    }

    if (editingUser && formData.password.trim() && formData.password.length < 3) {
      await alert('Password minimal 3 karakter jika ingin mengubah password!', 'error');
      setIsSubmitting(false);
      return;
    }

    try {
      let response: any;
      if (editingUser) {
        const updateData: any = {};

        const trimmedName = formData.name.trim();
        const currentName = (editingUser.name || '').trim();
        if (trimmedName !== currentName) {
          updateData.name = trimmedName;
        }

        const trimmedUsername = formData.username.trim();
        const currentUsername = (editingUser.username || '').trim();
        if (trimmedUsername.toLowerCase() !== currentUsername.toLowerCase()) {
          updateData.username = trimmedUsername;
        }

        if (isSuperuser && formData.role !== editingUser.role) {
          updateData.role = formData.role;
        }

        if (formData.password.trim()) {
          updateData.password = formData.password;
          updateData.password_confirmation = formData.password;
        }

        if (Object.keys(updateData).length === 0) {
          await alert('Tidak ada perubahan untuk disimpan!', 'error');
          setIsSubmitting(false);
          return;
        }

        response = await apiService.updateUser(editingUser.id, updateData);
        
        setUsers(prev => prev.map(u => {
          if (u.id !== editingUser.id) return u;
          const resp = response || {};
          const merged: User = {
            ...u,
            ...resp,
            id: editingUser.id,
            role: (resp.role ?? u.role) as Role
          } as User;
          return merged;
        }));
        
        setIsModalOpen(false);
        setIsSubmitting(false);
        setFormData({
          name: '',
          username: '',
          password: '',
          confirmPassword: '',
          role: 'cashier'
        });
        
        await alert('User berhasil diupdate!', 'success');
      } else {
        const createData = {
          name: formData.name.trim(),
          username: formData.username.trim(),
          password: formData.password,
          password_confirmation: formData.password,
          role: formData.role
        };
        
        response = await apiService.createUser(createData);
        
        const created = response || {};
        const newUser: User = {
          id: String(created.id ?? created.user_id ?? created.uuid ?? Date.now()),
          name: (created.name ?? createData.name) as string,
          username: (created.username ?? createData.username) as string,
          role: (created.role ?? createData.role ?? 'cashier') as Role,
        } as User;

        setUsers(prev => {
          if (newUser.role === 'manager') {
            const managers = prev.filter(p => p.role === 'manager');
            const others = prev.filter(p => p.role !== 'manager');
            return [...managers, newUser, ...others];
          }
          return [newUser, ...prev];
        });
        
        setIsModalOpen(false);
        setIsSubmitting(false);
        setFormData({
          name: '',
          username: '',
          password: '',
          confirmPassword: '',
          role: 'cashier'
        });
        
        await alert('User berhasil ditambahkan!', 'success');
      }
    } catch (error: any) {
      let errorMessage = 'Terjadi kesalahan saat menyimpan user!';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Koneksi timeout. Memeriksa apakah perubahan sudah tersimpan...';
        await alert(errorMessage, 'error');
        
        try {
          const freshUsers = await apiService.getUsers();
          const usersData: User[] = Array.isArray(freshUsers) ? freshUsers : [];
          setUsers(usersData);
          
          const checkUser = usersData.find(u => 
            u.username.toLowerCase() === formData.username.toLowerCase().trim() &&
            u.name.trim() === formData.name.trim()
          );
          
          if (checkUser) {
            setIsModalOpen(false);
            setIsSubmitting(false);
            setFormData({
              name: '',
              username: '',
              password: '',
              confirmPassword: '',
              role: 'cashier'
            });
            await alert('Perubahan berhasil disimpan meskipun terjadi timeout!', 'success');
            return;
          }
        } catch (reloadErr) {}
        
        setIsSubmitting(false);
        return;
      }
      
      if (error?.response?.status === 500) {
        console.error('Server 500 while saving user:', error.response?.data || error);
        try {
          const freshUsers = await apiService.getUsers();
          const usersData: User[] = Array.isArray(freshUsers) ? freshUsers : [];
          setUsers(usersData);
          const checkUser = usersData.find(u =>
            u.username.toLowerCase() === formData.username.toLowerCase().trim() &&
            u.name.trim() === formData.name.trim()
          );
          if (checkUser) {
            setIsModalOpen(false);
            setIsSubmitting(false);
            setFormData({ name: '', username: '', password: '', confirmPassword: '', role: 'cashier' });
            await alert('Perubahan berhasil disimpan meskipun terjadi kesalahan server.', 'success');
            return;
          }
        } catch (reloadErr) {
          console.error('Error while reloading users after 500:', reloadErr);
        }

        const serverMsg = error.response?.data?.message || error.response?.data || null;
        const friendly = serverMsg ? `Gagal menambahkan user: ${String(serverMsg)}` : 'Gagal menambahkan user karena kesalahan server. Silakan coba lagi nanti atau hubungi admin.';
        await alert(friendly, 'error');
        setIsSubmitting(false);
        return;
      }
      
      if (error.response?.status === 422) {
        const errors = error.response?.data?.errors;
        
        if (errors) {
          if (typeof errors === 'object') {
            const errorMessages = Object.entries(errors)
              .map(([field, messages]: [string, any]) => {
                const msgArray = Array.isArray(messages) ? messages : [messages];
                return `${field}: ${msgArray.join(', ')}`;
              })
              .join('\n');
            errorMessage = `Validasi gagal:\n${errorMessages}`;
          } else if (typeof errors === 'string') {
            errorMessage = `Validasi gagal: ${errors}`;
          }
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
          
          if (errorMessage.toLowerCase().includes('username') && errorMessage.toLowerCase().includes('taken')) {
            errorMessage = 'Username sudah digunakan! Silakan pilih username lain.';
            await loadUsers();
          } else if (errorMessage.toLowerCase().includes('password')) {
            errorMessage = 'Password tidak valid atau tidak sesuai dengan konfirmasi.';
          }
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (!error.response) {
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
      }
      
      if (errorMessage.includes('Forbidden to manage user') || errorMessage.includes('role')) {
        errorMessage = `Akses ditolak: Anda tidak memiliki izin untuk mengelola user dengan role "${formData.role}". \nHanya superuser manager (admin/owner) yang dapat mengelola semua role.`;
      }
      
      await alert(errorMessage, 'error');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ManagerNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-4 justify-between">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-1">Tim & Pengguna</h1>
                  <p className="text-lg opacity-90">Kelola tim warung Anda dengan mudah</p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4">
                <div className="w-full flex flex-col sm:flex-row gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Cari berdasarkan nama, username, atau role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 transition-all"
                  />
                  {isSuperuser && (
                    <div className="flex gap-2 mt-2 sm:mt-0">
                      <button
                        type="button"
                        onClick={() => setRoleFilter('all')}
                        className={`px-5 py-2 rounded-full font-semibold transition-all duration-200 shadow-sm ${roleFilter === 'all' ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg scale-105' : 'bg-white text-blue-700 hover:bg-blue-50 hover:scale-105'} border-0`}
                      >Semua</button>
                      <button
                        type="button"
                        onClick={() => setRoleFilter('manager')}
                        className={`px-5 py-2 rounded-full font-semibold transition-all duration-200 shadow-sm ${roleFilter === 'manager' ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg scale-105' : 'bg-white text-blue-700 hover:bg-blue-50 hover:scale-105'} border-0`}
                      >Manager</button>
                      <button
                        type="button"
                        onClick={() => setRoleFilter('cashier')}
                        className={`px-5 py-2 rounded-full font-semibold transition-all duration-200 shadow-sm ${roleFilter === 'cashier' ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg scale-105' : 'bg-white text-blue-700 hover:bg-blue-50 hover:scale-105'} border-0`}
                      >Kasir</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-2xl p-4">
                  <div className="text-2xl font-bold">{cashierCount}</div>
                  <div className="text-sm opacity-90">Kasir</div>
                </div>
                {isSuperuser && (
                  <div className="bg-white/10 rounded-2xl p-4">
                    <div className="text-2xl font-bold">{managerCount}</div>
                    <div className="text-sm opacity-90">Manager</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full mr-4"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-indigo-200 rounded-full flex items-center justify-center">
                <span className="text-4xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Belum ada anggota tim</h3>
              <p className="text-gray-500 mb-6">Mulai tambahkan anggota tim untuk warung Anda</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedUsers.map((userItem) => (
                  <div
                    key={userItem.id}
                    className={`bg-white rounded-lg shadow p-4 flex flex-col justify-between border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-blue-300 ${userItem.id === user?.id ? 'border-green-200' : 'border-gray-100'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 text-sm font-semibold text-gray-800`}>{(userItem.name || userItem.username || '').split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase()}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="truncate">
                            <div className="font-medium text-gray-900 truncate">{userItem.name}</div>
                            <div className="text-xs text-gray-500 truncate">@{userItem.username}</div>
                          </div>
                          <div className="ml-2 text-xs">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${userItem.role === 'manager' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{userItem.role === 'manager' ? 'Manager' : 'Kasir'}</span>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          ID: <span className="font-mono">{String(userItem.id).slice(-8)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-end gap-2">
                      {(isSuperuser || userItem.role === 'cashier') && (
                        <>
                          <button onClick={() => handleEditUser(userItem)} className="px-3 py-2 text-sm bg-gray-50 rounded-md hover:bg-gray-100">✏️</button>
                          {userItem.id !== user?.id && (
                            <button onClick={() => handleDeleteUser(userItem)} className="px-3 py-2 text-sm bg-gray-50 rounded-md hover:bg-gray-100">🗑️</button>
                          )}
                        </>
                      )}
                      {!isSuperuser && userItem.role === 'manager' && (
                        <div className="text-xs text-gray-400 px-3 py-2">Akses Terbatas</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-600">Menampilkan {Math.min(displayUsers.length, (currentPage - 1) * perPage + 1)} - {Math.min(displayUsers.length, currentPage * perPage)} dari {displayUsers.length}</div>
                </div>

                <div className="flex items-center justify-center">
                  <nav
                    className="inline-flex items-center space-x-2 px-4 py-3 rounded-2xl bg-white shadow border border-gray-200"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-full font-medium transition-all duration-200 border border-gray-200 bg-gray-50 text-gray-500 hover:bg-blue-100 hover:text-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
                    >
                      &lt;
                    </button>

                    {(() => {
                      const pages = [] as (number | '...')[];
                      const windowSize = 5;
                      let start = Math.max(1, currentPage - Math.floor(windowSize / 2));
                      let end = start + windowSize - 1;
                      if (end > totalPages) {
                        end = totalPages;
                        start = Math.max(1, end - windowSize + 1);
                      }

                      if (start > 1) pages.push(1);
                      if (start > 2) pages.push('...');

                      for (let p = start; p <= end; p++) pages.push(p);

                      if (end < totalPages - 1) pages.push('...');
                      if (end < totalPages) pages.push(totalPages);

                      return pages.map((p, idx) => (
                        p === '...'
                          ? <span key={`dots-${idx}`} className="px-2 text-sm text-gray-400">…</span>
                          : <button
                              key={`page-${p}`}
                              onClick={() => setCurrentPage(Number(p))}
                              className={`px-4 py-2 rounded-full font-medium border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 ${p === currentPage ? 'bg-blue-600 text-white border-blue-600 shadow' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-blue-100 hover:text-blue-700 hover:scale-105'}`}
                            >{p}</button>
                      ));
                    })()}

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-full font-medium transition-all duration-200 border border-gray-200 bg-gray-50 text-gray-500 hover:bg-blue-100 hover:text-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
                    >
                      &gt;
                    </button>
                  </nav>
                </div>
              </div>
            </>
          )}
        </div>

        <button
        onClick={handleAddUser}
        aria-label="Tambah User"
        className="group fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-white border-2 border-green-500 hover:border-green-600 text-green-500 hover:text-white hover:bg-green-500 shadow-lg hover:shadow-xl flex items-center justify-center text-2xl font-normal transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
      >
        <span aria-hidden="true">+</span>
      </button>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg w-full max-w-lg p-6">
              <h3 className="text-lg font-semibold mb-4">{editingUser ? 'Edit User' : 'Tambah User'}</h3>
              <form onSubmit={handleSaveUser}>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input type="text" required value={formData.username} onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input type="password" required={!editingUser} value={formData.password} onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))} minLength={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  {!editingUser && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
                      <input type="password" required={!editingUser} value={formData.confirmPassword} onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))} minLength={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      required
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as Role }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="cashier">Cashier</option>
                      {isSuperuser && <option value="manager">Manager</option>}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Batal</button>
                  <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Menyimpan...' : (editingUser ? 'Update' : 'Simpan')}</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;