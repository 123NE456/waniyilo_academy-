import React, { useState, useEffect, useMemo } from 'react';
import { Brain, Code, Globe, X, ChevronRight, Sparkles, Languages, Lock, Fingerprint, Zap, Newspaper, LayoutDashboard, LogOut, Menu, Award, Phone, Construction, User, Loader2, Gift, AlertCircle, Quote, Wifi } from 'lucide-react';
import { Course, Archetype, UserProfile, NewsItem, XPNotification } from '../types';
import { Lab } from './Lab';
import { upsertProfile, addXPToRemote, checkSupabaseConnection } from '../services/supabase';

// --- CONFIGURATION ---

const QUESTIONS = [
  {
    id: 1,
    text: "Devant l'inconnu, tu es...",
    options: [
      { label: "Celui qui analyse le code.", value: 'ARCHITECTE_NUMERIQUE' },
      { label: "Celui qui cherche l'origine.", value: 'GARDIEN_DES_ARCHIVES' },
      { label: "Celui qui raconte l'histoire.", value: 'GRIOT_CYBERNETIQUE' }
    ]
  },
  {
    id: 2,
    text: "Ta force principale ?",
    options: [
      { label: "La Logique Pure.", value: 'ARCHITECTE_NUMERIQUE' },
      { label: "La Mémoire Ancestrale.", value: 'GARDIEN_DES_ARCHIVES' },
      { label: "La Communication.", value: 'GRIOT_CYBERNETIQUE' }
    ]
  },
  {
    id: 3,
    text: "Ton but ultime ?",
    options: [
      { label: "Construire des systèmes.", value: 'ARCHITECTE_NUMERIQUE' },
      { label: "Préserver le savoir.", value: 'GARDIEN_DES_ARCHIVES' },
      { label: "Unifier les peuples.", value: 'GRIOT_CYBERNETIQUE' }
    ]
  }
];

const PROVERBS = [
    "Le fleuve qui oublie sa source tarit.",
    "La patience est un chemin d'or.",
    "L'union dans le troupeau oblige le lion à se coucher avec la faim.",
    "On ne mesure pas la profondeur de l'eau avec les deux pieds.",
    "C'est au bout de la vieille corde qu'on tisse la nouvelle."
];

const COURSES: Course[] = [
    {
      id: 'c0',
      title: "J'aime Ma Langue API",
      icon: <Languages size={24} className="text-vodoun-gold" />,
      desc: "Apprentissage et traduction des langues béninoises.",
      level: "Fondamental",
      duration: "À venir", // Locked
      modules: []
    },
    {
      id: 'c1',
      title: "IA & Éthique Africaine",
      icon: <Brain size={24} className="text-vodoun-purple" />,
      desc: "Philosophie Ubuntu appliquée aux LLMs.",
      level: "Débutant",
      duration: "À venir", // Locked
      modules: []
    },
    {
      id: 'c2',
      title: "Code Créatif : Motifs",
      icon: <Code size={24} className="text-vodoun-green" />,
      desc: "Générer des motifs traditionnels avec Python.",
      level: "Intermédiaire",
      duration: "À venir", // Locked
      modules: []
    },
    {
        id: 'c3',
        title: "Ethnosciences",
        icon: <Globe size={24} className="text-vodoun-orange" />,
        desc: "La pharmacopée traditionnelle expliquée par la data.",
        level: "Tous niveaux",
        duration: "À venir", // Locked
        modules: []
      }
];

