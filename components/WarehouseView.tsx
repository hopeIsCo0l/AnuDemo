
import React, { useState } from 'react';
import { useData } from '../App';
import { UserRole, WarehouseStatus, Warehouse } from '../types';
import { MapPin, Users, Plus, Settings, X, Save } from 'lucide-react';

const WarehouseView: React.FC = () => {
  const { warehouses, currentUser, addWarehouse, updateWarehouse } = useData();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [manageWarehouse, setManageWarehouse] = useState<Warehouse | null>(null);
  const [newWarehouse, setNewWarehouse] = useState({ name: '', location: '' });

  // Access Control
  const canCreate = currentUser?.role === UserRole.Yer;
  const canManage = currentUser?.role === UserRole.Yer; // Only Yer manages warehouses in V1

  // Filter warehouses based on role
  const visibleWarehouses = currentUser?.role === UserRole.Yee || currentUser?.role === UserRole.AdminYee
    ? warehouses.filter(w => w.id === currentUser.assigned_warehouse_id)
    : warehouses;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addWarehouse({
      id: `w${Date.now()}`,
      name: newWarehouse.name,
      location: newWarehouse.location,
      status: WarehouseStatus.Active,
      worker_count: 0
    });
    setNewWarehouse({ name: '', location: '' });
    setIsCreateModalOpen(false);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (manageWarehouse) {
      updateWarehouse(manageWarehouse);
      setManageWarehouse(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Warehouses</h2>
        {canCreate && (
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors"
          >
            <Plus size={18} />
            <span>Add Warehouse</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleWarehouses.map(warehouse => (
          <div key={warehouse.id} className={`bg-white rounded-xl border ${warehouse.status === WarehouseStatus.Disabled ? 'border-slate-200 opacity-75 bg-slate-50' : 'border-slate-200 shadow-sm hover:shadow-md'} transition-all overflow-hidden`}>
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{warehouse.name}</h3>
                  <div className="flex items-center text-slate-500 text-sm mt-1">
                    <MapPin size={14} className="mr-1" />
                    {warehouse.location}
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  warehouse.status === WarehouseStatus.Active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                }`}>
                  {warehouse.status}
                </span>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center text-slate-600 text-sm">
                  <Users size={16} className="mr-2 text-slate-400" />
                  <span>{warehouse.worker_count} Workers</span>
                </div>
                {canManage && (
                  <button 
                    onClick={() => setManageWarehouse(warehouse)}
                    className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    <Settings size={14} />
                    <span>Manage</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-bold text-slate-800">Create New Warehouse</h3>
               <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newWarehouse.name}
                  onChange={e => setNewWarehouse({...newWarehouse, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newWarehouse.location}
                  onChange={e => setNewWarehouse({...newWarehouse, location: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Modal */}
      {manageWarehouse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">Manage Warehouse</h3>
                <button onClick={() => setManageWarehouse(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
             </div>
             <form onSubmit={handleUpdate} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Warehouse Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={manageWarehouse.name}
                    onChange={e => setManageWarehouse({...manageWarehouse, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={manageWarehouse.location}
                    onChange={e => setManageWarehouse({...manageWarehouse, location: e.target.value})}
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                   <select 
                     className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                     value={manageWarehouse.status}
                     onChange={e => setManageWarehouse({...manageWarehouse, status: e.target.value as WarehouseStatus})}
                   >
                      <option value={WarehouseStatus.Active}>Active</option>
                      <option value={WarehouseStatus.Disabled}>Disabled (Read Only)</option>
                   </select>
                   <p className="text-xs text-slate-500 mt-1">Disabling a warehouse prevents new inventory and check-ins.</p>
                </div>
                
                {/* Simulated Staff Assignment Section */}
                <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-semibold text-slate-800 mb-2">Staffing</h4>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-600">Current Workers:</span>
                            <span className="font-bold text-slate-800">{manageWarehouse.worker_count}</span>
                        </div>
                        <p className="text-xs text-slate-400 italic">To re-assign workers, please use the Users module (Coming in V2).</p>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setManageWarehouse(null)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Save size={16} className="mr-2" />
                    Save Changes
                  </button>
                </div>
             </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseView;
