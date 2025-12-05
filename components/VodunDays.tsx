

import React, { useState, useEffect, useRef } from 'react';
import { Flame, MapPin, History, Handshake, Star, Image, Loader2, Navigation, Hotel, Fuel, ArrowRight, Lock, Info, X } from 'lucide-react';
import { VodunArchive, VodunLocation, Section, Partner } from '../types';
import { fetchVodunLocations, fetchVodunArchives, fetchPartners } from '../services/supabase';

interface VodunDaysProps {
    onNavigate?: (section: Section) => void;
}

declare global {
    interface Window {
        L: any;
    }
}

export const VodunDays: React.FC<VodunDaysProps> = ({ onNavigate }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [locations, setLocations] = useState<VodunLocation[]>([]);
  const [archives, setArchives] = useState<VodunArchive[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  
  // MODAL STATE
  const [selectedLoc, setSelectedLoc] = useState<VodunLocation | null>(null);

  // MAP STATE
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isMapInteractive, setIsMapInteractive] = useState(false); 

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

  // Initialize Map
  useEffect(() => {
      if (!loading && locations.length > 0 && mapContainerRef.current && window.L && !mapInstanceRef.current) {
          try {
              // Centré sur Ouidah
              const map = window.L.map(mapContainerRef.current, {
                  scrollWheelZoom: false,
                  dragging: false,
                  touchZoom: false,
                  zoomControl: false 
              }).setView([6.366, 2.085], 13);
              
              // Dark Mode Tiles (CartoDB Dark Matter)
              window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                  attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
                  subdomains: 'abcd',
                  maxZoom: 19
              }).addTo(map);

              mapInstanceRef.current = map;

              // Custom Icons Logic
              const createIcon = (color: string) => {
                  return window.L.divIcon({
                      className: 'custom-div-icon',
                      html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 15px ${color};"></div>`,
                      iconSize: [14, 14],
                      iconAnchor: [7, 7]
                  });
              };

              locations.forEach(loc => {
                  if (loc.map_coords) {
                      const [lat, lng] = loc.map_coords.split(',').map(Number);
                      if (!isNaN(lat) && !isNaN(lng)) {
                          let color = '#F59E0B'; // Gold default
                          if (loc.type === 'Hôtel') color = '#3B82F6'; // Blue
                          if (loc.type === 'Station') color = '#EF4444'; // Red
                          if (loc.type === 'Nature') color = '#10B981'; // Green

                          const marker = window.L.marker([lat, lng], { icon: createIcon(color) }).addTo(map);
                          
                          // Custom Popup
                          const popupContent = `
                            <div style="font-family: 'Inter', sans-serif; color: #333; text-align: center; min-width: 150px;">
                                <strong style="font-size: 14px; display: block; margin-bottom: 4px;">${loc.name}</strong>
                                <span style="font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 1px;">${loc.type}</span>
                                <br/>
                                <span style="font-size: 11px; font-weight: bold; color: #F59E0B;">★ ${loc.rating}</span>
                            </div>
                          `;
                          marker.bindPopup(popupContent);
                      }
                  }
              });

          } catch (e) {
              console.error("Leaflet init error", e);
          }
      }
  }, [loading, locations]);

  const enableMapInteraction = () => {
      if (mapInstanceRef.current) {
          mapInstanceRef.current.dragging.enable();
          mapInstanceRef.current.touchZoom.enable();
          mapInstanceRef.current.scrollWheelZoom.enable();
      }
      setIsMapInteractive(true);
  };

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

        {/* CARTE OPENSTREETMAP INTERACTIVE */}
        <div className="space-y-4">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-display font-bold text-white mb-2 flex items-center justify-center gap-3">
                    <MapPin className="text-vodoun-orange" /> GÉOLOCALISATION
                </h2>
                <p className="text-gray-400">Repérez les événements, hôtels et stations à Ouidah et Porto-Novo.</p>
            </div>
            
            <div className="relative h-[500px] w-full rounded-3xl overflow-hidden border border-vodoun-gold/30 shadow-2xl z-10 group">
                {/* LA CARTE */}
                <div id="map-container" ref={mapContainerRef} className="w-full h-full bg-gray-900"></div>
                
                {/* OVERLAY DE PROTECTION */}
                {!isMapInteractive && !loading && (
                    <div className="absolute inset-0 z-[500] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center cursor-pointer transition-opacity" onClick={enableMapInteraction}>
                        <button 
                            onClick={(e) => { e.stopPropagation(); enableMapInteraction(); }}
                            className="px-8 py-4 bg-vodoun-gold hover:bg-white text-black font-bold font-tech rounded-full shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all transform hover:scale-105 flex items-center gap-3"
                        >
                            <Navigation size={20} /> ACTIVER LA CARTE INTERACTIVE
                        </button>
                        <p className="mt-4 text-gray-300 text-sm flex items-center gap-2">
                            <Lock size={14} /> Navigation verrouillée pour faciliter le défilement
                        </p>
                    </div>
                )}

                {loading && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
                        <Loader2 className="animate-spin text-vodoun-gold" size={48} />
                    </div>
                )}
            </div>
            <div className="flex justify-center gap-4 text-xs font-mono text-gray-500 flex-wrap">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-vodoun-gold inline-block"></span> LIEUX VODUN</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> HÔTELS</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> STATIONS</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span> NATURE</span>
            </div>
        </div>

        {/* GUIDE DU FESTIVALIER (LISTE DÉTAILLÉE) */}
        <div>
            <div className="text-center mb-12">
                <h2 className="text-4xl font-display font-bold text-white mb-4 flex items-center justify-center gap-3">
                    <Navigation className="text-vodoun-green" /> GUIDE TOURISTIQUE
                </h2>
            </div>
            {loading ? <div className="text-center"><Loader2 className="animate-spin inline"/></div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {locations.map((loc) => (
                        <div key={loc.id} className="glass-panel rounded-2xl overflow-hidden border border-white/10 hover:border-vodoun-green/50 transition-all group flex flex-col">
                            <div className="h-48 overflow-hidden relative shrink-0">
                                <img src={loc.img_url} alt={loc.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white font-bold flex items-center gap-1">
                                    <Star size={12} className="text-vodoun-gold fill-vodoun-gold" /> {loc.rating}
                                </div>
                                <div className="absolute bottom-2 left-2 bg-vodoun-purple/80 px-2 py-1 rounded text-[10px] text-white font-bold uppercase">
                                    {loc.type}
                                </div>
                            </div>
                            <div className="p-6 flex flex-col flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xl font-bold text-white truncate pr-2">{loc.name}</h3>
                                    {loc.type === 'Hôtel' && <Hotel size={16} className="text-blue-400" />}
                                    {loc.type === 'Station' && <Fuel size={16} className="text-red-400" />}
                                </div>
                                {loc.description_long && (
                                    <p className="text-sm text-gray-400 mb-4 line-clamp-3 flex-1">{loc.description_long}</p>
                                )}
                                <div className="flex items-center justify-between mt-auto border-t border-white/5 pt-4">
                                    <span className="text-xs text-gray-500">{loc.reviews} Avis</span>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setSelectedLoc(loc)}
                                            className="text-xs text-vodoun-gold hover:text-white flex items-center gap-1"
                                        >
                                            <Info size={12} /> Détails
                                        </button>
                                        <button 
                                            onClick={() => {
                                                document.getElementById('map-container')?.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                            className="text-xs text-vodoun-green hover:text-white flex items-center gap-1"
                                        >
                                            Voir Carte <ArrowRight size={12}/>
                                        </button>
                                    </div>
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
                                        <img key={idx} src={img} alt="Archive" className="w-32 h-24 object-cover rounded-lg border border-white/10 snap-start" />
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

        {/* MODAL DETAILS */}
        {selectedLoc && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                <div className="w-full max-w-lg bg-cyber-gray border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative animate-in zoom-in-95">
                    <button onClick={() => setSelectedLoc(null)} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center"><X size={18}/></button>
                    <div className="h-48">
                        <img src={selectedLoc.img_url} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-6 max-h-[50vh] overflow-y-auto">
                        <h2 className="text-2xl font-display font-bold text-white mb-1">{selectedLoc.name}</h2>
                        <span className="text-vodoun-gold text-xs font-bold uppercase">{selectedLoc.type}</span>
                        <div className="mt-4 prose prose-invert text-sm text-gray-300">
                            {selectedLoc.description_long || "Pas de description détaillée disponible."}
                        </div>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};
