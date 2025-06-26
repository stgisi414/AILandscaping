
import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import StaticExampleGenerator from '../components/StaticExampleGenerator';

const ExampleGeneratorPage: React.FC = () => {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gray-50 py-12">
                <div className="container mx-auto px-6">
                    <StaticExampleGenerator />
                </div>
            </main>
            <Footer />
        </>
    );
};

export default ExampleGeneratorPage;
