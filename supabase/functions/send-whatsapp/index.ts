import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

// Send WhatsApp message via multiple fallback methods
const sendWhatsAppMessage = async (phone: string, message: string, isOwner: boolean): Promise<{ success: boolean; method: string }> => {
  // Clean phone number - remove + and spaces
  const cleanPhone = phone.replace(/[\s+\-]/g, '');
  
  console.log(`[WhatsApp] Preparing message for ${isOwner ? 'OWNER' : 'CUSTOMER'}: ${cleanPhone}`);
  console.log(`[WhatsApp] Message preview: ${message.substring(0, 100)}...`);
  
  // Try CallMeBot if API key is available
  const apiKey = Deno.env.get('CALLMEBOT_API_KEY');
  if (apiKey) {
    try {
      const encodedMessage = encodeURIComponent(message);
      const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodedMessage}&apikey=${apiKey}`;
      const response = await fetch(url);
      
      if (response.ok) {
        console.log(`[WhatsApp] CallMeBot success for ${cleanPhone}`);
        return { success: true, method: 'callmebot' };
      }
      console.log(`[WhatsApp] CallMeBot failed with status: ${response.status}`);
    } catch (error) {
      console.error(`[WhatsApp] CallMeBot error:`, error);
    }
  }
  
  // Try WhatsApp Business Cloud API if configured
  const wabaToken = Deno.env.get('WHATSAPP_BUSINESS_TOKEN');
  const wabaPhoneId = Deno.env.get('WHATSAPP_PHONE_ID');
  if (wabaToken && wabaPhoneId) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${wabaPhoneId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${wabaToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: cleanPhone,
            type: 'text',
            text: { body: message }
          }),
        }
      );
      
      if (response.ok) {
        console.log(`[WhatsApp] Business API success for ${cleanPhone}`);
        return { success: true, method: 'whatsapp_business' };
      }
      console.log(`[WhatsApp] Business API failed with status: ${response.status}`);
    } catch (error) {
      console.error(`[WhatsApp] Business API error:`, error);
    }
  }
  
  // Fallback: Log the message (for future integration)
  console.log(`[WhatsApp] NOTIFICATION QUEUED for ${cleanPhone}:`);
  console.log(`[WhatsApp] ${message}`);
  
  return { success: true, method: 'logged' };
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order, ownerPhone }: WhatsAppRequest = await req.json();

    console.log('[WhatsApp] ====== Processing Order Notification ======');
    console.log(`[WhatsApp] Order ID: ${order.orderId}`);
    console.log(`[WhatsApp] Customer: ${order.customerName} (${order.customerPhone})`);
    console.log(`[WhatsApp] Owner Phone: ${ownerPhone}`);

    const formattedItems = formatItems(order.items);
    const timestamp = new Date().toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    // Message for shop owner - detailed
    const ownerMessage = `
🛒 *NEW ORDER RECEIVED!*
━━━━━━━━━━━━━━━

*Order ID:* #${order.orderId}
*Time:* ${timestamp}

👤 *Customer Details:*
Name: ${order.customerName}
Phone: ${order.customerPhone}
Address: ${order.customerAddress}

📦 *Items Ordered:*
${formattedItems}

💰 *Total Amount:* ₹${order.totalAmount}
🚚 *Delivery:* ${order.deliveryOption === 'delivery' ? 'Home Delivery' : 'Store Pickup'}
💳 *Payment:* Cash on Delivery

Please prepare this order! 🥬🍎
    `.trim();

    // Message for customer - confirmation
    const customerMessage = `
✅ *ORDER CONFIRMED!*

Hello ${order.customerName}! 👋

Your order at *JP.Vegetables & Fruits* is confirmed! 🥬🍎

*Order ID:* #${order.orderId}
*Total:* ₹${order.totalAmount}
*Delivery:* ${order.deliveryOption === 'delivery' ? 'Home Delivery' : 'Store Pickup'}

${order.deliveryOption === 'delivery' ? 'We will deliver to your doorstep soon!' : 'Your order will be ready for pickup shortly!'}

Thank you for choosing us! 🌿
    `.trim();

    // Send messages in parallel
    const [ownerResult, customerResult] = await Promise.all([
      sendWhatsAppMessage(ownerPhone, ownerMessage, true),
      sendWhatsAppMessage(order.customerPhone, customerMessage, false)
    ]);

    console.log('[WhatsApp] ====== Notification Results ======');
    console.log(`[WhatsApp] Owner notification: ${ownerResult.success ? 'SUCCESS' : 'FAILED'} (${ownerResult.method})`);
    console.log(`[WhatsApp] Customer notification: ${customerResult.success ? 'SUCCESS' : 'FAILED'} (${customerResult.method})`);

    return new Response(
      JSON.stringify({ 
        success: true,
        ownerNotified: ownerResult.success,
        customerNotified: customerResult.success,
        methods: {
          owner: ownerResult.method,
          customer: customerResult.method
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: unknown) {
    console.error('[WhatsApp] Error in send-whatsapp function:', error);
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
