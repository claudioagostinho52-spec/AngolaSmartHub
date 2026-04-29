import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Mail, CreditCard, MapPin, Package, Clock, 
  CheckCircle2, ChevronRight, ShoppingBag, FileText,
  Calendar, Settings, LogOut, ShieldCheck, TrendingUp,
  Wallet, Star, Plus, Edit, Truck, Bell, Shield, X,
  Building2, Leaf, BarChart3, ArrowUpRight, Search, QrCode
} from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext.tsx';
import { db } from '../lib/firebase.ts';
import { cn } from '../lib/utils.ts';
import { Link, useNavigate } from 'react-router-dom';

import { QRCodeCanvas } from 'qrcode.react';

export function ProfilePage() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSegment, setActiveSegment] = useState<'overview' | 'orders' | 'tracking' | 'addresses' | 'security' | 'seller_central'>('overview');
  const [loading, setLoading] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  if (!user) return null;

  const profileUrl = `https://hub.ao/profile/${user.uid}`;

  const stats = [
    { label: 'Compras Totais', value: '12', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Em Trânsito', value: '02', icon: Truck, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Favoritos', value: '08', icon: Star, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'Entregues', value: '10', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  const activeOrders = [
    { id: 'ASH-9921', item: 'Adubo Fertilizante NPK', progress: 65, status: 'Em Transporte', date: 'Previsão: 02 Mai', carrier: 'TransAngola Lda' },
    { id: 'ASH-8830', item: 'Sementes de Milho 25kg', progress: 30, status: 'Em Preparação', date: 'Previsão: 05 Mai', carrier: 'Logística Kwanza' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-24">
      {/* Upper Navigation / Tab Bar */}
      <div className="bg-white border-b border-gray-100 sticky top-20 z-40 overflow-x-auto no-scrollbar shadow-sm">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center gap-12 min-w-max">
          {[
            { id: 'overview', label: 'Resumo', icon: BarChart3 },
            { id: 'orders', label: 'Minhas Compras', icon: ShoppingBag },
            { id: 'tracking', label: 'Rastreamento', icon: Truck },
            { id: 'addresses', label: 'Endereços', icon: MapPin },
            { id: 'security', label: 'Segurança', icon: Shield },
            ...(profile?.userType === 'seller' || profile?.userType === 'organization' 
              ? [{ id: 'seller_central', label: 'Central do Vendedor', icon: Leaf }] 
              : [])
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSegment(tab.id as any)}
              className={cn(
                "flex items-center gap-3 h-full px-4 text-sm font-black transition-all border-b-4 uppercase tracking-[0.1em]",
                activeSegment === tab.id 
                  ? "border-primary-green text-primary-green" 
                  : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200"
              )}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 w-full">
        <div className="grid lg:grid-cols-4 gap-12">
          {/* Sidebar / Left Column */}
          <div className="lg:col-span-1 space-y-8">
            {/* Profile Card */}
            <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-xl shadow-gray-200/50 text-center relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-2 bg-primary-green" />
               <div className="relative z-10">
                  <div className="w-24 h-24 rounded-full bg-primary-green/10 text-primary-green flex items-center justify-center text-3xl font-black mx-auto mb-6 border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-500">
                    {user.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover rounded-full" /> : profile?.displayName?.charAt(0) || 'U'}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 leading-tight mb-2">{profile?.displayName || user.displayName}</h3>
                  <p className="text-xs text-gray-400 font-medium mb-4">{user.email}</p>
                  
                  {/* Status Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100 mb-6">
                    <ShieldCheck size={12} /> {profile?.status === 'verified' ? 'Vendedor Verificado' : 'Conta Padrão'}
                  </div>

                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => setShowQRCode(true)}
                      className="flex items-center justify-center gap-2 w-full py-3 bg-primary-green/10 text-primary-green hover:bg-primary-green hover:text-white rounded-2xl text-xs font-bold transition-all"
                    >
                      <QrCode size={14} /> Gerar QR Code Perfil
                    </button>
                    <button className="flex items-center justify-center gap-2 w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-2xl text-xs font-bold transition-all transform hover:-translate-y-0.5">
                      <Edit size={14} /> Editar Perfil
                    </button>
                    <button 
                      onClick={() => logout()}
                      className="flex items-center justify-center gap-2 w-full py-3 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 rounded-2xl text-xs font-bold transition-all"
                    >
                      <LogOut size={14} /> Sair da Conta
                    </button>
                  </div>
               </div>
            </div>

            {/* QR Code Modal */}
            <AnimatePresence>
              {showQRCode && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-primary-dark/60 backdrop-blur-sm">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-[40px] p-10 max-w-sm w-full text-center relative"
                  >
                    <button onClick={() => setShowQRCode(false)} className="absolute top-6 right-6 text-gray-400 hover:text-primary-dark transition-colors">
                      <X size={20} />
                    </button>
                    <div className="w-16 h-16 bg-primary-green/10 text-primary-green rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <QrCode size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">QR Code de Rastreio</h3>
                    <p className="text-xs text-gray-500 mb-8 leading-relaxed">Este código permite que parceiros e clientes verifiquem a sua identidade e histórico no Hub de forma instantânea.</p>
                    <div className="bg-white p-4 rounded-3xl border-2 border-primary-green/20 inline-block mb-8">
                      <QRCodeCanvas value={profileUrl} size={180} level="H" />
                    </div>
                    <button 
                      onClick={() => { /* logic to download */ }}
                      className="w-full py-4 bg-primary-dark text-white rounded-2xl font-bold text-sm shadow-xl shadow-black/20"
                    >
                      Descarregar QR Code
                    </button>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Reputação / Feedback */}
            <div className="bg-primary-dark rounded-[40px] p-8 text-white relative overflow-hidden">
               <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary-green opacity-20 blur-3xl" />
               <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Reputação Smart</p>
                    <Star size={16} className="text-primary-green fill-primary-green" />
                  </div>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-4xl font-display font-black">4.9</span>
                    <span className="text-white/40 font-bold mb-1">/ 5.0</span>
                  </div>
                  <p className="text-xs text-white/60 font-medium leading-relaxed">Excelente histórico de compras e comportamento na plataforma.</p>
                  <div className="mt-6 flex items-center gap-2 group cursor-pointer">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary-green group-hover:gap-3 transition-all">Ver todos feedbacks</span>
                    <ChevronRight size={12} className="text-primary-green" />
                  </div>
               </div>
            </div>
          </div>

          {/* Main Workspace / Right Column */}
          <div className="lg:col-span-3">
             <AnimatePresence mode="wait">
                {activeSegment === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-10"
                  >
                    {/* Welcome Header */}
                    <div className="flex items-center justify-between">
                       <div>
                          <h2 className="text-2xl font-bold text-gray-900 leading-tight">Olá, <span className="text-primary-green font-black">{profile?.displayName?.split(' ')[0]}!</span></h2>
                          <p className="text-gray-500 font-medium">Bem-vindo ao seu painel administrativo pessoal.</p>
                       </div>
                       <div className="hidden md:flex gap-4">
                          <div className="text-right">
                             <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Último Login</p>
                             <p className="text-xs font-bold text-gray-700">Hoje às 14:32</p>
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400">
                             <Calendar size={18} />
                          </div>
                       </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {stats.map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm transition-all hover:scale-105">
                           <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center mb-4", stat.bg, stat.color)}>
                              <stat.icon size={20} />
                           </div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
                           <p className="text-2xl font-display font-black text-gray-900">{stat.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Quick Actions & Ongoing */}
                    <div className="grid md:grid-cols-2 gap-8">
                       {/* Active Tracking Card */}
                       <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                             <Truck size={20} className="text-primary-green" /> Encomendas Ativas
                          </h3>
                          <div className="space-y-8">
                             {activeOrders.map(order => (
                               <div key={order.id} className="relative">
                                  <div className="flex justify-between items-end mb-3">
                                     <div>
                                        <p className="text-xs font-black text-primary-green uppercase tracking-widest leading-none mb-1">{order.id}</p>
                                        <p className="text-sm font-bold text-gray-900">{order.item}</p>
                                     </div>
                                     <p className="text-[10px] font-medium text-gray-400">{order.date}</p>
                                  </div>
                                  <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden mb-2">
                                     <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${order.progress}%` }}
                                      className="h-full bg-primary-green rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]" 
                                    />
                                  </div>
                                  <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.1em] text-gray-400">
                                     <span>{order.status}</span>
                                     <span className="text-primary-green">{order.carrier}</span>
                                  </div>
                               </div>
                             ))}
                          </div>
                       </div>

                       {/* Formalization / Upgrade Card */}
                       {profile?.userType !== 'seller' && (
                         <div className="bg-white rounded-[40px] p-10 border-2 border-dashed border-primary-green/30 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-primary-green transition-all"
                            onClick={() => navigate('/services')}
                         >
                            <div className="w-16 h-16 bg-primary-green/10 text-primary-green rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                               <Shield size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Tornar-se Vendedor Verificado</h3>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed mb-6">Para vender produtos e aceder a benefícios de crédito, formalize a sua atividade no Cidadão Express.</p>
                            <button className="px-8 py-3 bg-primary-green text-white rounded-2xl text-xs font-bold shadow-xl shadow-green-900/20 active:scale-95 transition-all">Começar Formalização</button>
                         </div>
                       )}
                    </div>
                  </motion.div>
                )}

                {activeSegment === 'orders' && (
                  <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                     <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold">Histórico de Compras</h3>
                        <div className="flex gap-2">
                           <button className="px-4 py-2 bg-primary-green text-white rounded-xl text-xs font-bold">Todas</button>
                           <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-500">Pendentes</button>
                        </div>
                     </div>
                     {[1, 2, 3].map(i => (
                       <div key={i} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex items-center justify-between group hover:border-primary-green transition-all">
                          <div className="flex items-center gap-6">
                             <div className="w-16 h-16 bg-gray-50 rounded-[24px] flex items-center justify-center text-primary-green">
                                <Package size={24} />
                             </div>
                             <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">HASH-770{i}</p>
                                <h4 className="font-bold text-gray-900">Sacas de Fertilizante TopHarvest</h4>
                                <p className="text-xs text-gray-500 font-medium">Comprado em 20 Abr 2026</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-xl font-display font-black text-gray-900">25.000 Kz</p>
                             <div className="flex items-center justify-end gap-1 mt-1">
                                <CheckCircle2 size={12} className="text-green-500" />
                                <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Entregue</span>
                             </div>
                          </div>
                          <div className="ml-8 hidden md:block">
                             <button className="p-3 bg-gray-50 rounded-2xl text-gray-400 group-hover:bg-primary-green group-hover:text-white transition-all">
                                <ChevronRight size={18} />
                             </button>
                          </div>
                       </div>
                     ))}
                  </motion.div>
                )}

                {activeSegment === 'seller_central' && (
                   <motion.div key="seller" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         {[
                           { label: 'Vendas Totais', val: '1.240.000 Kz', icon: Wallet },
                           { label: 'Feedback Positivo', val: '98%', icon: Star },
                           { label: 'Produtos Ativos', val: '24', icon: Leaf }
                         ].map((s, i) => (
                           <div key={i} className="bg-primary-green p-8 rounded-[40px] text-white shadow-xl shadow-green-900/10">
                              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                                 <s.icon size={20} />
                              </div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-1">{s.label}</p>
                              <p className="text-2xl font-display font-black">{s.val}</p>
                           </div>
                         ))}
                      </div>

                      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                         <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="font-bold">Produtos em Venda</h3>
                            <button className="px-6 py-3 bg-primary-dark text-white rounded-2xl text-xs font-bold flex items-center gap-2">
                               <Plus size={16} /> Novo Produto
                            </button>
                         </div>
                         <div className="p-8 space-y-6">
                            {[1, 2].map(i => (
                              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-3xl">
                                 <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary-green">
                                       <Leaf size={24} />
                                    </div>
                                    <div>
                                       <p className="font-bold text-gray-900">Mandioca Fresca (Sacas 50kg)</p>
                                       <p className="text-[10px] text-gray-400 font-bold uppercase">Stock: 120 Uni. • 4.500 Kz/Kg</p>
                                    </div>
                                 </div>
                                 <button className="p-2 text-gray-400 hover:text-primary-green transition-all"><Edit size={16} /></button>
                              </div>
                            ))}
                         </div>
                      </div>
                   </motion.div>
                )}
             </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
