import React from 'react';
import { Link } from 'react-router-dom';
import { Tractor, Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-b from-[#2f7c4f] to-[#236240] text-white mt-16 border-t-4 border-[#b87a47]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-lg">
                <Tractor className="h-6 w-6 text-[#2f7c4f]" />
              </div>
              <div>
                <div className="text-xl font-bold">KrishakMart</div>
                <div className="text-xs text-[#f5ede3] italic">Mitti Se Digital Tak</div>
              </div>
            </div>
            <p className="text-green-100 text-sm leading-relaxed">
              Making farming supplies easily available online. Connecting farmers directly with local suppliers.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-green-100 hover:text-white transition-colors text-sm">Home</Link></li>
              <li><Link to="/shop" className="text-green-100 hover:text-white transition-colors text-sm">Shop Products</Link></li>
              <li><Link to="/become-seller" className="text-green-100 hover:text-white transition-colors text-sm">Become a Seller</Link></li>
              <li><Link to="/about" className="text-green-100 hover:text-white transition-colors text-sm">About Us</Link></li>
              <li><Link to="/contact" className="text-green-100 hover:text-white transition-colors text-sm">Contact Us</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li className="text-green-100 text-sm">🌱 Seeds</li>
              <li className="text-green-100 text-sm">🌿 Fertilizers</li>
              <li className="text-green-100 text-sm">🧴 Pesticides</li>
              <li className="text-green-100 text-sm">🔧 Farming Tools</li>
              <li className="text-green-100 text-sm">💧 Irrigation</li>
              <li className="text-green-100 text-sm">🐄 Animal Feed</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-[#f5ede3] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm">+91-1800-123-4567</div>
                  <div className="text-xs text-green-200">Mon-Sat, 9AM-6PM</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-[#f5ede3] flex-shrink-0 mt-0.5" />
                <div className="text-sm">support@krishakmart.com</div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#f5ede3] flex-shrink-0 mt-0.5" />
                <div className="text-sm">New Delhi, India</div>
              </li>
            </ul>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 pt-8 border-t border-[#56b886]">
          <div className="flex flex-wrap justify-center gap-6 mb-6">
            <div className="bg-[#236240] px-4 py-2 rounded-lg text-center border border-[#b87a47]">
              <div className="text-sm font-semibold">✓ Genuine Products</div>
            </div>
            <div className="bg-[#236240] px-4 py-2 rounded-lg text-center border border-[#b87a47]">
              <div className="text-sm font-semibold">✓ Fast Delivery</div>
            </div>
            <div className="bg-[#236240] px-4 py-2 rounded-lg text-center border border-[#b87a47]">
              <div className="text-sm font-semibold">✓ Farmer Friendly</div>
            </div>
            <div className="bg-[#236240] px-4 py-2 rounded-lg text-center border border-[#b87a47]">
              <div className="text-sm font-semibold">✓ 24/7 Support</div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-green-200 text-sm">
          © 2026 KrishakMart. All rights reserved. | Made with ❤️ for Farmers
        </div>
      </div>
    </footer>
  );
};
