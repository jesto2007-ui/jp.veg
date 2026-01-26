import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SettingsData {
  shop_name: string;
  shop_phone: string;
  shop_email: string;
  shop_address: string;
  shop_city: string;
  whatsapp_number: string;
  delivery_timing: string;
  sunday_timing: string;
}

export const AdminSettings = () => {
  const [settings, setSettings] = useState<SettingsData>({
    shop_name: '',
    shop_phone: '',
    shop_email: '',
    shop_address: '',
    shop_city: '',
    whatsapp_number: '',
    delivery_timing: '',
    sunday_timing: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value');

      if (error) throw error;

      if (data) {
        const settingsMap = data.reduce((acc, item) => {
          acc[item.key as keyof SettingsData] = item.value || '';
          return acc;
        }, {} as Record<string, string>);

        setSettings(prev => ({
          ...prev,
          ...settingsMap,
        }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      // Update each setting
      const updates = Object.entries(settings).map(async ([key, value]) => {
        const { error } = await supabase
          .from('settings')
          .upsert({ key, value }, { onConflict: 'key' });

        if (error) throw error;
      });

      await Promise.all(updates);
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
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
        <h2 className="text-xl font-bold text-foreground">Shop Settings</h2>
        <Button onClick={handleSave} disabled={saving} className="bg-gradient-fresh">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="bg-card rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Basic Information</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Shop Name</Label>
              <Input
                value={settings.shop_name}
                onChange={(e) => setSettings(prev => ({ ...prev, shop_name: e.target.value }))}
                placeholder="JP.Vegetables & Fruits"
              />
            </div>

            <div className="space-y-2">
              <Label>City / Location</Label>
              <Input
                value={settings.shop_city}
                onChange={(e) => setSettings(prev => ({ ...prev, shop_city: e.target.value }))}
                placeholder="Chennai"
              />
            </div>

            <div className="space-y-2">
              <Label>
                <MapPin className="w-4 h-4 inline mr-2" />
                Full Address
              </Label>
              <Input
                value={settings.shop_address}
                onChange={(e) => setSettings(prev => ({ ...prev, shop_address: e.target.value }))}
                placeholder="123 Market Street, Chennai, Tamil Nadu"
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-card rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Contact Information</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number
              </Label>
              <Input
                value={settings.shop_phone}
                onChange={(e) => setSettings(prev => ({ ...prev, shop_phone: e.target.value }))}
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="space-y-2">
              <Label>
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address
              </Label>
              <Input
                type="email"
                value={settings.shop_email}
                onChange={(e) => setSettings(prev => ({ ...prev, shop_email: e.target.value }))}
                placeholder="order@jpvegetables.com"
              />
            </div>

            <div className="space-y-2">
              <Label>
                <MessageCircle className="w-4 h-4 inline mr-2" />
                WhatsApp Number
              </Label>
              <Input
                value={settings.whatsapp_number}
                onChange={(e) => setSettings(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                placeholder="919876543210"
              />
              <p className="text-xs text-muted-foreground">
                Enter without + symbol (e.g., 919876543210 for +91 98765 43210)
              </p>
            </div>
          </div>
        </div>

        {/* Working Hours */}
        <div className="bg-card rounded-xl p-6 shadow-card lg:col-span-2">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            <Clock className="w-5 h-5 inline mr-2" />
            Working Hours
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Weekday Timing</Label>
              <Input
                value={settings.delivery_timing}
                onChange={(e) => setSettings(prev => ({ ...prev, delivery_timing: e.target.value }))}
                placeholder="Mon - Sat: 6:00 AM - 9:00 PM"
              />
            </div>

            <div className="space-y-2">
              <Label>Sunday Timing</Label>
              <Input
                value={settings.sunday_timing}
                onChange={(e) => setSettings(prev => ({ ...prev, sunday_timing: e.target.value }))}
                placeholder="Sunday: 7:00 AM - 2:00 PM"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-muted/50 rounded-xl p-4">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> Changes to these settings will be reflected across the entire customer-facing website, 
          including the header, footer, checkout page, and WhatsApp messages.
        </p>
      </div>
    </motion.div>
  );
};
