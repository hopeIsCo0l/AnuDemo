
import React from 'react';
import { useData } from '../App';
import { UserRole, InventoryType, InvoiceStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Package, Users, TrendingUp, AlertTriangle, Bell, DollarSign, FileText } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { currentUser, inventory, warehouses, attendance, notifications, invoices } = useData();

  // Stats Calculation
  const totalInventoryCount = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = inventory.filter(i => i.quantity < 50 && i.type !== InventoryType.Waste).length;
  const presentWorkers = attendance.filter(a => a.date === new Date().toISOString().split('T')[0] && a.status === 'Present').length;
  
  // Financial Stats
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.paid_amount, 0);
  const pendingPayments = invoices.reduce((sum, inv) => sum + (inv.total_amount - inv.paid_amount), 0);

  // Data for Charts
  const inventoryByType = [
    { name: 'Raw', value: inventory.filter(i => i.type === InventoryType.RawMaterial).length },
    { name: 'WIP', value: inventory.filter(i => i.type === InventoryType.WIP).length },
    { name: 'Finished', value: inventory.filter(i => i.type === InventoryType.FinishedGood).length },
    { name: 'Waste', value: inventory.filter(i => i.type === InventoryType.Waste).length },
  ];

  // Mock Revenue Trend Data for V2
  const revenueTrend = [
      { month: 'Jan', revenue: 12000 },
      { month: 'Feb', revenue: 19000 },
      { month: 'Mar', revenue: 15000 },
      { month: 'Apr', revenue: totalRevenue } // Current simulated
  ];

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#ef4444'];

  const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        {subtext && <p className="text-xs text-slate-400">{subtext}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 gap-4">
        <div>
            <h2 className="text-lg font-medium text-slate-700">
            Welcome back, <span className="font-bold text-slate-900">{currentUser?.full_name}</span>
            </h2>
            <p className="text-sm text-slate-500">Factory Overview • V2.0</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={`${totalRevenue.toLocaleString()} ETB`} icon={DollarSign} color="bg-green-600" subtext="Paid Invoices" />
        <StatCard title="Outstanding" value={`${pendingPayments.toLocaleString()} ETB`} icon={FileText} color="bg-orange-500" subtext="Pending Payments" />
        <StatCard title="Active Workers" value={presentWorkers} icon={Users} color="bg-indigo-500" subtext="Checked in today" />
        <StatCard title="Low Stock Alerts" value={lowStockItems} icon={AlertTriangle} color="bg-amber-500" subtext="Items < 50 units" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts Section - Only for Admins/Yer */}
          {currentUser?.role !== UserRole.Yee && (
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-base font-semibold text-slate-800 mb-4">Revenue Trend</h3>
                    <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revenueTrend}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" tick={{fontSize: 12}} />
                            <YAxis tick={{fontSize: 12}} />
                            <Tooltip />
                            <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-base font-semibold text-slate-800 mb-4">Inventory Distribution</h3>
                    <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        <Pie
                            data={inventoryByType}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {inventoryByType.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                    </div>
                </div>
            </div>
          )}

          {/* Recent Notifications Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
             <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-semibold text-slate-800 flex items-center">
                    <Bell size={16} className="mr-2 text-slate-500"/> Recent Activity
                </h3>
             </div>
             <div className="flex-1 overflow-y-auto p-0 max-h-[300px] lg:max-h-none">
                {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-sm">No recent notifications</div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {notifications.map(n => (
                            <div key={n.id} className="p-4 hover:bg-slate-50 transition-colors">
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-xs font-bold uppercase px-1.5 py-0.5 rounded ${
                                        n.type === 'success' ? 'bg-green-100 text-green-700' : 
                                        n.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                    }`}>{n.type}</span>
                                    <span className="text-xs text-slate-400">{n.timestamp}</span>
                                </div>
                                <p className="text-sm text-slate-600">{n.message}</p>
                            </div>
                        ))}
                    </div>
                )}
             </div>
          </div>
      </div>

      {/* Worker Specific View */}
      {currentUser?.role === UserRole.Yee && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-base font-semibold text-slate-800 mb-2">My Assigned Warehouse</h3>
          {currentUser.assigned_warehouse_id ? (
            <div className="p-4 bg-blue-50 rounded border border-blue-100 text-blue-800">
              You are assigned to: <strong>{warehouses.find(w => w.id === currentUser.assigned_warehouse_id)?.name}</strong>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 rounded border border-yellow-100 text-yellow-800">
              No warehouse assigned yet. Contact your manager.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
