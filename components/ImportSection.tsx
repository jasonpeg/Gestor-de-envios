import React, { useState, useCallback } from 'react';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { parseOrderDocument } from '../services/geminiService';
import { saveOrdersToSupabase } from '../services/orderService';
import { Order, OrderStatus, PaymentStatus } from '../types';

interface ImportSectionProps {
  onImportComplete: (newOrders: Order[]) => void;
}

const ImportSection: React.FC<ImportSectionProps> = ({ onImportComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewOrders, setPreviewOrders] = useState<Partial<Order>[]>([]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setPreviewOrders([]);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64String = (reader.result as string).split(',')[1];

        // Determine mime type (simple check)
        let mimeType = file.type;
        // Fallback for some windows systems that might not populate type correctly for CSV/Excel
        if (!mimeType) {
          if (file.name.endsWith('.pdf')) mimeType = 'application/pdf';
          else if (file.name.endsWith('.png')) mimeType = 'image/png';
          else if (file.name.endsWith('.jpg') || file.name.endsWith('.jpeg')) mimeType = 'image/jpeg';
        }

        const extractedOrders = await parseOrderDocument(base64String, mimeType);
        setPreviewOrders(extractedOrders);
      };
      reader.onerror = () => {
        throw new Error("Error leyendo el archivo local.");
      }
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al procesar el archivo.");
    } finally {
      setIsProcessing(false);
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const confirmImport = async () => {
    const finalOrders: Order[] = previewOrders.map(p => ({
      ...p,
      id: crypto.randomUUID(),
      status: OrderStatus.PENDIENTE,
      paymentStatus: PaymentStatus.PENDIENTE,
      // Ensure all fields are present
      shippingNumber: p.shippingNumber || "S/N",
      shippingCompany: p.shippingCompany || "Pendiente",
      phoneNumber: p.phoneNumber || "",
      productSummary: p.productSummary || "Sin descripción",
      total: p.total || 0,
      items: p.items || [],
      customerName: p.customerName || "Sin Nombre",
      city: p.city || "",
      date: p.date || new Date().toISOString().split('T')[0]
    } as Order));

    await saveOrdersToSupabase(finalOrders);
    onImportComplete(finalOrders);
    setPreviewOrders([]);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Importar Órdenes</h2>
        <p className="text-gray-500 mb-6">Sube una imagen de tu hoja de cálculo o factura. La IA extraerá: Nombre, # Envío, Compañía, Fecha, Ciudad, Monto, Producto y Teléfono.</p>

        <div
          className={`
            relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ease-in-out
            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileInput}
            accept=".pdf,.jpg,.jpeg,.png,.xlsx"
          />

          <div className="flex flex-col items-center pointer-events-none">
            {isProcessing ? (
              <>
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-lg font-medium text-gray-700">Analizando documento con IA...</p>
                <p className="text-sm text-gray-400 mt-2">Mapeando columnas automáticamente</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8" />
                </div>
                <p className="text-lg font-medium text-gray-700">Arrastra archivos aquí o haz clic para subir</p>
                <p className="text-sm text-gray-400 mt-2">Soporta PDF, JPG, PNG, Excel</p>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
      </div>

      {previewOrders.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Vista Previa ({previewOrders.length})
            </h3>
            <div className="flex gap-3">
              <button
                onClick={() => setPreviewOrders([])}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmImport}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
              >
                Guardar en Base de Datos
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 font-bold uppercase tracking-wider text-xs border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3"># Envío</th>
                  <th className="px-4 py-3">Compañía</th>
                  <th className="px-4 py-3">Creación</th>
                  <th className="px-4 py-3">Ciudad</th>
                  <th className="px-4 py-3">Monto</th>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">Teléfono</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {previewOrders.map((order, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{order.customerName}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{order.shippingNumber}</td>
                    <td className="px-4 py-3">{order.shippingCompany}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{order.date}</td>
                    <td className="px-4 py-3">{order.city}</td>
                    <td className="px-4 py-3 text-right font-mono">${order.total?.toLocaleString()}</td>
                    <td className="px-4 py-3 max-w-xs truncate" title={order.productSummary}>{order.productSummary}</td>
                    <td className="px-4 py-3 font-mono text-xs">{order.phoneNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportSection;
