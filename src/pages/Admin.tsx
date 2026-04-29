import React, { useState, useEffect } from 'react';
import { 
  Users, ShoppingBag, Truck, BarChart3, ShieldCheck, 
  Search, Bell, Filter, ChevronRight, X, Check, 
  Clock, Package, FileText, AlertCircle, TrendingUp,
  MoreVertical, Download, Lock, Unlock, MapPin, Eye,
  Building2, Leaf
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, getDocs, where, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { UserProfile } from '../types.ts';
import { cn } from '../lib/utils.ts';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'approvals' | 'products' | 'logistics' | 'prices' | 'support'>('dashboard');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const stats = [
    { label: 'Usuários Total', value: '2.450', change: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Vendedores', value: '184', change: '+5%', icon: Leaf, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pedidos Ativos', value: '642', change: '+18%', icon: ShoppingBag, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Formalizações', value: '23', change: '-2%', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  useEffect(() => {
    // In a real app, we would fetch real stats and users
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, 'users'), limit(50));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as any)) as UserProfile[];
        setUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-primary-dark text-white hidden lg:flex flex-col">
        <div className="p-8 pb-12">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary-green rounded-xl flex items-center justify-center text-white font-black italic">AS</div>
            <div>
              <p className="text-xs font-black uppercase tracking-tighter leading-none">Angola Smart</p>
              <p className="text-[8px] opacity-50 uppercase tracking-[0.2em]">Painel Admin</p>
            </div>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Estatísticas', icon: BarChart3 },
              { id: 'users', label: 'Utilizadores', icon: Users },
              { id: 'approvals', label: 'Formalizações', icon: ShieldCheck },
              { id: 'products', label: 'Marketplace', icon: ShoppingBag },
              { id: 'logistics', label: 'Logística', icon: Truck },
              { id: 'prices', label: 'Bolsa de Preços', icon: TrendingUp },
              { id: 'support', label: 'Suporte', icon: AlertCircle },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all",
                  activeTab === item.id 
                    ? "bg-primary-green text-white shadow-lg shadow-green-900/40" 
                    : "text-white/40 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black">CA</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">Cláudio Agostinho</p>
              <p className="text-[10px] opacity-40 truncate">Master Admin</p>
            </div>
            <button className="text-white/20 hover:text-white"><Lock size={16} /></button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {activeTab === 'dashboard' && 'Dashboard Analítico'}
              {activeTab === 'users' && 'Gestão de Utilizadores'}
              {activeTab === 'approvals' && 'Aprovação de Formalização'}
              {activeTab === 'products' && 'Controle de Marketplace'}
              {activeTab === 'logistics' && 'Gestão de Entregas'}
              {activeTab === 'prices' && 'Bolsa de Preços Nacional'}
              {activeTab === 'support' && 'Suporte e Reclamações'}
            </h1>
            <p className="text-gray-500 font-medium capitalize">
              {new Date().toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Pesquisar em todo sistema..."
                className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm w-72 focus:outline-none focus:border-primary-green focus:shadow-sm transition-all"
              />
            </div>
            <button className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-primary-green transition-all relative">
              <Bell size={20} />
              <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-12">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={cn("p-4 rounded-2xl", stat.bg, stat.color)}>
                      <stat.icon size={24} />
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-1 rounded-full",
                      stat.change.startsWith('+') ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                    )}>
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-3xl font-display font-black text-gray-900">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Charts Placeholder */}
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-bold text-lg">Crescimento de Utilizadores</h3>
                  <div className="flex gap-2">
                    <button className="px-4 py-1.5 bg-gray-50 text-gray-400 text-[10px] font-bold uppercase rounded-lg">Semana</button>
                    <button className="px-4 py-1.5 bg-primary-green text-white text-[10px] font-bold uppercase rounded-lg">Mês</button>
                  </div>
                </div>
                <div className="h-64 flex items-end gap-3 px-4">
                  {[45, 67, 89, 120, 156, 189, 210, 245, 230, 260, 290, 320].map((h, i) => (
                    <div key={i} className="flex-1 bg-primary-green/5 rounded-t-lg relative group transition-all hover:bg-primary-green/20">
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-primary-green rounded-t-lg transition-all duration-500" 
                        style={{ height: `${(h/350)*100}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4 px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <span>Jan</span>
                  <span>Jul</span>
                  <span>Dez</span>
                </div>
              </div>

              <div className="bg-primary-dark p-8 rounded-[40px] shadow-xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-green opacity-20 blur-[60px]" />
                <h3 className="font-bold text-lg mb-8 relative z-10">Actividade por Província</h3>
                <div className="space-y-6 relative z-10">
                  {[
                    { name: 'Luanda', val: 45, color: 'bg-primary-green' },
                    { name: 'Huambo', val: 28, color: 'bg-blue-400' },
                    { name: 'Benguela', val: 19, color: 'bg-amber-400' },
                    { name: 'Huíla', val: 8, color: 'bg-purple-400' }
                  ].map(prov => (
                    <div key={prov.name} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span>{prov.name}</span>
                        <span>{prov.val}%</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all duration-1000", prov.color)} style={{ width: `${prov.val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-12 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all">Ver relatório completo</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button className="px-4 py-2 bg-primary-green text-white rounded-xl text-xs font-bold">Todos</button>
                <button className="px-4 py-2 bg-gray-50 text-gray-500 rounded-xl text-xs font-bold hover:bg-gray-100">Vendedores</button>
                <button className="px-4 py-2 bg-gray-50 text-gray-500 rounded-xl text-xs font-bold hover:bg-gray-100">Compradores</button>
              </div>
              <div className="flex gap-2">
                <button className="p-2 border border-gray-100 rounded-lg text-gray-400 hover:text-primary-dark"><Filter size={18} /></button>
                <button className="px-4 py-2 bg-primary-dark text-white rounded-xl text-xs font-bold flex items-center gap-2">
                  <Download size={14} /> Exportar CSV
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Utilizador</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Tipo</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Localização</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.length > 0 ? users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-green/10 text-primary-green flex items-center justify-center font-bold text-sm">
                            {u.displayName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 leading-none">{u.displayName}</p>
                            <p className="text-[10px] text-gray-400 font-medium">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-xs font-bold text-gray-600 capitalize">{u.userType}</span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                          <MapPin size={12} /> {u.province || 'Luanda'}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider",
                          u.status === 'verified' ? "bg-green-50 text-green-600 border border-green-100" :
                          u.status === 'pending_verification' ? "bg-amber-50 text-amber-600 border border-amber-100" :
                          "bg-gray-50 text-gray-500 border border-gray-100"
                        )}>
                          {u.status === 'verified' ? 'Verificado' : u.status === 'pending_verification' ? 'Em Análise' : 'Normal'}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-primary-green shadow-sm"><Eye size={14} /></button>
                          <button className="p-2 bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-red-500 shadow-sm"><Lock size={14} /></button>
                          <button className="p-2 bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-primary-dark shadow-sm"><MoreVertical size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                     <tr>
                       <td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-medium italic">
                         Carregando base de dados nacional...
                       </td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-8 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
              <p className="text-xs text-gray-400 font-medium">Mostrando 1-10 de 2,450 resultados</p>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-400 hover:text-primary-dark shadow-sm">Anterior</button>
                <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-primary-dark shadow-sm">Seguinte</button>
              </div>
            </div>
          </div>
        )}

        {/* ... Other tabs will be added similarly but with their specific logic ... */}
        {activeTab === 'approvals' && (
           <div className="grid gap-6">
              {[
                { name: 'João Manuel Fazenda', type: 'Registo de Produtor', docs: 3, date: 'Hoje, 09:45', status: 'pending' },
                { name: 'Cooperativa Agrária Kwanza', type: 'NIF Coletivo', docs: 5, date: 'Ontem, 14:20', status: 'pending' },
                { name: 'Trans-Logística Benguela', type: 'Licença Comercial', docs: 2, date: '2 dias atrás', status: 'pending' }
              ].map((req, i) => (
                <div key={i} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-8 group">
                   <div className="w-16 h-16 bg-primary-green/10 text-primary-green rounded-[24px] flex items-center justify-center font-bold text-xl">
                      {req.name.charAt(0)}
                   </div>
                   <div className="flex-1 text-center md:text-left">
                      <h3 className="text-lg font-bold text-gray-900">{req.name}</h3>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-bold text-gray-400 mt-1">
                        <span className="text-primary-green uppercase tracking-widest">{req.type}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {req.date}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><FileText size={12} /> {req.docs} documentos</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <button className="px-6 py-3 bg-red-50 text-red-500 rounded-2xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all flex items-center gap-2">
                        <X size={16} /> Rejeitar
                      </button>
                      <button className="px-8 py-3 bg-primary-green text-white rounded-2xl text-xs font-bold shadow-lg shadow-green-900/20 hover:scale-105 transition-all flex items-center gap-2">
                        <Check size={16} /> Aprovar Registo
                      </button>
                   </div>
                </div>
              ))}
           </div>
        )}
      </main>
    </div>
  );
}
