
import React, { useState, useRef, useEffect } from 'react';
import { FlaskConical, Sparkles, Send, Terminal, Loader2, Bot } from 'lucide-react';
import { generateLabOracle } from '../services/geminiService';

export const Lab: React.FC = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleConsult = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(''); // Clear previous
    
    // Simulate "Deep Thought" delay for effect even if API is fast
    const response = await generateLabOracle(input);
    
    setLoading(false);
    setResult(response);
  };

  useEffect(() => {
    if (result && resultRef.current) {
        resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [result]);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-6xl mx-auto flex flex-col items-center">
      
      {/* Header Mystique */}
      <div className="text-center mb-10 relative">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-vodoun-green/10 rounded-full blur-[80px] animate-pulse-slow pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-vodoun-purple/10 rounded-full blur-[80px] animate-pulse-slow delay-1000 pointer-events-none"></div>

        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-900 to-black border border-vodoun-green/30 mb-6 shadow-[0_0_30px_rgba(5,150,105,0.3)] relative group">
           <div className="absolute inset-0 rounded-full border border-vodoun-green opacity-0 group-hover:opacity-100 animate-ping"></div>
           <Bot size={40} className="text-vodoun-green relative z-10" />
        </div>
        
        <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-4 tracking-tight">
          ORACLE <span className="text-transparent bg-clip-text bg-gradient-to-r from-vodoun-green via-emerald-400 to-cyan-500">WANIYILO</span>
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto text-lg leading-relaxed">
          Pose ton fardeau ici. L'IA analyse tes mots, les Esprits analysent ton intention.
          <br/> <span className="text-vodoun-green text-sm font-mono mt-2 block">/// SYNC.ANCESTRAL_V2.0 CONNECTÉ ///</span>
        </p>
      </div>

      {/* Main Interface */}
      <div className="w-full max-w-4xl relative">
        {/* Glow effect behind */}
        <div className="absolute -inset-1 bg-gradient-to-r from-vodoun-green via-cyan-500 to-vodoun-purple rounded-2xl opacity-20 blur-lg"></div>

        <div className="relative bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden flex flex-col min-h-[500px] shadow-2xl">
          
          {/* Output / Dialogue Area */}
          <div className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
             
             {!result && !loading && (
               <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-6 opacity-60">
                 <div className="w-24 h-24 border border-dashed border-gray-700 rounded-full flex items-center justify-center">
                    <Sparkles size={32} />
                 </div>
                 <p className="text-center font-mono text-sm max-w-md">
                   "L'algorithme attend ta question pour tisser une nouvelle réalité."
                 </p>
                 <div className="flex gap-2">
                    {['Stress au travail', 'Avenir de l\'Afrique', 'Paix intérieure'].map(suggestion => (
                        <button key={suggestion} onClick={() => setInput(suggestion)} className="px-3 py-1 rounded-full bg-white/5 border border-white/5 hover:border-vodoun-green text-xs transition-colors">
                            {suggestion}
                        </button>
                    ))}
                 </div>
               </div>
             )}
             
             {loading && (
               <div className="h-full flex flex-col items-center justify-center space-y-6">
                 <div className="relative">
                    <div className="w-20 h-20 border-4 border-vodoun-green/20 border-t-vodoun-green rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 size={24} className="text-vodoun-green animate-pulse" />
                    </div>
                 </div>
                 <div className="text-center space-y-2">
                    <p className="text-white font-display text-xl animate-pulse">Consultation des Archives...</p>
                    <p className="text-vodoun-green font-mono text-xs">Analyse sémantique... Fusion culturelle... Génération...</p>
                 </div>
               </div>
             )}

             {result && (
               <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                  <div className="flex items-start gap-4 mb-6">
                     <div className="w-10 h-10 rounded-full bg-vodoun-green/20 flex items-center justify-center shrink-0 border border-vodoun-green/50">
                        <Bot size={20} className="text-vodoun-green" />
                     </div>
                     <div className="glass-panel p-6 rounded-2xl rounded-tl-none border border-vodoun-green/30 bg-gradient-to-b from-white/5 to-transparent">
                        <div 
                          ref={resultRef}
                          className="prose prose-invert prose-p:text-gray-200 prose-strong:text-vodoun-green max-w-none text-lg leading-8 whitespace-pre-line"
                        >
                            {result}
                        </div>
                     </div>
                  </div>
                  <div className="text-center mt-8">
                     <p className="text-xs text-gray-500 font-mono">Cette sagesse a été générée par l'Esprit Waniyilo v2.0</p>
                  </div>
               </div>
             )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-gray-900/50 border-t border-white/10">
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleConsult()}
                placeholder="Exprime ton problème ici..."
                className="flex-1 bg-black border border-gray-700 rounded-xl py-4 pl-6 pr-14 text-white placeholder-gray-600 focus:outline-none focus:border-vodoun-green transition-all shadow-inner"
              />
              <button 
                onClick={handleConsult}
                disabled={loading || !input.trim()}
                className="absolute right-2 p-2 bg-gradient-to-r from-vodoun-green to-emerald-600 hover:from-emerald-500 hover:to-vodoun-green text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-vodoun-green/50"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
