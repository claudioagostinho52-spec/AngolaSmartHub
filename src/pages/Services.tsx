import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserPlus, FileText, ClipboardCheck, Calendar, 
  Search, ArrowRight, ShieldCheck, Clock,
  FileBadge, QrCode, CheckCircle2, ChevronRight, X,
  Check, AlertCircle, Loader2, Upload, MapPin, 
  Briefcase, Users, User, Locate, Download, FileCheck
} from 'lucide-react';
import { collection, query, where, addDoc, onSnapshot, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils.ts';
import { ServiceProcess } from '../types.ts';

const SERVICE_CARDS = [
  {
    id: 'nif',
    title: 'Solicitação de NIF',
    desc: 'Obtenha o seu Número de Identificação Fiscal digitalmente para fins agrícolas ou comerciais.',
    icon: UserPlus,
    tag: 'Obrigatório'
  },
  {
    id: 'decl',
    title: 'Declaração de Actividade',
    desc: 'Documento oficial para prova de exercício de actividade para subsídios e crédito bancário.',
    icon: FileText,
  },
  {
    id: 'reg',
    title: 'Registo de Produtor',
    desc: 'Formalize a sua fazenda no sistema nacional e obtenha o Cartão Digital do Produtor.',
    icon: ClipboardCheck,
    tag: 'Essencial'
  },
  {
    id: 'lic',
    title: 'Licença de Comercialização',
    desc: 'Autorização para venda oficial em mercados, supermercados e instituições públicas.',
    icon: FileBadge,
  },
  {
    id: 'schedule',
    title: 'Agendamento de Atendimento',
    desc: 'Marque o seu atendimento nas Lojas de Proximidade para evitar filas e esperas.',
    icon: Calendar,
  }
];

export function Services() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'services' | 'tracking'>('services');
  const [processes, setProcesses] = useState<ServiceProcess[]>([]);
  const [loadingProcesses, setLoadingProcesses] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<(typeof SERVICE_CARDS)[0] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // File Upload Simulation State
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({});

  const simulateUpload = (fieldId: string, fileName: string) => {
    setUploadingFiles(prev => ({ ...prev, [fieldId]: true }));
    
    // Simulate network delay
    setTimeout(() => {
      setUploadingFiles(prev => ({ ...prev, [fieldId]: false }));
      setUploadedFiles(prev => ({ ...prev, [fieldId]: fileName }));
    }, 2000);
  };

  // Expanded Form State
  const [formData, setFormData] = useState({ 
    name: profile?.displayName || user?.displayName || '', 
    idNumber: profile?.idNumber || '', 
    province: profile?.province || 'Huambo',
    // NIF extra fields
    fatherName: '',
    motherName: '',
    birthDate: '',
    gender: 'M',
    nationality: 'Angolana',
    biIssueDate: '',
    biExpiryDate: '',
    maritalStatus: 'Solteiro(a)',
    phone: profile?.phone || '',
    email: user?.email || '',
    municipality: '',
    commune: '',
    neighborhood: '',
    street: '',
    occupation: '',
    taxType: 'singular',
    // Decl/Reg/Lic common
    activityType: 'Agricultura',
    description: '',
    location: '',
    yearsActive: '',
    purpose: 'Formalização',
    farmName: '',
    gps: '',
    producerType: 'Individual',
    area: '',
    cropType: [],
    estimatedProduction: '',
    workers: '',
    // Lic specific
    comType: 'Venda em mercados',
    supplyCapacity: '',
    hasTransport: 'Não',
    hasWarehouse: 'Não',
    // Schedule specific
    selectedDate: '',
    selectedTime: '',
    locationPoint: '',
  });

  const [gpsLoading, setGpsLoading] = useState(false);

  const captureGps = () => {
    setGpsLoading(true);
    setTimeout(() => {
      setFormData(prev => ({ ...prev, gps: '-12.7761, 15.7333' }));
      setGpsLoading(false);
    }, 1500);
  };

  // Sync form data with profile if it loads later
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.displayName,
        idNumber: profile.idNumber,
        province: profile.province
      });
    }
  }, [profile]);

  // Fetch Processes
  useEffect(() => {
    if (!user) {
      setProcesses([]);
      return;
    }

    setLoadingProcesses(true);
    const q = query(
      collection(db, 'processes'), 
      where('userId', '==', user.uid),
      orderBy('dateRequested', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const procs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dateRequested: doc.data().dateRequested?.toDate?.()?.toLocaleDateString('pt-PT') || 'Recente'
      })) as ServiceProcess[];
      setProcesses(procs);
      setLoadingProcesses(false);
    }, (err) => {
      console.error(err);
      setLoadingProcesses(false);
    });

    return unsubscribe;
  }, [user]);

  const filteredProcesses = useMemo(() => {
    if (!searchQuery) return processes;
    return processes.filter(p => 
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [processes, searchQuery]);

  const handleStartProcess = (service: (typeof SERVICE_CARDS)[0]) => {
    setSelectedService(service);
    setIsModalOpen(true);
    setIsSuccess(false);
    setError(null);
    if (profile) {
      setFormData({
        name: profile.displayName,
        idNumber: profile.idNumber,
        province: profile.province
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Precisa de iniciar sessão para solicitar serviços.');
      return;
    }

    if (!user.emailVerified) {
      setError('Por favor, verifique o seu email antes de solicitar serviços.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      await addDoc(collection(db, 'processes'), {
        userId: user.uid,
        userName: formData.name,
        userBI: formData.idNumber,
        type: selectedService?.title || 'Serviço Geral',
        status: 'pending',
        dateRequested: serverTimestamp(),
        // All form fields
        ...formData,
        qrCode: true // Simulate generation
      });
      
      setIsSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setActiveTab('tracking');
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError('Falha ao enviar o pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-24 pb-20 px-4 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <header className="mb-14 text-center">
            <h1 className="text-4xl lg:text-5xl mb-4">Cidadão <span className="text-primary-green">Express</span></h1>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
                Modernizando a burocracia. Aceda a serviços públicos digitais e formalize a sua actividade agrícola num só lugar.
            </p>
        </header>

        <div className="flex justify-center mb-14">
          <div className="bg-gray-200/50 p-1.5 rounded-2xl flex backdrop-blur-sm border border-transparent">
            <button 
              onClick={() => setActiveTab('services')}
              className={cn(
                "px-8 py-3 rounded-xl text-sm font-bold transition-all",
                activeTab === 'services' ? "bg-white text-primary-dark shadow-sm" : "text-gray-500 hover:text-primary-dark"
              )}
            >
              Serviços Disponíveis
            </button>
            <button 
              onClick={() => setActiveTab('tracking')}
              className={cn(
                "px-8 py-3 rounded-xl text-sm font-bold transition-all",
                activeTab === 'tracking' ? "bg-white text-primary-dark shadow-sm" : "text-gray-500 hover:text-primary-dark"
              )}
            >
              Acompanhar Processo ({processes.length})
            </button>
          </div>
        </div>

        {activeTab === 'services' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {SERVICE_CARDS.map((service, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => handleStartProcess(service)}
                className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 group hover:shadow-xl hover:border-primary-green/20 transition-all cursor-pointer overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-green/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-primary-green group-hover:bg-primary-green group-hover:text-white transition-all shadow-sm">
                    <service.icon size={28} />
                  </div>
                  {service.tag && (
                    <span className="bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                      {service.tag}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl mb-3 relative z-10">{service.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-8 relative z-10">
                  {service.desc}
                </p>
                <div className="flex items-center gap-2 text-primary-green font-bold text-sm group relative z-10">
                  Iniciar Processo <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-10">
            <div className="bg-white dark:bg-dark-card p-10 rounded-[40px] shadow-sm border border-gray-100 dark:border-dark-border mb-12 overflow-hidden relative">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary-green/5 rounded-full -mr-10 -mt-10" />
              <h3 className="text-xl mb-6 dark:text-dark-text relative z-10">Verificar Estado de Pedido</h3>
              <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-green transition-colors" size={20} />
                  <input 
                    type="text" 
                    placeholder="Introduza o nº do processo ou nome do serviço..." 
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-100 dark:border-dark-border focus:outline-none focus:border-primary-green bg-gray-50 dark:bg-dark-bg dark:text-dark-text transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center px-2 mb-2">
                <h4 className="text-gray-400 dark:text-dark-muted text-sm font-bold uppercase tracking-widest">Processos ({processes.length})</h4>
                <div className="flex gap-2 text-[10px] text-gray-400 dark:text-dark-muted">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-blue-500 rounded-full" /> Pendente</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-green-500 rounded-full" /> Concluído</span>
                </div>
              </div>
              
              {!user ? (
                <div className="bg-white dark:bg-dark-card p-12 rounded-[32px] border border-gray-100 dark:border-dark-border text-center">
                   <ShieldCheck size={48} className="mx-auto mb-4 text-gray-300 dark:text-dark-muted" />
                   <p className="text-gray-500 dark:text-dark-muted mb-6">Inicie sessão para acompanhar os seus processos.</p>
                   <Link to="/login" className="bg-primary-dark dark:bg-primary-green text-white px-8 py-3 rounded-xl font-bold inline-block hover:shadow-lg transition-all">Entrar</Link>
                </div>
              ) : loadingProcesses ? (
                <div className="py-20 text-center">
                  <Loader2 className="animate-spin text-primary-green mx-auto" size={32} />
                </div>
              ) : filteredProcesses.length === 0 ? (
                <div className="bg-white dark:bg-dark-card p-12 rounded-[32px] border border-gray-100 dark:border-dark-border text-center">
                   <Clock size={48} className="mx-auto mb-4 text-gray-300 dark:text-dark-muted" />
                   <p className="text-gray-500 dark:text-dark-muted">Sem processos registados.</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredProcesses.map((proc, idx) => (
                    <motion.div
                      key={proc.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center justify-between group hover:border-primary-green transition-all cursor-pointer shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center transition-colors shadow-sm",
                          proc.status === 'approved' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                        )}>
                          {proc.status === 'approved' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                        </div>
                        <div>
                          <h5 className="font-bold text-lg">{proc.type}</h5>
                          <p className="text-xs text-gray-500">ID: {proc.id.slice(0, 8)} • Solicitado em {proc.dateRequested}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-primary-dark">
                        <span className={cn(
                          "hidden sm:inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full",
                          proc.status === 'approved' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                        )}>
                          {proc.status === 'approved' ? 'Concluído' : 'Pendente'}
                        </span>
                        {proc.qrCode && <QrCode size={20} className="text-gray-400" />}
                        <button className="p-2 text-gray-400 hover:text-primary-green transition-colors">
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && selectedService && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setIsModalOpen(false)}
              className="absolute inset-0 bg-primary-dark/60 backdrop-blur-sm" 
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[48px] shadow-2xl p-12 overflow-hidden border border-gray-100"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-primary-dark z-20"
              >
                <X size={24} />
              </button>

              {isSuccess ? (
                <div className="text-center py-10 relative z-10">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 scale-125 shadow-lg shadow-green-900/10">
                    <Check size={40} strokeWidth={3} />
                  </div>
                  <h2 className="text-3xl font-bold mb-4 font-display">Pedido Enviado!</h2>
                  <p className="text-gray-500 mb-8 leading-relaxed">
                    A sua solicitação de <strong>{selectedService.title}</strong> foi registada com sucesso. 
                    Poderá acompanhar o progresso no separador de rastreio.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-8 relative z-10">
                    <div className="w-16 h-16 bg-primary-green/10 text-primary-green rounded-2xl flex items-center justify-center shadow-sm">
                      <selectedService.icon size={32} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold font-display">{selectedService.title}</h2>
                      <p className="text-gray-500 text-sm font-medium">Confirme os seus dados oficiais.</p>
                    </div>
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm border border-red-100 shadow-sm"
                    >
                      <AlertCircle size={20} className="shrink-0" />
                      <p>{error}</p>
                    </motion.div>
                  )}

                  {!user && (
                    <div className="mb-6 p-6 bg-blue-50 text-blue-700 rounded-3xl text-center border border-blue-100">
                       <p className="text-sm font-bold mb-4">Precisa de estar autenticado para solicitar este serviço.</p>
                       <Link to="/login" className="bg-primary-dark text-white px-6 py-2.5 rounded-xl font-bold text-sm inline-block shadow-lg">Entrar agora</Link>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className={cn("space-y-8 relative z-10 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar", !user && "opacity-50 pointer-events-none")}>
                    {/* Common Header Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nome Completo</label>
                        <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:border-primary-green focus:bg-white focus:outline-none transition-all text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nº Bilhete de Identidade (BI)</label>
                        <input required type="text" value={formData.idNumber} onChange={e => setFormData({...formData, idNumber: e.target.value})} className="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:border-primary-green focus:bg-white focus:outline-none transition-all text-sm" />
                      </div>
                    </div>

                    {/* NIF SPECIFIC FIELDS */}
                    {selectedService.id === 'nif' && (
                      <div className="space-y-6 pt-4 border-t border-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nome do Pai</label>
                            <input required type="text" value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} className="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none text-sm" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nome da Mãe</label>
                            <input required type="text" value={formData.motherName} onChange={e => setFormData({...formData, motherName: e.target.value})} className="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none text-sm" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nascimento</label>
                            <input required type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none text-sm" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Sexo</label>
                            <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none text-sm">
                              <option value="M">Masculino</option>
                              <option value="F">Feminino</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Estado Civil</label>
                            <select value={formData.maritalStatus} onChange={e => setFormData({...formData, maritalStatus: e.target.value})} className="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none text-sm">
                              <option>Solteiro(a)</option>
                              <option>Casado(a)</option>
                              <option>Divorciado(a)</option>
                              <option>Viúvo(a)</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tipo de Contribuinte</label>
                            <div className="flex gap-2">
                              {['singular', 'empresa'].map(t => (
                                <button key={t} type="button" onClick={() => setFormData({...formData, taxType: t})} className={cn("flex-1 py-3 rounded-xl text-xs font-bold capitalize border transition-all", formData.taxType === t ? "bg-primary-dark text-white border-primary-dark" : "bg-white text-gray-500 border-gray-100")}>
                                  {t}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Profissão/Ocupação</label>
                            <input placeholder="Ex: Agricultor" type="text" value={formData.occupation} onChange={e => setFormData({...formData, occupation: e.target.value})} className="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none text-sm" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* DECLARATION SPECIFIC FIELDS */}
                    {selectedService.id === 'decl' && (
                      <div className="space-y-6 pt-4 border-t border-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tipo de Actividade</label>
                            <select value={formData.activityType} onChange={e => setFormData({...formData, activityType: e.target.value})} className="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none text-sm">
                              <option>Agricultura</option>
                              <option>Pecuária</option>
                              <option>Comércio</option>
                              <option>Pesca</option>
                              <option>Transporte</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Finalidade</label>
                            <select value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})} className="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none text-sm">
                              <option>Crédito bancário</option>
                              <option>Subsídio agrícola</option>
                              <option>Formalização</option>
                              <option>Projeto</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Descrição Detalhada</label>
                          <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none text-sm resize-none" placeholder="Descreva brevemente a sua exploração..." />
                        </div>
                      </div>
                    )}

                    {/* REGISTO SPECIFIC FIELDS */}
                    {selectedService.id === 'reg' && (
                      <div className="space-y-6 pt-4 border-t border-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nome da Fazenda</label>
                            <input type="text" value={formData.farmName} onChange={e => setFormData({...formData, farmName: e.target.value})} className="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none text-sm" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Área Cultivada (Hectares)</label>
                            <input type="number" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} className="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none text-sm" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Localização GPS</label>
                          <div className="flex gap-2">
                             <input disabled type="text" value={formData.gps} className="flex-1 p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-sm font-mono" placeholder="Coordenadas" />
                             <button type="button" onClick={captureGps} className="bg-primary-dark text-white px-4 rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center min-w-[50px]">
                               {gpsLoading ? <Loader2 size={18} className="animate-spin" /> : <Locate size={18} />}
                             </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* LICENÇA SPECIFIC FIELDS */}
                    {selectedService.id === 'lic' && (
                      <div className="space-y-6 pt-4 border-t border-gray-50">
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tipo de Comercialização</label>
                            <select value={formData.comType} onChange={e => setFormData({...formData, comType: e.target.value})} className="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none text-sm">
                              <option>Venda em mercados</option>
                              <option>Venda para supermercados</option>
                              <option>Venda para instituições (escolas/hospitais)</option>
                              <option>Exportação</option>
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5 text-center p-3 rounded-2xl bg-gray-50 border border-gray-100">
                               <p className="text-[8px] font-bold text-gray-400 uppercase mb-1">Meio de Transporte?</p>
                               <button type="button" onClick={() => setFormData({...formData, hasTransport: formData.hasTransport === 'Sim' ? 'Não' : 'Sim'})} className={cn("text-xs font-bold", formData.hasTransport === 'Sim' ? "text-primary-green" : "text-gray-400")}>
                                {formData.hasTransport}
                               </button>
                            </div>
                            <div className="space-y-1.5 text-center p-3 rounded-2xl bg-gray-50 border border-gray-100">
                               <p className="text-[8px] font-bold text-gray-400 uppercase mb-1">Armazém Próprio?</p>
                               <button type="button" onClick={() => setFormData({...formData, hasWarehouse: formData.hasWarehouse === 'Sim' ? 'Não' : 'Sim'})} className={cn("text-xs font-bold", formData.hasWarehouse === 'Sim' ? "text-primary-green" : "text-gray-400")}>
                                {formData.hasWarehouse}
                               </button>
                            </div>
                          </div>
                      </div>
                    )}

                    {/* SCHEDULE SPECIFIC FIELDS */}
                    {selectedService.id === 'schedule' && (
                      <div className="space-y-6 pt-4 border-t border-gray-50">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Data</label>
                            <input required type="date" value={formData.selectedDate} onChange={e => setFormData({...formData, selectedDate: e.target.value})} className="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none text-sm" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Hora</label>
                            <input required type="time" value={formData.selectedTime} onChange={e => setFormData({...formData, selectedTime: e.target.value})} className="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none text-sm" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Loja de Atendimento</label>
                          <select value={formData.locationPoint} onChange={e => setFormData({...formData, locationPoint: e.target.value})} className="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none text-sm">
                            <option value="">Seleccione um posto...</option>
                            <option>Loja Caála (Central)</option>
                            <option>Balcão SIMBA - Centro da Cidade</option>
                            <option>Posto Administrativo Calenga</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* ADDRESS FIELDS (Common for NIF/REG/LIC) */}
                    {['nif', 'reg', 'lic', 'decl'].includes(selectedService.id) && (
                      <div className="space-y-6 pt-4 border-t border-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Província</label>
                            <select value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})} className="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none text-sm">
                              <option>Huambo</option>
                              <option>Luanda</option>
                              <option>Benguela</option>
                              <option>Bié</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Município</label>
                            <input placeholder="Ex: Caála" type="text" value={formData.municipality} onChange={e => setFormData({...formData, municipality: e.target.value})} className="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none text-sm" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Comuna</label>
                              <input required type="text" value={formData.commune} onChange={e => setFormData({...formData, commune: e.target.value})} className="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none text-sm" />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Telefone</label>
                              <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none text-sm" />
                           </div>
                        </div>
                      </div>
                    )}

                    {/* DOCUMENT UPLOADS */}
                    {selectedService.id !== 'schedule' && (
                       <div className="pt-4 border-t border-gray-50">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-4 block">Documentação Obrigatória (Fotos)</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                             {/* BI Front */}
                             <div 
                                onClick={() => document.getElementById('upload-bi-front')?.click()}
                                className={cn(
                                  "aspect-square bg-gray-50 border border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all",
                                  uploadedFiles['bi-front'] ? "border-primary-green bg-green-50 text-primary-green" : "border-gray-200 text-gray-400 hover:bg-gray-100"
                                )}
                             >
                                {uploadingFiles['bi-front'] ? (
                                  <Loader2 size={24} className="animate-spin" />
                                ) : uploadedFiles['bi-front'] ? (
                                  <>
                                    <CheckCircle2 size={24} />
                                    <span className="text-[8px] font-bold uppercase">Enviado</span>
                                  </>
                                ) : (
                                  <>
                                    <Upload size={20} />
                                    <span className="text-[8px] font-bold uppercase">BI (Frente)</span>
                                  </>
                                )}
                                <input 
                                  id="upload-bi-front" 
                                  type="file" 
                                  className="hidden" 
                                  onChange={(e) => e.target.files?.[0] && simulateUpload('bi-front', e.target.files[0].name)} 
                                />
                             </div>

                             {/* BI Back */}
                             <div 
                                onClick={() => document.getElementById('upload-bi-back')?.click()}
                                className={cn(
                                  "aspect-square bg-gray-50 border border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all",
                                  uploadedFiles['bi-back'] ? "border-primary-green bg-green-50 text-primary-green" : "border-gray-200 text-gray-400 hover:bg-gray-100"
                                )}
                             >
                                {uploadingFiles['bi-back'] ? (
                                  <Loader2 size={24} className="animate-spin" />
                                ) : uploadedFiles['bi-back'] ? (
                                  <>
                                    <CheckCircle2 size={24} />
                                    <span className="text-[8px] font-bold uppercase">Enviado</span>
                                  </>
                                ) : (
                                  <>
                                    <Upload size={20} />
                                    <span className="text-[8px] font-bold uppercase">BI (Verso)</span>
                                  </>
                                )}
                                <input 
                                  id="upload-bi-back" 
                                  type="file" 
                                  className="hidden" 
                                  onChange={(e) => e.target.files?.[0] && simulateUpload('bi-back', e.target.files[0].name)} 
                                />
                             </div>

                             {selectedService.id === 'reg' && (
                               <div 
                                  onClick={() => document.getElementById('upload-farm')?.click()}
                                  className={cn(
                                    "aspect-square bg-gray-50 border border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all",
                                    uploadedFiles['farm'] ? "border-primary-green bg-green-50 text-primary-green" : "border-gray-200 text-gray-400 hover:bg-gray-100"
                                  )}
                               >
                                  {uploadingFiles['farm'] ? (
                                    <Loader2 size={24} className="animate-spin" />
                                  ) : uploadedFiles['farm'] ? (
                                    <>
                                      <CheckCircle2 size={24} />
                                      <span className="text-[8px] font-bold uppercase">Enviado</span>
                                    </>
                                  ) : (
                                    <>
                                      <Upload size={20} />
                                      <span className="text-[8px] font-bold uppercase">Foto Fazenda</span>
                                    </>
                                  )}
                                  <input 
                                    id="upload-farm" 
                                    type="file" 
                                    className="hidden" 
                                    onChange={(e) => e.target.files?.[0] && simulateUpload('farm', e.target.files[0].name)} 
                                  />
                               </div>
                             )}

                             {selectedService.id === 'nif' && (
                               <div 
                                  onClick={() => document.getElementById('upload-pass')?.click()}
                                  className={cn(
                                    "aspect-square bg-gray-50 border border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all",
                                    uploadedFiles['pass'] ? "border-primary-green bg-green-50 text-primary-green" : "border-gray-200 text-gray-400 hover:bg-gray-100"
                                  )}
                               >
                                  {uploadingFiles['pass'] ? (
                                    <Loader2 size={24} className="animate-spin" />
                                  ) : uploadedFiles['pass'] ? (
                                    <>
                                      <CheckCircle2 size={24} />
                                      <span className="text-[8px] font-bold uppercase">Enviado</span>
                                    </>
                                  ) : (
                                    <>
                                      <User size={20} />
                                      <span className="text-[8px] font-bold uppercase">Foto Passe</span>
                                    </>
                                  )}
                                  <input 
                                    id="upload-pass" 
                                    type="file" 
                                    className="hidden" 
                                    onChange={(e) => e.target.files?.[0] && simulateUpload('pass', e.target.files[0].name)} 
                                  />
                               </div>
                             )}
                          </div>
                       </div>
                    )}

                    <button 
                      disabled={isSubmitting || !user}
                      type="submit"
                      className="w-full py-5 rounded-2xl font-bold text-lg text-white bg-primary-green hover:bg-green-700 transition-all shadow-xl shadow-green-900/20 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" /> : (
                        <>
                          Enviar Solicitação
                          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold">Processamento via Hub Nacional de Luanda</p>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

