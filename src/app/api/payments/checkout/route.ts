
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const { leadId, amountCents = 10000, title = 'Pré-agendamento' } = await req.json();

        if (!leadId) {
            return NextResponse.json({ error: 'Missing leadId' }, { status: 400 });
        }

        const lead = await prisma.lead.findUnique({ where: { id: leadId } });
        if (!lead) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        }

        // 1. Create Payment Record (Pending)
        const payment = await prisma.payment.create({
            data: {
                leadId: lead.id,
                amount: amountCents,
                status: 'PENDING',
                provider: 'STRIPE'
            }
        });

        // 2. Create Stripe Checkout Session
        const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'], // in Brazil, Stripe also supports 'boleto' if enabled in dashboard
            line_items: [
                {
                    price_data: {
                        currency: 'brl',
                        product_data: {
                            name: title,
                            description: `Agendamento para ${lead.name}`,
                        },
                        unit_amount: amountCents,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${origin}/app/leads/${lead.id}?payment_success=true`,
            cancel_url: `${origin}/app/leads/${lead.id}?payment_cancelled=true`,
            metadata: {
                leadId: lead.id,
                paymentId: payment.id
            }
        });

        // 3. Update Payment with Provider Reference
        await prisma.payment.update({
            where: { id: payment.id },
            data: { providerRef: session.id }
        });

        return NextResponse.json({ checkoutUrl: session.url });

    } catch (error) {
        console.error('Stripe Checkout Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
