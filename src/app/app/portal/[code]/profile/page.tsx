import Link from 'next/link';
import { Camera, ChevronRight } from 'lucide-react';

export default async function PortalProfilePage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = await params;

    return (
        <div className="p-6 text-white text-center pt-20">
            <h1 className="text-2xl font-bold mb-4">Perfil</h1>
            <div className="mt-8 grid gap-4">
                <Link href={`/app/portal/${code}/gallery`} className="glass-card p-4 flex items-center gap-4 active:scale-95 transition-transform">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Camera className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="text-left flex-1">
                        <h3 className="font-medium text-white">Minha Evolução</h3>
                        <p className="text-xs text-zinc-400">Ver fotos de antes e depois</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-600" />
                </Link>
            </div>

            <p className="text-zinc-500 mt-12 text-sm">Configurações da conta em breve.</p>
        </div>
    );
}
