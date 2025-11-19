
import React, { useState } from 'react';
import { useData } from '../App';
import { OrderStatus, CustomerType, Customer, InvoiceStatus } from '../types';
import { Users, ShoppingCart, CheckCircle, Plus, X, FileText, DollarSign } from 'lucide-react';

const CRMView: React.FC = () => {
  const { customers, orders, inventory, invoices, fulfillOrder, addCustomer, generateInvoice, recordPayment } = useData();
  const [activeTab, setActiveTab] = useState<'customers' | 'orders' | 'invoices'>('customers');
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank Transfer' | 'Check'>('Bank Transfer');

  // New Customer Form State
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
      name: '',
      type: CustomerType.Company,
      contact_person: '',
      phone: '',
      email: ''
  });

  const getItemName = (id: string) => {
    return inventory.find(i => i.id === id)?.item_name || id;
  };

  const handleAddCustomer = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newCustomer.name) return;
      
      addCustomer({
          id: `c${Date.now()}`,
          name: newCustomer.name!,
          type: newCustomer.type || CustomerType.Company,
          contact_person: newCustomer.contact_person || '',
          email: newCustomer.email || '',
          phone: newCustomer.phone || ''
      });
      setIsAddCustomerModalOpen(false);
      setNewCustomer({ name: '', type: CustomerType.Company, contact_person: '', phone: '', email: '' });
  };

  const openPaymentModal = (invoiceId: string) => {
      setSelectedInvoiceId(invoiceId);
      setPaymentAmount(0);
      setIsPaymentModalOpen(true);
  };

  const handlePayment = (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedInvoiceId && paymentAmount > 0) {
          recordPayment(selectedInvoiceId, paymentAmount, paymentMethod);
          setIsPaymentModalOpen(false);
      }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">CRM & Invoices</h2>
        <div className="flex bg-white rounded-lg p-1 border border-slate-200">
            <button 
                onClick={() => setActiveTab('customers')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'customers' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                <div className="flex items-center"><Users size={16} className="mr-2"/> Customers</div>
            </button>
            <button 
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'orders' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                <div className="flex items-center"><ShoppingCart size={16} className="mr-2"/> Orders</div>
            </button>
            <button 
                onClick={() => setActiveTab('invoices')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'invoices' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                <div className="flex items-center"><FileText size={16} className="mr-2"/> Invoices</div>
            </button>
        </div>
      </div>

      {activeTab === 'customers' && (
        <>
            <div className="flex justify-end mb-4">
                 <button 
                    onClick={() => setIsAddCustomerModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
                 >
                    <Plus size={18} className="mr-2" /> Add Customer
                 </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Contact Person</th>
                        <th className="px-6 py-4">Phone</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {customers.map(c => (
                            <tr key={c.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 text-sm font-bold text-slate-800">{c.name}</td>
                                <td className="px-6 py-4 text-sm text-slate-500">{c.type}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{c.contact_person}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{c.phone}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Items</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {orders.map(o => (
                        <tr key={o.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 text-sm font-mono text-slate-500">#{o.id}</td>
                            <td className="px-6 py-4 text-sm font-medium text-slate-800">
                                {customers.find(c => c.id === o.customer_id)?.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                                {o.items && o.items.map((item, idx) => (
                                    <div key={idx} className="text-xs">
                                        {item.quantity}x {getItemName(item.inventory_item_id)}
                                    </div>
                                ))}
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-slate-800">
                                {o.total_amount.toLocaleString()} ETB
                            </td>
                            <td className="px-6 py-4 text-sm">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    o.status === OrderStatus.Completed ? 'bg-green-100 text-green-800' :
                                    o.status === OrderStatus.Processing ? 'bg-blue-100 text-blue-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {o.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 flex space-x-2">
                                {o.status !== OrderStatus.Completed && o.status !== OrderStatus.Cancelled && (
                                    <button 
                                        onClick={() => fulfillOrder(o.id)}
                                        className="flex items-center px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition-colors"
                                        title="Deduct items from inventory"
                                    >
                                        <CheckCircle size={12} className="mr-1"/> Fulfill
                                    </button>
                                )}
                                {o.status === OrderStatus.Completed && !invoices.find(i => i.order_id === o.id) && (
                                    <button 
                                        onClick={() => generateInvoice(o.id)}
                                        className="flex items-center px-3 py-1 bg-slate-600 text-white text-xs rounded hover:bg-slate-700 transition-colors"
                                        title="Create Invoice"
                                    >
                                        <FileText size={12} className="mr-1"/> Invoice
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      )}

      {activeTab === 'invoices' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left">
                  <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                          <th className="px-6 py-4">Invoice ID</th>
                          <th className="px-6 py-4">Customer</th>
                          <th className="px-6 py-4">Order Ref</th>
                          <th className="px-6 py-4">Total</th>
                          <th className="px-6 py-4">Paid</th>
                          <th className="px-6 py-4">Balance</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Action</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                      {invoices.map(inv => (
                          <tr key={inv.id} className="hover:bg-slate-50">
                              <td className="px-6 py-4 text-sm font-mono text-slate-500">#{inv.id}</td>
                              <td className="px-6 py-4 text-sm font-medium text-slate-800">
                                  {customers.find(c => c.id === inv.customer_id)?.name}
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-500">#{inv.order_id}</td>
                              <td className="px-6 py-4 text-sm font-bold text-slate-800">{inv.total_amount.toLocaleString()}</td>
                              <td className="px-6 py-4 text-sm text-green-600">{inv.paid_amount.toLocaleString()}</td>
                              <td className="px-6 py-4 text-sm text-red-500 font-medium">{(inv.total_amount - inv.paid_amount).toLocaleString()}</td>
                              <td className="px-6 py-4 text-sm">
                                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      inv.status === InvoiceStatus.Paid ? 'bg-green-100 text-green-800' :
                                      inv.status === InvoiceStatus.PartiallyPaid ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                  }`}>
                                      {inv.status}
                                  </span>
                              </td>
                              <td className="px-6 py-4">
                                  {inv.status !== InvoiceStatus.Paid && (
                                      <button 
                                          onClick={() => openPaymentModal(inv.id)}
                                          className="flex items-center px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                                      >
                                          <DollarSign size={12} className="mr-1"/> Pay
                                      </button>
                                  )}
                              </td>
                          </tr>
                      ))}
                      {invoices.length === 0 && (
                          <tr><td colSpan={8} className="px-6 py-8 text-center text-slate-400">No invoices generated yet.</td></tr>
                      )}
                  </tbody>
              </table>
          </div>
      )}

      {/* Add Customer Modal */}
      {isAddCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800">Add New Customer</h3>
                <button onClick={() => setIsAddCustomerModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={20} />
                </button>
            </div>
            <form onSubmit={handleAddCustomer} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Customer / Company Name</label>
                    <input 
                        type="text" required
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={newCustomer.name}
                        onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                        <select 
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                            value={newCustomer.type}
                            onChange={e => setNewCustomer({...newCustomer, type: e.target.value as CustomerType})}
                        >
                            <option value={CustomerType.Company}>Company</option>
                            <option value={CustomerType.Individual}>Individual</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label>
                        <input 
                            type="text"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                            value={newCustomer.contact_person}
                            onChange={e => setNewCustomer({...newCustomer, contact_person: e.target.value})}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input 
                        type="email"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                        value={newCustomer.email}
                        onChange={e => setNewCustomer({...newCustomer, email: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                    <input 
                        type="text"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                        value={newCustomer.phone}
                        onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
                    />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <button 
                        type="button"
                        onClick={() => setIsAddCustomerModalOpen(false)}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Create Customer
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {isPaymentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
               <div className="flex justify-between items-center mb-4">
                   <h3 className="text-lg font-bold text-slate-800">Record Payment</h3>
                   <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                       <X size={20} />
                   </button>
               </div>
               <form onSubmit={handlePayment} className="space-y-4">
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Amount (ETB)</label>
                      <input 
                          type="number" min="1" required
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                          value={paymentAmount}
                          onChange={e => setPaymentAmount(Number(e.target.value))}
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Method</label>
                      <select 
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                          value={paymentMethod}
                          onChange={e => setPaymentMethod(e.target.value as any)}
                      >
                          <option value="Cash">Cash</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Check">Check</option>
                      </select>
                  </div>
                  <div className="pt-2">
                      <button 
                          type="submit"
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                      >
                          Confirm Payment
                      </button>
                  </div>
               </form>
            </div>
          </div>
      )}
    </div>
  );
};

export default CRMView;
