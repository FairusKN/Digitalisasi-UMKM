import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ScrollAnimatedSection from '../components/common/ScrollAnimatedSection';
import ScrollToTopButton from '../components/common/ScrollToTopButton';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const AboutPage = () => {
  const heroAnimation = useScrollAnimation({ threshold: 0.1 });
  const missionAnimation = useScrollAnimation({ threshold: 0.2 });
  const valuesAnimation = useScrollAnimation({ threshold: 0.2 });
  const teamAnimation = useScrollAnimation({ threshold: 0.2 });
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <section className="relative text-white" style={{
        background: 'linear-gradient(135deg, #ec5766 0%, #da344d 25%, #c42348 75%, #991b30 100%)'
      }}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <ScrollAnimatedSection 
            ref={heroAnimation.ref}
            isVisible={heroAnimation.isVisible}
            animation="fadeInUp"
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Tentang Warung Pak Aceng
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Warung keluarga dengan tradisi kuliner 3 generasi yang menghadirkan cita rasa autentik Indonesia
            </p>
          </ScrollAnimatedSection>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <ScrollAnimatedSection 
              ref={missionAnimation.ref}
              isVisible={missionAnimation.isVisible}
              animation="fadeInLeft"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Sejarah Kami
              </h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Warung Pak Aceng dimulai dari mimpi sederhana seorang pedagang kecil bernama Aceng di tahun 1985. 
                Dengan modal seadanya dan resep warisan nenek, beliau mulai berjualan makanan tradisional 
                di pinggir jalan dengan gerobak sederhana.
              </p>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Kini, 3 generasi kemudian, Warung Pak Aceng telah menjadi destinasi kuliner favorit yang tetap 
                mempertahankan cita rasa autentik dan kehangatan pelayanan keluarga. Setiap hidangan dibuat 
                dengan cinta dan dedikasi untuk menghadirkan pengalaman kuliner terbaik.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-xl" style={{
                  background: 'linear-gradient(135deg, rgba(236, 87, 102, 0.1) 0%, rgba(218, 52, 77, 0.1) 100%)'
                }}>
                  <div className="text-2xl font-bold mb-1" style={{ color: '#ec5766' }}>38+</div>
                  <div className="text-sm text-gray-600">Tahun Pengalaman</div>
                </div>
                <div className="text-center p-4 rounded-xl" style={{
                  background: 'linear-gradient(135deg, rgba(218, 52, 77, 0.1) 0%, rgba(196, 35, 72, 0.1) 100%)'
                }}>
                  <div className="text-2xl font-bold mb-1" style={{ color: '#da344d' }}>50+</div>
                  <div className="text-sm text-gray-600">Menu Signature</div>
                </div>
              </div>
            </ScrollAnimatedSection>
            <ScrollAnimatedSection 
              isVisible={missionAnimation.isVisible}
              animation="fadeInRight"
              delay={200}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop"
                alt="Tim UMKM Nusantara"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">✓</div>
                  <div className="text-sm text-gray-600">Terpercaya</div>
                </div>
              </div>
            </ScrollAnimatedSection>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimatedSection 
            ref={valuesAnimation.ref}
            isVisible={valuesAnimation.isVisible}
            animation="fadeInUp"
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Keunggulan Kami
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Keistimewaan yang membuat Warung Pak Aceng berbeda dan dicintai pelanggan
            </p>
          </ScrollAnimatedSection>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollAnimatedSection 
              isVisible={valuesAnimation.isVisible}
              animation="fadeInUp"
              delay={100}
              className="text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300"
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{
                background: 'linear-gradient(135deg, #ec5766 0%, #da344d 100%)'
              }}>
                <span className="text-2xl text-white">🤝</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Kekeluargaan</h3>
              <p className="text-gray-600">
                Setiap tamu adalah bagian dari keluarga besar Warung Pak Aceng. Kami melayani dengan hati dan kehangatan.
              </p>
            </ScrollAnimatedSection>
            
            <ScrollAnimatedSection 
              isVisible={valuesAnimation.isVisible}
              animation="fadeInUp"
              delay={200}
              className="text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300"
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{
                background: 'linear-gradient(135deg, #da344d 0%, #c42348 100%)'
              }}>
                <span className="text-2xl text-white">🎆</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Autentik</h3>
              <p className="text-gray-600">
                Mempertahankan resep asli dan cara memasak tradisional yang telah terbukti menghasilkan cita rasa terbaik.
              </p>
            </ScrollAnimatedSection>
            
            <ScrollAnimatedSection 
              isVisible={valuesAnimation.isVisible}
              animation="fadeInUp"
              delay={300}
              className="text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300"
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{
                background: 'linear-gradient(135deg, #c42348 0%, #991b30 100%)'
              }}>
                <span className="text-2xl text-white">🌱</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Tradisi</h3>
              <p className="text-gray-600">
                Melestarikan warisan kuliner Indonesia dengan bangga dan meneruskannya ke generasi berikutnya.
              </p>
            </ScrollAnimatedSection>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimatedSection 
            ref={teamAnimation.ref}
            isVisible={teamAnimation.isVisible}
            animation="fadeInUp"
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Keluarga Pak Aceng
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Keluarga yang berdedikasi melestarikan tradisi kuliner dan melayani dengan sepenuh hati
            </p>
          </ScrollAnimatedSection>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollAnimatedSection 
              isVisible={teamAnimation.isVisible}
              animation="fadeInUp"
              delay={100}
              className="text-center"
            >
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face"
                alt="CEO"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Pak Aceng</h3>
              <p className="text-gray-600 mb-3">Pendiri & Head Chef</p>
              <p className="text-sm text-gray-500">
                Memulai warung dengan gerobak sederhana tahun 1985. Pemegang resep rahasia keluarga.
              </p>
            </ScrollAnimatedSection>
            
            <ScrollAnimatedSection 
              isVisible={teamAnimation.isVisible}
              animation="fadeInUp"
              delay={200}
              className="text-center"
            >
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtwdIsS7Zpjw3YQ2x4oR9NS91iJHG0F71_Dg&shttps://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtwdIsS7Zpjw3YQ2x4oR9NS91iJHG0F71_Dg&s"
                alt="Bu Aceng"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Bu Nila</h3>
              <p className="text-gray-600 mb-3">Co-Founder & Manager</p>
              <p className="text-sm text-gray-500">
                Partner hidup Pak Aceng yang mengatur operasional warung dan memastikan kualitas pelayanan.
              </p>
            </ScrollAnimatedSection>
            
            <ScrollAnimatedSection 
              isVisible={teamAnimation.isVisible}
              animation="fadeInUp"
              delay={300}
              className="text-center"
            >
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face"
                alt="Anak Aceng"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Budi Haryono</h3>
              <p className="text-gray-600 mb-3">Generasi Kedua & Inovator</p>
              <p className="text-sm text-gray-500">
                Anak Pak Aceng yang membantu mengembangkan warung dengan sentuhan modern tanpa meninggalkan tradisi.
              </p>
            </ScrollAnimatedSection>
          </div>
        </div>
      </section>

      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default AboutPage;