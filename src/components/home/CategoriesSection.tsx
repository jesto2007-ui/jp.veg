import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCategories } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';

export const CategoriesSection = () => {
  const { categories, loading } = useCategories();

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Shop by Category
          </h2>
          <p className="text-muted-foreground">
            Fresh produce organized for your convenience
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 text-center shadow-card">
                <Skeleton className="w-12 h-12 mx-auto mb-4 rounded-full" />
                <Skeleton className="h-5 w-20 mx-auto mb-1" />
                <Skeleton className="h-4 w-16 mx-auto" />
              </div>
            ))
          ) : (
            categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={`/shop?category=${category.id}`}
                  className="block group"
                >
                  <div className="bg-card rounded-2xl p-6 text-center shadow-card hover:shadow-card-hover transition-all duration-300 group-hover:-translate-y-1">
                    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                      {category.icon || '📦'}
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {category.name_ta}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
