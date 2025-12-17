
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Checking Users in Database...');
    const users = await prisma.user.findMany();

    if (users.length === 0) {
        console.log('❌ No users found in database!');
    } else {
        console.log(`✅ Found ${users.length} users:`);
        users.forEach(u => {
            console.log(`- Email: ${u.email} | Password: ${u.password} | Role: ${u.role}`);
        });
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
