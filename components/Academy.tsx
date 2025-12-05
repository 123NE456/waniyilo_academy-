
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Brain, Code, Globe, X, ChevronRight, Sparkles, Languages, Lock, Fingerprint, Zap, Newspaper, LayoutDashboard, LogOut, Menu, Award, Phone, Construction, User, Loader2, Gift, AlertCircle, Quote, Wifi, CheckCircle, Volume2, Trophy, Music, ShieldCheck, ArrowLeft, MessageCircle, Send, Hash } from 'lucide-react';
import { Course, Archetype, UserProfile, NewsItem, XPNotification, LeaderboardEntry, NexusMessage, VocabularyItem } from '../types';
import { Lab } from './Lab';
import { upsertProfile, addXPToRemote, checkSupabaseConnection, getLeaderboard, fetchNews, fetchCourses, fetchRecentMessages, sendMessageToNexus, subscribeToNexus, fetchVocabulary } from '../services/supabase';

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

// FALLBACK DATA (Au cas où la DB est vide ou inaccessible)
const FALLBACK_VOCABULARY: VocabularyItem[] = [
    { id: 1, level: 1, fr: "Ordinateur", fon: "Wémá mɔ", options: ["Wémá mɔ", "Gbedjé", "Zòkèké"] },
    { id: 2, level: 1, fr: "Internet", fon: "Kan mɛ", options: ["Agbaza", "Kan mɛ", "Yɛhwe"] },
    { id: 3, level: 1, fr: "Savoir", fon: "Nunyɔ", options: ["Akkwɛ", "Nunyɔ", "Alɔ"] },
    { id: 4, level: 1, fr: "Demain", fon: "Sɔ", options: ["Sɔ", "Egbe", "Zan"] }
];

const FALLBACK_COURSES: Course[] = [
    {
      id: 'c0',
      title: "J'aime Ma Langue",
      icon: <Languages size={24} className="text-vodoun-gold" />,
      desc: "Apprentissage interactif Fongbé & Tech.",
      level: "Niveau 1",
      duration: "Module Actif", 
      modules: ["Vocabulaire Tech", "Prononciation", "Grammaire"]
    }
];

const FALLBACK_NEWS: NewsItem[] = [
    { id: '1', title: "Connexion aux Archives...", date: "...", category: "Tech", excerpt: "Chargement du flux d'actualités en cours." },
];

