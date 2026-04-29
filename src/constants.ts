import { Product, PriceRecord, ServiceProcess } from './types.ts';

export const PROVINCES = [
  "Luanda", "Bengo", "Benguela", "Bié", "Cabinda", "Cuando Cubango", 
  "Cuanza Norte", "Cuanza Sul", "Cunene", "Huambo", "Huíla", 
  "Lunda Norte", "Lunda Sul", "Malanje", "Moxico", "Namibe", "Uíge", "Zaire"
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Milho Branco Preparado',
    category: 'Cereais',
    price: 450,
    unit: 'kg',
    quantity: 5000,
    province: 'Huambo',
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=800',
    producerId: 'p1',
    producerName: 'Fazenda Esperança',
    isVerified: true,
    harvestDate: '2026-04-15',
    traceable: true,
    batchId: 'AS-HZ-9288-LK'
  },
  {
    id: '2',
    name: 'Tomate de Mesa',
    category: 'Hortícolas',
    price: 800,
    unit: 'caixa',
    quantity: 120,
    province: 'Benguela',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=800',
    producerId: 'p2',
    producerName: 'Agro Benguela Lda',
    isVerified: true,
    harvestDate: '2026-04-20',
    traceable: false
  },
  {
    id: '3',
    name: 'Feijão Macunde',
    category: 'Leguminosas',
    price: 1200,
    unit: 'kg',
    quantity: 2500,
    province: 'Huíla',
    image: 'https://images.unsplash.com/photo-1551462147-37885abb3e4a?auto=format&fit=crop&q=80&w=800',
    producerId: 'p3',
    producerName: 'Cooperativa da Gambos',
    isVerified: false,
    harvestDate: '2026-03-30',
    traceable: false
  },
  {
    id: '4',
    name: 'Arroz Nacional Longo',
    category: 'Cereais',
    price: 650,
    unit: 'kg',
    quantity: 10000,
    province: 'Malanje',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800',
    producerId: 'p4',
    producerName: 'Fazenda Quizenga',
    isVerified: true,
    harvestDate: '2026-04-10',
    traceable: true,
    batchId: 'AS-MZ-1122-QR'
  }
];

export const MOCK_PRICES: PriceRecord[] = [
  { product: 'Milho', province: 'Huambo', price: 450, trend: 'stable', date: '2026-04-27' },
  { product: 'Arroz', province: 'Malanje', price: 650, trend: 'up', date: '2026-04-27' },
  { product: 'Feijão', province: 'Huíla', price: 1200, trend: 'down', date: '2026-04-27' },
  { product: 'Batata Rana', province: 'Bié', price: 550, trend: 'up', date: '2026-04-27' },
];

export const MOCK_PROCESSES: ServiceProcess[] = [
  { id: 'PROC-001', type: 'Emissão de NIF', status: 'approved', dateRequested: '2026-04-10', qrCode: 'NIF-123456' },
  { id: 'PROC-002', type: 'Declaração Agrícola', status: 'processing', dateRequested: '2026-04-22' },
];
