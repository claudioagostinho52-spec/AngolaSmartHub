export type UserRole = 'producer' | 'buyer' | 'company' | 'logistics' | 'admin' | 'seller' | 'transporter' | 'organization';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  phone?: string;
  province?: string;
  municipality?: string;
  accountType?: UserRole;
  userType?: UserRole; // Added to match various usages
  status?: 'normal' | 'verified' | 'pending_verification' | 'under_review' | 'rejected' | 'incomplete';
  createdAt?: any;
  photoURL?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  quantity: number;
  province: string;
  image: string;
  producerId: string;
  producerName: string;
  isVerified: boolean;
  harvestDate: string;
  traceable?: boolean;
  batchId?: string;
}

export interface Delivery {
  id: string;
  orderId: string;
  status: 'pending' | 'preparing' | 'transit' | 'delivered';
  origin: string;
  destination: string;
  driverName: string;
  estimatedTime: string;
  lastUpdate: string;
}

export interface PriceRecord {
  product: string;
  province: string;
  price: number;
  trend: 'up' | 'down' | 'stable';
  date: string;
}

export interface ServiceProcess {
  id: string;
  type: string;
  status: 'processing' | 'approved' | 'rejected' | 'pending';
  dateRequested: string;
  qrCode?: string;
}
