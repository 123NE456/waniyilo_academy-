





import React, { useState, useEffect } from 'react';
import { Flame, Calendar, MapPin, Music, Ticket, Star, ArrowRight, History, Handshake, Users, Globe, Image, Loader2, Link as LinkIcon, Navigation } from 'lucide-react';
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

        {/* CARTE INTERACTIVE DU FESTIVAL */}
        <div className="border border-vodoun-gold/30 rounded-2xl bg-black/50 overflow-hidden relative h-96">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
            <div className="absolute top-4 left-4 z-10 bg-black/80 px-4 py-2 rounded-full border border-white/10">
                <span className="text-vodoun-gold font-bold flex items-center gap-2"><MapPin size={16}/> CARTOGRAPHIE DES FESTIVITÉS</span>
            </div>
            {locations.map(loc => {
                if(!loc.map_coords) return null;
                const [x, y] = loc.map_coords.split(',');
                return (
                    <div key={loc.id} className="absolute group cursor-pointer" style={{ left: `${x}%`, top: `${y}%` }}>
                        <div className="w-4 h-4 rounded-full bg-vodoun-red animate-ping absolute"></div>
                        <div className="w-4 h-4 rounded-full bg-vodoun-red relative z-10 border-2 border-white"></div>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                            {loc.name}
                        </div>
                    </div>
                );
            })}
        </div>

        {/* GUIDE DU FESTIVALIER (TOURISME) */}
        <div>
            <div className="text-center mb-12">
                <h2 className="text-4xl font-display font-bold text-white mb-4 flex items-center justify-center gap-3">
                    <MapPin className="text-vodoun-orange" /> GUIDE DU FESTIVALIER
                </h2>
                <p className="text-gray-400">Les lieux incontournables à visiter pour une expérience complète.</p>
            </div>
            {loading ? <div className="text-center"><Loader2 className="animate-spin inline"/></div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {locations.map((loc) => (
                        <div key={loc.id} className="glass-panel rounded-2xl overflow-hidden border border-white/10 hover:border-vodoun-orange/50 transition-all group flex flex-col">
                            <div className="h-48 overflow-hidden relative shrink-0">
                                <img src={loc.img_url} alt={loc.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white font-bold flex items-center gap-1">
                                    <Star size={12} className="text-vodoun-gold fill-vodoun-gold" /> {loc.rating}
                                </div>
                            </div>
                            <div className="p-6 flex flex-col flex-1">
                                <span className="text-xs font-mono text-vodoun-orange uppercase tracking-widest">{loc.type}</span>
                                <h3 className="text-xl font-bold text-white mt-2 mb-2">{loc.name}</h3>
                                {loc.description_long && (
                                    <p className="text-sm text-gray-400 mb-4 line-clamp-4 flex-1">{loc.description_long}</p>
                                )}
                                <div className="flex items-center justify-between mt-auto border-t border-white/5 pt-4">
                                    <span className="text-xs text-gray-500">{loc.reviews} Avis Vérifiés</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
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

        {/* PARTENAIRES EVENT (CLIQUABLES) */}
        <div className="bg-white/5 rounded-3xl p-10 text-center">
            <h3 className="text-lg font-bold text-gray-400 mb-8 uppercase tracking-widest flex items-center justify-center gap-2">
                <Handshake size={16} /> Partenaires Officiels Vodun Days
            </h3>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                {partners.map((p, i) => (
                    <a 
                        key={i} 
                        href={p.website_url || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-2 group opacity-70 hover:opacity-100 transition-opacity"
                    >
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center font-bold text-xl text-white group-hover:bg-vodoun-gold group-hover:text-black transition-colors">
                            {p.name.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-white">{p.name}</span>
                        <span className="text-[10px] text-gray-500 uppercase">{p.type}</span>
                    </a>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};