import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderData {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: Array<{
    name: string;
    weight: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  deliveryOption: string;
  paymentMethod: string;
}

interface WhatsAppRequest {
  order: OrderData;
  ownerPhone: string;
}

// Format order items for WhatsApp message
const formatItems = (items: OrderData['items']): string => {
  return items
    .map(item => `• ${item.name} (${item.weight}) x${item.quantity} = ₹${item.price * item.quantity}`)
    .join('\n');
};

// Send WhatsApp message via CallMeBot API
const sendWhatsAppMessage = async (phone: string, message: string): Promise<boolean> => {
  try {
    // CallMeBot API - free WhatsApp API
    // Note: Users need to register their phone with CallMeBot first
    // For production, consider using Twilio, WhatsApp Business API, or similar
    const encodedMessage = encodeURIComponent(message);
    
    // Using CallMeBot API format
    // The shop owner needs to register at https://www.callmebot.com/blog/free-api-whatsapp-messages/
    const apiKey = Deno.env.get('CALLMEBOT_API_KEY') || '';
    
    if (apiKey) {
      const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodedMessage}&apikey=${apiKey}`;
      const response = await fetch(url);
      console.log(`WhatsApp message sent to ${phone}:`, response.status);
      return response.ok;
    } else {
      // Log the message for debugging when API key is not set
      console.log(`WhatsApp message would be sent to ${phone}:`);
      console.log(message);
      return true;
    }
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return false;
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order, ownerPhone }: WhatsAppRequest = await req.json();

    console.log('Processing order notification:', order.orderId);

    const formattedItems = formatItems(order.items);
    const timestamp = new Date().toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    // Message for shop owner
    const ownerMessage = `
🛒 *New Order Received!*
━━━━━━━━━━━━━━━

*Order ID:* #${order.orderId}

*Customer:* ${order.customerName}
*Phone:* ${order.customerPhone}
*Address:* ${order.customerAddress}

*Items:*
${formattedItems}

*Total:* ₹${order.totalAmount}
*Delivery:* ${order.deliveryOption === 'delivery' ? 'Home Delivery' : 'Store Pickup'}
*Payment:* Cash on Delivery

*Time:* ${timestamp}
    `.trim();

    // Message for customer
    const customerMessage = `
✅ *Thank you for your order!*

*JP.Vegetables & Fruits* 🥬🍎

Your order *#${order.orderId}* is confirmed.
*Total:* ₹${order.totalAmount}

We will deliver shortly.
Thank you for choosing us! 🌿
    `.trim();

    // Send messages
    const ownerSent = await sendWhatsAppMessage(ownerPhone, ownerMessage);
    const customerSent = await sendWhatsAppMessage(order.customerPhone, customerMessage);

    return new Response(
      JSON.stringify({ 
        success: true,
        ownerNotified: ownerSent,
        customerNotified: customerSent,
        ownerMessage,
        customerMessage,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: unknown) {
    console.error('Error in send-whatsapp function:', error);
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
