import { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Dashboard } from './components/Dashboard';
import { CreatePurchase } from './components/CreatePurchase';
import { PurchaseHistory } from './components/PurchaseHistory';
import { PurchaseDetail } from './components/PurchaseDetail';
import { Profile } from './components/Profile';
import { BottomNav } from './components/BottomNav';
import { useAuth } from './context/AuthContext';
import { getPurchases } from './services/purchases.service';

export type Screen = 
  | 'login' 
  | 'register' 
  | 'dashboard' 
  | 'create-purchase' 
  | 'history' 
  | 'purchase-detail'
  | 'profile';

export interface Product {
  id: string;
  barcode: string;
  name: string;
  marca: string;
  category: string;
  price: number;
  quantity: number;
  packageSize: number;
  pum?: number;
  umd: string;
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
  const { user, logout } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [currentPurchase, setCurrentPurchase] = useState<Purchase | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [autoStartScanner, setAutoStartScanner] = useState(false);

  const isAuthenticated = !!user;

  // Fetch purchases when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchPurchases();
    }
  }, [isAuthenticated]);

  const fetchPurchases = async () => {
    try {
      const response = await getPurchases();
      // Transform backend response to frontend Purchase format
      if (response.data) {
        const transformedPurchases: Purchase[] = response.data.map((p: any) => ({
          id: p._id,
          date: p.createdAt,
          total: p.total,
          itemCount: p.items?.length || 0,
          products: p.items?.map((item: any) => ({
            id: item.productId || item._id || Math.random().toString(),
            name: item.name,
            category: item.umd || 'Sin categoría',
            price: item.price,
            quantity: item.quantity,
            barcode: item.barcode
          })) || [],
          synced: true
        }));
        setPurchases(transformedPurchases);
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
      setIsOffline(true);
    }
  };

  const handleLogin = () => {
    setCurrentScreen('dashboard');
  };

  const handleRegister = () => {
    setCurrentScreen('dashboard');
  };

  const handleLogout = async () => {
    await logout();
    setCurrentScreen('login');
    setPurchases([]);
    setCurrentPurchase(null);
  };

  const handleCreatePurchase = async (purchase: Purchase) => {
    setPurchases((prev: Purchase[]) => [purchase, ...prev]);
    setCurrentScreen('dashboard');
    setAutoStartScanner(false);
    // Refresh purchases from backend to get accurate data
    await fetchPurchases();
  };

  const handleViewPurchaseDetail = (purchase: Purchase) => {
    setCurrentPurchase(purchase);
    setCurrentScreen('purchase-detail');
  };

  const handleNavigate = (screen: Screen) => {
    if (screen === 'scanner' as Screen) {
      setAutoStartScanner(true);
      setCurrentScreen('create-purchase');
    } else {
      setAutoStartScanner(false);
      setCurrentScreen(screen);
    }
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
            onCancel={() => {
              setCurrentScreen('dashboard');
              setAutoStartScanner(false);
            }}
            autoStartScanner={autoStartScanner}
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
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}
