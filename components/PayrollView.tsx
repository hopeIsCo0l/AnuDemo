
import React, { useState } from 'react';
import { useData } from '../App';
import { UserRole, PayrollEstimate } from '../types';
import { DollarSign, Calendar, Clock, Plus, X } from 'lucide-react';

const PayrollView: React.FC = () => {
  const { users, payrollEstimates, createPayrollEstimate, currentUser, warehouses } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [selectedUserId, setSelectedUserId] = useState('');
  const [hoursWorked, setHoursWorked] = useState<number>(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filter eligible workers (Yees and AdminYees)
  const eligibleWorkers = users.filter(u => {
      // Yer sees all Yees and AdminYees
      if (currentUser?.role === UserRole.Yer) {
          return u.role === UserRole.Yee || u.role === UserRole.AdminYee;
      }
      // AdminYee sees Yees in their warehouse
      if (currentUser?.role === UserRole.AdminYee) {
          return u.role === UserRole.Yee && u.assigned_warehouse_id === currentUser.assigned_warehouse_id;
      }
      return false;
  });

  // Filter displayed estimates
  const visibleEstimates = payrollEstimates.filter(est => {
      if (currentUser?.role === UserRole.Yer) return true;
      if (currentUser?.role === UserRole.AdminYee) return est.warehouse_id === currentUser.assigned_warehouse_id;
      return false;
  });

  const handleCalculate = (e: React.FormEvent) => {
      e.preventDefault();
      const worker = users.find(u => u.id === selectedUserId);
      if (!worker) return;

      const rate = worker.hourly_rate || 0;
      const gross = hoursWorked * rate;

      const newEstimate: PayrollEstimate = {
          id: `pay${Date.now()}`,
          user_id: worker.id,
          warehouse_id: worker.assigned_warehouse_id || 'w1', // Fallback for safety
          start_date: startDate,
          end_date: endDate,
          hours_worked: hoursWorked,
          hourly_rate: rate,
          gross_pay: gross,
          generated_at: new Date().toISOString().split('T')[0],
          generated_by: currentUser?.full_name || 'Unknown'
      };

      createPayrollEstimate(newEstimate);
      setIsModalOpen(false);
      // Reset form
      setSelectedUserId('');
      setHoursWorked(0);
      setStartDate('');
      setEndDate('');
  };

  const getWorkerName = (id: string) => users.find(u => u.id === id)?.full_name || 'Unknown';
  const getWarehouseName = (id: string) => warehouses.find(w => w.id === id)?.name || 'Unknown';

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Payroll Estimations</h2>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
        >
            <Plus size={18} className="mr-2" /> New Estimate
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
              <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                      <th className="px-6 py-4">Generated Date</th>
                      <th className="px-6 py-4">Worker</th>
                      <th className="px-6 py-4">Warehouse</th>
                      <th className="px-6 py-4">Period</th>
                      <th className="px-6 py-4 text-right">Hours</th>
                      <th className="px-6 py-4 text-right">Rate</th>
                      <th className="px-6 py-4 text-right">Est. Gross Pay</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                  {visibleEstimates.map(est => (
                      <tr key={est.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 text-sm text-slate-500">{est.generated_at}</td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-800">{getWorkerName(est.user_id)}</td>
                          <td className="px-6 py-4 text-sm text-slate-500">{getWarehouseName(est.warehouse_id)}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                              {est.start_date} <span className="text-slate-400 mx-1">to</span> {est.end_date}
                          </td>
                          <td className="px-6 py-4 text-sm text-right font-mono">{est.hours_worked}</td>
                          <td className="px-6 py-4 text-sm text-right font-mono">{est.hourly_rate} ETB</td>
                          <td className="px-6 py-4 text-sm text-right font-bold text-green-700">
                              {est.gross_pay.toLocaleString()} ETB
                          </td>
                      </tr>
                  ))}
                  {visibleEstimates.length === 0 && (
                      <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400">No payroll estimates generated yet.</td></tr>
                  )}
              </tbody>
          </table>
      </div>

      {/* Estimate Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
             <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-bold text-slate-800">Calculate Payroll</h3>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
             </div>
             <form onSubmit={handleCalculate} className="space-y-4">
                 <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Select Employee</label>
                     <select 
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedUserId}
                        onChange={e => setSelectedUserId(e.target.value)}
                     >
                         <option value="">-- Choose Worker --</option>
                         {eligibleWorkers.map(u => (
                             <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>
                         ))}
                     </select>
                     {selectedUserId && (
                         <p className="text-xs text-slate-500 mt-1">
                             Hourly Rate: <span className="font-semibold">{users.find(u => u.id === selectedUserId)?.hourly_rate} ETB</span>
                         </p>
                     )}
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                         <div className="relative">
                            <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"/>
                            <input 
                                type="date" required
                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg outline-none"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                            />
                         </div>
                     </div>
                     <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                         <div className="relative">
                            <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"/>
                            <input 
                                type="date" required
                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg outline-none"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                            />
                         </div>
                     </div>
                 </div>

                 <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Total Hours Worked</label>
                     <div className="relative">
                        <Clock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"/>
                        <input 
                            type="number" min="0" required
                            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            value={hoursWorked}
                            onChange={e => setHoursWorked(parseFloat(e.target.value))}
                        />
                     </div>
                 </div>

                 <div className="pt-4 border-t border-slate-100">
                     <div className="flex justify-between items-center mb-4">
                         <span className="text-sm text-slate-600">Estimated Gross Pay:</span>
                         <span className="text-xl font-bold text-green-700">
                             {(hoursWorked * (users.find(u => u.id === selectedUserId)?.hourly_rate || 0)).toLocaleString()} ETB
                         </span>
                     </div>
                     <button 
                        type="submit"
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex justify-center items-center"
                     >
                         <DollarSign size={18} className="mr-2" /> Generate Estimate
                     </button>
                 </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollView;
