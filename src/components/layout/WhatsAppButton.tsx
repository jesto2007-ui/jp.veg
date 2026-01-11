import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '919876543210';

export const WhatsAppButton = () => {
  const handleClick = () => {
    const message = encodeURIComponent('Hi! I would like to place an order.');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  return (
    <motion.button
      onClick={handleClick}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] text-white rounded-full shadow-float flex items-center justify-center hover:bg-[#20BD5A] transition-colors"
      aria-label="Order via WhatsApp"
    >
      <MessageCircle className="w-7 h-7" fill="currentColor" />
    </motion.button>
  );
};
