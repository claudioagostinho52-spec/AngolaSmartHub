import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, Shield, Lock, Eye, Share2, ClipboardList, Clock, Mail, Phone, MapPin, Globe } from 'lucide-react';

export function PrivacyPolicy() {
  const navigate = useNavigate();

  const sections = [
    {
      id: 1,
      title: "Introdução",
      icon: Globe,
      content: "O Angola Smart Hub (ASH) é uma plataforma digital soberana de Angola, dedicada a impulsionar o agronegócio nacional. A plataforma integra serviços de marketplace agrícola, logística inteligente, bolsa de preços nacional, rastreabilidade alimentar e serviços públicos digitais através do módulo Cidadão Express."
    },
    {
      id: 2,
      title: "Dados Coletados",
      icon: ClipboardList,
      content: "Coletamos dados essenciais para o funcionamento seguro da plataforma, incluindo: Nome completo, endereço de email, número de telefone (+244), localização geográfica (freguesia, município e província), coordenadas GPS (para fazendas e entregas), dados de identificação nacional (BI e NIF para produtores verificados), fotografias de produtos e documentos de formalização carregados voluntariamente."
    },
    {
      id: 3,
      title: "Finalidade do Uso dos Dados",
      icon: Eye,
      content: "Os seus dados são utilizados para: Autenticação segura e gestão de conta; Verificação e formalização de identidades de produtores; Processamento de transações comerciais; Otimização de rotas logísticas e rastreamento de entregas; Prevenção de fraude e atividades ilícitas; e Geração de estatísticas agregadas para melhoria da oferta nacional."
    },
    {
      id: 4,
      title: "Partilha de Dados",
      icon: Share2,
      content: "A partilha de dados ocorre estritamente de forma funcional: Dados de entrega são partilhados com transportadores selecionados; Detalhes de contacto são partilhados entre comprador e vendedor após confirmação de negócio; Documentos de formalização são partilhados com entidades públicas parceiras através do Cidadão Express apenas sob sua autorização."
    },
    {
      id: 5,
      title: "Segurança e Proteção",
      icon: Lock,
      content: "Implementamos protocolos de segurança de nível bancário, incluindo encriptação de dados em repouso e em trânsito (SSL/TLS), firewalls avançadas e sistemas de monitorização de intrusões. As suas senhas são armazenadas utilizando algoritmos de hashing irreversíveis."
    },
    {
      id: 6,
      title: "Os Seus Direitos",
      icon: Shield,
      content: "De acordo com a Lei de Proteção de Dados Pessoais de Angola, o utilizador tem o direito de: Aceder aos seus dados armazenados; Solicitar a retificação imediata de informações incorretas; Solicitar a eliminação definitiva da sua conta; e Revogar o consentimento de processamento de dados a qualquer momento."
    },
    {
      id: 7,
      title: "Cookies e Sessão",
      icon: ClipboardList,
      content: "Utilizamos cookies técnicos essenciais para manter a sua sessão ativa e cookies analíticos anónimos para compreender o tráfego da plataforma. Pode gerir as preferências de cookies através das definições do seu navegador."
    },
    {
      id: 8,
      title: "Retenção de Dados",
      icon: Clock,
      content: "Mantemos os seus dados apenas pelo período estritamente necessário para cumprir as finalidades descritas ou conforme exigido pelas obrigações legais e fiscais vigentes na República de Angola."
    },
    {
      id: 9,
      title: "Alterações na Política",
      icon: ClipboardList,
      content: "Esta política pode ser atualizada periodicamente para refletir mudanças regulatórias ou novas funcionalidades. Notificaremos os utilizadores sobre alterações significativas através da plataforma ou via email."
    },
    {
      id: 10,
      title: "Contactos Oficiais",
      icon: Mail,
      content: "Para questões relacionadas com a sua privacidade, contacte a nossa equipa de Proteção de Dados: \nEmail: privacidade@smarthub.ao \nTelefone: +244 945 000 000 \nEndereço: Luanda, Edifício Inovação, Talatona."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 lg:px-24">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-primary-dark font-bold uppercase tracking-widest text-xs mb-12 transition-all group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Voltar
        </button>

        <header className="mb-16">
          <div className="w-16 h-16 bg-primary-green/10 text-primary-green rounded-[24px] flex items-center justify-center mb-6">
            <Shield size={32} />
          </div>
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-primary-dark mb-4">Política de Privacidade</h1>
          <p className="text-gray-500 font-medium text-lg">Atualizada em 29 de Abril de 2026</p>
        </header>

        <div className="space-y-12">
          {sections.map((section) => (
            <section key={section.id} className="bg-white p-8 lg:p-12 rounded-[40px] shadow-sm border border-gray-100 transition-all hover:shadow-md">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-gray-50 text-primary-green flex items-center justify-center">
                  <section.icon size={20} />
                </div>
                <h2 className="text-xl font-bold text-primary-dark">{section.id}. {section.title}</h2>
              </div>
              <p className="text-gray-600 leading-relaxed font-medium whitespace-pre-line">
                {section.content}
              </p>
            </section>
          ))}
        </div>

        <footer className="mt-20 pt-12 border-t border-gray-200 text-center">
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-8">
            Ao utilizar a plataforma, o usuário declara que leu e compreendeu esta Política de Privacidade.
          </p>
          <div className="flex justify-center gap-8">
             <span className="text-xs text-gray-300 font-bold">ANGOLA SMART HUB © 2026</span>
             <span className="text-xs text-gray-300 font-bold">SOBERANIA ALIMENTAR</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
