-- Create customer profiles table for customer authentication
CREATE TABLE public.customer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on customer_profiles
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;

-- Customers can view their own profile
CREATE POLICY "Customers can view their own profile"
ON public.customer_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Customers can insert their own profile
CREATE POLICY "Customers can insert their own profile"
ON public.customer_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Customers can update their own profile
CREATE POLICY "Customers can update their own profile"
ON public.customer_profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all customer profiles"
ON public.customer_profiles
FOR SELECT
USING (is_admin());

-- Add trigger for updated_at
CREATE TRIGGER update_customer_profiles_updated_at
BEFORE UPDATE ON public.customer_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add customer_id column to orders for linking orders to customers
ALTER TABLE public.orders
ADD COLUMN customer_id UUID;

-- Allow customers to view their own orders
CREATE POLICY "Customers can view their own orders"
ON public.orders
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND 
  customer_id = auth.uid()
);

-- Insert default shop settings if they don't exist
INSERT INTO public.settings (key, value) VALUES
  ('shop_name', 'JP.Vegetables & Fruits'),
  ('shop_phone', '+91 98765 43210'),
  ('shop_email', 'order@jpvegetables.com'),
  ('shop_address', '123 Market Street, Chennai, Tamil Nadu'),
  ('shop_city', 'Chennai'),
  ('whatsapp_number', '919876543210'),
  ('delivery_timing', 'Mon - Sat: 6:00 AM - 9:00 PM'),
  ('sunday_timing', 'Sunday: 7:00 AM - 2:00 PM')
ON CONFLICT (key) DO NOTHING;