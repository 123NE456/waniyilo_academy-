
import React, { useState } from 'react';
import { Landmark } from '../types';
import { X, ScanLine, Globe, Loader2, Languages, AlertCircle, MapPin, Navigation, Radar } from 'lucide-react';
import { translateText } from '../services/geminiService';

// Coordonnées ajustées pour la carte vectorielle (0-100%)
const landmarks: Landmark[] = [
  { 
    id: '1', 
    name: 'Porte du Non-Retour', 
    description: 'Monument mémoriel de l\'esclavage.', 
    details: 'Érigée en 1995 face à l\'océan Atlantique, cette arche monumentale marque l\'endroit d\'où des millions d\'Africains ont été déportés vers les Amériques. Elle symbolise la douleur du départ mais aussi le début de la diaspora africaine.',
    type: 'historical', 
    x: 50, 
    y: 80 
  },
  { 
    id: '2', 
    name: 'Temple des Pythons', 
    description: 'Sanctuaire sacré du culte Vodoun.', 
    details: 'Situé au cœur de Ouidah, face à la Basilique, ce temple abrite des dizaines de pythons royaux (Python regius). Dans la mythologie locale, le python est une divinité bienveillante qui a protégé le roi Kpassè.',
    type: 'sacred', 
    x: 45, 
    y: 40 
  },
  { 
    id: '3', 
    name: 'Forêt Sacrée de Kpassè', 
    description: 'Lieu mystique et botanique.', 
    details: 'Ancien domaine du roi Kpassè, fondateur de Ouidah. La légende raconte qu\'il ne serait pas mort mais se serait métamorphosé en un grand arbre Iroko pour échapper à ses ennemis.',
    type: 'nature', 
    x: 75, 
    y: 30 
  },
  { 
    id: '4', 
    name: 'Place Chacha', 
    description: 'Ancien marché aux esclaves.', 
    details: 'C\'est ici que se tenait le marché aux enchères des esclaves. Les captifs étaient marqués au fer rouge avant d\'être conduits vers la plage. Aujourd\'hui, c\'est un lieu de mémoire.',
    type: 'historical', 
    x: 55, 
    y: 45 
  },
  { 
    id: '5', 
    name: 'Fondation Zinsou', 
    description: 'Art Contemporain Africain.', 
    details: 'Installée dans la Villa Ajavon, une magnifique bâtisse afro-brésilienne de 1922, la Fondation Zinsou est un centre d\'art contemporain gratuit.',
    type: 'historical', 
    x: 30, 
    y: 50 
  },
];

type LangMode = 'FR' | 'EN' | 'FON';

