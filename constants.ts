
import { User, UserRole, Warehouse, WarehouseStatus, InventoryItem, InventoryType, AttendanceRecord, Customer, CustomerType, Order, OrderStatus, Shift, Invoice, InvoiceStatus } from './types';

export const MOCK_USERS: User[] = [
  { id: 'u1', y_number: 'Y00001', full_name: 'Abdellah Teshome', email: 'owner@anuinv.com', role: UserRole.Yer, hourly_rate: 0 },
  { id: 'u2', y_number: 'Y00002', full_name: 'Warehouse Manager 1', email: 'admin1@anuinv.com', role: UserRole.AdminYee, assigned_warehouse_id: 'w1', hourly_rate: 150 },
  { id: 'u3', y_number: 'Y00003', full_name: 'John Worker', email: 'yee1@anuinv.com', role: UserRole.Yee, assigned_warehouse_id: 'w1', hourly_rate: 60 },
  { id: 'u4', y_number: 'Y00004', full_name: 'Jane Worker', email: 'yee2@anuinv.com', role: UserRole.Yee, assigned_warehouse_id: 'w2', hourly_rate: 60 },
];

export const MOCK_WAREHOUSES: Warehouse[] = [
  { id: 'w1', name: 'Addis Main Factory', location: 'Addis Ababa', status: WarehouseStatus.Active, worker_count: 12 },
  { id: 'w2', name: 'Adama Distribution', location: 'Adama', status: WarehouseStatus.Active, worker_count: 5 },
  { id: 'w3', name: 'Old Storage', location: 'Bole', status: WarehouseStatus.Disabled, worker_count: 0 },
];

export const MOCK_INVENTORY: InventoryItem[] = [
  { id: 'i1', warehouse_id: 'w1', item_name: 'Sugar', quantity: 500, unit: 'kg', type: InventoryType.RawMaterial, last_updated: '2023-10-26' },
  { id: 'i2', warehouse_id: 'w1', item_name: 'Glucose Syrup', quantity: 200, unit: 'liters', type: InventoryType.RawMaterial, last_updated: '2023-10-25' },
  { id: 'i3', warehouse_id: 'w1', item_name: 'Fruit Chews (Unwrapped)', quantity: 5000, unit: 'pcs', type: InventoryType.WIP, last_updated: '2023-10-27' },
  { id: 'i4', warehouse_id: 'w1', item_name: 'Fruit Chews (Packaged)', quantity: 120, unit: 'boxes', type: InventoryType.FinishedGood, last_updated: '2023-10-27' },
  { id: 'i5', warehouse_id: 'w1', item_name: 'Burnt Batch #402', quantity: 15, unit: 'kg', type: InventoryType.Waste, last_updated: '2023-10-24' },
  { id: 'i6', warehouse_id: 'w2', item_name: 'Lollipops', quantity: 300, unit: 'boxes', type: InventoryType.FinishedGood, last_updated: '2023-10-26' },
];

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: 'a1', user_id: 'u3', user_name: 'John Worker', warehouse_id: 'w1', date: '2023-10-27', check_in: '08:00 AM', check_out: '05:00 PM', status: 'Present', shift: Shift.Morning },
  { id: 'a2', user_id: 'u3', user_name: 'John Worker', warehouse_id: 'w1', date: '2023-10-28', check_in: '08:15 AM', status: 'Present', shift: Shift.Morning },
];

export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'Sweet Tooth Wholesale', type: CustomerType.Company, contact_person: 'Alice Smith', email: 'alice@sweets.com', phone: '+251 911 000 000' },
  { id: 'c2', name: 'Kiosk #42', type: CustomerType.Individual, contact_person: 'Kebede', email: 'n/a', phone: '+251 922 111 111' },
];

export const MOCK_ORDERS: Order[] = [
  { 
    id: 'o1', 
    customer_id: 'c1', 
    warehouse_id: 'w1', 
    total_amount: 15000, 
    status: OrderStatus.Completed, 
    date: '2023-10-20',
    items: [
        { inventory_item_id: 'i4', quantity: 50 }
    ]
  },
  { 
    id: 'o2', 
    customer_id: 'c2', 
    warehouse_id: 'w1', 
    total_amount: 500, 
    status: OrderStatus.Processing, 
    date: '2023-10-27',
    items: [
        { inventory_item_id: 'i4', quantity: 5 }
    ]
  },
];

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv1',
    order_id: 'o1',
    customer_id: 'c1',
    total_amount: 15000,
    paid_amount: 15000,
    status: InvoiceStatus.Paid,
    created_at: '2023-10-21',
    due_date: '2023-11-21'
  }
];
