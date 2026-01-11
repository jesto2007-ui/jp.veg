import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, ShoppingCart, Leaf } from 'lucide-react';
import { Product, weightOptions } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const [selectedWeight, setSelectedWeight] = useState(weightOptions[2]);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const currentPrice = product.isOffer && product.offerPrice 
    ? product.offerPrice 
    : product.price;
  
  const displayPrice = (currentPrice * selectedWeight.multiplier).toFixed(0);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      nameTA: product.nameTA,
      price: Number(displayPrice),
      image: product.image,
      weight: selectedWeight.value,
    }, quantity);
    
    toast.success(`${product.name} added to cart!`, {
      description: `${quantity} × ${selectedWeight.label}`,
    });
    setQuantity(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isFresh && (
            <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full flex items-center gap-1">
              <Leaf className="w-3 h-3" />
              Fresh
            </span>
          )}
          {product.isOffer && (
            <span className="px-2 py-1 bg-gradient-offer text-accent-foreground text-xs font-semibold rounded-full">
              {Math.round(((product.price - (product.offerPrice || 0)) / product.price) * 100)}% OFF
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-foreground">{product.name}</h3>
          <p className="text-sm text-muted-foreground">{product.nameTA}</p>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-primary">₹{displayPrice}</span>
          {product.isOffer && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{(product.price * selectedWeight.multiplier).toFixed(0)}
            </span>
          )}
          <span className="text-xs text-muted-foreground">/ {selectedWeight.label}</span>
        </div>

        {/* Weight Selector */}
        <div className="flex gap-2">
          {weightOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setSelectedWeight(option)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                selectedWeight.value === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Quantity & Add to Cart */}
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-border rounded-lg">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="p-2 hover:bg-muted transition-colors rounded-l-lg"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity(q => q + 1)}
              className="p-2 hover:bg-muted transition-colors rounded-r-lg"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <Button
            onClick={handleAddToCart}
            className="flex-1 bg-gradient-fresh hover:opacity-90 shadow-button"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
