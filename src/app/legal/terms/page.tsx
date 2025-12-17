
import Link from 'next/link';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-black text-white p-8 max-w-3xl mx-auto">
            <Link href="/" className="text-blue-500 hover:underline text-sm mb-8 block">← Voltar</Link>

            <h1 className="text-3xl font-bold mb-2">Termos de Uso</h1>
            <p className="text-zinc-500 text-sm mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

            <div className="prose prose-invert prose-zinc max-w-none space-y-6 text-zinc-300 leading-relaxed">
                <section>
                    <h2 className="text-xl font-semibold text-white">1. Aceitação dos Termos</h2>
                    <p>Ao acessar ou utilizar a plataforma RESET ("Plataforma"), você ("Usuário") concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar a Plataforma.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white">2. Descrição do Serviço</h2>
                    <p>A Plataforma RESET é uma ferramenta de acompanhamento de protocolos médicos e nutricionais. Ela oferece funcionalidades como visualização de protocolos, registro de progresso, galeria de fotos, e um assistente virtual baseado em Inteligência Artificial.</p>
                    <p className="font-semibold text-amber-400">⚠️ AVISO IMPORTANTE: A Plataforma NÃO substitui consulta médica, nutricional ou de qualquer outro profissional de saúde habilitado. Todas as orientações são de caráter informativo e educacional.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white">3. Isenção de Responsabilidade Médica</h2>
                    <p>O conteúdo disponibilizado na Plataforma, incluindo textos, imagens e respostas do Assistente de IA ("Coach IA"), tem propósito exclusivamente informativo. <strong>Não constitui aconselhamento médico, diagnóstico ou tratamento.</strong></p>
                    <p>Sempre consulte seu médico ou profissional de saúde qualificado antes de iniciar, alterar ou interromper qualquer tratamento, dieta ou programa de exercícios.</p>
                    <p>A Clínica Gurgel Carrilho e a Plataforma RESET não se responsabilizam por decisões de saúde tomadas pelo Usuário com base exclusivamente nas informações da Plataforma.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white">4. Uso da Inteligência Artificial</h2>
                    <p>O "Coach IA" é um assistente virtual alimentado por modelos de linguagem. Suas respostas são geradas automaticamente e podem conter imprecisões.</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>O Coach IA não é um profissional de saúde licenciado.</li>
                        <li>Não utilize as respostas do Coach IA como única fonte para decisões de saúde.</li>
                        <li>Em caso de emergência médica, contate serviços de emergência (SAMU 192).</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white">5. Propriedade Intelectual</h2>
                    <p>Todo o conteúdo da Plataforma, incluindo design, código, textos, marcas e logotipos, é propriedade exclusiva da Clínica Gurgel Carrilho ou de seus licenciadores. A reprodução, distribuição ou modificação sem autorização prévia é expressamente proibida.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white">6. Conta do Usuário</h2>
                    <p>O acesso à Plataforma é realizado mediante código único ("Código de Acesso") fornecido pela Clínica. O Usuário é responsável por manter a confidencialidade de seu código.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white">7. Modificações</h2>
                    <p>Reservamo-nos o direito de modificar estes Termos a qualquer momento. Notificaremos os usuários sobre alterações significativas.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white">8. Contato</h2>
                    <p>Para dúvidas sobre estes Termos, entre em contato: <a href="mailto:contato@clinicareset.com.br" className="text-blue-500 hover:underline">contato@clinicareset.com.br</a></p>
                </section>
            </div>

            <div className="mt-12 pt-8 border-t border-zinc-800 text-center text-zinc-600 text-sm">
                <p>© {new Date().getFullYear()} RESET by Clínica Gurgel Carrilho. Todos os direitos reservados.</p>
            </div>
        </div>
    );
}
