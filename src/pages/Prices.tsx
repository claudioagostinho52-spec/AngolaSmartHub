import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, TrendingUp, TrendingDown, Minus, 
  MapPin, Filter, Download, Info, Calendar,
  ArrowUpRight, ShoppingCart, Search
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { MOCK_PRICES, PROVINCES } from '../constants.ts';
import { cn } from '../lib/utils.ts';

const CHART_DATA = [
  { name: 'Semana 1', price: 380 },
  { name: 'Semana 2', price: 410 },
  { name: 'Semana 3', price: 450 },
  { name: 'Semana 4', price: 420 },
  { name: 'Semana 5', price: 440 },
  { name: 'Semana 6', price: 450 },
];

export function Prices() {
  const [selectedProduct, setSelectedProduct] = useState('Milho');
  const [selectedProvince, setSelectedProvince] = useState('Huambo');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 3000);
  };

  return (
    <div className="pt-24 pb-20 px-4 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Export Toast */}
        <AnimatePresence>
          {isExporting && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed bottom-10 right-10 z-[100] bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 flex items-center gap-4 max-w-xs"
            >
               <div className="w-12 h-12 bg-primary-green/10 text-primary-green rounded-2xl flex items-center justify-center shrink-0">
                  <Download className="animate-bounce" size={24} />
               </div>
               <div>
                  <h4 className="font-bold text-sm">Exportando Relatório</h4>
                  <p className="text-xs text-gray-500">A gerar PDF detalhado de preços para {selectedProvince}...</p>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        <header className="mb-14 flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl lg:text-5xl mb-4">Bolsa de <span className="text-primary-green">Preços</span></h1>
            <p className="text-gray-500 text-lg">Dados em tempo real sobre a variação de preços agrícolas em Angola. Transparência para produtores e compradores.</p>
          </div>
          <div className="flex gap-3">
             <button className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm text-gray-500 hover:text-primary-green transition-colors">
               <Calendar size={20} />
             </button>
             <button 
              onClick={handleExport}
              disabled={isExporting}
              className={cn(
                "bg-white px-6 py-3 rounded-xl border border-gray-100 shadow-sm font-bold flex items-center gap-2 transition-all",
                isExporting ? "opacity-50 cursor-not-allowed" : "hover:shadow-md hover:border-primary-green/30"
              )}
             >
               <Download size={18} /> {isExporting ? 'Exportando...' : 'Exportar Relatório'}
             </button>
          </div>
        </header>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-14">
          {[
            { label: 'Milho Branco', price: '450kz', trend: 'up', change: '+12%', color: 'text-green-600' },
            { label: 'Arroz Nacional', price: '650kz', trend: 'up', change: '+5%', color: 'text-green-600' },
            { label: 'Feijão', price: '1.200kz', trend: 'down', change: '-8%', color: 'text-red-600' },
            { label: 'Mandioca', price: '250kz', trend: 'stable', change: '0%', color: 'text-gray-500' },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100"
            >
              <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-2">{stat.label}</p>
              <div className="flex items-center justify-between">
                <h4 className="text-2xl font-bold">{stat.price} <span className="text-xs text-gray-400 font-medium">/kg</span></h4>
                <div className={cn("flex items-center gap-1 font-bold", stat.color)}>
                  {stat.trend === 'up' && <TrendingUp size={16} />}
                  {stat.trend === 'down' && <TrendingDown size={16} />}
                  {stat.trend === 'stable' && <Minus size={16} />}
                  <span className="text-sm">{stat.change}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart Area */}
          <div className="lg:col-span-2 bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
             <div className="flex flex-col md:flex-row justify-between gap-6 mb-12">
                <div>
                   <h3 className="text-xl font-bold mb-1">Tendência de Preço: {selectedProduct}</h3>
                   <p className="text-gray-400 text-xs font-medium flex items-center gap-1.5">
                     <MapPin size={12} className="text-primary-green" /> {selectedProvince} • Actualizado há 2h
                   </p>
                </div>
                <div className="flex gap-2">
                   <select 
                    className="bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl text-xs font-bold focus:outline-none"
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                   >
                     <option>Milho</option>
                     <option>Arroz</option>
                     <option>Feijão</option>
                   </select>
                   <select 
                    className="bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl text-xs font-bold focus:outline-none"
                    value={selectedProvince}
                    onChange={(e) => setSelectedProvince(e.target.value)}
                   >
                     {PROVINCES.map(p => <option key={p}>{p}</option>)}
                   </select>
                </div>
             </div>

             <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={CHART_DATA}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#2E7D32" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      tickFormatter={(value) => `${value}kz`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '16px', 
                        border: 'none', 
                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                        padding: '12px 16px',
                        backgroundColor: '#ffffff',
                        color: '#002b49'
                      }}
                      itemStyle={{ color: '#002b49' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#2E7D32" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorPrice)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Side Panel: Featured */}
          <div className="space-y-8">
             <div className="bg-primary-dark p-10 rounded-[40px] text-white overflow-hidden relative">
                <div className="relative z-10">
                   <div className="p-3 bg-white/10 rounded-2xl w-fit mb-6">
                      <BarChart3 className="text-primary-green" />
                   </div>
                   <h3 className="text-2xl mb-2">Produtos em Alta</h3>
                   <p className="text-gray-400 text-sm mb-8">Esta semana houve um aumento significativo nos cereais devido à sazonalidade.</p>
                   
                   <div className="space-y-4">
                      {[
                        { name: 'Arroz Longo', p: '650kz', ch: '+15%' },
                        { name: 'Milho Amarelo', p: '480kz', ch: '+8%' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                           <div>
                              <p className="font-bold">{item.name}</p>
                              <p className="text-xs text-white/40">{item.p} / kg</p>
                           </div>
                           <span className="text-green-500 font-bold text-sm">{item.ch}</span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>

             <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <Info size={18} className="text-blue-500" />
                  Dica de Mercado
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed italic">
                  "Os preços no Huambo estão 15% mais baixos que em Luanda. Comprar por grosso através da nossa plataforma com transporte partilhado pode reduzir os seus custos operacionais em 22%."
                </p>
                <div className="mt-8 flex items-center gap-3">
                   <div className="w-10 h-10 bg-primary-green/10 rounded-full flex items-center justify-center text-primary-green">
                      <BarChart3 size={20} />
                   </div>
                   <p className="text-xs font-bold text-primary-dark">ANALISTA SMART HUB</p>
                </div>
             </div>
          </div>
        </div>

        {/* Full Table */}
        <div className="mt-20 bg-white rounded-[48px] shadow-sm border border-gray-100 overflow-hidden">
           <div className="p-10 border-b border-gray-100 flex flex-col md:flex-row justify-between md:items-center gap-6">
              <h3 className="text-2xl">Bolsa <span className="text-primary-green">Completa</span></h3>
              <div className="relative max-w-sm w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Pesquisar por produto ou região..." 
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-sm"
                />
              </div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">Produto</th>
                    <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">Província</th>
                    <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">Preço Médio</th>
                    <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">Tendência</th>
                    <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">Acção</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {MOCK_PRICES.concat(MOCK_PRICES).map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-6 font-bold">{item.product}</td>
                      <td className="px-8 py-6 text-gray-500 flex items-center gap-2"><MapPin size={14} className="text-primary-green" /> {item.province}</td>
                      <td className="px-8 py-6 font-bold">{item.price}kz <span className="text-xs text-gray-400 font-medium">/kg</span></td>
                      <td className="px-8 py-6">
                         <div className={cn(
                           "flex items-center gap-1.5 font-bold",
                           item.trend === 'up' ? "text-green-600" : item.trend === 'down' ? "text-red-600" : "text-gray-500"
                         )}>
                            {item.trend === 'up' ? <TrendingUp size={16} /> : item.trend === 'down' ? <TrendingDown size={16} /> : <Minus size={16} />}
                            <span className="text-sm capitalize">{item.trend}</span>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                        <button className="text-primary-green hover:underline font-bold text-sm flex items-center gap-1">
                          Ver Mercado <ArrowUpRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
}
