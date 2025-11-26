import { useState } from 'react';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Dashboard } from './components/Dashboard';
import { CreatePurchase } from './components/CreatePurchase';
import { PurchaseHistory } from './components/PurchaseHistory';
import { PurchaseDetail } from './components/PurchaseDetail';
import { BarcodeScanner } from './components/BarcodeScanner';
import { Profile } from './components/Profile';
import { BottomNav } from './components/BottomNav';

export type Screen = 
  | 'login' 
  | 'register' 
  | 'dashboard' 
  | 'create-purchase' 
  | 'history' 
  | 'purchase-detail'
  | 'scanner'
  | 'profile';

export interface Product {
  id: string;
  barcode?: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

export interface Purchase {
  id: string;
  date: string;
  total: number;
  itemCount: number;
  products: Product[];
  synced: boolean;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [currentPurchase, setCurrentPurchase] = useState<Purchase | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentScreen('dashboard');
  };

  const handleRegister = () => {
    setIsAuthenticated(true);
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentScreen('login');
    setPurchases([]);
    setCurrentPurchase(null);
  };

  const handleCreatePurchase = (purchase: Purchase) => {
    setPurchases(prev => [purchase, ...prev]);
    setCurrentScreen('dashboard');
  };

  const handleViewPurchaseDetail = (purchase: Purchase) => {
    setCurrentPurchase(purchase);
    setCurrentScreen('purchase-detail');
  };

  const handleAddProductFromScanner = (product: Product) => {
    // This would be used when creating a purchase
    setCurrentScreen('create-purchase');
  };

  const renderScreen = () => {
    if (!isAuthenticated) {
      if (currentScreen === 'register') {
        return <Register onRegister={handleRegister} onSwitchToLogin={() => setCurrentScreen('login')} />;
      }
      return <Login onLogin={handleLogin} onSwitchToRegister={() => setCurrentScreen('register')} />;
    }

    switch (currentScreen) {
      case 'dashboard':
        return (
          <Dashboard 
            purchases={purchases}
            onCreatePurchase={() => setCurrentScreen('create-purchase')}
            isOffline={isOffline}
          />
        );
      case 'create-purchase':
        return (
          <CreatePurchase 
            onSave={handleCreatePurchase}
            onCancel={() => setCurrentScreen('dashboard')}
            onOpenScanner={() => setCurrentScreen('scanner')}
          />
        );
      case 'history':
        return (
          <PurchaseHistory 
            purchases={purchases}
            onViewDetail={handleViewPurchaseDetail}
          />
        );
      case 'purchase-detail':
        return (
          <PurchaseDetail 
            purchase={currentPurchase}
            onBack={() => setCurrentScreen('history')}
          />
        );
      case 'scanner':
        return (
          <BarcodeScanner 
            onProductScanned={handleAddProductFromScanner}
            onClose={() => setCurrentScreen('create-purchase')}
          />
        );
      case 'profile':
        return (
          <Profile 
            onLogout={handleLogout}
          />
        );
      default:
        return <Dashboard purchases={purchases} onCreatePurchase={() => setCurrentScreen('create-purchase')} isOffline={isOffline} />;
    }
  };

  return (
    <div className="min-h-screen bg-primary-black text-white max-w-[390px] mx-auto relative">
      {renderScreen()}
      {isAuthenticated && (
        <BottomNav 
          currentScreen={currentScreen} 
          onNavigate={setCurrentScreen}
        />
      )}
    </div>
  );
}
