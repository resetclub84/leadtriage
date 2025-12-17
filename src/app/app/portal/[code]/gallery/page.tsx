import { prisma } from '@/lib/prisma';
import PhotoUploader from '@/components/portal/PhotoUploader';
import PhotoGrid from '@/components/portal/PhotoGrid';
import { ArrowLeft, History } from 'lucide-react';
import Link from 'next/link';

export default async function PortalGalleryPage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = await params;

    const patient = await prisma.patient.findUnique({
        where: { accessCode: code },
        include: {
            photos: {
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!patient) {
        return <div className="p-8 text-center text-zinc-500">Acesso inválido.</div>;
    }

    return (
        <div className="pb-24 pt-6 px-4 max-w-md mx-auto min-h-screen bg-black">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href={`/app/portal/${code}/profile`} className="p-2 -ml-2 rounded-full active:bg-white/10">
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Minha Evolução</h1>
                        <p className="text-sm text-zinc-400">Galeria de progresso</p>
                    </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
                    <History className="w-5 h-5 text-blue-500" />
                </div>
            </div>

            <div className="space-y-8">
                {/* Uploader Section */}
                <section>
                    <h2 className="text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wider">Novo Registro</h2>
                    <PhotoUploader code={code} />
                </section>

                {/* Grid Section */}
                <section>
                    <h2 className="text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wider flex items-center justify-between">
                        Histórico
                        <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-300">{patient.photos.length} fotos</span>
                    </h2>
                    <PhotoGrid photos={patient.photos} />
                </section>
            </div>
        </div>
    );
}
