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
    // TODO: Replace these placeholder URLs with actual generated examples from /generate-examples
    const beforeAfterExamples = [
        {
            id: 1,
            beforeSrc: '/api/placeholder/600/400', // Replace with real before image URL
            afterSrc: '/api/placeholder/600/400', // Replace with real after image URL  
            title: 'Willowbrook Drive Transformation',
            description: 'Suburban home with enhanced curb appeal'
        },
        {
            id: 2,
            beforeSrc: '/api/placeholder/600/400', // Replace with real before image URL
            afterSrc: '/api/placeholder/600/400', // Replace with real after image URL
            title: 'Oakmont Circle Makeover', 
            description: 'Professional landscaping design'
        },
        {
            id: 3,
            beforeSrc: '/api/placeholder/600/400', // Replace with real before image URL
            afterSrc: '/api/placeholder/600/400', // Replace with real after image URL
            title: 'Stonegate Lane Enhancement',
            description: 'Modern residential landscape upgrade'
        }
    ];

    return (
        <section className="py-16 bg-[#6b4f4f]/5">
            <div className="container mx-auto px-6">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-[#22573b]">
                    Real Transformations by Our AI
                </h2>
                <p className="text-center text-[#212529]/80 mb-12 max-w-2xl mx-auto">
                    See how our AI transforms ordinary yards into stunning landscapes in seconds
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {beforeAfterExamples.map(example => (
                        <div key={example.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="grid grid-cols-2 gap-0">
                                <div className="relative">
                                    <img src={example.beforeSrc} alt={`${example.title} - Before`} className="w-full h-48 object-cover" />
                                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-semibold rounded">
                                        BEFORE
                                    </div>
                                </div>
                                <div className="relative">
                                    <img src={example.afterSrc} alt={`${example.title} - After`} className="w-full h-48 object-cover" />
                                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 text-xs font-semibold rounded">
                                        AFTER
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="font-bold text-lg text-[#22573b] mb-2">{example.title}</h3>
                                <p className="text-[#212529]/70 text-sm">{example.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-12">
                    <Button variant="secondary" className="py-3 px-8">
                        See More Examples
                    </Button>
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