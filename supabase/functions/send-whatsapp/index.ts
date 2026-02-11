import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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

const formatItems = (items: OrderData['items']): string => {
  return items
    .map(item => `• ${item.name} (${item.weight}) x${item.quantity} = ₹${item.price * item.quantity}`)
    .join('\n');
};

const sendTwilioWhatsApp = async (to: string, body: string): Promise<{ success: boolean }> => {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');

  if (!accountSid || !authToken) {
    console.error('[WhatsApp] Missing Twilio credentials');
    return { success: false };
  }

  const cleanPhone = to.replace(/[\s\-]/g, '');
  const fromNumber = 'whatsapp:+14155238886';
  const toNumber = `whatsapp:+${cleanPhone.replace(/^\+/, '')}`;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const params = new URLSearchParams();
  params.append('From', fromNumber);
  params.append('To', toNumber);
  params.append('Body', body);

  const credentials = btoa(`${accountSid}:${authToken}`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const result = await response.json();

    if (response.ok) {
      console.log(`[WhatsApp] Twilio success: SID ${result.sid}`);
      return { success: true };
    } else {
      console.error(`[WhatsApp] Twilio error: ${result.message}`);
      return { success: false };
    }
  } catch (error) {
    console.error(`[WhatsApp] Twilio fetch error:`, error);
    return { success: false };
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order, ownerPhone }: WhatsAppRequest = await req.json();

    console.log(`[WhatsApp] Processing order ${order.orderId}`);

    const formattedItems = formatItems(order.items);
    const timestamp = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const ownerMessage = `🛒 *NEW ORDER RECEIVED!*
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

Please prepare this order! 🥬🍎`;

    const customerMessage = `✅ *ORDER CONFIRMED!*

Hello ${order.customerName}! 👋

Your order at *JP.Vegetables & Fruits* is confirmed! 🥬🍎

*Order ID:* #${order.orderId}
*Total:* ₹${order.totalAmount}
*Delivery:* ${order.deliveryOption === 'delivery' ? 'Home Delivery' : 'Store Pickup'}

${order.deliveryOption === 'delivery' ? 'We will deliver to your doorstep soon!' : 'Your order will be ready for pickup shortly!'}

Thank you for choosing us! 🌿`;

    const [ownerResult, customerResult] = await Promise.all([
      sendTwilioWhatsApp(ownerPhone, ownerMessage),
      sendTwilioWhatsApp(order.customerPhone, customerMessage),
    ]);

    console.log(`[WhatsApp] Owner: ${ownerResult.success}, Customer: ${customerResult.success}`);

    return new Response(
      JSON.stringify({
        success: true,
        ownerNotified: ownerResult.success,
        customerNotified: customerResult.success,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('[WhatsApp] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
