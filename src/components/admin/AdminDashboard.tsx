import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, TrendingUp, ShoppingCart, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  todayOrders: number;
  totalRevenue: number;
}

export const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    todayOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Fetch orders
      const { data: orders } = await supabase
        .from('orders')
        .select('*');

      if (orders) {
        const today = new Date().toISOString().split('T')[0];
        const todayOrders = orders.filter(o => 
          o.created_at.startsWith(today)
        );
        const pendingOrders = orders.filter(o => o.order_status === 'pending');
        const deliveredOrders = orders.filter(o => o.order_status === 'delivered');
        const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);

        setStats({
          totalProducts: productsCount || 0,
          totalOrders: orders.length,
          pendingOrders: pendingOrders.length,
          deliveredOrders: deliveredOrders.length,
          todayOrders: todayOrders.length,
          totalRevenue,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-green-500',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'bg-orange-500',
    },
    {
      title: 'Today\'s Orders',
      value: stats.todayOrders,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
  ];

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
      <h2 className="text-xl font-bold text-foreground mb-6">Dashboard Overview</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-xl p-6 shadow-card"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{card.value}</p>
                <p className="text-sm text-muted-foreground">{card.title}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Revenue Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Revenue</span>
              <span className="text-2xl font-bold text-primary">₹{stats.totalRevenue}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Delivered Orders</span>
              <span className="font-medium">{stats.deliveredOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Pending Orders</span>
              <span className="font-medium text-orange-500">{stats.pendingOrders}</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Active Products</span>
              <span className="font-medium">{stats.totalProducts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Today's Orders</span>
              <span className="font-medium text-primary">{stats.todayOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Delivery Rate</span>
              <span className="font-medium text-green-500">
                {stats.totalOrders > 0 
                  ? Math.round((stats.deliveredOrders / stats.totalOrders) * 100) 
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
