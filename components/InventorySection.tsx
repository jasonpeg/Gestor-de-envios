import React, { useState } from 'react';
import { Product, InventoryLog } from '../types';
import { Search, Plus, Package, ArrowUpCircle, ArrowDownCircle, AlertTriangle, Box, Save, X, History, Calendar, Edit2 } from 'lucide-react';

interface InventorySectionProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  logs: InventoryLog[];
  setLogs: React.Dispatch<React.SetStateAction<InventoryLog[]>>;
}

const InventorySection: React.FC<InventorySectionProps> = ({ products, setProducts, logs, setLogs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  // State for quick stock adjustment (IN/OUT buttons)
  const [adjustingProductId, setAdjustingProductId] = useState<string | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState<string>('');
  const [adjustmentDate, setAdjustmentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [adjustmentType, setAdjustmentType] = useState<'IN' | 'OUT'>('IN');

  // State for manual stock SET (Edit pencil)
  const [stockEditId, setStockEditId] = useState<string | null>(null);
  const [stockEditValue, setStockEditValue] = useState<string>('');

  // New Product Form State
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    reference: '',
    name: '',
    price1: 0,
    price2: 0,
    price3: 0,
    stock: 0
  });

  // Derived Stats
  const totalItems = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  // Updated threshold to <= 5
  const lowStockItems = products.filter(p => (p.stock || 0) <= 5).length;
  const totalValue = products.reduce((acc, p) => acc + ((p.stock || 0) * (p.price1 || 0)), 0);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.reference) return;

    const product: Product = {
      id: crypto.randomUUID(),
      reference: newProduct.reference,
      name: newProduct.name,
      price1: Number(newProduct.price1),
      price2: Number(newProduct.price2),
      price3: Number(newProduct.price3),
      stock: Number(newProduct.stock)
    };

    setProducts(prev => [...prev, product]);
    setIsCreateModalOpen(false);
    setNewProduct({ reference: '', name: '', price1: 0, price2: 0, price3: 0, stock: 0 });
  };

  const handleStockAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProductId || !adjustmentAmount) return;

    const amount = parseInt(adjustmentAmount);
    if (isNaN(amount) || amount <= 0) return;

    const product = products.find(p => p.id === adjustingProductId);
    if (!product) return;

    // 1. Update Product Stock
    setProducts(prev => prev.map(p => {
      if (p.id === adjustingProductId) {
        const newStock = adjustmentType === 'IN' 
          ? (p.stock || 0) + amount 
          : Math.max(0, (p.stock || 0) - amount);
        return { ...p, stock: newStock };
      }
      return p;
    }));

    // 2. Create History Log
    const newLog: InventoryLog = {
        id: crypto.randomUUID(),
        productId: product.id,
        productName: product.name,
        reference: product.reference,
        quantity: amount,
        type: adjustmentType,
        date: adjustmentDate,
        notes: adjustmentType === 'IN' ? 'Entrada al Almacén Merquix' : 'Salida de Stock'
    };

    setLogs(prev => [newLog, ...prev]);

    setAdjustingProductId(null);
    setAdjustmentAmount('');
    setAdjustmentDate(new Date().toISOString().split('T')[0]); // Reset to today
  };

  const handleManualStockUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockEditId || stockEditValue === '') return;

    const newValue = parseInt(stockEditValue);
    if (isNaN(newValue) || newValue < 0) return;

    const product = products.find(p => p.id === stockEditId);
    if (!product) return;

    const currentStock = product.stock || 0;
    const difference = newValue - currentStock;
    
    if (difference === 0) {
        setStockEditId(null);
        return;
    }

    // Update Product
    setProducts(prev => prev.map(p => 
        p.id === stockEditId ? { ...p, stock: newValue } : p
    ));

    // Log the difference automatically
    const newLog: InventoryLog = {
        id: crypto.randomUUID(),
        productId: product.id,
        productName: product.name,
        reference: product.reference,
        quantity: Math.abs(difference),
        type: difference > 0 ? 'IN' : 'OUT',
        date: new Date().toISOString().split('T')[0],
        notes: `Ajuste manual: Stock corregido de ${currentStock} a ${newValue}`
    };

    setLogs(prev => [newLog, ...prev]);
    setStockEditId(null);
    setStockEditValue('');
  };

  const openAdjustment = (id: string, type: 'IN' | 'OUT') => {
    setAdjustingProductId(id);
    setAdjustmentType(type);
    setAdjustmentAmount('');
    setAdjustmentDate(new Date().toISOString().split('T')[0]);
  };

  const openStockEdit = (product: Product) => {
    setStockEditId(product.id);
    setStockEditValue((product.stock || 0).toString());
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in h-full">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Unidades Merquix</p>
            <h3 className="text-2xl font-bold text-gray-800">{totalItems}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Valor Inventario</p>
            <h3 className="text-2xl font-bold text-gray-800">${totalValue.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className={`p-3 rounded-full ${lowStockItems > 0 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Alertas Stock Bajo</p>
            <h3 className="text-2xl font-bold text-gray-800">{lowStockItems}</h3>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col flex-1 overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Inventario Merquix</h2>
            <p className="text-sm text-gray-500">Gestiona entradas y salidas de mercancía</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar referencia o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            
            <button 
              onClick={() => setIsHistoryModalOpen(true)}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
            >
              <History className="w-4 h-4" />
              Historial
            </button>

            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Nuevo Producto
            </button>
          </div>
        </div>

        {/* Product Table */}
        <div className="overflow-auto flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-700 font-bold uppercase tracking-wider text-xs border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">Referencia</th>
                <th className="px-6 py-3">Producto</th>
                <th className="px-6 py-3 text-right">Precio Base</th>
                <th className="px-6 py-3 text-center">Stock Actual</th>
                <th className="px-6 py-3 text-center">Movimientos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 font-mono text-gray-500 font-medium">{product.reference}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 text-right text-gray-600">${product.price1.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center gap-2">
                      <span className={`
                        px-3 py-1 rounded-full text-xs font-bold border
                        ${(product.stock || 0) > 5 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : (product.stock || 0) > 0 
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200' 
                            : 'bg-red-50 text-red-700 border-red-200'}
                      `}>
                        {product.stock || 0} Unidades
                      </span>
                      <button 
                        onClick={() => openStockEdit(product)}
                        className="text-gray-400 hover:text-blue-600 p-1 hover:bg-blue-50 rounded transition-colors"
                        title="Editar cantidad manualmente"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => openAdjustment(product.id, 'IN')}
                        className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 border border-blue-200 transition-colors"
                        title="Entrada de Mercancía"
                      >
                        <ArrowUpCircle className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => openAdjustment(product.id, 'OUT')}
                        className="p-1.5 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 border border-gray-200 transition-colors"
                        title="Salida / Ajuste"
                      >
                        <ArrowDownCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    No hay productos en inventario. Crea uno nuevo para empezar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Product Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Registrar Nuevo Producto en Merquix</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Referencia</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: KIT-001"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newProduct.reference}
                    onChange={e => setNewProduct({...newProduct, reference: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newProduct.stock || ''}
                    onChange={e => setNewProduct({...newProduct, stock: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Nombre del Producto</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Kit Cúrcuma + Jabones"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Precio 1 (Base)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newProduct.price1 || ''}
                    onChange={e => setNewProduct({...newProduct, price1: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Precio 2</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newProduct.price2 || ''}
                    onChange={e => setNewProduct({...newProduct, price2: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Precio 3</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newProduct.price3 || ''}
                    onChange={e => setNewProduct({...newProduct, price3: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium text-sm hover:bg-gray-100 rounded-lg">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 shadow-sm flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {adjustingProductId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {adjustmentType === 'IN' ? 'Entrada de Mercancía' : 'Salida / Ajuste'}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {products.find(p => p.id === adjustingProductId)?.name}
              </p>
              
              <form onSubmit={handleStockAdjustment}>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Fecha de Registro</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="date"
                      required
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={adjustmentDate}
                      onChange={e => setAdjustmentDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Cantidad</label>
                  <input
                    type="number"
                    autoFocus
                    required
                    min="1"
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    value={adjustmentAmount}
                    onChange={e => setAdjustmentAmount(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-3">
                  <button type="button" onClick={() => setAdjustingProductId(null)} className="flex-1 px-4 py-2 text-gray-600 font-medium text-sm hover:bg-gray-100 rounded-lg">
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className={`flex-1 px-4 py-2 text-white font-medium text-sm rounded-lg shadow-sm flex justify-center items-center gap-2
                      ${adjustmentType === 'IN' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                    `}
                  >
                    {adjustmentType === 'IN' ? 'Sumar Stock' : 'Restar Stock'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Manual Set Stock Modal */}
      {stockEditId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Corrección Manual de Inventario
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Define la cantidad exacta actual en el almacén.
              </p>
              
              <form onSubmit={handleManualStockUpdate}>
                <div className="mb-6">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Stock Real Actual</label>
                  <input
                    type="number"
                    autoFocus
                    required
                    min="0"
                    className="w-full border border-blue-300 bg-blue-50 rounded-lg px-4 py-3 text-xl font-bold text-blue-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={stockEditValue}
                    onChange={e => setStockEditValue(e.target.value)}
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Esto calculará automáticamente la diferencia y creará un registro en el historial.
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStockEditId(null)} className="flex-1 px-4 py-2 text-gray-600 font-medium text-sm hover:bg-gray-100 rounded-lg">
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm"
                  >
                    Actualizar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-800">Historial de Movimientos</h3>
              </div>
              <button onClick={() => setIsHistoryModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-auto flex-1 p-0">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-700 font-semibold sticky top-0 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3">Fecha</th>
                            <th className="px-6 py-3">Producto</th>
                            <th className="px-6 py-3 text-center">Tipo</th>
                            <th className="px-6 py-3 text-right">Cantidad</th>
                            <th className="px-6 py-3 text-gray-400 text-xs">Notas</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                    No hay movimientos registrados aún.
                                </td>
                            </tr>
                        ) : (
                            logs.map(log => (
                                <tr key={log.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-3 whitespace-nowrap text-gray-600">{log.date}</td>
                                    <td className="px-6 py-3">
                                        <div className="font-medium text-gray-900">{log.productName}</div>
                                        <div className="text-xs text-gray-500">{log.reference}</div>
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
                                            ${log.type === 'IN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                                        `}>
                                            {log.type === 'IN' ? 'Entrada' : 'Salida'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-right font-medium">
                                        {log.type === 'IN' ? '+' : '-'}{log.quantity}
                                    </td>
                                    <td className="px-6 py-3 text-xs text-gray-500 max-w-[200px] truncate">
                                        {log.notes}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 text-center shrink-0">
                Mostrando {logs.length} registros
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventorySection;