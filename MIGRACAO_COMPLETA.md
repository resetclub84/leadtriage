# 🚀 GUIA COMPLETO DE MIGRAÇÃO - Lead Triage SaaS

## ⚠️ IMPORTANTE: Leia Tudo Antes de Começar

Este guia garante que você consiga rodar o projeto **Lead Triage SaaS** em outro computador **SEM ERROS**.

---

## 📦 O QUE VOCÊ PRECISA COPIAR/SALVAR

### 1️⃣ Repositório Git (PRINCIPAL)
O código completo está no GitHub:
```
https://github.com/resetclub84/leadtriage.git
```

**✅ VANTAGEM:** Não precisa copiar arquivos manualmente, só clonar o repositório.

### 2️⃣ Arquivo de Variáveis de Ambiente (CRÍTICO)
Salve ESTE arquivo em local seguro (USB, Google Drive, etc):

**Arquivo:** `.env`

```env
# Database
DATABASE_URL="postgresql://postgres:Leadtriage2306@db.hprgfxuyamtrrhgfjtqc.supabase.co:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:Leadtriage2306@db.hprgfxuyamtrrhgfjtqc.supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="supersecretchange-me-in-production"
ADMIN_EMAIL="admin@leadtriage.com"
ADMIN_PASSWORD="admin"

# AI
GEMINI_API_KEY="AIzaSyDC1dSDQ56MsMT3NWpcG-I9Vl53hsmdzVs"

# Settings Defaults
NEXT_PUBLIC_GOOGLE_FORM_URL="https://forms.gle/CHANGE_ME"
NEXT_PUBLIC_WHATSAPP_BASE="https://wa.me/55"
N8N_WEBHOOK_URL=""

# WhatsApp Meta Cloud API
WHATSAPP_ACCESS_TOKEN="EAARChCRJZAtIBQLM0HEmiRZAmJdCN8EEQqoZB1SG47RVo5kZCSA3ocJMOrMik3V4spwXKSsmfCt81pzrorq6oZBrGfZAUcZCbWJvcAjv2Y3Pu9qPcGkjLkpN06Dl4qxsZByZCffFfmDqIOtlv2wTyaFZAzZBknkLrf5PwD8ZA9IKzTxDAi74vO2SThuulZAZAn0IPpTmmxSdoUT2dYJTUVPp2AbCQK410QnY2S9Wf8wFWdp351uAsUmbli9cRwPOMYON4ZByVCnWPMeHZAqDgFyePc12fcRUbnQs"
WHATSAPP_PHONE_NUMBER_ID="806010459270206"
WHATSAPP_VERIFY_TOKEN="leadtriage_secret_token"

# Google Auth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL="https://hprgfxuyamtrrhgfjtqc.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwcmdmeHV5YW10cnJoZ2ZqdHFjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTkzMjM3OSwiZXhwIjoyMDgxNTA4Mzc5fQ.175QFOvA721YLzTf3_nUssc-YbixCFS4j7ZBSCFd0p0"
```

**⚠️ MUITO IMPORTANTE:** Este arquivo contém senhas e chaves de API. NÃO compartilhe publicamente!

---

## 💻 PRÉ-REQUISITOS NO NOVO COMPUTADOR

### Versões Necessárias
- **Node.js:** v22.15.0 (ou superior)
- **npm:** Qualquer versão recente
- **Git:** Para clonar o repositório

### Download/Instalação

1. **Node.js:**
   - Acesse: https://nodejs.org/
   - Baixe a versão LTS (Long Term Support)
   - Instale normalmente

2. **Git:**
   - Acesse: https://git-scm.com/downloads
   - Instale normalmente

---

## 🔧 PASSO A PASSO - INSTALAÇÃO NO NOVO PC

### Passo 1: Clonar o Repositório

Abra o **Terminal** (PowerShell ou CMD) e execute:

```bash
cd C:\Users\SeuUsuario\Documents
git clone https://github.com/resetclub84/leadtriage.git
cd leadtriage
```

### Passo 2: Copiar Arquivo .env

Copie o arquivo `.env` que você salvou e cole na pasta raiz do projeto:

```
leadtriage\.env
```

### Passo 3: Instalar Dependências

```bash
npm install
```

**Tempo estimado:** 2-5 minutos (depende da internet)

### Passo 4: Configurar Banco de Dados

O banco já está configurado no Supabase (PostgreSQL na nuvem), então NÃO precisa instalar PostgreSQL localmente.

