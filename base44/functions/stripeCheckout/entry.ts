import Stripe from 'npm:stripe@15.8.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

const PRICES = {
  jce: 'price_1TWwosBMwhp1aXoHdI9iM3RO',
  jj: 'price_1TWwosBMwhp1aXoHMs1H5szH',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { abilityId } = await req.json();

    if (!PRICES[abilityId]) {
      return Response.json({ error: 'Invalid ability' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: PRICES[abilityId],
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: '{CHECKOUT_SUCCESS_URL}',
      cancel_url: '{CHECKOUT_CANCEL_URL}',
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        ability_id: abilityId,
        user_email: user.email,
      },
    });

    return Response.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});