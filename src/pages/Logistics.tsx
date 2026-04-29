import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Truck, MapPin, Navigation, Clock, 
  Package, CheckCircle2, AlertCircle, Search,
  ChevronRight, ArrowRight, TrendingUp, Loader2, Plus, X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, where, addDoc, onSnapshot, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { cn } from '../lib/utils.ts';

export function Logistics() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    origin: '',
    dest: '',
    cargoType: 'Frescos / Hortícolas'
  });

  // Fetch Deliveries
  React.useEffect(() => {
    if (!user) {
      setDeliveries([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'logisticOrders'),
      where('userId', '==', user.uid),
      orderBy('dateCreated', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDeliveries(orders);
      if (orders.length > 0 && !selectedDelivery) {
        setSelectedDelivery(orders[0]);
      }
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const handleAction = (action: string) => {
    setActiveAction(action);
    setTimeout(() => setActiveAction(null), 3000);
  };

  const handleNewOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, 'logisticOrders'), {
        userId: user.uid,
        origin: formData.origin,
        dest: formData.dest,
        cargoType: formData.cargoType,
        status: 'preparing',
        driver: 'Aguinaldo K.', // In a real app, this would be assigned by a carrier
        eta: 'Calculando...',
        dateCreated: serverTimestamp()
      });
      setIsSubmitting(false);
      setIsModalOpen(false);
      setFormData({ origin: '', dest: '', cargoType: 'Frescos / Hortícolas' });
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-24 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary-green" size={40} />
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-4 min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Action Toast */}
        <AnimatePresence>
          {activeAction && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="fixed top-24 right-10 z-[100] bg-white dark:bg-dark-card p-6 rounded-3xl shadow-2xl border border-gray-100 dark:border-dark-border flex items-center gap-4 max-w-sm"
            >
               <div className={cn(
                 "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                 activeAction === 'SOS' ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
               )}>
                  {activeAction === 'SOS' ? <AlertCircle size={24} /> : <TrendingUp size={24} />}
               </div>
               <div>
                  <h4 className="font-bold text-sm dark:text-dark-text">
                    {activeAction === 'SOS' ? 'Alerta SOS Enviado' : 'Acedendo Telemetria'}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-dark-muted leading-tight">
                    {activeAction === 'SOS' 
                      ? 'As autoridades e a nossa equipa de apoio foram notificadas para a sua localização.' 
                      : 'A ligar aos sensores do veículo para dados de temperatura e pressão em tempo real...'}
                  </p>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        <header className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h1 className="text-4xl lg:text-5xl mb-4 dark:text-dark-text">Logística <span className="text-primary-green">Inteligente</span></h1>
            <p className="text-gray-500 dark:text-dark-muted text-lg">Monitorize o fluxo de mercadorias agrícolas em tempo real em todo o território nacional.</p>
          </div>
          <Link 
            to="/logistics/directory" 
            className="bg-primary-green text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-green-700 transition-all shadow-xl shadow-green-900/20 w-fit"
          >
            Procurar Transportadores <Search size={20} />
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Map Simulation */}
          <div className="lg:col-span-2 bg-white dark:bg-dark-card rounded-[40px] overflow-hidden shadow-2xl border border-gray-100 dark:border-dark-border flex flex-col h-[700px] relative">
            {!selectedDelivery ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-dark-bg p-12 text-center">
                 <div className="w-24 h-24 bg-white dark:bg-dark-card rounded-[32px] shadow-2xl border border-gray-100 dark:border-dark-border flex items-center justify-center mb-8 text-primary-green/20">
                    <Truck size={48} />
                 </div>
                 <h2 className="text-3xl font-display font-bold dark:text-dark-text mb-4">Sem Entregas Activas</h2>
                 <p className="text-gray-500 dark:text-dark-muted max-w-sm mx-auto leading-relaxed">Crie uma nova ordem de transporte para começar a monitorizar as suas mercadorias em tempo real.</p>
              </div>
            ) : (
              <>
              <div className="absolute inset-0 bg-blue-50/30 dark:bg-dark-bg/30">
                 {/* Simulating a map with elements */}
                 <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:30px_30px]" />
                 
                 {/* Map Markers */}
                 <div className="absolute top-1/4 left-1/3">
                    <div className="relative group cursor-pointer">
                      <div className="w-5 h-5 bg-primary-green rounded-full animate-ping absolute inset-0" />
                      <div className="w-5 h-5 bg-primary-green rounded-full relative z-10 border-4 border-white dark:border-dark-card shadow-lg" />
                      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white dark:bg-dark-card px-2 py-1 rounded text-[10px] font-bold shadow-xl border border-gray-100 dark:border-dark-border whitespace-nowrap">Origem: {selectedDelivery.origin}</div>
                    </div>
                 </div>

                 <div className="absolute top-2/3 left-2/3">
                    <div className="relative group cursor-pointer">
                      <div className="w-5 h-5 bg-blue-500 rounded-full relative z-10 border-4 border-white dark:border-dark-card shadow-lg" />
                      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white dark:bg-dark-card px-2 py-1 rounded text-[10px] font-bold shadow-xl border border-gray-100 dark:border-dark-border whitespace-nowrap">Destino: {selectedDelivery.dest}</div>
                    </div>
                 </div>

                 {/* Route Line Simulation */}
                 <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                    <motion.path 
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                      d="M 33% 25% Q 40% 45% 66% 66%" 
                      fill="none" 
                      stroke="currentColor" 
                      className="text-primary-green/30"
                      strokeWidth="4" 
                      strokeDasharray="12,12"
                    />
                    <motion.circle 
                      initial={{ offset: 0 }}
                      animate={{ cx: "45%", cy: "45%" }}
                      transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                      r="6" 
                      fill="#1e3a8a" 
                      className="animate-pulse" 
                    />
                    <text x="47%" y="45%" className="text-[12px] fill-primary-dark dark:fill-dark-text font-bold tracking-tighter">RASTREIO: {selectedDelivery.id.slice(0, 8)}</text>
                 </svg>
              </div>

              <div className="absolute top-4 left-4 bg-white/90 dark:bg-dark-card/90 backdrop-blur-md p-5 rounded-3xl shadow-2xl border border-white/50 dark:border-dark-border w-72 z-20">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary-green text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-900/20">
                      <Navigation size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm dark:text-dark-text">Rota de {selectedDelivery.origin}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sincronizado via Satélite</p>
                    </div>
                 </div>
                 <div className="space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400 font-bold uppercase tracking-tighter">Destino:</span>
                      <span className="font-bold dark:text-dark-text">{selectedDelivery.dest}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400 font-bold uppercase tracking-tighter">ETA:</span>
                      <span className="font-bold text-primary-green">{selectedDelivery.eta}</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-dark-bg h-1.5 rounded-full overflow-hidden mt-2">
                       <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: selectedDelivery.status === 'transit' ? '65%' : '15%' }}
                          className="bg-primary-green h-full rounded-full"
                       />
                    </div>
                 </div>
              </div>

              <div className="bg-white dark:bg-dark-card p-10 border-t border-gray-100 dark:border-dark-border flex flex-col sm:flex-row items-center justify-between z-20 gap-6">
                 <div className="flex items-center gap-8">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Status Actual</p>
                      <div className="flex items-center gap-2">
                         <span className={cn(
                           "w-2.5 h-2.5 rounded-full animate-pulse",
                           selectedDelivery.status === 'transit' ? "bg-primary-green" : 
                           selectedDelivery.status === 'delivered' ? "bg-blue-500" : "bg-orange-400"
                         )} />
                         <span className="font-bold text-sm dark:text-dark-text">
                           {selectedDelivery.status === 'transit' ? 'Camião em Trânsito' : 
                            selectedDelivery.status === 'delivered' ? 'Entrega Concluída' : 'Em Preparação'}
                         </span>
                      </div>
                    </div>
                    <div className="hidden sm:block h-10 w-px bg-gray-100 dark:bg-dark-border" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Motorista</p>
                      <span className="font-bold text-sm dark:text-dark-text">{selectedDelivery.driver}</span>
                    </div>
                 </div>
                 <div className="flex gap-3 w-full sm:w-auto">
                   <button 
                      onClick={() => handleAction('SOS')}
                      className="flex-1 sm:flex-none bg-gray-100 dark:bg-dark-bg text-primary-dark dark:text-dark-text px-6 py-3 rounded-2xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-white/5 transition-all"
                    >
                      Botão SOS
                    </button>
                   <button 
                      onClick={() => handleAction('Telemetria')}
                      className="flex-1 sm:flex-none bg-primary-dark dark:bg-primary-green text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-primary-dark/20 hover:-translate-y-0.5 transition-all"
                    >
                      Ver Telemetria
                    </button>
                 </div>
              </div>
              </>
            )}
          </div>

          <div className="space-y-8">
            <div className="bg-white dark:bg-dark-card p-10 rounded-[48px] shadow-xl border border-gray-100 dark:border-dark-border h-full flex flex-col">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="font-bold text-xl dark:text-dark-text">Ordens Ativas ({deliveries.length})</h3>
                  <div className="p-2 bg-gray-50 dark:bg-dark-bg rounded-xl text-gray-400">
                    <Search size={20} />
                  </div>
               </div>
               
               <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                  {deliveries.length === 0 ? (
                    <div className="py-10 text-center opacity-40">
                       <Package size={40} className="mx-auto mb-2" />
                       <p className="text-xs font-bold uppercase">Sem Ordens</p>
                    </div>
                  ) : (
                    deliveries.map((del) => (
                      <motion.div 
                        key={del.id}
                        onClick={() => setSelectedDelivery(del)}
                        whileHover={{ x: 5 }}
                        className={cn(
                          "p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden",
                          selectedDelivery?.id === del.id 
                            ? "bg-primary-green/5 dark:bg-primary-green/10 border-primary-green shadow-lg shadow-green-900/5" 
                            : "bg-gray-50 dark:bg-dark-bg border-gray-100 dark:border-dark-border hover:border-gray-200"
                        )}
                      >
                        {selectedDelivery?.id === del.id && (
                          <motion.div layoutId="active-indicator" className="absolute left-0 top-0 bottom-0 w-1 bg-primary-green" />
                        )}
                        <div className="flex items-center justify-between mb-4">
                           <span className="text-sm font-bold dark:text-dark-text">{del.id.slice(0, 8)}</span>
                           <span className={cn(
                             "text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg text-center min-w-[80px]",
                             del.status === 'transit' ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" :
                             del.status === 'delivered' ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                           )}>
                             {del.status === 'transit' ? 'Trânsito' : del.status === 'delivered' ? 'Entregue' : 'Preparação'}
                           </span>
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                           <div className="text-xs font-bold space-y-2 w-full">
                              <div className="flex items-center gap-3 text-gray-400">
                                <MapPin size={12} className="shrink-0" /> 
                                <span className="truncate">{del.origin}</span>
                              </div>
                              <div className="flex items-center gap-3 text-primary-dark dark:text-dark-text">
                                <div className="w-3 h-px bg-gray-200" />
                                <ArrowRight size={12} className="shrink-0" /> 
                                <span className="truncate">{del.dest}</span>
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-dark-border">
                           <span className="text-[10px] font-bold text-gray-400 uppercase">{del.driver}</span>
                           <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary-green uppercase">
                             <Clock size={12} /> {del.eta}
                           </div>
                        </div>
                      </motion.div>
                    ))
                  )}
               </div>
               
               <div className="grid grid-cols-2 gap-4 mt-8">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="py-5 border-2 border-dashed border-gray-200 dark:border-dark-border rounded-[32px] text-gray-400 dark:text-dark-muted font-bold text-sm hover:border-primary-green hover:text-primary-green hover:bg-green-50 dark:hover:bg-primary-green/5 transition-all flex items-center justify-center gap-2"
                >
                    <Plus size={18} /> Nova Ordem
                </button>
                <Link 
                  to="/logistics/directory"
                  className="py-5 border-2 border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-bg rounded-[32px] text-primary-dark dark:text-dark-text font-bold text-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                >
                    <Search size={18} /> Directório
                </Link>
               </div>
            </div>
          </div>
        </div>

        <section className="mt-32">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-16 gap-6">
            <h2 className="text-3xl font-display dark:text-dark-text">Tipos de <span className="text-primary-green underline decoration-wavy underline-offset-8">Transporte</span></h2>
            <Link to="/logistics/register" className="text-primary-green font-bold flex items-center gap-2 hover:gap-3 transition-all">
              Seja um Transportador <ArrowRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
             {[
               { name: 'Entregas Rápidas', desc: 'Ideal para produtos hortícolas frescos e pequenas encomendas locais.', ic: Navigation, col: 'bg-blue-100 text-blue-700' },
               { name: 'Camiões de Carga', desc: 'Logística massiva de cereais e grandes volumes entre províncias.', ic: Truck, col: 'bg-green-100 text-green-700' },
               { name: 'Cadeia de Frio', desc: 'Camiões refrigerados de última geração para carnes e peixe.', ic: Package, col: 'bg-orange-100 text-orange-700' },
             ].map((v, i) => (
               <motion.div 
                 key={i} 
                 whileHover={{ y: -10 }}
                 className="bg-white dark:bg-dark-card p-10 rounded-[40px] border border-gray-100 dark:border-dark-border shadow-sm hover:shadow-2xl transition-all"
               >
                  <div className={cn("w-20 h-20 rounded-[24px] flex items-center justify-center mx-auto mb-8 shadow-inner", v.col)}>
                    <v.ic size={36} />
                  </div>
                  <h4 className="text-2xl font-bold mb-4 dark:text-dark-text font-display">{v.name}</h4>
                  <p className="text-gray-500 dark:text-dark-muted text-sm leading-relaxed">{v.desc}</p>
               </motion.div>
             ))}
          </div>
        </section>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)} 
              className="absolute inset-0 bg-primary-dark/60 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-dark-card w-full max-w-xl rounded-[40px] p-10 shadow-2xl border border-white/20"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold dark:text-dark-text font-display">Solicitar Transporte</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-50 dark:bg-dark-bg text-gray-400 rounded-2xl hover:text-primary-dark transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleNewOrder} className="space-y-6">
                 <div className="grid sm:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-xs font-bold uppercase text-gray-400 dark:text-dark-muted ml-1 tracking-widest">Origem</label>
                     <div className="relative">
                       <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                       <input 
                         required 
                         type="text" 
                         className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border focus:outline-none focus:border-primary-green dark:text-dark-text transition-all" 
                         placeholder="Ex: Huambo" 
                         value={formData.origin}
                         onChange={(e) => setFormData({...formData, origin: e.target.value})}
                       />
                     </div>
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-bold uppercase text-gray-400 dark:text-dark-muted ml-1 tracking-widest">Destino</label>
                     <div className="relative">
                       <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                       <input 
                         required 
                         type="text" 
                         className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border focus:outline-none focus:border-primary-green dark:text-dark-text transition-all" 
                         placeholder="Ex: Luanda" 
                         value={formData.dest}
                         onChange={(e) => setFormData({...formData, dest: e.target.value})}
                       />
                     </div>
                   </div>
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-bold uppercase text-gray-400 dark:text-dark-muted ml-1 tracking-widest">Tipo de Mercadoria</label>
                   <select 
                    className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border focus:outline-none appearance-none dark:text-dark-text transition-all"
                    value={formData.cargoType}
                    onChange={(e) => setFormData({...formData, cargoType: e.target.value})}
                   >
                      <option>Frescos / Hortícolas</option>
                      <option>Cereais / Grãos</option>
                      <option>Refrigerados</option>
                   </select>
                 </div>
                 <button 
                  disabled={isSubmitting}
                  className="w-full py-5 bg-primary-green text-white rounded-2xl font-bold shadow-xl shadow-green-900/20 hover:bg-green-700 transition-all mt-4 flex items-center justify-center gap-3 group"
                 >
                   {isSubmitting ? <Loader2 className="animate-spin" /> : (
                     <>
                        Confirmar Ordem 
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                     </>
                   )}
                 </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