// Banque de News pour le "Tournoi d'Actu"
const ALL_NEWS_DB: NewsItem[] = [
    { id: '1', title: "Mise à jour Système", date: "Aujourd'hui", category: "Tech", excerpt: "Le module de traduction Fon-Français est en cours d'optimisation." },
    { id: '2', title: "Défi Code", date: "Demain", category: "Event", excerpt: "Hackathon 'Vodoun Algorithms' : Inscriptions bientôt ouvertes." },
    { id: '3', title: "Culture", date: "Hier", category: "Culture", excerpt: "Découverte d'un nouveau récit sur le Roi Toffa." },
    { id: '4', title: "Rappel", date: "Important", category: "Event", excerpt: "Le Labo Oracle sera en maintenance nocturne pour upgrade IA." },
    { id: '5', title: "Astuce", date: "Info", category: "Tech", excerpt: "Gagnez des WP en visitant le Labo chaque jour." },
    { id: '6', title: "Partenariat", date: "Récent", category: "Tech", excerpt: "Google Arts & Culture rejoint l'initiative Waniyilo." },
    { id: '7', title: "Vidéo", date: "À venir", category: "Culture", excerpt: "Reportage exclusif sur les Forêts Sacrées." },
    { id: '8', title: "Communauté", date: "Direct", category: "Event", excerpt: "150 nouveaux initiés ont rejoint l'Académie cette semaine." },
];

type Stage = 'LOCKED' | 'SCANNING' | 'INITIATION' | 'REGISTRATION' | 'SYNCING' | 'DASHBOARD';
type DashboardView = 'HOME' | 'LAB' | 'NEWS';

interface AcademyProps {
    initialProfile?: UserProfile | null;
    onEnterImmersive?: (profile: UserProfile) => void;
    onLogout?: () => void;
}

