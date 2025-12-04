import React from 'react';
import { Target, Shield, Zap, Layers, Globe, Users, Cpu, Lightbulb } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="py-20 bg-cyber-gray relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pattern-grid opacity-10 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white leading-tight mb-6">
            L'EXCELLENCE <span className="text-vodoun-gold">AFRICAINE</span>
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-vodoun-red to-vodoun-purple mx-auto mb-8"></div>
          
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-light">
            <strong className="text-white font-bold">WANIYILO ACADEMY 2026</strong> est une plateforme éducative et culturelle innovante dédiée à la valorisation du patrimoine béninois et au développement des compétences numériques et technologiques de la jeunesse africaine.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Mission & Ecosystem */}
          <div className="lg:col-span-7 space-y-12">
            
            {/* The Core Text */}
            <div className="glass-panel p-8 rounded-2xl border-l-4 border-l-vodoun-purple">
              <p className="text-gray-300 mb-6 leading-relaxed">
                Alliant tradition, modernité et intelligence artificielle, WANIYILO se positionne comme un centre d’excellence pour l’apprentissage, la culture et l’innovation. Dotée d’une mission claire — <span className="text-vodoun-gold font-bold">transmettre, former et inspirer</span> — la plateforme repose sur une vision ambitieuse : devenir le premier hub numérique culturel et éducatif d’Afrique francophone.
              </p>
              <p className="text-gray-400 text-sm">
                Une gouvernance structurée composée d’experts culturels, pédagogiques et technologiques guide ce projet, soutenue par des partenariats avec des institutions publiques, privées et internationales.
              </p>
            </div>

            {/* Ecosystem Grid */}
            <div>
              <h3 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-2">
                <Layers className="text-vodoun-red" /> L'ÉCOSYSTÈME WANIYILO
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Espace Culturel Interactif", icon: <Globe size={18} /> },
                  { label: "Médiathèque Numérique", icon: <Layers size={18} /> },
                  { label: "Assistant IA Éducatif", icon: <Cpu size={18} /> },
                  { label: "Académie de Formation", icon: <Shield size={18} /> },
                  { label: "Labo Tech & Science", icon: <Zap size={18} /> },
                  { label: "Développement Personnel", icon: <Users size={18} /> },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/5 hover:border-vodoun-gold/30 transition-all">
                    <div className="text-vodoun-gold">{item.icon}</div>
                    <span className="text-gray-200 font-medium text-sm">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Target & Impact (Visual) */}
          <div className="lg:col-span-5 space-y-6">
             
             {/* Target Audience Card */}
             <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-white/10 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                 <Users size={64} className="text-vodoun-green" />
               </div>
               <h3 className="text-xl font-display font-bold text-white mb-4">POUR QUI ?</h3>
               <ul className="space-y-3 relative z-10">
                 {['Jeunesse Africaine', 'Établissements Scolaires', 'Passionnés de Culture', 'Institutions & Chercheurs'].map((target, idx) => (
                   <li key={idx} className="flex items-center gap-3 text-gray-400">
                     <div className="w-1.5 h-1.5 rounded-full bg-vodoun-green"></div>
                     {target}
                   </li>
                 ))}
               </ul>
             </div>

             {/* Impact Card */}
             <div className="glass-panel p-8 rounded-2xl border border-vodoun-gold/20 relative overflow-hidden">
               <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-vodoun-gold rounded-full blur-[60px] opacity-20"></div>
               
               <h3 className="text-xl font-display font-bold text-white mb-4 flex items-center gap-2">
                 <Lightbulb className="text-vodoun-gold" /> IMPACT
               </h3>
               <p className="text-gray-300 text-sm leading-relaxed mb-4">
                 Grâce à une approche durable et inclusive, WANIYILO ACADEMY 2026 contribue à :
               </p>
               <ul className="space-y-2 text-sm font-medium text-gray-200">
                 <li className="flex gap-2"><span className="text-vodoun-red">01.</span> Préservation du patrimoine immatériel</li>
                 <li className="flex gap-2"><span className="text-vodoun-purple">02.</span> Réduction de la fracture numérique</li>
                 <li className="flex gap-2"><span className="text-vodoun-green">03.</span> Émergence d'une jeunesse consciente</li>
               </ul>
             </div>

          </div>
        </div>
      </div>
    </div>
  );
};