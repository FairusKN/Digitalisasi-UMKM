import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ProductCard from '../components/ui/ProductCard';
import ScrollAnimatedSection from '../components/common/ScrollAnimatedSection';
import ScrollToTopButton from '../components/common/ScrollToTopButton';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import apiService from '../services/api';
import type { Product } from '../types';

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(true);
  
  const heroAnimation = useScrollAnimation({ threshold: 0.1 });
  const filtersAnimation = useScrollAnimation({ threshold: 0.2 });
  const productsAnimation = useScrollAnimation({ threshold: 0.05 }); // Lower threshold

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await apiService.getPublicProducts();      
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (error: any) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  };

  const categories = ['Semua', 'food', 'beverages', 'snack'];

  const filteredProducts = products
    .filter((product: Product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Semua' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a: Product, b: Product) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <section className="text-white py-16" style={{
        background: 'linear-gradient(135deg, #ec5766 0%, #da344d 50%, #c42348 100%)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimatedSection 
            ref={heroAnimation.ref}
            isVisible={heroAnimation.isVisible}
            animation="fadeInUp"
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              🍽️ Semua Produk
            </h1>
            <p className="text-xl">
              Nikmati beragam hidangan khas Warung Pak Aceng dengan resep turun temurun
            </p>
          </ScrollAnimatedSection>
        </div>
      </section>

      <section className="py-8 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimatedSection 
            ref={filtersAnimation.ref}
            isVisible={filtersAnimation.isVisible}
            animation="fadeInUp"
            className="flex flex-col lg:flex-row gap-4 items-center justify-between"
          >
            <div className="w-full lg:w-1/3">
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 transition-colors"
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
            
            <div className="flex flex-wrap gap-2">
              {categories.map((category: string) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                    selectedCategory === category
                      ? 'text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={{
                    backgroundColor: selectedCategory === category ? '#ec5766' : undefined,
                    background: selectedCategory === category ? 'linear-gradient(135deg, #ec5766 0%, #da344d 100%)' : undefined
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCategory !== category) {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCategory !== category) {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb';
                    }
                  }}
                >
                  {category === 'food' ? 'Food' : category === 'beverages' ? 'Beverages' : category === 'snack' ? 'Snack' : category}
                </button>
              ))}
            </div>
            
            <div className="relative w-full sm:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none w-full px-5 pr-10 py-3 rounded-xl bg-white border border-gray-300 text-gray-700 font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all hover:border-pink-400 focus:border-pink-500"
                style={{
                  boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#ec5766'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#d1d5db'; }}
                onFocus={e => { e.currentTarget.style.borderColor = '#ec5766'; }}
                onBlur={e => { e.currentTarget.style.borderColor = '#d1d5db'; }}
              >
                <option value="name">Urutkan: Nama A-Z</option>
                <option value="name-desc">Urutkan: Nama Z-A</option>
                <option value="price-low">Harga: Termurah</option>
                <option value="price-high">Harga: Termahal</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-pink-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </ScrollAnimatedSection>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 animate-pulse">
                  <div className="w-full h-48 bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product: Product) => (
                <div key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <ScrollAnimatedSection 
              ref={productsAnimation.ref}
              isVisible={productsAnimation.isVisible}
              animation="fadeInUp"
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                Produk tidak ditemukan
              </h3>
              <p className="text-gray-600 mb-4">
                Coba ubah kata kunci pencarian atau filter kategori
              </p>
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 text-white rounded-lg transition-all duration-200"
                style={{ background: 'linear-gradient(135deg, #ec5766 0%, #da344d 100%)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #da344d 0%, #c42348 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #ec5766 0%, #da344d 100%)';
                }}
                onClick={scrollToTop}
              >
                ← Kembali ke Beranda
              </Link>
            </ScrollAnimatedSection>
          )}
        </div>
      </section>

      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default ProductsPage;