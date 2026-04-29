import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Navbar, Footer } from './components/Navigation.tsx';
import { Home } from './pages/Home.tsx';
import { Market } from './pages/Market.tsx';
import { Services } from './pages/Services.tsx';
import { Logistics } from './pages/Logistics.tsx';
import { CarrierRegistration } from './pages/CarrierRegistration.tsx';
import { CarrierDirectory } from './pages/CarrierDirectory.tsx';
import { CarrierDashboard } from './pages/CarrierDashboard.tsx';
import { Prices } from './pages/Prices.tsx';
import { Traceability } from './pages/Traceability.tsx';
import { ProducerProfile } from './pages/Producer.tsx';
import { AuthPage } from './pages/Auth.tsx';
import { ProfilePage } from './pages/Profile.tsx';
import { MessagesPage } from './pages/Messages.tsx';
import { PrivacyPolicy } from './pages/PrivacyPolicy.tsx';
import { AdminDashboard } from './pages/Admin.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';

import { useAuth } from './contexts/AuthContext.tsx';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-green border-t-transparent rounded-full animate-spin" />
          <p className="text-white font-bold uppercase tracking-widest text-[10px]">A carregar hub...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return <>{children}</>;
};

// Admin Route Component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const ADMIN_EMAIL = 'claudioagostinho52@gmail.com';

  if (loading) return null;

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <Shield style={{ width: 40, height: 40 }} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Restrito</h1>
        <p className="text-gray-500 max-w-md">Você não tem permissão para acessar esta área. Esta seção é exclusiva para administradores autorizados.</p>
        <Link to="/" className="mt-8 px-8 py-3 bg-primary-dark text-white rounded-2xl font-bold text-sm">Voltar ao Início</Link>
      </div>
    );
  }

  return <>{children}</>;
};

// Simple placeholder components for other pages
const About = () => (
  <div className="pt-24 pb-20 px-4 min-h-screen bg-gray-50">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl mb-8">Sobre o <span className="text-primary-green">Angola Smart Hub</span></h1>
      <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 prose">
        <p>O ANGOLA SMART HUB é uma solução digital de alto impacto que visa revolucionar o sector agrícola em Angola.</p>
        <h2 className="text-2xl mt-8 mb-4">A Nossa Missão</h2>
        <p>Conectar o campo à cidade, facilitar a formalização do agricultor e garantir a segurança alimentar.</p>
        <h2 className="text-2xl mt-8 mb-4">Roadmap / Futuro</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>App mobile (Android/iOS)</li>
          <li>Integração com Unitel Money</li>
          <li>Microcrédito Agrícola inteligente</li>
          <li>Expansão para a região da SADC</li>
        </ul>
      </div>
    </div>
  </div>
);

export default function App() {
  const [cartItems, setCartItems] = React.useState<any[]>([]);

  const addToCart = (product: any) => {
    setCartItems(prev => [...prev, product]);
  };

  return (
    <AuthProvider>
      <Router>
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar cartCount={cartItems.length} cartItems={cartItems} onRemoveFromCart={(index) => setCartItems(prev => prev.filter((_, i) => i !== index))} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/market" element={<ProtectedRoute><Market onAddToCart={addToCart} cartCount={cartItems.length} cartTotal={cartItems.reduce((acc, item) => acc + item.price, 0)} /></ProtectedRoute>} />
            <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
            <Route path="/logistics" element={<ProtectedRoute><Logistics /></ProtectedRoute>} />
            <Route path="/logistics/directory" element={<ProtectedRoute><CarrierDirectory /></ProtectedRoute>} />
            <Route path="/logistics/carrier/:id" element={<ProtectedRoute><CarrierDashboard /></ProtectedRoute>} />
            <Route path="/logistics/register" element={<ProtectedRoute><CarrierRegistration /></ProtectedRoute>} />
            <Route path="/prices" element={<ProtectedRoute><Prices /></ProtectedRoute>} />
            <Route path="/traceability" element={<ProtectedRoute><Traceability /></ProtectedRoute>} />
            <Route path="/producer/:id" element={<ProtectedRoute><ProducerProfile onAddToCart={addToCart} /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  </AuthProvider>
  );
}


