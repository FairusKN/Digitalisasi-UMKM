import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{
      background: 'linear-gradient(135deg, rgba(236, 87, 102, 0.1) 0%, rgba(218, 52, 77, 0.1) 100%)'
    }}>
      <div className="max-w-lg w-full text-center">
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-4 animate-pulse" style={{
            background: 'linear-gradient(135deg, #ec5766 0%, #da344d 100%)'
          }}>
            <span className="text-4xl text-white font-bold">!</span>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Halaman Tidak Ditemukan
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Maaf, halaman yang Anda cari tidak dapat ditemukan. 
            Mungkin halaman tersebut telah dipindahkan atau tidak pernah ada.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 text-white font-medium rounded-lg transition-all duration-200 w-full sm:w-auto shadow-md hover:shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #ec5766 0%, #da344d 100%)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #da344d 0%, #c42348 100%)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #ec5766 0%, #da344d 100%)';
            }}
          >
            <span className="mr-2">🏠</span>
            Kembali ke Beranda
          </Link>
          
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link
              to="/products"
              className="px-4 py-2 rounded-lg transition-all duration-200 border"
              style={{
                color: '#da344d',
                borderColor: '#da344d'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(218, 52, 77, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Lihat Produk
            </Link>
            <Link
              to="/about"
              className="px-4 py-2 rounded-lg transition-all duration-200 border"
              style={{
                color: '#da344d',
                borderColor: '#da344d'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(218, 52, 77, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Tentang Kami
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Jika Anda yakin halaman ini seharusnya ada, silakan hubungi administrator atau kembali nanti.
          </p>
        </div>

        <div className="mt-8">
          <p className="text-lg font-semibold" style={{color: '#da344d'}}>
            Warung Pak Aceng
          </p>
          <p className="text-sm text-gray-500">
            Sistem Digitalisasi UMKM
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;