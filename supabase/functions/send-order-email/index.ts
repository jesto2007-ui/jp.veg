import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderItem {
  name: string;
  nameTA?: string;
  weight: string;
  quantity: number;
  price: number;
}

interface OrderData {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerEmail?: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryOption: string;
  paymentMethod: string;
}

interface EmailRequest {
  order: OrderData;
}

// Format order items for email
const formatItemsHtml = (items: OrderItem[]): string => {
  return items
    .map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.weight}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price * item.quantity}</td>
      </tr>
    `)
    .join('');
};

// Fetch shop settings from database
const fetchShopSettings = async () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from('settings')
    .select('key, value');

  if (error) {
    console.error('[Email] Error fetching settings:', error);
    return null;
  }

  const settings: Record<string, string> = {};
  data?.forEach(item => {
    settings[item.key] = item.value || '';
  });

  return {
    shopName: settings['shop_name'] || 'JP.Vegetables & Fruits',
    shopPhone: settings['shop_phone'] || '',
    shopEmail: settings['shop_email'] || '',
    shopAddress: settings['shop_address'] || '',
  };
};

// Generate customer email HTML
const generateCustomerEmailHtml = (order: OrderData, shopSettings: any, timestamp: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">✅ Order Confirmed!</h1>
      </div>
      
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px;">Hello <strong>${order.customerName}</strong>,</p>
        
        <p>Thank you for your order at <strong>${shopSettings.shopName}</strong>! 🥬🍎</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <h3 style="margin-top: 0; color: #16a34a;">Order Details</h3>
          <p><strong>Order ID:</strong> #${order.orderId}</p>
          <p><strong>Order Date:</strong> ${timestamp}</p>
          <p><strong>Delivery Address:</strong> ${order.customerAddress}</p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <h3 style="margin-top: 0; color: #16a34a;">Items Ordered</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 10px; text-align: left;">Item</th>
                <th style="padding: 10px; text-align: center;">Weight</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${formatItemsHtml(order.items)}
            </tbody>
            <tfoot>
              <tr style="background: #f3f4f6; font-weight: bold;">
                <td colspan="3" style="padding: 12px;">Total Amount</td>
                <td style="padding: 12px; text-align: right; color: #16a34a; font-size: 18px;">₹${order.totalAmount}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>💰 Payment:</strong> Cash on Delivery</p>
          <p style="margin: 5px 0 0 0; font-size: 14px; color: #92400e;">Please keep ₹${order.totalAmount} ready at the time of delivery.</p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <h3 style="margin-top: 0; color: #16a34a;">Contact Us</h3>
          <p style="margin: 5px 0;"><strong>${shopSettings.shopName}</strong></p>
          <p style="margin: 5px 0;">📞 ${shopSettings.shopPhone}</p>
          <p style="margin: 5px 0;">📧 ${shopSettings.shopEmail}</p>
          <p style="margin: 5px 0;">📍 ${shopSettings.shopAddress}</p>
        </div>
        
        <p style="text-align: center; color: #6b7280; font-size: 14px;">
          Thank you for choosing us! 🌿<br>
          We will deliver your fresh produce soon.
        </p>
      </div>
    </body>
    </html>
  `;
};

