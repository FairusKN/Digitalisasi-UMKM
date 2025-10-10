import { useState, useEffect } from 'react';
import apiService, { getImageUrl } from '../../services/api';
import { confirm, alert } from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import ManagerNavbar from '../../components/layout/ManagerNavbar';
import type { Product } from '../../types';

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'food' | 'beverages' | 'snack'>('all');

  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    category: '',
    image: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      
      const response = await apiService.getProducts();
      
      if (response && Array.isArray(response)) {
        setProducts(response);
      } else if (response) {
        setProducts([response]);
      } else {
        setProducts([]);
      }
    } catch (error) {
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

    const formatCategory = (cat?: string) => {
      if (!cat) return 'Tanpa Kategori';
      const key = cat.toLowerCase();
      if (key === 'food') return 'Makanan';
      if (key === 'beverages') return 'Minuman';
      if (key === 'snack' || key === 'snacks') return 'Snack';
      return cat;
    };

  const filteredProducts = Array.isArray(products)
    ? products.filter(product => {
        if (!product || !product.name) return false;
        const searchLower = searchTerm.toLowerCase();
        const nameMatch = product.name.toLowerCase().includes(searchLower);
        const categoryLabel = formatCategory(product.category).toLowerCase();
        const categoryMatch = categoryLabel.includes(searchLower);
        const matchesCategory = categoryFilter === 'all' ? true : product.category === categoryFilter;
        return (nameMatch || categoryMatch) && matchesCategory;
      })
    : [];

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsSubmitting(false);
    setFormData({
      name: '',
      price: 0,
      category: '',
      image: ''
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsSubmitting(false);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.image
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const compressImage = (file: File, maxWidth = 800, quality = 0.65, timeoutMs = 6000): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      let finished = false;

      const finish = (resultFile: File) => {
        if (finished) return;
        finished = true;
        try { URL.revokeObjectURL(objectUrl); } catch (e) {}
        resolve(resultFile);
      };

      const timer = setTimeout(() => {
        finish(file);
      }, timeoutMs);

      img.onload = () => {
        try {
          const ratio = Math.min(maxWidth / img.width, maxWidth / img.height, 1);
          canvas.width = Math.round(img.width * ratio);
          canvas.height = Math.round(img.height * ratio);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        } catch (drawError) {
          clearTimeout(timer);
          finish(file);
          return;
        }

        try {
          canvas.toBlob((blob) => {
            clearTimeout(timer);
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              finish(compressedFile);
            } else {
              finish(file);
            }
          }, 'image/jpeg', quality);
        } catch (e) {
          clearTimeout(timer);
          finish(file);
        }
      };

      img.onerror = () => {
        clearTimeout(timer);
        finish(file);
      };

      img.src = objectUrl;
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        await alert('Ukuran gambar terlalu besar! Maksimal 10MB', 'error');
        return;
      }
      
      if (file.size > 300 * 1024) {
        try {
          const compressedFile = await compressImage(file);
          setImageFile(compressedFile);
        } catch (compressionError) {
          setImageFile(file);
        }
      } else {
        setImageFile(file);
      }
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    const confirmed = await confirm(
      `Apakah Anda yakin ingin menghapus produk "${product.name}"?`,
      'Hapus Produk'
    );
    
    if (confirmed) {
      try {
        await apiService.deleteProduct(product.id);
        setProducts(prev => prev.filter(p => p.id !== product.id));
        await alert('Produk berhasil dihapus!', 'success');
      } catch (error: any) {
        await loadProducts();
        
        let errorMessage = 'Gagal menghapus produk!';
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        }
        
        await alert(errorMessage, 'error');
      }
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!formData.name.trim()) {
        await alert('Nama produk harus diisi!', 'error');
        setIsSubmitting(false);
        return;
      }
      
      if (formData.name.trim().length < 2) {
        await alert('Nama produk minimal 2 karakter!', 'error');
        setIsSubmitting(false);
        return;
      }
      
      if (formData.price <= 0) {
        await alert('Harga produk harus lebih dari 0!', 'error');
        setIsSubmitting(false);
        return;
      }
      
      if (!formData.category) {
        await alert('Kategori produk harus dipilih!', 'error');
        setIsSubmitting(false);
        return;
      }
      
      const validCategories = ['food', 'beverages', 'snack'];
      if (!validCategories.includes(formData.category)) {
        await alert('Kategori produk tidak valid!', 'error');
        setIsSubmitting(false);
        return;
      }
      
      let imageUrl = formData.image;
      
      if (!imageFile && formData.image) {
        imageUrl = formData.image;
      }
      
      if (editingProduct) {
        const updatePayload: any = {};
        if (formData.name.trim() !== editingProduct.name) updatePayload.name = formData.name.trim();
        if (formData.price !== editingProduct.price) updatePayload.price = formData.price;
        if (formData.category !== editingProduct.category) updatePayload.category = formData.category;

        if (Object.keys(updatePayload).length === 0 && !imageFile) {
          setIsSubmitting(false);
          await alert('Tidak ada perubahan untuk disimpan.', 'info');
          return;
        }
        const updatedProduct = await apiService.updateProduct(editingProduct.id, updatePayload, imageFile || undefined);

        const up: any = updatedProduct || {};
        const normalizedUpdated = {
          id: String(up.id ?? up.product_id ?? up.uuid ?? editingProduct.id),
          name: up.name ?? updatePayload.name ?? editingProduct.name,
          price: Number(up.price ?? updatePayload.price ?? editingProduct.price) || 0,
          category: up.category ?? updatePayload.category ?? editingProduct.category,
          image: up.image_path ?? up.image ?? editingProduct.image ?? ''
        } as Product;

        setProducts(prev => prev.map(p => 
          p.id === editingProduct.id 
            ? normalizedUpdated
            : p
        ));

        setIsSubmitting(false);
        setIsModalOpen(false);
        await alert('Produk berhasil diupdate!', 'success');
      } else {
        const productPayload: any = {
          name: formData.name.trim(),
          price: formData.price,
          category: formData.category
        };
        
        if (imageUrl) {
          productPayload.image = imageUrl;
        }
        
        const createdProduct = await apiService.createProduct(productPayload, imageFile || undefined);

        const c: any = createdProduct || {};
        const normalizedNew: Product = {
          id: String(c.id ?? c.product_id ?? c.uuid ?? Date.now()),
          name: c.name ?? productPayload.name,
          price: Number(c.price ?? productPayload.price ?? 0) || 0,
          category: c.category ?? productPayload.category ?? '',
          image: c.image_path ?? c.image ?? ''
        } as Product;

        setProducts(prev => [normalizedNew, ...prev]);

        if (imageFile && !normalizedNew.image) {
          setTimeout(() => {
            loadProducts().catch(() => {});
          }, 1000);
        }

        setIsSubmitting(false);
        setIsModalOpen(false);
        await alert('Produk berhasil ditambahkan!', 'success');
      }
      
      setIsModalOpen(false);
      setFormData({
        name: '',
        price: 0,
        category: '',
        image: ''
      });
      setImageFile(null);
      
    } catch (error: any) {
      let errorMessage = 'Gagal menyimpan produk!';

      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Koneksi timeout saat mengunggah file. Silakan coba lagi.';
      } else if (!error.response) {
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi Anda.';
      }

      if (error.response?.status === 422) {
        const errors = error.response?.data?.errors;
        if (errors) {
          if (typeof errors === 'object') {
            const errorMessages = Object.entries(errors)
              .map(([field, messages]: [string, any]) => {
                const msgs = Array.isArray(messages) ? messages : [messages];
                return `${field}: ${msgs.join(', ')}`;
              })
              .join('\n');
            errorMessage = `Validasi gagal:\n${errorMessages}`;
          } else if (typeof errors === 'string') {
            errorMessage = `Validasi gagal: ${errors}`;
          }
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      await alert(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ManagerNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="bg-red-800 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Kelola Produk</h1>
              <p className="text-lg opacity-90">Atur menu dan produk warung Anda dengan mudah</p>
              <div className="mt-6 flex flex-col gap-4">
                <div className="w-full flex flex-col sm:flex-row gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Cari produk berdasarkan nama atau kategori..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 transition-all"
                  />
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <button
                      type="button"
                      onClick={() => setCategoryFilter('all')}
                      className={`px-5 py-2 rounded-full font-semibold transition-all duration-200 shadow-sm ${categoryFilter === 'all' ? 'bg-gradient-to-r from-red-500 to-red-700 text-white shadow-lg scale-105' : 'bg-white text-red-700 hover:bg-red-50 hover:scale-105'} border-0`}
                    >Semua</button>
                    <button
                      type="button"
                      onClick={() => setCategoryFilter('food')}
                      className={`px-5 py-2 rounded-full font-semibold transition-all duration-200 shadow-sm ${categoryFilter === 'food' ? 'bg-gradient-to-r from-red-500 to-red-700 text-white shadow-lg scale-105' : 'bg-white text-red-700 hover:bg-red-50 hover:scale-105'} border-0`}
                    >Makanan</button>
                    <button
                      type="button"
                      onClick={() => setCategoryFilter('beverages')}
                      className={`px-5 py-2 rounded-full font-semibold transition-all duration-200 shadow-sm ${categoryFilter === 'beverages' ? 'bg-gradient-to-r from-red-500 to-red-700 text-white shadow-lg scale-105' : 'bg-white text-red-700 hover:bg-red-50 hover:scale-105'} border-0`}
                    >Minuman</button>
                    <button
                      type="button"
                      onClick={() => setCategoryFilter('snack')}
                      className={`px-5 py-2 rounded-full font-semibold transition-all duration-200 shadow-sm ${categoryFilter === 'snack' ? 'bg-gradient-to-r from-red-500 to-red-700 text-white shadow-lg scale-105' : 'bg-white text-red-700 hover:bg-red-50 hover:scale-105'} border-0`}
                    >Snack</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
                <span className="text-white text-xl">📊</span>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Produk Tersedia</h2>
                <p className="text-gray-500">{filteredProducts.length} item ditemukan</p>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                  <div className="w-full h-48 bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <span className="text-4xl">📦</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Belum ada produk</h3>
              <p className="text-gray-500 mb-6">Mulai tambahkan produk untuk warung Anda</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const imageUrl = getImageUrl(product.image);
                return (
                <div key={product.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-red-200">
                  {/* Product Image */}
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={product.name || 'Produk'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-6xl">📦</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                  </div>                  
                  {/* Product Info */}
                  <div className="p-5">
                    <div className="mb-3">
                      <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">{product.name || 'Nama Produk'}</h3>
                    </div>

                    {/* Category */}
                    <div className="mb-3">
                      <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full text-white" style={{
                        background: 'linear-gradient(135deg, #ec5766 0%, #da344d 100%)'
                      }}>
                        <span className="mr-1">🏷️</span>
                        {formatCategory(product.category)}
                      </span>
                    </div>
                    
                    {/* Price */}
                    <div className="mb-4">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(Number(product.price) || 0)}
                      </p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="flex-1 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors font-medium text-sm"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product)}
                        className="px-4 py-2 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-colors font-medium text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleAddProduct}
        aria-label="Tambah Produk"
        className="group fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-white border-2 border-green-500 hover:border-green-600 text-green-500 hover:text-white hover:bg-green-500 shadow-lg hover:shadow-xl flex items-center justify-center text-2xl font-normal transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
      >
        <span aria-hidden="true">+</span>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-xl shadow-2xl border border-white/20 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
            </h3>
            
            <form onSubmit={handleSaveProduct} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Produk
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 transition-colors"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#ec5766';
                    e.target.style.boxShadow = '0 0 0 2px rgba(236, 87, 102, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgb(209 213 219)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Harga (IDR)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 transition-colors"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#ec5766';
                    e.target.style.boxShadow = '0 0 0 2px rgba(236, 87, 102, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgb(209 213 219)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori Produk
                </label>
                <div className="relative">
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all appearance-none hover:border-gray-400"
                    onFocus={(e) => {
                      e.target.style.borderColor = '#ec5766';
                      e.target.style.boxShadow = '0 0 0 3px rgba(236, 87, 102, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgb(209 213 219)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="" disabled style={{color: '#9ca3af'}}>
                      Pilih kategori produk...
                    </option>
                    <option value="food">
                      Makanan
                    </option>
                    <option value="beverages">
                      Beverages
                    </option>
                    <option value="snack">
                      Snack
                    </option>
                  </select>
                  
                  {/* Custom select indicator overlay */}
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                
                {/* Category preview */}
                {formData.category && (
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Kategori terpilih:</span>
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-red-700 bg-red-50 border border-red-200">
                      {formData.category === 'food' ? 'Makanan' : 
                       formData.category === 'beverages' ? 'Beverages' : 
                       formData.category === 'snack' ? 'Snack' : formData.category}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Foto Produk
                </label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                    onFocus={(e) => {
                      e.target.style.borderColor = '#ec5766';
                      e.target.style.boxShadow = '0 0 0 2px rgba(236, 87, 102, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgb(209 213 219)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    if (!isSubmitting) {
                      setIsModalOpen(false);
                      setIsSubmitting(false);
                      setImageFile(null);
                    }
                  }}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Menyimpan...</span>
                    </div>
                  ) : (
                    editingProduct ? 'Update' : 'Simpan'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;