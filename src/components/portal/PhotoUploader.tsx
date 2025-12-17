'use client';

import { useState } from 'react';
import { Camera, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PhotoUploaderProps {
    code: string;
    onUploadSuccess?: () => void;
}

export default function PhotoUploader({ code, onUploadSuccess }: PhotoUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const router = useRouter();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('code', code);
        formData.append('type', 'PROGRESS');

        try {
            const res = await fetch('/api/portal/photos/upload', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error('Falha no upload');

            const data = await res.json();
            if (data.success) {
                if (onUploadSuccess) onUploadSuccess();
                router.refresh(); // Refresh server data
            } else {
                alert('Erro: ' + data.error);
            }
        } catch (error) {
            console.error(error);
            alert('Erro ao enviar foto. Tente novamente.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="relative">
            <input
                type="file"
                accept="image/*"
                capture="user" // Forces camera on mobile mostly
                className="hidden"
                id="photo-upload-input"
                onChange={handleFileChange}
                disabled={isUploading}
            />

            <label
                htmlFor="photo-upload-input"
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/50 cursor-pointer hover:bg-zinc-900 hover:border-blue-500/50 transition-all group ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
                {isUploading ? (
                    <div className="flex flex-col items-center gap-2 text-zinc-400">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        <span className="text-xs">Enviando...</span>
                    </div>
                ) : (
                    <>
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-2 group-hover:bg-blue-500/20 group-active:scale-95 transition-all">
                            <Camera className="w-5 h-5 text-blue-500" />
                        </div>
                        <span className="text-sm font-medium text-zinc-300 group-hover:text-white">Toque para tirar foto</span>
                        <span className="text-xs text-zinc-500 mt-1">Check-in Visual</span>
                    </>
                )}
            </label>
        </div>
    );
}
