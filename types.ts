
// Enums based on Documentation
export enum UserRole {
  Yer = 'Yer',           // Owner
  AdminYee = 'AdminYee', // Warehouse Manager
  Yee = 'Yee'            // Worker
}

export enum WarehouseStatus {
  Active = 'Active',
  Disabled = 'Disabled'
}

export enum InventoryType {
  RawMaterial = 'Raw Material',
  WIP = 'Work-in-Progress',
  FinishedGood = 'Finished Good',
  Waste = 'Waste/Scrap'
}

export enum CustomerType {
  Company = 'Company',
  Individual = 'Individual'
}

export enum OrderStatus {
  Pending = 'Pending',
  Processing = 'Processing',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export enum InvoiceStatus {
  Pending = 'Pending',
  PartiallyPaid = 'Partially Paid',
  Paid = 'Paid',
  Overdue = 'Overdue'
}

export enum Shift {
  Morning = 'Morning',
  Afternoon = 'Afternoon',
  Night = 'Night'
}

// Entities
export interface User {
  id: string;
  y_number: string;
  full_name: string;
  email: string;
  role: UserRole;
  assigned_warehouse_id?: string; // For Yee/AdminYee
  hourly_rate?: number; // Added in V2 for Payroll
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  status: WarehouseStatus;
  worker_count: number;
}

export interface InventoryItem {
  id: string;
  warehouse_id: string;
  item_name: string;
  quantity: number;
  unit: string;
  type: InventoryType;
  last_updated: string;
}

export interface AttendanceRecord {
  id: string;
  user_id: string;
  user_name: string; // Denormalized for display
  warehouse_id: string;
  check_in: string;
  check_out?: string;
  date: string;
  status: 'Present' | 'Absent' | 'Leave';
  shift?: Shift; // Added in v1.2
}

export interface Customer {
  id: string;
  name: string;
  type: CustomerType;
  contact_person: string;
  email: string;
  phone: string;
}

export interface OrderItem {
  inventory_item_id: string;
  quantity: number;
}

export interface Order {
  id: string;
  customer_id: string;
  warehouse_id: string;
  total_amount: number;
  status: OrderStatus;
  date: string;
  items: OrderItem[]; // Added in v1.2
}

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  date: string;
  method: 'Cash' | 'Bank Transfer' | 'Check';
}

export interface Invoice {
  id: string;
  order_id: string;
  customer_id: string;
  total_amount: number;
  paid_amount: number;
  status: InvoiceStatus;
  due_date: string;
  created_at: string;
}

export interface PayrollEstimate {
  id: string;
  user_id: string;
  warehouse_id: string;
  start_date: string;
  end_date: string;
  hours_worked: number;
  hourly_rate: number;
  gross_pay: number;
  generated_at: string;
  generated_by: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
  timestamp: string;
}

// App State Interface
export interface AppState {
  currentUser: User | null;
  users: User[];
  warehouses: Warehouse[];
  inventory: InventoryItem[];
  attendance: AttendanceRecord[];
  customers: Customer[];
  orders: Order[];
  invoices: Invoice[];
  payrollEstimates: PayrollEstimate[];
  notifications: Notification[];
}

export interface AppContextType extends AppState {
  login: (role: UserRole) => void;
  logout: () => void;
  navigate: (page: string) => void;
  addWarehouse: (w: Warehouse) => void;
  updateWarehouse: (w: Warehouse) => void;
  addInventoryItem: (i: InventoryItem) => void;
  updateInventoryItem: (i: InventoryItem) => void;
  checkIn: (userId: string, warehouseId: string, shift: Shift) => void;
  checkOut: (recordId: string) => void;
  fulfillOrder: (orderId: string) => void;
  addCustomer: (c: Customer) => void;
  generateInvoice: (orderId: string) => void;
  recordPayment: (invoiceId: string, amount: number, method: 'Cash' | 'Bank Transfer' | 'Check') => void;
  createPayrollEstimate: (estimate: PayrollEstimate) => void;
  // User Management
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
}