// Generate owner email HTML
const generateOwnerEmailHtml = (order: OrderData, timestamp: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🛒 New Order Received!</h1>
      </div>
      
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <h3 style="margin-top: 0; color: #ea580c;">Order Information</h3>
          <p><strong>Order ID:</strong> #${order.orderId}</p>
          <p><strong>Order Date:</strong> ${timestamp}</p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <h3 style="margin-top: 0; color: #ea580c;">Customer Details</h3>
          <p><strong>Name:</strong> ${order.customerName}</p>
          <p><strong>Phone:</strong> ${order.customerPhone}</p>
          <p><strong>Address:</strong> ${order.customerAddress}</p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <h3 style="margin-top: 0; color: #ea580c;">Items Ordered</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 10px; text-align: left;">Item</th>
                <th style="padding: 10px; text-align: center;">Weight</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${formatItemsHtml(order.items)}
            </tbody>
            <tfoot>
              <tr style="background: #fff7ed; font-weight: bold;">
                <td colspan="3" style="padding: 12px;">Total Amount</td>
                <td style="padding: 12px; text-align: right; color: #ea580c; font-size: 18px;">₹${order.totalAmount}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>💰 Payment:</strong> Cash on Delivery</p>
          <p style="margin: 5px 0 0 0;"><strong>🚚 Delivery:</strong> ${order.deliveryOption === 'delivery' ? 'Home Delivery' : 'Store Pickup'}</p>
        </div>
        
        <p style="text-align: center; background: #16a34a; color: white; padding: 15px; border-radius: 8px; font-size: 16px;">
          Please prepare this order! 🥬🍎
        </p>
      </div>
    </body>
    </html>
  `;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order }: EmailRequest = await req.json();

    console.log('[Email] ====== Processing Order Email Notification ======');
    console.log(`[Email] Order ID: ${order.orderId}`);
    console.log(`[Email] Customer: ${order.customerName} (${order.customerPhone})`);

    // Fetch shop settings from database
    const shopSettings = await fetchShopSettings();
    if (!shopSettings) {
      throw new Error('Failed to fetch shop settings');
    }

    console.log(`[Email] Shop Name: ${shopSettings.shopName}`);
    console.log(`[Email] Shop Email: ${shopSettings.shopEmail}`);

    if (!shopSettings.shopEmail) {
      throw new Error('Shop email not configured in settings');
    }

    const timestamp = new Date().toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    const results = {
      customerEmail: { success: false, error: null as string | null },
      ownerEmail: { success: false, error: null as string | null },
    };

    // Send email to shop owner
    try {
      const ownerEmailHtml = generateOwnerEmailHtml(order, timestamp);
      const ownerResponse = await resend.emails.send({
        from: `${shopSettings.shopName} <onboarding@resend.dev>`,
        to: [shopSettings.shopEmail],
        subject: `New Order Received – ${shopSettings.shopName}`,
        html: ownerEmailHtml,
      });

      if (ownerResponse.error) {
        console.error('[Email] Owner email error:', ownerResponse.error);
        results.ownerEmail.error = ownerResponse.error.message;
      } else {
        console.log('[Email] Owner email sent successfully:', ownerResponse.data);
        results.ownerEmail.success = true;
      }
    } catch (error: any) {
      console.error('[Email] Owner email failed:', error);
      results.ownerEmail.error = error.message;
    }

    // Send email to customer (if email is provided)
    if (order.customerEmail) {
      try {
        const customerEmailHtml = generateCustomerEmailHtml(order, shopSettings, timestamp);
        const customerResponse = await resend.emails.send({
          from: `${shopSettings.shopName} <onboarding@resend.dev>`,
          to: [order.customerEmail],
          subject: `Order Confirmed – ${shopSettings.shopName}`,
          html: customerEmailHtml,
        });

        if (customerResponse.error) {
          console.error('[Email] Customer email error:', customerResponse.error);
          results.customerEmail.error = customerResponse.error.message;
        } else {
          console.log('[Email] Customer email sent successfully:', customerResponse.data);
          results.customerEmail.success = true;
        }
      } catch (error: any) {
        console.error('[Email] Customer email failed:', error);
        results.customerEmail.error = error.message;
      }
    } else {
      console.log('[Email] No customer email provided, skipping customer notification');
      results.customerEmail.error = 'No customer email provided';
    }

    console.log('[Email] ====== Email Notification Results ======');
    console.log(`[Email] Owner notification: ${results.ownerEmail.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`[Email] Customer notification: ${results.customerEmail.success ? 'SUCCESS' : 'FAILED'}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        ownerNotified: results.ownerEmail.success,
        customerNotified: results.customerEmail.success,
        errors: {
          owner: results.ownerEmail.error,
          customer: results.customerEmail.error,
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: unknown) {
    console.error('[Email] Error in send-order-email function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
