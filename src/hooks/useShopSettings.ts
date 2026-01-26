import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ShopSettings {
  shop_name: string;
  shop_phone: string;
  shop_email: string;
  shop_address: string;
  shop_city: string;
  whatsapp_number: string;
  delivery_timing: string;
  sunday_timing: string;
}

const defaultSettings: ShopSettings = {
  shop_name: 'JP.Vegetables & Fruits',
  shop_phone: '+91 98765 43210',
  shop_email: 'order@jpvegetables.com',
  shop_address: '123 Market Street, Chennai, Tamil Nadu',
  shop_city: 'Chennai',
  whatsapp_number: '919876543210',
  delivery_timing: 'Mon - Sat: 6:00 AM - 9:00 PM',
  sunday_timing: 'Sunday: 7:00 AM - 2:00 PM',
};

export const useShopSettings = () => {
  const [settings, setSettings] = useState<ShopSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

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
          acc[item.key as keyof ShopSettings] = item.value || '';
          return acc;
        }, {} as Record<string, string>);

        setSettings({
          ...defaultSettings,
          ...settingsMap,
        });
      }
    } catch (error) {
      console.error('Error fetching shop settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading, refetch: fetchSettings };
};
