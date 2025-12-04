import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { AIChat } from './components/AIChat';
import { CultureMap } from './components/CultureMap';
import { Academy } from './components/Academy';
import { About } from './components/About';
import { Lab } from './components/Lab';
import { PartnersAndNews } from './components/Partners';
import { Section, UserProfile } from './types';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { getProfileByPhone } from './services/supabase';

function App() {
  const [currentSection, setCurrentSection] = useState<Section>(Section.HOME);
  const [isImmersiveMode, setIsImmersiveMode] = useState(false);
  const [globalUserProfile, setGlobalUserProfile] = useState<UserProfile | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // --- AUTO LOGIN CHECK ---
  useEffect(() => {
      let isMounted = true;
      
      const checkSession = async () => {
          try {
              const storedPhone = localStorage.getItem('waniyilo_user_phone');
              if (storedPhone) {
                  // On tente de récupérer le profil, mais on n'attend pas éternellement
                  const profile = await getProfileByPhone(storedPhone);
                  if (profile && isMounted) {
                      setGlobalUserProfile(profile);
                      setIsImmersiveMode(true);
                  }
              }
          } catch (e) {
              console.error("Session check failed", e);
          } finally {
              if (isMounted) setIsCheckingSession(false);
          }
      };

      checkSession();

      // Sécurité : Force la fin du chargement après 3 secondes max
      const safetyTimeout = setTimeout(() => {
          if (isMounted && isCheckingSession) {
              setIsCheckingSession(false);
          }
      }, 3000);

      return () => { isMounted = false; clearTimeout(safetyTimeout); };
  }, []);

  const handleEnterImmersive = (profile?: UserProfile) => {
      if (profile) {
          setGlobalUserProfile(profile);
      }
      setIsImmersiveMode(true);
  };

  // --- LOADING SCREEN ---
  if (isCheckingSession) {
      return (
          <div className="fixed inset-0 bg-cyber-black flex items-center justify-center">
              <div className="text-center">
                  <div className="relative mb-4">
                      <div className="w-16 h-16 border-4 border-vodoun-purple/30 border-t-vodoun-purple rounded-full animate-spin mx-auto"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 size={24} className="text-vodoun-gold animate-pulse" />
                      </div>
                  </div>
                  <p className="text-vodoun-gold font-mono text-sm animate-pulse tracking-widest">INITIALISATION DU SYSTÈME...</p>
                  <p className="text-xs text-gray-600 font-mono mt-2">v2.0.4 // SECURE_LINK</p>
              </div>
          </div>
      );
  }

  // --- IMMERSIVE MODE (USER LOGGED IN) ---
  if (isImmersiveMode) {
      return (
          <div className="fixed inset-0 w-full h-full overflow-hidden bg-cyber-black">
             <Academy 
                initialProfile={globalUserProfile}
                onEnterImmersive={() => {}} // Already in
                onLogout={() => {
                    setIsImmersiveMode(false);
                    setGlobalUserProfile(null);
                }}
             />
             <AIChat />
          </div>
      );
  }

  // --- PUBLIC MODE (LANDING SITE) ---

  const renderMainContent = () => {
    switch (currentSection) {
      case Section.LAB:
        return <Lab />;
      case Section.CULTURE:
        return (
          <div className="pt-20 min-h-screen">
            <CultureMap />
            <div className="max-w-4xl mx-auto px-4 pb-12 text-center text-gray-400">
              <p className="font-mono text-xs">MODULE DE CARTOGRAPHIE VECTORIELLE ACTIVÉ.</p>
            </div>
          </div>
        );
      case Section.ACADEMY:
        return (
          <div className="pt-20">
            {/* Here Academy acts as the Entry Portal */}
            <Academy 
                onEnterImmersive={handleEnterImmersive}
            />
          </div>
        );
       case Section.NEWS:
        return (
          <div className="pt-20">
             <PartnersAndNews onNavigate={setCurrentSection} />
          </div>
        );
      case Section.BLOG:
        return (
            <div className="pt-24 px-4 min-h-screen max-w-7xl mx-auto">
                <button onClick={() => setCurrentSection(Section.HOME)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8">
                    <ArrowLeft size={20} /> Retour
                </button>
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-display font-bold text-white mb-4">BLOG WANIYILO</h1>
                    <p className="text-gray-400">Chroniques de la fusion entre tradition et technologie.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="glass-panel p-6 rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-white/5">
                            <div className="h-40 bg-gradient-to-br from-vodoun-purple/20 to-black rounded-lg mb-4 flex items-center justify-center border border-white/5">
                                <span className="text-vodoun-purple font-mono text-xs">IMG_ARTICLE_{i}</span>
                            </div>
                            <span className="text-xs text-vodoun-gold font-mono mb-2 block">TECH & CULTURE</span>
                            <h3 className="text-xl font-bold text-white mb-2">L'IA au service du Vodoun : Chapitre {i}</h3>
                            <p className="text-gray-400 text-sm line-clamp-3">Découvrez comment les algorithmes de machine learning aident à préserver les chants traditionnels...</p>
                        </div>
                    ))}
                </div>
            </div>
        );
      default:
        // HOME Layout
        return (
          <>
            <Hero onNavigate={setCurrentSection} />
            <div id="vision">
              <About />
            </div>
            <div id="map-preview">
              <CultureMap />
            </div>
            <div id="academy-preview">
               {/* Preview version in Home */}
               <Academy onEnterImmersive={handleEnterImmersive} />
            </div>
            <div id="partners">
              <PartnersAndNews onNavigate={setCurrentSection} />
            </div>
          </>
        );
    }
  };

  return (
    <div className="bg-cyber-black min-h-screen text-gray-100 font-sans selection:bg-vodoun-purple selection:text-white">
      <Navigation currentSection={currentSection} onNavigate={setCurrentSection} />
      
      <main className="transition-opacity duration-500 ease-in-out">
        {renderMainContent()}
      </main>

      <AIChat />

      <footer className="bg-black border-t border-white/10 py-12 px-4 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h3 className="font-display font-bold text-xl text-white">WANIYILO ACADEMY</h3>
            <p className="text-sm text-gray-500 mt-2">© 2026 G-CROWN Consulting. Tous droits réservés.</p>
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-vodoun-gold transition-colors">Instagram</a>
            <a href="#" className="text-gray-400 hover:text-vodoun-gold transition-colors">LinkedIn</a>
            <a href="#" className="text-gray-400 hover:text-vodoun-gold transition-colors">TikTok</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;