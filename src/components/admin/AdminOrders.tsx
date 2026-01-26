import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, AlertCircle, Phone, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

interface OrderItem {
  name: string;
  nameTA?: string;
  weight: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  order_id: string;
  customer_name: string;
  phone: string;
  address: string;
  items: OrderItem[];
  total_amount: number;
  order_status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  payment_status: string;
  delivery_option: string;
  created_at: string;
}

// Helper function to parse items from JSON
const parseOrderItems = (items: Json): OrderItem[] => {
  if (Array.isArray(items)) {
    return items.map(item => {
      const obj = item as Record<string, unknown>;
      return {
        name: String(obj.name || ''),
        nameTA: obj.nameTA ? String(obj.nameTA) : undefined,
        weight: String(obj.weight || ''),
        quantity: Number(obj.quantity || 0),
        price: Number(obj.price || 0),
      };
    });
  }
  return [];
};

export const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Parse items for each order
      const parsedOrders = (data || []).map(order => ({
        ...order,
        items: parseOrderItems(order.items),
      })) as Order[];
      
      setOrders(parsedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: 'pending' | 'confirmed' | 'delivered' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: status })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev =>
        prev.map(o => o.id === orderId ? { ...o, order_status: status } : o)
      );
      toast.success(`Order marked as ${status}`);
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.order_status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-500/10 text-green-500';
      case 'confirmed': return 'bg-blue-500/10 text-blue-500';
      case 'cancelled': return 'bg-red-500/10 text-red-500';
      default: return 'bg-orange-500/10 text-orange-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">
          Customer Orders ({orders.length})
        </h2>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-card rounded-xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-card rounded-xl p-4 shadow-card">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    order.order_status === 'delivered' 
                      ? 'bg-green-500/10 text-green-500' 
                      : 'bg-orange-500/10 text-orange-500'
                  }`}>
                    {order.order_status === 'delivered' ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <p className="font-bold text-foreground">#{order.order_id}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(order.order_status)}`}>
                        {order.order_status}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">{order.customer_name}</p>
                      <p className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {order.phone}
                      </p>
                      <p className="flex items-start gap-1">
                        <MapPin className="w-3 h-3 mt-0.5" />
                        {order.address}
                      </p>
                      <p className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(order.created_at).toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-sm font-medium text-foreground mb-2">Items:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {order.items.map((item, idx) => (
                          <li key={idx}>
                            • {item.name} ({item.weight}) × {item.quantity} = ₹{item.price * item.quantity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-3">
                  <div className="text-right">
                    <p className="font-bold text-xl text-foreground">₹{order.total_amount}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {order.delivery_option} • COD
                    </p>
                  </div>
                  
                  {order.order_status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateOrderStatus(order.id, 'confirmed')}
                      >
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        className="bg-gradient-fresh"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Delivered
                      </Button>
                    </div>
                  )}
                  
                  {order.order_status === 'confirmed' && (
                    <Button
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                      className="bg-gradient-fresh"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Mark Delivered
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
