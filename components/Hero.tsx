import React from 'react';
import { Section } from '../types';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';

interface HeroProps {
  onNavigate: (section: Section) => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 group">
      
      {/* --- ARRIÈRE-PLAN DYNAMIQUE --- */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        
        {/* Grille Cybernétique de fond */}
        <div className="absolute top-0 left-0 w-full h-full bg-cyber-black pattern-grid opacity-30"></div>
        
        {/* Orbes de couleur fluides (Brume) */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-vodoun-purple/20 rounded-full blur-[120px] animate-pulse-slow mix-blend-screen"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-vodoun-red/15 rounded-full blur-[120px] animate-pulse-slow delay-1000 mix-blend-screen"></div>
        
        {/* MOTIF TRADITIONNEL 1 : Cercle Géométrique Sacré (Rotation lente) */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-20 animate-spin-very-slow pointer-events-none">
           <svg width="800" height="800" viewBox="0 0 100 100" className="text-vodoun-gold">
              <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="2,1" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.1" />
              <path d="M50 2 L50 98 M2 50 L98 50" stroke="currentColor" strokeWidth="0.1" />
              <rect x="28" y="28" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="0.2" transform="rotate(45 50 50)" />
           </svg>
        </div>

        {/* MOTIF TRADITIONNEL 2 : Anneaux Technologiques (Rotation inverse) */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-15 animate-spin-reverse-slow pointer-events-none">
           <svg width="600" height="600" viewBox="0 0 100 100" className="text-vodoun-green">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="10,5" />
              <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.2" />
              <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1,2" />
           </svg>
        </div>

        {/* Particules Flottantes */}
        <div className="absolute top-0 left-0 w-full h-full animate-drift opacity-40">
            <div className="absolute top-20 left-20 w-2 h-2 bg-vodoun-gold rounded-full blur-[1px]"></div>
            <div className="absolute bottom-40 right-20 w-3 h-3 bg-vodoun-red rounded-full blur-[2px]"></div>
            <div className="absolute top-1/2 left-10 w-1 h-1 bg-white rounded-full"></div>
        </div>
      </div>

      {/* --- CONTENU HERO --- */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Badge Futuriste */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-vodoun-gold/30 mb-8 animate-float shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:border-vodoun-gold/60 transition-colors cursor-default">
          <Zap className="text-vodoun-gold animate-pulse" size={16} />
          <span className="text-vodoun-gold text-sm font-tech tracking-wider uppercase">L'avenir s'écrit maintenant</span>
        </div>

        {/* Titre Principal */}
        <h1 className="text-5xl md:text-7xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 mb-6 neon-text leading-tight drop-shadow-2xl">
          QUAND LA TRADITION<br />
          RENCONTRE <span className="text-transparent bg-clip-text bg-gradient-to-r from-vodoun-purple to-vodoun-red">L'IA</span>
        </h1>

        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-400 font-light mb-10 leading-relaxed">
          Un portail futuriste où le storytelling du Vodoun Day, la vision de G-CROWN et l'éducation WANIYILO fusionnent pour créer une expérience unique au monde.
        </p>

        {/* Boutons d'Action */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <button 
            onClick={() => onNavigate(Section.CULTURE)}
            className="group relative px-8 py-4 bg-vodoun-purple hover:bg-vodoun-purple/80 rounded-sm font-tech font-bold text-white transition-all overflow-hidden shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_40px_rgba(124,58,237,0.6)] hover:scale-105 duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
            <span className="flex items-center gap-2 relative z-10">
              EXPLORER LA CULTURE <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
          
          <button 
             onClick={() => onNavigate(Section.ACADEMY)}
            className="px-8 py-4 glass-panel border border-vodoun-green/50 text-vodoun-green hover:text-white hover:bg-vodoun-green/20 rounded-sm font-tech font-bold transition-all hover:shadow-[0_0_20px_rgba(5,150,105,0.4)] hover:-translate-y-1 duration-300"
          >
            APPRENDRE AVEC L'IA
          </button>
        </div>
      </div>
      
      {/* Indicateur de Scroll */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
        <div className="w-1 h-12 rounded-full bg-gradient-to-b from-vodoun-gold to-transparent"></div>
      </div>
    </div>
  );
};