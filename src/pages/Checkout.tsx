import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Phone, User, Truck, Store, Banknote } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useCart } from '@/contexts/CartContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { useShopSettings } from '@/hooks/useShopSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { user, profile } = useAuthContext();
  const { settings } = useShopSettings();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    deliveryOption: 'delivery',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill form with customer profile
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        name: profile.name || prev.name,
        phone: profile.phone || prev.phone,
        address: profile.address || prev.address,
      }));
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateOrderId = () => {
    return 'JP' + Date.now().toString().slice(-8);
  };

  const saveOrderToDatabase = async (orderId: string) => {
    const orderItems = items.map(item => ({
      name: item.name,
      nameTA: item.nameTA,
      weight: item.weight,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error } = await supabase.from('orders').insert({
      order_id: orderId,
      customer_id: user?.id || null,
      customer_name: formData.name,
      phone: formData.phone,
      address: formData.address,
      items: orderItems,
      total_amount: totalPrice,
      delivery_option: formData.deliveryOption,
      payment_method: 'cod',
      payment_status: 'cod',
      order_status: 'pending',
    });

    if (error) {
      console.error('Error saving order:', error);
      throw error;
    }

    return orderId;
  };

  const sendWhatsAppNotification = async (orderId: string) => {
    try {
      const orderData = {
        orderId,
        customerName: formData.name,
        customerPhone: formData.phone,
        customerAddress: formData.address,
        items: items.map(item => ({
          name: item.name,
          weight: item.weight,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: totalPrice,
        deliveryOption: formData.deliveryOption,
        paymentMethod: 'cod',
      };

      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          order: orderData,
          ownerPhone: settings.whatsapp_number,
        },
      });

      if (error) {
        console.error('WhatsApp notification error:', error);
      } else {
        console.log('WhatsApp notification sent:', data);
      }
    } catch (error) {
      console.error('Failed to send WhatsApp notification:', error);
    }
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
      
      // Save order to database
      await saveOrderToDatabase(orderId);
      
      // Send WhatsApp notification
      await sendWhatsAppNotification(orderId);
      
      // Store order details for success page
      sessionStorage.setItem('lastOrder', JSON.stringify({
        orderId,
        items,
        totalPrice,
        customer: formData,
      }));
      
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/order-success');
    } catch (error) {
      console.error('Order submission error:', error);
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

                {/* Payment Method - COD Only */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-card rounded-xl p-6 shadow-card"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-primary" />
                    Payment Method
                  </h3>
                  
                  <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-primary bg-primary/5">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Banknote className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-foreground">Cash on Delivery</span>
                      <p className="text-sm text-muted-foreground">
                        Pay when you receive your order
                      </p>
                    </div>
                  </div>
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
                    {isSubmitting ? 'Processing...' : 'Place Order (COD)'}
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