export const CultureMap: React.FC = () => {
  const [activeLandmark, setActiveLandmark] = useState<Landmark | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [translatedDetails, setTranslatedDetails] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [langMode, setLangMode] = useState<LangMode>('FR');
  const [mapActive, setMapActive] = useState(false); // Pour mobile interaction

  const openModal = () => {
    if (activeLandmark) {
        setShowModal(true);
        setTranslatedDetails(null);
        setLangMode('FR');
    }
  };

  const cycleLanguage = async () => {
    if (!activeLandmark || isTranslating) return;

    let nextLang: LangMode = 'FR';
    if (langMode === 'FR') nextLang = 'EN';
    else if (langMode === 'EN') nextLang = 'FON';
    else if (langMode === 'FON') nextLang = 'FR';

    setLangMode(nextLang);

    if (nextLang === 'FR') {
        setTranslatedDetails(null);
        return;
    }

    setIsTranslating(true);
    const target = nextLang === 'EN' ? 'English' : 'Fon';
    const translated = await translateText(activeLandmark.details, target);
    setTranslatedDetails(translated);
    setIsTranslating(false);
  };

  return (
    <div className="w-full min-h-[600px] bg-cyber-black relative flex flex-col items-center justify-center overflow-hidden border-y border-white/10 py-12">
       
       {/* Map Header */}
       <div className="text-center mb-8 relative z-10 px-4">
          <div className="inline-block bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border border-vodoun-gold/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-3 justify-center">
              <Radar className="text-vodoun-gold animate-spin-slow" size={20} />
              CARTOGRAPHIE <span className="text-vodoun-red">HOLOGRAPHIQUE</span>
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-2 font-mono">OUIDAH_SECTOR // LIVE_FEED // VECTOR_MODE</p>
       </div>

      {/* THE MAP CONTAINER (CUSTOM SVG/CSS) */}
      <div className="relative w-full max-w-4xl aspect-square md:aspect-video bg-gray-900/80 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(124,58,237,0.1)] overflow-hidden group mx-auto">
          
          {/* Mobile Overlay to prevent scroll trap */}
          {!mapActive && (
              <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-[2px] flex items-center justify-center md:hidden">
                  <button 
                    onClick={() => setMapActive(true)}
                    className="px-6 py-3 bg-vodoun-purple/20 border border-vodoun-purple text-white font-bold rounded-full animate-pulse flex items-center gap-2"
                  >
                      <ScanLine size={18} /> ACTIVER LE RADAR
                  </button>
              </div>
          )}

          {/* Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
          
          {/* Scanning Line Animation */}
          <div className="absolute top-0 left-0 w-full h-1 bg-vodoun-green/50 shadow-[0_0_20px_#059669] animate-[float_4s_linear_infinite] opacity-50 pointer-events-none z-0"></div>

          {/* Stylized Map Shapes (Abstract Ouidah) */}
          <div className="absolute inset-0 opacity-30 pointer-events-none">
              {/* Ocean Zone */}
              <div className="absolute bottom-0 w-full h-[20%] bg-blue-500/10 border-t border-blue-500/20"></div>
              <div className="absolute bottom-[20%] right-4 text-[10px] text-blue-400 font-mono">ATLANTIC_OCEAN</div>
              
              {/* Main Road RNIE1 */}
              <div className="absolute top-[40%] left-0 w-full h-1 bg-vodoun-gold/20"></div>
              
              {/* Route des Esclaves */}
              <div className="absolute top-[40%] left-[53%] w-1 h-[60%] bg-vodoun-red/20 border-r border-dashed border-vodoun-red/30"></div>
          </div>

          {/* Markers */}
          {landmarks.map((mark) => (
              <button
                key={mark.id}
                onClick={() => setActiveLandmark(mark)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group/marker transition-all duration-300 hover:scale-125 z-20 focus:outline-none"
                style={{ left: `${mark.x}%`, top: `${mark.y}%` }}
              >
                  <div className="relative flex flex-col items-center">
                      {/* Ripple Effect */}
                      <div className={`absolute rounded-full animate-ping opacity-75 ${
                          mark.type === 'sacred' ? 'bg-vodoun-purple' : mark.type === 'nature' ? 'bg-vodoun-green' : 'bg-vodoun-red'
                      } w-full h-full inset-0`}></div>
                      
                      {/* Pin */}
                      <div className={`w-3 h-3 md:w-5 md:h-5 rounded-full border border-white shadow-[0_0_10px_currentColor] relative z-10 ${
                           mark.type === 'sacred' ? 'bg-vodoun-purple text-vodoun-purple' : mark.type === 'nature' ? 'bg-vodoun-green text-vodoun-green' : 'bg-vodoun-red text-vodoun-red'
                      }`}></div>

                      {/* Label */}
                      <div className="mt-2 bg-black/80 backdrop-blur-sm text-[8px] md:text-[10px] text-white font-mono px-2 py-0.5 rounded border border-white/10 whitespace-nowrap hidden md:block group-hover/marker:block">
                          {mark.name}
                      </div>
                  </div>
              </button>
          ))}

          {/* Compass / UI Elements */}
          <div className="absolute top-4 right-4 text-vodoun-gold/50 pointer-events-none">
              <Navigation size={24} className="rotate-45" />
          </div>
          <div className="absolute bottom-4 left-4 font-mono text-[10px] text-gray-500 pointer-events-none">
             COORDS: {activeLandmark ? `${activeLandmark.x}.${activeLandmark.y}` : 'SCANNING...'}
          </div>
      </div>


      {/* Preview Panel (Bottom) */}
      {activeLandmark && !showModal && (
        <div className="absolute bottom-0 w-full px-4 pb-4 md:w-auto md:bottom-8 z-30 flex justify-center pointer-events-none">
          <div className="pointer-events-auto bg-black/90 backdrop-blur-xl p-4 md:p-6 rounded-2xl border border-vodoun-gold/30 w-full md:w-[450px] animate-in slide-in-from-bottom-10 shadow-2xl">
             <div className="flex justify-between items-start mb-3">
               <div>
                  <h3 className="text-lg md:text-xl font-display font-bold text-white leading-none">{activeLandmark.name}</h3>
                  <p className="text-[10px] text-vodoun-gold font-mono mt-1 uppercase tracking-wider">{activeLandmark.type} // DATA_FOUND</p>
               </div>
               <button onClick={(e) => { e.stopPropagation(); setActiveLandmark(null); }} className="text-gray-500 hover:text-white"><X size={20}/></button>
             </div>
             
             <p className="text-gray-400 text-sm line-clamp-2 mb-4">{activeLandmark.description}</p>

             <button 
              onClick={openModal}
              className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-tech font-bold uppercase tracking-wider rounded flex items-center justify-center gap-2 transition-all hover:border-vodoun-gold hover:text-vodoun-gold"
            >
              <ScanLine size={16} /> ANALYSER LES DONNÉES
            </button>
          </div>
        </div>
      )}

      {/* Full Detail Modal */}
      {showModal && activeLandmark && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-200">
           <div className="w-full max-w-lg bg-cyber-gray border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              
              {/* Modal Header */}
              <div className="h-28 bg-gradient-to-r from-vodoun-purple/20 to-black relative flex items-end p-6 border-b border-white/10">
                 <div className="absolute inset-0 pattern-grid opacity-20"></div>
                 <button onClick={() => { setShowModal(false); }} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 hover:bg-white/20 flex items-center justify-center text-white transition-colors border border-white/10">
                    <X size={18} />
                 </button>
                 <div className="relative z-10 w-full">
                    <span className="text-vodoun-gold font-mono text-[10px] uppercase tracking-widest mb-1 block">ARCHIVES SECRÈTES DE OUIDAH</span>
                    <h2 className="text-2xl font-display font-bold text-white leading-tight">{activeLandmark.name}</h2>
                 </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-black/40">
                 
                 {/* Top Warning for Audio */}
                 <div className="mb-6 flex items-center gap-2 p-3 bg-vodoun-purple/10 rounded border border-vodoun-purple/30 text-xs text-vodoun-purple">
                     <AlertCircle size={14} className="shrink-0" />
                     <span>Guide Vocal & Immersion Sonore : <span className="font-bold text-white">MODULE EN DÉVELOPPEMENT</span></span>
                 </div>

                 {/* Tools */}
                 <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                     <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <MapPin className="text-gray-500" size={14} />
                        RAPPORT HISTORIQUE
                     </h3>
                     <button 
                        onClick={cycleLanguage}
                        disabled={isTranslating}
                        className={`px-3 py-1.5 rounded text-[10px] font-bold font-tech flex items-center gap-2 transition-all border ${
                            langMode !== 'FR'
                            ? 'bg-vodoun-gold text-black border-vodoun-gold' 
                            : 'bg-transparent text-gray-400 border-gray-700 hover:border-vodoun-gold hover:text-white'
                        }`}
                    >
                        {isTranslating ? <Loader2 size={12} className="animate-spin" /> : <Languages size={12} />}
                        {langMode === 'FR' ? 'TRADUIRE' : `LANGUE : ${langMode}`}
                    </button>
                 </div>
                 
                 <div className="prose prose-invert max-w-none mb-6">
                    <p className="text-gray-300 leading-relaxed text-sm text-justify whitespace-pre-line">
                       {translatedDetails || activeLandmark.details}
                    </p>
                 </div>

              </div>
           </div>
        </div>
      )}
    </div>
  );
};
