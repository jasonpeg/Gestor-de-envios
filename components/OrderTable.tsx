import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, PaymentStatus } from '../types';
import { ChevronDown, Search, Filter, Truck, Check, AlertTriangle, XCircle, Clock, DollarSign, X, Edit2, Trash2, Printer, RotateCcw, Database, Package, TrendingUp, AlertOctagon } from 'lucide-react';

interface OrderTableProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  onPrint?: (order: Order) => void;
  onRestore?: () => void;
}

// Visual Config for Status Badges
const statusConfig = {
  [OrderStatus.PENDIENTE]: { 
    bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', icon: Clock 
  },
  [OrderStatus.ENTREGADO]: { 
    bg: 'bg-[#00E5A8]/10', text: 'text-[#00a876]', border: 'border-[#00E5A8]/20', icon: Check 
  },
  [OrderStatus.DEVUELTO]: { 
    bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100', icon: XCircle 
  },
  [OrderStatus.NOVEDAD]: { 
    bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', icon: AlertTriangle 
  },
};

const paymentConfig = {
  [PaymentStatus.PENDIENTE]: { bg: 'bg-gray-100', text: 'text-gray-600' },
  [PaymentStatus.PAGADO]: { bg: 'bg-[#B6FF2E]/20', text: 'text-green-800' },
};

// --- KPI Card Component ---
const KpiCard = ({ title, value, icon: Icon, colorClass, delay }: { title: string, value: string | number, icon: any, colorClass: string, delay: string }) => (
  <div className={`bg-white rounded-3xl p-5 shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-50 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${delay}`}>
    <div className="flex items-start justify-between mb-4">
       <div className={`p-3 rounded-2xl ${colorClass}`}>
          <Icon className="w-6 h-6" />
       </div>
       <div className="px-2 py-1 rounded-full bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hoy</div>
    </div>
    <div className="flex flex-col">
       <span className="text-gray-400 text-sm font-medium font-['Inter']">{title}</span>
       <span className="text-[#0B1220] text-3xl font-['Space_Grotesk'] font-bold mt-1">{value}</span>
    </div>
  </div>
);

// --- Sub-component for individual rows ---
interface OrderRowProps {
  order: Order;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Order>) => void;
  onDelete: (id: string) => void;
  onPrint?: (order: Order) => void;
}

