
import { NextResponse } from 'next/server';
import { stripe, PRICES } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { accessCode, priceId = PRICES.PRO_MONTHLY } = await req.json();

        if (!accessCode) {
            return NextResponse.json({ error: 'Código de acesso obrigatório' }, { status: 400 });
        }

        // Find patient
        const patient = await prisma.patient.findUnique({
            where: { accessCode },
            select: { id: true, name: true, email: true }
        });

        if (!patient) {
            return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 });
        }

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'boleto', 'pix'],
            mode: 'subscription',
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            customer_email: patient.email || undefined,
            metadata: {
                patientId: patient.id,
                accessCode: accessCode,
            },
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/portal/${accessCode}/dashboard?upgrade=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/portal/${accessCode}/dashboard?upgrade=cancelled`,
            locale: 'pt-BR',
            allow_promotion_codes: true,
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('Stripe Checkout Error:', error);
        return NextResponse.json(
            { error: 'Erro ao criar sessão de pagamento' },
            { status: 500 }
        );
    }
}
