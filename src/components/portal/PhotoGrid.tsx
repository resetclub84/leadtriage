import Image from 'next/image';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Photo {
    id: string;
    url: string;
    createdAt: Date;
    type: string;
}

export default function PhotoGrid({ photos }: { photos: Photo[] }) {
    if (photos.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-zinc-500 text-sm">Nenhuma foto registrada ainda.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-4">
            {photos.map((photo) => (
                <div key={photo.id} className="relative aspect-[3/4] rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800">
                    <Image
                        src={photo.url}
                        alt="Progresso"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
                        <p className="text-xs text-white font-medium">
                            {format(new Date(photo.createdAt), "d 'de' MMM", { locale: ptBR })}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
