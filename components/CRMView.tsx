import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, MoreHorizontal, Phone, Mail, Tag, ArrowLeft, Plus, Clock, MapPin, CreditCard, Upload, MessageSquare, BookOpen, DollarSign, Wallet, FileText, Trash2, CheckCircle2, AlertCircle, Landmark, Globe } from 'lucide-react';
import { Customer, CallLog, CustomerStatus, EmailMessage, PaymentMethod } from '../types';
import { getAllCustomers, getCallsByCustomerId, addCallLog, generateId, bulkAddCustomers, getEmailsByCustomerEmail, addCustomerPaymentMethod, toggleCustomerAutoPay, deleteCustomerPaymentMethod } from '../services/dbService';
import { KnowledgeBaseView } from './KnowledgeBaseView';
import { PaymentModal } from './PaymentModal';

export const CRMView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  const [customerCalls, setCustomerCalls] = useState<CallLog[]>([]);
  const [customerEmails, setCustomerEmails] = useState<EmailMessage[]>([]);
  
  // State for adding a new call log
  const [isLoggingCall, setIsLoggingCall] = useState(false);
  const [newCallSummary, setNewCallSummary] = useState('');

  // Customer Detail Tabs
  const [activeDetailTab, setActiveDetailTab] = useState<'timeline' | 'documents' | 'financials'>('timeline');

  // Import functionality
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string>('');

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    // Load customers from "Database"
    setCustomers(getAllCustomers());
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      setCustomerCalls(getCallsByCustomerId(selectedCustomer.id));
      setCustomerEmails(getEmailsByCustomerEmail(selectedCustomer.email));
      setActiveDetailTab('timeline'); // Reset tab when switching customers
    }
  }, [selectedCustomer]);

  // Refresh customer data from DB when needed (e.g. after adding payment method)
  const refreshCustomer = (customerId: string) => {
      const all = getAllCustomers();
      setCustomers(all);
      const updated = all.find(c => c.id === customerId);
      if(updated) setSelectedCustomer(updated);
  };

  const handleLogCall = () => {
    if (!selectedCustomer || !newCallSummary.trim()) return;

    const newCall: CallLog = {
      id: generateId(),
      customerId: selectedCustomer.id,
      caller: selectedCustomer.phone,
      duration: '0m 00s', // Placeholder for manual logs
      date: 'Just now',
      status: 'Outbound',
      summary: newCallSummary
    };

    addCallLog(newCall);
    setCustomerCalls(getCallsByCustomerId(selectedCustomer.id));
    setNewCallSummary('');
    setIsLoggingCall(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const newCustomers: Customer[] = [];

    // Basic CSV parser
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',').map(v => v.trim());
        const data: any = {};
        
        headers.forEach((header, index) => {
            data[header] = values[index] || '';
        });

        if (data['name'] || data['email']) {
            newCustomers.push({
                id: generateId(),
                name: data['name'] || data['full name'] || 'Unknown',
                email: data['email'] || '',
                phone: data['phone'] || data['mobile'] || '',
                company: data['company'] || data['organization'] || '',
                status: CustomerStatus.LEAD,
                lastContact: 'Never',
                tags: ['Imported'],
                address: { street: '', city: '', state: '', zipCode: '', country: '' },
                paymentMethods: [],
                transactions: [],
                autoPay: false
            });
        }
    }
    return newCustomers;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result as string;
            const importedCustomers = parseCSV(text);
            
            if (importedCustomers.length > 0) {
                const updatedList = bulkAddCustomers(importedCustomers);
                setCustomers(updatedList);
                setImportStatus(`Successfully imported ${importedCustomers.length} contacts.`);
                setTimeout(() => setImportStatus(''), 3000);
            } else {
                setImportStatus('No valid contacts found in CSV.');
            }
        } catch (error) {
            console.error(error);
            setImportStatus('Error parsing CSV file.');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // Payment Handlers
  const handleAddPaymentMethod = (details: { type: 'card' | 'bank_account' | 'paypal', last4: string, brand: string, expiry?: string }) => {
      if(!selectedCustomer) return;
      
      const newMethod: PaymentMethod = {
          id: generateId(),
          type: details.type,
          brand: details.brand,
          last4: details.last4,
          expiry: details.expiry,
          isDefault: selectedCustomer.paymentMethods.length === 0 // Make default if first one
      };
      
      addCustomerPaymentMethod(selectedCustomer.id, newMethod);
      refreshCustomer(selectedCustomer.id);
  };

  const handleDeletePaymentMethod = (methodId: string) => {
      if(!selectedCustomer) return;
      if(window.confirm("Are you sure you want to remove this payment method?")) {
          deleteCustomerPaymentMethod(selectedCustomer.id, methodId);
          refreshCustomer(selectedCustomer.id);
      }
  };

  const handleToggleAutoPay = () => {
      if(!selectedCustomer) return;
      toggleCustomerAutoPay(selectedCustomer.id, !selectedCustomer.autoPay);
      refreshCustomer(selectedCustomer.id);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: CustomerStatus) => {
    switch (status) {
      case CustomerStatus.ACTIVE: return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case CustomerStatus.LEAD: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case CustomerStatus.CHURNED: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
      default: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  // --- DETAIL VIEW ---
  if (selectedCustomer) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <PaymentModal 
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            onSuccess={handleAddPaymentMethod}
        />

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedCustomer(null)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Customer Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN: Profile Info & Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Core Info */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
              <div className="flex flex-col items-center text-center mb-6">
                 <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-2xl mb-3">
                   {selectedCustomer.name.charAt(0)}
                 </div>
                 <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedCustomer.name}</h2>
                 <p className="text-slate-500 dark:text-slate-400">{selectedCustomer.company}</p>
                 <div className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedCustomer.status)}`}>
                    {selectedCustomer.status}
                 </div>
              </div>
              
              <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                 <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                    <Mail size={18} className="text-slate-400 dark:text-slate-500" />
                    <a href={`mailto:${selectedCustomer.email}`} className="text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{selectedCustomer.email}</a>
                 </div>
                 <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                    <Phone size={18} className="text-slate-400 dark:text-slate-500" />
                    <a href={`tel:${selectedCustomer.phone}`} className="text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{selectedCustomer.phone}</a>
                 </div>
                 <div className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
                    <MapPin size={18} className="text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      {selectedCustomer.address ? (
                        <>
                          <p>{selectedCustomer.address.street}</p>
                          <p>{selectedCustomer.address.city}, {selectedCustomer.address.state} {selectedCustomer.address.zipCode}</p>
                          <p>{selectedCustomer.address.country}</p>
                        </>
                      ) : (
                        <span className="text-slate-400 italic">No address on file</span>
                      )}
                    </div>
                 </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                 <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Tags</h3>
                 <div className="flex flex-wrap gap-2">
                    {selectedCustomer.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                 </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Unified Interaction History */}
          <div className="lg:col-span-2 space-y-6">
             <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center overflow-x-auto">
                   <div className="flex gap-4 text-sm font-medium">
                      <button 
                        onClick={() => setActiveDetailTab('timeline')}
                        className={`pb-4 -mb-4 px-2 border-b-2 transition-colors whitespace-nowrap ${activeDetailTab === 'timeline' ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400' : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-200'}`}
                      >
                          Timeline
                      </button>
                      <button 
                        onClick={() => setActiveDetailTab('documents')}
                        className={`pb-4 -mb-4 px-2 border-b-2 transition-colors whitespace-nowrap ${activeDetailTab === 'documents' ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400' : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-200'}`}
                      >
                          Documents / Knowledge
                      </button>
                      <button 
                        onClick={() => setActiveDetailTab('financials')}
                        className={`pb-4 -mb-4 px-2 border-b-2 transition-colors whitespace-nowrap ${activeDetailTab === 'financials' ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400' : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-200'}`}
                      >
                          Financials & Billing
                      </button>
                   </div>
                   {activeDetailTab === 'timeline' && (
                       <button 
                         onClick={() => setIsLoggingCall(!isLoggingCall)}
                         className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 flex items-center gap-1 transition-colors"
                       >
                         <Plus size={14} /> Log Interaction
                       </button>
                   )}
                </div>
                
                {/* --- TAB CONTENT --- */}
                <div className="flex-1 bg-white dark:bg-slate-900">
                    {activeDetailTab === 'documents' && (
                        <div className="p-6 h-full overflow-y-auto">
                            <KnowledgeBaseView customerId={selectedCustomer.id} />
                        </div>
                    )}

                    {activeDetailTab === 'financials' && (
                        <div className="p-6 space-y-8 animate-in fade-in">
                            {/* Payment Methods */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Wallet size={20} className="text-indigo-600 dark:text-indigo-400"/> Payment Methods
                                    </h3>
                                    <button 
                                        onClick={() => setIsPaymentModalOpen(true)}
                                        className="text-sm flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium"
                                    >
                                        <Plus size={16} /> Add Method
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {selectedCustomer.paymentMethods.length === 0 ? (
                                        <div className="col-span-2 p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 text-sm">
                                            No payment methods on file.
                                        </div>
                                    ) : (
                                        selectedCustomer.paymentMethods.map(pm => (
                                            <div key={pm.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-start justify-between bg-slate-50 dark:bg-slate-800 hover:shadow-sm transition-shadow">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded flex items-center justify-center text-slate-500 dark:text-slate-300">
                                                        {pm.type === 'card' ? <CreditCard size={18} /> : pm.type === 'bank_account' ? <Landmark size={18} /> : <Globe size={18} />}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                                                            {pm.type === 'paypal' ? pm.brand : `${pm.brand} •••• ${pm.last4}`}
                                                        </p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                                            {pm.type === 'card' ? `Expires ${pm.expiry}` : pm.type === 'bank_account' ? 'Direct Debit' : 'Connected'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {pm.isDefault && <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded font-bold uppercase">Default</span>}
                                                    <button onClick={() => handleDeletePaymentMethod(pm.id)} className="text-slate-400 hover:text-red-500 p-1"><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Automated Billing Toggle */}
                            <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 p-4 rounded-xl">
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Automated Payments</h4>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Automatically charge the default payment method for recurring invoices.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={selectedCustomer.autoPay} onChange={handleToggleAutoPay} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>

                            {/* Transaction History */}
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Clock size={20} className="text-slate-500"/> Payment History
                                </h3>
                                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-medium">
                                            <tr>
                                                <th className="p-3">Date</th>
                                                <th className="p-3">Description</th>
                                                <th className="p-3">Amount</th>
                                                <th className="p-3">Status</th>
                                                <th className="p-3 text-right">Invoice</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {selectedCustomer.transactions.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="p-6 text-center text-slate-400 italic">No transaction history available.</td>
                                                </tr>
                                            ) : (
                                                selectedCustomer.transactions.map(txn => (
                                                    <tr key={txn.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                        <td className="p-3 text-slate-600 dark:text-slate-300">{txn.date}</td>
                                                        <td className="p-3 font-medium text-slate-900 dark:text-white">
                                                            {txn.description}
                                                            {txn.methodLabel && <span className="block text-xs text-slate-400 font-normal">{txn.methodLabel}</span>}
                                                        </td>
                                                        <td className="p-3 font-mono text-slate-900 dark:text-white">${txn.amount.toFixed(2)}</td>
                                                        <td className="p-3">
                                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                                                txn.status === 'succeeded' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                                                                txn.status === 'failed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                            }`}>
                                                                {txn.status === 'succeeded' && <CheckCircle2 size={10} />}
                                                                {txn.status === 'failed' && <AlertCircle size={10} />}
                                                                {txn.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 text-right">
                                                            <button className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-end gap-1 ml-auto">
                                                                <FileText size={14} /> PDF
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeDetailTab === 'timeline' && (
                        <>
                            {isLoggingCall && (
                              <div className="p-4 border-b border-indigo-100 dark:border-indigo-900/30 bg-indigo-50 dark:bg-indigo-900/10 animate-in fade-in slide-in-from-top-2">
                                <textarea
                                  value={newCallSummary}
                                  onChange={(e) => setNewCallSummary(e.target.value)}
                                  placeholder="Enter notes about this call or meeting..."
                                  className="w-full p-3 border border-indigo-200 dark:border-indigo-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm mb-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                  rows={3}
                                />
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => setIsLoggingCall(false)} className="px-3 py-1.5 text-slate-600 dark:text-slate-400 text-sm hover:text-slate-800 dark:hover:text-slate-200">Cancel</button>
                                  <button onClick={handleLogCall} className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 font-medium">Save Log</button>
                                </div>
                              </div>
                            )}

                            <div className="h-full overflow-y-auto p-4 space-y-6">
                               {/* Combine Calls and Emails for a basic timeline view */}
                               {customerCalls.length === 0 && customerEmails.length === 0 ? (
                                 <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                   <MessageSquare size={32} className="mb-2 opacity-50" />
                                   <p>No interaction history yet.</p>
                                 </div>
                               ) : (
                                 <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-4 space-y-8 pb-8">
                                    {/* Map Emails */}
                                    {customerEmails.map((email) => (
                                       <div key={email.id} className="relative pl-8">
                                          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                                             <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                          </div>
                                          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-100 dark:border-slate-700 hover:shadow-sm transition-shadow">
                                             <div className="flex justify-between items-start mb-1">
                                                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded flex items-center gap-1">
                                                  <Mail size={10} /> Email
                                                </span>
                                                <span className="text-xs text-slate-400">{email.date}</span>
                                             </div>
                                             <p className="font-medium text-slate-900 dark:text-white text-sm">{email.subject}</p>
                                             <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{email.preview}</p>
                                          </div>
                                       </div>
                                    ))}

                                    {/* Map Calls */}
                                    {customerCalls.map((call) => (
                                       <div key={call.id} className="relative pl-8">
                                          <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center ${
                                            call.status === 'Missed' ? 'bg-red-100 dark:bg-red-900' : 'bg-indigo-100 dark:bg-indigo-900'
                                          }`}>
                                             <div className={`w-1.5 h-1.5 rounded-full ${
                                                call.status === 'Missed' ? 'bg-red-500' : 'bg-indigo-500'
                                             }`}></div>
                                          </div>
                                          <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-800 hover:shadow-sm transition-shadow">
                                             <div className="flex justify-between items-start mb-1">
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-1 ${
                                                  call.status === 'Missed' ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                                                }`}>
                                                  <Phone size={10} /> {call.status} Call
                                                </span>
                                                <span className="text-xs text-slate-400">{call.date}</span>
                                             </div>
                                             <p className="text-slate-800 dark:text-slate-200 text-sm mt-1">{call.summary}</p>
                                             {call.duration !== '0m 00s' && (
                                               <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                                                 <Clock size={10} /> {call.duration}
                                               </div>
                                             )}
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                               )}
                            </div>
                        </>
                    )}
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // --- LIST VIEW (Default when no customer selected) ---
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        accept=".csv" 
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Customer Relationship Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage leads, track interactions, and view customer profiles.</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={handleImportClick}
             className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium flex items-center gap-2"
           >
             <Upload size={18} /> Import CSV
           </button>
           <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2 shadow-sm">
             <Plus size={18} /> Add Customer
           </button>
        </div>
      </div>

      {importStatus && (
          <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-4 py-3 rounded-lg border border-indigo-100 dark:border-indigo-900/30 text-sm flex items-center gap-2">
              <CheckCircle2 size={16} /> {importStatus}
          </div>
      )}

      {/* SEARCH & FILTERS */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex gap-4">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, email, or company..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
            <Filter size={18} /> Filter
         </button>
      </div>

      {/* CUSTOMER TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">
                     <th className="p-4 w-12">
                        <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600" />
                     </th>
                     <th className="p-4">Customer</th>
                     <th className="p-4">Status</th>
                     <th className="p-4">Contact Info</th>
                     <th className="p-4">Last Interaction</th>
                     <th className="p-4">Tags</th>
                     <th className="p-4 w-10"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredCustomers.length === 0 ? (
                      <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-500 dark:text-slate-400">
                              No customers found matching your search.
                          </td>
                      </tr>
                  ) : (
                      filteredCustomers.map((customer) => (
                         <tr 
                           key={customer.id} 
                           onClick={() => setSelectedCustomer(customer)}
                           className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                         >
                            <td className="p-4" onClick={(e) => e.stopPropagation()}>
                               <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600" />
                            </td>
                            <td className="p-4">
                               <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold">
                                     {customer.name.charAt(0)}
                                  </div>
                                  <div>
                                     <p className="font-bold text-slate-900 dark:text-white">{customer.name}</p>
                                     <p className="text-sm text-slate-500 dark:text-slate-400">{customer.company}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="p-4">
                               <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(customer.status).replace('bg-', 'border-').replace('text-', 'text-')} bg-opacity-10`}>
                                  {customer.status}
                               </span>
                            </td>
                            <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                               <div className="flex flex-col gap-1">
                                  <span className="flex items-center gap-2"><Mail size={14} /> {customer.email}</span>
                                  <span className="flex items-center gap-2"><Phone size={14} /> {customer.phone}</span>
                               </div>
                            </td>
                            <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                               {customer.lastContact}
                            </td>
                            <td className="p-4">
                               <div className="flex flex-wrap gap-1">
                                  {customer.tags.slice(0, 2).map(tag => (
                                     <span key={tag} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-xs">
                                        {tag}
                                     </span>
                                  ))}
                                  {customer.tags.length > 2 && (
                                     <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded text-xs">
                                        +{customer.tags.length - 2}
                                     </span>
                                  )}
                               </div>
                            </td>
                            <td className="p-4 text-right">
                               <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                  <MoreHorizontal size={18} />
                               </button>
                            </td>
                         </tr>
                      ))
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};