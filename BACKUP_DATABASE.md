# DATABASE BACKUP SCRIPT
# Use este script se quiser fazer BACKUP completo do banco de dados

# OPÇÃO 1: Via Supabase Dashboard (RECOMENDADO)
# 1. Acesse: https://supabase.com/dashboard/project/hprgfxuyamtrrhgfjtqc
# 2. Vá em Database > Backups
# 3. Faça download do backup

# OPÇÃO 2: Via comando (requer PostgreSQL instalado localmente)
# Execute este comando no terminal:

# pg_dump "postgresql://postgres:Leadtriage2306@db.hprgfxuyamtrrhgfjtqc.supabase.co:5432/postgres" > backup_leadtriage_$(Get-Date -Format "yyyy-MM-dd").sql

# OPÇÃO 3: Via Prisma (exportar schema atual)
# npx prisma db pull

# IMPORTANTE:
# O banco está na NUVEM (Supabase), então os dados NÃO serão perdidos
# ao mudar de computador. Você só precisa do arquivo .env para conectar!
