import React, { useMemo, useState } from 'react';
import { useData } from '../App';
import { UserRole, Shift } from '../types';
import { Clock, CheckCircle } from 'lucide-react';

const AttendanceView: React.FC = () => {
  const { attendance, currentUser, checkIn, checkOut, warehouses } = useData();
  const [selectedShift, setSelectedShift] = useState<Shift>(Shift.Morning);

  if (!currentUser) return null;

  const today = new Date().toISOString().split('T')[0];
  
  // Find today's record for current user
  const myRecordToday = attendance.find(
    a => a.user_id === currentUser.id && a.date === today
  );

  const filteredAttendance = useMemo(() => {
    if (currentUser.role === UserRole.Yee) {
      return attendance.filter(a => a.user_id === currentUser.id);
    } else if (currentUser.role === UserRole.AdminYee) {
      return attendance.filter(a => a.warehouse_id === currentUser.assigned_warehouse_id);
    }
    return attendance;
  }, [attendance, currentUser]);

  const handleCheckIn = () => {
    if (currentUser.assigned_warehouse_id) {
        checkIn(currentUser.id, currentUser.assigned_warehouse_id, selectedShift);
    } else if (currentUser.role === UserRole.Yer) {
        // Yer checks into first active warehouse for demo
        checkIn(currentUser.id, warehouses[0].id, selectedShift);
    } else {
        alert("No warehouse assigned!");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Attendance v1.2</h2>

      {/* Action Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="mb-4 md:mb-0">
          <h3 className="text-lg font-semibold text-slate-800">Today's Status</h3>
          <p className="text-slate-500 text-sm">{new Date().toDateString()}</p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
          {myRecordToday ? (
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-end mr-2">
                 <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Current Shift</span>
                 <span className="text-sm font-semibold text-slate-800">{myRecordToday.shift}</span>
              </div>
              <div className="px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-100 flex items-center">
                <CheckCircle size={18} className="mr-2" />
                Checked In: {myRecordToday.check_in}
              </div>
              {!myRecordToday.check_out ? (
                <button 
                  onClick={() => checkOut(myRecordToday.id)}
                  className="px-6 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 font-medium"
                >
                  Check Out
                </button>
              ) : (
                 <div className="px-4 py-2 bg-slate-50 text-slate-600 rounded-lg border border-slate-200">
                    Checked Out: {myRecordToday.check_out}
                 </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-3">
               <select 
                 value={selectedShift} 
                 onChange={(e) => setSelectedShift(e.target.value as Shift)}
                 className="px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-700 font-medium"
               >
                 {Object.values(Shift).map(s => <option key={s} value={s}>{s} Shift</option>)}
               </select>
               <button 
                onClick={handleCheckIn}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-transform hover:scale-105"
              >
                <Clock size={20} className="mr-2" />
                <span>Check In</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* History Table */}
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Attendance History</h3>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
              <th className="px-6 py-4">Date</th>
              {currentUser.role !== UserRole.Yee && <th className="px-6 py-4">Worker</th>}
              <th className="px-6 py-4">Shift</th>
              <th className="px-6 py-4">Warehouse</th>
              <th className="px-6 py-4">In</th>
              <th className="px-6 py-4">Out</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredAttendance.map(record => (
              <tr key={record.id}>
                <td className="px-6 py-4 text-sm text-slate-900">{record.date}</td>
                {currentUser.role !== UserRole.Yee && (
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{record.user_name}</td>
                )}
                <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold uppercase">{record.shift || 'Day'}</span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                    {warehouses.find(w => w.id === record.warehouse_id)?.name}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{record.check_in}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{record.check_out || '-'}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {record.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceView;