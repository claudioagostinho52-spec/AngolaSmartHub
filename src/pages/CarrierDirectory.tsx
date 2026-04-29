import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Filter, MapPin, Truck, Star, 
  Package, ChevronRight, ArrowRight, ShieldCheck,
  Briefcase, Clock, Phone, MessageSquare, Plus,
  TrendingUp, Award, UserCheck, X, SlidersHorizontal
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils.ts';

const MOCK_CARRIERS = [
  {
    id: 'TR-001',
    name: 'António Joaquim',
    type: 'Individual',
    vehicle: 'Camião pequeno',
    capacity: '5 toneladas',
    price: '450',
    priceType: 'km',
    location: 'Huambo (Caála)',
    rating: 4.8,
    reliability: 98,
    status: 'verified',
    image: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=200&h=200&auto=format&fit=crop'
  },
  {
    id: 'TR-002',
    name: 'Logística Benguela Lda',
    type: 'Empresa',
    vehicle: 'Camião grande',
    capacity: '25 toneladas',
    price: '1200',
    priceType: 'tonelada',
    location: 'Benguela (Lobito)',
    rating: 4.9,
    reliability: 100,
    status: 'verified',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&h=200&auto=format&fit=crop'
  },
  {
    id: 'TR-003',
    name: 'Carlos Manuel',
    type: 'Individual',
    vehicle: 'Pickup 4x4',
    capacity: '1.5 toneladas',
    price: '300',
    priceType: 'entrega',
    location: 'Luanda (Viana)',
    rating: 4.5,
    reliability: 92,
    status: 'verified',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&auto=format&fit=crop'
  },
  {
    id: 'TR-004',
    name: 'TransCampo Huíla',
    type: 'Cooperativa',
    vehicle: 'Camião médio',
    capacity: '12 toneladas',
    price: '850',
    priceType: 'tonelada',
    location: 'Lubango',
    rating: 4.7,
    reliability: 95,
    status: 'verified',
    image: 'https://images.unsplash.com/photo-1533749047139-189de3cf06d3?q=80&w=200&h=200&auto=format&fit=crop'
  }
];

export function CarrierDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Todos');
  const [showFilters, setShowFilters] = useState(false);

  const filteredCarriers = useMemo(() => {
    return MOCK_CARRIERS.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           c.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           c.vehicle.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'Todos' || c.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [searchTerm, filterType]);

  return (
    <div className="pt-24 pb-20 px-4 min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-4xl lg:text-5xl mb-4 dark:text-dark-text font-display">Directório de <span className="text-primary-green">Transportadores</span></h1>
            <p className="text-gray-500 dark:text-dark-muted text-lg">Encontre transportadores verificados para levar a sua produção a qualquer ponto do país.</p>
          </div>
          <Link 
            to="/logistics/register" 
            className="bg-primary-dark text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-xl shadow-primary-dark/20 w-fit"
          >
            Registar como Transportador <Plus size={20} />
          </Link>
        </header>

        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-[32px] shadow-xl border border-gray-100 dark:border-dark-border mb-12 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-green transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Pesquisar por nome, província ou veículo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border focus:outline-none focus:border-primary-green dark:text-dark-text transition-all font-medium"
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "p-4 rounded-2xl border transition-all flex items-center gap-2 font-bold",
                showFilters ? "bg-primary-green text-white border-primary-green" : "bg-gray-50 dark:bg-dark-bg text-gray-500 border-gray-100 dark:border-dark-border hover:bg-gray-100"
              )}
            >
              <SlidersHorizontal size={20} />
              <span className="hidden sm:inline">Filtros</span>
            </button>
            <Link to="/logistics" className="p-4 rounded-2xl bg-primary-dark text-white hover:bg-gray-800 transition-all">
              <MapPin size={20} />
            </Link>
          </div>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-white dark:bg-dark-card p-8 rounded-[32px] shadow-lg border border-gray-100 dark:border-dark-border grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tipo</label>
                  <div className="flex flex-wrap gap-2">
                    {['Todos', 'Individual', 'Empresa', 'Cooperativa'].map(t => (
                      <button 
                        key={t}
                        onClick={() => setFilterType(t)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-bold border transition-all",
                          filterType === t ? "bg-primary-dark text-white border-primary-dark" : "bg-gray-50 dark:bg-dark-bg text-gray-500 border-gray-100 dark:border-dark-border"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                {/* More filters can follow here */}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCarriers.map((carrier) => (
            <motion.div 
              layout
              key={carrier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8 }}
              className="group bg-white dark:bg-dark-card rounded-[40px] shadow-sm hover:shadow-2xl border border-gray-100 dark:border-dark-border p-8 transition-all flex flex-col h-full"
            >
               <div className="flex justify-between items-start mb-6">
                  <div className="relative">
                    <img src={carrier.image} alt={carrier.name} className="w-20 h-20 rounded-3xl object-cover shadow-lg" />
                    <div className="absolute -bottom-2 -right-2 bg-primary-green text-white p-1.5 rounded-xl border-4 border-white dark:border-dark-card">
                       <ShieldCheck size={16} />
                    </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Cobra desde</p>
                     <p className="text-2xl font-bold text-primary-green">Kz {carrier.price}<span className="text-[10px] text-gray-400 font-medium">/{carrier.priceType}</span></p>
                  </div>
               </div>

               <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-xl dark:text-dark-text">{carrier.name}</h3>
                    {carrier.status === 'verified' && (
                       <UserCheck size={16} className="text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-dark-muted mb-4 font-medium">
                     <Briefcase size={12} /> {carrier.type} • <MapPin size={12} /> {carrier.location}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                     <div className="bg-gray-50 dark:bg-dark-bg p-3 rounded-2xl border border-gray-100 dark:border-dark-border">
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Veículo</p>
                        <p className="text-xs font-bold dark:text-dark-text truncate">{carrier.vehicle}</p>
                     </div>
                     <div className="bg-gray-50 dark:bg-dark-bg p-3 rounded-2xl border border-gray-100 dark:border-dark-border">
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Capacidade</p>
                        <p className="text-xs font-bold dark:text-dark-text">{carrier.capacity}</p>
                     </div>
                  </div>

                  <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center gap-1.5">
                        <Star size={14} className="text-amber-500 fill-amber-500" />
                        <span className="text-sm font-bold dark:text-dark-text">{carrier.rating}</span>
                        <span className="text-xs text-gray-400 dark:text-dark-muted font-medium">(24)</span>
                     </div>
                     <div className="flex items-center gap-1.5">
                        <TrendingUp size={14} className="text-primary-green" />
                        <span className="text-xs font-bold text-primary-green">{carrier.reliability}% Fiabilidade</span>
                     </div>
                  </div>
               </div>

               <Link 
                to={`/logistics/carrier/${carrier.id}`}
                className="w-full bg-primary-dark dark:bg-primary-green text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all group-hover:shadow-xl group-hover:shadow-primary-dark/20"
               >
                  Ver Perfil & Dashboard <ChevronRight size={18} />
               </Link>
            </motion.div>
          ))}
        </div>

        {filteredCarriers.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-dark-card rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
               <X size={32} />
            </div>
            <h3 className="text-xl font-bold dark:text-dark-text mb-2">Nenhum transportador encontrado</h3>
            <p className="text-gray-500 dark:text-dark-muted">Tente ajustar os seus filtros ou termos de pesquisa.</p>
          </div>
        )}
      </div>
    </div>
  );
}