type Stage = 'LOCKED' | 'SCANNING' | 'INITIATION' | 'REGISTRATION' | 'SYNCING' | 'DASHBOARD';
type DashboardView = 'HOME' | 'LAB' | 'NEWS' | 'LEARNING_LANGUE' | 'LEADERBOARD' | 'NEXUS';

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

  // Dynamic Data State
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [vocabularyList, setVocabularyList] = useState<VocabularyItem[]>([]);
  const [isLoadingContent, setIsLoadingContent] = useState(true);

  // NEXUS CHAT STATE
  const [nexusMessages, setNexusMessages] = useState<NexusMessage[]>([]);
  const [nexusInput, setNexusInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // GAME STATE
  const [gameIndex, setGameIndex] = useState(0);
  const [gameScore, setGameScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);

  // Proverb Rotation
  const dailyProverb = useMemo(() => {
      return PROVERBS[Math.floor(Math.random() * PROVERBS.length)];
  }, []);

  // Icon Helper for Dynamic Courses
  const getIcon = (name?: string) => {
      switch(name) {
          case 'Languages': return <Languages size={24} className="text-vodoun-gold" />;
          case 'Brain': return <Brain size={24} className="text-vodoun-purple" />;
          case 'Code': return <Code size={24} className="text-vodoun-green" />;
          case 'Globe': return <Globe size={24} className="text-vodoun-orange" />;
          default: return <Sparkles size={24} className="text-gray-400" />;
      }
  };

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

  // Load Content (News & Courses) on Mount or Login
  useEffect(() => {
      if (stage === 'DASHBOARD') {
          setIsLoadingContent(true);
          Promise.all([fetchNews(), fetchCourses()]).then(([fetchedNews, fetchedCourses]) => {
              setNewsList(fetchedNews.length > 0 ? fetchedNews : FALLBACK_NEWS);
              setCoursesList(fetchedCourses.length > 0 ? fetchedCourses : FALLBACK_COURSES);
              setIsLoadingContent(false);
          });
      }
  }, [stage]);

  // Load Specific Content based on View
  useEffect(() => {
      if (currentView === 'LEADERBOARD') {
          setLoadingLeaderboard(true);
          getLeaderboard().then(data => {
              setLeaderboard(data);
              setLoadingLeaderboard(false);
          });
      }
      
      if (currentView === 'LEARNING_LANGUE') {
          fetchVocabulary(1).then(data => {
              setVocabularyList(data.length > 0 ? data : FALLBACK_VOCABULARY);
          });
      }
  }, [currentView]);

  // NEXUS LOGIC
  useEffect(() => {
      if (currentView === 'NEXUS') {
          // 1. Fetch history
          fetchRecentMessages().then(msgs => setNexusMessages(msgs));
          
          // 2. Subscribe to realtime
          const subscription = subscribeToNexus((newMsg) => {
              setNexusMessages(prev => [...prev, newMsg]);
              playSound('success'); // Petit bip à la réception
          });

          return () => {
              subscription.unsubscribe();
          };
      }
  }, [currentView]);

  useEffect(() => {
      // Scroll to bottom when messages change in Nexus
      if (currentView === 'NEXUS' && messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
  }, [nexusMessages, currentView]);

  const handleSendMessage = async () => {
      if (!nexusInput.trim() || !userProfile) return;
      
      const content = nexusInput.trim();
      setNexusInput(''); // Optimistic clear

      // Sound feedback
      playSound('success');

      // Send to backend
      await sendMessageToNexus(userProfile.name, userProfile.phone, userProfile.archetype || '', content);
  };


  // --- AUDIO LOGIC ---
  const playSound = (type: 'success' | 'error') => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        if (type === 'success') {
          // Bip futuriste montant
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
          gain.gain.setValueAtTime(0.05, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
          osc.start();
          osc.stop(ctx.currentTime + 0.1);
        } else {
          // Buzz erreur
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(150, ctx.currentTime);
          gain.gain.setValueAtTime(0.05, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
          osc.start();
          osc.stop(ctx.currentTime + 0.2);
        }
    } catch (e) {
        console.error("Audio not supported");
    }
  };

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

  const getAvatarInitials = (name: string) => {
      return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const handleGameAnswer = (selected: string) => {
      const currentWord = vocabularyList[gameIndex];
      const correct = currentWord.fon === selected;
      
      if (correct) {
          setGameScore(prev => prev + 1);
          addXp(10, "Bonne réponse !");
          playSound('success');
      } else {
          addXp(0, "Oups, essaie encore.");
          playSound('error');
      }

      if (gameIndex < vocabularyList.length - 1) {
          setGameIndex(prev => prev + 1);
      } else {
          setGameFinished(true);
          addXp(50, "Niveau Terminé !");
          playSound('success');
      }
  };

  const resetGame = () => {
      setGameIndex(0);
      setGameScore(0);
      setGameFinished(false);
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
                <button key={idx} onClick={() => handleAnswer(opt.value)} className="w-full p-6 text-left glass-panel border border-white/10 hover:border-vodoun-purple hover:bg-vodoun-purple/10 rounded-xl transition-all group">
                  <div className="flex justify-between items-center">
                    <span className="text-lg text-gray-200 group-hover:text-white">{opt.label}</span>
                    <ChevronRight className="text-gray-600 group-hover:text-vodoun-purple transition-colors" />
                  </div>
                </button>
             ))}
           </div>
        </div>
      </div>
    );
  }

  if (stage === 'REGISTRATION' || stage === 'SYNCING') {
      return (
        <div className="h-full min-h-[500px] flex items-center justify-center bg-cyber-black py-20 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-vodoun-purple/10 to-transparent pointer-events-none"></div>
            <div className="w-full max-w-md px-4 relative z-10">
                
                {/* Network Status Badge */}
                {networkStatus && (
                    <div className={`absolute -top-16 left-0 right-0 mx-auto w-fit px-3 py-1 rounded-full text-[10px] font-mono border flex items-center gap-2 ${
                        networkStatus.ok 
                        ? 'bg-vodoun-green/10 border-vodoun-green text-vodoun-green' 
                        : 'bg-vodoun-red/10 border-vodoun-red text-vodoun-red'
                    }`}>
                        <Wifi size={12} />
                        {networkStatus.ok ? "SYSTÈME: OPÉRATIONNEL" : "SYSTÈME: HORS LIGNE"}
                    </div>
                )}

                <div className="text-center mb-8">
                    <div className="inline-block p-4 rounded-full bg-vodoun-purple/20 border border-vodoun-purple mb-4">
                        <User size={32} className="text-vodoun-purple" />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-white">GRAVER VOTRE NOM</h2>
                    <p className="text-gray-400 text-sm mt-2">Dernière étape avant l'accès au temple numérique.</p>
                </div>

                <div className="glass-panel p-8 rounded-2xl border border-white/10 space-y-4">
                    {dbError && (
                        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded text-red-200 text-xs flex items-center gap-2">
                            <AlertCircle size={14} />
                            <span>{dbError}</span>
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase font-mono">Nom Complet</label>
                        <input 
                            value={regData.name} 
                            onChange={(e) => setRegData({...regData, name: e.target.value})}
                            className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white focus:border-vodoun-purple focus:outline-none transition-colors"
                            placeholder="Ex: Koffi Mensah"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase font-mono">Téléphone</label>
                        <input 
                            value={regData.phone} 
                            onChange={(e) => setRegData({...regData, phone: e.target.value})}
                            className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white focus:border-vodoun-purple focus:outline-none transition-colors"
                            placeholder="+229..."
                        />
                    </div>
                    <button 
                        onClick={completeRegistration}
                        disabled={stage === 'SYNCING'}
                        className="w-full py-4 mt-4 bg-vodoun-purple hover:bg-vodoun-purple/80 text-white font-bold font-tech uppercase rounded transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {stage === 'SYNCING' ? <Loader2 className="animate-spin" /> : 'ENTRER DANS LA MATRICE'}
                    </button>
                </div>
            </div>
        </div>
      );
  }

  // --- DASHBOARD VIEW ---

  if (stage === 'DASHBOARD' && userProfile) {
      return (
        <div className="h-full bg-cyber-black flex overflow-hidden relative pt-16 md:pt-0">
          
          {/* XP Notifications (Toast) */}
          <div className="absolute top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none">
             {xpNotifications.map(notif => (
                 <div key={notif.id} className="animate-in slide-in-from-right fade-in duration-300 flex items-center gap-3 bg-black/80 backdrop-blur border border-vodoun-gold/50 px-4 py-3 rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                     <span className="text-vodoun-gold font-bold font-display text-xl">+{notif.amount} WP</span>
                     <span className="text-gray-300 text-sm border-l border-gray-700 pl-3">{notif.reason}</span>
                 </div>
             ))}
          </div>

          {/* Mobile Menu Backdrop */}
          {sidebarOpen && (
              <div className="fixed inset-0 bg-black/80 z-20 md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
          )}

          {/* Sidebar */}
          <div className={`w-64 bg-black/90 border-r border-white/5 flex flex-col fixed md:relative z-30 h-full transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
             <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-gradient-to-br from-vodoun-purple to-black border border-white/10 flex items-center justify-center">
                        <span className="font-display font-bold text-white">W</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">WANIYILO</h3>
                        <p className="text-[10px] text-gray-500 font-mono">DASHBOARD v2.1</p>
                    </div>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400">
                    <X size={20} />
                </button>
             </div>

             <div className="p-6 border-b border-white/5">
                 <div className="flex items-center gap-3 mb-2">
                     <div className="flex-1">
                         <div className="flex justify-between text-xs mb-1">
                             <span className="text-gray-400">Niveau {userProfile.level}</span>
                             <span className="text-vodoun-gold font-bold">{userProfile.xp} WP</span>
                         </div>
                         <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                             <div className="h-full bg-vodoun-gold" style={{ width: `${(userProfile.xp % 100)}%` }}></div>
                         </div>
                     </div>
                 </div>
                 <p className="text-[10px] text-gray-500 text-center font-mono">{userProfile.badges.length} Badges Débloqués</p>
             </div>

             <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                 <button onClick={() => { setCurrentView('HOME'); closeSidebarMobile(); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentView === 'HOME' ? 'bg-vodoun-purple/20 text-vodoun-purple border border-vodoun-purple/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                     <LayoutDashboard size={18} /> Tableau de Bord
                 </button>
                 <button onClick={() => { setCurrentView('LAB'); closeSidebarMobile(); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentView === 'LAB' ? 'bg-vodoun-green/20 text-vodoun-green border border-vodoun-green/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                     <Zap size={18} /> Labo Oracle
                 </button>
                 <button onClick={() => { setCurrentView('NEWS'); closeSidebarMobile(); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentView === 'NEWS' ? 'bg-vodoun-orange/20 text-vodoun-orange border border-vodoun-orange/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                     <Newspaper size={18} /> Tournoi d'Actu
                 </button>
                 <button onClick={() => { setCurrentView('LEADERBOARD'); closeSidebarMobile(); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentView === 'LEADERBOARD' ? 'bg-vodoun-gold/20 text-vodoun-gold border border-vodoun-gold/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                     <Trophy size={18} /> Panthéon
                 </button>
                 <button onClick={() => { setCurrentView('NEXUS'); closeSidebarMobile(); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentView === 'NEXUS' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                     <MessageCircle size={18} /> Nexus
                 </button>
             </nav>

             <div className="p-4 border-t border-white/5">
                 <button onClick={handleLogoutLocal} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-900/10 rounded-lg text-sm transition-colors">
                     <LogOut size={18} /> Déconnexion
                 </button>
             </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 relative pt-20 md:pt-8 pb-32 md:pb-8">
              
              {/* Top Bar */}
              <div className="flex justify-between items-center mb-8">
                 <div>
                    <h2 className="text-2xl font-display font-bold text-white uppercase">{getArchetypeLabel(userProfile.archetype)}</h2>
                    <div className="flex items-center gap-3 mt-1">
                        <p className="text-gray-400 text-sm">Matricule: {userProfile.phone}</p>
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-vodoun-green/10 border border-vodoun-green/30 shadow-[0_0_10px_rgba(5,150,105,0.2)]" title="Protection Anti-Triche Active">
                            <ShieldCheck size={12} className="text-vodoun-green" />
                            <span className="text-[10px] text-vodoun-green font-mono font-bold tracking-widest">SÉCURISÉ</span>
                        </div>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <button onClick={() => addXp(5, "Bonus Quotidien")} className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-vodoun-gold hover:bg-white/10 transition-colors">
                        <Gift size={14} /> Bonus
                    </button>
                    <div className="md:hidden">
                        <button onClick={() => setSidebarOpen(true)}>
                            <Menu size={24} className="text-vodoun-gold" />
                        </button>
                    </div>
                 </div>
              </div>

              {/* Views */}
              {currentView === 'HOME' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                      
                      {/* Wisdom Widget */}
                      <div className="p-6 rounded-xl bg-gradient-to-r from-vodoun-purple/20 to-transparent border-l-4 border-vodoun-purple relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-10">
                              <Quote size={64} className="text-white" />
                          </div>
                          <h3 className="text-xs font-bold text-vodoun-purple uppercase tracking-widest mb-2">Sagesse du Jour</h3>
                          <p className="text-lg md:text-xl text-white font-serif italic">"{dailyProverb}"</p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Modules Dynamiques */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Construction size={18} className="text-vodoun-gold" /> Modules de Formation
                            </h3>
                            
                            {isLoadingContent ? (
                                // Loading Skeletons
                                [1, 2, 3].map(i => (
                                    <div key={i} className="glass-panel p-4 rounded-xl border border-white/5 h-24 animate-pulse flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/5 rounded-lg"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-white/5 rounded w-3/4"></div>
                                            <div className="h-3 bg-white/5 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                coursesList.map((course) => (
                                    <div key={course.id} className="glass-panel p-4 rounded-xl border border-white/5 hover:border-vodoun-gold/30 transition-all group">
                                        <div className="flex items-start justify-between">
                                            <div className="flex gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-black/50 flex items-center justify-center border border-white/10 group-hover:border-vodoun-gold/50 transition-colors">
                                                    {course.icon || getIcon(course.iconName)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-200 group-hover:text-white">{course.title}</h4>
                                                    <p className="text-sm text-gray-500 mb-2">{course.desc}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] px-2 py-0.5 bg-white/5 rounded text-gray-400">{course.level}</span>
                                                        {course.duration === "Module Actif" ? (
                                                            <span className="text-[10px] px-2 py-0.5 bg-vodoun-green/20 text-vodoun-green rounded animate-pulse">Disponible</span>
                                                        ) : (
                                                            <span className="text-[10px] px-2 py-0.5 bg-white/5 text-gray-600 rounded">Bientôt</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {course.duration === "Module Actif" ? (
                                                <button 
                                                    onClick={() => setCurrentView('LEARNING_LANGUE')}
                                                    className="p-2 rounded-full bg-vodoun-gold/10 text-vodoun-gold hover:bg-vodoun-gold/20 transition-colors"
                                                >
                                                    <ChevronRight size={20} />
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={showLockedNotification}
                                                    className="p-2 rounded-full bg-white/5 text-gray-600 hover:text-gray-400 transition-colors"
                                                >
                                                    <Lock size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Recent News Widget */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Newspaper size={18} className="text-vodoun-orange" /> Flash Info
                            </h3>
                            <div className="glass-panel rounded-xl border border-white/5 overflow-hidden">
                                {isLoadingContent ? (
                                     <div className="p-6 text-center text-gray-500 flex items-center justify-center gap-2">
                                         <Loader2 className="animate-spin" size={16}/> Chargement des données...
                                     </div>
                                ) : (
                                    newsList.slice(0, 3).map((news, i) => (
                                        <div key={i} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-default">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-[10px] text-vodoun-orange font-mono">{news.category}</span>
                                                <span className="text-[10px] text-gray-500">{news.date}</span>
                                            </div>
                                            <p className="text-sm text-gray-300 font-medium line-clamp-1">{news.title}</p>
                                        </div>
                                    ))
                                )}
                                <button onClick={() => setCurrentView('NEWS')} className="w-full py-3 text-center text-xs text-gray-400 hover:text-white transition-colors bg-white/5">
                                    Voir tout le flux
                                </button>
                            </div>
                        </div>
                      </div>
                  </div>
              )}

              {currentView === 'LAB' && (
                  <div className="animate-in zoom-in-95 duration-300">
                      <Lab />
                  </div>
              )}

              {currentView === 'NEWS' && (
                   <div className="animate-in slide-in-from-right-4">
                       <h2 className="text-3xl font-display font-bold text-white mb-6">Flux d'Actualités <span className="text-vodoun-orange">Live</span></h2>
                       {isLoadingContent ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="animate-spin text-vodoun-orange" size={32} />
                            </div>
                       ) : (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               {newsList.map((news) => (
                                   <div key={news.id} className="p-6 glass-panel border border-white/10 rounded-xl hover:border-vodoun-orange/30 transition-all">
                                       <div className="flex justify-between items-start mb-4">
                                           <span className="px-2 py-1 bg-vodoun-orange/10 text-vodoun-orange text-xs rounded font-bold">{news.category}</span>
                                           <span className="text-xs text-gray-500">{news.date}</span>
                                       </div>
                                       <h3 className="text-xl font-bold text-white mb-2">{news.title}</h3>
                                       <p className="text-gray-400 text-sm">{news.excerpt}</p>
                                   </div>
                               ))}
                           </div>
                       )}
                   </div>
              )}

              {currentView === 'LEARNING_LANGUE' && (
                  <div className="animate-in slide-in-from-bottom-8">
                      <button onClick={() => setCurrentView('HOME')} className="mb-6 text-sm text-gray-400 hover:text-white flex items-center gap-2">
                          <ArrowLeft size={16} /> Retour au QG
                      </button>
                      
                      <div className="max-w-3xl mx-auto">
                          {!gameFinished ? (
                              <div className="glass-panel border border-vodoun-gold/30 rounded-2xl p-8 relative overflow-hidden">
                                  <div className="absolute top-0 right-0 p-4 opacity-10">
                                      <Languages size={120} className="text-white" />
                                  </div>
                                  
                                  <div className="text-center mb-8">
                                      <span className="text-vodoun-gold font-mono text-xs uppercase tracking-widest">Module 1 : Vocabulaire Tech</span>
                                      {vocabularyList.length > 0 && vocabularyList[gameIndex] ? (
                                        <>
                                            <h2 className="text-4xl font-display font-bold text-white mt-4 mb-2">{vocabularyList[gameIndex].fr}</h2>
                                            <p className="text-gray-400">Comment dit-on cela en Fongbé ?</p>
                                        </>
                                      ) : (
                                        <div className="py-10 text-gray-500"><Loader2 className="animate-spin mx-auto"/> Chargement...</div>
                                      )}
                                  </div>

                                  {vocabularyList.length > 0 && vocabularyList[gameIndex] && (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {vocabularyList[gameIndex].options.map((opt, i) => (
                                            <button 
                                                key={i}
                                                onClick={() => handleGameAnswer(opt)}
                                                className="py-4 px-6 bg-white/5 border border-white/10 hover:bg-vodoun-gold/10 hover:border-vodoun-gold text-white font-bold rounded-xl transition-all"
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                  )}
                                  
                                  <div className="mt-8 flex justify-between items-center text-xs text-gray-500 font-mono">
                                      <span>Question {gameIndex + 1} / {vocabularyList.length}</span>
                                      <span>Score: {gameScore}</span>
                                  </div>
                              </div>
                          ) : (
                              <div className="text-center py-12 glass-panel border border-vodoun-green/30 rounded-2xl">
                                  <Award size={64} className="text-vodoun-green mx-auto mb-4 animate-bounce" />
                                  <h2 className="text-3xl font-display font-bold text-white mb-2">Module Terminé !</h2>
                                  <p className="text-gray-400 mb-8">Vous avez obtenu {gameScore} / {vocabularyList.length} bonnes réponses.</p>
                                  <button onClick={resetGame} className="px-6 py-3 bg-vodoun-green text-white font-bold rounded hover:bg-vodoun-green/80 transition-colors">
                                      Rejouer pour l'honneur
                                  </button>
                              </div>
                          )}
                      </div>
                  </div>
              )}

              {currentView === 'LEADERBOARD' && (
                  <div className="animate-in slide-in-from-right-4 max-w-4xl mx-auto">
                      <div className="text-center mb-10">
                          <h2 className="text-4xl font-display font-bold text-white mb-2 flex items-center justify-center gap-3">
                              <Trophy className="text-vodoun-gold" /> PANTHÉON DES INITIÉS
                          </h2>
                          <p className="text-gray-400">Les 10 meilleurs étudiants de l'Académie Waniyilo.</p>
                      </div>

                      {loadingLeaderboard ? (
                          <div className="flex justify-center py-20">
                              <Loader2 className="animate-spin text-vodoun-gold" size={32} />
                          </div>
                      ) : (
                          <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden">
                              <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 bg-white/5 text-xs font-mono text-gray-500 uppercase">
                                  <div className="col-span-1 text-center">#</div>
                                  <div className="col-span-5">Initié</div>
                                  <div className="col-span-4">Archétype</div>
                                  <div className="col-span-2 text-right">WP</div>
                              </div>
                              <div className="divide-y divide-white/5">
                                  {leaderboard.map((entry, idx) => (
                                      <div key={idx} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors">
                                          <div className="col-span-1 text-center font-display font-bold text-lg text-gray-500">
                                              {idx === 0 ? <span className="text-vodoun-gold">1</span> : 
                                               idx === 1 ? <span className="text-gray-300">2</span> :
                                               idx === 2 ? <span className="text-orange-700">3</span> : idx + 1}
                                          </div>
                                          <div className="col-span-5 font-bold text-white flex items-center gap-2">
                                              {entry.name}
                                              {idx < 3 && <Award size={14} className="text-vodoun-gold" />}
                                          </div>
                                          <div className="col-span-4 text-xs text-gray-400 font-mono">
                                              {entry.archetype ? entry.archetype.replace(/_/g, ' ') : 'INCONNU'}
                                          </div>
                                          <div className="col-span-2 text-right font-display font-bold text-vodoun-green">
                                              {entry.xp}
                                          </div>
                                      </div>
                                  ))}
                                  {leaderboard.length === 0 && (
                                      <div className="p-8 text-center text-gray-500 italic">
                                          Les archives sont silencieuses pour le moment.
                                      </div>
                                  )}
                              </div>
                          </div>
                      )}
                  </div>
              )}

              {currentView === 'NEXUS' && (
                  <div className="animate-in slide-in-from-right-4 h-[calc(100vh-140px)] flex flex-col">
                      <div className="mb-6 flex items-center justify-between">
                          <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                              <MessageCircle className="text-cyan-400" /> NEXUS COMMUNAUTAIRE
                          </h2>
                          <div className="text-xs text-cyan-400/70 font-mono flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                              FLUX TEMPS RÉEL ACTIF
                          </div>
                      </div>

                      <div className="flex-1 glass-panel border border-cyan-500/20 rounded-2xl overflow-hidden flex flex-col relative">
                          {/* Messages Area */}
                          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                              {nexusMessages.length === 0 && (
                                  <div className="text-center py-20 text-gray-500 opacity-50">
                                      <Hash size={48} className="mx-auto mb-4" />
                                      <p>Le canal est calme... Soyez le premier à parler.</p>
                                  </div>
                              )}
                              
                              {nexusMessages.map((msg) => {
                                  const isMe = msg.user_phone === userProfile.phone;
                                  const initials = getAvatarInitials(msg.user_name);
                                  return (
                                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                                          <div className="flex items-end gap-2 max-w-[80%]">
                                              {!isMe && (
                                                <div className="w-8 h-8 rounded-full bg-gray-800 border border-white/10 flex items-center justify-center text-[10px] font-bold text-gray-400">
                                                    {initials}
                                                </div>
                                              )}
                                              <div className={`rounded-2xl p-3 ${
                                                  isMe 
                                                  ? 'bg-cyan-500/20 border border-cyan-500/30 text-white rounded-br-none' 
                                                  : 'bg-white/5 border border-white/10 text-gray-200 rounded-bl-none'
                                              }`}>
                                                  <div className="flex justify-between items-baseline gap-4 mb-1">
                                                      <span className={`text-[10px] font-bold ${isMe ? 'text-cyan-400' : 'text-vodoun-gold'}`}>
                                                          {isMe ? 'MOI' : msg.user_name.toUpperCase()}
                                                      </span>
                                                      <span className="text-[9px] text-gray-500 font-mono">
                                                          {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                      </span>
                                                  </div>
                                                  <p className="text-sm">{msg.content}</p>
                                              </div>
                                          </div>
                                      </div>
                                  );
                              })}
                              <div ref={messagesEndRef} />
                          </div>

                          {/* Input Area */}
                          <div className="p-4 bg-black/40 border-t border-white/10">
                              <div className="flex gap-2">
                                  <input 
                                      value={nexusInput}
                                      onChange={(e) => setNexusInput(e.target.value)}
                                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                      placeholder="Partagez votre savoir avec la communauté..."
                                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                                  />
                                  <button 
                                      onClick={handleSendMessage}
                                      disabled={!nexusInput.trim()}
                                      className="p-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-colors disabled:opacity-50"
                                  >
                                      <Send size={18} />
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>
              )}

          </div>
        </div>
      );
  }

  return null;
};
