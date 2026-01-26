import { Link } from 'react-router-dom';
import { Leaf, Phone, MapPin, Clock, Mail } from 'lucide-react';
import { useShopSettings } from '@/hooks/useShopSettings';

export const Footer = () => {
  const { settings, loading } = useShopSettings();

  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Leaf className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold">{settings.shop_name.split(' ')[0]}</h3>
                <p className="text-sm text-primary-foreground/70">& Fruits</p>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/70">
              Fresh vegetables and fruits delivered to your doorstep. Quality and freshness guaranteed.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/shop" className="hover:text-primary transition-colors">Shop All</Link></li>
              <li><Link to="/categories" className="hover:text-primary transition-colors">Categories</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link to="/auth" className="hover:text-primary transition-colors">My Account</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold">Contact Us</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{settings.shop_phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{settings.shop_email}</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>{settings.shop_address}</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div className="space-y-4">
            <h4 className="font-semibold">Working Hours</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{settings.delivery_timing}</span>
              </li>
              <li className="pl-6">{settings.sunday_timing}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-8 pt-8 text-center text-sm text-primary-foreground/50">
          <p>© {new Date().getFullYear()} {settings.shop_name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
