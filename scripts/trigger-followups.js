
// Simple script to trigger follow-up processing
// Run: node scripts/trigger-followups.js

async function main() {
    console.log('🔄 Triggering follow-up processor...');

    try {
        const res = await fetch('http://localhost:3000/api/followups/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (res.ok) {
            const data = await res.json();
            console.log('✅ Result:', data);
        } else {
            console.error('❌ Error:', res.status, res.statusText);
        }
    } catch (e) {
        console.error('❌ Failed to connect:', e.message);
    }
}

main();
