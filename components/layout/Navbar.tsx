
import React from 'react';

import Button from '../ui/Button';

const Navbar: React.FC = () => {
  const navLinks = ["Features", "Pricing", "FAQ"];

  return (
    <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="AI Landscaping" className="w-9 h-9" />
          <span className="font-bold text-xl text-[#22573b]">AI Landscaping</span>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a
              key={link}
              href="#"
              className="text-[#212529] hover:text-[#22573b] transition-colors font-medium"
            >
              {link}
            </a>
          ))}
        </div>
        <div className="flex items-center space-x-4">
          <a href="#" className="hidden sm:block text-[#212529] hover:text-[#22573b] transition-colors font-medium">
            Login
          </a>
          <Button variant="primary">Get Started for Free</Button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
