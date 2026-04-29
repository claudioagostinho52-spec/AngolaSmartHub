import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, ShieldCheck, Truck, UserCheck, 
  BarChart3, Globe, ArrowRight, Star, Quote,
  ChevronRight, Play, X, Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils.ts';
import { useAuth } from '../contexts/AuthContext.tsx';

const FEATURES = [
  // ... (keeping FEATURES as is)
];

// Re-defining features to avoid import issues if they were missing or changed
const FEATURES_LIST = [
  {
    title: 'AgroSmart Market',
    desc: 'Compre diretamente de produtores locais em todo o país.',
    icon: ShoppingBag,
    color: 'bg-green-100 text-green-700',
    path: '/market'
  },
  {
    title: 'Logística Inteligente',
    desc: 'Gestão eficiente de transporte de mercadorias agrícolas.',
    icon: Truck,
    color: 'bg-blue-100 text-blue-700',
    path: '/logistics'
  },
  {
    title: 'Cidadão Express',
    desc: 'Formalize o seu negócio e tenha acesso a serviços públicos.',
    icon: UserCheck,
    color: 'bg-orange-100 text-orange-700',
    path: '/services'
  },
  {
    title: 'Rastreabilidade',
    desc: 'Conheça a origem de cada produto através de QR Codes.',
    icon: ShieldCheck,
    color: 'bg-purple-100 text-purple-700',
    path: '/traceability'
  }
];

const STATS = [
  { label: 'Produtores Registados', value: '12,500+' },
  { label: 'Entregas Concluídas', value: '45,000+' },
  { label: 'Províncias Atendidas', value: '18' },
];

