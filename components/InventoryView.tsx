
import React, { useState } from 'react';
import { useData } from '../App';
import { InventoryType, UserRole, InventoryItem } from '../types';
import { Plus, Search, Filter, Pencil, X } from 'lucide-react';

const InventoryView: React.FC = () => {
  const { inventory, warehouses, currentUser, addInventoryItem, updateInventoryItem } = useData();
  const [filterType, setFilterType] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Form Data
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    item_name: '',
    quantity: 0,
    unit: '',
    type: InventoryType.RawMaterial,
    warehouse_id: warehouses[0]?.id || ''
  });

  const canModify = currentUser?.role === UserRole.Yer || currentUser?.role === UserRole.AdminYee;

  const filteredInventory = inventory.filter(item => {
    const matchesType = filterType === 'All' || item.type === filterType;
    const matchesSearch = item.item_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // RBAC: Admins only see their warehouse inventory if assigned
    const matchesWarehouse = currentUser?.role === UserRole.AdminYee 
      ? item.warehouse_id === currentUser.assigned_warehouse_id
      : true; // Yer sees all

    return matchesType && matchesSearch && matchesWarehouse;
  });

  const openAddModal = () => {
    setFormData({
        item_name: '',
        quantity: 0,
        unit: '',
        type: InventoryType.RawMaterial,
        warehouse_id: warehouses[0]?.id
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setFormData({ ...item });
    setIsEditModalOpen(true);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.item_name) return;
    
    addInventoryItem({
      id: `i${Date.now()}`,
      warehouse_id: formData.warehouse_id!,
      item_name: formData.item_name!,
      quantity: Number(formData.quantity),
      unit: formData.unit!,
      type: formData.type!,
      last_updated: new Date().toISOString().split('T')[0]
    });
    setIsAddModalOpen(false);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
        updateInventoryItem({
            ...formData as InventoryItem,
            quantity: Number(formData.quantity),
            last_updated: new Date().toISOString().split('T')[0]
        });
        setIsEditModalOpen(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Inventory</h2>
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search items..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {canModify && (
            <button 
                onClick={openAddModal}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors"
            >
                <Plus size={18} className="md:mr-2" />
                <span className="hidden md:inline">Add Item</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {['All', ...Object.values(InventoryType)].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filterType === type 
                ? 'bg-slate-800 text-white' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Item Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Quantity</th>
                <th className="px-6 py-4">Warehouse</th>
                <th className="px-6 py-4">Last Updated</th>
                {canModify && <th className="px-6 py-4 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredInventory.length > 0 ? (
                filteredInventory.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.item_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.type === InventoryType.Waste ? 'bg-red-100 text-red-800' : 
                        item.type === InventoryType.FinishedGood ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 font-bold">{item.quantity} <span className="text-slate-400 font-normal text-xs ml-1">{item.unit}</span></td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {warehouses.find(w => w.id === item.warehouse_id)?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{item.last_updated}</td>
                    {canModify && (
                        <td className="px-6 py-4 text-right">
                            <button 
                                onClick={() => openEditModal(item)}
                                className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                title="Modify Item"
                            >
                                <Pencil size={16} />
                            </button>
                        </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No inventory items found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal Form (Shared Logic) */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800">
                    {isAddModalOpen ? 'Add Inventory Item' : 'Modify Item'}
                </h3>
                <button 
                    onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} 
                    className="text-slate-400 hover:text-slate-600"
                >
                    <X size={20} />
                </button>
            </div>
            <form onSubmit={isAddModalOpen ? handleAdd : handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
                  <input 
                    type="text" required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                    value={formData.item_name}
                    onChange={e => setFormData({...formData, item_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as InventoryType})}
                  >
                    {Object.values(InventoryType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Warehouse</label>
                  <select 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none disabled:bg-slate-100"
                    value={formData.warehouse_id}
                    onChange={e => setFormData({...formData, warehouse_id: e.target.value})}
                    disabled={!isAddModalOpen && currentUser?.role !== UserRole.Yer} // Lock warehouse on edit if not Yer
                  >
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                  <input 
                    type="number" required min="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                    value={formData.quantity}
                    onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                  <input 
                    type="text" required placeholder="kg, pcs, boxes"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                    value={formData.unit}
                    onChange={e => setFormData({...formData, unit: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {isAddModalOpen ? 'Add Stock' : 'Update Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryView;
