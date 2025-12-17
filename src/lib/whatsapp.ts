
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Types for Meta Cloud API
type WhatsAppMessage = {
    messaging_product: 'whatsapp';
    to: string;
    type?: 'text' | 'template';
    text?: { body: string };
    template?: { name: string; language: { code: string } };
};

export async function sendWhatsAppMessage(to: string, message: string) {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!token || !phoneNumberId) {
        console.error('❌ Missing WhatsApp Credentials in .env');
        return null;
    }

    // Basic cleaning of phone number (remove +, spaces, dashes)
    const cleanPhone = to.replace(/\D/g, '');

    const payload: WhatsAppMessage = {
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'text',
        text: { body: message },
    };

    try {
        const res = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const errorData = await res.json();
            console.error('❌ Meta API Error:', JSON.stringify(errorData, null, 2));
            return null;
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error('❌ Network Error sending WhatsApp:', error);
        return null;
    }
}

// Simple helper to verify webhook signature (Optional for robust MVP, strict for Prod)
export function verifyWebhookToken(mode: string | null, token: string | null) {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
    if (!verifyToken) {
        console.error('❌ Missing WHATSAPP_VERIFY_TOKEN in .env');
        return false;
    }
    return mode === 'subscribe' && token === verifyToken;
}
