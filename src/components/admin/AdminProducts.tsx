import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Check, X, Upload, Image } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  name_ta: string | null;
  price: number;
  offer_price: number | null;
  unit: string;
  image_url: string | null;
  description: string | null;
  description_ta: string | null;
  in_stock: boolean | null;
  is_offer: boolean | null;
  is_best_seller: boolean | null;
  is_fresh: boolean | null;
  category_id: string | null;
  weights: string[] | null;
}

interface Category {
  id: string;
  name: string;
  icon: string | null;
}

export const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    name_ta: '',
    category_id: '',
    price: '',
    unit: 'kg',
    image_url: '',
    description: '',
    description_ta: '',
    in_stock: true,
    is_offer: false,
    offer_price: '',
    is_best_seller: false,
    weights: ['250g', '500g', '1kg'],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        supabase.from('products').select('*').order('name'),
        supabase.from('categories').select('*').order('name'),
      ]);

      if (productsRes.error) throw productsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;

      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      name_ta: '',
      category_id: '',
      price: '',
      unit: 'kg',
      image_url: '',
      description: '',
      description_ta: '',
      in_stock: true,
      is_offer: false,
      offer_price: '',
      is_best_seller: false,
      weights: ['250g', '500g', '1kg'],
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
      name_ta: product.name_ta || '',
      category_id: product.category_id || '',
      price: product.price.toString(),
      unit: product.unit,
      image_url: product.image_url || '',
      description: product.description || '',
      description_ta: product.description_ta || '',
      in_stock: product.in_stock ?? true,
      is_offer: product.is_offer ?? false,
      offer_price: product.offer_price?.toString() || '',
      is_best_seller: product.is_best_seller ?? false,
      weights: product.weights || ['250g', '500g', '1kg'],
    });
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      const productData = {
        name: formData.name,
        name_ta: formData.name_ta || null,
        category_id: formData.category_id || null,
        price: Number(formData.price),
        unit: formData.unit,
        image_url: formData.image_url || null,
        description: formData.description || null,
        description_ta: formData.description_ta || null,
        in_stock: formData.in_stock,
        is_offer: formData.is_offer,
        offer_price: formData.is_offer ? Number(formData.offer_price) : null,
        is_best_seller: formData.is_best_seller,
        is_fresh: true,
        weights: formData.weights,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast.success('Product updated successfully!');
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) throw error;
        toast.success('Product added successfully!');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save product');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Product deleted');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete product');
    }
  };

  const toggleStock = async (id: string, currentStatus: boolean | null) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ in_stock: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setProducts(prev =>
        prev.map(p => p.id === id ? { ...p, in_stock: !currentStatus } : p)
      );
    } catch (error) {
      console.error('Toggle error:', error);
      toast.error('Failed to update stock status');
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
          Manage Products ({products.length})
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
              {products.map((product) => {
                const category = categories.find(c => c.id === product.category_id);
                return (
                  <tr key={product.id} className="border-t border-border hover:bg-muted/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image_url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop'}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-foreground">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.name_ta}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-muted rounded-full text-sm capitalize">
                        {category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">₹{product.price}/{product.unit}</p>
                        {product.is_offer && (
                          <p className="text-sm text-primary">Offer: ₹{product.offer_price}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <Switch
                        checked={product.in_stock ?? true}
                        onCheckedChange={() => toggleStock(product.id, product.in_stock)}
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
                );
              })}
            </tbody>
          </table>
        </div>
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
                  value={formData.name_ta}
                  onChange={(e) => setFormData(prev => ({ ...prev, name_ta: e.target.value }))}
                  placeholder="தமிழ் பெயர்"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
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
                <Label>Image</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                    placeholder="URL or upload"
                    className="flex-1"
                  />
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                    <Button type="button" variant="outline" size="icon" disabled={uploading} asChild>
                      <span>
                        {uploading ? (
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            </div>

            {formData.image_url && (
              <div className="flex items-center gap-2">
                <img src={formData.image_url} alt="Preview" className="w-16 h-16 rounded-lg object-cover" />
                <span className="text-sm text-muted-foreground">Image preview</span>
              </div>
            )}

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
                checked={formData.is_offer}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_offer: checked }))}
              />
            </div>

            {formData.is_offer && (
              <div className="space-y-2">
                <Label>Offer Price (₹)</Label>
                <Input
                  type="number"
                  value={formData.offer_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, offer_price: e.target.value }))}
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
                checked={formData.in_stock}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, in_stock: checked }))}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Best Seller</p>
                <p className="text-sm text-muted-foreground">Show in best sellers section</p>
              </div>
              <Switch
                checked={formData.is_best_seller}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_best_seller: checked }))}
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
    </motion.div>
  );
};
