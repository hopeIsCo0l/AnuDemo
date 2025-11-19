import React from 'react';
import { useData } from '../App';
import { UserRole } from '../types';
import { Shield, User, Users } from 'lucide-react';

const LoginView: React.FC = () => {
  const { login } = useData();

  const RoleButton = ({ role, label, icon: Icon, desc }: { role: UserRole, label: string, icon: any, desc: string }) => (
    <button
      onClick={() => login(role)}
      className="group relative flex flex-col items-center p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 hover:ring-2 hover:ring-blue-100 transition-all duration-200 w-full text-left"
    >
      <div className="h-12 w-12 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center mb-4 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
        <Icon size={24} />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-1">{label}</h3>
      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded mb-2">{role}</span>
      <p className="text-sm text-slate-500 text-center">{desc}</p>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Welcome to AnuInv Sys</h1>
          <p className="text-lg text-slate-500">Developer Edition V1.0 • Please select a role to simulate login</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <RoleButton 
            role={UserRole.Yer} 
            label="Owner / Manager" 
            icon={Shield}
            desc="Full access to all modules, settings, and logs."
          />
          <RoleButton 
            role={UserRole.AdminYee} 
            label="Warehouse Admin" 
            icon={User}
            desc="Manage specific warehouse inventory and team."
          />
          <RoleButton 
            role={UserRole.Yee} 
            label="Factory Worker" 
            icon={Users}
            desc="View assigned tasks, attendance, and payroll."
          />
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
            <span className="mr-2">ℹ️</span>
            <span>Authentication is simulated for this demo. No password required.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
