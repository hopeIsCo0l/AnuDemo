
import React from 'react';
import { useData } from '../App';
import { UserRole, WarehouseStatus } from '../types';
import { User, Mail, Hash, Building, Shield, DollarSign } from 'lucide-react';

const ProfileView: React.FC = () => {
  const { currentUser, warehouses, payrollEstimates } = useData();

  if (!currentUser) return null;

  const assignedWarehouse = warehouses.find(w => w.id === currentUser.assigned_warehouse_id);
  
  // Get latest payroll estimates for this user
  const myEstimates = payrollEstimates.filter(p => p.user_id === currentUser.id).sort((a, b) => b.generated_at.localeCompare(a.generated_at));

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">My Profile</h2>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        <div className="px-8 pb-8">
          <div className="relative -mt-12 mb-6">
            <div className="h-24 w-24 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-500 shadow-md">
              {currentUser.full_name.charAt(0)}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-bold text-slate-900">{currentUser.full_name}</h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium mt-2 ${
               currentUser.role === UserRole.Yer ? 'bg-purple-100 text-purple-800' : 
               currentUser.role === UserRole.AdminYee ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
            }`}>
              {currentUser.role}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-6">
             <div className="flex items-start space-x-3">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
                   <Mail size={20} />
                </div>
                <div>
                   <p className="text-sm text-slate-500 font-medium">Email Address</p>
                   <p className="text-slate-800">{currentUser.email}</p>
                </div>
             </div>

             <div className="flex items-start space-x-3">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
                   <Hash size={20} />
                </div>
                <div>
                   <p className="text-sm text-slate-500 font-medium">Y-Number</p>
                   <p className="text-slate-800">{currentUser.y_number}</p>
                </div>
             </div>

             <div className="flex items-start space-x-3">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
                   <Building size={20} />
                </div>
                <div>
                   <p className="text-sm text-slate-500 font-medium">Assigned Warehouse</p>
                   <p className="text-slate-800">
                     {assignedWarehouse ? assignedWarehouse.name : 
                      currentUser.role === UserRole.Yer ? 'All Access' : 'Not Assigned'}
                   </p>
                   {assignedWarehouse && (
                     <span className={`text-xs px-2 py-0.5 rounded ${assignedWarehouse.status === WarehouseStatus.Active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                       {assignedWarehouse.status}
                     </span>
                   )}
                </div>
             </div>

             <div className="flex items-start space-x-3">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
                   <Shield size={20} />
                </div>
                <div>
                   <p className="text-sm text-slate-500 font-medium">System Permissions</p>
                   <p className="text-slate-800">
                     {currentUser.role === UserRole.Yer ? 'Full Control' : 
                      currentUser.role === UserRole.AdminYee ? 'Warehouse Management' : 'Read & Attend'}
                   </p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Payroll History Section (Visible to all roles if they have estimates) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-800 flex items-center">
                  <DollarSign size={18} className="mr-2 text-slate-500"/> Payroll Estimates
              </h3>
              {currentUser.hourly_rate && currentUser.hourly_rate > 0 && (
                  <span className="text-xs font-medium text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded">
                      Rate: {currentUser.hourly_rate} ETB/hr
                  </span>
              )}
          </div>
          {myEstimates.length > 0 ? (
              <div className="divide-y divide-slate-100">
                  {myEstimates.map(pay => (
                      <div key={pay.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                          <div>
                              <p className="text-sm font-medium text-slate-800">{pay.start_date} - {pay.end_date}</p>
                              <p className="text-xs text-slate-500">Generated on {pay.generated_at}</p>
                          </div>
                          <div className="text-right">
                              <p className="text-sm font-bold text-green-600">{pay.gross_pay.toLocaleString()} ETB</p>
                              <p className="text-xs text-slate-400">{pay.hours_worked} hrs worked</p>
                          </div>
                      </div>
                  ))}
              </div>
          ) : (
              <div className="p-8 text-center text-slate-400 text-sm">
                  No payroll estimates available.
              </div>
          )}
      </div>
    </div>
  );
};

export default ProfileView;
