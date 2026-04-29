import React, { useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, Lock, User, CreditCard, MapPin, Loader2, 
  CheckCircle2, ChevronRight, AlertCircle, LogIn,
  Building2, Phone, ShieldCheck, Eye, EyeOff,
  ArrowLeft, Sparkles, Truck, ShoppingCart, Briefcase,
  Store, Globe, Camera, Zap, ChevronLeft
} from 'lucide-react';
import { auth, db } from '../lib/firebase.ts';
import { cn } from '../lib/utils.ts';

// Constants for Angola
const PROVINCES = [
  'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango', 'Cuanza Norte', 
  'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla', 'Luanda', 'Lunda Norte', 
  'Lunda Sul', 'Malanje', 'Moxico', 'Namibe', 'Uíge', 'Zaire'
];

const ACCOUNT_TYPES = [
  { 
    id: 'buyer', 
    title: 'Comprador', 
    desc: 'Para comprar produtos agrícolas e acompanhar entregas.', 
    icon: ShoppingCart,
    color: 'bg-blue-50 text-blue-600 border-blue-100'
  },
  { 
    id: 'seller', 
    title: 'Profissional', 
    desc: 'Para vender produtos e prestar serviços na plataforma.', 
    icon: Store,
    color: 'bg-primary-green/10 text-primary-green border-primary-green/20'
  },
  { 
    id: 'transporter', 
    title: 'Transportador', 
    desc: 'Para realizar entregas e aceitar pedidos de transporte.', 
    icon: Truck,
    color: 'bg-orange-50 text-orange-600 border-orange-100'
  }
];

