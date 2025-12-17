
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

// Disable body parsing for webhook
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET || ''
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            const patientId = session.metadata?.patientId;

            if (patientId) {
                // Upgrade patient to PRO
                await prisma.patient.update({
                    where: { id: patientId },
                    data: {
                        subscriptionPlan: 'PRO',
                        // Could also store stripeCustomerId, subscriptionId etc.
                    }
                });

                console.log(`✅ Patient ${patientId} upgraded to PRO`);
            }
            break;
        }

        case 'customer.subscription.deleted': {
            const subscription = event.data.object as Stripe.Subscription;
            // Find patient by stripeCustomerId and downgrade
            // For now, we'll log it
            console.log('⚠️ Subscription cancelled:', subscription.id);
            break;
        }

        case 'invoice.payment_failed': {
            const invoice = event.data.object as Stripe.Invoice;
            console.log('⚠️ Payment failed for invoice:', invoice.id);
            break;
        }

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
