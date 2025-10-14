import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { confirm, success, error as showError } from '../../components/ui/Alert';
import PrintReceipt from '../../components/common/PrintReceipt';
import type { Product, Order } from '../../types';

const CashierDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerNote, setCustomerNote] = useState('');
  const [takeaway, setTakeaway] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<{
    customerName: string;
    items: { product: Product; quantity: number }[];
    total: number;
    paymentMethod?: string;
    paidAmount?: number;
    takeaway?: boolean;
    note?: string;
    createdAt?: string;
  } | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, []);

  const loadProducts = async () => {
    try {
      const productsData = await apiService.getPublicProducts();
      if (Array.isArray(productsData)) {
        setProducts(productsData);
      } else {
        setProducts([]);
      }
    } catch (error: any) {
      setProducts([]);
    }
  };

  const loadOrders = async () => {
    try {
      const raw = await apiService.getCashierSummary();

      let ordersArray: any[] = [];
      if (Array.isArray(raw)) ordersArray = raw;
      else if (raw && Array.isArray((raw as any).data)) ordersArray = (raw as any).data;
      else if (raw && (raw as any).data && Array.isArray((raw as any).data.data)) ordersArray = (raw as any).data.data;
      else if (raw && typeof raw === 'object') {
        const vals = Object.values(raw);
        if (vals.every(v => typeof v === 'object') && vals.length > 0) {
          ordersArray = vals as any[];
        } else {
          ordersArray = [raw];
        }
      }

      const normalized = ordersArray.map((o: any) => {
        const itemsRaw = Array.isArray(o.items) ? o.items : (o.items?.data && Array.isArray(o.items.data) ? o.items.data : []);
        const items = (itemsRaw || []).map((it: any) => ({
          quantity: it.quantity ?? it.qty ?? 0,
          product: it.product ?? { name: it.name ?? 'Unknown', price: it.price ?? 0 },
          subtotal: Number(it.subtotal ?? (it.quantity ?? 0) * (it.price ?? 0))
        }));

        return {
          id: o.id ?? o.uuid ?? o._id ?? Math.random().toString(36).slice(2,9),
          items,
          totalAmount: Number(o.total ?? o.totalAmount ?? o.amount ?? 0),
          metadata: {
            paymentMethod: o.payment_method ?? o.paymentMethod ?? o.method ?? 'cash',
            paidAmount: Number(o.cash_received ?? o.metadata?.paidAmount ?? 0),
            note: o.note ?? o.metadata?.note,
            takeaway: !!(o.is_takeaway ?? o.metadata?.takeaway ?? o.takeaway)
          },
          createdAt: o.created_at ?? o.createdAt ?? o.created ?? new Date().toISOString()
        } as unknown as Order;
      });

      setOrders(normalized);
    } catch (error: any) {
      setOrders([]);
    }
  };

  const categories = ['all', ...Array.from(new Set(products.map(p => (p.category || 'other').toString())))]

  const filteredProducts = products.filter(product => {
    const matchesName = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesName) return false;
    const prodCat = (product.category || 'other').toString().toLowerCase();
    const selCat = (selectedCategory || 'all').toString().toLowerCase();
    if (selCat === 'all' || selCat === '') return true;
    return prodCat === selCat;
  });

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.product.id !== productId));
    } else {
      setCart(cart.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const processOrder = async () => {
    if (cart.length === 0) {
      await showError('Keranjang kosong!', 'Tidak bisa memproses order');
      return;
    }

    setLoading(true);
    try {
      if (!user) {
        await showError('User tidak ditemukan', 'Error');
        return;
      }

      const totalAmount = getTotalAmount();

      if (!customerName || customerName.trim() === '') {
        await showError('Nama pelanggan wajib diisi', 'Validasi');
        setLoading(false);
        return;
      }

      const orderData: any = {
        customer_name: customerName.trim(),
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        })),
        total: totalAmount,
        payment_method: paymentMethod,
        is_takeaway: !!takeaway,
      };

      if (paymentMethod === 'cash') {
        orderData.cash_received = paidAmount;
      }

      if (customerNote && customerNote.trim() !== '') {
        orderData.note = customerNote.trim();
      }

      const confirmMessage = `Konfirmasi pesanan:\n${cart.reduce((s, it) => s + `- ${it.quantity}x ${it.product.name} (${formatCurrency(it.product.price * it.quantity)})\n`, '')}Total: ${formatCurrency(totalAmount)}\nMetode: ${getPaymentMethodDisplay(paymentMethod)}`;
      const confirmed = await confirm(confirmMessage);
      if (!confirmed) {
        setLoading(false);
        return;
      }

      await apiService.createOrder(orderData);

      setLastReceipt({
        customerName: customerName.trim(),
        items: cart.map(c => ({ product: c.product, quantity: c.quantity })),
        total: totalAmount,
        paymentMethod: paymentMethod,
        paidAmount: paidAmount,
        takeaway: takeaway,
        note: customerNote.trim() || undefined,
        createdAt: new Date().toISOString()
      });

      setCart([]);
      setCustomerName('');
      setCustomerNote('');
      setPaidAmount(0);
      setPaymentMethod('cash');
      setTakeaway(false);

      await loadProducts();
      await loadOrders();

      setShowReceiptModal(true);
      await success('Order berhasil diproses!', 'Sukses');
    } catch (err: any) {
      const resp = err?.response;
      if (resp && resp.status === 422) {
        const data = resp.data || {};
        if (data.errors && typeof data.errors === 'object') {
          const messages: string[] = [];
          for (const key of Object.keys(data.errors)) {
            const val = data.errors[key];
            if (Array.isArray(val)) messages.push(...val);
            else if (typeof val === 'string') messages.push(val);
          }
          const message = messages.join('\n');
          await showError(message || 'Validasi gagal', 'Validasi');
        } else if (data.message) {
          await showError(String(data.message), 'Validasi');
        } else {
          await showError('Validasi gagal. Periksa input dan coba lagi.', 'Validasi');
        }
      } else {
        await showError('Gagal memproses order', 'Terjadi kesalahan sistem');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const getPaymentMethodDisplay = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'cash':
        return 'Cash';
      case 'bank':
      case 'debit':
        return 'Kartu Debit';
      case 'qris':
        return 'QRIS';
      default:
        return 'Cash';
    }
  };

  const printLastReceipt = () => {
    if (!lastReceipt) return;
    const receipt = lastReceipt;
    const itemsHtml = (receipt.items || []).map(i => `
      <tr>
        <td style="padding:6px 4px">${i.quantity}x ${(i.product && i.product.name) || 'Item'}</td>
        <td style="padding:6px 4px;text-align:right">${formatCurrency((i.product && i.product.price || 0) * i.quantity)}</td>
      </tr>`).join('');

    const method = receipt.paymentMethod || 'cash';
    const paid = receipt.paidAmount || 0;
    const takeaway = receipt.takeaway ? 'Takeaway' : 'Makan di tempat';

    const storeAddress = 'Jl. Cikutra No.67, Kecamatan Cibeunying Kaler';

    const html = `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Struk</title>
          <meta name="viewport" content="width=device-width,initial-scale=1">
          <style>
            @page { size: 80mm auto; margin: 0; }
            html,body { margin:0; padding:0; }
            body{
              width:80mm;
              max-width:80mm;
              margin:0;
              padding:6px 8px;
              font-family: "Courier New", Courier, monospace;
              font-size:12px;
              color:#111;
              -webkit-print-color-adjust: exact;
            }
            .center{ text-align:center; }
            .header{ font-weight:700; font-size:13px; margin-bottom:2px; }
            .address{ font-size:10px; color:#666; margin-bottom:6px; }
            .section{ margin:4px 0; }
            table{ width:100%; border-collapse:collapse; font-size:12px; }
            td{ padding:3px 0; vertical-align:top; }
            .right{ text-align:right; }
            .dashed{ border-top:1px dashed #999; margin:6px 0; }
            .bold{ font-weight:700; }
            .note{ margin-top:6px; font-size:11px; }
            .thankyou{ text-align:center; margin-top:8px; font-size:12px; font-weight:700; }
            .meta{ font-size:10px; color:#666; }
            @media print { body { padding:4mm; } }
          </style>
        </head>
        <body>
          <div class="center header">Warung Pak Aceng</div>
          <div class="center address">${storeAddress}</div>

          <div class="dashed"></div>

          <div class="section"><div class="meta">Kasir: <span class="bold">${user?.name || 'Kasir'}</span></div></div>
          <div class="section"><div class="meta">Customer: <span class="bold">${receipt.customerName || '-'}</span></div></div>

          <div class="dashed"></div>

          <div class="section">
            <table>
              ${itemsHtml}
            </table>
          </div>

          <div class="dashed"></div>

          <div style="display:flex;justify-content:space-between" class="section bold"><div>Total</div><div class="right">${formatCurrency(receipt.total)}</div></div>
          <div style="display:flex;justify-content:space-between" class="section"><div>Metode</div><div class="right">${getPaymentMethodDisplay(method)}</div></div>
          <div style="display:flex;justify-content:space-between" class="section"><div>Jenis</div><div class="right">${takeaway}</div></div>
          ${method === 'cash' ? `<div style="display:flex;justify-content:space-between" class="section"><div>Dibayar</div><div class="right">${formatCurrency(paid)}</div></div><div style="display:flex;justify-content:space-between" class="section"><div>Kembalian</div><div class="right">${formatCurrency(paid - (receipt.total||0))}</div></div>` : ''}

          ${receipt.note ? `<div class="note">Catatan: ${String(receipt.note)}</div>` : ''}

          <div class="thankyou">Terima kasih sudah memesan</div>

          <script>
            window.onload = function(){ setTimeout(()=>{ window.print(); }, 120); };
            window.onafterprint = function(){ try{ window.close(); } catch(e){} };
          </script>
        </body>
      </html>`;

    const w = window.open('', '_blank', 'width=400,height=600');
    if (!w) { alert('Pop-up diblokir, izinkan pop-up untuk mencetak.'); return; }
    w.document.write(html);
    w.document.close();
  };

  const handleLogout = async () => {
    const confirmed = await confirm('Apakah Anda yakin ingin logout?');
    if (confirmed) {
      await logout();
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <div className="sm:hidden bg-white rounded-xl shadow-sm p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <h1 className="text-lg font-bold text-gray-800">Warung Pak Aceng</h1>
                <p className="text-xs text-gray-600">Point of Sale System</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              {user && (
                <span>Login: <span className="font-medium text-gray-700">{user.name}</span></span>
              )}
              <span>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          <div className="hidden sm:flex sm:justify-between sm:items-start">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Kasir - Warung Pak Aceng</h1>
              <p className="text-gray-600 mt-2 text-base">Point of Sale System</p>
              {user && (
                <p className="text-sm text-gray-500 mt-1">
                  Login sebagai: <span className="font-medium text-gray-700">{user.name}</span>
                </p>
              )}
            </div>
            <div className="flex flex-row items-center space-x-3">
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {new Date().toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
            </div>
          </div>
        </div>

        <div className="mb-4 sm:mb-6">
          <div className="sm:hidden bg-white rounded-xl shadow-sm p-1 flex">
            <button
              onClick={() => setShowOrderHistory(false)}
              className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                !showOrderHistory
                  ? 'text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              style={{
                backgroundColor: !showOrderHistory ? '#da344d' : undefined,
                background: !showOrderHistory ? 'linear-gradient(135deg, #da344d 0%, #d91e36 100%)' : undefined
              }}
            >
              Kasir
            </button>
            <button
              onClick={() => setShowOrderHistory(true)}
              className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                showOrderHistory
                  ? 'text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              style={{
                backgroundColor: showOrderHistory ? '#da344d' : undefined,
                background: showOrderHistory ? 'linear-gradient(135deg, #da344d 0%, #d91e36 100%)' : undefined
              }}
            >
              Riwayat
            </button>
          </div>

          <div className="hidden sm:flex sm:space-x-4">
            <button
              onClick={() => setShowOrderHistory(false)}
              className={`px-8 py-2 rounded-lg font-medium transition-colors text-base ${
                !showOrderHistory
                  ? 'bg-gradient-to-r from-amaranth to-crimson text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
              style={{
                backgroundColor: !showOrderHistory ? '#da344d' : undefined,
                background: !showOrderHistory ? 'linear-gradient(135deg, #da344d 0%, #d91e36 100%)' : undefined
              }}
            >
              Kasir
            </button>
            <button
              onClick={() => setShowOrderHistory(true)}
              className={`px-6 py-2 rounded-lg font-medium transition-colors text-base ${
                showOrderHistory
                  ? 'bg-gradient-to-r from-amaranth to-crimson text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
              style={{
                backgroundColor: showOrderHistory ? '#da344d' : undefined,
                background: showOrderHistory ? 'linear-gradient(135deg, #da344d 0%, #d91e36 100%)' : undefined
              }}
            >
              Riwayat Order
            </button>
          </div>
        </div>

        {!showOrderHistory ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
            <div className="xl:col-span-2">
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Pilih Produk</h2>
                
                <div className="mb-3 sm:mb-4 space-y-3 sm:space-y-4">
                    <input
                      type="text"
                      placeholder="Cari produk..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 transition-colors text-sm sm:text-base"
                      onFocus={(e) => {
                        e.target.style.borderColor = '#ec5766';
                        e.target.style.boxShadow = '0 0 0 2px rgba(236, 87, 102, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgb(209 213 219)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                    {categories.map(category => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg capitalize transition-colors text-xs sm:text-sm ${
                          selectedCategory === category
                            ? 'text-white shadow-md'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                        style={{
                          backgroundColor: selectedCategory === category ? '#ec5766' : undefined,
                          background: selectedCategory === category ? 'linear-gradient(135deg, #ec5766 0%, #da344d 100%)' : undefined
                        }}
                      >
                        {category === 'all' ? 'Semua' : category}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-96 overflow-y-auto">
                  {filteredProducts.map(product => (
                    <div
                      key={product.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer space-y-2 sm:space-y-0"
                      onClick={() => addToCart(product)}
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800 mb-1 text-sm sm:text-base">{product.name}</h3>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                          <span className="font-semibold" style={{color: '#d91e36'}}>{formatCurrency(product.price)}</span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs capitalize">{product.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-end sm:justify-center">
                        <button 
                          className="text-white px-3 sm:px-4 py-2 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto"
                          style={{
                            background: 'linear-gradient(135deg, #ec5766 0%, #da344d 100%)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #da344d 0%, #c42348 100%)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #ec5766 0%, #da344d 100%)';
                          }}
                        >
                          <span className="hidden sm:inline cursor-pointer">+ Tambah</span>
                          <span className="sm:hidden">+ Tambah</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="xl:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Keranjang</h2>
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="Nama Pelanggan"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-sm sm:text-base"
                  />
                </div>
                
                <div className="mb-4 max-h-64 overflow-y-auto">
                  {cart.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Keranjang kosong</p>
                  ) : (
                    <div className="space-y-3">
                      {cart.map(item => (
                        <div key={item.product.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{item.product.name}</h4>
                            <p className="text-sm" style={{color: '#d91e36'}}>{formatCurrency(item.product.price)}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                              className="w-6 h-6 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm hover:bg-gray-400"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                              className="w-6 h-6 rounded-full text-white flex items-center justify-center text-sm transition-all duration-200"
                              style={{
                                backgroundColor: '#ec5766',
                                background: 'linear-gradient(135deg, #ec5766 0%, #da344d 100%)'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, #da344d 0%, #c42348 100%)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, #ec5766 0%, #da344d 100%)';
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mb-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Metode Pembayaran
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="cash">💵 Cash (Tunai)</option>
                      <option value="bank">💳 Kartu Debit</option>
                      <option value="qris">📱 QRIS</option>
                    </select>
                  </div>

                  {paymentMethod === 'cash' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jumlah Dibayar
                      </label>
                      <input
                        type="number"
                        value={paidAmount === 0 ? '' : paidAmount}
                        onChange={(e) => {
                          const v = e.target.value;
                          setPaidAmount(v === '' ? 0 : Number(v));
                        }}
                        placeholder="Masukkan jumlah uang yang dibayar"
                        min={0}
                        step={1}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                      {paidAmount > 0 && paidAmount < getTotalAmount() && (
                        <p className="mt-2 text-sm text-red-600">Jumlah dibayar harus lebih besar atau sama dengan total ({formatCurrency(getTotalAmount())})</p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catatan (Opsional)
                    </label>
                    <textarea
                      value={customerNote}
                      onChange={(e) => setCustomerNote(e.target.value)}
                      placeholder="Catatan khusus untuk pesanan..."
                      rows={2}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="takeaway"
                      checked={takeaway}
                      onChange={(e) => setTakeaway(e.target.checked)}
                      className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="takeaway" className="ml-2 text-sm text-gray-700">
                      Pesanan Dibawa Pulang
                    </label>
                  </div>
                </div>

                <div className="border-t pt-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Total Item:</span>
                    <span className="font-medium">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-xl font-bold" style={{color: '#d91e36'}}>{formatCurrency(getTotalAmount())}</span>
                  </div>
                  {paymentMethod === 'cash' && paidAmount > 0 && (
                    <>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-600">Dibayar:</span>
                        <span className="font-medium">{formatCurrency(paidAmount)}</span>
                      </div>
                      {paidAmount >= getTotalAmount() && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Kembalian:</span>
                          <span className="font-medium text-green-600">{formatCurrency(paidAmount - getTotalAmount())}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <button
                  onClick={processOrder}
                  disabled={loading || cart.length === 0 || (paymentMethod === 'cash' && paidAmount < getTotalAmount())}
                  className="w-full py-3 text-white font-semibold rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                  style={{
                    background: loading || cart.length === 0 || (paymentMethod === 'cash' && paidAmount < getTotalAmount()) 
                      ? '#9ca3af' 
                      : 'linear-gradient(135deg, #da344d 0%, #c42348 100%)'
                  }}
                  onMouseEnter={(e) => {
                    if (!(loading || cart.length === 0 || (paymentMethod === 'cash' && paidAmount < getTotalAmount()))) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #c42348 0%, #991b30 100%)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!(loading || cart.length === 0 || (paymentMethod === 'cash' && paidAmount < getTotalAmount()))) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #da344d 0%, #c42348 100%)';
                    }
                  }}
                >
                  {loading ? 'Memproses...' : 'Proses Pesanan'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
              <span className="hidden sm:inline">Riwayat Order</span>
              <span className="sm:hidden">Riwayat Order</span>
            </h2>
            
            {orders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Belum ada order</p>
            ) : (
              <>
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">No</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Total</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Pembayaran</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Waktu</th>
                        
                      </tr>
                    </thead>
                  <tbody>
                    {orders.map((order, idx) => (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-sm">No. #{idx + 1}</td>
                        <td className="py-3 px-4 font-semibold" style={{color: '#d91e36'}}>
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="py-3 px-4">{getPaymentMethodDisplay(order.metadata?.paymentMethod || 'cash')}</td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

                <div className="lg:hidden space-y-3">
                  {orders.map((order, idx) => (
                    <div key={order.id} className="bg-gray-50 rounded-lg p-4 space-y-3 overflow-hidden">
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0">
                          <p className="font-mono text-xs text-gray-600 break-words whitespace-normal">No. #{idx + 1}</p>
                          <p className="text-xs text-gray-500">{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center gap-3">
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500">Total:</p>
                            <p className="font-semibold text-sm truncate" style={{color: '#d91e36'}}>
                              {formatCurrency(order.totalAmount)}
                            </p>
                          </div>
                          <div className="min-w-0 text-right">
                            <p className="text-xs text-gray-500 mb-1">Pembayaran:</p>
                            <p className="text-xs truncate">{getPaymentMethodDisplay(order.metadata?.paymentMethod || 'cash')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {orders.length > 0 && (
              <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 rounded-lg" style={{backgroundColor: 'rgba(239, 118, 116, 0.1)'}}>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-700">Total Order</h3>
                  <p className="text-xl sm:text-2xl font-bold" style={{color: '#d91e36'}}>{orders.length}</p>
                </div>
                <div className="p-3 sm:p-4 rounded-lg" style={{backgroundColor: 'rgba(236, 87, 102, 0.1)'}}>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-700">Total Pendapatan</h3>
                  <p className="text-xl sm:text-2xl font-bold" style={{color: '#c42348'}}>
                    {formatCurrency(orders.reduce((sum, order) => sum + order.totalAmount, 0))}
                  </p>
                </div>
                <div className="p-3 sm:p-4 rounded-lg sm:col-span-2 lg:col-span-1" style={{backgroundColor: 'rgba(218, 52, 77, 0.1)'}}>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-700">Rata-rata per Order</h3>
                  <p className="text-xl sm:text-2xl font-bold" style={{color: '#da344d'}}>
                    {formatCurrency(orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showReceiptModal && lastReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-gray-200">
            <div className="p-5 border-b flex items-center justify-between bg-gradient-to-r from-pink-50 to-white rounded-t-2xl">
              <div className="flex items-center gap-2">
                <span className="inline-block text-2xl">🧾</span>
                <h3 className="text-lg font-bold text-crimson">Struk Pembayaran</h3>
              </div>
            </div>
            <div className="p-5">
              <div>
                <PrintReceipt receipt={lastReceipt} cashierName={user?.name} />
              </div>
            </div>
            <div className="p-5 border-t flex items-center justify-end gap-2 bg-gradient-to-r from-pink-50 to-white rounded-b-2xl">
              <button onClick={printLastReceipt} className="px-4 py-2 bg-gradient-to-r from-amaranth to-crimson text-black rounded-lg text-sm font-semibold shadow hover:shadow-md transition-all cursor-pointer">🖨️ Cetak</button>
              <button onClick={() => setShowReceiptModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold shadow hover:shadow-md transition-all cursor-pointer">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashierDashboard;