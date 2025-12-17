
const fs = require('fs');
const readline = require('readline');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const envPath = path.join(__dirname, '..', '.env');

function ask(question) {
    return new Promise(resolve => rl.question(question, resolve));
}

async function main() {
    console.log('\n📱 Configuração Automática do WhatsApp LeadTriage 📱\n');
    console.log('Cole as chaves que você pegou no painel da Meta:\n');

    const token = await ask('1. Meta Access Token: ');
    const phoneId = await ask('2. Phone Number ID: ');

    // Read existing .env
    let envContent = '';
    try {
        envContent = fs.readFileSync(envPath, 'utf8');
    } catch (e) {
        console.log('Criando novo arquivo .env...');
    }

    // Replace or Append
    const keys = {
        'WHATSAPP_ACCESS_TOKEN': token.trim(),
        'WHATSAPP_PHONE_NUMBER_ID': phoneId.trim()
    };

    let newEnv = envContent;
    for (const [key, val] of Object.entries(keys)) {
        const regex = new RegExp(`^${key}=.*`, 'm');
        if (regex.test(newEnv)) {
            newEnv = newEnv.replace(regex, `${key}="${val}"`);
        } else {
            newEnv += `\n${key}="${val}"`;
        }
    }

    fs.writeFileSync(envPath, newEnv);
    console.log('\n✅ Chaves salvas no arquivo .env com sucesso!');
    console.log('Agora você pode rodar "npm run dev" para testar.');
    rl.close();
}

main();
