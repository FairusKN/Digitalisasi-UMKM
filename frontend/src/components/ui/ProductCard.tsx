import { Link } from 'react-router-dom';
import { getImageUrl } from '../../services/api';
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const imageUrl = getImageUrl(product.image);

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group hover-lift border border-gray-200 min-h-48">
      <div className="relative overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-48 flex items-center justify-center bg-gray-100 text-gray-400 text-6xl">
            <span>📦</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-1" style={{fontFamily: 'Inter, sans-serif'}}>
          {product.name}
        </h3>
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold" style={{color: '#d91e36', fontFamily: 'Inter, sans-serif'}}>
            {formatPrice(product.price)}
          </span>
        </div>
        <Link
          to={`/products/${product.id}`}
          className="w-full text-white py-2 px-4 rounded-lg transition-all duration-300 font-medium text-center block shadow-md hover:shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #ec5766 0%, #da344d 100%)',
            fontFamily: 'din-1451-lt-pro, sans-serif'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #da344d 0%, #c42348 100%)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #ec5766 0%, #da344d 100%)';
          }}
          onClick={() => {
            window.scrollTo({
              top: 0,
              left: 0,
              behavior: 'smooth'
            });
          }}
        >
          Lihat Detail
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;