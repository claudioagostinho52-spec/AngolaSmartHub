import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { 
  ShieldCheck, QrCode, Search, MapPin, 
  Calendar, Truck, Leaf, CheckCircle2,
  AlertCircle, Info, ChevronRight, Share2,
  Clock, Warehouse, Download, Eye, ExternalLink,
  Thermometer, Droplets, Scale, Microscope, Loader2
} from 'lucide-react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { cn } from '../lib/utils.ts';
import { QRCodeCanvas } from 'qrcode.react';

export function Traceability() {
  const location = useLocation();
  const [searchValue, setSearchValue] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const batchIdParam = params.get('batchId') || (location.state as any)?.batchId;
    if (batchIdParam) {
      setSearchValue(batchIdParam);
      // Wait a bit for state to settle or trigger directly
      const performSearch = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
          const q = query(
            collection(db, 'traceability'),
            where('batchId', '==', id.toUpperCase()),
            limit(1)
          );
          const snapshot = await getDocs(q);
          if (snapshot.empty) {
            setError('Código não encontrado.');
          } else {
            setRecord(snapshot.docs[0].data());
            setShowResult(true);
          }
        } catch (err) {
          console.error(err);
          setError('Erro ao carregar dados.');
        } finally {
          setLoading(false);
        }
      };
      performSearch(batchIdParam);
    }
  }, [location.search, location.state]);

  const handleSearch = async () => {
    if (!searchValue.trim()) return;
    setLoading(true);
    setError(null);
    setShowResult(false);
    
    try {
      const q = query(
        collection(db, 'traceability'),
        where('batchId', '==', searchValue.trim().toUpperCase()),
        limit(1)
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setError('Código não encontrado. Verifique o código e tente novamente.');
        setRecord(null);
      } else {
        setRecord(snapshot.docs[0].data());
        setShowResult(true);
      }
    } catch (err) {
      console.error(err);
      setError('Erro ao pesquisar. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const trackingUrl = `https://hub.ao/trace/${searchValue || 'AS-HZ-9288-LK'}`;

  const getStepIcon = (iconName: string) => {
    switch (iconName) {
      case 'Leaf': return Leaf;
      case 'Calendar': return Calendar;
      case 'Microscope': return Microscope;
      case 'Truck': return Truck;
      case 'Warehouse': return Warehouse;
      default: return MapPin;
    }
  };

  const statusIcons: Record<string, any> = {
    Droplets,
    Thermometer,
    Scale,
    Leaf
  };

  const statusColors: Record<string, string> = {
    blue: 'text-blue-500',
    orange: 'text-orange-500',
    gray: 'text-gray-500',
    green: 'text-green-500'
  };

  return (
    <div className="pt-24 pb-20 px-4 min-h-screen bg-gray-50 text-primary-dark">
      <div className="max-w-5xl mx-auto">
        <header className="mb-14 text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-primary-green/10 text-primary-green rounded-full text-[10px] font-black uppercase tracking-widest mb-4"
            >
              <ShieldCheck size={14} /> Sistema de Rastreio Seguro
            </motion.div>
            <h1 className="text-4xl lg:text-5xl font-display font-bold mb-4">Rastreabilidade <span className="text-primary-green">Master</span></h1>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Acesso total ao ADN dos produtos angolanos. Transparência radical da semente até à prateleira.
            </p>
        </header>

        {/* Search / Scan Section */}
        <section className="bg-white p-12 rounded-[60px] shadow-2xl shadow-primary-dark/5 border border-gray-100 mb-16 text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary-green/5 rounded-full -mr-32 -mt-32 blur-3xl" />
           <div className="relative z-10">
              <div className="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 text-primary-green shadow-inner border border-gray-100">
                 <QrCode size={48} className="animate-pulse" />
              </div>
              <h3 className="text-3xl font-display font-bold mb-4">Validar Proveniência</h3>
              <p className="text-gray-500 mb-12 max-w-md mx-auto leading-relaxed">
                Utilize o código de rastreabilidade presente na selagem do produto ou no certificado de origem.
              </p>
              
              <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
                 <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-green transition-colors" size={24} />
                    <input 
                      type="text" 
                      placeholder="Ex: AS-HZ-9288-LK" 
                      className="w-full pl-14 pr-6 py-6 rounded-3xl border border-gray-100 focus:outline-none focus:border-primary-green focus:ring-4 focus:ring-primary-green/5 bg-gray-50 font-mono text-center tracking-[0.3em] text-xl uppercase transition-all shadow-sm"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                 </div>
                 <button 
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-primary-dark text-white px-12 py-6 rounded-3xl font-bold flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-primary-dark/20 disabled:opacity-50 active:scale-[0.98]"
                 >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Clock className="animate-spin" size={20} /> Processando...
                      </span>
                    ) : (
                      <>Verificar <ChevronRight size={22} /></>
                    )}
                 </button>
              </div>
              <div className="mt-10 flex items-center justify-center gap-12 grayscale opacity-30">
                <img src="https://upload.wikimedia.org/wikipedia/commons/9/9d/Emblema_da_Rep%C3%BAblica_de_Angola.svg" alt="Gov" className="h-10" />
                <div className="h-8 w-px bg-gray-300" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Normas Internacionais S-44</span>
              </div>
           </div>
        </section>

        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="space-y-10"
            >
              {/* Product Info Summary Card */}
              <div className="bg-white rounded-[60px] p-10 lg:p-16 shadow-2xl border border-gray-100 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-1/3 h-full bg-primary-green/5 blur-[120px] rounded-full" />
                 
                 <div className="relative z-10 flex flex-col md:flex-row gap-16 items-start">
                    <div className="relative group shrink-0 mx-auto md:mx-0">
                       <div className="w-64 h-64 rounded-[48px] overflow-hidden border-8 border-gray-50 shadow-2xl shadow-primary-dark/10 group-hover:scale-105 transition-transform duration-500">
                          <img 
                            src="https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=600" 
                            alt="Milho" 
                            className="w-full h-full object-cover"
                          />
                       </div>
                       <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -bottom-6 -right-6 bg-white p-3 rounded-[24px] shadow-2xl border border-gray-100"
                       >
                         <QRCodeCanvas value={trackingUrl} size={80} level="H" includeMargin={false} />
                       </motion.div>
                    </div>

                    <div className="flex-1 space-y-8">
                       <div>
                          <div className="flex flex-wrap gap-2 mb-6 justify-center md:justify-start">
                             <div className="bg-primary-green text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-green-900/20">
                                <ShieldCheck size={14} /> Autêntico
                             </div>
                             <div className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                Export Quality
                             </div>
                             <div className="bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100">
                                Orgânico
                             </div>
                          </div>
                          <h2 className="text-5xl font-display font-bold mb-2">{record.productName}</h2>
                          <p className="text-gray-400 font-mono text-lg tracking-widest">{record.batchId}</p>
                       </div>

                       <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 py-8 border-y border-gray-100">
                          {record.metrics && Object.entries(record.metrics).map(([key, value]: [string, any], i) => (
                            <div key={i}>
                               <div className="flex items-center gap-2 mb-2 text-gray-400">
                                  {React.createElement(statusIcons[value.icon] || Info, { size: 16, className: statusColors[value.color] || 'text-gray-500' })}
                                  <span className="text-[10px] font-black uppercase tracking-widest">{key}</span>
                               </div>
                               <p className="text-xl font-bold">{value.value || value}</p>
                            </div>
                          ))}
                       </div>

                       <div className="flex flex-col sm:flex-row gap-4 pt-2">
                          <button className="flex-1 bg-primary-dark text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-primary-dark/20">
                             <Download size={20} /> Baixar Certificado PDF
                          </button>
                          <button className="flex-1 bg-white border border-gray-100 py-5 rounded-2xl font-bold text-gray-600 flex items-center justify-center gap-3 hover:bg-gray-50 transition-all shadow-sm">
                             <Share2 size={20} /> Partilhar ADN
                          </button>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Enhanced Journey Visualization */}
              <div className="grid lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                  <div className="bg-white rounded-[48px] p-12 shadow-xl border border-gray-100">
                    <div className="flex justify-between items-center mb-16">
                        <h3 className="text-2xl font-display font-bold">Linha do Tempo Irreversível</h3>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary-green">
                          <div className="w-2 h-2 bg-primary-green rounded-full animate-ping" /> Em Directo
                        </div>
                    </div>

                    <div className="space-y-0">
                        {record.steps?.map((step: any, idx: number) => {
                          const StepIcon = getStepIcon(step.icon);
                          return (
                            <div key={idx} className="relative pl-16 pb-16 last:pb-0 group">
                              {/* Timeline Line */}
                              {idx !== record.steps.length - 1 && (
                                  <div className="absolute left-[24px] top-12 w-[2px] h-[calc(100%-24px)] bg-gray-100 group-hover:bg-primary-green/30 transition-colors" />
                              )}
                              
                              {/* Icon Circle */}
                              <div className={cn(
                                "absolute left-0 top-0 w-12 h-12 rounded-[18px] flex items-center justify-center transition-all shadow-sm z-10 border-2",
                                step.status === 'completed' 
                                  ? "bg-primary-green border-primary-green text-white" 
                                  : "bg-white border-primary-green text-primary-green animate-pulse"
                              )}>
                                  <StepIcon size={22} />
                              </div>

                              <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
                                  <div>
                                    <div className="flex items-center gap-3 mb-2">
                                       <h4 className="font-bold text-2xl">{step.title}</h4>
                                       {step.status === 'completed' && <CheckCircle2 size={20} className="text-primary-green" />}
                                    </div>
                                    <p className="text-gray-500 mb-4 max-w-md text-lg">{step.desc}</p>
                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full text-xs font-bold text-gray-500">
                                           <MapPin size={14} className="text-primary-green" /> {step.loc}
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full text-xs font-bold text-gray-500">
                                           <Clock size={14} className="text-primary-green" /> {step.date}
                                        </div>
                                    </div>
                                  </div>
                                  <button className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-primary-dark rounded-xl transition-all self-start">
                                    <Eye size={20} />
                                  </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>

                <div className="space-y-10">
                  {/* Digital Signature Card */}
                  <div className="bg-primary-dark rounded-[48px] p-10 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.1),transparent)]" />
                    <h4 className="text-xl font-bold mb-8 flex items-center gap-2">
                       <ShieldCheck className="text-primary-green" /> Assinatura Digital
                    </h4>
                    <div className="space-y-6">
                       <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                          <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-2">Blockchain Hash</p>
                          <p className="text-[10px] font-mono break-all text-primary-green">
                            0x71C7656EC7ab88b098defB751B7401B5f6d8976F
                          </p>
                       </div>
                       <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                          <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-2">Autoridade Emissora</p>
                          <p className="text-xs font-bold">Ministério da Agricultura e Pescas - Angola</p>
                       </div>
                       <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                          Validar no Nó Público <ExternalLink size={14} />
                       </button>
                    </div>
                  </div>

                  {/* Producer Info */}
                  <div className="bg-white rounded-[48px] p-10 shadow-xl border border-gray-100 flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center mb-6 shadow-xl text-primary-green">
                      <Warehouse size={40} />
                    </div>
                    <h4 className="text-2xl font-bold mb-2">{record.producerName}</h4>
                    <p className="text-gray-500 text-sm mb-6">Produtor Certificado {record.producerLocation}</p>
                    <div className="flex gap-4 w-full">
                       <button className="flex-1 py-3 bg-gray-50 hover:bg-primary-green hover:text-white rounded-xl text-xs font-bold transition-all">Perfil</button>
                       <button className="flex-1 py-3 bg-gray-50 hover:bg-primary-green hover:text-white rounded-xl text-xs font-bold transition-all">Contacto</button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {!showResult && (
           <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <motion.div 
                whileHover={{ y: -10 }}
                className="bg-white p-12 rounded-[48px] border border-gray-100 shadow-xl shadow-primary-dark/5 flex flex-col items-center text-center"
              >
                 <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[28px] flex items-center justify-center mb-8 shadow-inner">
                   <Info size={36} />
                 </div>
                 <h4 className="text-2xl mb-4 font-bold font-display">A Nossa Missão</h4>
                 <p className="text-gray-500 text-lg leading-relaxed">
                   Erradicar a falsificação de produtos e garantir que cada kwanza gasto em alimentação suporte 
                   directamente o produtor nacional com segurança total.
                 </p>
              </motion.div>
              <motion.div 
                whileHover={{ y: -10 }}
                className="bg-white p-12 rounded-[48px] border border-gray-100 shadow-xl shadow-primary-dark/5 flex flex-col items-center text-center"
              >
                 <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-[28px] flex items-center justify-center mb-8 shadow-inner">
                   <ShieldCheck size={36} />
                 </div>
                 <h4 className="text-2xl mb-4 font-bold font-display">Hub de Dados Nacional</h4>
                 <p className="text-gray-500 text-lg leading-relaxed">
                    Integramos dados colhidos em tempo real por sensores IOT e drones de vigilância 
                    nas maiores áreas de cultivo de Angola.
                 </p>
              </motion.div>
           </section>
        )}
      </div>
    </div>
  );
}
