import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export interface TenantContext {
    clinicId: string;
    clinicName: string;
    clinicPlan: string;
}

/**
 * Obtém o contexto do tenant (clínica) baseado na sessão do usuário
 */
export async function getTenantContext(): Promise<TenantContext | null> {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return null;
    }

    // Buscar usuário com sua clínica
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { clinic: true }
    });

    if (!user?.clinic) {
        // Fallback: buscar primeira clínica ativa (para compatibilidade)
        const defaultClinic = await prisma.clinic.findFirst({
            where: { isActive: true }
        });

        if (defaultClinic) {
            return {
                clinicId: defaultClinic.id,
                clinicName: defaultClinic.name,
                clinicPlan: defaultClinic.plan
            };
        }
        return null;
    }

    return {
        clinicId: user.clinic.id,
        clinicName: user.clinic.name,
        clinicPlan: user.clinic.plan
    };
}

/**
 * Wrapper para queries que precisam de isolamento por tenant
 */
export function withTenant<T extends object>(clinicId: string, data: T): T & { clinicId: string } {
    return { ...data, clinicId };
}

/**
 * Filtro padrão para queries isoladas por tenant
 */
export function tenantFilter(clinicId: string) {
    return { clinicId };
}
