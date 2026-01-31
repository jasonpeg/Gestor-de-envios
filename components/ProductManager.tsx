import React, { useState } from 'react';
import { Product } from '../types';
import { Plus, Edit2, Trash2, Search, Save, X } from 'lucide-react';

interface ProductManagerProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

const ProductManager: React.FC<ProductManagerProps> = ({ products, setProducts }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Temporary state for the row being edited/created
  const [editForm, setEditForm] = useState<Partial<Product>>({});

  const handleAddNew = () => {
    const newId = crypto.randomUUID();
    const newProduct: Product = {
      id: newId,
      name: '',
      reference: '',
      price1: 0,
      price2: 0,
      price3: 0,
      stock: 0
    };
    setEditForm(newProduct);
    setEditingId(newId);
  };

  const handleEdit = (product: Product) => {
    setEditForm({ ...product });
    setEditingId(product.id);
  };

  const handleSave = () => {
    if (!editForm.name || !editForm.reference) return; // Simple validation

    setProducts(prev => {
      const exists = prev.find(p => p.id === editingId);
      if (exists) {
        return prev.map(p => p.id === editingId ? { ...p, ...editForm } as Product : p);
      } else {
        return [...prev, editForm as Product];
      }
    });
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
      <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Catálogo de Productos</h2>
          <p className="text-sm text-gray-500">Gestiona referencias, precios por cantidad y stock</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900"
            />
          </div>
          <button 
            onClick={handleAddNew}
            disabled={editingId !== null}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo
          </button>
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-semibold">Referencia</th>
              <th className="px-6 py-3 font-semibold">Nombre del Producto</th>
              <th className="px-4 py-3 font-semibold text-right">Precio (1)</th>
              <th className="px-4 py-3 font-semibold text-right">Precio (2)</th>
              <th className="px-4 py-3 font-semibold text-right">Precio (3)</th>
              <th className="px-6 py-3 font-semibold text-right">Stock</th>
              <th className="px-6 py-3 font-semibold text-center w-24">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {editingId && !products.find(p => p.id === editingId) && (
               <tr className="bg-blue-50">
                 {/* New Item Row */}
                 <td className="px-6 py-4">
                   <input 
                    className="w-full bg-white border border-blue-300 rounded px-2 py-1 outline-none text-gray-900 placeholder-gray-400"
                    value={editForm.reference || ''}
                    onChange={e => setEditForm(prev => ({...prev, reference: e.target.value}))}
                    placeholder="REF-001"
                    autoFocus
                   />
                 </td>
                 <td className="px-6 py-4">
                   <input 
                    className="w-full bg-white border border-blue-300 rounded px-2 py-1 outline-none text-gray-900 placeholder-gray-400"
                    value={editForm.name || ''}
                    onChange={e => setEditForm(prev => ({...prev, name: e.target.value}))}
                    placeholder="Nombre Producto"
                   />
                 </td>
                 <td className="px-4 py-4">
                   <input 
                    type="number"
                    className="w-full bg-white border border-blue-300 rounded px-2 py-1 outline-none text-right text-gray-900"
                    value={editForm.price1 || ''}
                    onChange={e => setEditForm(prev => ({...prev, price1: parseFloat(e.target.value)}))}
                    placeholder="0"
                   />
                 </td>
                 <td className="px-4 py-4">
                   <input 
                    type="number"
                    className="w-full bg-white border border-blue-300 rounded px-2 py-1 outline-none text-right text-gray-900"
                    value={editForm.price2 || ''}
                    onChange={e => setEditForm(prev => ({...prev, price2: parseFloat(e.target.value)}))}
                    placeholder="0"
                   />
                 </td>
                 <td className="px-4 py-4">
                   <input 
                    type="number"
                    className="w-full bg-white border border-blue-300 rounded px-2 py-1 outline-none text-right text-gray-900"
                    value={editForm.price3 || ''}
                    onChange={e => setEditForm(prev => ({...prev, price3: parseFloat(e.target.value)}))}
                    placeholder="0"
                   />
                 </td>
                 <td className="px-6 py-4">
                   <input 
                    type="number"
                    className="w-full bg-white border border-blue-300 rounded px-2 py-1 outline-none text-right text-gray-900"
                    value={editForm.stock || ''}
                    onChange={e => setEditForm(prev => ({...prev, stock: parseFloat(e.target.value)}))}
                   />
                 </td>
                 <td className="px-6 py-4 flex justify-center gap-2">
                   <button onClick={handleSave} className="p-1 text-green-600 hover:bg-green-100 rounded"><Save className="w-4 h-4"/></button>
                   <button onClick={handleCancel} className="p-1 text-red-600 hover:bg-red-100 rounded"><X className="w-4 h-4"/></button>
                 </td>
               </tr>
            )}

            {filteredProducts.map(product => {
              const isEditing = editingId === product.id;
              return (
                <tr key={product.id} className="hover:bg-gray-50 group">
                  <td className="px-6 py-4 font-mono text-gray-500">
                    {isEditing ? (
                       <input 
                        className="w-full bg-white border border-blue-300 rounded px-2 py-1 outline-none text-gray-900"
                        value={editForm.reference}
                        onChange={e => setEditForm(prev => ({...prev, reference: e.target.value}))}
                       />
                    ) : product.reference}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {isEditing ? (
                       <input 
                        className="w-full bg-white border border-blue-300 rounded px-2 py-1 outline-none text-gray-900"
                        value={editForm.name}
                        onChange={e => setEditForm(prev => ({...prev, name: e.target.value}))}
                       />
                    ) : product.name}
                  </td>
                  
                  {/* Price 1 */}
                  <td className="px-4 py-4 text-right">
                    {isEditing ? (
                       <input 
                        type="number"
                        className="w-full bg-white border border-blue-300 rounded px-2 py-1 outline-none text-right text-gray-900"
                        value={editForm.price1}
                        onChange={e => setEditForm(prev => ({...prev, price1: parseFloat(e.target.value)}))}
                       />
                    ) : `$${product.price1?.toLocaleString() || 0}`}
                  </td>
                  
                  {/* Price 2 */}
                  <td className="px-4 py-4 text-right">
                    {isEditing ? (
                       <input 
                        type="number"
                        className="w-full bg-white border border-blue-300 rounded px-2 py-1 outline-none text-right text-gray-900"
                        value={editForm.price2}
                        onChange={e => setEditForm(prev => ({...prev, price2: parseFloat(e.target.value)}))}
                       />
                    ) : `$${product.price2?.toLocaleString() || 0}`}
                  </td>

                  {/* Price 3 */}
                  <td className="px-4 py-4 text-right">
                    {isEditing ? (
                       <input 
                        type="number"
                        className="w-full bg-white border border-blue-300 rounded px-2 py-1 outline-none text-right text-gray-900"
                        value={editForm.price3}
                        onChange={e => setEditForm(prev => ({...prev, price3: parseFloat(e.target.value)}))}
                       />
                    ) : `$${product.price3?.toLocaleString() || 0}`}
                  </td>

                  <td className="px-6 py-4 text-right">
                    {isEditing ? (
                       <input 
                        type="number"
                        className="w-full bg-white border border-blue-300 rounded px-2 py-1 outline-none text-right text-gray-900"
                        value={editForm.stock}
                        onChange={e => setEditForm(prev => ({...prev, stock: parseFloat(e.target.value)}))}
                       />
                    ) : product.stock}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {isEditing ? (
                        <>
                          <button onClick={handleSave} className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors" title="Guardar">
                            <Save className="w-4 h-4"/>
                          </button>
                          <button onClick={handleCancel} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors" title="Cancelar">
                            <X className="w-4 h-4"/>
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(product)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Editar">
                            <Edit2 className="w-4 h-4"/>
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors" title="Eliminar">
                            <Trash2 className="w-4 h-4"/>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            
            {filteredProducts.length === 0 && !editingId && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                  No se encontraron productos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductManager;