Execute para sincronizar o schema:

```bash
npx prisma db push
```

### Passo 5: (Opcional) Popular com Dados de Teste

```bash
npm run seed
```

### Passo 6: Iniciar o Servidor

```bash
npm run dev
```

Abra no navegador:
```
http://localhost:3000
```

---

## ✅ CHECKLIST DE VERIFICAÇÃO

Depois de instalar, verifique:

- [ ] O site abre em `http://localhost:3000`
- [ ] Consegue fazer login com:
  - Email: `admin@leadtriage.com`
  - Senha: `admin`
- [ ] Dashboard carrega sem erros
- [ ] Consegue criar um novo lead

---

## 📁 ESTRUTURA DO PROJETO

```
leadtriage/
├── .env                    # ⚠️ ARQUIVO CRÍTICO (não está no Git)
├── .gitignore              
├── package.json            # Dependências
├── prisma/
│   ├── schema.prisma       # Schema do banco de dados
│   └── seed.ts             # Dados iniciais
├── src/
│   ├── app/                # Páginas e rotas (Next.js 14)
│   │   ├── api/            # APIs REST
│   │   ├── app/            # Dashboard interno
│   │   ├── login/          # Tela de login
│   │   └── portal/         # Portal do paciente
│   ├── components/         # Componentes reutilizáveis
│   └── lib/                # Funções auxiliares
├── scripts/
│   └── test-send.js        # Teste de WhatsApp
└── public/                 # Arquivos estáticos
```

---

## 🆘 PROBLEMAS COMUNS E SOLUÇÕES

### Erro: "Module not found"
**Solução:** Execute `npm install` novamente

### Erro: "Port 3000 is already in use"
**Solução:** 
```bash
npx kill-port 3000
npm run dev
```

### Erro: "Prisma Client did not initialize"
**Solução:**
```bash
npx prisma generate
npx prisma db push
```

### Erro: "Cannot execute scripts" (PowerShell)
**Solução:**
1. Abra PowerShell como Administrador
2. Execute: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`
3. Digite `S` para confirmar

---

## 🔑 INFORMAÇÕES IMPORTANTES

### Banco de Dados
- **Tipo:** PostgreSQL
- **Hospedagem:** Supabase (nuvem)
- **Acesso:** Está configurado no `.env`
- **⚠️ Não precisa instalar PostgreSQL local!**

### Serviços Externos Configurados
- ✅ **Supabase:** Banco de dados + Storage de fotos
- ✅ **Google Gemini AI:** Triagem automática de leads
- ✅ **WhatsApp Business API:** Envio de mensagens
- ✅ **Vercel:** Deploy em produção (já configurado)

---

## 📞 PRÓXIMOS PASSOS APÓS INSTALAÇÃO

1. **Testar Funcionalidades:**
   ```bash
   # Testar webhook de leads
   node scripts/test-send.js 5511999999999
   ```

2. **Acessar Banco de Dados (Interface Visual):**
   ```bash
   npx prisma studio
   ```
   Abre em: `http://localhost:5555`

3. **Ver Logs:**
   - Os logs aparecem no terminal onde rodou `npm run dev`

---

## 🎯 COMANDOS ÚTEIS

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Ver estrutura do banco de dados
npx prisma studio

# Resetar banco (CUIDADO: apaga tudo)
npx prisma migrate reset

# Build para produção
npm run build

# Rodar em produção
npm start
```

---

## 📋 RESUMO EXECUTIVO

### O Que NÃO Precisa Copiar Manualmente:
- ❌ Código fonte (está no Git)
- ❌ node_modules (serão instalados via `npm install`)
- ❌ .next (gerado automaticamente)
- ❌ Banco de dados (está na nuvem no Supabase)

### O Que PRECISA Copiar:
- ✅ Arquivo `.env` (contém as chaves e senhas)
- ✅ Link do repositório Git (já anotado acima)

### Tempo Total de Instalação:
- ⏱️ 10-15 minutos

---

## 🚨 ATENÇÃO FINAL

1. **NUNCA** compartilhe o arquivo `.env` publicamente
2. **SEMPRE** faça backup do `.env` antes de deletar o projeto
3. O banco de dados está na nuvem (Supabase), então os dados NÃO são perdidos ao trocar de PC
4. Se tiver problemas, verifique se o Node.js está na versão correta: `node -v`

---

**🎉 Pronto! Seguindo este guia, o projeto funcionará perfeitamente no novo PC.**
