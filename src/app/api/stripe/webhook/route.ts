import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

// Disable body parsing, we need the raw body for webhook signature verification
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      console.log("✅ Checkout completed:", {
        userId,
        customerId,
        subscriptionId,
        customerEmail: session.customer_email,
      });

      // TODO: Update your database to mark the user as Pro
      // Example: await db.user.update({ where: { id: userId }, data: { isPro: true, stripeCustomerId: customerId } })

      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      console.log("📝 Subscription updated:", {
        subscriptionId: subscription.id,
        status: subscription.status,
      });

      // TODO: Update subscription status in your database

      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      console.log("❌ Subscription cancelled:", {
        subscriptionId: subscription.id,
      });

      // TODO: Mark user as no longer Pro in your database

      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      console.log("💰 Payment succeeded:", {
        invoiceId: invoice.id,
        amountPaid: invoice.amount_paid,
      });

      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      console.log("⚠️ Payment failed:", {
        invoiceId: invoice.id,
      });

      // TODO: Notify user about failed payment

      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

