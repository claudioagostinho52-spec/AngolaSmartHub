import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, MapPin, Phone, Star, 
  ExternalLink, Award, Users, ShoppingBag, 
  Check, ChevronRight, X, ShoppingCart, QrCode
} from 'lucide-react';
import { MOCK_PRODUCTS } from '../constants.ts';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';

export function ProducerProfile({ onAddToCart }: { onAddToCart: (p: any) => void }) {
  const [addedItem, setAddedItem] = React.useState<string | null>(null);
  const producerProducts = MOCK_PRODUCTS.filter(p => p.producerId === 'p1');

  const handleAddToCart = (product: any) => {
    onAddToCart(product);
    setAddedItem(product.id);
    setTimeout(() => setAddedItem(null), 2000);
  };

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
              <span className="font-bold">Adicionado ao carrinho!</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Header Profile */}
        <div className="bg-white rounded-[48px] overflow-hidden shadow-sm border border-gray-100 mb-8">
           <div className="h-64 bg-primary-dark relative">
              <img 
                src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=2000" 
                className="w-full h-full object-cover opacity-50"
                alt="Farm cover"
              />
              <div className="absolute -bottom-16 left-12">
                 <div className="relative">
                   <img 
                    src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=200" 
                    className="w-32 h-32 rounded-[32px] border-4 border-white shadow-xl object-cover"
                    alt="Producer"
                   />
                   <div className="absolute -bottom-2 -right-2 bg-primary-green text-white p-1.5 rounded-full shadow-lg border-2 border-white">
                      <ShieldCheck size={20} />
                   </div>
                 </div>
              </div>
           </div>
           
           <div className="pt-20 px-12 pb-12 flex flex-col lg:flex-row justify-between items-start gap-8">
              <div>
                 <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl">Fazenda Esperança</h1>
                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">Produtor Verificado</span>
                 </div>
                 <p className="text-gray-500 flex items-center gap-2 mb-6">
                    <MapPin size={16} className="text-primary-green" /> Huambo, Município da Caála • Membro desde 2024
                 </p>
                 <div className="flex gap-4">
                    <div className="bg-gray-50 px-4 py-2 rounded-xl flex items-center gap-2">
                       <Star className="text-yellow-500" size={16} />
                       <span className="font-bold">4.9</span>
                       <span className="text-gray-400 text-sm">(124 avaliações)</span>
                    </div>
                    <div className="bg-gray-50 px-4 py-2 rounded-xl flex items-center gap-2">
                       <ShoppingBag className="text-primary-green" size={16} />
                       <span className="font-bold">2.5k</span>
                       <span className="text-gray-400 text-sm">Vendas</span>
                    </div>
                 </div>
              </div>
              <div className="flex gap-4">
                 <button className="bg-primary-green text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-green-900/20 active:scale-95 transition-transform">
                    <Phone size={18} /> Contactar Produtor
                 </button>
                 <button className="bg-white border border-gray-200 text-primary-dark px-8 py-4 rounded-2xl font-bold hover:bg-gray-50 active:scale-95 transition-transform">
                    Seguir
                 </button>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
             <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                <h3 className="font-bold text-xl mb-6">Sobre a Fazenda</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  Produzimos milho, feijão e batata com técnicas sustentáveis. Somos uma empresa 
                  familiar que emprega mais de 20 pessoas localmente na província do Huambo.
                </p>
                <div className="space-y-4">
                   <div className="flex items-center gap-3 text-sm">
                      <Award className="text-primary-green" size={18} />
                      <span className="font-medium text-gray-700">Certificado Orgânico Nível 1</span>
                   </div>
                   <div className="flex items-center gap-3 text-sm">
                      <Users className="text-primary-green" size={18} />
                      <span className="font-medium text-gray-700">Apoio à Comunidade Local</span>
                   </div>
                </div>
             </div>

             <div className="bg-primary-dark p-8 rounded-[32px] text-white">
                <h3 className="font-bold text-xl mb-4">Cartão Digital do Produtor</h3>
                <div className="bg-white p-4 rounded-2xl flex flex-col items-center gap-3 mb-6">
                   {/* QR Placeholder */}
                   <div className="w-full aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
                     <QrCode size={48} className="text-primary-dark opacity-20" />
                   </div>
                   <p className="text-primary-dark font-mono text-[10px] uppercase font-bold">ID: ANG-PR-00921-X</p>
                </div>
                <p className="text-white/50 text-xs text-center mb-6">Escaneie para validar a autenticidade deste produtor no Hub Nacional.</p>
                <Link to="/services" className="w-full bg-white/10 py-3 rounded-xl border border-white/10 flex items-center justify-center gap-2 font-bold hover:bg-white/20 transition-all">
                  Actualizar Cadastro <ExternalLink size={14} />
                </Link>
             </div>
          </div>

          <div className="lg:col-span-2">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Produtos em Destaque</h2>
                <Link to="/market" className="text-primary-green font-bold text-sm">Ver todos os {producerProducts.length} produtos</Link>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {producerProducts.map(p => (
                   <div key={p.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group">
                     <div className="h-48 overflow-hidden">
                        <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-all" alt={p.name} />
                     </div>
                     <div className="p-6">
                        <h4 className="font-bold text-lg mb-1">{p.name}</h4>
                        <p className="text-primary-green font-bold text-xl mb-4">{p.price.toLocaleString()}kz <span className="text-xs text-gray-400 font-medium">/ {p.unit}</span></p>
                        <button 
                          onClick={() => handleAddToCart(p)}
                          className="w-full bg-gray-50 text-primary-dark py-3 rounded-xl font-bold text-sm hover:bg-primary-green hover:text-white transition-all active:scale-[0.98]"
                        >
                           Comprar Agora
                        </button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
