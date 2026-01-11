import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Home, MessageCircle, Package } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

interface OrderDetails {
  orderId: string;
  items: Array<{
    id: string;
    name: string;
    weight: string;
    quantity: number;
    price: number;
  }>;
  totalPrice: number;
  customer: {
    name: string;
    phone: string;
    address: string;
    deliveryOption: string;
    paymentMethod: string;
  };
  customerMessage: string;
}

const OrderSuccess = () => {
  const [order, setOrder] = useState<OrderDetails | null>(null);

  useEffect(() => {
    const savedOrder = sessionStorage.getItem('lastOrder');
    if (savedOrder) {
      setOrder(JSON.parse(savedOrder));
    }
  }, []);

  const handleWhatsAppShare = () => {
    if (!order) return;
    
    const SHOP_PHONE = '919876543210';
    const message = encodeURIComponent(order.customerMessage);
    window.open(`https://wa.me/${SHOP_PHONE}?text=${message}`, '_blank');
  };

  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full text-center"
        >
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-24 h-24 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.4 }}
            >
              <CheckCircle className="w-14 h-14 text-primary" />
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-foreground mb-2"
          >
            Order Placed Successfully!
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground mb-6"
          >
            Thank you for your order. We'll deliver your fresh produce soon!
          </motion.p>

          {order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-card rounded-xl p-6 shadow-card mb-6 text-left"
            >
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                <Package className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-bold text-foreground">{order.orderId}</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.name} ({item.weight}) × {item.quantity}
                    </span>
                    <span className="font-medium">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">₹{order.totalPrice}</span>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              onClick={handleWhatsAppShare}
              className="bg-[#25D366] hover:bg-[#20BD5A] text-white"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Send Order via WhatsApp
            </Button>
            
            <Link to="/">
              <Button variant="outline" className="w-full sm:w-auto">
                <Home className="w-5 h-5 mr-2" />
                Back to Home
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default OrderSuccess;
