import { prisma } from '@/lib/prisma';
import ProgramViewer from '@/components/portal/ProgramViewer';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function ProgramPage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = await params;

    const patient = await prisma.patient.findUnique({
        where: { accessCode: code },
        select: { protocol: true, name: true }
    });

    if (!patient) {
        return <div className="p-8 text-center text-gray-500">Acesso inválido.</div>;
    }

    return (
        <div className="pb-24 pt-6 px-4 max-w-md mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Link href={`/app/portal/${code}/dashboard`} className="p-2 -ml-2 rounded-full active:bg-white/10">
                    <ArrowLeft className="w-6 h-6 text-white" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white">Meu Plano</h1>
                    <p className="text-sm text-gray-400">Personalizado para você</p>
                </div>
            </div>

            {patient.protocol ? (
                <ProgramViewer protocol={patient.protocol} />
            ) : (
                <div className="glass-card p-8 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-blue-500/30" />
                    </div>
                    <div>
                        <h3 className="text-white font-medium">Plano em Elaboração</h3>
                        <p className="text-gray-400 text-sm mt-2">
                            Seu médico está preparando seu protocolo personalizado. Você receberá uma notificação assim que estiver pronto.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
