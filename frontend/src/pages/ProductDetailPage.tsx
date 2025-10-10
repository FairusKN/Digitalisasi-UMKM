import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { getImageUrl, apiService } from '../services/api';
import type { Product } from '../types';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const p: any = await apiService.getProduct(id);
        const normalized: Product = {
          id: String(p.id ?? id),
          name: p.name ?? p.title ?? 'Produk',
          price: Number(p.price ?? p.price_in_cents ?? 0),
          category: p.category ?? 'food',
          image: p.image_path ?? p.image ?? ''
        };
        setProduct(normalized);
      } catch (err: any) {
        const serverMsg = err?.response?.data?.message || err?.message || 'Gagal memuat detail produk.';
        setError(serverMsg);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const navigate = useNavigate();

  const BackButton: React.FC = () => (
    <button
      onClick={() => navigate('/products')}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white shadow-sm cursor-pointer"
      style={{ background: 'linear-gradient(135deg, #ec5766 0%, #da344d 100%)' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, #da344d 0%, #c42348 100%)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, #ec5766 0%, #da344d 100%)'; }}
    >
      ← Kembali ke Produk
    </button>
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
                <ol className="list-reset flex items-center space-x-2">
                  <li>
                    <a href="/" className="hover:underline">Beranda</a>
                  </li>
                  <li>/</li>
                  <li>
                    <a href="/products" className="hover:underline">Produk</a>
                  </li>
                  <li>/</li>
                  <li className="text-red-600">{product?.name}</li>
                </ol>
              </nav>

              <div className="flex items-center justify-end">
                <BackButton />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            <div className="md:col-span-1 flex items-center justify-center">
              {loading ? (
                <div className="w-full h-64 bg-gray-100 animate-pulse rounded-lg" />
              ) : product ? (
                <img
                  src={getImageUrl(product.image)}
                  alt={product.name}
                  className="w-full max-w-md h-64 object-cover rounded-lg shadow-md"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div className="w-full max-w-md h-64 flex items-center justify-center bg-gray-100 rounded-lg text-gray-400">📦</div>
              )}
            </div>

            <div className="md:col-span-2 flex flex-col justify-center">
              {loading ? (
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
                  <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse" />
                </div>
              ) : error ? (
                <div className="p-6">
                  <p className="text-red-600 mb-4">{error}</p>
                </div>
              ) : product ? (
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{product.name}</h1>
                  <div className="mt-4 text-2xl font-extrabold" style={{ color: '#d91e36' }}>{formatPrice(product.price)}</div>
                  <div className="mt-3">
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">Kategori: {product.category}</span>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <p className="text-gray-600">Produk tidak ditemukan.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
