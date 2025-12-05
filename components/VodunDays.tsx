

import React, { useState, useEffect } from 'react';
import { Flame, Calendar, MapPin, Music, Ticket, Star, ArrowRight, History, Handshake, Users, Globe, Image, Loader2 } from 'lucide-react';
import { VodunArchive, VodunLocation, Section, Partner } from '../types';
import { fetchVodunLocations, fetchVodunArchives, fetchPartners } from '../services/supabase';

interface VodunDaysProps {
    onNavigate?: (section: Section) => void;
}

export const VodunDays: React.FC<VodunDaysProps> = ({ onNavigate }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [locations, setLocations] = useState<VodunLocation[]>([]);
  const [archives, setArchives] = useState<VodunArchive[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    Promise.all([fetchVodunLocations(), fetchVodunArchives(), fetchPartners()]).then(([locs, archs, parts]) => {
        setLocations(locs);
        setArchives(archs);
        setPartners(parts.filter(p => p.type === 'VODUN' || p.type === 'OFFICIAL'));
        setLoading(false);
    });

    return () => clearInterval(interval);
  }, []);

  const handleViewOnMap = () => {
      if (onNavigate) {
          onNavigate(Section.CULTURE);
      }
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20 overflow-hidden relative pb-24">
      {/* Background Video/Image Overlay */}
      <div className="absolute inset-0 z-0">
         <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10"></div>
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?q=80&w=2572&auto=format&fit=crop')] bg-cover bg-center opacity-30 animate-pulse-slow"></div>
         <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-vodoun-red/20 to-transparent"></div>
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-24">
        
        {/* HERO */}
        <div className="text-center animate-in slide-in-from-bottom-10 duration-1000">
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

        {/* CULTURE & ESPRIT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
                <h2 className="text-4xl font-display font-bold text-white flex items-center gap-3">
                    <Globe className="text-vodoun-green" /> L'ESPRIT DU VODOUN
                </h2>
                <p className="text-gray-300 text-lg leading-relaxed text-justify">
                    Loin des clichés, le Vodoun est une célébration de la vie, de la nature et des ancêtres. C'est une philosophie d'harmonie universelle où chaque élément – l'eau, la terre, le feu, l'air – possède une âme.
                    <br/><br/>
                    Durant les Vodun Days, Ouidah devient la capitale mondiale de cette spiritualité bienveillante. C'est un moment de reconnexion, de purification et de joie partagée à travers la danse, les rythmes sacrés et les arts visuels.
                </p>
                <div className="flex gap-4">
                    <div className="px-4 py-2 bg-white/5 rounded border border-white/10 text-sm">🌿 Respect de la Nature</div>
                    <div className="px-4 py-2 bg-white/5 rounded border border-white/10 text-sm">🔥 Force des Ancêtres</div>
                </div>
            </div>
            <div className="glass-panel p-2 rounded-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                <img src="https://images.unsplash.com/photo-1535905557558-afc4877a26fc?q=80&w=2574&auto=format&fit=crop" alt="Culture" className="rounded-xl w-full h-80 object-cover grayscale hover:grayscale-0 transition-all duration-700" />
            </div>
        </div>

        {/* CARTE & GUIDE FESTIVALIER */}
        <div>
            <div className="text-center mb-12">
                <h2 className="text-4xl font-display font-bold text-white mb-4 flex items-center justify-center gap-3">
                    <MapPin className="text-vodoun-orange" /> GUIDE DU FESTIVALIER
                </h2>
                <p className="text-gray-400">Les lieux incontournables à visiter pour une expérience complète.</p>
            </div>
            {loading ? <div className="text-center"><Loader2 className="animate-spin inline"/></div> : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {locations.map((loc) => (
                        <div key={loc.id} className="glass-panel rounded-2xl overflow-hidden border border-white/10 hover:border-vodoun-orange/50 transition-all group">
                            <div className="h-48 overflow-hidden relative">
                                <img src={loc.img_url} alt={loc.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white font-bold flex items-center gap-1">
                                    <Star size={12} className="text-vodoun-gold fill-vodoun-gold" /> {loc.rating}
                                </div>
                            </div>
                            <div className="p-6">
                                <span className="text-xs font-mono text-vodoun-orange uppercase tracking-widest">{loc.type}</span>
                                <h3 className="text-xl font-bold text-white mt-2 mb-2">{loc.name}</h3>
                                <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-4">
                                    <span className="text-xs text-gray-500">{loc.reviews} Avis Vérifiés</span>
                                    <button onClick={handleViewOnMap} className="text-sm font-bold text-white hover:text-vodoun-orange transition-colors flex items-center gap-1">
                                        VOIR SUR CARTE <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* LINE UP */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
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

        {/* ARCHIVES & ALBUMS */}
        <div className="relative border-t border-white/10 pt-16">
             <h2 className="text-3xl font-display font-bold text-white mb-8 flex items-center gap-3">
                <History className="text-gray-400" /> MÉMOIRE DU TEMPS
             </h2>
             {loading ? <div className="text-center"><Loader2 className="animate-spin inline"/></div> : (
                 <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar snap-x snap-mandatory">
                    {archives.map((arch, i) => (
                        <div key={i} className="min-w-[300px] md:min-w-[400px] snap-center bg-white/5 p-6 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                            <span className="text-4xl font-display font-black text-white/20">{arch.year}</span>
                            <h3 className="text-xl font-bold text-vodoun-gold mt-2">{arch.title}</h3>
                            <p className="text-sm text-gray-400 mt-2 mb-4">{arch.description}</p>
                            
                            {/* Gallery Carousel */}
                            {arch.gallery && arch.gallery.length > 0 && (
                                <div className="mt-4 flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory">
                                    {arch.gallery.map((img, idx) => (
                                        <img key={idx} src={img} alt="Archive" className="w-24 h-24 object-cover rounded-lg border border-white/10 snap-start" />
                                    ))}
                                </div>
                            )}

                            <div className="mt-4 text-xs font-bold text-white uppercase border-b border-vodoun-gold pb-1 inline-flex items-center gap-2">
                                <Image size={12} /> {arch.gallery ? arch.gallery.length : 0} Photos
                            </div>
                        </div>
                    ))}
                 </div>
             )}
        </div>

        {/* PARTENAIRES EVENT */}
        <div className="bg-white/5 rounded-3xl p-10 text-center">
            <h3 className="text-lg font-bold text-gray-400 mb-8 uppercase tracking-widest flex items-center justify-center gap-2">
                <Handshake size={16} /> Partenaires Officiels Vodun Days
            </h3>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                {partners.map((p, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center font-bold text-xl text-white">
                            {p.name.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-white">{p.name}</span>
                        <span className="text-[10px] text-gray-500 uppercase">{p.type}</span>
                    </div>
                ))}
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