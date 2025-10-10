import { useState, useEffect } from 'react';
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

  const getPeriodInfo = () => {
    switch (selectedPeriod) {
      case 'today':
        return {
          title: 'Pendapatan Hari Ini',
          days: [{ label: 'Sekarang' }],
          summary: 'Total Hari Ini',
          comparison: 'dari kemarin'
        };
      case 'week':
        return {
          title: 'Pendapatan Mingguan',
          days: [
            { label: 'Sen' },
            { label: 'Sel' },
            { label: 'Rab' },
            { label: 'Kam' },
            { label: 'Jum' },
            { label: 'Sab' },
            { label: 'Min' }
          ],
          summary: 'Total Minggu Ini',
          comparison: 'dari minggu lalu'
        };
      case 'month':
        return {
          title: 'Pendapatan Bulanan',
          days: [
            { label: 'Minggu 1' },
            { label: 'Minggu 2' },
            { label: 'Minggu 3' },
            { label: 'Minggu 4' }
          ],
          summary: 'Total Bulan Ini',
          comparison: 'dari bulan lalu'
        };
      case 'year':
        return {
          title: 'Pendapatan Tahunan',
          days: [
            { label: 'Q1' },
            { label: 'Q2' },
            { label: 'Q3' },
            { label: 'Q4' }
          ],
          summary: 'Total Tahun Ini',
          comparison: 'dari tahun lalu'
        };
      default:
        return {
          title: 'Pendapatan Hari Ini',
          days: [{ label: 'Sekarang' }],
          summary: 'Total Hari Ini',
          comparison: 'dari kemarin'
        };
    }
  };

  const periodInfo = getPeriodInfo();
  const [startDate, _setStartDate] = useState<string>('');
  const [endDate, _setEndDate] = useState<string>('');
  const [categoryData, setCategoryData] = useState<Record<string, number>>({});
  const [itemsByCategory, setItemsByCategory] = useState<Record<string, Record<string, number>>>({});
  const [selectedDetailCategory, setSelectedDetailCategory] = useState<string>('');

  useEffect(() => {
    loadSummary();
  }, [selectedPeriod, startDate, endDate]);

  const loadSummary = async () => {
    try {
      const filters: any = {};
      if (startDate) filters.start_date = startDate;
      if (endDate) filters.end_date = endDate;
      const data = await apiService.getSummary(filters);
      setCategoryData(data.total_based_on_product_category || {});
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
        totalRevenue: data.total_revenue || 0,
        totalOrders: data.total_order || 0,
        totalProducts: productCount
      });
      if (!selectedDetailCategory) {
        const firstCat = Object.keys(data.total_items || {})[0] || Object.keys(data.total_based_on_product_category || {})[0] || '';
        setSelectedDetailCategory(firstCat);
      }
    } catch (e) {
      setCategoryData({});
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
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
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

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
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

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
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

          {/* Total Pelanggan card removed - using product count instead */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">{periodInfo.title}</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 text-sm mb-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">Pendapatan</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-200 rounded-full mr-2"></div>
                  <span className="text-gray-600">Target</span>
                </div>
              </div>
              
              <div className="h-48 flex items-end justify-between space-x-2 rounded-lg p-4">
                {periodInfo.days.map((day, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
            <div className="w-full max-w-12 h-32 rounded-t-md relative flex flex-col justify-end overflow-hidden">
              <div className="absolute bottom-0 w-full bg-orange-200 rounded-t-md" style={{height: '100%'}}></div>
              <div className="absolute bottom-0 w-full bg-orange-500 rounded-t-md transition-all duration-500" style={{height: '0%'}}></div>
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                        <span className="text-xs font-medium text-gray-600 bg-white px-1 py-0.5 rounded shadow-sm whitespace-nowrap">
                          Rp 0
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 text-xs font-medium text-gray-600 text-center">
                      {day.label}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-orange-700 font-medium">Total Hari Ini:</span>
                  <span className="text-orange-800 font-semibold">{periodInfo.summary}</span>
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
                  <option value="">-- Pilih Kategori --</option>
                  {Object.keys(categoryData).map(c => (
                    <option key={c} value={c}>{c.replace(/_/g, ' ').charAt(0).toUpperCase() + c.replace(/_/g, ' ').slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            {(!selectedDetailCategory || !itemsByCategory || Object.keys(itemsByCategory || {}).length === 0) ? (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <p>Pilih kategori untuk melihat detail item</p>
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
                
                <div className="h-48 flex items-end justify-between space-x-2 rounded-lg p-4">
                  {Object.entries(itemsByCategory[selectedDetailCategory] || {})
                    .sort((a, b) => Number(b[1]) - Number(a[1]))
                    .slice(0, 7)
                    .map(([itemName, qty]) => {
                      const max = Math.max(...Object.values(itemsByCategory[selectedDetailCategory] || {}).map(n => Number(n)), 1);
                      const heightPercent = Math.round((Number(qty) / max) * 100);
                      
                      return (
                        <div key={itemName} className="flex flex-col items-center flex-1">
                          <div className="w-full max-w-12 h-32 rounded-t-md relative flex flex-col justify-end overflow-hidden">
                            <div className="absolute bottom-0 w-full bg-orange-500 rounded-t-md transition-all duration-500" style={{height: `${heightPercent}%`}}></div>
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                              <span className="text-xs font-medium text-gray-600 bg-white px-1 py-0.5 rounded shadow-sm whitespace-nowrap">
                                {qty}x
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 text-xs font-medium text-gray-600 text-center truncate w-full" title={itemName}>
                            {itemName.length > 10 ? itemName.substring(0, 10) + '...' : itemName}
                          </div>
                        </div>
                      );
                    })}
                </div>
                
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