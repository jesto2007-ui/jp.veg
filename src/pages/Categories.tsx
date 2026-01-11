import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { categories, products } from '@/data/products';
import { Button } from '@/components/ui/button';

const Categories = () => {
  return (
    <Layout>
      <div className="bg-gradient-hero min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 text-center"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Shop by Category
            </h1>
            <p className="text-muted-foreground">
              Browse our fresh produce collections
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {categories.map((category, index) => {
              const categoryProducts = products.filter(p => p.category === category.id);
              const featuredImages = categoryProducts.slice(0, 3).map(p => p.image);
              
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/shop?category=${category.id}`}>
                    <div className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300">
                      {/* Image Grid */}
                      <div className="relative h-48 overflow-hidden">
                        <div className="absolute inset-0 grid grid-cols-3 gap-1">
                          {featuredImages.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ))}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
                        
                        {/* Category Icon */}
                        <div className="absolute top-4 left-4 text-5xl">
                          {category.icon}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-xl font-bold text-foreground">
                              {category.name}
                            </h2>
                            <p className="text-muted-foreground">
                              {category.nameTA} • {categoryProducts.length} items
                            </p>
                          </div>
                          <Button className="bg-gradient-fresh group-hover:shadow-button">
                            Shop
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Categories;
