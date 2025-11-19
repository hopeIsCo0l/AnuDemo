
import React, { useState } from 'react';
import { useData } from '../App';
import { UserRole, User } from '../types';
import { Plus, Pencil, Trash2, X, Save, User as UserIcon } from 'lucide-react';

const UsersView: React.FC = () => {
  const { users, warehouses, addUser, updateUser, deleteUser } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User>>({});
  const [isEditMode, setIsEditMode] = useState(false);

  const openAddModal = () => {
    const nextYNumber = `Y${(users.length + 1).toString().padStart(5, '0')}`;
    setEditingUser({
      y_number: nextYNumber,
      full_name: '',
      email: '',
      role: UserRole.Yee,
      assigned_warehouse_id: '',
      hourly_rate: 0
    });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser({ ...user });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode && editingUser.id) {
      updateUser(editingUser as User);
    } else {
      addUser({
        ...editingUser,
        id: `u${Date.now()}`,
        y_number: editingUser.y_number || `Y${Date.now().toString().substr(-5)}` // Fallback
      } as User);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(userId);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
        <button 
          onClick={openAddModal}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
        >
          <Plus size={18} className="mr-2" /> Add User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
              <th className="px-6 py-4">Y-Number</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Warehouse</th>
              <th className="px-6 py-4">Pay Rate (ETB)</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-mono text-slate-500">{user.y_number}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold mr-3">
                      {user.full_name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">{user.full_name}</div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === UserRole.Yer ? 'bg-purple-100 text-purple-800' :
                    user.role === UserRole.AdminYee ? 'bg-indigo-100 text-indigo-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                   {warehouses.find(w => w.id === user.assigned_warehouse_id)?.name || '-'}
                </td>
                <td className="px-6 py-4 text-sm font-mono text-slate-600">
                   {user.hourly_rate ? `${user.hourly_rate}/hr` : '-'}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button 
                    onClick={() => openEditModal(user)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  {user.role !== UserRole.Yer && (
                    <button 
                      onClick={() => handleDelete(user.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">{isEditMode ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text" required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={editingUser.full_name}
                  onChange={e => setEditingUser({...editingUser, full_name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                   <select 
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                      value={editingUser.role}
                      onChange={e => setEditingUser({...editingUser, role: e.target.value as UserRole})}
                      disabled={editingUser.role === UserRole.Yer} // Cannot demote Owner here
                   >
                      <option value={UserRole.Yee}>Worker (Yee)</option>
                      <option value={UserRole.AdminYee}>Admin (AdminYee)</option>
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Hourly Rate (ETB)</label>
                   <input 
                      type="number" min="0"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                      value={editingUser.hourly_rate}
                      onChange={e => setEditingUser({...editingUser, hourly_rate: Number(e.target.value)})}
                   />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input 
                  type="email" required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={editingUser.email}
                  onChange={e => setEditingUser({...editingUser, email: e.target.value})}
                />
              </div>

              {editingUser.role !== UserRole.Yer && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Warehouse</label>
                  <select 
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                      value={editingUser.assigned_warehouse_id || ''}
                      onChange={e => setEditingUser({...editingUser, assigned_warehouse_id: e.target.value})}
                  >
                      <option value="">-- Unassigned --</option>
                      {warehouses.map(w => (
                        <option key={w.id} value={w.id}>{w.name} ({w.location})</option>
                      ))}
                  </select>
                </div>
              )}

              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Save size={18} className="mr-2" />
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersView;
