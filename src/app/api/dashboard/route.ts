import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        // 1. Basic Counts
        const totalLeads = await prisma.lead.count();
        const newLeads = await prisma.lead.count({ where: { status: 'NEW' } });
        const wonLeads = await prisma.lead.count({ where: { status: 'WON' } });

        // 2. Funnel Stats
        const funnel = {
            NEW: await prisma.lead.count({ where: { status: 'NEW' } }),
            TRIAGING: await prisma.lead.count({ where: { status: 'TRIAGING' } }),
            CONTACTED: await prisma.lead.count({ where: { status: 'CONTACTED' } }),
            SCHEDULED: await prisma.lead.count({ where: { status: 'SCHEDULED' } }),
            WON: await prisma.lead.count({ where: { status: 'WON' } }),
            LOST: await prisma.lead.count({ where: { status: 'LOST' } }),
        };

        // 3. SLA Breaches (Example: NEW leads created > 24h ago)
        const yesterday = new Date();
        yesterday.setHours(yesterday.getHours() - 24);

        const slaBreached = await prisma.lead.count({
            where: {
                status: 'NEW',
                createdAt: { lt: yesterday }
            }
        });

        return NextResponse.json({
            overview: { totalLeads, newLeads, wonLeads, slaBreached },
            funnel
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
    }
}