export const Academy: React.FC<AcademyProps> = ({ initialProfile, onEnterImmersive, onLogout }) => {
  const [stage, setStage] = useState<Stage>(initialProfile ? 'DASHBOARD' : 'LOCKED');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(initialProfile || null);
  const [xpNotifications, setXpNotifications] = useState<XPNotification[]>([]);
  
  // Registration Data (Name + Phone Only)
  const [regData, setRegData] = useState({ name: '', phone: '' }); 
  const [dbError, setDbError] = useState<string | null>(null);
  
  // Network Diagnostic
  const [networkStatus, setNetworkStatus] = useState<{ok: boolean, msg: string} | null>(null);
  
  const [currentView, setCurrentView] = useState<DashboardView>('HOME');
  const [sidebarOpen, setSidebarOpen] = useState(false); // Closed by default on mobile

  // News Rotation (Random selection on mount)
  const displayedNews = useMemo(() => {
      const shuffled = [...ALL_NEWS_DB].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 3);
  }, []); 

  // Proverb Rotation
  const dailyProverb = useMemo(() => {
      return PROVERBS[Math.floor(Math.random() * PROVERBS.length)];
  }, []);

  // Sync profile if provided (Prevents double form issue)
  useEffect(() => {
      if (initialProfile) {
          setUserProfile(initialProfile);
          setStage('DASHBOARD');
      }
  }, [initialProfile]);

  // Check connection when entering Registration stage
  useEffect(() => {
      if (stage === 'REGISTRATION') {
          checkSupabaseConnection().then(status => {
              setNetworkStatus({ ok: status.ok, msg: status.message });
          });
      }
  }, [stage]);

  // --- LOGIC ---

  const addXp = (amount: number, reason: string) => {
      if (!userProfile) return;
      
      const newXp = userProfile.xp + amount;
      
      // Update Local
      setUserProfile(prev => {
          if(!prev) return null;
          return { ...prev, xp: newXp }
      });

      // Update Remote (Supabase)
      addXPToRemote(userProfile.phone, amount);

      const notifId = Date.now();
      setXpNotifications(prev => [...prev, { id: notifId, amount, reason }]);
      setTimeout(() => setXpNotifications(prev => prev.filter(n => n.id !== notifId)), 3000);
  };

  const showLockedNotification = () => {
      const notifId = Date.now();
      setXpNotifications(prev => [...prev, { id: notifId, amount: 0, reason: " 🚧 Module en construction. Bientôt disponible." }]);
      setTimeout(() => setXpNotifications(prev => prev.filter(n => n.id !== notifId)), 3000);
  }

  const startInitiation = () => {
    setStage('SCANNING');
    setTimeout(() => setStage('INITIATION'), 2000);
  };

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(curr => curr + 1);
    } else {
      const counts = newAnswers.reduce((acc: any, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
      }, {});
      const finalArchetype = Object.entries(counts).sort((a: any, b: any) => b[1] - a[1])[0][0] as Archetype;
      
      // Temporary profile before registration
      setUserProfile({
        name: '', 
        phone: '',
        archetype: finalArchetype,
        level: 1,
        xp: 100,
        badges: ['badge_initiation'],
        joinedAt: new Date().toISOString()
      });
      setStage('REGISTRATION');
    }
  };

  const completeRegistration = async () => {
    if (!regData.name.trim() || !regData.phone.trim() || !userProfile) return;
    
    setStage('SYNCING');
    setDbError(null);

    // Auto-format phone for Benin
    let cleanPhone = regData.phone.replace(/\s/g, '');
    if (!cleanPhone.startsWith('+229')) cleanPhone = '+229' + cleanPhone;

    const finalProfile = { ...userProfile, name: regData.name, phone: cleanPhone };
    
    // Save to Supabase
    const result = await upsertProfile(finalProfile);

    if (result.success) {
        // Save local session for auto-login
        localStorage.setItem('waniyilo_user_phone', cleanPhone);

        setUserProfile(finalProfile);
        setStage('DASHBOARD');
        
        // Pass to App to persist state
        if (onEnterImmersive) {
            onEnterImmersive(finalProfile);
        }
    } else {
        // Affichage de l'erreur
        setDbError(result.error || "Erreur de connexion aux archives.");
        setStage('REGISTRATION');
    }
  };

  const handleLogoutLocal = () => {
      localStorage.removeItem('waniyilo_user_phone');
      setStage('LOCKED');
      setRegData({ name: '', phone: '' });
      setCurrentQuestion(0);
      setAnswers([]);
      setSidebarOpen(false);
      if (onLogout) onLogout();
  };

  const getArchetypeLabel = (arch: Archetype) => {
    switch(arch) {
        case 'ARCHITECTE_NUMERIQUE': return 'ARCHITECTE NUMÉRIQUE';
        case 'GARDIEN_DES_ARCHIVES': return 'GARDIEN DES ARCHIVES';
        case 'GRIOT_CYBERNETIQUE': return 'GRIOT CYBERNÉTIQUE';
        default: return 'INITIÉ';
    }
  };

  const closeSidebarMobile = () => setSidebarOpen(false);

  // --- RENDERERS ---

  if (stage === 'LOCKED' || stage === 'SCANNING') {
    return (
      <div className="h-full min-h-[500px] flex items-center justify-center bg-cyber-black relative overflow-hidden py-20">
        <div className="absolute inset-0 pattern-grid opacity-10"></div>
        <div className="text-center p-8 max-w-2xl relative z-10">
          <div className="mb-8 inline-block relative cursor-pointer group" onClick={startInitiation}>
             <div className="w-32 h-32 rounded-full border border-vodoun-red/30 flex items-center justify-center transition-all group-hover:border-vodoun-red hover:shadow-[0_0_30px_rgba(220,38,38,0.3)] bg-black/50 backdrop-blur-sm">
                {stage === 'SCANNING' ? (
                    <Fingerprint size={48} className="text-vodoun-red animate-pulse" />
                ) : (
                    <Lock size={48} className="text-gray-400 group-hover:text-white transition-colors" />
                )}
             </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-4">ESPACE <span className="text-vodoun-red">INITIÉ</span></h1>
          <p className="text-gray-400 text-lg mb-8">Passez le rituel pour accéder à votre espace personnel.</p>
          {stage === 'LOCKED' && (
            <button onClick={startInitiation} className="px-8 py-3 bg-white/5 border border-vodoun-red hover:bg-vodoun-red/20 text-white font-tech font-bold uppercase rounded transition-all shadow-[0_0_15px_rgba(220,38,38,0.2)]">
              COMMENCER LE RITUEL
            </button>
          )}
        </div>
      </div>
    );
  }

  if (stage === 'INITIATION') {
    return (
        <div className="h-full min-h-[500px] flex items-center justify-center bg-cyber-black py-20">
        <div className="w-full max-w-2xl px-4">
           {/* Progress Bar */}
           <div className="w-full h-1 bg-gray-800 rounded-full mb-8 overflow-hidden">
             <div 
               className="h-full bg-vodoun-gold transition-all duration-500" 
               style={{ width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%` }}
             ></div>
           </div>
           
           <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4">
             <span className="text-vodoun-gold font-mono text-xs uppercase tracking-widest">Rituel {currentQuestion + 1} / {QUESTIONS.length}</span>
             <h2 className="text-2xl md:text-3xl font-display text-white mt-4">{QUESTIONS[currentQuestion].text}</h2>
           </div>
           <div className="space-y-4">
             {QUESTIONS[currentQuestion].options.map((opt, idx) => (
                <button key={idx} onClick={() => handleAnswer(opt.value)} className="w-full p-6 text-left glass-panel border border-white/10 hover:border-vodoun-purple hover:bg-vodoun-purple/10 rounded-xl transition-all group flex items-center justify-between hover:scale-[1.02]">
                  <span className="text-gray-300 group-hover:text-white font-tech text-lg">{opt.label}</span>
                  <ChevronRight className="text-gray-600 group-hover:text-vodoun-purple opacity-0 group-hover:opacity-100 transition-all" />
                </button>
             ))}
           </div>
        </div>
      </div>
    );
  }

  if (stage === 'REGISTRATION' || stage === 'SYNCING') {
    return (
        <div className="h-full min-h-[500px] flex items-center justify-center bg-cyber-black py-20 px-4">
        <div className="glass-panel p-8 md:p-12 rounded-2xl border border-vodoun-gold/30 max-w-lg w-full text-center relative z-20 animate-in zoom-in-95 duration-500">
           
           {/* DIAGNOSTIC RESEAU */}
           {networkStatus && (
               <div className={`absolute top-4 left-0 right-0 mx-auto w-fit px-3 py-1 rounded-full text-[10px] font-mono border flex items-center gap-2 ${networkStatus.ok ? 'bg-green-900/30 border-green-500 text-green-400' : 'bg-red-900/30 border-red-500 text-red-400'}`}>
                   <Wifi size={10} /> {networkStatus.ok ? 'SYSTÈME OPÉRATIONNEL' : 'ERREUR CONNEXION TABLE'}
               </div>
           )}

           <Sparkles className="text-vodoun-gold mx-auto mb-6 mt-4 animate-spin-slow" size={40} />
           <h2 className="text-xl md:text-2xl font-display font-bold text-white mb-2">ARCHÉTYPE : {getArchetypeLabel(userProfile?.archetype || null)}</h2>
           <p className="text-gray-400 text-sm mb-8">Validez votre identité pour accéder au Terminal.</p>
           
           <div className="space-y-4 mb-6 text-left">
               {dbError && (
                   <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-lg text-red-200 text-xs flex items-center gap-2 animate-pulse">
                       <AlertCircle size={14} /> {dbError}
                   </div>
               )}
               {networkStatus && !networkStatus.ok && (
                   <div className="p-3 bg-yellow-900/20 border border-yellow-500/50 rounded-lg text-yellow-200 text-xs flex items-center gap-2">
                       <AlertCircle size={14} /> {networkStatus.msg}
                   </div>
               )}

               <div>
                   <label className="text-xs text-gray-500 uppercase ml-1 font-mono">Nom Complet</label>
                   <div className="relative group">
                        <User size={16} className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-vodoun-gold transition-colors" />
                        <input 
                            type="text" value={regData.name} onChange={(e) => setRegData({...regData, name: e.target.value})}
                            className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 pl-10 text-white focus:border-vodoun-gold focus:outline-none transition-colors"
                            placeholder="Votre nom"
                            disabled={stage === 'SYNCING'}
                        />
                   </div>
               </div>
               <div>
                   <label className="text-xs text-gray-500 uppercase ml-1 font-mono">Téléphone (Bénin)</label>
                   <div className="relative group">
                        <Phone size={16} className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-vodoun-gold transition-colors" />
                        <input 
                            type="tel" 
                            placeholder="+229..."
                            value={regData.phone} 
                            onChange={(e) => setRegData({...regData, phone: e.target.value})}
                            className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 pl-10 text-white focus:border-vodoun-gold focus:outline-none transition-colors"
                            disabled={stage === 'SYNCING'}
                        />
                   </div>
               </div>
           </div>

           <button onClick={completeRegistration} disabled={!regData.name.trim() || !regData.phone.trim() || stage === 'SYNCING'} className="w-full py-4 bg-vodoun-gold hover:bg-vodoun-gold/80 text-black font-bold font-tech uppercase rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
             {stage === 'SYNCING' ? <Loader2 className="animate-spin" size={20} /> : null}
             {stage === 'SYNCING' ? 'CONNEXION SÉCURISÉE...' : 'CONFIRMER L\'ACCÈS'}
           </button>
        </div>
      </div>
    );
  }

  // --- DASHBOARD CONTENT ---

  const renderDashboardContent = () => {
      switch(currentView) {
          case 'LAB':
              return (
                  <div className="animate-in fade-in duration-500 h-full flex flex-col">
                      <div className="mb-4 flex items-center justify-between shrink-0">
                          <h2 className="text-xl md:text-2xl font-display font-bold text-white flex items-center gap-2">
                              <Zap className="text-vodoun-green" /> LABO ORACLE
                          </h2>
                          <button onClick={() => setCurrentView('HOME')} className="text-sm text-gray-400 hover:text-white flex items-center gap-1"><X size={16}/> Fermer</button>
                      </div>
                      <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40 flex-1 relative min-h-0">
                          <div className="absolute inset-0 overflow-y-auto">
                             <Lab /> 
                          </div>
                      </div>
                  </div>
              );
          case 'NEWS':
              return (
                <div className="animate-in fade-in duration-500 max-w-4xl mx-auto mt-4 md:mt-8">
                    <div className="mb-6 flex items-center justify-between">
                          <h2 className="text-xl md:text-2xl font-display font-bold text-white flex items-center gap-2">
                              <Newspaper className="text-vodoun-orange" /> ACTUALITÉS & TOURNOIS
                          </h2>
                          <button onClick={() => setCurrentView('HOME')} className="text-sm text-gray-400 hover:text-white flex items-center gap-1"><X size={16}/> Fermer</button>
                      </div>
                    <div className="grid gap-4">
                        {displayedNews.map(news => (
                            <div key={news.id} className="p-4 md:p-6 glass-panel border border-white/10 rounded-xl hover:border-vodoun-orange/50 transition-colors group">
                                <div className="flex justify-between mb-2">
                                    <span className="text-[10px] md:text-xs text-vodoun-orange font-mono border border-vodoun-orange/30 px-2 rounded">{news.category}</span>
                                    <span className="text-[10px] md:text-xs text-gray-500">{news.date}</span>
                                </div>
                                <h3 className="text-lg md:text-xl font-bold text-white mb-2 group-hover:text-vodoun-orange transition-colors">{news.title}</h3>
                                <p className="text-sm text-gray-400">{news.excerpt}</p>
                            </div>
                        ))}
                    </div>
                </div>
              );

          default: // HOME
            return (
                <div className="animate-in slide-in-from-bottom-4 duration-500 mt-4 md:mt-8 max-w-6xl mx-auto pb-24">
                    {/* Welcome Banner & Stats */}
                    <div className="mb-8 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-vodoun-purple/20 via-black to-black border border-white/10 relative overflow-hidden shadow-2xl">
                        {/* Banner Background */}
                        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        
                        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
                            <div className="flex-1">
                                <h1 className="text-2xl md:text-4xl font-display font-bold text-white mb-2">
                                    Bienvenue, {userProfile?.name}
                                </h1>
                                <p className="text-vodoun-gold font-mono text-xs md:text-sm mb-4 uppercase tracking-wider">{getArchetypeLabel(userProfile?.archetype || null)}</p>
                                <div className="flex gap-2">
                                     <span className="inline-flex items-center gap-1 px-2 py-1 bg-vodoun-purple/20 border border-vodoun-purple/50 rounded text-xs text-vodoun-purple">
                                         <Award size={12} /> Initié
                                     </span>
                                     <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-gray-400">
                                         <Phone size={12} /> {userProfile?.phone}
                                     </span>
                                </div>
                                
                                {/* Daily Proverb Widget */}
                                <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10 flex gap-3 max-w-lg">
                                    <Quote className="text-vodoun-gold shrink-0 opacity-50" size={16} />
                                    <p className="text-sm text-gray-300 italic">"{dailyProverb}"</p>
                                </div>
                            </div>
                            
                            {/* Stats Box */}
                            <div className="w-full md:w-auto flex flex-col gap-3">
                                <div className="bg-black/50 border border-white/10 p-4 rounded-xl flex items-center gap-6">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] text-gray-500 uppercase font-mono">Niveau</span>
                                        <span className="text-2xl font-bold text-white font-display">01</span>
                                    </div>
                                    <div className="h-8 w-px bg-white/10"></div>
                                    <div className="flex flex-col w-32">
                                        <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                                            <span>WP (Points)</span>
                                            <span>{userProfile?.xp} / 500</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-vodoun-purple to-vodoun-gold transition-all duration-1000"
                                                style={{ width: `${Math.min(100, ((userProfile?.xp || 0) / 500) * 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => addXp(50, 'Bonus Quotidien')} className="w-full px-4 py-2 bg-vodoun-gold/10 hover:bg-vodoun-gold/20 border border-vodoun-gold/30 text-vodoun-gold text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors">
                                    <Gift size={14} /> Bonus Quotidien
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Access Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                        <div onClick={() => { addXp(5, 'Exploration Labo'); setCurrentView('LAB'); }} className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-vodoun-green/50 cursor-pointer group transition-all hover:-translate-y-1">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-vodoun-green/10 flex items-center justify-center mb-4 group-hover:bg-vodoun-green/20 transition-colors">
                                <Zap className="text-vodoun-green" size={20} />
                            </div>
                            <h3 className="text-base md:text-lg font-bold text-white mb-1 group-hover:text-vodoun-green transition-colors">Labo Oracle</h3>
                            <p className="text-xs md:text-sm text-gray-500">Gagne des WP en consultant l'IA.</p>
                        </div>

                        <div onClick={() => setCurrentView('NEWS')} className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-vodoun-orange/50 cursor-pointer group transition-all hover:-translate-y-1">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-vodoun-orange/10 flex items-center justify-center mb-4 group-hover:bg-vodoun-orange/20 transition-colors">
                                <Newspaper className="text-vodoun-orange" size={20} />
                            </div>
                            <h3 className="text-base md:text-lg font-bold text-white mb-1 group-hover:text-vodoun-orange transition-colors">Actu & Défis</h3>
                            <p className="text-xs md:text-sm text-gray-500">3 nouvelles opportunités.</p>
                        </div>

                         <div onClick={showLockedNotification} className="glass-panel p-6 rounded-2xl border border-vodoun-gold/30 hover:border-vodoun-gold cursor-pointer group transition-all hover:-translate-y-1 bg-gradient-to-br from-vodoun-gold/5 to-transparent relative overflow-hidden">
                             <div className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded text-[10px] text-gray-400 border border-white/10 flex items-center gap-1">
                                 <Construction size={10} /> À venir
                             </div>
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-vodoun-gold/10 flex items-center justify-center mb-4 group-hover:bg-vodoun-gold/20 transition-colors">
                                <Languages className="text-vodoun-gold" size={20} />
                            </div>
                            <h3 className="text-base md:text-lg font-bold text-white mb-1 group-hover:text-vodoun-gold transition-colors">J'aime Ma Langue</h3>
                            <p className="text-xs md:text-sm text-gray-500">Module Linguistique</p>
                        </div>
                    </div>

                    {/* All Courses Grid (LOCKED) */}
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm md:text-base border-b border-white/10 pb-2"><LayoutDashboard size={18}/> PROGRAMME ACADÉMIQUE (Accès Restreint)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 opacity-80">
                        {COURSES.slice(1).map(course => (
                            <div key={course.id} onClick={showLockedNotification} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-vodoun-red/30 cursor-pointer transition-colors flex items-center gap-4 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                                    <span className="text-xs font-bold text-vodoun-gold flex items-center gap-1 bg-black/80 px-3 py-1 rounded-full border border-vodoun-gold/30 shadow-lg transform scale-90 group-hover:scale-100 transition-transform"><Construction size={12}/> MODULE EN TRAVAUX</span>
                                </div>
                                <div className="p-3 bg-black rounded-lg text-gray-400 shrink-0 border border-white/5">{course.icon}</div>
                                <div>
                                    <h4 className="font-bold text-gray-200 text-sm md:text-base group-hover:text-white transition-colors">{course.title}</h4>
                                    <span className="text-xs text-gray-500 flex items-center gap-1 mt-1"><Lock size={10}/> Bientôt disponible</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
      }
  };

  return (
    <div className="h-full w-full bg-cyber-black text-white font-sans overflow-hidden flex relative">
        {/* XP TOAST NOTIFICATIONS */}
        <div className="fixed top-24 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
            {xpNotifications.map(notif => (
                <div key={notif.id} className="bg-black/90 border border-vodoun-gold text-vodoun-gold px-4 py-3 rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-in slide-in-from-right fade-in flex items-center gap-3 backdrop-blur-md">
                    <Sparkles className="animate-spin-slow" size={20} />
                    <div>
                        <span className="font-bold block">{notif.amount > 0 ? `+${notif.amount} WP` : 'INFO'}</span>
                        <span className="text-xs text-gray-400">{notif.reason}</span>
                    </div>
                </div>
            ))}
        </div>

        {/* Backdrop for Mobile Sidebar */}
        {sidebarOpen && (
            <div className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
        )}

        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 w-64 bg-black/95 border-r border-white/10 p-4 transition-transform z-50 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 overflow-y-auto`}>
            <div className="mb-8 px-2 flex items-center gap-2 pt-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-vodoun-purple to-black border border-white/10 flex items-center justify-center font-display font-bold shadow-lg">W</div>
                <span className="text-lg font-display font-bold text-white tracking-widest">ESPACE PERSO</span>
            </div>
            
            <nav className="space-y-2 flex-1">
                <button onClick={() => { setCurrentView('HOME'); closeSidebarMobile(); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentView === 'HOME' ? 'bg-vodoun-purple/20 text-vodoun-gold border border-vodoun-purple/20' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                    <LayoutDashboard size={18} /> Tableau de Bord
                </button>
                <button onClick={() => { addXp(0, 'Consultation'); setCurrentView('LAB'); closeSidebarMobile(); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentView === 'LAB' ? 'bg-vodoun-purple/20 text-vodoun-gold border border-vodoun-purple/20' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                    <Zap size={18} /> Labo Oracle
                </button>
                <button onClick={() => { setCurrentView('NEWS'); closeSidebarMobile(); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentView === 'NEWS' ? 'bg-vodoun-purple/20 text-vodoun-gold border border-vodoun-purple/20' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                    <Newspaper size={18} /> Actualités
                </button>
            </nav>

            <div className="pt-8 border-t border-white/10 mt-auto">
                <button onClick={handleLogoutLocal} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/10 hover:text-red-300 transition-colors">
                    <LogOut size={18} /> Déconnexion
                </button>
            </div>
        </div>

        {/* Mobile Toggle */}
        <button 
            className="md:hidden absolute top-4 left-4 z-[60] p-2 bg-black/80 rounded-full border border-white/20 backdrop-blur-md text-white shadow-lg"
            onClick={() => setSidebarOpen(!sidebarOpen)}
        >
            <Menu size={20} />
        </button>

        {/* Main Content Area */}
        <div className="flex-1 bg-cyber-gray overflow-y-auto relative w-full pt-16 md:pt-6 px-4 md:px-6 h-full pb-24">
            <div className="fixed inset-0 pattern-grid opacity-5 pointer-events-none"></div>
            <div className="relative z-10 max-w-6xl mx-auto h-full">
                {renderDashboardContent()}
            </div>
        </div>
    </div>
  );
};