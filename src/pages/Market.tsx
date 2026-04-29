import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Filter, MapPin, Tag, ArrowUpRight, 
  ShoppingCart, ShieldCheck, ChevronRight, X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { MOCK_PRODUCTS, PROVINCES } from '../constants.ts';
import { cn } from '../lib/utils.ts';

export function Market({ onAddToCart, cartCount, cartTotal }: { onAddToCart: (p: any) => void, cartCount: number, cartTotal: number }) {
  const [filterProvince, setFilterProvince] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [addedItem, setAddedItem] = useState<string | null>(null);

  const handleAddToCart = (product: any) => {
    onAddToCart(product);
    setAddedItem(product.id);
    setTimeout(() => setAddedItem(null), 2000);
  };

  const filteredProducts = MOCK_PRODUCTS.filter(p => {
    const matchesProvince = !filterProvince || p.province === filterProvince;
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const isTraceable = p.traceable === true; // Main filter for simulation-ready products
    return matchesProvince && matchesSearch && isTraceable;
  });

  return (
    <div className="pt-24 pb-20 px-4 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Added to cart toast */}
        <AnimatePresence>
          {addedItem && (
            <motion.div 
              initial={{ opacity: 0, y: 50, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 50, x: '-50%' }}
              className="fixed bottom-10 left-1/2 z-[100] bg-primary-dark text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10"
            >
              <div className="bg-primary-green p-1 rounded-full"><ShoppingCart size={16} /></div>
              <span className="font-bold">Adicionado ao carrinho com sucesso!</span>
            </motion.div>
          )}
        </AnimatePresence>

        <header className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h1 className="text-4xl lg:text-5xl mb-4">AgroSmart <span className="text-primary-green">Market</span></h1>
            <p className="text-gray-500 text-lg">Encontre os melhores produtos nacionais directamente da origem.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
                <ShoppingCart size={18} className="text-primary-green" />
                <span className="font-bold">{cartCount} itens</span>
                <span className="text-gray-400">|</span>
                <span className="font-bold text-primary-green">{cartTotal.toLocaleString()} kz</span>
             </div>
          </div>
        </header>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-12 flex flex-col md:flex-row gap-5">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Pesquisar por produto, categoria ou produtor..." 
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-100 focus:outline-none focus:border-primary-green transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="bg-gray-50 border border-gray-100 px-6 py-4 rounded-xl text-sm font-medium focus:outline-none"
              value={filterProvince}
              onChange={(e) => setFilterProvince(e.target.value)}
            >
              <option value="">Todas as Províncias</option>
              {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "p-4 rounded-xl border transition-all flex items-center gap-2 font-bold",
                showFilters ? "bg-primary-dark text-white border-primary-dark" : "bg-white border-gray-100 text-primary-dark"
              )}
            >
              <Filter size={20} />
              <span className="hidden sm:inline">Filtros</span>
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {filteredProducts.map((product) => (
            <motion.div
              layout
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -8 }}
              className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 group flex flex-col"
            >
              <div className="relative h-60 overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className="bg-primary-dark/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    {product.category}
                  </span>
                  {product.isVerified && (
                    <span className="bg-primary-green text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1">
                      <ShieldCheck size={12} /> Verificado
                    </span>
                  )}
                </div>
                <div className="absolute bottom-4 left-4">
                  <div className="bg-white/90 backdrop-blur-md text-primary-dark p-3 rounded-2xl shadow-lg border border-white/20">
                    <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Preço Atual</p>
                    <p className="text-xl font-bold leading-none">{product.price.toLocaleString()}kz <span className="text-sm text-gray-500 font-medium">/ {product.unit}</span></p>
                  </div>
                </div>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <div className="mb-4">
                  <h3 className="text-xl mb-1 group-hover:text-primary-green transition-colors">{product.name}</h3>
                  <Link to={`/producer/${product.producerId}`} className="flex items-center gap-1.5 text-gray-400 text-xs font-medium hover:text-primary-green transition-colors">
                    <MapPin size={12} className="text-primary-green" />
                    {product.province} • {product.producerName}
                  </Link>
                </div>

                <div className="mt-auto space-y-4">
                   <div className="flex justify-between items-center text-xs font-medium">
                      <span className="text-gray-400">Stock: <span className="text-primary-dark">{product.quantity} {product.unit}s</span></span>
                      <span className="text-gray-400">Colheita: <span className="text-primary-dark">{product.harvestDate}</span></span>
                   </div>
                   <button 
                    onClick={() => setSelectedProduct(product)}
                    className="w-full bg-gray-50 text-primary-dark hover:bg-primary-green hover:text-white py-4 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all border border-gray-100"
                   >
                     Ver Detalhes <ArrowUpRight size={18} />
                   </button>
                   <button 
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-primary-green text-white py-4 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all shadow-lg shadow-green-900/20 hover:bg-green-700"
                   >
                     <ShoppingCart size={18} /> Adicionar ao Carrinho
                   </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Product Detail Modal */}
        <AnimatePresence>
          {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedProduct(null)}
                className="absolute inset-0 bg-primary-dark/60 backdrop-blur-md" 
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
              >
                 <button 
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full z-10 backdrop-blur-md"
                >
                  <X size={24} />
                </button>

                <div className="w-full md:w-1/2 h-80 md:h-auto">
                    <img src={selectedProduct.image} className="w-full h-full object-cover" alt={selectedProduct.name} />
                </div>

                <div className="w-full md:w-1/2 p-12 overflow-y-auto">
                  <div className="inline-block bg-primary-green/10 text-primary-green px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
                    {selectedProduct.category}
                  </div>
                  <h2 className="text-4xl font-bold mb-2">{selectedProduct.name}</h2>
                  <p className="text-gray-500 mb-8 flex items-center gap-2">
                    <MapPin size={18} className="text-primary-green" /> {selectedProduct.province} • {selectedProduct.producerName}
                  </p>

                  <div className="bg-gray-50 p-6 rounded-3xl mb-8">
                    <p className="text-sm font-bold text-gray-400 uppercase mb-2">Preço por Unidade</p>
                    <p className="text-4xl font-bold text-primary-green">{selectedProduct.price.toLocaleString()}kz <span className="text-lg text-gray-400">/ {selectedProduct.unit}</span></p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                     <div className="border border-gray-100 p-4 rounded-2xl">
                        <p className="text-[10px] font-bold uppercase text-gray-400 mb-1 tracking-wider">Stock Disponível</p>
                        <p className="font-bold text-primary-dark">{selectedProduct.quantity} {selectedProduct.unit}s</p>
                     </div>
                     <div className="border border-gray-100 p-4 rounded-2xl">
                        <p className="text-[10px] font-bold uppercase text-gray-400 mb- tracking-wider">Origem Confirmada</p>
                        <p className="font-bold text-primary-dark">Sim • Verificado</p>
                     </div>
                  </div>

                  <p className="text-gray-600 text-sm leading-relaxed mb-10">
                    Este produto foi cultivado seguindo padrões elevados de qualidade na {selectedProduct.province}. 
                    Apoiamos a produção nacional conectando o campo directamente à sua casa.
                  </p>

                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => {
                          handleAddToCart(selectedProduct);
                          setSelectedProduct(null);
                      }}
                      className="w-full bg-primary-green text-white py-5 rounded-2xl flex items-center justify-center gap-4 font-bold text-lg shadow-xl shadow-green-900/20 hover:scale-[1.02] transition-transform"
                    >
                      <ShoppingCart size={24} /> Adicionar ao Carrinho
                    </button>
                    
                    {selectedProduct.traceable && (
                      <Link
                        to="/traceability"
                        state={{ batchId: selectedProduct.batchId }}
                        className="w-full bg-white border-2 border-primary-green text-primary-green py-5 rounded-2xl flex items-center justify-center gap-4 font-bold text-lg hover:bg-primary-green/5 transition-colors"
                      >
                        <ShieldCheck size={24} /> Rastrear Origem
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>


        {filteredProducts.length === 0 && (
          <div className="py-40 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
              <Search size={32} />
            </div>
            <h3 className="text-2xl mb-2">Nenhum produto encontrado</h3>
            <p className="text-gray-500">Tente ajustar os seus filtros ou termo de pesquisa.</p>
            <button 
              onClick={() => {setFilterProvince(''); setSearchQuery('');}}
              className="mt-6 text-primary-green font-bold underline"
            >
              Remover todos os filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
