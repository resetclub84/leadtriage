
// Native fetch is used (Node 18+)

// Load env vars manually if dotenv not present
const fs = require('fs');
const path = require('path');
const dotenv = require('fs').readFileSync(path.join(__dirname, '..', '.env'), 'utf-8');

const env = {};
dotenv.split('\n').forEach(line => {
    const [key, val] = line.split('=');
    if (key && val) env[key.trim()] = val.trim().replace(/"/g, '');
});

const TOKEN = env.WHATSAPP_ACCESS_TOKEN;
const PHONE_ID = env.WHATSAPP_PHONE_NUMBER_ID;

if (!TOKEN || !PHONE_ID) {
    console.error('❌ Missing Keys in .env');
    process.exit(1);
}

const args = process.argv.slice(2);
const TO_PHONE = args[0];

if (!TO_PHONE) {
    console.error('❌ Please provide a phone number to test sending to. Example: node scripts/test-send.js 5511999999999');
    process.exit(1);
}

async function sendTest() {
    console.log(`📤 Sending test message to ${TO_PHONE} using Phone ID ${PHONE_ID}...`);

    const url = `https://graph.facebook.com/v17.0/${PHONE_ID}/messages`;

    // Standard "hello_world" test template usually available in all new apps
    // OR plain text if template not approved. Let's try plain text first for simplicity if allowed, 
    // but usually Meta requires Templates for initial contact. 
    // Let's try a safe "Hello World" template which is standard.

    const payload = {
        messaging_product: "whatsapp",
        to: TO_PHONE,
        type: "template",
        template: {
            name: "hello_world",
            language: { code: "en_US" }
        }
    };

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok) {
            console.log('✅ SUCESSO! Mensagem enviada.');
            console.log('Response:', data);
        } else {
            console.error('❌ ERRO META:', data);

            // Fallback: Try plain text if template fails (only works if 24h window is open, which it might be if user replied)
            // But for a pure test of keys, the error usually confirms auth works even if policy blocks sending.
        }
    } catch (e) {
        console.error('❌ Network Error:', e);
    }
}

sendTest();
