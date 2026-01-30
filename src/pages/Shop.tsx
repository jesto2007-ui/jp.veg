import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ProductCard } from '@/components/products/ProductCard';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const { products, loading: productsLoading } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  
  const activeCategory = searchParams.get('category');
  const showOffers = searchParams.get('filter') === 'offers';

  const filteredProducts = useMemo(() => {
    let result = products;
    
    if (activeCategory) {
      result = result.filter(p => p.category_id === activeCategory);
    }
    
    if (showOffers) {
      result = result.filter(p => p.is_offer);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        p => p.name.toLowerCase().includes(query) || 
             (p.name_ta && p.name_ta.includes(query))
      );
    }
    
    return result;
  }, [activeCategory, showOffers, searchQuery, products]);

  const handleCategoryClick = (categoryId: string | null) => {
    if (categoryId) {
      setSearchParams({ category: categoryId });
    } else {
      setSearchParams({});
    }
  };

  const activeCategoryName = activeCategory 
    ? categories.find(c => c.id === activeCategory)?.name 
    : null;

  return (
    <Layout>
      <div className="bg-gradient-hero min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {activeCategoryName 
                ? activeCategoryName 
                : showOffers 
                  ? "Today's Offers"
                  : 'All Products'}
            </h1>
            <p className="text-muted-foreground">
              {filteredProducts.length} items available
            </p>
          </motion.div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search vegetables, fruits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-card border-border"
              />
            </div>
            <Button
              variant="outline"
              className="md:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </Button>
          </div>

          {/* Category Filters */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`flex flex-wrap gap-2 mb-8 ${showFilters ? 'block' : 'hidden md:flex'}`}
          >
            <Button
              variant={!activeCategory && !showOffers ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryClick(null)}
              className={!activeCategory && !showOffers ? 'bg-gradient-fresh' : ''}
            >
              All
            </Button>
            {categoriesLoading ? (
              <>
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </>
            ) : (
              categories.map(category => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleCategoryClick(category.id)}
                  className={activeCategory === category.id ? 'bg-gradient-fresh' : ''}
                >
                  {category.icon} {category.name}
                </Button>
              ))
            )}
            {(activeCategory || showOffers) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchParams({})}
                className="text-destructive"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </motion.div>

          {/* Products Grid */}
          {productsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-card rounded-2xl overflow-hidden shadow-card">
                  <Skeleton className="aspect-square" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No products found
              </h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filter
              </p>
              <Button onClick={() => { setSearchQuery(''); setSearchParams({}); }}>
                Clear All Filters
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Shop;
