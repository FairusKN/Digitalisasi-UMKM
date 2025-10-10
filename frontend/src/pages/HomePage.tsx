import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ProductCard from '../components/ui/ProductCard';
import Button from '../components/ui/Button';
import ScrollAnimatedSection from '../components/common/ScrollAnimatedSection';
import FloatingElement from '../components/common/FloatingElement';
import ScrollToTopButton from '../components/common/ScrollToTopButton';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import apiService from '../services/api';
import type { Product } from '../types';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  
  const heroAnimation = useScrollAnimation({ threshold: 0.1 });
  const coffeeAnimation = useScrollAnimation({ threshold: 0.2 });
  const coffeeLeftAnimation = useScrollAnimation({ threshold: 0.2 });
  const coffeeRightAnimation = useScrollAnimation({ threshold: 0.2 });
  const featuresAnimation = useScrollAnimation({ threshold: 0.2 });
  const productsAnimation = useScrollAnimation({ threshold: 0.2 });

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const productsData = await apiService.getPublicProducts();
      if (Array.isArray(productsData)) {
        setFeaturedProducts(productsData.slice(0, 4));
      } else {
        setFeaturedProducts([]);
      }
    } catch (error: any) {
      setFeaturedProducts([]);
    }
  };
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <section className="relative text-white" style={{
        background: 'linear-gradient(135deg, #ec5766 0%, #da344d 50%, #c42348 100%)'
      }}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <ScrollAnimatedSection 
            ref={heroAnimation.ref}
            isVisible={heroAnimation.isVisible}
            animation="fadeInUp"
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight" style={{fontFamily: 'Inter, sans-serif'}}>
              Selamat Datang di
              <span className="block text-yellow-300">Warung Pak Aceng</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed" style={{fontFamily: 'Inter, sans-serif'}}>
              Warung keluarga dengan tradisi kuliner turun temurun. Nikmati kelezatan makanan dan minuman khas Indonesia yang diolah dengan cinta dan kehangatan keluarga Pak Aceng.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products" onClick={scrollToTop}>
                <Button size="lg" className="w-full sm:w-auto">
                  🍽️ Jelajahi Produk
                </Button>
              </Link>
              <Link to="/about" onClick={scrollToTop}>
                <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/10 border-white text-white hover:bg-white transition-colors duration-300">
                  📖 Tentang Kami
                </Button>
              </Link>
            </div>
          </ScrollAnimatedSection>
        </div>
        
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <FloatingElement className="absolute top-20 left-10 text-6xl opacity-20" delay={0} duration={3}>
            🍜
          </FloatingElement>
          <FloatingElement className="absolute top-32 right-20 text-4xl opacity-30" delay={1} duration={4}>
            🍛
          </FloatingElement>
          <FloatingElement className="absolute bottom-40 left-20 text-5xl opacity-25" delay={2} duration={5}>
            🍹
          </FloatingElement>
          <FloatingElement className="absolute bottom-20 right-10 text-6xl opacity-20" delay={0.5} duration={3.5}>
            🍳
          </FloatingElement>
        </div>
      </section>

      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimatedSection 
            ref={coffeeAnimation.ref}
            isVisible={coffeeAnimation.isVisible}
            animation="fadeInUp"
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight" style={{color: '#da344d',fontFamily: 'Inter, sans-serif'}}>
              KETIKA BERBICARA TENTANG MAKANAN, KAMI<br/>
              TAHU APA YANG KAMI MASAK.
            </h2>
          </ScrollAnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <ScrollAnimatedSection 
              ref={coffeeLeftAnimation.ref}
              isVisible={coffeeLeftAnimation.isVisible}
              animation="fadeInLeft"
              delay={100}
              className="relative"
            >
              <div className="bg-gradient-to-br from-orange-200 to-red-200 rounded-2xl p-8 text-center">
                <div className="mb-6">
                  <div className="w-48 h-48 mx-auto bg-gradient-to-br from-orange-300 to-red-300 rounded-lg flex items-center justify-center text-6xl mb-6">
                    🍛
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2" style={{fontFamily: 'Inter, sans-serif'}}>Nasi Goreng Special</h3>
                <p className="text-gray-600 mb-6 leading-relaxed" style={{fontFamily: 'Inter, sans-serif'}}>
                  Nasi goreng spesial dengan bumbu rahasia dan tambahan ayam crispy, disajikan dengan telur mata sapi.
                </p>
              </div>
            </ScrollAnimatedSection>

            <ScrollAnimatedSection 
              ref={coffeeRightAnimation.ref}
              isVisible={coffeeRightAnimation.isVisible}
              animation="fadeInRight"
              delay={200}
              className="relative"
            >
              <div className="bg-gradient-to-br from-yellow-100 to-orange-200 rounded-2xl p-8 text-center">
                <div className="mb-6">
                  <div className="w-48 h-48 mx-auto bg-gradient-to-br from-yellow-200 to-orange-300 rounded-lg flex items-center justify-center text-6xl mb-6">
                    🍹
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2" style={{fontFamily: 'Inter, sans-serif'}}>Es Teh Manis</h3>
                <p className="text-gray-600 mb-6 leading-relaxed" style={{fontFamily: 'Inter, sans-serif'}}>
                  Minuman segar khas warung dengan rasa teh yang kuat dan manis yang pas. Perpaduan sempurna untuk menemani santap siang Anda.
                </p>
              </div>
            </ScrollAnimatedSection>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimatedSection 
            ref={featuresAnimation.ref}
            isVisible={featuresAnimation.isVisible}
            animation="fadeInUp"
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{color: '#da344d', fontFamily: 'Inter, sans-serif'}}>
              Mengapa Memilih Warung Pak Aceng?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto" style={{fontFamily: 'Inter, sans-serif'}}>
              Kami berkomitmen memberikan pengalaman kuliner terbaik dengan kualitas premium dan pelayanan yang ramah.
            </p>
          </ScrollAnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <ScrollAnimatedSection 
              isVisible={featuresAnimation.isVisible}
              animation="fadeInUp"
              delay={400}
              className="text-center p-6 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl" style={{
                background: 'linear-gradient(135deg, #ec5766 0%, #da344d 100%)'
              }}>
                👨‍🍳
              </div>
              <h3 className="text-xl font-semibold mb-3" style={{color: '#c42348', fontFamily: 'Inter, sans-serif'}}>Resep Turun Temurun</h3>
              <p className="text-gray-600" style={{fontFamily: 'Inter, sans-serif'}}>
                Resep rahasia keluarga yang telah diwariskan turun temurun dengan cita rasa autentik yang tak terlupakan.
              </p>
            </ScrollAnimatedSection>

            <ScrollAnimatedSection 
              isVisible={featuresAnimation.isVisible}
              animation="fadeInUp"
              delay={600}
              className="text-center p-6 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl" style={{
                background: 'linear-gradient(135deg, #ec5766 0%, #da344d 100%)'
              }}>
                🌿
              </div>
              <h3 className="text-xl font-semibold mb-3" style={{color: '#c42348', fontFamily: 'Inter, sans-serif'}}>Bahan Segar Berkualitas</h3>
              <p className="text-gray-600" style={{fontFamily: 'Inter, sans-serif'}}>
                Menggunakan bahan-bahan segar pilihan terbaik yang diolah dengan standar kebersihan dan kualitas tinggi.
              </p>
            </ScrollAnimatedSection>

            <ScrollAnimatedSection 
              isVisible={featuresAnimation.isVisible}
              animation="fadeInUp"
              delay={800}
              className="text-center p-6 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl" style={{
                background: 'linear-gradient(135deg, #ec5766 0%, #da344d 100%)'
              }}>
                ❤️
              </div>
              <h3 className="text-xl font-semibold mb-3" style={{color: '#c42348', fontFamily: 'Inter, sans-serif'}}>Pelayanan Keluarga</h3>
              <p className="text-gray-600" style={{fontFamily: 'Inter, sans-serif'}}>
                Melayani setiap pelanggan dengan kehangatan keluarga dan dedikasi untuk memberikan pengalaman terbaik.
              </p>
            </ScrollAnimatedSection>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimatedSection 
            ref={productsAnimation.ref}
            isVisible={productsAnimation.isVisible}
            animation="fadeInUp"
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{color: '#da344d', fontFamily: 'Inter, sans-serif'}}>
              Menu Unggulan Kami
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto" style={{fontFamily: 'Inter, sans-serif'}}>
              Temukan berbagai pilihan makanan dan minuman lezat yang telah menjadi favorit pelanggan setia kami.
            </p>
          </ScrollAnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {featuredProducts.map((product, index) => (
              <ScrollAnimatedSection 
                key={product.id}
                isVisible={productsAnimation.isVisible}
                animation="fadeInUp"
                delay={index * 150}
              >
                <ProductCard product={product} />
              </ScrollAnimatedSection>
            ))}
          </div>

          <ScrollAnimatedSection 
            isVisible={productsAnimation.isVisible}
            animation="fadeInUp"
            delay={800}
            className="text-center"
          >
            <Link to="/products" onClick={scrollToTop}>
              <Button size="lg" className="px-8">
                🍴 Lihat Semua Menu
              </Button>
            </Link>
          </ScrollAnimatedSection>
        </div>
      </section>

      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default HomePage;