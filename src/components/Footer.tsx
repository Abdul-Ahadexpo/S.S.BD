import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, Heart } from 'lucide-react';

interface FooterData {
  companyName: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    youtube: string;
  };
}

function Footer() {
  const [footerData, setFooterData] = useState<FooterData>({
    companyName: 'Spin Strike',
    description: 'Your trusted destination for quality products and exceptional service.',
    email: 'spinstrikebd@gmail.com',
    phone: '+8801521722011',
    address: 'Dhaka, Bangladesh',
    socialLinks: {
      facebook: '',
      instagram: '',
      youtube: ''
    }
  });

  useEffect(() => {
    const footerRef = ref(db, 'footerData');
    const unsubscribe = onValue(footerRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setFooterData(prev => ({ ...prev, ...data }));
      }
    });

    return () => unsubscribe();
  }, []);

  const socialIcons = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: footerData.socialLinks.facebook,
      color: 'hover:text-blue-500'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      url: footerData.socialLinks.instagram,
      color: 'hover:text-pink-500'
    },
    {
      name: 'YouTube',
      icon: Youtube,
      url: footerData.socialLinks.youtube,
      color: 'hover:text-red-500'
    }
  ];

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-blue-400">{footerData.companyName}</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {footerData.description}
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialIcons.map((social) => {
                const IconComponent = social.icon;
                return social.url ? (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 bg-gray-800 rounded-full transition-all duration-300 hover:bg-gray-700 ${social.color} transform hover:scale-110`}
                    aria-label={social.name}
                  >
                    <IconComponent className="h-5 w-5" />
                  </a>
                ) : null;
              })}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-blue-400">Contact Us</h4>
            <div className="space-y-3">
              {footerData.email && (
                <div className="flex items-center space-x-3 text-gray-300">
                  <Mail className="h-4 w-4 text-blue-400 flex-shrink-0" />
                  <a 
                    href={`mailto:${footerData.email}`}
                    className="text-sm hover:text-blue-400 transition-colors break-all"
                  >
                    {footerData.email}
                  </a>
                </div>
              )}
              
              {footerData.phone && (
                <div className="flex items-center space-x-3 text-gray-300">
                  <Phone className="h-4 w-4 text-blue-400 flex-shrink-0" />
                  <a 
                    href={`tel:${footerData.phone}`}
                    className="text-sm hover:text-blue-400 transition-colors"
                  >
                    {footerData.phone}
                  </a>
                </div>
              )}
              
              {footerData.address && (
                <div className="flex items-start space-x-3 text-gray-300">
                  <MapPin className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm leading-relaxed">{footerData.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-blue-400">Quick Links</h4>
            <div className="grid grid-cols-2 gap-2">
              <a href="/" className="text-sm text-gray-300 hover:text-blue-400 transition-colors">
                Home
              </a>
              <a href="/reviews" className="text-sm text-gray-300 hover:text-blue-400 transition-colors">
                Reviews
              </a>
              <a href="/profile" className="text-sm text-gray-300 hover:text-blue-400 transition-colors">
                Profile
              </a>
              <a href="/cart" className="text-sm text-gray-300 hover:text-blue-400 transition-colors">
                Cart
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-400 text-center sm:text-left">
              © {new Date().getFullYear()} {footerData.companyName}. All rights reserved.
            </div>
            <div className="flex items-center space-x-1 text-sm text-gray-400">
              <span>Made by</span>
              
              <span>@Codnzy</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;