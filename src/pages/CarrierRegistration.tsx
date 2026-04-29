import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Truck, User, MapPin, Package, FileText, 
  Calendar, CreditCard, ShieldCheck, Check, 
  ArrowRight, ArrowLeft, Upload, Loader2, 
  Locate, DollarSign, Clock, HelpCircle, X,
  Briefcase, CheckCircle2, Star, TrendingUp
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { db } from '../lib/firebase.ts';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const STEPS = [
  { id: 1, title: 'Identidade', icon: User },
  { id: 2, title: 'Veículo', icon: Truck },
  { id: 3, title: 'Operação', icon: Package },
  { id: 4, title: 'Financeiro', icon: DollarSign },
];

export function CarrierRegistration() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  // File Upload Simulation State
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({});

  const simulateUpload = (fieldId: string, fileName: string) => {
    setUploadingFiles(prev => ({ ...prev, [fieldId]: true }));
    setTimeout(() => {
      setUploadingFiles(prev => ({ ...prev, [fieldId]: false }));
      setUploadedFiles(prev => ({ ...prev, [fieldId]: fileName }));
    }, 2000);
  };

  const [formData, setFormData] = useState({
    // Step 1: Personal/Company
    fullName: profile?.displayName || user?.displayName || '',
    carrierType: 'individual',
    idNumber: profile?.idNumber || '',
    nif: '',
    phone: profile?.phone || '',
    altPhone: '',
    email: user?.email || '',
    province: profile?.province || 'Luanda',
    municipality: '',
    commune: '',
    neighborhood: '',
    gps: '',
    coverageArea: 'interprovincial',

    // Step 2: Vehicle
    vehicleType: 'Camião pequeno',
    capacity: '',
    isClosed: 'Não',
    fragileProtection: 'Não',
    isRefrigerated: 'Não',
    plateNumber: '',
    brand: '',
    model: '',
    year: '',
    vehicleCondition: 'Excelente',

    // Step 3: Operation
    availability: ['Manhã', 'Tarde'],
    availableDays: 'Segunda a Sexta',
    billingType: 'Por entrega',
    basePrice: '',
    negotiable: 'Sim',
    acceptsGps: 'Sim',
    acceptsQr: 'Sim',
    hasHelper: 'Não',
    experience: '1 a 3 anos',

    // Step 4: Payment
    paymentMethod: 'Transferência bancária',
    bankName: '',
    iban: '',
    termsAccepted: false,
    dataConfirmed: false
  });

  const captureGps = () => {
    setGpsLoading(true);
    setTimeout(() => {
      setFormData(prev => ({ ...prev, gps: '-8.8368, 13.2343' }));
      setGpsLoading(false);
    }, 1500);
  };

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 4) {
      handleNext();
      return;
    }

    if (!formData.termsAccepted || !formData.dataConfirmed) {
      alert('Por favor, aceite os termos e confirme os dados antes de prosseguir.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'carriers'), {
        ...formData,
        userId: user?.uid,
        status: 'pending_validation',
        rating: 0,
        deliveriesCount: 0,
        reliability: 100,
        createdAt: serverTimestamp()
      });
      
      setIsSuccess(true);
    } catch (error) {
      console.error(error);
      alert('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="pt-24 pb-20 px-4 min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full bg-white rounded-[48px] p-12 text-center shadow-2xl border border-gray-100"
        >
          <div className="w-24 h-24 bg-primary-green/10 text-primary-green rounded-full flex items-center justify-center mx-auto mb-8">
            <Check size={48} strokeWidth={3} />
          </div>
          <h1 className="text-4xl font-bold mb-4 font-display">Solicitação Enviada!</h1>
          <p className="text-gray-500 mb-10 text-lg leading-relaxed">
            O seu perfil de transportador foi registado com sucesso e encontra-se agora <strong className="text-primary-dark">em validação</strong>. 
            A nossa equipa irá analisar os documentos e ativar a sua conta nas próximas 24-48 horas.
          </p>

          <div className="bg-gray-50 rounded-3xl p-8 mb-10 grid grid-cols-2 gap-6 text-left">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm">
                   <Clock size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estado</p>
                  <p className="font-bold text-primary-dark">Em Validação</p>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary-green shadow-sm">
                   <Star size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Confiança</p>
                  <p className="font-bold text-primary-dark">Novo Perfil</p>
                </div>
             </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/logistics" className="flex-1 bg-primary-dark text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
               Voltar para Logística <ArrowRight size={20} />
            </Link>
            <Link to="/profile" className="flex-1 bg-white border border-gray-100 text-primary-dark py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all">
               Ver Meu Perfil
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-4 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-green/10 text-primary-green rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            <Truck size={14} /> Recrutamento 2026
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 font-display">Seja um <span className="text-primary-green">Transportador</span></h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Junte-se à maior rede logística agrícola de Angola. Aumente os seus rendimentos transportando do campo para a cidade.
          </p>
        </header>

        {/* Step Progress */}
        <div className="mb-12 flex justify-between relative max-w-2xl mx-auto">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0" />
          {STEPS.map(step => (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                currentStep >= step.id ? "bg-primary-dark text-white shadow-xl scale-110" : "bg-white text-gray-400 border-2 border-gray-200"
              )}>
                <step.icon size={20} />
              </div>
              <span className={cn("text-[10px] font-bold uppercase tracking-widest", currentStep >= step.id ? "text-primary-dark" : "text-gray-400")}>
                {step.title}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 lg:p-12">
          {/* STEP 1: PERSONAL / COMPANY */}
          {currentStep === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nome Completo / Empresa</label>
                  <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:border-primary-green transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tipo de Transportador</label>
                  <div className="flex gap-2">
                    {['individual', 'empresa'].map(t => (
                      <button key={t} type="button" onClick={() => setFormData({...formData, carrierType: t})} className={cn("flex-1 py-4 rounded-2xl text-xs font-bold capitalize border transition-all", formData.carrierType === t ? "bg-primary-dark text-white border-primary-dark shadow-lg shadow-primary-dark/20" : "bg-white text-gray-500 border-gray-100 font-medium")}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nº do BI</label>
                  <input required type="text" value={formData.idNumber} onChange={e => setFormData({...formData, idNumber: e.target.value})} className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">NIF</label>
                  <input required={formData.carrierType === 'empresa'} type="text" value={formData.nif} onChange={e => setFormData({...formData, nif: e.target.value})} className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none text-sm" placeholder="Obrigatório para empresas" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-50">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Província</label>
                  <select value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})} className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none text-sm">
                    <option>Luanda</option>
                    <option>Huambo</option>
                    <option>Benguela</option>
                    <option>Bié</option>
                    <option>Huíla</option>
                  </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Área de Atuação</label>
                   <select value={formData.coverageArea} onChange={e => setFormData({...formData, coverageArea: e.target.value})} className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none text-sm">
                    <option value="provincial">Provincial</option>
                    <option value="interprovincial">Interprovincial</option>
                    <option value="nacional">Nacional</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Telefone (Célular)</label>
                  <div className="flex gap-2">
                     <span className="p-4 bg-gray-100 rounded-2xl text-gray-500 font-bold text-sm">+244</span>
                     <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="flex-1 p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none text-sm" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Localização GPS</label>
                  <div className="flex gap-2">
                     <input disabled type="text" value={formData.gps} className="flex-1 p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs font-mono" placeholder="Coordenadas" />
                     <button type="button" onClick={captureGps} className="bg-primary-dark text-white px-6 rounded-2xl hover:bg-gray-800 transition-all flex items-center justify-center min-w-[60px]">
                       {gpsLoading ? <Loader2 size={20} className="animate-spin" /> : <Locate size={20} />}
                     </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: VEHICLE */}
          {currentStep === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tipo de Veículo</label>
                  <select value={formData.vehicleType} onChange={e => setFormData({...formData, vehicleType: e.target.value})} className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none text-sm">
                    <option>Moto (Trirroda)</option>
                    <option>Carrinha</option>
                    <option>Camião pequeno</option>
                    <option>Camião grande</option>
                    <option>Pickup / 4x4</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Capacidade de Carga (kg/ton)</label>
                  <input required type="text" placeholder="Ex: 5 toneladas" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Carroceria Fechada?</p>
                    <button type="button" onClick={() => setFormData({...formData, isClosed: formData.isClosed === 'Sim' ? 'Não' : 'Sim'})} className={cn("text-sm font-bold", formData.isClosed === 'Sim' ? "text-primary-green" : "text-gray-400")}>
                      {formData.isClosed}
                    </button>
                 </div>
                 <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Refrigerado?</p>
                    <button type="button" onClick={() => setFormData({...formData, isRefrigerated: formData.isRefrigerated === 'Sim' ? 'Não' : 'Sim'})} className={cn("text-sm font-bold", formData.isRefrigerated === 'Sim' ? "text-primary-green" : "text-gray-400")}>
                      {formData.isRefrigerated}
                    </button>
                 </div>
                 <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Proteção Frágeis?</p>
                    <button type="button" onClick={() => setFormData({...formData, fragileProtection: formData.fragileProtection === 'Sim' ? 'Não' : 'Sim'})} className={cn("text-sm font-bold", formData.fragileProtection === 'Sim' ? "text-primary-green" : "text-gray-400")}>
                      {formData.fragileProtection}
                    </button>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-50">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Matrícula</label>
                    <input required type="text" value={formData.plateNumber} onChange={e => setFormData({...formData, plateNumber: e.target.value})} className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none text-sm uppercase" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Marca / Modelo</label>
                    <input required type="text" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none text-sm" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Estado</label>
                    <select value={formData.vehicleCondition} onChange={e => setFormData({...formData, vehicleCondition: e.target.value})} className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none text-sm">
                      <option>Excelente</option>
                      <option>Bom</option>
                      <option>Razoável</option>
                    </select>
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Upload de Documentos (Fotos)</label>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Vehicle Front */}
                    <div 
                      onClick={() => document.getElementById('up-v-front')?.click()}
                      className={cn(
                        "aspect-square bg-gray-50 border border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all",
                        uploadedFiles['v-front'] ? "border-primary-green bg-green-50 text-primary-green" : "border-gray-200 text-gray-400 hover:bg-gray-100"
                      )}
                    >
                      {uploadingFiles['v-front'] ? (
                        <Loader2 size={24} className="animate-spin" />
                      ) : uploadedFiles['v-front'] ? (
                        <>
                          <CheckCircle2 size={24} />
                          <span className="text-[8px] font-bold uppercase">Enviado</span>
                        </>
                      ) : (
                        <>
                          <Upload size={24} />
                          <span className="text-[8px] font-bold uppercase">Foto Frente</span>
                        </>
                      )}
                      <input id="up-v-front" type="file" className="hidden" onChange={(e) => e.target.files?.[0] && simulateUpload('v-front', e.target.files[0].name)} />
                    </div>

                    {/* Vehicle Side */}
                    <div 
                      onClick={() => document.getElementById('up-v-side')?.click()}
                      className={cn(
                        "aspect-square bg-gray-50 border border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all",
                        uploadedFiles['v-side'] ? "border-primary-green bg-green-50 text-primary-green" : "border-gray-200 text-gray-400 hover:bg-gray-100"
                      )}
                    >
                      {uploadingFiles['v-side'] ? (
                        <Loader2 size={24} className="animate-spin" />
                      ) : uploadedFiles['v-side'] ? (
                        <>
                          <CheckCircle2 size={24} />
                          <span className="text-[8px] font-bold uppercase">Enviado</span>
                        </>
                      ) : (
                        <>
                          <Upload size={24} />
                          <span className="text-[8px] font-bold uppercase">Foto Lateral</span>
                        </>
                      )}
                      <input id="up-v-side" type="file" className="hidden" onChange={(e) => e.target.files?.[0] && simulateUpload('v-side', e.target.files[0].name)} />
                    </div>

                    {/* Document */}
                    <div 
                      onClick={() => document.getElementById('up-v-doc')?.click()}
                      className={cn(
                        "aspect-square bg-gray-50 border border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all",
                        uploadedFiles['v-doc'] ? "border-primary-green bg-green-50 text-primary-green" : "border-gray-200 text-gray-400 hover:bg-gray-100"
                      )}
                    >
                      {uploadingFiles['v-doc'] ? (
                        <Loader2 size={24} className="animate-spin" />
                      ) : uploadedFiles['v-doc'] ? (
                        <>
                          <CheckCircle2 size={24} />
                          <span className="text-[8px] font-bold uppercase">Enviado</span>
                        </>
                      ) : (
                        <>
                          <FileText size={24} />
                          <span className="text-[8px] font-bold uppercase">Livrete</span>
                        </>
                      )}
                      <input id="up-v-doc" type="file" className="hidden" onChange={(e) => e.target.files?.[0] && simulateUpload('v-doc', e.target.files[0].name)} />
                    </div>

                    {/* Driver License */}
                    <div 
                      onClick={() => document.getElementById('up-v-license')?.click()}
                      className={cn(
                        "aspect-square bg-gray-50 border border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all",
                        uploadedFiles['v-license'] ? "border-primary-green bg-green-50 text-primary-green" : "border-gray-200 text-gray-400 hover:bg-gray-100"
                      )}
                    >
                      {uploadingFiles['v-license'] ? (
                        <Loader2 size={24} className="animate-spin" />
                      ) : uploadedFiles['v-license'] ? (
                        <>
                          <CheckCircle2 size={24} />
                          <span className="text-[8px] font-bold uppercase">Enviado</span>
                        </>
                      ) : (
                        <>
                          <User size={24} />
                          <span className="text-[8px] font-bold uppercase">Carta Condução</span>
                        </>
                      )}
                      <input id="up-v-license" type="file" className="hidden" onChange={(e) => e.target.files?.[0] && simulateUpload('v-license', e.target.files[0].name)} />
                    </div>
                 </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: OPERATION */}
          {currentStep === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tipo de Cobrança</label>
                  <select value={formData.billingType} onChange={e => setFormData({...formData, billingType: e.target.value})} className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none text-sm">
                    <option>Por km</option>
                    <option>Por entrega</option>
                    <option>Por tonelada / kg</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Preço Base (Kz)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-primary-green">Kz</span>
                    <input required type="number" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: e.target.value})} className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none text-sm font-bold" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Experiência</label>
                    <select value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none text-sm">
                      <option>Menos de 1 ano</option>
                      <option>1 a 3 anos</option>
                      <option>3 a 5 anos</option>
                      <option>Mais de 5 anos</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Dias Disponíveis</label>
                    <select value={formData.availableDays} onChange={e => setFormData({...formData, availableDays: e.target.value})} className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none text-sm">
                      <option>Segunda a Sexta</option>
                      <option>Fins de semana</option>
                      <option>Todos os dias</option>
                    </select>
                 </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {[
                   { label: 'Aceita GPS?', key: 'acceptsGps' },
                   { label: 'Aceita QR?', key: 'acceptsQr' },
                   { label: 'Negociável?', key: 'negotiable' },
                   { label: 'Tem Ajudante?', key: 'hasHelper' },
                 ].map(item => (
                   <div key={item.key} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                      <p className="text-[8px] font-bold text-gray-400 uppercase mb-1">{item.label}</p>
                      <button type="button" onClick={() => setFormData({...formData, [item.key]: (formData as any)[item.key] === 'Sim' ? 'Não' : 'Sim'})} className={cn("text-xs font-bold", (formData as any)[item.key] === 'Sim' ? "text-primary-green" : "text-gray-400")}>
                        {(formData as any)[item.key]}
                      </button>
                   </div>
                 ))}
              </div>
            </motion.div>
          )}

          {/* STEP 4: PAYMENT & TERMS */}
          {currentStep === 4 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Método de Recebimento</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                     {['Transferência bancária', 'Carteira digital', 'Dinheiro'].map(method => (
                        <button key={method} type="button" onClick={() => setFormData({...formData, paymentMethod: method})} className={cn("py-4 rounded-2xl text-xs font-bold border transition-all", formData.paymentMethod === method ? "bg-primary-dark text-white border-primary-dark" : "bg-white text-gray-400 border-gray-100")}>
                          {method}
                        </button>
                     ))}
                  </div>
               </div>

               {formData.paymentMethod === 'Transferência bancária' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Banco</label>
                      <input type="text" placeholder="Ex: BFA, BAI, BIC..." value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">IBAN</label>
                      <input type="text" placeholder="AO06..." value={formData.iban} onChange={e => setFormData({...formData, iban: e.target.value})} className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none text-xs font-mono" />
                    </div>
                 </div>
               )}

               <div className="pt-6 border-t border-gray-50 space-y-4">
                  <label className="flex items-center gap-4 cursor-pointer group">
                    <div className={cn(
                      "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                      formData.dataConfirmed ? "bg-primary-green border-primary-green" : "border-gray-200 group-hover:border-primary-green/50"
                    )} onClick={() => setFormData({...formData, dataConfirmed: !formData.dataConfirmed})}>
                      {formData.dataConfirmed && <Check size={16} className="text-white" />}
                    </div>
                    <span className="text-sm text-gray-600 font-medium">Confirmo que todos os dados fornecidos são verdadeiros e do meu conhecimento.</span>
                  </label>

                  <label className="flex items-center gap-4 cursor-pointer group">
                    <div className={cn(
                      "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                      formData.termsAccepted ? "bg-primary-green border-primary-green" : "border-gray-200 group-hover:border-primary-green/50"
                    )} onClick={() => setFormData({...formData, termsAccepted: !formData.termsAccepted})}>
                      {formData.termsAccepted && <Check size={16} className="text-white" />}
                    </div>
                    <span className="text-sm text-gray-600 font-medium">Aceito os termos e condições do <span className="text-primary-dark font-bold">Angola Smart Hub</span>.</span>
                  </label>
               </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row justify-between gap-4">
             <button 
              type="button" 
              onClick={currentStep === 1 ? () => navigate(-1) : handlePrev}
              className="px-8 py-4 rounded-2xl text-primary-dark font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all border border-gray-100"
             >
               <ArrowLeft size={20} /> {currentStep === 1 ? 'Cancelar' : 'Anterior'}
             </button>
             <button 
              disabled={isSubmitting}
              type="submit" 
              className="bg-primary-dark text-white px-10 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-xl shadow-primary-dark/20 min-w-[200px]"
             >
               {isSubmitting ? (
                 <Loader2 className="animate-spin" />
               ) : (
                 <>
                   {currentStep === 4 ? 'Enviar Solicitação' : 'Próximo Passo'} <ArrowRight size={20} />
                 </>
               )}
             </button>
          </div>
        </form>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-green/10 text-primary-green rounded-2xl flex items-center justify-center">
                 <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="font-bold text-sm">Segurança</h4>
                <p className="text-xs text-gray-500">Dados criptografados</p>
              </div>
           </div>
           <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                 <TrendingUp size={24} />
              </div>
              <div>
                <h4 className="font-bold text-sm">Escalabilidade</h4>
                <p className="text-xs text-gray-500">Milhares de rotas</p>
              </div>
           </div>
           <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
                 <CheckCircle2 size={24} />
              </div>
              <div>
                <h4 className="font-bold text-sm">Verificação</h4>
                <p className="text-xs text-gray-500">Selo oficial do Hub</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