export function Home() {
  const { user } = useAuth();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'success'>('idle');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterStatus('success');
    setTimeout(() => {
      setNewsletterStatus('idle');
      setNewsletterEmail('');
    }, 5000);
  };

  return (
    <div className="flex flex-col bg-white">
      {/* Video Modal */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute inset-0 bg-primary-dark/90 backdrop-blur-xl" 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative aspect-video w-full max-w-5xl bg-black rounded-[40px] overflow-hidden shadow-2xl border border-white/10"
            >
               <button 
                onClick={() => setIsVideoModalOpen(false)}
                className="absolute top-6 right-6 p-2 bg-white/10 text-white rounded-full z-10 hover:bg-white/20 transition-colors"
               >
                 <X size={24} />
               </button>
               <img 
                src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=2000" 
                className="w-full h-full object-cover opacity-80" 
                alt="Explainer video"
               />
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-24 h-24 bg-primary-green rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-900/50 cursor-pointer hover:scale-110 transition-transform">
                      <Play size={40} fill="white" />
                    </div>
                    <h3 className="text-3xl font-bold mb-2">Vídeo Institucional</h3>
                    <p className="text-white/60">Descubra como o Angola Smart Hub está a moldar o futuro.</p>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center pt-24 overflow-hidden bg-primary-dark">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-dark via-primary-dark/80 to-transparent z-10" />
          <img 
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover opacity-60 scale-105"
            alt="Agriculture background"
          />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl lg:text-7xl text-white mb-6 leading-tight font-display">
              Do Campo ao <span className="text-primary-green">Mercado</span>.<br />
              Do Cidadão ao <span className="text-primary-green">Progresso</span>.
            </h1>
            <p className="text-gray-300 text-lg lg:text-xl mb-10 max-w-xl leading-relaxed">
              A plataforma digital que integra agricultura, logística e serviços públicos 
              para transformar a economia de Angola.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to={user ? "/market" : "/login"} 
                className="bg-primary-green text-white px-8 py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-3 hover:bg-green-700 transition-all shadow-xl shadow-green-900/30"
              >
                {user ? "Explorar Mercado" : "Começar Agora"} <ArrowRight size={20} />
              </Link>
              {!user && (
                <Link 
                  to="/register"
                  className="bg-white/10 text-white backdrop-blur-md px-8 py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-3 hover:bg-white/20 transition-all border border-white/20"
                >
                  Criar Conta <ChevronRight size={18} />
                </Link>
              )}
              {user && (
                <button 
                  onClick={() => setIsVideoModalOpen(true)}
                  className="bg-white/10 text-white backdrop-blur-md px-8 py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-3 hover:bg-white/20 transition-all border border-white/20"
                >
                  Ver Demo <Play size={18} />
                </button>
              )}
            </div>
          </motion.div>
          {/* ... (keeping rest of hero as is) */}

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="hidden lg:flex justify-end"
          >
            <div className="relative w-[500px] h-[500px]">
              <div className="absolute inset-0 bg-primary-green/20 rounded-full blur-[100px]" />
              <img 
                src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800" 
                className="w-full h-full object-cover rounded-[60px] shadow-2xl skew-y-3 hover:skew-y-0 transition-transform duration-700 relative z-10 border-4 border-white/10"
                alt="Agricultural logistics"
              />
              <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-3xl shadow-2xl z-20 max-w-[200px]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg text-green-700">
                    <BarChart3 size={24} />
                  </div>
                  <span className="font-bold text-2xl">450kz</span>
                </div>
                <p className="text-gray-500 text-xs font-medium">Preço médio Milho/Kg em Huambo</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-3 gap-8">
          {STATS.map((stat, idx) => (
            <div key={idx} className="text-center">
              <h3 className="text-3xl lg:text-4xl font-display font-bold text-primary-dark mb-1">{stat.value}</h3>
              <p className="text-gray-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Modules Section */}
      <section className="py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl mb-4">Soluções <span className="text-primary-green">Integradas</span></h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
              Desenvolvemos um ecossistema completo para apoiar toda a cadeia de valor 
              agrícola, desde o pequeno produtor até a grande indústria.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {FEATURES_LIST.map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 hover:shadow-xl transition-all"
              >
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6", feature.color)}>
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl mb-3 font-bold text-primary-dark">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium">
                  {feature.desc}
                </p>
                <Link 
                  to={user ? feature.path : "/login"}
                  className="inline-flex items-center gap-2 text-primary-green font-bold group"
                >
                  {user ? "Aceder Agora" : "Saber mais"} <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission / Context Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800" 
              className="rounded-[40px] shadow-2xl relative z-10"
              alt="Local Market"
            />
            <div className="absolute -top-10 -right-10 bg-primary-green text-white p-10 rounded-[40px] shadow-2xl z-20 hidden md:block max-w-[280px]">
              <Quote className="mb-4 opacity-50" size={32} />
              <p className="font-medium italic leading-relaxed">
                "Esta plataforma mudou a forma como vendo a minha produção. Antes dependia 100% de revendedores."
              </p>
              <div className="mt-6">
                <p className="font-bold">João Francisco</p>
                <p className="text-sm opacity-80">Agricultor em Malanje</p>
              </div>
            </div>
          </div>

          <div>
            <span className="text-primary-green font-bold tracking-widest uppercase text-sm mb-4 block">O Nosso Propósito</span>
            <h2 className="text-4xl lg:text-5xl mb-8 leading-tight">
              Facilitando a <span className="text-primary-green">Conversão</span> do Sector Informal.
            </h2>
            <div className="space-y-6">
              {[
                { title: 'Digitalização Total', d: 'Transformamos processos burocráticos em cliques.' },
                { title: 'Transparência de Preços', d: 'Eliminamos a especulação com dados reais de mercado.' },
                { title: 'Soberania Alimentar', d: 'Conectamos a produção nacional de forma directa.' },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="mt-1 w-6 h-6 rounded-full bg-primary-green flex items-center justify-center text-white shrink-0">
                    <ChevronRight size={14} strokeWidth={4} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-1">{item.title}</h4>
                    <p className="text-gray-500 leading-relaxed text-sm">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <Link to="/about" className="bg-primary-dark text-white px-8 py-4 rounded-xl font-bold inline-flex items-center gap-3 hover:bg-gray-800 transition-all">
                Conheça o Nosso Roadmap
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto rounded-[60px] bg-primary-green p-16 lg:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-green-900/30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-[100px] -ml-48 -mb-48" />
          
          <div className="relative z-10">
            <h2 className="text-4xl lg:text-6xl mb-8">Pronto para digitalizar o seu negócio agrícola?</h2>
            <p className="text-white/80 text-xl lg:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed">
              Junte-se a milhares de angolanos que já estão a lucrar com a tecnologia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="bg-white text-primary-green px-10 py-5 rounded-2xl text-xl font-bold hover:bg-gray-100 transition-all shadow-xl">
                Criar Conta Grátis
              </Link>
              <Link to="/contact" className="bg-primary-dark text-white px-10 py-5 rounded-2xl text-xl font-bold hover:bg-black/40 transition-all border border-white/20">
                Falar com Consultor
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
