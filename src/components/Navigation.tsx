import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, X, Leaf, User, ShoppingBag, Truck, BarChart3, 
  Search, Bell, ShieldCheck, MapPin, Globe, ChevronRight,
  LogOut, Settings, Sun, Moon, Check, Facebook, Instagram, Linkedin, Twitter, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { auth } from '../lib/firebase.ts';
import { CheckoutFlow } from './CheckoutFlow.tsx';

const NAV_LINKS = [
  { name: 'Mercado', path: '/market', icon: ShoppingBag },
  { name: 'Cidadão Express', path: '/services', icon: User },
  { name: 'Logística', path: '/logistics', icon: Truck },
  { name: 'Bolsa de Preços', path: '/prices', icon: BarChart3 },
  { name: 'Mensagens', path: '/messages', icon: MessageSquare },
  { name: 'Perfil', path: '/profile', icon: User },
];

export function Navbar({ cartCount = 0, cartItems = [], onRemoveFromCart }: { cartCount?: number, cartItems?: any[], onRemoveFromCart?: (index: number) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activeSearch, setActiveSearch] = useState('');
  
  const notifications = [
    { id: 1, title: 'Preço do Milho subiu', desc: 'Aumento de 5% em Luanda hoje.', time: '2 min atrás', unread: true },
    { id: 2, title: 'Entrega Concluída', desc: 'A sua encomenda #8829 chegou.', time: '1h atrás', unread: true },
    { id: 3, title: 'Nova Funcionalidade', desc: 'Rastreabilidade agora disponível.', time: '3h atrás', unread: false },
  ];

  const cartTotal = cartItems.reduce((acc, item) => acc + (item.price || 0), 0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage) return null;

  return (
    <>
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300 md:px-2",
      scrolled ? "bg-white shadow-md border-b border-gray-100 py-3" : "bg-transparent text-white py-5"
    )}>
      <div className="max-w-[2000px] mx-auto flex items-center justify-between px-2 md:px-6">
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="bg-primary-green p-1.5 md:p-2 rounded-xl text-white group-hover:scale-110 transition-transform shadow-lg shadow-green-900/20">
            <Leaf size={20} />
          </div>
          <div className="flex flex-col justify-center">
            <span className={cn(
               "font-display font-bold text-sm md:text-lg leading-none tracking-tighter whitespace-nowrap",
               scrolled ? "text-primary-dark" : "text-white"
            )}>
              ANGOLA SMART HUB
            </span>
            <span className={cn(
              "text-[5px] md:text-[7px] font-black tracking-[0.2em] uppercase opacity-70 mt-0.5 whitespace-nowrap",
              scrolled ? "text-primary-green" : "text-white"
            )}>
              Tecnologia & Soberania
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-3 px-4 overflow-x-auto no-scrollbar">
          {user && NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "text-[10px] xl:text-[11px] font-bold hover:text-primary-green transition-all flex items-center gap-1 px-1.5 tracking-tight whitespace-nowrap",
                location.pathname === link.path 
                  ? "text-primary-green scale-105 underline decoration-2 underline-offset-4" 
                  : scrolled ? "text-primary-dark" : "text-white"
              )}
            >
              <link.icon size={12} className="shrink-0" />
              {link.name}
            </Link>
          ))}
          
          {user && user.email === 'claudioagostinho52@gmail.com' && (
            <Link 
              to="/admin" 
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                scrolled 
                  ? "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white" 
                  : "bg-white/10 text-white hover:bg-white hover:text-red-600"
              )}
            >
              <ShieldCheck size={14} /> Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          {user && (
            <div className="hidden sm:flex items-center gap-1 md:gap-2">
              <div className="relative">
                <button 
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className={cn(
                    "p-1 rounded-full hover:bg-gray-100/10 transition-colors relative",
                    scrolled ? "text-primary-dark hover:bg-gray-100" : "text-white"
                  )}
                >
                  <Search size={15} />
                </button>
                  
                  <AnimatePresence>
                    {isSearchOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 p-2 z-50 overflow-hidden"
                      >
                        <div className="relative">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input 
                            autoFocus
                            type="text"
                            placeholder="Pesquisar no Hub..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl text-primary-dark focus:outline-none border-none text-sm"
                            value={activeSearch}
                            onChange={(e) => setActiveSearch(e.target.value)}
                          />
                        </div>
                        {activeSearch && (
                          <div className="p-4 text-xs text-gray-500">
                            Pressione <kbd className="bg-gray-100 px-1.5 py-0.5 rounded border">Enter</kbd> para pesquisar por "{activeSearch}"
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link 
                  to="/messages"
                  className={cn(
                    "p-1.5 rounded-full hover:bg-gray-100/10 transition-colors relative",
                    scrolled ? "text-primary-dark hover:bg-gray-100" : "text-white"
                  )}
                >
                  <MessageSquare size={16} />
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary-green rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                </Link>

                <button 
                  onClick={() => setIsCartOpen(true)}
                  className={cn(
                    "p-1.5 rounded-full hover:bg-gray-100/10 transition-colors relative",
                    scrolled ? "text-primary-dark hover:bg-gray-100" : "text-white"
                  )}
                >
                  <ShoppingBag size={16} />
                  {cartCount > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-green text-white text-[8px] flex items-center justify-center rounded-full font-bold border border-white"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </button>

                <div className="relative">
                  <button 
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className={cn(
                      "p-1.5 rounded-full hover:bg-gray-100/10 transition-colors relative",
                      scrolled ? "text-primary-dark hover:bg-gray-100" : "text-white"
                    )}
                  >
                    <Bell size={16} />
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
                  </button>

                  <AnimatePresence>
                    {isNotificationsOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 py-4 z-50"
                      >
                        <div className="px-6 pb-3 border-b border-gray-50 mb-2 flex justify-between items-center">
                          <h4 className="font-bold text-primary-dark">Notificações</h4>
                          <span className="text-[10px] bg-primary-green/10 text-primary-green px-2 py-0.5 rounded-full font-bold">2 Novas</span>
                        </div>
                        <div className="max-h-[350px] overflow-y-auto">
                          {notifications.map(notif => (
                            <div key={notif.id} className="px-6 py-3 hover:bg-gray-50 transition-colors cursor-pointer relative">
                              {notif.unread && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary-green rounded-full" />}
                              <p className="font-bold text-sm text-primary-dark">{notif.title}</p>
                              <p className="text-xs text-gray-500 line-clamp-1">{notif.desc}</p>
                              <p className="text-[10px] text-gray-400 mt-1">{notif.time}</p>
                            </div>
                          ))}
                        </div>
                        <div className="px-6 pt-3 mt-2 border-t border-gray-50">
                          <button className="text-xs text-primary-green font-bold hover:underline w-full text-center">Ver todas as notificações</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
            </div>
          )}

          {user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-primary-green flex items-center justify-center text-white font-bold border-2 border-white shadow-md overflow-hidden relative group shrink-0"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}</span>
                  )}
                </button>
                
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-gray-100 py-4 z-50 text-primary-dark"
                    >
                      <div className="px-6 py-4 border-b border-gray-50 mb-2">
                        <p className="font-bold text-lg truncate">{profile?.displayName || user.displayName || 'Utilizador'}</p>
                        <p className="text-xs text-gray-500 truncate mb-3">{user.email}</p>
                        
                        {/* Status Badge */}
                        <div className="flex flex-col gap-2">
                          {(!profile?.status || profile?.status === 'normal') && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-yellow-100">
                              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" /> Conta Comprador
                            </span>
                          )}
                          {profile?.status === 'pending_verification' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" /> Vendedor Não Verificado
                            </span>
                          )}
                          {profile?.status === 'under_review' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-100">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" /> Em Análise
                            </span>
                          )}
                          {profile?.status === 'verified' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-200">
                              <Check size={10} strokeWidth={4} /> Vendedor Verificado
                            </span>
                          )}
                          {profile?.status === 'rejected' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100">
                              <X size={10} strokeWidth={4} /> Documentos Rejeitados
                            </span>
                          )}

                          {(!profile?.status || profile?.status === 'normal') && (
                            <Link 
                              to="/services" 
                              onClick={() => setIsProfileOpen(false)}
                              className="w-full mt-2 py-2.5 bg-primary-green/10 text-primary-green hover:bg-primary-green hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest text-center transition-all border border-primary-green/20"
                            >
                               Ser Vendedor / Formalizar
                            </Link>
                          )}
                        </div>
                      </div>
                      
                      <Link to="/profile" className="w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors text-sm font-medium">
                        <User size={18} /> Meu Perfil
                      </Link>

                      <button 
                        onClick={() => {
                          auth.signOut();
                          setIsProfileOpen(false);
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-3 px-6 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium text-red-600"
                      >
                        <LogOut size={18} /> Sair
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link 
                to="/login"
                className="bg-primary-green text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-green-900/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Entrar
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            className={cn("lg:hidden p-2", scrolled ? "text-primary-dark" : "text-white")}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-white shadow-2xl p-6 lg:hidden flex flex-col gap-4 border-t border-gray-100"
          >
            {user && NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 text-primary-dark font-medium p-3 rounded-xl hover:bg-gray-100"
              >
                <div className="p-2 bg-gray-50 rounded-lg">
                  <link.icon size={20} className="text-primary-green" />
                </div>
                {link.name}
              </Link>
            ))}
            {user && <hr />}
            {user ? (
               <div className="flex flex-col gap-4">
                 <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                   <div className="w-12 h-12 rounded-full bg-primary-green flex items-center justify-center text-white font-bold border-2 border-white shadow-sm overflow-hidden">
                      {user.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" /> : (profile?.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase())}
                   </div>
                   <div className="flex-1 min-w-0">
                      <p className="font-bold text-primary-dark truncate">{profile?.displayName || user.displayName || 'Utilizador'}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                   </div>
                 </div>
                 <Link 
                   to="/profile" 
                   onClick={() => setIsOpen(false)}
                   className="w-full bg-gray-50 p-4 rounded-xl text-center font-bold text-primary-dark border border-gray-100"
                 >
                   Ver Perfil Completo
                 </Link>
                 <button 
                   onClick={() => { auth.signOut(); setIsOpen(false); }} 
                   className="w-full bg-red-50 text-red-600 p-4 rounded-xl font-bold border border-red-100 flex items-center justify-center gap-2"
                 >
                    <LogOut size={20} /> Sair
                 </button>
               </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Link 
                  to="/login"
                  className="w-full bg-primary-green text-white py-4 rounded-xl text-center font-bold shadow-lg shadow-green-900/10 flex items-center justify-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  Aceder à Plataforma <ChevronRight size={18} />
                </Link>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>

    {/* Cart Sidebar */}
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-primary-dark/40 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-screen w-full max-w-md bg-white z-[101] shadow-2xl flex flex-col"
          >
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-primary-dark">Seu Carrinho</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{cartCount} itens selecionados</p>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="p-3 hover:bg-gray-100 rounded-2xl transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
              {cartItems.length > 0 ? (
                cartItems.map((item, index) => (
                  <motion.div 
                    layout
                    key={`${item.id}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4 p-4 rounded-3xl bg-gray-50 border border-gray-100 group"
                  >
                    <img src={item.image} alt={item.name} className="w-20 h-20 rounded-2xl object-cover shadow-sm" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-primary-dark">{item.name}</h4>
                        <button 
                          onClick={() => onRemoveFromCart?.(index)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{item.province} • {item.producerName}</p>
                      <p className="font-bold text-primary-green">{item.price.toLocaleString()} kz</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <ShoppingBag size={64} className="mb-4" />
                  <p className="font-bold text-lg">Seu carrinho está vazio</p>
                  <p className="text-sm">Explore o mercado e adicione produtos nacional.</p>
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-8 bg-gray-50 border-t border-gray-100 space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Subtotal</span>
                  <span className="text-2xl font-bold text-primary-dark">{cartTotal.toLocaleString()} kz</span>
                </div>
                <button 
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full bg-primary-green text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-green-900/20 hover:scale-[1.02] transition-transform"
                >
                  Finalizar Encomenda
                </button>
                <Link 
                  to="/market" 
                  onClick={() => setIsCartOpen(false)}
                  className="w-full flex items-center justify-center gap-2 text-primary-green font-bold hover:underline"
                >
                  Continuar Compras <ChevronRight size={18} />
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>

    <CheckoutFlow 
      isOpen={isCheckoutOpen} 
      onClose={() => setIsCheckoutOpen(false)} 
      cartItems={cartItems}
      onSuccess={() => {
        // Here we could clear the cart if managed globally
        navigate('/market');
      }}
    />
    </>
  );
}

export function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('success');
    setTimeout(() => {
      setStatus('idle');
      setEmail('');
    }, 5000);
  };

  return (
    <footer className="bg-primary-dark text-white pt-20 pb-10 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 border-b border-white/10 pb-16">
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Leaf className="text-primary-green" />
            <span className="font-display font-bold text-2xl tracking-tight">ANGOLA SMART HUB</span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Liderando a revolução digital no sector agrícola angolano. Conectando produtores, 
            empresas e consumidores com transparência e eficiência.
          </p>
          <div className="flex gap-4">
            {[
              { icon: Facebook, label: 'Facebook' },
              { icon: Instagram, label: 'Instagram' },
              { icon: Linkedin, label: 'LinkedIn' },
              { icon: Twitter, label: 'Twitter' }
            ].map((social, i) => (
              <div key={i} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:border-primary-green hover:text-primary-green hover:bg-white/5 transition-all cursor-pointer group" title={social.label}>
                <social.icon size={18} className="transition-transform group-hover:scale-110" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-6">Plataforma</h4>
          <ul className="space-y-4 text-gray-400 text-sm">
            <li><Link to="/market" className="hover:text-primary-green">AgroSmart Market</Link></li>
            <li><Link to="/logistics" className="hover:text-primary-green">Logística Nacional</Link></li>
            <li><Link to="/prices" className="hover:text-primary-green">Bolsa de Preços</Link></li>
            <li><Link to="/services" className="hover:text-primary-green">Cidadão Express</Link></li>
          </ul>
        </div>

        <div>
           <h4 className="font-bold text-lg mb-6">Siga-nos</h4>
          <ul className="space-y-4 text-gray-400 text-sm">
            <li><Link to="/" className="hover:text-primary-green">Sobre o Projecto</Link></li>
            <li><Link to="/" className="hover:text-primary-green">Equipa</Link></li>
            <li><Link to="/" className="hover:text-primary-green">Roadmap</Link></li>
            <li><Link to="/" className="hover:text-primary-green">Contacto</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-6">Newsletter</h4>
          <p className="text-gray-400 text-sm mb-4">Receba atualizações sobre a colheita e bolsa de preços.</p>
          {status === 'success' ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-primary-green/20 text-primary-green p-4 rounded-xl border border-primary-green/30 flex items-center gap-3"
            >
              <Check size={20} />
              <span className="text-sm font-bold">Subscrição concluída!</span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input 
                required
                type="email" 
                placeholder="Seu melhor email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm w-full focus:outline-none focus:border-primary-green"
              />
              <button type="submit" className="bg-primary-green p-2 rounded-lg group">
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          )}
        </div>
      </div>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mt-10 text-gray-500 text-xs gap-4">
        <p>© 2026 ANGOLA SMART HUB - Todos os direitos reservados.</p>
        <div className="flex gap-6">
          <Link to="/about" className="hover:text-white">Termos & Condições</Link>
          <Link to="/privacy" className="hover:text-white">Política de Privacidade</Link>
          <Link to="/privacy" className="hover:text-white">Cookies</Link>
        </div>
      </div>
    </footer>
  );
}
