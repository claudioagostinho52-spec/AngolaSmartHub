import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Truck, Star, ShieldCheck, MapPin, Phone, 
  MessageSquare, UserCheck, TrendingUp, Calendar,
  ArrowLeft, Send, Check, PhoneCall, Video, 
  Mic, MicOff, VideoOff, MoreVertical, Search,
  Clock, Package, Award, CheckCircle2, X
} from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { cn } from '../lib/utils.ts';

// Mock Carrier Data with more details for Dashboard
const CARRIERS: Record<string, any> = {
  'TR-001': {
    id: 'TR-001',
    name: 'António Joaquim',
    type: 'Individual',
    vehicle: 'Camião pequeno',
    capacity: '5 toneladas',
    price: '450',
    priceType: 'km',
    location: 'Huambo (Caála)',
    rating: 4.8,
    reliability: 98,
    status: 'verified',
    image: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=400&h=400&auto=format&fit=crop',
    experence: '8 anos',
    totalDeliveries: 124,
    plates: 'LD-44-22-AG',
    joined: 'Jan 2024'
  }
};

export function CarrierDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const carrier = CARRIERS[id as string] || CARRIERS['TR-001'];
  
  const [activeTab, setActiveTab] = useState<'info' | 'chat' | 'history'>('info');
  const [isCalling, setIsCalling] = useState(false);
  const [callTime, setCallTime] = useState(0);
  const [callMuted, setCallMuted] = useState(false);
  const [callVideo, setCallVideo] = useState(true);

  // Chat State
  const [messages, setMessages] = useState([
    { id: 1, text: 'Olá! Estou disponível para transporte na rota Huambo - Luanda.', sender: 'carrier', time: '09:00' },
    { id: 2, text: 'Tem espaço para 3 toneladas de milho?', sender: 'user', time: '09:05' },
    { id: 3, text: 'Sim, claro! Consigo fazer o carregamento amanhã cedo.', sender: 'carrier', time: '09:06' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  useEffect(() => {
    let interval: any;
    if (isCalling) {
      interval = setInterval(() => setCallTime(prev => prev + 1), 1000);
    } else {
      setCallTime(0);
    }
    return () => clearInterval(interval);
  }, [isCalling]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMsg = { id: Date.now(), text: newMessage, sender: 'user', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages([...messages, userMsg]);
    setNewMessage('');

    // Simulate real-time reply
    setTimeout(() => {
      const reply = { id: Date.now() + 1, text: 'Perfeito. Pode enviar os dados da localização exata do armazém?', sender: 'carrier', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setMessages(prev => [...prev, reply]);
    }, 2000);
  };

  return (
    <div className="pt-24 pb-20 px-4 min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="mb-8 flex items-center gap-2 text-gray-400 hover:text-primary-dark transition-colors font-bold text-sm uppercase tracking-widest"
        >
          <ArrowLeft size={18} /> Voltar ao Directório
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Carrier Main Info */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white dark:bg-dark-card rounded-[48px] p-8 shadow-xl border border-gray-100 dark:border-dark-border overflow-hidden relative group">
               <div className="absolute top-0 left-0 w-full h-32 bg-primary-green opacity-10" />
               <div className="relative z-10 flex flex-col items-center text-center pt-8">
                  <div className="relative mb-6">
                    <img src={carrier.image} alt={carrier.name} className="w-40 h-40 rounded-[48px] object-cover ring-8 ring-white dark:ring-dark-card shadow-2xl" />
                    <div className="absolute -bottom-2 -right-2 bg-primary-green text-white p-3 rounded-full border-4 border-white dark:border-dark-card">
                       <ShieldCheck size={24} />
                    </div>
                  </div>
                  <h1 className="text-3xl font-bold dark:text-dark-text mb-2 font-display">{carrier.name}</h1>
                  <div className="flex items-center gap-2 text-primary-green font-bold text-sm uppercase tracking-widest mb-6">
                     <Award size={16} /> Transportador Verificado
                  </div>
                  
                  <div className="flex items-center gap-1.5 mb-8">
                    {[1, 2, 3, 4, 5].map(s => (
                       <Star key={s} size={20} className={cn(s <= Math.floor(carrier.rating) ? "text-amber-500 fill-amber-500" : "text-gray-200")} />
                    ))}
                    <span className="font-bold ml-2 dark:text-dark-text">{carrier.rating}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 w-full mb-8">
                     <div className="bg-gray-50 dark:bg-dark-bg p-4 rounded-3xl border border-gray-100 dark:border-dark-border">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Entregas</p>
                        <p className="text-xl font-bold dark:text-dark-text">{carrier.totalDeliveries}</p>
                     </div>
                     <div className="bg-gray-50 dark:bg-dark-bg p-4 rounded-3xl border border-gray-100 dark:border-dark-border">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Fiabilidade</p>
                        <p className="text-xl font-bold text-primary-green">{carrier.reliability}%</p>
                     </div>
                  </div>

                  <div className="flex gap-4 w-full">
                    <button 
                      onClick={() => setIsCalling(true)}
                      className="flex-1 bg-primary-dark dark:bg-primary-green text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-xl shadow-primary-dark/20"
                    >
                       Ligar <Phone size={18} />
                    </button>
                    <button 
                      onClick={() => setActiveTab('chat')}
                      className="flex-1 bg-white border border-gray-100 dark:border-dark-border dark:bg-dark-bg text-primary-dark dark:text-dark-text py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
                    >
                       Chat <MessageSquare size={18} />
                    </button>
                  </div>
               </div>
            </div>

            <div className="bg-white dark:bg-dark-card rounded-[40px] p-8 shadow-xl border border-gray-100 dark:border-dark-border">
               <h3 className="font-bold text-xl mb-6 dark:text-dark-text">Detalhes Operacionais</h3>
               <div className="space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                        <Truck size={24} />
                     </div>
                     <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Veículo & Matrícula</p>
                        <p className="font-bold dark:text-dark-text">{carrier.vehicle} • {carrier.plates}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                        <Package size={24} />
                     </div>
                     <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Capacidade Máxima</p>
                        <p className="font-bold dark:text-dark-text">{carrier.capacity}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                        <Clock size={24} />
                     </div>
                     <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Experiência</p>
                        <p className="font-bold dark:text-dark-text">{carrier.experence} de actividade</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Right Column: Dashboard Tabs & Interactive Content */}
          <div className="lg:col-span-8 space-y-8">
             <div className="bg-white dark:bg-dark-card rounded-[40px] shadow-xl border border-gray-100 dark:border-dark-border overflow-hidden">
                <div className="flex border-b border-gray-50 dark:border-dark-border">
                   {[
                     { id: 'info', label: 'Dashboard & Info', icon: TrendingUp },
                     { id: 'chat', label: 'Mensagens em Tempo Real', icon: MessageSquare },
                     { id: 'history', label: 'Histórico de Entregas', icon: Clock }
                   ].map(tab => (
                     <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={cn(
                        "flex-1 py-6 flex items-center justify-center gap-2 font-bold transition-all border-b-2",
                        activeTab === tab.id 
                          ? "text-primary-green border-primary-green bg-green-50/30 dark:bg-primary-green/5" 
                          : "text-gray-400 border-transparent hover:text-gray-600"
                      )}
                     >
                       <tab.icon size={18} />
                       <span className="hidden sm:inline">{tab.label}</span>
                     </button>
                   ))}
                </div>

                <div className="p-8">
                   <AnimatePresence mode="wait">
                      {activeTab === 'info' && (
                        <motion.div key="info" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="p-8 rounded-[32px] bg-primary-dark text-white relative overflow-hidden group">
                                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary-green/20 rounded-full blur-[40px] group-hover:scale-150 transition-transform duration-700" />
                                 <h4 className="text-3xl font-display mb-2">Resumo Mensal</h4>
                                 <p className="text-gray-400 text-sm mb-6">Relação de envios garantidos este mês</p>
                                 <div className="flex items-end gap-2">
                                    <span className="text-5xl font-bold">14</span>
                                    <span className="text-primary-green font-bold text-sm mb-2">+2 este mês</span>
                                 </div>
                              </div>
                              <div className="p-8 rounded-[32px] bg-white dark:bg-dark-bg border border-gray-100 dark:border-dark-border">
                                 <h4 className="text-xl font-bold dark:text-dark-text mb-4">Métricas de Serviço</h4>
                                 <div className="space-y-4">
                                    <div className="space-y-2">
                                       <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                                          <span>Entregas no Prazo</span>
                                          <span className="text-primary-green">96%</span>
                                       </div>
                                       <div className="h-2 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
                                          <div className="w-[96%] bg-primary-green h-full" />
                                       </div>
                                    </div>
                                    <div className="space-y-2">
                                       <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                                          <span>Segurança de Carga</span>
                                          <span className="text-blue-500">100%</span>
                                       </div>
                                       <div className="h-2 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
                                          <div className="w-full bg-blue-500 h-full" />
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div>
                              <h4 className="font-bold text-xl mb-6 dark:text-dark-text">Documentação & Selos</h4>
                              <div className="flex flex-wrap gap-4">
                                 {[
                                   { label: 'Selo de Identidade', color: 'bg-blue-100 text-blue-600', icon: UserCheck },
                                   { label: 'Viatura Inspecionada', color: 'bg-green-100 text-green-600', icon: ShieldCheck },
                                   { label: 'Carga Segura', color: 'bg-amber-100 text-amber-600', icon: Award },
                                   { label: 'GPS Activo', color: 'bg-purple-100 text-purple-600', icon: MapPin },
                                 ].map((tag, i) => (
                                   <div key={i} className={cn("px-6 py-3 rounded-2xl flex items-center gap-3 font-bold text-xs", tag.color)}>
                                      <tag.icon size={16} />
                                      {tag.label}
                                   </div>
                                 ))}
                              </div>
                           </div>
                        </motion.div>
                      )}

                      {activeTab === 'chat' && (
                        <motion.div key="chat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col h-[500px]">
                           <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-4 mb-6">
                              {messages.map(msg => (
                                <div key={msg.id} className={cn("flex flex-col", msg.sender === 'user' ? "items-end" : "items-start")}>
                                   <div className={cn(
                                     "max-w-[80%] p-4 rounded-3xl text-sm font-medium shadow-sm",
                                     msg.sender === 'user' 
                                       ? "bg-primary-dark text-white rounded-tr-none" 
                                       : "bg-gray-100 dark:bg-dark-bg text-gray-700 dark:text-dark-text rounded-tl-none"
                                   )}>
                                      {msg.text}
                                   </div>
                                   <span className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tighter">{msg.time}</span>
                                </div>
                              ))}
                              <div ref={chatEndRef} />
                           </div>

                           <form onSubmit={handleSendMessage} className="relative">
                              <input 
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Escreva aqui para conversar em tempo real..." 
                                className="w-full pl-6 pr-16 py-5 rounded-3xl bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border focus:outline-none focus:border-primary-green dark:text-dark-text shadow-inner"
                              />
                              <button type="submit" className="absolute right-3 top-3 w-12 h-12 bg-primary-green text-white rounded-2xl flex items-center justify-center hover:bg-green-700 transition-all shadow-lg shadow-green-900/20">
                                 <Send size={20} />
                              </button>
                           </form>
                        </motion.div>
                      )}

                      {activeTab === 'history' && (
                        <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                           {[
                             { id: 'DEL-1021', route: 'Malanje → Luanda', date: '21 Abr, 2026', weight: '4.2 Toneladas', status: 'delivered' },
                             { id: 'DEL-1020', route: 'Huambo → Benguela', date: '18 Abr, 2026', weight: '2.0 Toneladas', status: 'delivered' },
                             { id: 'DEL-1018', route: 'Luanda → Huambo', date: '14 Abr, 2026', weight: '5.0 Toneladas', status: 'delivered' },
                           ].map((item, i) => (
                             <div key={i} className="p-6 rounded-3xl bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                   <div className="w-12 h-12 bg-white dark:bg-dark-card rounded-2xl flex items-center justify-center text-primary-green/40 shadow-sm">
                                      <CheckCircle2 size={24} />
                                   </div>
                                   <div>
                                      <h5 className="font-bold text-sm dark:text-dark-text">{item.route}</h5>
                                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.date} • {item.weight}</p>
                                   </div>
                                </div>
                                <span className="text-[10px] font-bold text-primary-green uppercase tracking-widest bg-green-50 dark:bg-primary-green/10 px-3 py-1 rounded-lg">Sucesso</span>
                             </div>
                           ))}
                        </motion.div>
                      )}
                   </AnimatePresence>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Real-Time Call Interface */}
      <AnimatePresence>
         {isCalling && (
           <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-primary-dark/95 backdrop-blur-3xl"
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative w-full max-w-lg bg-white/5 backdrop-blur-md rounded-[56px] border border-white/10 p-12 text-center"
             >
                <div className="mb-12">
                   <div className="relative inline-block mb-8">
                     <img src={carrier.image} alt={carrier.name} className="w-48 h-48 rounded-[56px] object-cover ring-4 ring-primary-green shadow-3xl" />
                     <div className="absolute -bottom-2 -left-2 bg-primary-green text-white px-4 py-1 rounded-full text-xs font-bold animate-pulse">
                        Chamada Activa
                     </div>
                   </div>
                   <h2 className="text-4xl font-bold text-white mb-2 font-display">{carrier.name}</h2>
                   <p className="text-primary-green font-bold text-lg tracking-widest uppercase">{formatTime(callTime)}</p>
                </div>

                <div className="flex items-center justify-center gap-6 mb-12">
                   <button onClick={() => setCallMuted(!callMuted)} className={cn("w-16 h-16 rounded-full flex items-center justify-center transition-all", callMuted ? "bg-white text-primary-dark" : "bg-white/10 text-white hover:bg-white/20")}>
                      {callMuted ? <MicOff size={28} /> : <Mic size={28} />}
                   </button>
                   <button onClick={() => setCallVideo(!callVideo)} className={cn("w-16 h-16 rounded-full flex items-center justify-center transition-all", !callVideo ? "bg-white text-primary-dark" : "bg-white/10 text-white hover:bg-white/20")}>
                      {callVideo ? <Video size={28} /> : <VideoOff size={28} />}
                   </button>
                   <button className="w-16 h-16 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all">
                      <MoreVertical size={28} />
                   </button>
                </div>

                <button 
                  onClick={() => setIsCalling(false)}
                  className="w-full py-6 bg-red-500 text-white rounded-[24px] font-bold text-xl flex items-center justify-center gap-3 hover:bg-red-600 transition-all shadow-2xl shadow-red-500/30"
                >
                   Finalizar Chamada <X size={24} />
                </button>
             </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
}
