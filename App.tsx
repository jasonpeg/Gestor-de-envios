import React, { useState, useEffect } from 'react';
import { Package, Truck, Upload, LayoutDashboard, Settings, ClipboardList, Warehouse, RefreshCw, Save, CheckCircle, Bell, Calendar, LogOut } from 'lucide-react';
import { signOut } from './services/authService';
import { Order, Product, ViewState, OrderStatus, PaymentStatus, InventoryLog } from './types';
import ImportSection from './components/ImportSection';
import OrderTable from './components/OrderTable';
import ProductManager from './components/ProductManager';
import ManualOrderSection from './components/ManualOrderSection';
import InventorySection from './components/InventorySection';
import { Login } from './components/Login';
import { supabase } from './services/supabase';
import { Session } from '@supabase/supabase-js';

// Mock Data
const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'Daphcar Altidort',
    shippingNumber: '7443211',
    shippingCompany: 'AUREL',
    date: '2026-01-12',
    deliveryDate: '',
    city: 'SD ESTE',
    total: 1950.00,
    productSummary: 'KIT CURCUMA, JABONES',
    phoneNumber: '809-967-7386',
    status: OrderStatus.PENDIENTE,
    paymentStatus: PaymentStatus.PENDIENTE,
    items: [],
  },
  {
    id: 'ORD-002',
    customerName: 'Taina',
    shippingNumber: '2062240',
    shippingCompany: 'AUREL',
    date: '2026-01-12',
    deliveryDate: '2026-01-14',
    city: 'SD ESTE',
    total: 1950.00,
    productSummary: 'KIT CURCUMA, JABONES',
    phoneNumber: '809-905-6111',
    status: OrderStatus.ENTREGADO,
    paymentStatus: PaymentStatus.PAGADO,
    items: [],
  },
  {
    id: 'ORD-003',
    customerName: 'Flor Gisselle',
    shippingNumber: '5621583',
    shippingCompany: 'AUREL',
    date: '2026-01-11',
    deliveryDate: '',
    city: 'HIGUEY',
    total: 2775.00,
    productSummary: '2 PESTAÑAS MAGNETICAS',
    phoneNumber: '849-485-8929',
    status: OrderStatus.PENDIENTE,
    paymentStatus: PaymentStatus.PENDIENTE,
    items: [],
  }
];

