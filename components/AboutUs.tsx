import React from 'react';
import { ArrowLeft, Cpu, Users, Heart, Zap } from 'lucide-react';

interface AboutUsProps {
  onBack: () => void;
}

export const AboutUs: React.FC<AboutUsProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/70 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2 cursor-pointer" onClick={onBack}>
              <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-600/20">
                <Zap className="text-white h-5 w-5" fill="currentColor" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">NexusAI</span>
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

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            We speak <span className="text-indigo-600">Human</span> and <span className="text-purple-600">Tech</span>.
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
            With over 20 years of hands-on experience in the technology industry, we are on a mission to make advanced automation accessible, understandable, and genuinely useful for everyone.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
           <div className="order-2 md:order-1">
              <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 relative overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
                 <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-indigo-50 rounded-full blur-2xl"></div>
                 <Users className="text-indigo-600 w-12 h-12 mb-4 relative z-10" />
                 <h3 className="text-2xl font-bold mb-4 relative z-10">Veterans of the Industry</h3>
                 <p className="text-slate-600 leading-relaxed mb-4 relative z-10">
                   We aren't just developers; we are technology enthusiasts who have lived through the digital revolution. From the early web to the mobile era, and now the AI revolution, we have built systems for enterprises, startups, and everything in between.
                 </p>
                 <p className="text-slate-600 leading-relaxed relative z-10">
                   We saw a pattern: powerful technology was often too complex for the people who needed it most—small business owners. We decided to change that.
                 </p>
              </div>
           </div>
           <div className="order-1 md:order-2">
              <h2 className="text-3xl font-bold mb-6 text-slate-900">Why we started NexusAI</h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Technology should be an enabler, not a barrier. We noticed that while AI was advancing rapidly, small businesses were being left behind, stuck with manual processes and disconnected tools.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed">
                We combined our deep technical expertise with a genuine passion for teaching and helping. We don't just build software; we build bridges to the future for your business. We love helping people understand "the how" and "the why" of new technology.
              </p>
           </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24">
         <div className="max-w-7xl mx-auto px-4 text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-slate-900">Our Core Values</h2>
            <p className="text-slate-500 text-lg">What drives us every single day.</p>
         </div>
         <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white border border-slate-100 rounded-2xl hover:shadow-lg transition-shadow">
               <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600">
                  <Cpu size={32} />
               </div>
               <h3 className="text-xl font-bold mb-3 text-slate-900">Simplicity First</h3>
               <p className="text-slate-600 leading-relaxed">We hide the complexity of AI behind intuitive, human-centric interfaces. You shouldn't need a PhD to use our tools.</p>
            </div>
            <div className="text-center p-8 bg-white border border-slate-100 rounded-2xl hover:shadow-lg transition-shadow">
               <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-pink-600">
                  <Heart size={32} />
               </div>
               <h3 className="text-xl font-bold mb-3 text-slate-900">Empathy</h3>
               <p className="text-slate-600 leading-relaxed">We understand the stress of running a business. Our tools are designed to give you peace of mind and time back in your day.</p>
            </div>
            <div className="text-center p-8 bg-white border border-slate-100 rounded-2xl hover:shadow-lg transition-shadow">
               <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-green-600">
                  <Zap size={32} />
               </div>
               <h3 className="text-xl font-bold mb-3 text-slate-900">Innovation</h3>
               <p className="text-slate-600 leading-relaxed">We stay on the bleeding edge so you don't have to. You get the latest tech, automatically integrated into your workflow.</p>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 text-center">
         <div className="max-w-7xl mx-auto px-4">
            <p className="text-slate-500 mb-4">&copy; 2024 NexusAI Platform. Built with experience and ❤️.</p>
            <button onClick={onBack} className="text-indigo-400 hover:text-indigo-300 underline font-medium">Back to Home</button>
         </div>
      </footer>
    </div>
  );
};