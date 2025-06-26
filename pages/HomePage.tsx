import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import StreetViewGenerator from '../components/StreetViewGenerator';

const HeroSection: React.FC = () => (
  <section className="text-center py-20 md:py-32">
    <div className="container mx-auto px-6">
      <h1 className="text-4xl md:text-6xl font-bold leading-tight text-[#22573b]">
        Dream Yard. Instant Design. <span className="text-[#6b4f4f]">AI-Powered.</span>
      </h1>
      <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-[#212529]/80">
        Upload a photo of your yard and our AI will generate beautiful landscaping designs in seconds. Boost your curb appeal and property value instantly.
      </p>
      <div className="mt-8">
        <Button variant="primary" className="py-4 px-10 text-lg">
          Get Started for Free
        </Button>
      </div>
    </div>
  </section>
);

const GallerySection: React.FC = () => {
    const galleryImages = [
        { id: 1, src: 'https://picsum.photos/seed/gallery1/500/500', alt: 'Modern minimalist garden' },
        { id: 2, src: 'https://picsum.photos/seed/gallery2/500/500', alt: 'Lush English garden' },
        { id: 3, src: 'https://picsum.photos/seed/gallery3/500/500', alt: 'Tropical paradise backyard' },
        { id: 4, src: 'https://picsum.photos/seed/gallery4/500/500', alt: 'Japanese zen garden' },
        { id: 5, src: 'https://picsum.photos/seed/gallery5/500/500', alt: 'Desert xeriscape design' },
        { id: 6, src: 'https://picsum.photos/seed/gallery6/500/500', alt: 'Cozy cottage garden' },
    ];

    return (
        <section className="py-16 bg-[#6b4f4f]/5">
            <div className="container mx-auto px-6">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#22573b]">
                    Explore a World of Possibilities
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {galleryImages.map(image => (
                        <div key={image.id} className="group relative overflow-hidden rounded-lg shadow-lg">
                            <img src={image.src} alt={image.alt} className="w-full h-full object-cover aspect-square transform group-hover:scale-110 transition-transform duration-500 ease-in-out" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0"></div>
                            <div className="absolute bottom-0 left-0 p-4">
                                <h3 className="text-white font-semibold text-lg">{image.alt}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};


const HomePage: React.FC = () => {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <BeforeAfterSlider />
        <GallerySection />
        <StreetViewGenerator />
      </main>
      <Footer />
    </>
  );
};

export default HomePage;