
import React, { useState, useEffect } from 'react';
import { Flame, Calendar, MapPin, Music, Ticket, Star, ArrowRight } from 'lucide-react';

export const VodunDays: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Cible : 10 Janvier 2026
    const targetDate = new Date('2026-01-10T00:00:00').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white pt-20 overflow-hidden relative">
      {/* Background Video/Image Overlay */}
      <div className="absolute inset-0 z-0">
         <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10"></div>
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?q=80&w=2572&auto=format&fit=crop')] bg-cover bg-center opacity-30 animate-pulse-slow"></div>
         <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-vodoun-red/20 to-transparent"></div>
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* HERO */}
        <div className="text-center mb-20 animate-in slide-in-from-bottom-10 duration-1000">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-vodoun-gold/50 bg-black/50 backdrop-blur mb-6">
            <Flame className="text-vodoun-red animate-pulse" size={20} />
            <span className="text-vodoun-gold font-display tracking-widest uppercase text-sm">L'événement de l'année</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-vodoun-gold via-white to-vodoun-red mb-6 neon-text drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
            VODUN DAYS
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 font-light max-w-3xl mx-auto mb-10">
            Une célébration mondiale des arts, de la spiritualité et de la culture à Ouidah. L'expérience immersive ultime commence bientôt.
          </p>

          {/* COUNTDOWN */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
             {[
               { val: timeLeft.days, label: "JOURS" },
               { val: timeLeft.hours, label: "HEURES" },
               { val: timeLeft.minutes, label: "MINUTES" },
               { val: timeLeft.seconds, label: "SECONDES" }
             ].map((item, i) => (
               <div key={i} className="glass-panel p-6 rounded-xl border border-white/10 flex flex-col items-center justify-center backdrop-blur-md">
                 <span className="text-4xl md:text-6xl font-mono font-bold text-white">{String(item.val).padStart(2, '0')}</span>
                 <span className="text-xs text-vodoun-gold font-bold tracking-widest mt-2">{item.label}</span>
               </div>
             ))}
          </div>
        </div>

        {/* LINE UP / HIGHLIGHTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
           <div className="glass-panel p-8 rounded-2xl border-l-4 border-l-vodoun-red">
              <h2 className="text-3xl font-display font-bold mb-6 flex items-center gap-3">
                 <Music size={32} className="text-vodoun-red" /> SCÈNE SACRÉE
              </h2>
              <ul className="space-y-4">
                 {['Orchestres Traditionnels de Ouidah', 'Fusion Electro-Vodoun', 'Les Gardiens du Temple', 'Performance Arts Numériques'].map((item, i) => (
                    <li key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/5">
                        <span className="text-vodoun-gold font-mono">0{i+1}</span>
                        <span className="text-lg font-bold">{item}</span>
                    </li>
                 ))}
              </ul>
           </div>

           <div className="glass-panel p-8 rounded-2xl border-r-4 border-r-vodoun-gold text-right">
              <h2 className="text-3xl font-display font-bold mb-6 flex items-center justify-end gap-3">
                 PROGRAMME <Calendar size={32} className="text-vodoun-gold" />
              </h2>
              <div className="space-y-6">
                 <div>
                    <h3 className="text-xl font-bold text-vodoun-gold">9 JANVIER</h3>
                    <p className="text-gray-400">Procession des Fidèles & Cérémonie d'Ouverture</p>
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-vodoun-gold">10 JANVIER</h3>
                    <p className="text-gray-400">Grande Célébration Nationale - Place des Fêtes</p>
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-vodoun-gold">11 JANVIER</h3>
                    <p className="text-gray-400">Concerts & Clôture Artistique</p>
                 </div>
              </div>
           </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-vodoun-red to-vodoun-purple p-12 rounded-3xl relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
           <div className="relative z-10">
              <h2 className="text-4xl font-display font-bold mb-6">RÉSERVEZ VOTRE PASS</h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                 L'accès aux sites sacrés et aux concerts VIP est limité. Rejoignez la communauté Waniyilo pour un accès prioritaire.
              </p>
              <button className="px-10 py-5 bg-white text-black font-black font-tech text-xl uppercase rounded-full hover:scale-105 transition-transform shadow-[0_0_50px_rgba(255,255,255,0.5)] flex items-center gap-3 mx-auto">
                 <Ticket size={24} /> ACHETER MON BILLET <ArrowRight />
              </button>
           </div>
        </div>

      </div>
    </div>
  );
};
