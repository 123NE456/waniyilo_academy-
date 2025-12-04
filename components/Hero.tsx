import React from 'react';
import { Section } from '../types';
import { ArrowRight, Sparkles } from 'lucide-react';

interface HeroProps {
  onNavigate: (section: Section) => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 group">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-cyber-black pattern-grid opacity-20"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-vodoun-purple/20 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-vodoun-red/20 rounded-full blur-[100px] animate-pulse-slow delay-1000"></div>
        
        {/* Animated Rings */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-vodoun-gold/10 rounded-full animate-spin-slow"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-vodoun-green/10 rounded-full animate-spin-slow reverse"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-vodoun-gold/30 mb-8 animate-float shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <Sparkles className="text-vodoun-gold animate-pulse" size={16} />
          <span className="text-vodoun-gold text-sm font-tech tracking-wider uppercase">L'avenir s'écrit maintenant</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 mb-6 neon-text leading-tight drop-shadow-xl">
          QUAND LA TRADITION<br />
          RENCONTRE <span className="text-transparent bg-clip-text bg-gradient-to-r from-vodoun-purple to-vodoun-red">L'IA</span>
        </h1>

        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-400 font-light mb-10 leading-relaxed">
          Un portail futuriste où le storytelling du Vodoun Day, la vision de G-CROWN et l'éducation WANIYILO fusionnent pour créer une expérience unique au monde.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={() => onNavigate(Section.CULTURE)}
            className="group relative px-8 py-4 bg-vodoun-purple hover:bg-vodoun-purple/80 rounded-sm font-tech font-bold text-white transition-all overflow-hidden shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_30px_rgba(124,58,237,0.6)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <span className="flex items-center gap-2">
              EXPLORER LA CULTURE <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
          
          <button 
             onClick={() => onNavigate(Section.ACADEMY)}
            className="px-8 py-4 glass-panel border border-vodoun-green/50 text-vodoun-green hover:text-white hover:bg-vodoun-green/20 rounded-sm font-tech font-bold transition-all hover:shadow-[0_0_15px_rgba(5,150,105,0.3)]"
          >
            APPRENDRE AVEC L'IA
          </button>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
        <div className="w-1 h-12 rounded-full bg-gradient-to-b from-vodoun-gold to-transparent"></div>
      </div>
    </div>
  );
};