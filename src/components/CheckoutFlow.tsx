import React, { useState } from 'react';
import { 
  Truck, User, MessageSquare, Search, 
  CheckCircle2, ChevronLeft, MapPin, 
  Star, Phone, ShieldCheck, Clock,
  ChevronRight, Send, X, Video
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils.ts';

const MOCK_CARRIERS = [
  { id: 1, name: 'TransAngola Logística', rating: 4.8, trips: 1240, type: 'Pesados', price: 'Sob Consulta', distance: '12km de Luanda', active: true },
  { id: 2, name: 'Expresso Planalto', rating: 4.9, trips: 850, type: 'Refrigerado', price: 'Negociável', distance: '5km do Huambo', active: true },
  { id: 3, name: 'Camiões do Sul', rating: 4.7, trips: 2100, type: 'Carga Geral', price: 'Tabela Fixa', distance: 'Lubango Central', active: true },
  { id: 4, name: 'EcoTrans Agro', rating: 4.5, trips: 430, type: 'Ligeiros', price: 'Económico', distance: 'Cuanza Sul', active: false },
];

interface CheckoutFlowProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: any[];
  onSuccess: () => void;
}

export function CheckoutFlow({ isOpen, onClose, cartItems, onSuccess }: CheckoutFlowProps) {
  const [step, setStep] = useState<'selection' | 'carriers' | 'chat_carrier' | 'chat_seller' | 'success'>('selection');
  const [selectedCarrier, setSelectedCarrier] = useState<any>(null);
  const [negotiationMessage, setNegotiationMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);

  const cartTotal = cartItems.reduce((acc, item) => acc + (item.price || 0), 0);

  const handleSendMessage = () => {
    if (!negotiationMessage.trim()) return;
    const newMessage = { text: negotiationMessage, sender: 'me', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatHistory([...chatHistory, newMessage]);
    setNegotiationMessage('');
    
    // Simulate response
    setTimeout(() => {
      const response = { 
        text: step === 'chat_carrier' 
          ? `Olá! Sim, temos disponibilidade para essa rota. Podemos fazer por um valor competitivo. Quantos kg seriam?` 
          : `Olá, o meu armazém está pronto para recolha. Quando pretende vir buscar a carga?`, 
        sender: 'other', 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      };
      setChatHistory(prev => [...prev, response]);
    }, 1500);
  };

  const resetFlow = () => {
    setStep('selection');
    setSelectedCarrier(null);
    setChatHistory([]);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-primary-dark/60 backdrop-blur-md"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white w-full max-w-4xl rounded-[48px] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[80vh] max-h-[800px]"
        >
          {/* Left Panel: Summary (Desktop) */}
          <div className="hidden md:flex w-1/3 bg-gray-50 p-10 flex-col border-r border-gray-100">
            <h3 className="text-xl font-bold mb-8">Resumo da Encomenda</h3>
            <div className="flex-1 space-y-4 overflow-y-auto">
              {cartItems.map((item, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <img src={item.image} className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <p className="text-xs font-bold leading-none">{item.name}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{item.producerName}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-xs">Itens ({cartItems.length})</span>
                <span className="font-bold text-sm">{cartTotal.toLocaleString()} kz</span>
              </div>
              <div className="flex justify-between items-center text-primary-green">
                <span className="text-xs font-bold uppercase tracking-widest">Total</span>
                <span className="text-xl font-bold">{cartTotal.toLocaleString()} kz</span>
              </div>
            </div>
          </div>

          {/* Right Panel: Active Flow */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            {/* Header */}
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {step !== 'selection' && (
                  <button 
                    onClick={() => step === 'carriers' ? setStep('selection') : setStep('carriers')}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}
                <h2 className="text-2xl font-bold font-display">
                  {step === 'selection' && 'Opções de Entrega'}
                  {step === 'carriers' && 'Escolher Transportadora'}
                  {step === 'chat_carrier' && 'Negociar Frete'}
                  {step === 'chat_seller' && 'Combinar Recolha'}
                  {step === 'success' && 'Tudo Pronto!'}
                </h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-8">
              {step === 'selection' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-full items-center">
                  <motion.button
                    whileHover={{ y: -5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep('carriers')}
                    className="flex flex-col items-center text-center p-10 rounded-[40px] border-2 border-primary-green/20 hover:border-primary-green bg-primary-green/5 transition-all group"
                  >
                    <div className="w-20 h-20 bg-primary-green text-white rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-green-900/20 group-hover:rotate-6 transition-transform">
                      <Truck size={40} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Usar Transportadora</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Conecte-se com profissionais verificados para levar a carga até ao seu destino.
                    </p>
                    <div className="mt-8 flex items-center gap-2 text-primary-green font-bold text-sm">
                      Ver Disponibilidade <ChevronRight size={16} />
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ y: -5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep('chat_seller')}
                    className="flex flex-col items-center text-center p-10 rounded-[40px] border-2 border-gray-100 hover:border-primary-dark bg-gray-50 transition-all group"
                  >
                    <div className="w-20 h-20 bg-primary-dark text-white rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-black/20 group-hover:-rotate-6 transition-transform">
                      <User size={40} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Levar Própria Carga</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Eu trato da logística. Quero falar com o vendedor para agendar a recolha no local.
                    </p>
                    <div className="mt-8 flex items-center gap-2 text-primary-dark font-bold text-sm">
                      Falar com Vendedor <MessageSquare size={16} />
                    </div>
                  </motion.button>
                </div>
              )}

              {step === 'carriers' && (
                <div className="space-y-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="text" 
                      placeholder="Filtrar por nome ou região..." 
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:border-primary-green text-sm"
                    />
                  </div>
                  
                  <div className="grid gap-4">
                    {MOCK_CARRIERS.map((carrier) => (
                      <div 
                        key={carrier.id}
                        className="bg-white p-5 rounded-3xl border border-gray-100 flex items-center justify-between group hover:border-primary-green transition-all shadow-sm"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center",
                            carrier.active ? "bg-primary-green/10 text-primary-green" : "bg-gray-100 text-gray-400"
                          )}>
                            <Truck size={24} />
                          </div>
                          <div>
                            <h4 className="font-bold flex items-center gap-2">
                              {carrier.name}
                              {carrier.rating > 4.8 && <Star size={12} className="fill-amber-400 text-amber-400" />}
                            </h4>
                            <div className="flex items-center gap-3 text-[10px] uppercase font-black tracking-widest text-gray-400 mt-1">
                              <span className="flex items-center gap-1"><MapPin size={10} /> {carrier.distance}</span>
                              <span className="flex items-center gap-1"><ShieldCheck size={10} /> {carrier.type}</span>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => { setSelectedCarrier(carrier); setStep('chat_carrier'); }}
                          className="bg-primary-green/10 text-primary-green px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-primary-green hover:text-white transition-all"
                        >
                          Negociar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(step === 'chat_carrier' || step === 'chat_seller') && (
                <div className="absolute inset-0 z-50 bg-white flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
                  {/* Premium Chat Header */}
                  <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between shadow-sm relative z-10">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setStep('carriers')}
                        className="p-2.5 hover:bg-gray-100 rounded-2xl transition-all text-gray-400 hover:text-primary-dark"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <div className="relative">
                        <div className="w-14 h-14 rounded-[22px] bg-primary-green/10 text-primary-green flex items-center justify-center border-2 border-primary-green/20">
                          {step === 'chat_carrier' ? <Truck size={28} /> : <User size={28} />}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg leading-tight">
                          {step === 'chat_carrier' ? selectedCarrier?.name : 'Produtor: Fazenda Esperança'}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] text-primary-green font-black uppercase tracking-[0.2em]">Enlace Seguro Ligado</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button className="hidden sm:flex p-3 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-2xl transition-all" title="Chamada de Voz">
                        <Phone size={22} />
                      </button>
                      <button className="hidden sm:flex p-3 text-gray-400 hover:text-primary-green hover:bg-green-50 rounded-2xl transition-all" title="Video Chamada">
                        <Video size={22} />
                      </button>
                      <div className="h-8 w-px bg-gray-100 mx-1 hidden sm:block" />
                      <button 
                        onClick={() => step === 'chat_carrier' ? setStep('carriers') : setStep('selection')}
                        className="p-3 text-gray-400 hover:bg-gray-100 rounded-2xl transition-all"
                      >
                        <X size={24} />
                      </button>
                    </div>
                  </div>

                  {/* Messages Area - Immersive Full Screen */}
                  <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 bg-gray-50/50">
                    <div className="flex justify-center mb-8">
                       <span className="bg-gray-200/50 text-gray-500 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">Início da Negociação • {new Date().toLocaleDateString('pt-PT')}</span>
                    </div>

                    {chatHistory.length === 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-20 text-center opacity-40 px-10"
                      >
                        <div className="w-24 h-24 bg-white rounded-[40px] flex items-center justify-center shadow-xl border border-gray-100 mb-6">
                           <MessageSquare size={40} className="text-primary-green" />
                        </div>
                        <h5 className="text-xl font-bold mb-2">Mensagem Directa</h5>
                        <p className="text-sm max-w-xs">Envie uma proposta para alinhar os detalhes logísticos e prazos de entrega.</p>
                      </motion.div>
                    )}

                    {chatHistory.map((msg, i) => (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        key={i} 
                        className={cn(
                          "max-w-[75%] px-6 py-4 rounded-[28px] text-[15px] relative shadow-sm",
                          msg.sender === 'me' 
                            ? "ml-auto bg-primary-green text-white rounded-tr-none shadow-green-900/10" 
                            : "mr-auto bg-white border border-gray-100 rounded-tl-none text-primary-dark"
                        )}
                      >
                        <p className="leading-relaxed">{msg.text}</p>
                        <div className={cn(
                          "text-[10px] flex items-center gap-1.5 mt-2",
                          msg.sender === 'me' ? "text-white/60 justify-end" : "text-gray-400"
                        )}>
                          <Clock size={10} /> {msg.time}
                        </div>
                      </motion.div>
                    ))}
                    
                    {negotiationMessage.length > 0 && (
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest px-2 animate-pulse">
                        <div className="flex gap-1">
                          <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" />
                          <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                        A escrever proposta...
                      </div>
                    )}
                  </div>

                  {/* High-End Input Area */}
                  <div className="p-6 bg-white border-t border-gray-100 relative shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
                    <div className="max-w-4xl mx-auto flex items-end gap-3 bg-gray-50 p-2 rounded-[32px] border border-gray-100 focus-within:border-primary-green focus-within:bg-white transition-all shadow-inner">
                      <div className="flex items-center gap-2 pl-2 pb-2">
                         <button className="p-2.5 text-gray-400 hover:text-primary-green transition-colors"><ShieldCheck size={20} /></button>
                         <button className="p-2.5 text-gray-400 hover:text-primary-green transition-colors"><MapPin size={20} /></button>
                      </div>
                      <textarea 
                        rows={1}
                        placeholder="Escreva a sua proposta de frete ou dúvidas..."
                        className="flex-1 bg-transparent border-none px-4 py-3 text-base focus:outline-none focus:ring-0 resize-none min-h-[48px] max-h-32"
                        value={negotiationMessage}
                        onChange={(e) => setNegotiationMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <button 
                        onClick={handleSendMessage}
                        disabled={!negotiationMessage.trim()}
                        className="bg-primary-green text-white p-4 rounded-2xl hover:scale-105 transition-all shadow-xl shadow-green-900/20 disabled:grayscale disabled:opacity-50"
                      >
                        <Send size={22} />
                      </button>
                    </div>

                    {chatHistory.length > 1 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 flex justify-center"
                      >
                        <button 
                          onClick={() => setStep('success')}
                          className="px-12 py-4 bg-primary-dark text-white rounded-2xl font-bold text-sm shadow-2xl shadow-black/20 hover:bg-black transition-all flex items-center gap-3 active:scale-95"
                        >
                          <CheckCircle2 size={20} className="text-primary-green" /> Confirmar e Finalizar Contrato
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}

              {step === 'success' && (
                <div className="flex flex-col items-center justify-center text-center h-full space-y-8">
                  <div className="relative">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 12 }}
                      className="w-32 h-32 bg-primary-green text-white rounded-full flex items-center justify-center shadow-2xl shadow-green-900/30 border-8 border-green-50"
                    >
                      <CheckCircle2 size={64} />
                    </motion.div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 -m-4 border-2 border-dashed border-primary-green/20 rounded-full"
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-3xl font-display font-bold mb-4">Encomenda Confirmada!</h3>
                    <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                      A sua encomenda foi registada com sucesso. O logístico foi devidamente alinhado e o vendedor já foi notificado.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                       <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Cód. Rastreio</p>
                       <p className="font-mono text-sm font-bold">AS-HZ-9288-LK</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                       <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Previsão</p>
                       <p className="font-bold text-sm">2-3 Dias Úteis</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => { resetFlow(); onSuccess(); onClose(); }}
                    className="bg-primary-dark text-white px-12 py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-black/20"
                  >
                    Voltar ao Mercado
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
