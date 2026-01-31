import React, { useState } from 'react';
import { Order, OrderStatus, PaymentStatus, Product } from '../types';
import { saveOrderToSupabase } from '../services/orderService';
import OrderTable from './OrderTable';
import { PlusCircle, ChevronUp, ChevronDown, Package, MapPin, DollarSign } from 'lucide-react';

interface ManualOrderSectionProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  products: Product[];
}

const PREDEFINED_COMPANIES = ["GINTRACOM", "AUREL", "TRANSFORTE", "FLASH CARGO"];

const ManualOrderSection: React.FC<ManualOrderSectionProps> = ({ orders, setOrders, products }) => {
  const [isFormOpen, setIsFormOpen] = useState(true);

  // State for Plus Code logic (manual input only now)
  const [plusCode, setPlusCode] = useState('');

  // Toggle for custom shipping company input
  const [isCustomCompany, setIsCustomCompany] = useState(false);

  const [newOrder, setNewOrder] = useState<Partial<Order>>({
    customerName: '',
    shippingNumber: '',
    shippingCompany: 'GINTRACOM', // Default to first option
    city: '',
    address: '', // New field for details
    total: 0,
    productSummary: '',
    phoneNumber: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewOrder(prev => ({
      ...prev,
      [name]: name === 'total' ? (value === '' ? 0 : parseFloat(value)) : value
    }));
  };

  const handleCompanySelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'OTRO') {
      setIsCustomCompany(true);
      setNewOrder(prev => ({ ...prev, shippingCompany: '' }));
    } else {
      setIsCustomCompany(false);
      setNewOrder(prev => ({ ...prev, shippingCompany: value }));
    }
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Check if the entered value matches an existing product name or reference
    const matchedProduct = products.find(
      p => p.name.toLowerCase() === value.toLowerCase() ||
        p.reference.toLowerCase() === value.toLowerCase()
    );

    setNewOrder(prev => ({
      ...prev,
      productSummary: value,
      // If product matched, auto-fill price (prefer price1), otherwise keep current or user entered
      total: matchedProduct ? matchedProduct.price1 : prev.total
    }));
  };

  const handleAddOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrder.customerName || !newOrder.productSummary) {
      alert("Por favor completa al menos el Nombre y el Producto.");
      return;
    }

    const orderToAdd: Order = {
      id: crypto.randomUUID(),
      customerName: newOrder.customerName || 'Sin Nombre',
      shippingNumber: newOrder.shippingNumber || 'S/N',
      shippingCompany: newOrder.shippingCompany || 'General',
      city: newOrder.city || '',
      address: newOrder.address || '', // Save address details
      notes: plusCode ? `Plus Code: ${plusCode}` : '', // Save Plus Code in notes
      total: newOrder.total || 0,
      productSummary: newOrder.productSummary || '',
      phoneNumber: newOrder.phoneNumber || '',
      date: newOrder.date || new Date().toISOString().split('T')[0],
      status: OrderStatus.PENDIENTE,
      paymentStatus: PaymentStatus.PENDIENTE,
      items: [], // Empty items for manual entry structure
      deliveryDate: ''
    };

    saveOrderToSupabase(orderToAdd);
    setOrders(prev => [orderToAdd, ...prev]);

    // Reset form but keep date
    setNewOrder({
      customerName: '',
      shippingNumber: '',
      shippingCompany: 'GINTRACOM',
      city: '',
      address: '',
      total: 0,
      productSummary: '',
      phoneNumber: '',
      date: new Date().toISOString().split('T')[0]
    });
    setPlusCode('');
    setIsCustomCompany(false);
  };

  const handlePrintLabel = (order: Order) => {
    const printWindow = window.open('', 'Imprimir Etiqueta', 'width=500,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Etiqueta de Envío - ${order.shippingNumber}</title>
            <style>
              body { font-family: 'Arial', sans-serif; padding: 20px; }
              .label-container { 
                border: 2px solid #000; 
                padding: 20px; 
                max-width: 400px; 
                margin: 0 auto; 
                text-align: left;
              }
              .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
              .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; }
              .header span { font-size: 14px; color: #555; }
              .row { margin-bottom: 10px; }
              .label { font-weight: bold; font-size: 12px; text-transform: uppercase; color: #333; }
              .value { font-size: 16px; margin-top: 2px; }
              .large-value { font-size: 20px; font-weight: bold; }
              .footer { margin-top: 20px; border-top: 1px dashed #000; padding-top: 10px; font-size: 12px; text-align: center; }
              .barcode { margin-top: 15px; text-align: center; background: #eee; padding: 10px; font-family: 'Courier New', monospace; letter-spacing: 4px; }
            </style>
          </head>
          <body>
            <div class="label-container">
              <div class="header">
                <h1>${order.shippingCompany}</h1>
                <span>Envío Prioritario</span>
              </div>
              
              <div class="row">
                <div class="label">Destinatario:</div>
                <div class="value large-value">${order.customerName}</div>
              </div>

              <div class="row">
                <div class="label">Teléfono:</div>
                <div class="value">${order.phoneNumber}</div>
              </div>

              <div class="row">
                <div class="label">Dirección / Ciudad:</div>
                <div class="value">${order.city}</div>
                ${order.address ? `<div class="value" style="font-size: 14px; margin-top: 4px;">${order.address}</div>` : ''}
                ${order.notes ? `<div class="value" style="font-size: 12px; color: #666; margin-top: 2px;">${order.notes}</div>` : ''}
              </div>

              <div class="row" style="margin-top: 15px; border-top: 1px solid #ccc; padding-top: 10px;">
                 <div class="label">Contenido:</div>
                 <div class="value" style="font-size: 14px;">${order.productSummary}</div>
              </div>

              <div class="row">
                 <div class="label">Cobrar al entregar:</div>
                 <div class="value large-value">$${order.total.toLocaleString()}</div>
              </div>

              <div class="barcode">
                *${order.shippingNumber || 'SIN-GUIA'}*
              </div>

              <div class="footer">
                Fecha: ${order.date} | ID: ${order.id.substring(0, 8)}
              </div>
            </div>
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in h-full">
      {/* Manual Entry Form */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden shrink-0">
        <div
          className="p-5 bg-white border-b border-gray-100 flex justify-between items-center cursor-pointer select-none hover:bg-gray-50 transition-colors"
          onClick={() => setIsFormOpen(!isFormOpen)}
        >
          <div className="flex items-center gap-3 text-[#0B1220] font-bold font-['Space_Grotesk'] text-lg">
            <div className="p-2 bg-[#2563FF]/10 rounded-lg text-[#2563FF]">
              <Package className="w-5 h-5" />
            </div>
            <h3>Nueva Orden Manual</h3>
          </div>
          <button className="text-gray-400 hover:text-[#2563FF] transition-colors">
            {isFormOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {isFormOpen && (
          <div className="p-6 md:p-8 bg-white">
            <form onSubmit={handleAddOrder} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">

              {/* Row 1: Name and Phone */}
              <div className="lg:col-span-5 space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Nombre Cliente *</label>
                <input
                  type="text"
                  name="customerName"
                  value={newOrder.customerName}
                  onChange={handleInputChange}
                  placeholder="Ej: Juan Perez"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium placeholder-gray-400 focus:ring-4 focus:ring-[#2563FF]/10 focus:border-[#2563FF] outline-none transition-all shadow-sm"
                  required
                />
              </div>

              <div className="lg:col-span-3 space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Teléfono</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={newOrder.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="809-555-5555"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium placeholder-gray-400 focus:ring-4 focus:ring-[#2563FF]/10 focus:border-[#2563FF] outline-none transition-all shadow-sm"
                />
              </div>

              <div className="lg:col-span-4 space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Compañía Envío</label>
                <select
                  name="shippingCompany"
                  value={isCustomCompany ? 'OTRO' : newOrder.shippingCompany}
                  onChange={handleCompanySelectChange}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium focus:ring-4 focus:ring-[#2563FF]/10 focus:border-[#2563FF] outline-none transition-all shadow-sm cursor-pointer appearance-none"
                >
                  {PREDEFINED_COMPANIES.map(company => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                  <option value="OTRO">OTRO</option>
                </select>

                {isCustomCompany && (
                  <input
                    type="text"
                    name="shippingCompany"
                    value={newOrder.shippingCompany}
                    onChange={handleInputChange}
                    placeholder="Escribe el nombre..."
                    className="mt-2 w-full bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-[#2563FF] font-medium focus:ring-4 focus:ring-[#2563FF]/10 outline-none animate-in fade-in slide-in-from-top-1"
                    autoFocus
                  />
                )}
              </div>

              {/* Row 2: Location */}
              <div className="lg:col-span-4 space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Ciudad / Sector</label>
                <input
                  type="text"
                  name="city"
                  value={newOrder.city}
                  onChange={handleInputChange}
                  placeholder="Ej: Santo Domingo Este"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium placeholder-gray-400 focus:ring-4 focus:ring-[#2563FF]/10 focus:border-[#2563FF] outline-none transition-all shadow-sm"
                />
              </div>

              <div className="lg:col-span-5 space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Dirección Detallada</label>
                <input
                  type="text"
                  name="address"
                  value={newOrder.address}
                  onChange={handleInputChange}
                  placeholder="Calle Principal #123, casa verde..."
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium placeholder-gray-400 focus:ring-4 focus:ring-[#2563FF]/10 focus:border-[#2563FF] outline-none transition-all shadow-sm"
                />
              </div>

              <div className="lg:col-span-3 space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Plus Code (Opcional)</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Ej: 779G+R8"
                    className="w-full pl-9 pr-3 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 font-medium placeholder-gray-400 focus:ring-4 focus:ring-[#2563FF]/10 focus:border-[#2563FF] outline-none transition-all shadow-sm"
                    value={plusCode}
                    onChange={(e) => setPlusCode(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 3: Product and Money */}
              <div className="lg:col-span-6 space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Producto / Detalle *</label>
                <input
                  type="text"
                  name="productSummary"
                  list="product-list"
                  value={newOrder.productSummary}
                  onChange={handleProductChange}
                  placeholder="Seleccionar del inventario o escribir..."
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium placeholder-gray-400 focus:ring-4 focus:ring-[#2563FF]/10 focus:border-[#2563FF] outline-none transition-all shadow-sm"
                  required
                />
                <datalist id="product-list">
                  {products.map(product => (
                    <option key={product.id} value={product.name}>
                      {product.reference} - ${product.price1}
                    </option>
                  ))}
                </datalist>
              </div>

              <div className="lg:col-span-3 space-y-2">
                <label className="block text-xs font-bold text-[#2563FF] uppercase tracking-wide">Monto Total ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="total"
                    value={newOrder.total === 0 ? '' : newOrder.total}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="w-full bg-white border-2 border-[#2563FF]/20 rounded-xl pl-10 pr-4 py-3 text-xl font-bold text-gray-900 placeholder-gray-300 focus:ring-4 focus:ring-[#2563FF]/10 focus:border-[#2563FF] outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="lg:col-span-3 space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Guía (Opcional)</label>
                <input
                  type="text"
                  name="shippingNumber"
                  value={newOrder.shippingNumber}
                  onChange={handleInputChange}
                  placeholder="Auto si vacío"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium placeholder-gray-400 focus:ring-4 focus:ring-[#2563FF]/10 focus:border-[#2563FF] outline-none transition-all shadow-sm"
                />
              </div>

              <div className="lg:col-span-12 pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#2563FF] hover:bg-[#1e4bbf] text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200 hover:-translate-y-1"
                >
                  <PlusCircle className="w-5 h-5" />
                  AGREGAR ORDEN
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Table Section with Print Capability */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <OrderTable
          orders={orders}
          setOrders={setOrders}
          onPrint={handlePrintLabel}
        />
      </div>
    </div>
  );
};

export default ManualOrderSection;