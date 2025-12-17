import { prisma } from '@/lib/prisma';
import ProtocolEditor from '@/components/protocol/ProtocolEditor';


export default async function ProtocolPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch existing protocol
    const patient = await prisma.patient.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            protocol: true
        }
    });

    if (!patient) {
        return <div className="p-8 text-white">Paciente não encontrado.</div>;
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="max-w-5xl mx-auto p-6 space-y-8">
                <header>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                        Protocolo Médico
                    </h1>
                    <p className="text-gray-400">
                        Paciente: <span className="text-blue-500">{patient.name}</span>
                    </p>
                </header>

                <ProtocolEditor
                    patientId={patient.id}
                    initialProtocol={patient.protocol}
                />
            </div>
        </div>
    );
}