const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', reference: 'KIT-001', name: 'KIT CURCUMA, JABONES', price1: 1950, price2: 3800, price3: 5500, stock: 50 },
  { id: 'p2', reference: 'MAG-002', name: 'MAGNESIO COMPLEX', price1: 1900, price2: 3700, price3: 5400, stock: 30 },
];

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [activeView, setActiveView] = useState<ViewState>('orders');
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // Auth Listener
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoadingSession(false);
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoadingSession(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Data State
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('app_orders');
    return saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(MOCK_ORDERS));
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('app_products');
    return saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(MOCK_PRODUCTS));
  });

  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>(() => {
    const saved = localStorage.getItem('app_inventory_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist
  useEffect(() => { localStorage.setItem('app_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('app_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('app_inventory_logs', JSON.stringify(inventoryLogs)); }, [inventoryLogs]);

  // Notifications
  useEffect(() => {
    if (showSaveNotification) {
      const timer = setTimeout(() => setShowSaveNotification(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSaveNotification]);

  const handleImportComplete = (newOrders: Order[]) => {
    setOrders(prev => [...newOrders, ...prev]);
    setActiveView('orders');
  };

  const handleManualSave = () => {
    localStorage.setItem('app_orders', JSON.stringify(orders));
    localStorage.setItem('app_products', JSON.stringify(products));
    localStorage.setItem('app_inventory_logs', JSON.stringify(inventoryLogs));
    setShowSaveNotification(true);
  };

  const handleRestoreData = () => {
    setOrders(JSON.parse(JSON.stringify(MOCK_ORDERS)));
    setProducts(JSON.parse(JSON.stringify(MOCK_PRODUCTS)));
    setInventoryLogs([]);
    localStorage.removeItem('app_orders');
    localStorage.removeItem('app_products');
    localStorage.removeItem('app_inventory_logs');
  };

  const handleLogout = async () => {
    await signOut();
    // For now, we just reload the page to clear any in-memory state or prompt re-login if protected routes existed
    window.location.reload();
  };

  // Nav Item Component
  const NavItem = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: string }) => {
    const isActive = activeView === view;
    return (
      <button
        onClick={() => setActiveView(view)}
        className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 group relative overflow-hidden
          ${isActive
            ? 'bg-[#2563FF] text-white shadow-[0_8px_20px_-6px_rgba(37,99,255,0.4)]'
            : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
      >
        <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:text-[#B6FF2E]'}`} />
        <span className="relative z-10">{label}</span>
        {isActive && (
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#B6FF2E] rounded-l-full"></div>
        )}
      </button>
    );
  };

  const getPageTitle = () => {
    switch (activeView) {
      case 'orders': return 'Centro de Envíos';
      case 'manual': return 'Nuevo Pedido';
      case 'inventory': return 'Inventario PRO';
      case 'products': return 'Catálogo';
      case 'import': return 'Importador';
      default: return 'Dashboard';
    }
  };

  const getPageSubtitle = () => {
    switch (activeView) {
      case 'orders': return 'Control rápido de envíos y cobros';
      case 'manual': return 'Registro manual de órdenes';
      case 'inventory': return 'Gestión de stock en tiempo real';
      case 'products': return 'Base de datos de items';
      case 'import': return 'Sube archivos Excel, PDF o Imágenes';
      default: return 'Gestión';
    }
  }

  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-[#F6F8FC] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#2563FF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <div className="min-h-screen flex bg-[#F6F8FC] font-['Inter']">

      {/* SIDEBAR */}
      <aside className="w-72 bg-[#0B1220] flex-shrink-0 fixed h-full z-30 hidden md:flex flex-col border-r border-white/5 shadow-2xl">
        <div className="p-8">
          <div className="flex items-center gap-3 text-white mb-2">
            <div className="w-10 h-10 bg-[#2563FF] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(37,99,255,0.5)]">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-['Space_Grotesk'] font-bold text-xl tracking-tight block leading-none">Gestor</span>
              <span className="font-['Space_Grotesk'] font-bold text-xl tracking-tight text-[#B6FF2E]">Envío PRO</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <NavItem view="orders" icon={Truck} label="Panel Maestro" />
          <NavItem view="manual" icon={ClipboardList} label="Nuevo Pedido" />
          <NavItem view="inventory" icon={Warehouse} label="Inventario" />
          <NavItem view="products" icon={LayoutDashboard} label="Productos" />
          <NavItem view="import" icon={Upload} label="Importar" />
        </nav>

        <div className="p-6">
          <div className="bg-[#151e32] rounded-2xl p-4 border border-white/5">
            <button
              onClick={handleManualSave}
              className="w-full bg-[#00E5A8] hover:bg-[#00c490] text-[#0B1220] font-bold py-3 px-4 rounded-xl shadow-[0_4px_14px_rgba(0,229,168,0.3)] flex items-center justify-center gap-2 transition-all active:scale-95 transform hover:-translate-y-0.5"
            >
              <Save className="w-5 h-5" />
              Guardar Todo
            </button>
            <button
              onClick={handleRestoreData}
              className="mt-3 w-full text-xs text-gray-500 hover:text-[#B6FF2E] flex items-center justify-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Restaurar Demo
            </button>

            <button
              onClick={handleLogout}
              className="mt-3 w-full text-xs text-red-400 hover:text-red-300 flex items-center justify-center gap-1 transition-colors border-t border-white/5 pt-3"
            >
              <LogOut className="w-3 h-3" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-[#0B1220] text-white z-40 px-4 py-3 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#2563FF] rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <span className="font-['Space_Grotesk'] font-bold text-lg">Gestor<span className="text-[#B6FF2E]">PRO</span></span>
        </div>
        <div className="flex gap-2 items-center">
          <button onClick={handleManualSave} className="text-[#0B1220] bg-[#00E5A8] p-2 rounded-xl">
            <Save className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* MOBILE NAV BOTTOM */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0B1220] border-t border-white/5 px-6 py-3 flex justify-between items-center z-40">
        <button onClick={() => setActiveView('orders')} className={activeView === 'orders' ? 'text-[#2563FF]' : 'text-gray-500'}><Truck className="w-6 h-6" /></button>
        <button onClick={() => setActiveView('manual')} className={activeView === 'manual' ? 'text-[#2563FF]' : 'text-gray-500'}><ClipboardList className="w-6 h-6" /></button>
        <button onClick={() => setActiveView('inventory')} className={activeView === 'inventory' ? 'text-[#2563FF]' : 'text-gray-500'}><Warehouse className="w-6 h-6" /></button>
        <button onClick={() => setActiveView('import')} className={activeView === 'import' ? 'text-[#2563FF]' : 'text-gray-500'}><Upload className="w-6 h-6" /></button>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-72 p-4 md:p-8 mt-14 md:mt-0 overflow-y-auto h-screen relative">
        <div className="max-w-[1600px] mx-auto h-full pb-20 md:pb-0">

          {/* TOP HEADER SECTION */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-in">
            <div>
              <h1 className="text-3xl font-['Space_Grotesk'] font-bold text-[#0B1220] mb-1">{getPageTitle()}</h1>
              <p className="text-gray-500 font-medium">{getPageSubtitle()}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 flex items-center gap-2 text-sm font-medium text-gray-600">
                <Calendar className="w-4 h-4 text-[#2563FF]" />
                <span>Hoy, {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
              </div>
              <button className="relative p-2 bg-white rounded-full shadow-sm border border-gray-100 text-gray-400 hover:text-[#2563FF] transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#FF4F4F] rounded-full border-2 border-white"></span>
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#2563FF] to-[#00E5A8] p-0.5">
                <div className="w-full h-full bg-white rounded-full overflow-hidden">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>

          {activeView === 'orders' && (
            <div className="animate-fade-in space-y-6">
              <OrderTable orders={orders} setOrders={setOrders} onRestore={handleRestoreData} />
            </div>
          )}

          {activeView === 'manual' && (
            <div className="h-full flex flex-col animate-fade-in">
              <ManualOrderSection orders={orders} setOrders={setOrders} products={products} />
            </div>
          )}

          {activeView === 'inventory' && (
            <div className="h-full flex flex-col animate-fade-in">
              <InventorySection
                products={products}
                setProducts={setProducts}
                logs={inventoryLogs}
                setLogs={setInventoryLogs}
              />
            </div>
          )}

          {activeView === 'products' && (
            <div className="h-full flex flex-col animate-fade-in">
              <ProductManager products={products} setProducts={setProducts} />
            </div>
          )}

          {activeView === 'import' && (
            <div className="animate-fade-in">
              <ImportSection onImportComplete={handleImportComplete} />
            </div>
          )}
        </div>
      </main>

      {/* Save Notification Toast */}
      {showSaveNotification && (
        <div className="fixed top-6 right-6 z-50 bg-[#00E5A8] text-[#0B1220] px-6 py-4 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,229,168,0.5)] flex items-center gap-4 animate-in slide-in-from-top-5 fade-in duration-300 border border-white/20">
          <div className="bg-white/20 p-2 rounded-full">
            <CheckCircle className="w-6 h-6 text-[#0B1220]" />
          </div>
          <div>
            <p className="font-['Space_Grotesk'] font-bold text-base">¡Guardado Exitoso!</p>
            <p className="text-sm opacity-80 font-medium">Tus datos están seguros.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;