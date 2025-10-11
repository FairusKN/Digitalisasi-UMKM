import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import ManagerNavbar from '../../components/layout/ManagerNavbar';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0
  });
  const [paymentStats, setPaymentStats] = useState<Record<string, number>>({});
  const [customerPrefs, setCustomerPrefs] = useState<{ takeaway: number; dine_in: number }>({ takeaway: 0, dine_in: 0 });
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [itemsByCategory, setItemsByCategory] = useState<Record<string, Record<string, number>>>({});
  const [selectedDetailCategory, setSelectedDetailCategory] = useState<string>('food');

  const isoDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const startOfToday = () => isoDate(new Date());
  
  const startOfWeek = (date = new Date()) => {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    return isoDate(d);
  };
  
  const endOfWeek = (date = new Date()) => {
    const start = new Date(startOfWeek(date));
    start.setDate(start.getDate() + 7);
    return isoDate(start);
  };
  
  const startOfMonth = (date = new Date()) => {
    const d = new Date(date.getFullYear(), date.getMonth(), 1);
    return isoDate(d);
  };
  
  const endOfMonth = (date = new Date()) => {
    const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return isoDate(d);
  };
  
  const startOfYear = (date = new Date()) => isoDate(new Date(date.getFullYear(), 0, 1));
  const endOfYear = (date = new Date()) => isoDate(new Date(date.getFullYear(), 11, 31));

  useEffect(() => {
    switch (selectedPeriod) {
      case 'today':
        setStartDate(startOfToday());
        setEndDate(startOfToday());
        break;
      case 'week':
        setStartDate(startOfWeek());
        setEndDate(endOfWeek());
        break;
      case 'month':
        setStartDate(startOfMonth());
        setEndDate(endOfMonth());
        break;
      case 'year':
        setStartDate(startOfYear());
        setEndDate(endOfYear());
        break;
      default:
        setStartDate(startOfToday());
        setEndDate(startOfToday());
    }
  }, [selectedPeriod]);

  useEffect(() => {
    if (startDate && endDate) {
      loadSummary();
    }
  }, [startDate, endDate]);

  const loadSummary = async () => {
    if ((selectedPeriod === 'today' || selectedPeriod === 'week' || selectedPeriod === 'month' || selectedPeriod === 'year') && (!startDate || !endDate)) {
      return;
    }

    try {
      const filters: any = {};
      if (startDate) filters.start_date = startDate;
      if (endDate) filters.end_date = endDate;
      const data = await apiService.getSummary(filters);
      setItemsByCategory(data.total_items || {});
      setPaymentStats(data.total_based_on_payment_method || {});
      setCustomerPrefs(data.total_based_on_customer_preferences || { takeaway: 0, dine_in: 0 });
      
      let productCount = 0;
      try {
        const products = await apiService.getProducts();
        productCount = Array.isArray(products) ? products.length : 0;
      } catch (e) {
        productCount = 0;
      }
      
      setStats({
        totalRevenue: Number(data.total_income ?? data.total_revenue ?? 0),
        totalOrders: data.total_order || 0,
        totalProducts: productCount
      });
    } catch (e) {
      setPaymentStats({});
      setCustomerPrefs({ takeaway: 0, dine_in: 0 });
      setStats({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0
      });
    }
  };

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 500);
  }, [stats]);

  const categoryChartData = selectedDetailCategory && itemsByCategory[selectedDetailCategory]
    ? Object.entries(itemsByCategory[selectedDetailCategory] || {})
        .sort((a, b) => Number(b[1]) - Number(a[1]))
        .slice(0, 7)
        .map(([itemName, qty]) => ({
          name: itemName.length > 10 ? itemName.substring(0, 10) + '...' : itemName,
          fullName: itemName,
          terjual: Number(qty)
        }))
    : [];

  const CustomCategoryTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-gray-900">{payload[0].payload.fullName}</p>
          <p className="text-sm text-orange-600">
            Terjual: {payload[0].value}x
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{borderColor: '#da344d'}}></div>
          <p className="text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ManagerNavbar />
      
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Manager</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Selamat datang, {user?.name || 'Manager'}! Kelola bisnis Warung Pak Aceng dengan mudah
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none transition-colors"
                onFocus={(e) => {
                  e.target.style.borderColor = '#ec5766';
                  e.target.style.boxShadow = '0 0 0 2px rgba(236, 87, 102, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgb(209 213 219)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="today">Hari Ini</option>
                <option value="week">Minggu Ini</option>
                <option value="month">Bulan Ini</option>
                <option value="year">Tahun Ini</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pendapatan</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  Rp {stats.totalRevenue.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pesanan</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalOrders}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <span className="text-2xl">📋</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Produk</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalProducts}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <span className="text-2xl">🍽️</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Penjualan per Kategori</h3>
            <div className="flex items-center space-x-2">
              <select 
                value={selectedDetailCategory} 
                onChange={(e) => setSelectedDetailCategory(e.target.value)} 
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none transition-colors text-sm"
                onFocus={(e) => {
                  e.target.style.borderColor = '#ec5766';
                  e.target.style.boxShadow = '0 0 0 2px rgba(236, 87, 102, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgb(209 213 219)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="food">Makanan</option>
                <option value="beverages">Minuman</option>
                <option value="snack">Snack</option>
              </select>
            </div>
          </div>

          {(!selectedDetailCategory || !itemsByCategory || Object.keys(itemsByCategory || {}).length === 0 || !itemsByCategory[selectedDetailCategory] || Object.keys(itemsByCategory[selectedDetailCategory] || {}).length === 0) ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <p>Data tidak tersedia untuk kategori ini</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-4 text-sm mb-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">Terjual</span>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categoryChartData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#6b7280', fontSize: 11, fontStyle: 'normal' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    height={60}
                  />
                  <YAxis 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <Tooltip content={<CustomCategoryTooltip />} />
                  <Bar dataKey="terjual" fill="#f97316" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              
              <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-orange-700 font-medium">Total Item Terjual:</span>
                  <span className="text-orange-800 font-semibold">
                    {Object.values(itemsByCategory[selectedDetailCategory] || {}).reduce((s, n) => s + Number(n), 0)} items
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Preferensi Pelanggan</h3>
              </div>
              <div className="space-y-4">
                {(() => {
                  const totalPref = customerPrefs.takeaway + customerPrefs.dine_in;
                  const dineInPercent = totalPref ? Math.round((customerPrefs.dine_in / totalPref) * 100) : 0;
                  const takeawayPercent = totalPref ? Math.round((customerPrefs.takeaway / totalPref) * 100) : 0;
                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                          <span className="text-sm font-medium text-gray-700">Makan di Tempat</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-semibold text-gray-900 mr-2">{dineInPercent}%</span>
                          <span className="text-xs text-gray-500">({customerPrefs.dine_in} pesanan)</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{width: `${dineInPercent}%`}}></div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                          <span className="text-sm font-medium text-gray-700">Bungkus/Takeaway</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-semibold text-gray-900 mr-2">{takeawayPercent}%</span>
                          <span className="text-xs text-gray-500">({customerPrefs.takeaway} pesanan)</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: `${takeawayPercent}%`}}></div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Metode Pembayaran</h3>
              </div>
              <div className="space-y-4">
                {(() => {
                  const normalized: Record<string, number> = { ...paymentStats } as any;
                  normalized.cash = Number(normalized.cash || 0);
                  normalized.qris = Number(normalized.qris || 0);
                  normalized.debit = Number(normalized.debit || 0) + Number((normalized.bank as any) || 0);
                  const totalPay = normalized.cash + normalized.qris + normalized.debit;
                  const cashPercent = totalPay ? Math.round((normalized.cash / totalPay) * 100) : 0;
                  const qrisPercent = totalPay ? Math.round((normalized.qris / totalPay) * 100) : 0;
                  const debitPercent = totalPay ? Math.round((normalized.debit / totalPay) * 100) : 0;
                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-green-600 rounded-full mr-3"></div>
                          <span className="text-sm font-medium text-gray-700">💵 Cash</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-semibold text-gray-900 mr-2">{cashPercent}%</span>
                          <span className="text-xs text-gray-500">({normalized.cash || 0} transaksi)</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{width: `${cashPercent}%`}}></div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-blue-600 rounded-full mr-3"></div>
                          <span className="text-sm font-medium text-gray-700">📱 QRIS</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-semibold text-gray-900 mr-2">{qrisPercent}%</span>
                          <span className="text-xs text-gray-500">({normalized.qris || 0} transaksi)</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: `${qrisPercent}%`}}></div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-purple-600 rounded-full mr-3"></div>
                          <span className="text-sm font-medium text-gray-700">💳 Kartu Debit</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-semibold text-gray-900 mr-2">{debitPercent}%</span>
                          <span className="text-xs text-gray-500">({normalized.debit || 0} transaksi)</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{width: `${debitPercent}%`}}></div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;