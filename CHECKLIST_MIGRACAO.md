# 📝 CHECKLIST DE MIGRAÇÃO RÁPIDO

Siga esta checklist ao migrar o projeto para outro PC:

## ✅ ANTES DE DESLIGAR O PC ATUAL

- [ ] Confirmar que o código está no GitHub: https://github.com/resetclub84/leadtriage.git
- [ ] Copiar o arquivo `.env` para USB, Google Drive ou Email
- [ ] (Opcional) Fazer backup do banco via Supabase Dashboard
- [ ] Anotar a versão do Node.js: `node -v` (v22.15.0)

## ✅ NO NOVO PC

### 1. Instalar Software
- [ ] Instalar Node.js v22+ de: https://nodejs.org/
- [ ] Instalar Git de: https://git-scm.com/downloads

### 2. Clonar Projeto
```bash
git clone https://github.com/resetclub84/leadtriage.git
cd leadtriage
```

### 3. Configurar Ambiente
- [ ] Colar o arquivo `.env` na raiz do projeto

### 4. Instalar Dependências
```bash
npm install
```

### 5. Configurar Banco
```bash
npx prisma db push
npm run seed
```

### 6. Testar
```bash
npm run dev
```
- [ ] Abrir http://localhost:3000
- [ ] Login: admin@leadtriage.com / admin
- [ ] Verificar se dashboard carrega

## ✅ ARQUIVOS CRÍTICOS

**OBRIGATÓRIO copiar:**
- `.env` (contém todas as chaves e senhas)

**NÃO PRECISA copiar (estão no Git ou serão gerados):**
- Código fonte (clonar do Git)
- node_modules (npm install)
- .next (gerado automaticamente)
- tsconfig.tsbuildinfo (cache)

## 🎯 TEMPO ESTIMADO

- Setup inicial: 10-15 minutos
- Download de dependências: 2-5 minutos
- **TOTAL: ~20 minutos**

---

**Dúvidas? Leia o arquivo: `MIGRACAO_COMPLETA.md`**