type AuthStep = 'login' | 'selection' | 'form' | 'success';
type SellerSubType = 'personal' | 'organization' | null;

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Steps management
  const [step, setStep] = useState<AuthStep>(location.pathname === '/register' ? 'selection' : 'login');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [sellerSubType, setSellerSubType] = useState<SellerSubType>(null);
  
  // UI State
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);

  // General Form Data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    phone: '+244',
    province: '',
    municipality: '',
    // Professional/Org Specific
    nif: '',
    hasNif: true,
    activityType: '',
    mainProducts: [] as string[],
    monthlyCapacity: '',
    farmName: '',
    orgType: '',
    responsibleName: '',
    address: '',
    preferences: [] as string[],
  });

  useEffect(() => {
    setStep(location.pathname === '/register' ? 'selection' : 'login');
    setError(null);
  }, [location.pathname]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getErrorMessage = (code: string) => {
    switch (code) {
      case 'auth/email-already-in-use': return 'Este endereço de email já está registado.';
      case 'auth/invalid-email': return 'O endereço de email introduzido não é válido.';
      case 'auth/weak-password': return 'A palavra-passe deve ter pelo menos 6 caracteres.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential': return 'Email ou palavra-passe incorretos.';
      case 'auth/too-many-requests': return 'Demasiadas tentativas falhadas. Tente mais tarde.';
      default: return 'Ocorreu um erro inesperado. Tente novamente.';
    }
  };

  const validateStep = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('As palavras-passe não coincidem.');
      return false;
    }
    if (!isAgreed) {
      setError('Deve aceitar os Termos e Condições para continuar.');
      return false;
    }
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateStep()) return;

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Status logic
      let initialStatus = 'normal';
      if (selectedType === 'seller' || selectedType === 'transporter') {
        initialStatus = 'pending_verification';
      }

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName: formData.displayName,
        email: user.email,
        phone: formData.phone,
        province: formData.province,
        municipality: formData.municipality,
        accountType: selectedType,
        sellerSubType: sellerSubType,
        status: initialStatus,
        nif: formData.nif,
        activityType: formData.activityType,
        monthlyCapacity: formData.monthlyCapacity,
        farmName: formData.farmName,
        responsibleName: formData.responsibleName,
        preferences: formData.preferences,
        createdAt: serverTimestamp(),
        isGoogleAccount: false
      });

      await updateProfile(user, { displayName: formData.displayName });
      setStep('success');
    } catch (err: any) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      navigate('/');
    } catch (err: any) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Admin specific check to ensure smooth entry
      const ADMIN_EMAIL = 'claudioagostinho52@gmail.com';
      const isAdmin = user.email === ADMIN_EMAIL;
      
      // Check if profile exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          status: isAdmin ? 'verified' : 'incomplete',
          accountType: isAdmin ? 'admin' : 'buyer',
          createdAt: serverTimestamp(),
          isGoogleAccount: true,
          photoURL: user.photoURL
        }, { merge: true });
        
        if (isAdmin) {
          navigate('/admin');
        } else {
          navigate('/market'); 
        }
      } else {
        if (isAdmin) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (err: any) {
      console.error("Google Sign In Error:", err);
      if (err.code === 'auth/popup-blocked') {
        setError('O popup de login foi bloqueado pelo seu navegador. Por favor, permita popups para este site.');
      } else if (err.code === 'auth/cancelled-by-user') {
        setError('O login foi cancelado.');
      } else {
        setError(getErrorMessage(err.code));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white relative overflow-hidden">
      {/* 📸 VISUAL COLUMN - Right Side Desktop / Top Banner Mobile */}
      <div className="w-full md:w-1/2 lg:w-[55%] h-[300px] md:h-screen relative overflow-hidden bg-primary-dark">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <img 
            src={
              step === 'login' 
                ? "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=2070&auto=format&fit=crop" 
                : "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop"
            }
            alt="Fundo Angola Smart Hub" 
            className="w-full h-full object-cover grayscale-[20%] brightness-50"
          />
        </motion.div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-end p-8 md:p-20">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="max-w-2xl"
          >
            <h2 className="text-5xl md:text-7xl lg:text-9xl font-display font-bold text-white leading-[0.85] mb-8 tracking-tighter">
              ANGOLA<br />
              <span className="text-primary-green">HUB</span>
            </h2>
            <p className="text-xl md:text-2xl text-white/90 font-light leading-relaxed mb-10 max-w-lg">
              Conectando o campo ao seu destino final com tecnologia soberana.
            </p>
            <div className="flex items-center gap-8 opacity-40 grayscale group-hover:opacity-100 transition-all duration-700">
              <img src="https://upload.wikimedia.org/wikipedia/commons/9/9d/Emblema_da_Rep%C3%BAblica_de_Angola.svg" alt="Governo de Angola" className="h-16" />
              <div className="h-12 w-px bg-white/20" />
              <p className="text-[10px] text-white uppercase font-black tracking-[0.5em] leading-tight">Digitalização<br />Nacional</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ✍️ FORM COLUMN - Left Side Desktop / Content Area Mobile */}
      <div className="w-full md:w-1/2 lg:w-[45%] min-h-screen bg-white flex flex-col p-6 sm:p-12 lg:p-20 overflow-y-auto">
        <div className="flex items-center justify-between mb-16">
          <Link to="/" className="flex items-center gap-3">
             <div className="w-10 h-10 bg-primary-green rounded-xl flex items-center justify-center text-white">
                <Globe size={24} />
             </div>
             <span className="font-display font-bold text-lg hidden sm:block">ANGOLA<span className="text-primary-green">HUB</span></span>
          </Link>
          <div className="flex items-center gap-2">
             <span className="text-xs text-gray-400 font-medium">{step === 'login' ? 'Ainda não é membro?' : 'Já tem conta?'}</span>
             <button 
              onClick={() => step === 'login' ? navigate('/register') : navigate('/login')}
              className="text-xs font-bold text-primary-dark hover:text-primary-green transition-colors"
             >
               {step === 'login' ? 'Começar Agora' : 'Entrar'}
             </button>
          </div>
        </div>

        <div className="max-w-md w-full mx-auto">
          <AnimatePresence mode="wait">
            {step === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <header className="mb-10">
                  <h1 className="text-4xl font-display font-bold text-primary-dark mb-4">Entrar na Plataforma</h1>
                  <p className="text-gray-500 font-medium">Acesse sua conta para comprar, vender e acompanhar serviços.</p>
                </header>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-[20px] flex items-center gap-3 text-sm font-medium">
                    <AlertCircle size={18} /> {error}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Email ou Telefone</label>
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary-green transition-colors" size={20} />
                      <input 
                        type="email" 
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="exemplo@hub.ao"
                        className="w-full pl-14 pr-5 py-5 rounded-[24px] bg-gray-50 border border-transparent focus:bg-white focus:border-primary-green focus:ring-4 focus:ring-primary-green/5 transition-all text-sm outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between px-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Palavra-passe</label>
                      <button type="button" className="text-[10px] font-bold text-primary-green hover:underline">Esqueceu?</button>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary-green transition-colors" size={20} />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className="w-full pl-14 pr-14 py-5 rounded-[24px] bg-gray-50 border border-transparent focus:bg-white focus:border-primary-green focus:ring-4 focus:ring-primary-green/5 transition-all text-sm outline-none"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-dark"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-1">
                    <input type="checkbox" id="remember" className="rounded border-gray-300 text-primary-green focus:ring-primary-green" />
                    <label htmlFor="remember" className="text-xs text-gray-500 font-medium">Lembrar-me neste dispositivo</label>
                  </div>

                  <button 
                    disabled={loading}
                    className="w-full py-5 bg-primary-dark text-white rounded-[24px] font-bold hover:bg-black transition-all shadow-xl shadow-primary-dark/20 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <>Entrar na Conta <ChevronRight size={20} /></>}
                  </button>
                </form>

                <div className="mt-10">
                   <div className="flex items-center gap-4 mb-8">
                     <hr className="flex-1 border-gray-100" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">ou aceder com</span>
                     <hr className="flex-1 border-gray-100" />
                   </div>

                   <button 
                    onClick={handleGoogleSignIn}
                    className="w-full py-4 rounded-[24px] border border-gray-100 bg-white hover:bg-gray-50 transition-all flex items-center justify-center gap-4 font-bold text-sm shadow-sm"
                   >
                     <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                     Entrar com Google
                   </button>
                </div>
              </motion.div>
            )}

            {step === 'selection' && (
              <motion.div
                key="selection"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <header className="mb-10">
                  <h1 className="text-4xl font-display font-bold text-primary-dark mb-4">Escolha o seu Perfil</h1>
                  <p className="text-gray-500 font-medium">Como deseja participar no ecossistema do Agribusiness em Angola?</p>
                </header>

                <div className="space-y-6">
                  {ACCOUNT_TYPES.map((type) => (
                    <motion.button
                      key={type.id}
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedType(type.id);
                        if (type.id === 'seller') setStep('selection'); 
                        else setStep('form');
                      }}
                      className={cn(
                        "w-full flex items-center gap-6 p-8 rounded-[32px] border-2 text-left transition-all group relative overflow-hidden",
                        selectedType === type.id 
                          ? "border-primary-green bg-primary-green/5" 
                          : "border-gray-50 hover:border-gray-200 bg-white"
                      )}
                    >
                      <div className={cn(
                        "w-16 h-16 rounded-[22px] flex items-center justify-center shrink-0 transition-transform group-hover:rotate-6",
                        type.color
                      )}>
                        <type.icon size={32} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1 text-primary-dark">{type.title}</h3>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">{type.desc}</p>
                      </div>
                      <ChevronRight size={20} className="text-gray-300 group-hover:text-primary-dark" />
                    </motion.button>
                  ))}
                  
                  {selectedType === 'seller' && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-primary-dark/40 backdrop-blur-sm">
                       <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white max-w-lg w-full rounded-[48px] p-10 shadow-2xl"
                       >
                          <h3 className="text-3xl font-display font-bold mb-4">Tipo de Vendedor</h3>
                          <p className="text-gray-500 mb-8 font-medium leading-relaxed">Pessoa singular ou representante de uma cooperativa/empresa?</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <button 
                              onClick={() => { setSellerSubType('personal'); setStep('form'); }}
                              className="p-8 rounded-[32px] border-2 border-gray-100 hover:border-primary-green hover:bg-green-50 transition-all text-center group"
                             >
                                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400 group-hover:text-primary-green transition-colors">
                                   <User size={28} />
                                </div>
                                <h4 className="font-bold mb-1">Individual</h4>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-[9px]">Independente</p>
                             </button>
                             <button 
                              onClick={() => { setSellerSubType('organization'); setStep('form'); }}
                              className="p-8 rounded-[32px] border-2 border-gray-100 hover:border-primary-green hover:bg-green-50 transition-all text-center group"
                             >
                                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400 group-hover:text-primary-green transition-colors">
                                   <Building2 size={28} />
                                </div>
                                <h4 className="font-bold mb-1">Organização</h4>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-[9px]">Cooperativa/Empresa</p>
                             </button>
                          </div>
                          <button onClick={() => setSelectedType(null)} className="mt-8 text-xs font-bold text-gray-400 hover:text-red-500 w-full">Cancelar</button>
                       </motion.div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 'form' && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <header className="mb-10">
                  <button onClick={() => setStep('selection')} className="flex items-center gap-2 text-gray-400 hover:text-primary-dark font-bold uppercase tracking-widest text-[9px] mb-6"><ChevronLeft size={14} /> Voltar</button>
                  <h1 className="text-3xl font-display font-bold mb-2">
                    {selectedType === 'buyer' ? 'Criar Conta Comprador' : 'Registo Profissional Hub'}
                  </h1>
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden mt-4">
                    <div className="h-full bg-primary-green w-1/2" />
                  </div>
                </header>

                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="space-y-4">
                    <input 
                      type="text" 
                      name="displayName"
                      required
                      value={formData.displayName}
                      onChange={handleInputChange}
                      placeholder={sellerSubType === 'organization' ? "Nome da Organização" : "Nome Completo"}
                      className="w-full px-5 py-5 rounded-[24px] bg-gray-50 border border-transparent focus:bg-white focus:border-primary-green transition-all text-sm outline-none"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        type="tel" 
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+244"
                        className="w-full px-5 py-5 rounded-[24px] bg-gray-50 border border-transparent focus:bg-white focus:border-primary-green transition-all text-sm outline-none"
                      />
                      <input 
                        type="email" 
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email"
                        className="w-full px-5 py-5 rounded-[24px] bg-gray-50 border border-transparent focus:bg-white focus:border-primary-green transition-all text-sm outline-none"
                      />
                    </div>
                  </div>

                  {selectedType === 'buyer' && (
                    <div className="space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Interesses de Compra</p>
                      <div className="flex flex-wrap gap-2">
                        {['Hortícolas', 'Frutas', 'Cereais', 'Carnes', 'Tubérculos', 'Peixe'].map(pref => (
                          <button
                            key={pref}
                            type="button"
                            onClick={() => {
                              const newPrefs = formData.preferences.includes(pref)
                                ? formData.preferences.filter(p => p !== pref)
                                : [...formData.preferences, pref];
                              setFormData(prev => ({ ...prev, preferences: newPrefs }));
                            }}
                            className={cn(
                              "px-4 py-2 rounded-full text-xs font-bold transition-all border",
                              formData.preferences.includes(pref)
                                ? "bg-primary-green text-white border-primary-green"
                                : "bg-white text-gray-500 border-gray-100 hover:border-primary-green"
                            )}
                          >
                            {pref}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {(selectedType === 'seller' || selectedType === 'transporter') && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <select 
                          name="activityType"
                          required
                          value={formData.activityType}
                          onChange={handleInputChange}
                          className="w-full px-5 py-5 rounded-[24px] bg-gray-50 border border-transparent focus:bg-white focus:border-primary-green text-sm outline-none font-medium"
                        >
                          <option value="">Tipo de Atividade</option>
                          <option value="Agricultura">Agricultura</option>
                          <option value="Pecuária">Pecuária</option>
                          <option value="Pesca">Pesca</option>
                          <option value="Logística">Logística / Transporte</option>
                          <option value="Processamento">Processamento / Indústria</option>
                        </select>
                        <input 
                          type="text" 
                          name="monthlyCapacity"
                          required
                          value={formData.monthlyCapacity}
                          onChange={handleInputChange}
                          placeholder="Capacidade (Ex: 5 Ton/mês)"
                          className="w-full px-5 py-5 rounded-[24px] bg-gray-50 border border-transparent focus:bg-white focus:border-primary-green text-sm outline-none"
                        />
                      </div>
                      
                      {sellerSubType === 'organization' && (
                        <input 
                          type="text" 
                          name="responsibleName"
                          required
                          value={formData.responsibleName}
                          onChange={handleInputChange}
                          placeholder="Nome do Responsável Legal"
                          className="w-full px-5 py-5 rounded-[24px] bg-gray-50 border border-transparent focus:bg-white focus:border-primary-green text-sm outline-none"
                        />
                      )}

                      <input 
                        type="text" 
                        name="farmName"
                        required={selectedType === 'seller'}
                        value={formData.farmName}
                        onChange={handleInputChange}
                        placeholder={selectedType === 'seller' ? "Nome da Fazenda / Projecto" : "Nome da Frota / Empresa"}
                        className="w-full px-5 py-5 rounded-[24px] bg-gray-50 border border-transparent focus:bg-white focus:border-primary-green text-sm outline-none"
                      />

                      <div className="flex items-center gap-2 p-4 bg-primary-green/5 border border-primary-green/20 rounded-2xl">
                        <MapPin size={18} className="text-primary-green" />
                        <span className="text-xs text-primary-green font-bold">Localização GPS capturada automaticamente</span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <select 
                      name="province"
                      required
                      value={formData.province}
                      onChange={handleInputChange}
                      className="w-full px-5 py-5 rounded-[24px] bg-gray-50 border border-transparent focus:bg-white focus:border-primary-green text-sm outline-none font-medium"
                    >
                      <option value="">Província</option>
                      {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <input 
                      type="text" 
                      name="municipality"
                      required
                      value={formData.municipality}
                      onChange={handleInputChange}
                      placeholder="Município"
                      className="w-full px-5 py-5 rounded-[24px] bg-gray-50 border border-transparent focus:bg-white focus:border-primary-green text-sm outline-none font-medium"
                    />
                  </div>

                  {(selectedType === 'seller' || selectedType === 'transporter') && (
                    <div className="space-y-4">
                      <input 
                        type="text" 
                        name="nif"
                        value={formData.nif}
                        onChange={handleInputChange}
                        placeholder="NIF (Opcional se ainda não tiver)"
                        className="w-full px-5 py-5 rounded-[24px] bg-gray-50 border border-transparent focus:bg-white focus:border-primary-green text-sm outline-none"
                      />
                    </div>
                  )}

                  <div className="space-y-4">
                    <input 
                      type="password" 
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Palavra-passe"
                      className="w-full px-5 py-5 rounded-[24px] bg-gray-50 border border-transparent focus:bg-white focus:border-primary-green text-sm outline-none"
                    />
                    <input 
                      type="password" 
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirmar palavra-passe"
                      className="w-full px-5 py-5 rounded-[24px] bg-gray-50 border border-transparent focus:bg-white focus:border-primary-green text-sm outline-none"
                    />
                  </div>

                  <div className="flex items-start gap-3 px-1">
                    <input 
                      type="checkbox" 
                      required
                      checked={isAgreed}
                      onChange={(e) => setIsAgreed(e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-primary-green" 
                    />
                    <span className="text-[10px] text-gray-400 font-medium">
                      Aceito os <Link to="/about" className="text-primary-green font-bold">Termos e Condições</Link> e a <Link to="/privacy" className="text-primary-green font-bold">Política de Privacidade</Link> do Smart Hub.
                    </span>
                  </div>

                  <button 
                    disabled={loading}
                    className="w-full py-5 bg-primary-dark text-white rounded-[24px] font-bold hover:bg-black transition-all shadow-xl shadow-primary-dark/20 flex items-center justify-center gap-3"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <>Criar Perfil <ChevronRight size={20} /></>}
                  </button>
                </form>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="w-24 h-24 bg-primary-green text-white rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-xl">
                   <CheckCircle2 size={48} />
                </div>
                <h1 className="text-3xl font-display font-bold mb-4">Conta Criada!</h1>
                <p className="text-gray-500 mb-10 font-medium">Seja bem-vindo ao Hub. A sua jornada logística começa aqui.</p>
                <button 
                  onClick={() => navigate('/market')}
                  className="w-full py-5 bg-primary-dark text-white rounded-[24px] font-bold shadow-xl shadow-primary-dark/20"
                >
                   Explorar Mercado
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

