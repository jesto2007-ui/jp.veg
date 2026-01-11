import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, ShoppingCart, Plus, Edit2, Trash2, 
  AlertCircle, Check, X, Leaf, LayoutDashboard
} from 'lucide-react';
import { products as initialProducts, categories, Product } from '@/data/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

// Demo orders for admin panel
const demoOrders = [
  {
    id: 'JP10234567',
    customer: 'Ravi Kumar',
    phone: '9876543210',
    items: ['Tomatoes (1kg) x2', 'Onions (500g) x1'],
    total: 100,
    status: 'pending',
    date: '2024-01-15',
  },
  {
    id: 'JP10234568',
    customer: 'Priya S',
    phone: '9876543211',
    items: ['Apples (1kg) x1', 'Bananas (dozen) x2'],
    total: 270,
    status: 'delivered',
    date: '2024-01-14',
  },
];

const Admin = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [productsList, setProductsList] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState(demoOrders);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    nameTA: '',
    category: 'vegetables' as Product['category'],
    price: '',
    unit: 'kg',
    image: '',
    description: '',
    descriptionTA: '',
    inStock: true,
    isOffer: false,
    offerPrice: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      nameTA: '',
      category: 'vegetables',
      price: '',
      unit: 'kg',
      image: '',
      description: '',
      descriptionTA: '',
      inStock: true,
      isOffer: false,
      offerPrice: '',
    });
    setEditingProduct(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      nameTA: product.nameTA,
      category: product.category,
      price: product.price.toString(),
      unit: product.unit,
      image: product.image,
      description: product.description,
      descriptionTA: product.descriptionTA,
      inStock: product.inStock,
      isOffer: product.isOffer,
      offerPrice: product.offerPrice?.toString() || '',
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.price) {
      toast.error('Please fill in required fields');
      return;
    }

    const productData: Product = {
      id: editingProduct?.id || Date.now().toString(),
      name: formData.name,
      nameTA: formData.nameTA,
      category: formData.category,
      price: Number(formData.price),
      unit: formData.unit,
      image: formData.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop',
      description: formData.description,
      descriptionTA: formData.descriptionTA,
      inStock: formData.inStock,
      isFresh: true,
      isOffer: formData.isOffer,
      offerPrice: formData.isOffer ? Number(formData.offerPrice) : undefined,
      isBestSeller: editingProduct?.isBestSeller || false,
    };

    if (editingProduct) {
      setProductsList(prev => 
        prev.map(p => p.id === editingProduct.id ? productData : p)
      );
      toast.success('Product updated successfully!');
    } else {
      setProductsList(prev => [...prev, productData]);
      toast.success('Product added successfully!');
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setProductsList(prev => prev.filter(p => p.id !== id));
    toast.success('Product deleted');
  };

  const toggleStock = (id: string) => {
    setProductsList(prev =>
      prev.map(p => p.id === id ? { ...p, inStock: !p.inStock } : p)
    );
  };

  const updateOrderStatus = (orderId: string, status: string) => {
    setOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, status } : o)
    );
    toast.success(`Order ${orderId} marked as ${status}`);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-fresh flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-foreground">Admin Panel</h1>
                <p className="text-xs text-muted-foreground">JP.Vegetables & Fruits</p>
              </div>
            </div>
            <Link to="/">
              <Button variant="outline" size="sm">
                <Leaf className="w-4 h-4 mr-2" />
                View Store
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'products' ? 'default' : 'outline'}
            onClick={() => setActiveTab('products')}
            className={activeTab === 'products' ? 'bg-gradient-fresh' : ''}
          >
            <Package className="w-4 h-4 mr-2" />
            Products
          </Button>
          <Button
            variant={activeTab === 'orders' ? 'default' : 'outline'}
            onClick={() => setActiveTab('orders')}
            className={activeTab === 'orders' ? 'bg-gradient-fresh' : ''}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Orders
          </Button>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">
                Manage Products ({productsList.length})
              </h2>
              <Button onClick={openAddDialog} className="bg-gradient-fresh">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>

            <div className="bg-card rounded-xl shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium text-muted-foreground">Product</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Category</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Price</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Stock</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsList.map((product) => (
                      <tr key={product.id} className="border-t border-border hover:bg-muted/30">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-medium text-foreground">{product.name}</p>
                              <p className="text-sm text-muted-foreground">{product.nameTA}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-muted rounded-full text-sm capitalize">
                            {product.category}
                          </span>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium">₹{product.price}/{product.unit}</p>
                            {product.isOffer && (
                              <p className="text-sm text-primary">Offer: ₹{product.offerPrice}</p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <Switch
                            checked={product.inStock}
                            onCheckedChange={() => toggleStock(product.id)}
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(product)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => handleDelete(product.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl font-bold text-foreground mb-6">
              Customer Orders ({orders.length})
            </h2>

            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-card rounded-xl p-4 shadow-card">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        order.status === 'delivered' 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-citrus-orange/10 text-citrus-orange'
                      }`}>
                        {order.status === 'delivered' ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <AlertCircle className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-foreground">{order.id}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            order.status === 'delivered'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-citrus-orange/10 text-citrus-orange'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.customer} • {order.phone}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {order.items.join(', ')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-lg text-foreground">₹{order.total}</p>
                        <p className="text-xs text-muted-foreground">{order.date}</p>
                      </div>
                      
                      {order.status === 'pending' && (
                        <div className="flex gap-2">
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Add/Edit Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name (English) *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Product name"
                />
              </div>
              <div className="space-y-2">
                <Label>Name (Tamil)</Label>
                <Input
                  value={formData.nameTA}
                  onChange={(e) => setFormData(prev => ({ ...prev, nameTA: e.target.value }))}
                  placeholder="தமிழ் பெயர்"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: Product['category']) => 
                    setFormData(prev => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilogram (kg)</SelectItem>
                    <SelectItem value="bunch">Bunch</SelectItem>
                    <SelectItem value="dozen">Dozen</SelectItem>
                    <SelectItem value="piece">Piece</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (₹) *</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input
                  value={formData.image}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description (English)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Offer Active</p>
                <p className="text-sm text-muted-foreground">Enable special offer price</p>
              </div>
              <Switch
                checked={formData.isOffer}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isOffer: checked }))}
              />
            </div>

            {formData.isOffer && (
              <div className="space-y-2">
                <Label>Offer Price (₹)</Label>
                <Input
                  type="number"
                  value={formData.offerPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, offerPrice: e.target.value }))}
                  placeholder="0"
                />
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">In Stock</p>
                <p className="text-sm text-muted-foreground">Product is available</p>
              </div>
              <Switch
                checked={formData.inStock}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, inStock: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-gradient-fresh">
              <Check className="w-4 h-4 mr-2" />
              {editingProduct ? 'Update' : 'Add'} Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
