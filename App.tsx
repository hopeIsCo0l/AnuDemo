
import React, { useState, createContext, useContext } from 'react';
import { 
  LayoutDashboard, 
  Warehouse as WarehouseIcon, 
  Package, 
  ClipboardCheck, 
  Users, 
  DollarSign, 
  LogOut,
  Menu,
  Bell,
  UserCog
} from 'lucide-react';
import { 
  UserRole, 
  AppContextType, 
  Warehouse, 
  InventoryItem, 
  User,
  Shift,
  Notification,
  OrderStatus,
  Customer,
  InvoiceStatus,
  PayrollEstimate
} from './types';
import { 
  MOCK_USERS, 
  MOCK_WAREHOUSES, 
  MOCK_INVENTORY, 
  MOCK_ATTENDANCE, 
  MOCK_CUSTOMERS, 
  MOCK_ORDERS,
  MOCK_INVOICES
} from './constants';

// Sub-components
import LoginView from './components/LoginView';
import Dashboard from './components/Dashboard';
import WarehouseView from './components/WarehouseView';
import InventoryView from './components/InventoryView';
import AttendanceView from './components/AttendanceView';
import CRMView from './components/CRMView';
import ProfileView from './components/ProfileView';
import PayrollView from './components/PayrollView';
import UsersView from './components/UsersView';