const OrderRow: React.FC<OrderRowProps> = ({ order, isSelected, onSelect, onUpdate, onDelete, onPrint }) => {
  const [draftStatus, setDraftStatus] = useState<OrderStatus>(order.status || OrderStatus.PENDIENTE);
  const [draftPayment, setDraftPayment] = useState<PaymentStatus>(order.paymentStatus || PaymentStatus.PENDIENTE);
  const [localDeliveryDate, setLocalDeliveryDate] = useState<string>(order.deliveryDate || '');
  const [isEditingData, setIsEditingData] = useState(false);
  const [draftName, setDraftName] = useState(order.customerName);
  const [draftTotal, setDraftTotal] = useState(order.total);
  const [draftProduct, setDraftProduct] = useState(order.productSummary);

  useEffect(() => { 
    setDraftStatus(order.status || OrderStatus.PENDIENTE); 
    setDraftPayment(order.paymentStatus || PaymentStatus.PENDIENTE);
    setLocalDeliveryDate(order.deliveryDate || '');
    if (!isEditingData) {
        setDraftName(order.customerName);
        setDraftTotal(order.total);
        setDraftProduct(order.productSummary);
    }
  }, [order, isEditingData]);

  useEffect(() => {
    if (draftStatus !== OrderStatus.ENTREGADO && draftPayment === PaymentStatus.PAGADO) {
        setDraftPayment(PaymentStatus.PENDIENTE);
    }
  }, [draftStatus]);

  const currentStatus = statusConfig[draftStatus] || statusConfig[OrderStatus.PENDIENTE];
  const currentPayment = paymentConfig[draftPayment] || paymentConfig[PaymentStatus.PENDIENTE];
  const hasStatusChanged = draftStatus !== order.status;
  const hasPaymentChanged = draftPayment !== order.paymentStatus;
  const hasDateChanged = localDeliveryDate !== (order.deliveryDate || '');
  const canBePaid = draftStatus === OrderStatus.ENTREGADO;

  const handlePaymentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPayment = e.target.value as PaymentStatus;
    if (newPayment === PaymentStatus.PAGADO && !canBePaid) {
        alert("Primero marca como ENTREGADO");
        return;
    }
    setDraftPayment(newPayment);
  };

  const saveDataEdit = () => {
    onUpdate(order.id, { customerName: draftName, total: draftTotal, productSummary: draftProduct });
    setIsEditingData(false);
  };

  return (
    <tr className={`group transition-all duration-200 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 ${isSelected ? 'bg-blue-50/50' : ''}`}>
      <td className="px-5 py-5 w-12">
        <input 
          type="checkbox"
          className="w-5 h-5 text-[#2563FF] border-gray-200 rounded-lg focus:ring-[#2563FF] cursor-pointer"
          checked={isSelected}
          onChange={() => onSelect(order.id)}
        />
      </td>

      <td className="px-5 py-5">
        {isEditingData ? (
            <input type="text" value={draftName} onChange={(e) => setDraftName(e.target.value)} className="w-full border border-[#2563FF] rounded-lg px-2 py-1 text-sm bg-white" />
        ) : (
            <div>
               <div className="font-bold text-[#0B1220]">{order.customerName}</div>
               <div className="text-xs text-gray-400 font-mono mt-0.5">{order.shippingNumber || 'S/N'}</div>
            </div>
        )}
      </td>

      <td className="px-5 py-5 text-sm text-gray-500">{order.shippingCompany}</td>
      
      <td className="px-5 py-5">
         <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-gray-600">{localDeliveryDate || '-'}</div>
            <input 
              type="date"
              value={localDeliveryDate}
              onChange={(e) => setLocalDeliveryDate(e.target.value)}
              className="w-5 h-5 opacity-0 absolute cursor-pointer"
            />
            {hasDateChanged && (
               <button onClick={() => onUpdate(order.id, { deliveryDate: localDeliveryDate })} className="text-[#00E5A8] hover:scale-110 transition-transform"><Check className="w-4 h-4" /></button>
            )}
         </div>
      </td>
      
      <td className="px-5 py-5 text-sm text-gray-500">{order.city}</td>
      
      <td className="px-5 py-5">
        {isEditingData ? (
            <input type="number" value={draftTotal} onChange={(e) => setDraftTotal(parseFloat(e.target.value))} className="w-24 border border-[#2563FF] rounded-lg px-2 py-1 text-sm bg-white" />
        ) : (
            <div className="font-['Space_Grotesk'] font-bold text-[#0B1220]">${order.total.toLocaleString()}</div>
        )}
      </td>

      <td className="px-5 py-5 max-w-[200px]">
         {isEditingData ? (
            <input type="text" value={draftProduct} onChange={(e) => setDraftProduct(e.target.value)} className="w-full border border-[#2563FF] rounded-lg px-2 py-1 text-sm bg-white" />
        ) : (
            <div className="truncate text-sm text-gray-600" title={order.productSummary}>{order.productSummary}</div>
        )}
      </td>

      {/* Status */}
      <td className="px-5 py-5">
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={draftStatus}
              onChange={(e) => setDraftStatus(e.target.value as OrderStatus)}
              className={`
                appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide cursor-pointer border transition-all
                ${currentStatus.bg} ${currentStatus.text} ${currentStatus.border} focus:ring-2 focus:ring-offset-1 focus:ring-blue-200
              `}
            >
              {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <currentStatus.icon className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 ${currentStatus.text}`} />
          </div>
          {hasStatusChanged && (
            <button onClick={() => onUpdate(order.id, { status: draftStatus })} className="bg-[#00E5A8] text-[#0B1220] rounded-full p-1 shadow-sm hover:scale-110 transition-transform"><Check className="w-3 h-3" /></button>
          )}
        </div>
      </td>

      {/* Payment */}
      <td className="px-5 py-5">
        <div className="flex items-center gap-2">
          <div className="relative">
             <select
              value={draftPayment}
              onChange={handlePaymentChange}
              className={`
                appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide cursor-pointer transition-all
                ${currentPayment.bg} ${currentPayment.text} focus:ring-2 focus:ring-offset-1 focus:ring-gray-200
              `}
            >
              <option value={PaymentStatus.PENDIENTE}>Pendiente</option>
              <option value={PaymentStatus.PAGADO} disabled={!canBePaid}>Pagado</option>
            </select>
            <DollarSign className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 opacity-50`} />
          </div>
          {hasPaymentChanged && (
            <button onClick={() => onUpdate(order.id, { paymentStatus: draftPayment })} className="bg-[#00E5A8] text-[#0B1220] rounded-full p-1 shadow-sm hover:scale-110 transition-transform"><Check className="w-3 h-3" /></button>
          )}
        </div>
      </td>

      {/* Actions */}
      <td className="px-5 py-5 text-right">
        {isEditingData ? (
            <div className="flex justify-end gap-2">
                <button onClick={saveDataEdit} className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Check className="w-4 h-4" /></button>
                <button onClick={() => setIsEditingData(false)} className="p-2 bg-red-50 text-red-600 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
        ) : (
            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {onPrint && <button onClick={() => onPrint(order)} className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg"><Printer className="w-4 h-4" /></button>}
                <button onClick={() => setIsEditingData(true)} className="p-2 text-gray-400 hover:text-[#2563FF] hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => onDelete(order.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div>
        )}
      </td>
    </tr>
  );
};

