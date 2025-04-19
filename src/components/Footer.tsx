import React, { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import { Phone, Mail, MapPin } from 'lucide-react';

interface FooterContent {
  address: string;
  phone: string;
  email: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  quickLinks: Array<{
    title: string;
    url: string;
  }>;
}

function Footer() {
  const [footerContent, setFooterContent] = useState<FooterContent>({
    address: '',
    phone: '',
    email: '',
    socialLinks: {},
    quickLinks: []
  });

  useEffect(() => {
    const footerRef = ref(db, 'footer');
    const unsubscribe = onValue(footerRef, (snapshot) => {
      if (snapshot.exists()) {
        setFooterContent(snapshot.val());
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <span>{footerContent.address}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <span>{footerContent.phone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <span>{footerContent.email}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {footerContent.quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.url}
                    className="hover:text-gray-300 transition-colors"
                  >
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              {footerContent.socialLinks.facebook && (
                <a 
                  href={footerContent.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-300 transition-colors"
                >
                  Facebook
                </a>
              )}
              {footerContent.socialLinks.instagram && (
                <a 
                  href={footerContent.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-300 transition-colors"
                >
                  Instagram
                </a>
              )}
              {footerContent.socialLinks.twitter && (
                <a 
                  href={footerContent.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-300 transition-colors"
                >
                  Twitter
                </a>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p>&copy; {new Date().getFullYear()} Spin Strike. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;