const DataContext = createContext<AppContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS); // Made stateful
  const [warehouses, setWarehouses] = useState(MOCK_WAREHOUSES);
  const [inventory, setInventory] = useState(MOCK_INVENTORY);
  const [attendance, setAttendance] = useState(MOCK_ATTENDANCE);
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS);
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [invoices, setInvoices] = useState(MOCK_INVOICES);
  const [payrollEstimates, setPayrollEstimates] = useState<PayrollEstimate[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const addNotification = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      message: msg,
      type,
      timestamp: new Date().toLocaleTimeString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const login = (role: UserRole) => {
    const user = users.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
      setActiveTab('dashboard');
      addNotification(`Welcome back, ${user.full_name}`, 'info');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setNotifications([]);
  };

  const navigate = (page: string) => {
    setActiveTab(page);
  };

  const addWarehouse = (w: Warehouse) => {
    setWarehouses([...warehouses, w]);
    addNotification(`Warehouse "${w.name}" created`, 'success');
  };

  const updateWarehouse = (updated: Warehouse) => {
    setWarehouses(warehouses.map(w => w.id === updated.id ? updated : w));
    addNotification(`Warehouse "${updated.name}" updated`, 'success');
  };

  const addInventoryItem = (i: InventoryItem) => {
    setInventory([...inventory, i]);
    addNotification(`Item "${i.item_name}" added to inventory`, 'success');
  };

  const updateInventoryItem = (updated: InventoryItem) => {
    setInventory(inventory.map(i => i.id === updated.id ? updated : i));
    addNotification(`Item "${updated.item_name}" updated`, 'success');
  };

  const addCustomer = (c: Customer) => {
    setCustomers([...customers, c]);
    addNotification(`Customer "${c.name}" added`, 'success');
  };

  const checkIn = (userId: string, warehouseId: string, shift: Shift) => {
    const newRecord = {
      id: `a${Date.now()}`,
      user_id: userId,
      user_name: currentUser?.full_name || 'Unknown',
      warehouse_id: warehouseId,
      date: new Date().toISOString().split('T')[0],
      check_in: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Present' as const,
      shift
    };
    setAttendance([newRecord, ...attendance]);
    addNotification(`Checked in for ${shift} shift`, 'success');
  };

  const checkOut = (recordId: string) => {
    setAttendance(attendance.map(a => 
      a.id === recordId 
        ? { ...a, check_out: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } 
        : a
    ));
    addNotification('Checked out successfully', 'info');
  };

  const fulfillOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    if (order.status === OrderStatus.Completed) {
        addNotification('Order is already completed', 'error');
        return;
    }

    // Check stock for all items in order
    const missingItems: string[] = [];
    const newInventory = [...inventory];

    for (const item of order.items) {
        const invItemIndex = newInventory.findIndex(i => i.id === item.inventory_item_id && i.warehouse_id === order.warehouse_id);
        
        if (invItemIndex === -1) {
            missingItems.push(`Item ID ${item.inventory_item_id} not found`);
            continue;
        }

        if (newInventory[invItemIndex].quantity < item.quantity) {
             missingItems.push(`${newInventory[invItemIndex].item_name} (Insufficient Stock)`);
        }
    }

    if (missingItems.length > 0) {
        addNotification(`Cannot fulfill: ${missingItems.join(', ')}`, 'error');
        return;
    }

    // Deduct Stock
    order.items.forEach(item => {
        const invItemIndex = newInventory.findIndex(i => i.id === item.inventory_item_id);
        if (invItemIndex !== -1) {
            newInventory[invItemIndex] = {
                ...newInventory[invItemIndex],
                quantity: newInventory[invItemIndex].quantity - item.quantity,
                last_updated: new Date().toISOString().split('T')[0]
            };
        }
    });

    setInventory(newInventory);
    
    // Update Order Status
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: OrderStatus.Completed } : o));
    addNotification(`Order #${orderId} fulfilled. Stock deducted.`, 'success');
  };

  const generateInvoice = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Check if invoice already exists
    if (invoices.some(inv => inv.order_id === orderId)) {
        addNotification('Invoice already exists for this order', 'error');
        return;
    }

    const newInvoice = {
        id: `inv${Date.now()}`,
        order_id: order.id,
        customer_id: order.customer_id,
        total_amount: order.total_amount,
        paid_amount: 0,
        status: InvoiceStatus.Pending,
        created_at: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // +30 days
    };

    setInvoices([...invoices, newInvoice]);
    addNotification(`Invoice generated for Order #${order.id}`, 'success');
  };

  const recordPayment = (invoiceId: string, amount: number, method: 'Cash' | 'Bank Transfer' | 'Check') => {
      const invoice = invoices.find(i => i.id === invoiceId);
      if (!invoice) return;

      const newPaidAmount = invoice.paid_amount + amount;
      let newStatus = invoice.status;

      if (newPaidAmount >= invoice.total_amount) {
          newStatus = InvoiceStatus.Paid;
      } else if (newPaidAmount > 0) {
          newStatus = InvoiceStatus.PartiallyPaid;
      }

      setInvoices(invoices.map(i => i.id === invoiceId ? { ...i, paid_amount: newPaidAmount, status: newStatus } : i));
      addNotification(`Payment of ${amount.toLocaleString()} ETB recorded via ${method}`, 'success');
  };

  const createPayrollEstimate = (estimate: PayrollEstimate) => {
    setPayrollEstimates([estimate, ...payrollEstimates]);
    addNotification(`Payroll estimated for user ${estimate.user_id}`, 'success');
  };

  const addUser = (user: User) => {
    setUsers([...users, user]);
    addNotification(`User "${user.full_name}" added`, 'success');
  };

  const updateUser = (updatedUser: User) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    addNotification(`User "${updatedUser.full_name}" updated`, 'success');
  };

  const deleteUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
    addNotification('User deleted', 'info');
  };

  const value = {
    currentUser,
    users,
    warehouses,
    inventory,
    attendance,
    customers,
    orders,
    invoices,
    payrollEstimates,
    notifications,
    login,
    logout,
    navigate,
    addWarehouse,
    updateWarehouse,
    addInventoryItem,
    updateInventoryItem,
    checkIn,
    checkOut,
    fulfillOrder,
    addCustomer,
    generateInvoice,
    recordPayment,
    createPayrollEstimate,
    addUser,
    updateUser,
    deleteUser
  };

  if (!currentUser) {
    return (
      <DataContext.Provider value={value}>
        <LoginView />
      </DataContext.Provider>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'warehouses': return <WarehouseView />;
      case 'inventory': return <InventoryView />;
      case 'attendance': return <AttendanceView />;
      case 'crm': return <CRMView />;
      case 'payroll': return <PayrollView />;
      case 'users': return <UsersView />;
      case 'profile': return <ProfileView />;
      default: return <Dashboard />;
    }
  };

  // Sidebar Item Helper
  const NavItem = ({ id, label, icon: Icon, roles }: { id: string, label: string, icon: any, roles: UserRole[] }) => {
    if (!roles.includes(currentUser.role)) return null;
    
    const isActive = activeTab === id;
    return (
      <button
        onClick={() => {
          setActiveTab(id);
          setIsMobileMenuOpen(false);
        }}
        className={`w-full flex items-center space-x-3 px-4 py-3 mb-1 rounded-lg transition-colors ${
          isActive 
            ? 'bg-blue-600 text-white shadow-md' 
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
      >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
      </button>
    );
  };

  return (
    <DataContext.Provider value={value}>
      <div className="flex h-screen bg-slate-100 overflow-hidden">
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-20 bg-black/50 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-6 border-b border-slate-800">
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              AnuInv Sys
            </h1>
            <p className="text-xs text-slate-400 mt-1">Factory Management v2.0</p>
          </div>

          <div className="p-4 overflow-y-auto h-[calc(100vh-160px)]">
            <div className="mb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Menu
            </div>
            <nav>
              <NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} roles={[UserRole.Yer, UserRole.AdminYee, UserRole.Yee]} />
              <NavItem id="warehouses" label="Warehouses" icon={WarehouseIcon} roles={[UserRole.Yer, UserRole.AdminYee, UserRole.Yee]} />
              <NavItem id="inventory" label="Inventory" icon={Package} roles={[UserRole.Yer, UserRole.AdminYee]} />
              <NavItem id="attendance" label="Attendance" icon={ClipboardCheck} roles={[UserRole.Yer, UserRole.AdminYee, UserRole.Yee]} />
              <NavItem id="crm" label="CRM & Invoices" icon={Users} roles={[UserRole.Yer, UserRole.AdminYee]} />
              <NavItem id="payroll" label="Payroll" icon={DollarSign} roles={[UserRole.Yer, UserRole.AdminYee]} />
              <NavItem id="users" label="Users" icon={UserCog} roles={[UserRole.Yer]} />
            </nav>
          </div>

          <div className="absolute bottom-0 w-full p-4 border-t border-slate-800 bg-slate-900">
            <div className="flex items-center justify-between">
              <div className="flex flex-col cursor-pointer" onClick={() => setActiveTab('profile')}>
                <span className="text-sm font-medium text-white hover:text-blue-300 transition-colors">{currentUser.full_name}</span>
                <span className="text-xs text-blue-400">{currentUser.role} | {currentUser.y_number}</span>
              </div>
              <button onClick={logout} className="p-2 text-slate-400 hover:text-red-400 transition-colors" title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-full overflow-hidden">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8">
             <div className="flex items-center">
                <button 
                  className="mr-4 text-slate-500 hover:text-slate-700 lg:hidden"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <Menu size={24} />
                </button>
                <h2 className="text-xl font-semibold text-slate-800 capitalize">
                  {activeTab.replace('-', ' ')}
                </h2>
             </div>
             <div className="flex items-center space-x-6">
               {/* Notifications */}
               <div className="relative">
                 <Bell size={20} className="text-slate-500" />
                 {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                 )}
               </div>

               <button 
                 onClick={() => setActiveTab('profile')}
                 className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm border border-blue-200 hover:ring-2 hover:ring-blue-400 transition-all"
               >
                  {currentUser.full_name.charAt(0)}
               </button>
             </div>
          </header>

          <div className="flex-1 overflow-auto p-6 lg:p-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </DataContext.Provider>
  );
};

export default App;
