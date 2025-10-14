import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useScrollNavbar } from '../../hooks/useScrollNavbar';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const scrolled = useScrollNavbar();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  };

  const getLinkStyle = (path: string) => ({
    background: isActive(path) 
      ? 'linear-gradient(135deg, #da344d 0%, #c42348 100%)' 
      : 'transparent'
  });

  const handleLinkHover = (e: React.MouseEvent<HTMLAnchorElement>, path: string, isEnter: boolean) => {
    if (!isActive(path)) {
      e.currentTarget.style.background = isEnter 
        ? 'linear-gradient(135deg, #ec5766 0%, #da344d 100%)'
        : 'transparent';
    }
  };

  return (
    <nav className={`bg-white shadow-lg sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-sm shadow-xl' : 'bg-white shadow-lg'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center" onClick={scrollToTop}>
              <div 
                className="text-white px-3 py-2 rounded-lg font-bold text-lg transition-all duration-200 hover:shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #ec5766 0%, #da344d 100%)'
                }}
              >
                🧑‍🍳 Warung Pak Aceng
              </div>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive('/') 
                    ? 'text-white shadow-md' 
                    : 'text-gray-700 hover:text-white'
                }`}
                style={getLinkStyle('/')}
                onMouseEnter={(e) => handleLinkHover(e, '/', true)}
                onMouseLeave={(e) => handleLinkHover(e, '/', false)}
                onClick={scrollToTop}
              >
                Beranda
              </Link>
              <Link
                to="/products"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive('/products') 
                    ? 'text-white shadow-md' 
                    : 'text-gray-700 hover:text-white'
                }`}
                style={getLinkStyle('/products')}
                onMouseEnter={(e) => handleLinkHover(e, '/products', true)}
                onMouseLeave={(e) => handleLinkHover(e, '/products', false)}
                onClick={scrollToTop}
              >
                Produk
              </Link>
              <Link
                to="/about"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive('/about') 
                    ? 'text-white shadow-md' 
                    : 'text-gray-700 hover:text-white'
                }`}
                style={getLinkStyle('/about')}
                onMouseEnter={(e) => handleLinkHover(e, '/about', true)}
                onMouseLeave={(e) => handleLinkHover(e, '/about', false)}
                onClick={scrollToTop}
              >
                Tentang
              </Link>
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="relative p-2 text-gray-700 hover:text-white rounded-lg transition-all duration-300 focus:outline-none"
              style={{
                background: isOpen ? 'linear-gradient(135deg, #ec5766 0%, #da344d 100%)' : 'transparent'
              }}
              onMouseEnter={(e) => {
                if (!isOpen) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #ec5766 0%, #da344d 100%)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isOpen) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
              aria-label="Toggle mobile menu"
            >
              <div className="relative w-6 h-6">
                <span
                  className={`absolute left-0 w-6 h-0.5 bg-current transition-all duration-300 ease-in-out ${
                    isOpen 
                      ? 'rotate-45 top-1/2 -translate-y-1/2' 
                      : 'rotate-0 top-1'
                  }`}
                />
                <span
                  className={`absolute left-0 top-1/2 w-6 h-0.5 bg-current transition-all duration-300 ease-in-out -translate-y-1/2 ${
                    isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
                  }`}
                />
                <span
                  className={`absolute left-0 w-6 h-0.5 bg-current transition-all duration-300 ease-in-out ${
                    isOpen 
                      ? '-rotate-45 top-1/2 -translate-y-1/2' 
                      : 'rotate-0 top-4'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      <div 
        className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="relative bg-gradient-to-b from-white via-gray-50 to-gray-100 shadow-2xl border-t border-gray-200">
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm pointer-events-none" />
          <div className="relative px-4 pt-4 pb-6 space-y-3">
            <div className="space-y-2">
              <Link
                to="/"
                className={`group flex items-center px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 transform ${
                  isActive('/') 
                    ? 'text-white shadow-lg scale-105' 
                    : 'text-gray-700 hover:text-white hover:scale-105 hover:shadow-md'
                }`}
                style={{
                  background: isActive('/') 
                    ? 'linear-gradient(135deg, #da344d 0%, #c42348 100%)' 
                    : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (!isActive('/')) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #ec5766 0%, #da344d 100%)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/')) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
                onClick={() => {
                  setIsOpen(false);
                  scrollToTop();
                }}
              >
                <span className="mr-3 text-xl">🏠</span>
                <span>Beranda</span>
                <div className={`ml-auto transition-transform duration-300 ${
                  isActive('/') ? 'rotate-0' : 'group-hover:rotate-12'
                }`}>
                  →
                </div>
              </Link>

              <Link
                to="/products"
                className={`group flex items-center px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 transform ${
                  isActive('/products') 
                    ? 'text-white shadow-lg scale-105' 
                    : 'text-gray-700 hover:text-white hover:scale-105 hover:shadow-md'
                }`}
                style={{
                  background: isActive('/products') 
                    ? 'linear-gradient(135deg, #da344d 0%, #c42348 100%)' 
                    : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (!isActive('/products')) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #ec5766 0%, #da344d 100%)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/products')) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
                onClick={() => {
                  setIsOpen(false);
                  scrollToTop();
                }}
              >
                <span className="mr-3 text-xl">🍽️</span>
                <span>Produk</span>
                <div className={`ml-auto transition-transform duration-300 ${
                  isActive('/products') ? 'rotate-0' : 'group-hover:rotate-12'
                }`}>
                  →
                </div>
              </Link>

              <Link
                to="/about"
                className={`group flex items-center px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 transform ${
                  isActive('/about') 
                    ? 'text-white shadow-lg scale-105' 
                    : 'text-gray-700 hover:text-white hover:scale-105 hover:shadow-md'
                }`}
                style={{
                  background: isActive('/about') 
                    ? 'linear-gradient(135deg, #da344d 0%, #c42348 100%)' 
                    : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (!isActive('/about')) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #ec5766 0%, #da344d 100%)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/about')) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
                onClick={() => {
                  setIsOpen(false);
                  scrollToTop();
                }}
              >
                <span className="mr-3 text-xl">📖</span>
                <span>Tentang</span>
                <div className={`ml-auto transition-transform duration-300 ${
                  isActive('/about') ? 'rotate-0' : 'group-hover:rotate-12'
                }`}>
                  →
                </div>
              </Link>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <span className="mr-1">📞</span>
                  Hubungi Kami
                </span>
                <span className="flex items-center">
                  <span className="mr-1">📍</span>
                  Lokasi
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;