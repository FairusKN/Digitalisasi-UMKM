import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { confirm } from '../../components/ui/Alert';
import { useAuth } from '../../contexts/AuthContext';
import { useScrollNavbar } from '../../hooks/useScrollNavbar';

const ManagerNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const scrolled = useScrollNavbar();

    const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  };

  const isActive = (path: string) => window.location.pathname === path;
  
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
                  to="/manager/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive('/manager/dashboard') 
                      ? 'text-white shadow-md' 
                      : 'text-gray-700 hover:text-white'
                  }`}
                  style={getLinkStyle('/manager/dashboard')}
                  onMouseEnter={(e) => handleLinkHover(e, '/manager/dashboard', true)}
                  onMouseLeave={(e) => handleLinkHover(e, '/manager/dashboard', false)}
                  onClick={scrollToTop}
                >
                  Dashboard
                </Link>
                <Link
                  to="/manager/products"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive('/manager/products') 
                      ? 'text-white shadow-md' 
                      : 'text-gray-700 hover:text-white'
                  }`}
                  style={getLinkStyle('/manager/products')}
                  onMouseEnter={(e) => handleLinkHover(e, '/manager/products', true)}
                  onMouseLeave={(e) => handleLinkHover(e, '/manager/products', false)}
                  onClick={scrollToTop}
                >
                  Kelola Produk
                </Link>
                <Link
                  to="/manager/users"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive('/manager/users') 
                      ? 'text-white shadow-md' 
                      : 'text-gray-700 hover:text-white'
                  }`}
                  style={getLinkStyle('/manager/users')}
                  onMouseEnter={(e) => handleLinkHover(e, '/manager/users', true)}
                  onMouseLeave={(e) => handleLinkHover(e, '/manager/users', false)}
                  onClick={scrollToTop}
                >
                  Kelola User
                </Link>
                <button
                  onClick={async () => {
                    const confirmed = await confirm('Apakah Anda yakin ingin logout?');
                    if (confirmed) {
                      await logout();
                      navigate('/login', { replace: true });
                    }
                  }}
                  className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                >
                  Logout
                </button>
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
                  to="/manager/dashboard"
                  className={`group flex items-center px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 transform ${
                    isActive('/manager/dashboard') 
                      ? 'text-white shadow-lg scale-105' 
                      : 'text-gray-700 hover:text-white hover:scale-105 hover:shadow-md'
                  }`}
                  style={{
                    background: isActive('/manager/dashboard') 
                      ? 'linear-gradient(135deg, #da344d 0%, #c42348 100%)' 
                      : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive('/manager/dashboard')) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #ec5766 0%, #da344d 100%)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive('/manager/dashboard')) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                  onClick={() => {
                    setIsOpen(false);
                    scrollToTop();
                  }}
                >
                  <span className="mr-3 text-xl">📊</span>
                  <span>Dashboard</span>
                  <div className={`ml-auto transition-transform duration-300 ${
                    isActive('/manager') ? 'rotate-0' : 'group-hover:rotate-12'
                  }`}>
                    →
                  </div>
                </Link>

                <Link
                  to="/manager/products"
                  className={`group flex items-center px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 transform ${
                    isActive('/manager/products') 
                      ? 'text-white shadow-lg scale-105' 
                      : 'text-gray-700 hover:text-white hover:scale-105 hover:shadow-md'
                  }`}
                  style={{
                    background: isActive('/manager/products') 
                      ? 'linear-gradient(135deg, #da344d 0%, #c42348 100%)' 
                      : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive('/manager/products')) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #ec5766 0%, #da344d 100%)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive('/manager/products')) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                  onClick={() => {
                    setIsOpen(false);
                    scrollToTop();
                  }}
                >
                  <span className="mr-3 text-xl">📦</span>
                  <span>Kelola Produk</span>
                  <div className={`ml-auto transition-transform duration-300 ${
                    isActive('/manager/products') ? 'rotate-0' : 'group-hover:rotate-12'
                  }`}>
                    →
                  </div>
                </Link>

                <Link
                  to="/manager/users"
                  className={`group flex items-center px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 transform ${
                    isActive('/manager/users') 
                      ? 'text-white shadow-lg scale-105' 
                      : 'text-gray-700 hover:text-white hover:scale-105 hover:shadow-md'
                  }`}
                  style={{
                    background: isActive('/manager/users') 
                      ? 'linear-gradient(135deg, #da344d 0%, #c42348 100%)' 
                      : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive('/manager/users')) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #ec5766 0%, #da344d 100%)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive('/manager/users')) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                  onClick={() => {
                    setIsOpen(false);
                    scrollToTop();
                  }}
                >
                  <span className="mr-3 text-xl">👥</span>
                  <span>Kelola User</span>
                  <div className={`ml-auto transition-transform duration-300 ${
                    isActive('/manager/users') ? 'rotate-0' : 'group-hover:rotate-12'
                  }`}>
                    →
                  </div>
                </Link>

              </div>

              <div className="pt-4 mt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center">
                    <span className="mr-1">👋</span>
                    Halo, {user?.name}
                  </span>
                  <button
                    className="flex items-center space-x-1 px-3 py-2 text-xs font-medium rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
                    onClick={async () => {
                      setIsOpen(false);
                      // Small delay to ensure menu closes before showing alert
                      await new Promise(resolve => setTimeout(resolve, 100));
                      const confirmed = await confirm('Apakah Anda yakin ingin logout?');
                      if (confirmed) {
                        await logout();
                        navigate('/login', { replace: true });
                      }
                    }}
                  >
                    <span>🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    )
}

export default ManagerNavbar;