const OrderTable: React.FC<OrderTableProps> = ({ orders, setOrders, onPrint, onRestore }) => {
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deletedOrders, setDeletedOrders] = useState<Order[]>([]);
  const [showUndo, setShowUndo] = useState(false);
  const [pendingBulkStatus, setPendingBulkStatus] = useState<OrderStatus | ''>('');
  const [pendingBulkPayment, setPendingBulkPayment] = useState<PaymentStatus | ''>('');

  // Calculations for KPIs
  const totalOrders = orders.length;
  const inProcess = orders.filter(o => o.status === OrderStatus.PENDIENTE).length;
  const delivered = orders.filter(o => o.status === OrderStatus.ENTREGADO).length;
  const issues = orders.filter(o => o.status === OrderStatus.NOVEDAD || o.status === OrderStatus.DEVUELTO).length;
  const revenue = orders.filter(o => o.paymentStatus === PaymentStatus.PAGADO).reduce((acc, curr) => acc + curr.total, 0);

  // Priority Orders (Incidents)
  const incidentOrders = orders.filter(o => o.status === OrderStatus.NOVEDAD).slice(0, 3);

  useEffect(() => {
    if (showUndo) {
        const timer = setTimeout(() => { setShowUndo(false); setDeletedOrders([]); }, 5000);
        return () => clearTimeout(timer);
    }
  }, [showUndo, deletedOrders]);

  const handleDeleteOrder = (id: string) => {
    const orderToDelete = orders.find(o => o.id === id);
    if (orderToDelete) {
         setDeletedOrders(prev => [...prev, orderToDelete]);
         setShowUndo(true);
         setOrders(prev => prev.filter(o => o.id !== id));
         setSelectedIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
         });
    }
  };

  const handleUpdateOrder = (id: string, updates: Partial<Order>) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    const ordersToDelete = orders.filter(o => selectedIds.has(o.id));
    setDeletedOrders(prev => [...prev, ...ordersToDelete]);
    setShowUndo(true);
    setOrders(prevOrders => prevOrders.filter(order => !selectedIds.has(order.id)));
    clearSelection();
  };

  const handleUndo = () => {
    setOrders(prev => [...prev, ...deletedOrders]);
    setShowUndo(false);
    setDeletedOrders([]);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredOrders.map(o => o.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
        return newSet;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setPendingBulkStatus('');
    setPendingBulkPayment('');
  };

  const handleApplyBulkStatus = () => {
    if (!pendingBulkStatus) return;
    setOrders(prev => prev.map(o => {
        if (selectedIds.has(o.id)) {
            const newPayment = (pendingBulkStatus !== OrderStatus.ENTREGADO && o.paymentStatus === PaymentStatus.PAGADO) ? PaymentStatus.PENDIENTE : o.paymentStatus;
            return { ...o, status: pendingBulkStatus, paymentStatus: newPayment };
        }
        return o;
    }));
    clearSelection();
  };

  const handleApplyBulkPayment = () => {
    if (!pendingBulkPayment) return;
    setOrders(prev => prev.map(o => selectedIds.has(o.id) ? { ...o, paymentStatus: pendingBulkPayment } : o));
    clearSelection();
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingCompany.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const allSelected = filteredOrders.length > 0 && selectedIds.size === filteredOrders.length;
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < filteredOrders.length;

  return (
    <div className="space-y-6">
      
      {/* KPI ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard title="Total Pedidos" value={totalOrders} icon={Package} colorClass="bg-blue-100 text-[#2563FF]" delay="delay-0" />
        <KpiCard title="En Proceso" value={inProcess} icon={Clock} colorClass="bg-yellow-100 text-yellow-600" delay="delay-75" />
        <KpiCard title="Entregados" value={delivered} icon={Check} colorClass="bg-[#00E5A8]/20 text-[#00a876]" delay="delay-100" />
        <KpiCard title="Novedades" value={issues} icon={AlertTriangle} colorClass="bg-red-100 text-red-600" delay="delay-150" />
        <KpiCard title="Recaudado (COD)" value={`$${revenue.toLocaleString()}`} icon={DollarSign} colorClass="bg-[#B6FF2E]/30 text-green-700" delay="delay-200" />
      </div>

      {/* INCIDENCE / PRIORITY SECTION */}
      {incidentOrders.length > 0 && (
         <div className="bg-gradient-to-r from-[#2563FF] to-[#1e4bbf] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden animate-fade-in">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
             
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                 <div>
                    <div className="flex items-center gap-2 mb-1">
                        <AlertOctagon className="w-5 h-5 text-[#B6FF2E]" />
                        <span className="text-[#B6FF2E] font-bold text-xs uppercase tracking-widest">Atención Requerida</span>
                    </div>
                    <h3 className="font-['Space_Grotesk'] text-2xl font-bold">Tienes {issues} envíos con novedades</h3>
                    <p className="text-blue-100 text-sm mt-1 max-w-lg">
                       Hay órdenes marcadas como "Novedad" o "Devuelto". Revisa estos casos prioritarios para evitar pérdidas.
                    </p>
                 </div>
                 <button 
                    onClick={() => setFilterStatus(OrderStatus.NOVEDAD)} 
                    className="bg-white text-[#2563FF] px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-[#B6FF2E] hover:text-[#0B1220] transition-colors"
                 >
                    Ver Prioridades
                 </button>
             </div>
         </div>
      )}

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
        {/* TOOLBAR */}
        <div className={`p-5 border-b border-gray-100 flex flex-col lg:flex-row justify-between items-center gap-4 ${selectedIds.size > 0 ? 'bg-blue-50/50' : 'bg-white'}`}>
            {selectedIds.size > 0 ? (
               <div className="w-full flex items-center justify-between animate-fade-in">
                  <div className="flex items-center gap-3">
                     <span className="bg-[#2563FF] text-white px-3 py-1 rounded-lg text-xs font-bold">{selectedIds.size} seleccionados</span>
                     <button onClick={clearSelection} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="flex gap-2">
                     <select onChange={(e) => setPendingBulkStatus(e.target.value as OrderStatus)} value={pendingBulkStatus} className="bg-white border-0 ring-1 ring-gray-200 rounded-lg px-3 py-2 text-sm font-medium">
                        <option value="">Cambiar Estado...</option>
                        {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                     {pendingBulkStatus && <button onClick={handleApplyBulkStatus} className="bg-[#2563FF] text-white p-2 rounded-lg"><Check className="w-4 h-4"/></button>}
                     
                     <select onChange={(e) => setPendingBulkPayment(e.target.value as PaymentStatus)} value={pendingBulkPayment} className="bg-white border-0 ring-1 ring-gray-200 rounded-lg px-3 py-2 text-sm font-medium">
                         <option value="">Cambiar Pago...</option>
                         {Object.values(PaymentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                     {pendingBulkPayment && <button onClick={handleApplyBulkPayment} className="bg-[#00E5A8] text-[#0B1220] p-2 rounded-lg"><Check className="w-4 h-4"/></button>}

                     <div className="w-px h-8 bg-gray-200 mx-2"></div>
                     <button onClick={handleBulkDelete} className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-100">Eliminar</button>
                  </div>
               </div>
            ) : (
               <>
                 <div className="relative flex-1 w-full lg:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Buscar por cliente, guía o ciudad..." 
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-[#2563FF] focus:ring-0 rounded-xl text-sm transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
                 <div className="flex gap-2 w-full lg:w-auto overflow-x-auto">
                    {['ALL', ...Object.values(OrderStatus)].map(status => (
                       <button
                         key={status}
                         onClick={() => setFilterStatus(status as OrderStatus | 'ALL')}
                         className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors
                            ${filterStatus === status 
                               ? 'bg-[#0B1220] text-white shadow-md' 
                               : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'}
                         `}
                       >
                         {status === 'ALL' ? 'Todo' : status}
                       </button>
                    ))}
                 </div>
               </>
            )}
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-gray-400 text-xs uppercase tracking-wider font-semibold">
                 <tr>
                    <th className="px-5 py-4 w-12">
                       <input type="checkbox" className="w-5 h-5 text-[#2563FF] border-gray-200 rounded-lg cursor-pointer" checked={allSelected} ref={i => i && (i.indeterminate = isIndeterminate)} onChange={handleSelectAll} />
                    </th>
                    <th className="px-5 py-4">Cliente</th>
                    <th className="px-5 py-4">Courier</th>
                    <th className="px-5 py-4">Entrega</th>
                    <th className="px-5 py-4">Ciudad</th>
                    <th className="px-5 py-4">Total</th>
                    <th className="px-5 py-4">Detalle</th>
                    <th className="px-5 py-4">Estado</th>
                    <th className="px-5 py-4">Pago</th>
                    <th className="px-5 py-4 text-right">Acciones</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                 {filteredOrders.map(order => (
                    <OrderRow 
                      key={order.id} 
                      order={order} 
                      isSelected={selectedIds.has(order.id)}
                      onSelect={handleSelectRow}
                      onUpdate={handleUpdateOrder}
                      onDelete={handleDeleteOrder}
                      onPrint={onPrint}
                    />
                 ))}
                 {filteredOrders.length === 0 && (
                    <tr>
                       <td colSpan={10} className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center">
                             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <Truck className="w-8 h-8 text-gray-300" />
                             </div>
                             <h3 className="font-['Space_Grotesk'] font-bold text-gray-900 text-lg">Sin resultados</h3>
                             <p className="text-gray-400 text-sm mt-1 mb-6">No encontramos órdenes con estos filtros.</p>
                             {onRestore && orders.length === 0 && (
                                <button onClick={onRestore} className="bg-[#2563FF] text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-200">
                                   Cargar Datos Demo
                                </button>
                             )}
                          </div>
                       </td>
                    </tr>
                 )}
              </tbody>
           </table>
        </div>
      </div>

      {/* Undo Toast */}
      {showUndo && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#0B1220] text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="flex items-center gap-2">
                <div className="bg-red-500/20 p-1 rounded-full"><Trash2 className="w-4 h-4 text-red-500" /></div>
                <span className="text-sm font-medium">{deletedOrders.length} eliminados</span>
            </div>
            <div className="h-4 w-px bg-white/20"></div>
            <button onClick={handleUndo} className="text-[#B6FF2E] text-sm font-bold hover:underline flex items-center gap-1">
                <RotateCcw className="w-4 h-4" /> Deshacer
            </button>
            <button onClick={() => setShowUndo(false)} className="ml-2 text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  );
};

export default OrderTable;