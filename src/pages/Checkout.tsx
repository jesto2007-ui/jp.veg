import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Phone, User, Truck, Store, CreditCard, Banknote } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    deliveryOption: 'delivery',
    paymentMethod: 'cod',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateOrderId = () => {
    return 'JP' + Date.now().toString().slice(-8);
  };

  const sendWhatsAppMessage = (orderId: string) => {
    const SHOP_PHONE = '919876543210';
    
    // Build order items list
    const itemsList = items
      .map(item => `• ${item.name} (${item.weight}) x${item.quantity} = ₹${item.price * item.quantity}`)
      .join('\n');

    // Customer message
    const customerMessage = `
🛒 *Order Confirmation*
━━━━━━━━━━━━━━━

*Order ID:* ${orderId}
*Shop:* JP.Vegetables & Fruits

*Items:*
${itemsList}

*Total:* ₹${totalPrice}
*Delivery:* ${formData.deliveryOption === 'delivery' ? 'Home Delivery' : 'Pickup'}
*Payment:* ${formData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI'}

Thank you for your order! 🌿
    `.trim();

    // Shop owner message  
    const shopMessage = `
🔔 *New Order Alert!*
━━━━━━━━━━━━━━━

*Order ID:* ${orderId}

*Customer:* ${formData.name}
*Phone:* ${formData.phone}
*Address:* ${formData.address}

*Items:*
${itemsList}

*Total:* ₹${totalPrice}
*Delivery:* ${formData.deliveryOption === 'delivery' ? 'Home Delivery' : 'Pickup'}
*Payment:* ${formData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI'}
    `.trim();

    // Open WhatsApp for shop owner notification
    const encodedShopMessage = encodeURIComponent(shopMessage);
    window.open(`https://wa.me/${SHOP_PHONE}?text=${encodedShopMessage}`, '_blank');

    // Store order details for success page
    sessionStorage.setItem('lastOrder', JSON.stringify({
      orderId,
      items,
      totalPrice,
      customer: formData,
      customerMessage,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.address) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderId = generateOrderId();
      sendWhatsAppMessage(orderId);
      clearCart();
      navigate('/order-success');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <Layout>
      <div className="bg-gradient-hero min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Checkout
            </h1>
            <p className="text-muted-foreground">
              Complete your order
            </p>
          </motion.div>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Customer Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-xl p-6 shadow-card"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Customer Details
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your name"
                        className="h-12"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="10-digit mobile number"
                          className="h-12 pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="address">Delivery Address *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <Textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Enter your full address"
                        className="pl-10 min-h-[100px]"
                        required
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Delivery Option */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-card rounded-xl p-6 shadow-card"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-primary" />
                    Delivery Option
                  </h3>
                  
                  <RadioGroup
                    value={formData.deliveryOption}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, deliveryOption: value }))}
                    className="grid md:grid-cols-2 gap-4"
                  >
                    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${formData.deliveryOption === 'delivery' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                      <RadioGroupItem value="delivery" id="delivery" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Truck className="w-5 h-5 text-primary" />
                          <span className="font-medium">Home Delivery</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Free delivery within city
                        </p>
                      </div>
                    </label>
                    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${formData.deliveryOption === 'pickup' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                      <RadioGroupItem value="pickup" id="pickup" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Store className="w-5 h-5 text-primary" />
                          <span className="font-medium">Store Pickup</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Pick up from our shop
                        </p>
                      </div>
                    </label>
                  </RadioGroup>
                </motion.div>

                {/* Payment Method */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-card rounded-xl p-6 shadow-card"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Payment Method
                  </h3>
                  
                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
                    className="grid md:grid-cols-2 gap-4"
                  >
                    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${formData.paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                      <RadioGroupItem value="cod" id="cod" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Banknote className="w-5 h-5 text-primary" />
                          <span className="font-medium">Cash on Delivery</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Pay when you receive
                        </p>
                      </div>
                    </label>
                    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${formData.paymentMethod === 'upi' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                      <RadioGroupItem value="upi" id="upi" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-primary" />
                          <span className="font-medium">UPI Payment</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Pay via UPI apps
                        </p>
                      </div>
                    </label>
                  </RadioGroup>
                </motion.div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-xl p-6 shadow-card sticky top-24"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Order Summary
                  </h3>
                  
                  <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                    {items.map(item => (
                      <div key={`${item.id}-${item.weight}`} className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.weight} × {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-medium">
                          ₹{item.price * item.quantity}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>₹{totalPrice}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Delivery</span>
                      <span className="text-primary">Free</span>
                    </div>
                    <div className="border-t border-border pt-2 flex justify-between text-lg font-bold text-foreground">
                      <span>Total</span>
                      <span>₹{totalPrice}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-6 bg-gradient-fresh shadow-button h-12 text-base"
                  >
                    {isSubmitting ? 'Processing...' : 'Place Order'}
                  </Button>
                </motion.div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
