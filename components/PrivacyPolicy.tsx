import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, Server, FileText, Globe } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2 cursor-pointer" onClick={onBack}>
               <Shield className="text-indigo-600 w-6 h-6" />
               <span className="font-bold text-xl tracking-tight text-slate-900">NexusAI Privacy</span>
            </div>
            <button
              onClick={onBack}
              className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-2 transition-colors"
            >
              <ArrowLeft size={16} /> Back to Home
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Privacy & Security Policy</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Transparency is at the core of NexusAI. Here is exactly how we handle, encrypt, and protect your business data.
            </p>
        </div>

        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Encryption Section - Highlighted */}
            <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                        <Lock size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Encryption & Data Security</h2>
                </div>
                <p className="text-slate-600 mb-6 leading-relaxed">
                    We utilize state-of-the-art security measures to ensure your customer data, transcripts, and business insights remain confidential. Your trust is our most valuable asset.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2 p-4 bg-slate-50 rounded-xl">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Server size={18} className="text-indigo-600"/> Encryption at Rest</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            All sensitive database entries (Customer PII, CRM logs, Auth Tokens) are encrypted using <strong>AES-256</strong> standards before being written to disk. This ensures that even in the unlikely event of physical server compromise, the data remains indecipherable.
                        </p>
                    </div>
                    <div className="space-y-2 p-4 bg-slate-50 rounded-xl">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Globe size={18} className="text-indigo-600"/> Encryption in Transit</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            All data transmitted between your browser, our API servers, and third-party AI providers is secured via <strong>TLS 1.3</strong> (Transport Layer Security). We enforce strict HTTPS for all connections, preventing man-in-the-middle attacks.
                        </p>
                    </div>
                </div>
            </section>

            {/* Safe Practices */}
            <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Our Safe Practices</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                            <Eye size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">No Data Selling</h3>
                        <p className="text-sm text-slate-600">We do not sell, trade, or rent your personal identification information or business data to advertisers or third parties. Ever.</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                            <Shield size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">Strict Access Control</h3>
                        <p className="text-sm text-slate-600">Internal access to customer data is restricted to key engineering personnel on a strict "need-to-know" basis, protected by multi-factor authentication.</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-4">
                            <FileText size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">AI Data Privacy</h3>
                        <p className="text-sm text-slate-600">Data sent to LLMs (like Google Gemini) for processing is done via enterprise agreements that ensure your data is not used to train public models.</p>
                    </div>
                </div>
            </section>

            {/* Standard Privacy Info */}
            <section className="prose prose-slate max-w-none text-slate-600 bg-white p-8 rounded-2xl border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Information We Collect</h2>
                <p>
                    To provide our automation services effectively, we collect the following types of information:
                </p>
                <ul className="list-disc pl-5 space-y-2 mb-6">
                    <li><strong>Account Information:</strong> Name, email, company name, and payment details (processed securely via Stripe/Payment Providers) necessary for account creation and billing.</li>
                    <li><strong>Customer Data:</strong> Information you input into the CRM (names, emails, phone numbers) to allow our AI to draft emails, route calls, and schedule appointments.</li>
                    <li><strong>Usage Data:</strong> Metrics on how you use the dashboard (e.g., number of calls processed, features accessed) to help us improve platform performance and reliability.</li>
                </ul>

                <h2 className="text-2xl font-bold text-slate-900 mb-4">Your Rights</h2>
                <p>
                    You retain full ownership of your data. As a user of NexusAI, you have the right to:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Export:</strong> Download a full copy of your CRM data and call logs at any time in standard formats (CSV/JSON).</li>
                    <li><strong>Delete:</strong> Request complete deletion of your account and all associated data from our servers.</li>
                    <li><strong>Rectify:</strong> Correct any inaccuracies in your personal or business information via the settings dashboard.</li>
                </ul>
            </section>

            <section className="border-t border-slate-200 pt-8 mt-12 mb-12">
                <p className="text-slate-500 text-sm text-center">
                    Last updated: October 2023 <br/>
                    If you have specific questions about our security infrastructure, please contact our Data Protection Officer at <a href="mailto:security@nexus-ai.com" className="text-indigo-600 hover:underline">security@nexus-ai.com</a>.
                </p>
            </section>
        </div>
      </main>
    </div>
  );
};