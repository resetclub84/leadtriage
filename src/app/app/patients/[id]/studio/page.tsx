'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Camera, Upload, Image, Grid, Columns,
    Calendar, Scale, Check, X, Share2, Download
} from 'lucide-react';

interface Photo {
    id: string;
    url: string;
    type: string;
    angle?: string;
    weight?: number;
    weekNumber?: number;
    canShare: boolean;
    isPublic: boolean;
    createdAt: string;
}

interface PhotosData {
    photos: Photo[];
    organized: {
        before: Photo[];
        progress: Photo[];
        after: Photo[];
    };
    total: number;
}

export default function BeforeAfterStudioPage() {
    const params = useParams();
    const [data, setData] = useState<PhotosData | null>(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'compare'>('grid');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedBefore, setSelectedBefore] = useState<Photo | null>(null);
    const [selectedAfter, setSelectedAfter] = useState<Photo | null>(null);
    const [patient, setPatient] = useState<any>(null);

    useEffect(() => {
        fetchPhotos();
        fetchPatient();
    }, [params.id]);

    const fetchPhotos = async () => {
        const res = await fetch(`/api/patients/${params.id}/photos`);
        if (res.ok) {
            const photosData = await res.json();
            setData(photosData);

            // Auto-selecionar primeira e última foto para comparativo
            if (photosData.photos.length >= 2) {
                const sorted = [...photosData.photos].sort((a, b) =>
                    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                );
                setSelectedBefore(sorted[0]);
                setSelectedAfter(sorted[sorted.length - 1]);
            }
        }
        setLoading(false);
    };

    const fetchPatient = async () => {
        const res = await fetch(`/api/patients/${params.id}`);
        if (res.ok) {
            const patientData = await res.json();
            setPatient(patientData);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="skeleton h-10 w-64"></div>
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="skeleton h-64"></div>)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/app/patients/${params.id}/journey`} className="p-2 hover:bg-white/5 rounded-lg">
                        <ArrowLeft className="w-5 h-5 text-slate-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-serif font-semibold">Before/After Studio</h1>
                        <p className="text-muted text-sm">
                            {patient?.name ? `Galeria de ${patient.name.split(' ')[0]}` : 'Galeria de fotos'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="flex rounded-xl bg-white/5 p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${viewMode === 'grid' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400'
                                }`}
                        >
                            <Grid className="w-4 h-4" />
                            Galeria
                        </button>
                        <button
                            onClick={() => setViewMode('compare')}
                            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${viewMode === 'compare' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400'
                                }`}
                        >
                            <Columns className="w-4 h-4" />
                            Comparar
                        </button>
                    </div>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
                    >
                        <Upload className="w-4 h-4" />
                        Adicionar Foto
                    </button>
                </div>
            </div>

            {/* Modo Galeria */}
            {viewMode === 'grid' && (
                <div className="space-y-6">
                    {/* Fotos Antes */}
                    {data?.organized.before && data.organized.before.length > 0 && (
                        <PhotoSection
                            title="📸 Antes"
                            photos={data.organized.before}
                            color="rose"
                        />
                    )}

                    {/* Fotos Progresso */}
                    {data?.organized.progress && data.organized.progress.length > 0 && (
                        <PhotoSection
                            title="📈 Progresso"
                            photos={data.organized.progress}
                            color="indigo"
                        />
                    )}

                    {/* Fotos Depois */}
                    {data?.organized.after && data.organized.after.length > 0 && (
                        <PhotoSection
                            title="🎉 Depois"
                            photos={data.organized.after}
                            color="emerald"
                        />
                    )}

                    {/* Estado vazio */}
                    {(!data?.photos || data.photos.length === 0) && (
                        <div className="glass-card p-12 text-center">
                            <Camera className="w-16 h-16 mx-auto mb-4 text-slate-500 opacity-50" />
                            <h3 className="text-xl font-semibold text-white mb-2">Nenhuma foto ainda</h3>
                            <p className="text-muted mb-6">
                                Comece registrando fotos do início da jornada para acompanhar a evolução.
                            </p>
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="premium-button"
                            >
                                <Camera className="w-4 h-4 mr-2" />
                                Adicionar Primeira Foto
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Modo Comparar */}
            {viewMode === 'compare' && (
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Columns className="w-5 h-5 text-indigo-400" />
                        Comparativo Lado a Lado
                    </h3>

                    {data?.photos && data.photos.length >= 2 ? (
                        <div className="grid grid-cols-2 gap-6">
                            {/* Antes */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-rose-400">ANTES</span>
                                    <select
                                        value={selectedBefore?.id || ''}
                                        onChange={(e) => {
                                            const photo = data.photos.find(p => p.id === e.target.value);
                                            setSelectedBefore(photo || null);
                                        }}
                                        className="premium-input text-sm py-1"
                                    >
                                        {data.photos.map(photo => (
                                            <option key={photo.id} value={photo.id}>
                                                {new Date(photo.createdAt).toLocaleDateString('pt-BR')}
                                                {photo.weight ? ` - ${photo.weight}kg` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="aspect-[3/4] rounded-2xl bg-white/5 border border-rose-500/20 overflow-hidden">
                                    {selectedBefore?.url ? (
                                        <img
                                            src={selectedBefore.url}
                                            alt="Antes"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Image className="w-16 h-16 text-slate-500 opacity-50" />
                                        </div>
                                    )}
                                </div>
                                {selectedBefore && (
                                    <div className="mt-3 text-center">
                                        <p className="text-sm text-muted">
                                            {new Date(selectedBefore.createdAt).toLocaleDateString('pt-BR')}
                                        </p>
                                        {selectedBefore.weight && (
                                            <p className="text-lg font-bold text-white">{selectedBefore.weight}kg</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Depois */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-emerald-400">DEPOIS</span>
                                    <select
                                        value={selectedAfter?.id || ''}
                                        onChange={(e) => {
                                            const photo = data.photos.find(p => p.id === e.target.value);
                                            setSelectedAfter(photo || null);
                                        }}
                                        className="premium-input text-sm py-1"
                                    >
                                        {data.photos.map(photo => (
                                            <option key={photo.id} value={photo.id}>
                                                {new Date(photo.createdAt).toLocaleDateString('pt-BR')}
                                                {photo.weight ? ` - ${photo.weight}kg` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="aspect-[3/4] rounded-2xl bg-white/5 border border-emerald-500/20 overflow-hidden">
                                    {selectedAfter?.url ? (
                                        <img
                                            src={selectedAfter.url}
                                            alt="Depois"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Image className="w-16 h-16 text-slate-500 opacity-50" />
                                        </div>
                                    )}
                                </div>
                                {selectedAfter && (
                                    <div className="mt-3 text-center">
                                        <p className="text-sm text-muted">
                                            {new Date(selectedAfter.createdAt).toLocaleDateString('pt-BR')}
                                        </p>
                                        {selectedAfter.weight && (
                                            <p className="text-lg font-bold text-white">{selectedAfter.weight}kg</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Columns className="w-12 h-12 mx-auto mb-3 text-slate-500 opacity-50" />
                            <p className="text-muted">Adicione pelo menos 2 fotos para usar o comparativo</p>
                        </div>
                    )}

                    {/* Resultados do comparativo */}
                    {selectedBefore && selectedAfter && selectedBefore.weight && selectedAfter.weight && (
                        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-pink-500/10 border border-indigo-500/20">
                            <div className="flex items-center justify-center gap-8">
                                <div className="text-center">
                                    <p className="text-sm text-muted">Diferença</p>
                                    <p className="text-3xl font-bold text-emerald-400">
                                        -{(selectedBefore.weight - selectedAfter.weight).toFixed(1)}kg
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-muted">Período</p>
                                    <p className="text-xl font-semibold text-white">
                                        {Math.round((new Date(selectedAfter.createdAt).getTime() - new Date(selectedBefore.createdAt).getTime()) / (1000 * 60 * 60 * 24))} dias
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Modal de Upload */}
            {showUploadModal && (
                <UploadPhotoModal
                    patientId={params.id as string}
                    onClose={() => setShowUploadModal(false)}
                    onSuccess={() => {
                        setShowUploadModal(false);
                        fetchPhotos();
                    }}
                />
            )}
        </div>
    );
}

// Componente de seção de fotos
function PhotoSection({ title, photos, color }: { title: string; photos: Photo[]; color: string }) {
    const colorMap: any = {
        rose: 'border-rose-500/20',
        indigo: 'border-indigo-500/20',
        emerald: 'border-emerald-500/20'
    };

    return (
        <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map(photo => (
                    <div
                        key={photo.id}
                        className={`aspect-[3/4] rounded-xl bg-white/5 border ${colorMap[color]} overflow-hidden relative group`}
                    >
                        {photo.url ? (
                            <img
                                src={photo.url}
                                alt="Foto"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Image className="w-12 h-12 text-slate-500 opacity-50" />
                            </div>
                        )}

                        {/* Overlay com info */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-xs text-white">
                                {new Date(photo.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                            {photo.weight && (
                                <p className="text-sm font-bold text-white">{photo.weight}kg</p>
                            )}
                        </div>

                        {/* Badge de compartilhável */}
                        {photo.canShare && (
                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <Share2 className="w-3 h-3 text-emerald-400" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// Modal de upload de foto
function UploadPhotoModal({
    patientId,
    onClose,
    onSuccess
}: {
    patientId: string;
    onClose: () => void;
    onSuccess: () => void
}) {
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        type: 'PROGRESS',
        angle: 'FRONT',
        canShare: false
    });

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Por favor, selecione uma imagem');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('Arquivo muito grande (máximo 5MB)');
                return;
            }
            setSelectedFile(file);

            // Criar preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedFile) {
            alert('Por favor, selecione uma imagem');
            return;
        }

        setLoading(true);

        try {
            const uploadFormData = new FormData();
            uploadFormData.append('file', selectedFile);
            uploadFormData.append('type', formData.type);
            uploadFormData.append('angle', formData.angle);
            uploadFormData.append('canShare', formData.canShare.toString());

            const res = await fetch(`/api/patients/${patientId}/photos/upload`, {
                method: 'POST',
                body: uploadFormData
            });

            const data = await res.json();

            if (res.ok) {
                alert(data.message);
                onSuccess();
            } else {
                alert(data.error || 'Erro ao enviar foto');
            }
        } catch (error) {
            console.error('Erro no upload:', error);
            alert('Erro ao enviar foto. Verifique se o Supabase Storage está configurado.');
        }

        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="glass-card w-full max-w-md">
                <div className="p-6 border-b border-indigo-500/10">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Camera className="w-5 h-5 text-indigo-400" />
                        Adicionar Foto
                    </h2>
                    <p className="text-sm text-muted mt-1">Registre a evolução visual do paciente</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Área de upload */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Selecione a Imagem
                        </label>
                        <div
                            className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:border-indigo-500/50 transition-colors ${preview ? 'border-emerald-500/30' : 'border-white/10'
                                }`}
                            onClick={() => document.getElementById('file-input')?.click()}
                        >
                            {preview ? (
                                <div className="relative">
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="max-h-48 mx-auto rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedFile(null);
                                            setPreview(null);
                                        }}
                                        className="absolute top-0 right-0 w-6 h-6 bg-rose-500/80 rounded-full flex items-center justify-center text-white text-xs hover:bg-rose-500"
                                    >
                                        ×
                                    </button>
                                </div>
                            ) : (
                                <div className="py-8">
                                    <Upload className="w-10 h-10 mx-auto text-slate-500 mb-2" />
                                    <p className="text-sm text-slate-400">Clique para selecionar</p>
                                    <p className="text-xs text-muted mt-1">JPG, PNG ou WebP (max 5MB)</p>
                                </div>
                            )}
                            <input
                                id="file-input"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Tipo</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="premium-input w-full"
                            >
                                <option value="BEFORE">📸 Antes</option>
                                <option value="PROGRESS">📈 Progresso</option>
                                <option value="AFTER">🎉 Depois</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Ângulo</label>
                            <select
                                value={formData.angle}
                                onChange={(e) => setFormData({ ...formData, angle: e.target.value })}
                                className="premium-input w-full"
                            >
                                <option value="FRONT">Frontal</option>
                                <option value="SIDE">Lateral</option>
                                <option value="BACK">Costas</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                        <input
                            type="checkbox"
                            id="canShare"
                            checked={formData.canShare}
                            onChange={(e) => setFormData({ ...formData, canShare: e.target.checked })}
                            className="w-4 h-4 rounded"
                        />
                        <label htmlFor="canShare" className="text-sm text-slate-300">
                            Permitir uso desta foto para marketing (com anonimização)
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !selectedFile}
                            className="premium-button disabled:opacity-50"
                        >
                            {loading ? 'Enviando...' : 'Enviar Foto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
