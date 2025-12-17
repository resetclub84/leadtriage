
// Helper to simulate a WhatsApp webhook hit locally
const fetch = require('node-fetch'); // Needs node-fetch installed or use global fetch in Node 18+

async function main() {
    console.log('📨 Simulando mensagem recebida do WhatsApp...');

    const payload = {
        object: "whatsapp_business_account",
        entry: [{
            id: "WHATSAPP_ID",
            changes: [{
                value: {
                    messaging_product: "whatsapp",
                    metadata: { display_phone_number: "15555555555", phone_number_id: "123456" },
                    contacts: [{ profile: { name: "Cliente Teste" }, wa_id: "5511999999999" }],
                    messages: [{
                        from: "5511999999999",
                        id: "wamid.test",
                        timestamp: Date.now().toString(),
                        text: { body: "Olá, gostaria de saber preço do Reset." },
                        type: "text"
                    }]
                },
                field: "messages"
            }]
        }]
    };

    try {
        const res = await fetch('http://localhost:3000/api/whatsapp/webhook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            console.log('✅ Webhook processado com sucesso! Verifique o painel.');
        } else {
            console.log(`❌ Erro no Webhook: ${res.status} ${res.statusText}`);
            const txt = await res.text();
            console.log(txt);
        }
    } catch (e) {
        console.error('❌ Erro ao conectar com localhost:3000', e.message);
    }
}

main();
