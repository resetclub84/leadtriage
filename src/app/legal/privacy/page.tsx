
import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-black text-white p-8 max-w-3xl mx-auto">
            <Link href="/" className="text-blue-500 hover:underline text-sm mb-8 block">← Voltar</Link>

            <h1 className="text-3xl font-bold mb-2">Política de Privacidade</h1>
            <p className="text-zinc-500 text-sm mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')} | Em conformidade com a LGPD (Lei 13.709/2018)</p>

            <div className="prose prose-invert prose-zinc max-w-none space-y-6 text-zinc-300 leading-relaxed">
                <section>
                    <h2 className="text-xl font-semibold text-white">1. Controlador dos Dados</h2>
                    <p>A Clínica Gurgel Carrilho ("Controlador") é responsável pelo tratamento dos dados pessoais coletados através da Plataforma RESET.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white">2. Dados Coletados</h2>
                    <p>Para fornecer nossos serviços, coletamos:</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li><strong>Dados de Identificação:</strong> Nome, e-mail, telefone, CPF (opcional), data de nascimento.</li>
                        <li><strong>Dados de Saúde:</strong> Peso, altura, objetivos de saúde, protocolos médicos, fotos de progresso.</li>
                        <li><strong>Dados de Uso:</strong> Interações com a plataforma, check-ins, mensagens ao Coach IA.</li>
                        <li><strong>Dados Técnicos:</strong> Endereço IP, tipo de dispositivo, logs de acesso.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white">3. Finalidade do Tratamento</h2>
                    <p>Utilizamos seus dados para:</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Prestação dos serviços de acompanhamento de saúde.</li>
                        <li>Personalização de protocolos e comunicações.</li>
                        <li>Melhoria contínua da Plataforma.</li>
                        <li>Cumprimento de obrigações legais.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white">4. Base Legal (LGPD)</h2>
                    <p>O tratamento de dados é realizado com base em:</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li><strong>Consentimento:</strong> Para dados de saúde e fotos.</li>
                        <li><strong>Execução de Contrato:</strong> Para prestação do serviço.</li>
                        <li><strong>Interesse Legítimo:</strong> Para melhorias e segurança.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white">5. Compartilhamento de Dados</h2>
                    <p>Seus dados podem ser compartilhados com:</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li><strong>Profissionais de Saúde:</strong> Médicos e nutricionistas vinculados à Clínica.</li>
                        <li><strong>Prestadores de Serviço:</strong> Supabase (armazenamento), Google (IA Gemini), Vercel (hospedagem).</li>
                        <li><strong>Autoridades:</strong> Quando exigido por lei.</li>
                    </ul>
                    <p className="text-amber-400">Nunca vendemos seus dados a terceiros para fins de marketing.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white">6. Seus Direitos (LGPD Art. 18)</h2>
                    <p>Você tem direito a:</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Confirmar a existência de tratamento.</li>
                        <li>Acessar seus dados.</li>
                        <li>Corrigir dados incompletos ou desatualizados.</li>
                        <li>Solicitar anonimização, bloqueio ou eliminação.</li>
                        <li>Revogar consentimento.</li>
                    </ul>
                    <p>Para exercer seus direitos, contate: <a href="mailto:privacidade@clinicareset.com.br" className="text-blue-500 hover:underline">privacidade@clinicareset.com.br</a></p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white">7. Retenção de Dados</h2>
                    <p>Mantemos seus dados pelo tempo necessário para cumprir as finalidades ou conforme exigido por lei (ex: prontuários médicos por 20 anos).</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white">8. Segurança</h2>
                    <p>Empregamos medidas técnicas e organizacionais para proteger seus dados, incluindo criptografia e controle de acesso.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white">9. Encarregado de Dados (DPO)</h2>
                    <p>Para questões de privacidade, contate nosso Encarregado: <a href="mailto:dpo@clinicareset.com.br" className="text-blue-500 hover:underline">dpo@clinicareset.com.br</a></p>
                </section>
            </div>

            <div className="mt-12 pt-8 border-t border-zinc-800 text-center text-zinc-600 text-sm">
                <p>© {new Date().getFullYear()} RESET by Clínica Gurgel Carrilho. Todos os direitos reservados.</p>
            </div>
        </div>
    );
}
