import React, { useState } from 'react';
import { CreditCard, Lock, X, ShieldCheck, AlertCircle, Building, Wallet, Globe } from 'lucide-react';
import { validateCardNumber, getCardBrand } from '../services/paymentService';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Updated signature to handle multiple types
  onSuccess: (details: { type: 'card' | 'bank_account' | 'paypal', last4: string, brand: string, expiry?: string }) => void;
  amount?: number;
}

type PaymentType = 'card' | 'bank' | 'paypal';

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess, amount }) => {
  const [method, setMethod] = useState<PaymentType>('card');
  const [formData, setFormData] = useState({
    name: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
    routingNumber: '',
    accountNumber: '',
    paypalEmail: ''
  });
  
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardBrand, setCardBrand] = useState('Unknown');

  if (!isOpen) return null;

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 19) value = value.slice(0, 19);
    setFormData({ ...formData, cardNumber: value });
    setCardBrand(getCardBrand(value));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    setFormData({ ...formData, expiry: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    // Validation Logic
    if (method === 'card') {
        if (!validateCardNumber(formData.cardNumber)) {
            setError('Invalid card number.');
            setIsProcessing(false);
            return;
        }
    }

    // Simulate API delay
    setTimeout(() => {
        setIsProcessing(false);
        
        let resultData;
        if (method === 'card') {
            resultData = {
                type: 'card' as const,
                last4: formData.cardNumber.slice(-4),
                brand: cardBrand,
                expiry: formData.expiry
            };
        } else if (method === 'bank') {
            resultData = {
                type: 'bank_account' as const,
                last4: formData.accountNumber.slice(-4),
                brand: 'Bank Transfer',
                expiry: undefined
            };
        } else {
            resultData = {
                type: 'paypal' as const,
                last4: '', // PayPal doesn't have last4 in the same way, usually email
                brand: 'PayPal',
                expiry: undefined
            };
        }

        onSuccess(resultData);
        onClose();
        // Reset
        setFormData({ name: '', cardNumber: '', expiry: '', cvc: '', routingNumber: '', accountNumber: '', paypalEmail: '' });
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-center shrink-0">
            <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="text-green-600" size={20} />
                    Secure Payment
                </h2>
                <p className="text-xs text-slate-500">Encrypted 256-bit SSL Connection</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
                <X size={24} />
            </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
            <button 
                onClick={() => setMethod('card')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${method === 'card' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                <CreditCard size={16} /> Card
            </button>
            <button 
                onClick={() => setMethod('bank')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${method === 'bank' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                <Building size={16} /> Bank (ACH)
            </button>
            <button 
                onClick={() => setMethod('paypal')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${method === 'paypal' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                <Wallet size={16} /> PayPal
            </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
                {amount && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-center mb-4">
                        <p className="text-slate-600 text-sm">Total Amount Due</p>
                        <p className="text-3xl font-bold text-indigo-700">${amount.toFixed(2)}</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {/* CARD FORM */}
                {method === 'card' && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                        {/* Major Cards Badge Strip */}
                        <div className="flex gap-2 justify-center mb-2 opacity-80">
                            {['Visa', 'Mastercard', 'Amex', 'Discover', 'JCB', 'UnionPay'].map(brand => (
                                <div key={brand} className="border border-slate-200 rounded px-1.5 py-0.5 bg-white shadow-sm">
                                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">{brand}</span>
                                </div>
                            ))}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Cardholder Name</label>
                            <input 
                                required
                                type="text"
                                placeholder="John Doe"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                        </div>

                        <div className="relative">
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Card Number</label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    required
                                    type="text"
                                    placeholder="0000 0000 0000 0000"
                                    className="w-full pl-10 pr-12 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                                    value={formData.cardNumber}
                                    onChange={handleCardNumberChange}
                                    maxLength={19}
                                />
                                {cardBrand !== 'Unknown' && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                        {cardBrand}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Expiry (MM/YY)</label>
                                <input 
                                    required
                                    type="text"
                                    placeholder="MM/YY"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-center"
                                    value={formData.expiry}
                                    onChange={handleExpiryChange}
                                    maxLength={5}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">CVC / CWW</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <input 
                                        required
                                        type="password"
                                        placeholder="123"
                                        className="w-full pl-9 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.cvc}
                                        onChange={e => setFormData({...formData, cvc: e.target.value.replace(/\D/g,'').slice(0,4)})}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* BANK FORM */}
                {method === 'bank' && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 flex gap-2">
                            <Building size={16} className="shrink-0" />
                            <p>Connect your bank account via ACH Direct Debit. Verification may take 1-2 business days.</p>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Account Holder Name</label>
                            <input 
                                required
                                type="text"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Routing Number</label>
                            <input 
                                required
                                type="text"
                                maxLength={9}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                                value={formData.routingNumber}
                                onChange={e => setFormData({...formData, routingNumber: e.target.value.replace(/\D/g,'')})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Account Number</label>
                            <input 
                                required
                                type="text"
                                maxLength={12}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                                value={formData.accountNumber}
                                onChange={e => setFormData({...formData, accountNumber: e.target.value.replace(/\D/g,'')})}
                            />
                        </div>
                    </div>
                )}

                {/* PAYPAL FORM */}
                {method === 'paypal' && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 text-center py-4">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Globe size={32} />
                        </div>
                        <p className="text-slate-600 text-sm">
                            You will be redirected to PayPal to complete your billing agreement securely.
                        </p>
                        <div className="text-left">
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">PayPal Email</label>
                            <input 
                                required
                                type="email"
                                placeholder="name@example.com"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.paypalEmail}
                                onChange={e => setFormData({...formData, paypalEmail: e.target.value})}
                            />
                        </div>
                    </div>
                )}

                <div className="pt-2">
                    <button 
                        type="submit" 
                        disabled={isProcessing}
                        className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Lock size={18} />
                                {amount ? `Pay $${amount.toFixed(2)}` : 'Save Payment Method'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};