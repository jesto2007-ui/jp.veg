import { motion } from 'framer-motion';
import { ArrowRight, Truck, Shield, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const HeroSection = () => {
  return (
    <section className="relative bg-gradient-hero overflow-hidden">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-fresh-light rounded-full text-primary text-sm font-medium">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Fresh Daily Delivery
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight">
              Fresh Vegetables
              <br />
              <span className="text-gradient-fresh">&amp; Fruits</span>
              <br />
              At Your Door
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0">
              Farm-fresh produce delivered straight from local farmers to your kitchen. Quality, freshness, and taste guaranteed.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/shop">
                <Button size="lg" className="bg-gradient-fresh shadow-button hover:opacity-90 w-full sm:w-auto">
                  Shop Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/categories">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Browse Categories
                </Button>
              </Link>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              {[
                { icon: Truck, label: 'Free Delivery' },
                { icon: Shield, label: '100% Fresh' },
                { icon: Clock, label: 'Same Day' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-fresh-light rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 bg-gradient-fresh rounded-full opacity-20 blur-3xl" />
              <img
                src="https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=600&h=600&fit=crop"
                alt="Fresh vegetables basket"
                className="relative z-10 w-full h-full object-cover rounded-3xl shadow-float"
              />
              
              {/* Floating badges */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute top-8 -left-4 bg-card rounded-xl p-3 shadow-card"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🥕</span>
                  <div>
                    <p className="text-xs text-muted-foreground">Fresh Today</p>
                    <p className="text-sm font-bold text-foreground">Carrots</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="absolute bottom-8 -right-4 bg-card rounded-xl p-3 shadow-card"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🍎</span>
                  <div>
                    <p className="text-xs text-muted-foreground">Best Seller</p>
                    <p className="text-sm font-bold text-foreground">Apples</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
