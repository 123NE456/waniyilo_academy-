

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Brain, Code, Globe, X, ChevronRight, Sparkles, Languages, Lock, Fingerprint, Zap, Newspaper, LayoutDashboard, LogOut, Menu, Award, Phone, Construction, User, Loader2, Gift, AlertCircle, Quote, Wifi, CheckCircle, Volume2, Trophy, Music, ShieldCheck, ArrowLeft, MessageCircle, Send, Hash, Key, Edit3, PlusCircle, Bookmark, Trash2, ChevronDown, ChevronUp, RefreshCw, Mail, Eye, EyeOff, Users, Handshake } from 'lucide-react';
import { Course, Archetype, UserProfile, NewsItem, XPNotification, LeaderboardEntry, NexusMessage, VocabularyItem, Comment, PrivateMessage, Partner, UserSummary } from '../types';
import { Lab } from './Lab';
import { upsertProfile, addXPToRemote, checkSupabaseConnection, getLeaderboard, fetchNews, fetchCourses, fetchRecentMessages, sendMessageToNexus, subscribeToNexus, fetchVocabulary, createNews, addVocabulary, getProfileByMatricule, deleteNews, deleteVocabulary, fetchComments, addComment, updateAvatar, deleteNexusMessage, fetchPrivateMessages, sendPrivateMessage, subscribeToPrivateMessages, fetchAllUsers, fetchPartners, addPartner, deletePartner } from '../services/supabase';

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
    "C'est au bout de la vieille corde qu'on tisse la nouvelle.",
    "Si tu veux aller vite, marche seul. Si tu veux aller loin, marchons ensemble.",
    "Le mensonge donne des fleurs mais pas de fruits.",
    "Ce que le vieux voit assis, le jeune ne le voit pas debout.",
    "L'intelligence n'est pas qu'une seule personne ait raison.",
    "L'eau chaude n'oublie jamais qu'elle a été froide.",
    "Le serpent ne mord pas celui qui connaît son sifflement.",
    "La sagesse est comme un baobab : une seule personne ne peut l'embrasser."
];

const BADGES_DEFINITIONS = [
    { id: 'badge_initiation', name: "Initié", icon: <Fingerprint />, desc: "A terminé le rituel" },
    { id: 'badge_langue_1', name: "Parleur Fongbé", icon: <Languages />, desc: "Maîtrise le niveau 1" },
    { id: 'badge_nexus_1', name: "Voix du Peuple", icon: <MessageCircle />, desc: "A participé au Nexus" },
    { id: 'badge_admin', name: "Maître du Système", icon: <Key />, desc: "Droits suprêmes" },
    { id: 'badge_social', name: "Connecté", icon: <Wifi />, desc: "A envoyé un message privé" },
    { id: 'badge_scholar', name: "Érudit", icon: <Brain />, desc: "Niveau 5 atteint" },
    { id: 'badge_guardian', name: "Gardien", icon: <ShieldCheck />, desc: "Niveau 10 atteint" },
    { id: 'badge_creator', name: "Créateur", icon: <Code />, desc: "A proposé du contenu" }
];

const FALLBACK_VOCABULARY: VocabularyItem[] = [
    { id: 1, level: 1, fr: "Ordinateur", fon: "Wémá mɔ", options: ["Wémá mɔ", "Gbedjé", "Zòkèké"] },
    { id: 2, level: 1, fr: "Internet", fon: "Kan mɛ", options: ["Agbaza", "Kan mɛ", "Yɛhwe"] },
    { id: 3, level: 1, fr: "Savoir", fon: "Nunyɔ", options: ["Akkwɛ", "Nunyɔ", "Alɔ"] }
];

const FALLBACK_NEWS: NewsItem[] = [
    { id: '1', title: "Connexion aux Archives...", date: "...", category: "Tech", excerpt: "Chargement du flux d'actualités en cours." },
];

const AVATAR_STYLES = ['bottts', 'avataaars', 'pixel-art', 'lorelei', 'notionists'];

type Stage = 'LOCKED' | 'SCANNING' | 'INITIATION' | 'REGISTRATION' | 'MATRICULE_REVEAL' | 'SYNCING' | 'DASHBOARD' | 'LOGIN_WITH_MATRICULE';
type DashboardView = 'HOME' | 'LAB' | 'NEWS' | 'LEARNING_LANGUE' | 'LEADERBOARD' | 'NEXUS' | 'ADMIN';

interface AcademyProps {
    initialProfile?: UserProfile | null;
    onEnterImmersive?: (profile: UserProfile) => void;
    onLogout?: () => void;
}

// HELPER FUNCTION MOVED INSIDE COMPONENT FILE
const getAvatarInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

export const Academy: React.FC<AcademyProps> = ({ initialProfile, onEnterImmersive, onLogout }) => {
  const [stage, setStage] = useState<Stage>(initialProfile ? 'DASHBOARD' : 'LOCKED');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(initialProfile || null);
  const [xpNotifications, setXpNotifications] = useState<XPNotification[]>([]);
  
  // Registration & Login Data
  const [regData, setRegData] = useState({ name: '', phone: '' }); 
  const [loginMatricule, setLoginMatricule] = useState('');
  const [generatedMatricule, setGeneratedMatricule] = useState(''); // Pour l'affichage après inscription
  const [dbError, setDbError] = useState<string | null>(null);
  
  // Network Diagnostic
  const [networkStatus, setNetworkStatus] = useState<{ok: boolean, msg: string} | null>(null);
  
  const [currentView, setCurrentView] = useState<DashboardView>('HOME');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dynamic Data State
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [vocabularyList, setVocabularyList] = useState<VocabularyItem[]>([]);
  const [isLoadingContent, setIsLoadingContent] = useState(true);

  // ADMIN STATE
  const [adminNewsTitle, setAdminNewsTitle] = useState('');
  const [adminNewsCat, setAdminNewsCat] = useState('Tech');
  const [adminNewsContent, setAdminNewsContent] = useState('');
  const [adminVocabFr, setAdminVocabFr] = useState('');
  const [adminVocabFon, setAdminVocabFon] = useState('');
  const [adminStatus, setAdminStatus] = useState('');
  const [adminUsers, setAdminUsers] = useState<UserSummary[]>([]);
  const [adminPartners, setAdminPartners] = useState<Partner[]>([]);
  const [adminPartnerName, setAdminPartnerName] = useState('');
  const [adminPartnerType, setAdminPartnerType] = useState('OFFICIAL');
  const [adminTab, setAdminTab] = useState<'CONTENT' | 'USERS' | 'PARTNERS'>('CONTENT');

  // NEXUS CHAT STATE
  const [nexusMessages, setNexusMessages] = useState<NexusMessage[]>([]);
  const [nexusInput, setNexusInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [nexusTab, setNexusTab] = useState<'GLOBAL' | 'PRIVATE'>('GLOBAL');
  
  // PRIVATE CHAT STATE
  const [privateMessages, setPrivateMessages] = useState<PrivateMessage[]>([]);
  const [pmRecipient, setPmRecipient] = useState('');
  const [pmInput, setPmInput] = useState('');

  // COMMENTS STATE
  const [expandedNewsId, setExpandedNewsId] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  // GAME STATE
  const [gameIndex, setGameIndex] = useState(0);
  const [gameScore, setGameScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);

  // AVATAR STATE
  const [editingAvatar, setEditingAvatar] = useState(false);

  const dailyProverb = useMemo(() => {
      return PROVERBS[Math.floor(Math.random() * PROVERBS.length)];
  }, []);

  const getIcon = (name?: string) => {
      switch(name) {
          case 'Languages': return <Languages size={24} className="text-vodoun-gold" />;
          case 'Brain': return <Brain size={24} className="text-vodoun-purple" />;
          case 'Code': return <Code size={24} className="text-vodoun-green" />;
          case 'Globe': return <Globe size={24} className="text-vodoun-orange" />;
          default: return <Sparkles size={24} className="text-gray-400" />;
      }
  };

  useEffect(() => {
      if (initialProfile) {
          setUserProfile(initialProfile);
          setStage('DASHBOARD');
      }
  }, [initialProfile]);

  useEffect(() => {
      if (stage === 'DASHBOARD' && userProfile) {
          setIsLoadingContent(true);
          Promise.all([fetchNews(), fetchCourses()]).then(([fetchedNews, fetchedCourses]) => {
              setNewsList(fetchedNews.length > 0 ? fetchedNews : FALLBACK_NEWS);
              setCoursesList(fetchedCourses); 
              setIsLoadingContent(false);
          });
      }
  }, [stage]);

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

      if (currentView === 'ADMIN') {
        fetchNews().then(setNewsList);
        fetchVocabulary(1).then(setVocabularyList);
        fetchAllUsers().then(setAdminUsers);
        fetchPartners().then(setAdminPartners);
      }

      if (currentView === 'NEXUS' && userProfile) {
          fetchRecentMessages().then(msgs => setNexusMessages(msgs));
          const subNexus = subscribeToNexus((newMsg) => {
              setNexusMessages(prev => [...prev, newMsg]);
              playSound('success');
          });

          fetchPrivateMessages(userProfile.matricule).then(msgs => setPrivateMessages(msgs));
          const subPM = subscribeToPrivateMessages(userProfile.matricule, (newMsg) => {
              setPrivateMessages(prev => [...prev, newMsg]);
              playSound('success');
          });

          return () => { 
              subNexus.unsubscribe(); 
              subPM.unsubscribe();
            };
      }
  }, [currentView, userProfile]);

  useEffect(() => {
      if (currentView === 'NEXUS' && nexusTab === 'GLOBAL' && messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
  }, [nexusMessages, currentView, nexusTab]);

  // --- ACTIONS ---

  const handleSendMessage = async () => {
      if (!nexusInput.trim() || !userProfile) return;
      const content = nexusInput.trim();
      setNexusInput('');
      playSound('success');
      await sendMessageToNexus(userProfile.name, userProfile.phone, userProfile.archetype || '', content);
      // Removed XP for spam prevention
  };

  const handleDeleteNexusMessage = async (id: number) => {
      if (window.confirm("Admin: Supprimer ce message ?")) {
          // Optimistic update
          setNexusMessages(prev => prev.filter(m => m.id !== id));
          const res = await deleteNexusMessage(id);
          if (!res.success) {
              alert("Erreur suppression, rechargement...");
              fetchRecentMessages().then(msgs => setNexusMessages(msgs));
          }
      }
  }

  const handleSendPM = async () => {
      if (!pmInput.trim() || !pmRecipient.trim() || !userProfile) return;
      if (pmRecipient === userProfile.matricule) return alert("On ne se parle pas à soi-même !");
      
      const content = pmInput.trim();
      setPmInput('');
      const res = await sendPrivateMessage(userProfile.matricule, pmRecipient, content);
      
      if(res.success) {
          playSound('success');
          // Optimistic update
          setPrivateMessages(prev => [...prev, {
              id: Date.now(),
              sender_matricule: userProfile.matricule,
              receiver_matricule: pmRecipient,
              content: content,
              created_at: new Date().toISOString(),
              read: true
          }]);
      } else {
          alert("Erreur envoi. Vérifiez le matricule.");
      }
  }

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
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
          gain.gain.setValueAtTime(0.05, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
          osc.start();
          osc.stop(ctx.currentTime + 0.1);
        } else {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(150, ctx.currentTime);
          gain.gain.setValueAtTime(0.05, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
          osc.start();
          osc.stop(ctx.currentTime + 0.2);
        }
    } catch (e) { console.error("Audio not supported"); }
  };

  const addXp = async (amount: number, reason: string) => {
      if (!userProfile) return;
      
      const newXp = userProfile.xp + amount;
      const newLevel = Math.floor(newXp / 100) + 1;
      
      setUserProfile(prev => {
          if(!prev) return null;
          return { ...prev, xp: newXp, level: newLevel }
      });

      await addXPToRemote(userProfile.matricule, amount);

      const notifId = Date.now();
      setXpNotifications(prev => [...prev, { id: notifId, amount, reason }]);
      setTimeout(() => setXpNotifications(prev => prev.filter(n => n.id !== notifId)), 3000);
      
      if (newLevel > userProfile.level) {
          playSound('success'); 
      }
  };

  const showLockedNotification = () => {
      const notifId = Date.now();
      setXpNotifications(prev => [...prev, { id: notifId, amount: 0, reason: " 🚧 Module en construction." }]);
      setTimeout(() => setXpNotifications(prev => prev.filter(n => n.id !== notifId)), 3000);
  }

  const startInitiation = () => {
    setStage('SCANNING');
    setTimeout(() => setStage('INITIATION'), 2000);
  };

  const goToLogin = () => {
      setStage('LOGIN_WITH_MATRICULE');
  }

  const handleLoginSubmit = async () => {
      if (!loginMatricule.trim()) return;
      setDbError(null);
      setStage('SYNCING');
      
      const profile = await getProfileByMatricule(loginMatricule.trim());
      
      if (profile) {
           localStorage.setItem('waniyilo_user_matricule', profile.matricule);
           setUserProfile(profile);
           setStage('DASHBOARD');
           if (onEnterImmersive) onEnterImmersive(profile);
      } else {
           setDbError("Matricule inconnu. Avez-vous passé le rituel ?");
           setStage('LOGIN_WITH_MATRICULE');
      }
  }

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
      
      setUserProfile({
        name: '', phone: '', matricule: '',
        archetype: finalArchetype,
        level: 1, xp: 50,
        badges: ['badge_initiation'],
        joinedAt: new Date().toISOString(),
        avatar_style: 'bottts'
      });
      setStage('REGISTRATION');
    }
  };

  const completeRegistration = async () => {
    if (!regData.name.trim() || !regData.phone.trim() || !userProfile) return;
    setStage('SYNCING');
    setDbError(null);

    let cleanPhone = regData.phone.replace(/\s/g, '');
    if (!cleanPhone.startsWith('+229')) cleanPhone = '+229' + cleanPhone;

    const finalProfile = { ...userProfile, name: regData.name, phone: cleanPhone };
    const result = await upsertProfile(finalProfile);

    if (result.success && result.matricule) {
        setGeneratedMatricule(result.matricule);
        const completeProfile = { ...finalProfile, matricule: result.matricule };
        setUserProfile(completeProfile);
        setStage('MATRICULE_REVEAL');
    } else {
        setDbError(result.error || "Erreur inscription.");
        setStage('REGISTRATION');
    }
  };

  const enterDashboardAfterReveal = () => {
      if (!userProfile) return;
      localStorage.setItem('waniyilo_user_matricule', userProfile.matricule);
      setStage('DASHBOARD');
      if (onEnterImmersive) onEnterImmersive(userProfile);
  }

  const handleLogoutLocal = () => {
      localStorage.removeItem('waniyilo_user_matricule');
      setStage('LOCKED');
      setRegData({ name: '', phone: '' });
      setLoginMatricule('');
      setGeneratedMatricule('');
      setCurrentQuestion(0);
      setAnswers([]);
      setSidebarOpen(false);
      if (onLogout) onLogout();
  };

  // AVATAR
  const handleChangeAvatar = async () => {
      if (!userProfile) return;
      const nextStyleIndex = (AVATAR_STYLES.indexOf(userProfile.avatar_style || 'bottts') + 1) % AVATAR_STYLES.length;
      const newStyle = AVATAR_STYLES[nextStyleIndex];
      
      setUserProfile({...userProfile, avatar_style: newStyle});
      await updateAvatar(userProfile.matricule, newStyle);
  }

  // ADMIN FUNCTIONS
  const handleCreateNews = async () => {
      if(!adminNewsTitle) return;
      const res = await createNews(adminNewsTitle, adminNewsCat, adminNewsContent, "Direct");
      if(res.success) {
          setAdminStatus("News publiée !");
          setAdminNewsTitle('');
          fetchNews().then(setNewsList); // Refresh list
      } else {
          setAdminStatus("Erreur: " + res.error);
      }
  }

  const handleDeleteNews = async (id: string) => {
      if(!window.confirm("Supprimer cette actu ?")) return;
      const res = await deleteNews(id);
      if(res.success) {
          setNewsList(prev => prev.filter(n => n.id !== id));
      }
  }

  const handleAddVocab = async () => {
      if(!adminVocabFr) return;
      const options = [adminVocabFon, "MauvaiseRep1", "MauvaiseRep2"]; // Simplifié
      const res = await addVocabulary(adminVocabFr, adminVocabFon, options);
      if(res.success) {
          setAdminStatus("Mot ajouté !");
          setAdminVocabFr('');
          setAdminVocabFon('');
          fetchVocabulary(1).then(setVocabularyList);
      } else {
          setAdminStatus("Erreur: " + res.error);
      }
  }

  const handleDeleteVocab = async (id: number) => {
      if(!window.confirm("Supprimer ce mot ?")) return;
      const res = await deleteVocabulary(id);
      if(res.success) {
          setVocabularyList(prev => prev.filter(v => v.id !== id));
      }
  }

  const handleAddPartner = async () => {
    if(!adminPartnerName) return;
    const res = await addPartner(adminPartnerName, adminPartnerType);
    if(res.success) {
        setAdminPartnerName('');
        fetchPartners().then(setAdminPartners);
    }
  }

  const handleDeletePartner = async (id: number) => {
      if(!window.confirm("Supprimer ce partenaire ?")) return;
      await deletePartner(id);
      setAdminPartners(prev => prev.filter(p => p.id !== id));
  }

  const handleAdminDM = (matricule: string) => {
      setPmRecipient(matricule);
      setCurrentView('NEXUS');
      setNexusTab('PRIVATE');
  }

  // COMMENTS FUNCTIONS
  const toggleComments = async (newsId: string) => {
      if (expandedNewsId === newsId) {
          setExpandedNewsId(null);
          setComments([]);
      } else {
          setExpandedNewsId(newsId);
          setLoadingComments(true);
          const data = await fetchComments(newsId);
          setComments(data);
          setLoadingComments(false);
      }
  }

  const handlePostComment = async (newsId: string) => {
      if(!commentInput.trim() || !userProfile) return;
      const res = await addComment(newsId, userProfile.name, commentInput);
      if(res.success) {
          setCommentInput('');
          // Refresh comments
          const data = await fetchComments(newsId);
          setComments(data);
          addXp(1, "Participation");
      }
  }

  // GAME
  const handleGameAnswer = (selected: string) => {
      const currentWord = vocabularyList[gameIndex];
      const correct = currentWord.fon === selected;
      if (correct) {
          setGameScore(prev => prev + 1);
          addXp(2, "Bonne réponse !"); // Reduced XP
          playSound('success');
      } else {
          addXp(0, "Oups, essaie encore.");
          playSound('error');
      }
      if (gameIndex < vocabularyList.length - 1) {
          setGameIndex(prev => prev + 1);
      } else {
          setGameFinished(true);
          addXp(10, "Niveau Terminé !"); // Reduced XP
          playSound('success');
      }
  };

  const resetGame = () => {
      setGameIndex(0);
      setGameScore(0);
      setGameFinished(false);
  };

  const closeSidebarMobile = () => setSidebarOpen(false);
  const getAvatarUrl = (seed: string, style: string = 'bottts') => `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
  const getArchetypeLabel = (arch: Archetype) => arch ? arch.replace(/_/g, ' ') : 'INITIÉ';


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
          <p className="text-gray-400 text-lg mb-8">Passez le rituel ou identifiez-vous.</p>
          {stage === 'LOCKED' && (
            <div className="flex flex-col gap-4 max-w-xs mx-auto">
                <button onClick={startInitiation} className="px-8 py-3 bg-white/5 border border-vodoun-red hover:bg-vodoun-red/20 text-white font-tech font-bold uppercase rounded transition-all shadow-[0_0_15px_rgba(220,38,38,0.2)]">
                NOUVEL INITIÉ (RITUEL)
                </button>
                <button onClick={goToLogin} className="px-8 py-3 bg-transparent border border-gray-600 hover:border-white text-gray-400 hover:text-white font-tech font-bold uppercase rounded transition-all">
                DÉJÀ UN MATRICULE ?
                </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (stage === 'LOGIN_WITH_MATRICULE') {
      return (
        <div className="h-full min-h-[500px] flex items-center justify-center bg-cyber-black py-20 relative">
            <div className="w-full max-w-md px-4 relative z-10 glass-panel p-8 rounded-2xl border border-white/10">
                <div className="text-center mb-6">
                    <Key size={32} className="mx-auto text-vodoun-purple mb-4" />
                    <h2 className="text-2xl font-display font-bold text-white">IDENTIFICATION</h2>
                    <p className="text-gray-400 text-sm">Entrez votre matricule Waniyilo.</p>
                </div>
                {dbError && (
                    <div className="p-3 mb-4 bg-red-500/10 border border-red-500/50 rounded text-red-200 text-xs flex items-center gap-2">
                        <AlertCircle size={14} /> <span>{dbError}</span>
                    </div>
                )}
                <input 
                    value={loginMatricule} 
                    onChange={(e) => setLoginMatricule(e.target.value.toUpperCase())}
                    className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white focus:border-vodoun-purple focus:outline-none mb-4 text-center font-mono text-lg tracking-widest"
                    placeholder="W26-XXXXXX"
                />
                <button 
                    onClick={handleLoginSubmit}
                    className="w-full py-4 bg-vodoun-purple hover:bg-vodoun-purple/80 text-white font-bold font-tech uppercase rounded transition-all"
                >
                    ACCÉDER AU SYSTÈME
                </button>
                <button onClick={() => setStage('LOCKED')} className="w-full mt-4 text-gray-500 text-xs hover:text-white">Retour</button>
            </div>
        </div>
      );
  }

  if (stage === 'INITIATION') {
    return (
        <div className="h-full min-h-[500px] flex items-center justify-center bg-cyber-black py-20">
        <div className="w-full max-w-2xl px-4">
           <div className="w-full h-1 bg-gray-800 rounded-full mb-8 overflow-hidden">
             <div className="h-full bg-vodoun-gold transition-all duration-500" style={{ width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%` }}></div>
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
            <div className="w-full max-w-md px-4 relative z-10">
                <div className="text-center mb-8">
                    <User size={32} className="mx-auto text-vodoun-purple mb-4" />
                    <h2 className="text-2xl font-display font-bold text-white">GRAVER VOTRE NOM</h2>
                </div>
                <div className="glass-panel p-8 rounded-2xl border border-white/10 space-y-4">
                    {dbError && (
                        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded text-red-200 text-xs flex items-center gap-2"><AlertCircle size={14} /><span>{dbError}</span></div>
                    )}
                    <input 
                        value={regData.name} onChange={(e) => setRegData({...regData, name: e.target.value})}
                        className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white focus:border-vodoun-purple focus:outline-none"
                        placeholder="Nom Complet"
                    />
                    <input 
                        value={regData.phone} onChange={(e) => setRegData({...regData, phone: e.target.value})}
                        className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white focus:border-vodoun-purple focus:outline-none"
                        placeholder="Téléphone (+229...)"
                    />
                    <button 
                        onClick={completeRegistration} disabled={stage === 'SYNCING'}
                        className="w-full py-4 mt-4 bg-vodoun-purple hover:bg-vodoun-purple/80 text-white font-bold font-tech uppercase rounded transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {stage === 'SYNCING' ? <Loader2 className="animate-spin" /> : 'GÉNÉRER MON MATRICULE'}
                    </button>
                </div>
            </div>
        </div>
      );
  }

  if (stage === 'MATRICULE_REVEAL') {
      return (
          <div className="h-full min-h-[500px] flex items-center justify-center bg-cyber-black py-20">
              <div className="text-center max-w-md px-4 animate-in zoom-in-95 duration-500">
                  <div className="mb-6 mx-auto w-24 h-24 rounded-full bg-vodoun-green/20 border-2 border-vodoun-green flex items-center justify-center">
                      <CheckCircle size={48} className="text-vodoun-green" />
                  </div>
                  <h2 className="text-3xl font-display font-bold text-white mb-2">BIENVENUE, INITIÉ</h2>
                  <p className="text-gray-400 mb-6">Voici votre clé d'accès unique. Conservez-la précieusement.</p>
                  
                  <div className="bg-black/80 border-2 border-dashed border-vodoun-gold p-6 rounded-xl mb-8 relative group">
                      <p className="text-xs text-gray-500 font-mono mb-2">VOTRE MATRICULE</p>
                      <h3 className="text-4xl font-mono font-bold text-vodoun-gold tracking-widest select-all">{generatedMatricule}</h3>
                  </div>

                  <button onClick={enterDashboardAfterReveal} className="px-8 py-3 bg-white text-black font-bold rounded hover:bg-gray-200 transition-colors">
                      ENTRER DANS LE DASHBOARD
                  </button>
              </div>
          </div>
      )
  }

  // --- DASHBOARD ---
  if (stage === 'DASHBOARD' && userProfile) {
      return (
        <div className="h-full bg-cyber-black flex overflow-hidden relative pt-16 md:pt-0">
          <div className="absolute top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none">
             {xpNotifications.map(notif => (
                 <div key={notif.id} className="animate-in slide-in-from-right fade-in duration-300 flex items-center gap-3 bg-black/80 backdrop-blur border border-vodoun-gold/50 px-4 py-3 rounded-lg">
                     <span className="text-vodoun-gold font-bold font-display text-xl">+{notif.amount} WP</span>
                     <span className="text-gray-300 text-sm border-l border-gray-700 pl-3">{notif.reason}</span>
                 </div>
             ))}
          </div>

          {sidebarOpen && <div className="fixed inset-0 bg-black/80 z-20 md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>}

          <div className={`w-64 bg-black/90 border-r border-white/5 flex flex-col fixed md:relative z-30 h-full transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
             <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img src={getAvatarUrl(userProfile.matricule, userProfile.avatar_style)} alt="Avatar" className="w-10 h-10 rounded-full border border-white/20 bg-gray-800" />
                    <div>
                        <h3 className="font-bold text-white text-sm truncate w-24">{userProfile.name}</h3>
                        <p className="text-[10px] text-gray-500 font-mono">{userProfile.matricule}</p>
                    </div>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400"><X size={20} /></button>
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
                     <MessageCircle size={18} /> Messagerie
                 </button>
                 
                 {userProfile.archetype === 'ADMIN' && (
                     <button onClick={() => { setCurrentView('ADMIN'); closeSidebarMobile(); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors border border-red-500/30 text-red-400 bg-red-900/10 hover:bg-red-900/20 mt-4`}>
                        <Key size={18} /> PANEL ADMIN
                     </button>
                 )}
             </nav>
             <div className="p-4 border-t border-white/5 mt-auto">
                 <button onClick={handleLogoutLocal} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-900/10 rounded-lg text-sm transition-colors border border-red-900/20">
                     <LogOut size={18} /> Déconnexion
                 </button>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 relative pt-20 md:pt-8 pb-32 md:pb-8">
              <div className="flex justify-between items-center mb-8">
                 <div className="flex items-center gap-4">
                    <div className="relative group">
                        <img src={getAvatarUrl(userProfile.matricule, userProfile.avatar_style)} alt="Avatar" className="w-16 h-16 rounded-full border-2 border-vodoun-gold/50 bg-gray-800" />
                        <button onClick={handleChangeAvatar} className="absolute bottom-0 right-0 bg-black text-white p-1 rounded-full border border-gray-600 hover:bg-vodoun-gold transition-colors" title="Changer Style"><RefreshCw size={12}/></button>
                    </div>
                    <div>
                        <h2 className="text-2xl font-display font-bold text-white uppercase">{getArchetypeLabel(userProfile.archetype)}</h2>
                        <p className="text-gray-400 text-sm flex items-center gap-2">
                            <ShieldCheck size={12} className="text-vodoun-green" /> 
                            Matricule: <span className="font-mono text-white select-all">{userProfile.matricule}</span>
                        </p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <button onClick={() => addXp(5, "Bonus Quotidien")} className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-vodoun-gold hover:bg-white/10 transition-colors">
                        <Gift size={14} /> Bonus
                    </button>
                    <div className="md:hidden">
                        <button onClick={() => setSidebarOpen(true)}><Menu size={24} className="text-vodoun-gold" /></button>
                    </div>
                 </div>
              </div>

              {currentView === 'HOME' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                      <div className="p-6 rounded-xl bg-gradient-to-r from-vodoun-purple/20 to-transparent border-l-4 border-vodoun-purple relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-10"><Quote size={64} className="text-white" /></div>
                          <h3 className="text-xs font-bold text-vodoun-purple uppercase tracking-widest mb-2">Sagesse du Jour</h3>
                          <p className="text-lg md:text-xl text-white font-serif italic">"{dailyProverb}"</p>
                      </div>

                      {/* BADGES SECTION */}
                      <div className="mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                            <Award size={18} className="text-vodoun-gold" /> Mes Trophées
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {BADGES_DEFINITIONS.map(badge => {
                                const isUnlocked = userProfile.badges.includes(badge.id) || (badge.id === 'badge_admin' && userProfile.archetype === 'ADMIN');
                                return (
                                    <div key={badge.id} className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all ${isUnlocked ? 'bg-vodoun-gold/10 border-vodoun-gold/30' : 'bg-white/5 border-white/5 opacity-50 grayscale'}`}>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${isUnlocked ? 'text-vodoun-gold bg-vodoun-gold/20' : 'text-gray-500 bg-gray-800'}`}>
                                            {badge.icon}
                                        </div>
                                        <h4 className="text-xs font-bold text-white">{badge.name}</h4>
                                        <p className="text-[10px] text-gray-400 mt-1">{badge.desc}</p>
                                    </div>
                                )
                            })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Construction size={18} className="text-vodoun-gold" /> Modules
                            </h3>
                            {isLoadingContent ? (
                                [1, 2].map(i => (
                                    <div key={i} className="glass-panel p-4 rounded-xl border border-white/5 h-24 animate-pulse"></div>
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
                                                        ) : <span className="text-[10px] px-2 py-0.5 bg-white/5 text-gray-600 rounded">Bientôt</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            {course.duration === "Module Actif" ? (
                                                <button onClick={() => setCurrentView('LEARNING_LANGUE')} className="p-2 rounded-full bg-vodoun-gold/10 text-vodoun-gold hover:bg-vodoun-gold/20 transition-colors">
                                                    <ChevronRight size={20} />
                                                </button>
                                            ) : (
                                                <button onClick={showLockedNotification} className="p-2 rounded-full bg-white/5 text-gray-600 hover:text-gray-400 transition-colors">
                                                    <Lock size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2"><Newspaper size={18} className="text-vodoun-orange" /> Flash Info</h3>
                            <div className="glass-panel rounded-xl border border-white/5 overflow-hidden">
                                {newsList.slice(0, 3).map((news, i) => (
                                    <div key={i} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-default">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-[10px] text-vodoun-orange font-mono">{news.category}</span>
                                            <span className="text-[10px] text-gray-500">{news.date}</span>
                                        </div>
                                        <p className="text-sm text-gray-300 font-medium line-clamp-1">{news.title}</p>
                                    </div>
                                ))}
                                <button onClick={() => setCurrentView('NEWS')} className="w-full py-3 text-center text-xs text-gray-400 hover:text-white transition-colors bg-white/5">Voir tout</button>
                            </div>
                        </div>
                      </div>
                  </div>
              )}

              {currentView === 'LAB' && <div className="animate-in zoom-in-95 duration-300"><Lab /></div>}
              
              {currentView === 'NEWS' && (
                   <div className="animate-in slide-in-from-right-4">
                       <h2 className="text-3xl font-display font-bold text-white mb-6">Flux d'Actualités <span className="text-vodoun-orange">Live</span></h2>
                       <div className="space-y-6">
                           {newsList.map((news) => (
                               <div key={news.id} className="p-6 glass-panel border border-white/10 rounded-xl hover:border-vodoun-orange/30 transition-all">
                                   <div className="flex justify-between items-start mb-4">
                                       <span className="px-2 py-1 bg-vodoun-orange/10 text-vodoun-orange text-xs rounded font-bold">{news.category}</span>
                                       <span className="text-xs text-gray-500">{news.date}</span>
                                   </div>
                                   <h3 className="text-xl font-bold text-white mb-2">{news.title}</h3>
                                   <p className="text-gray-400 text-sm mb-4">{news.excerpt}</p>
                                   {news.content && <p className="text-gray-500 text-xs italic mb-2 border-l border-white/10 pl-2">{news.content.substring(0, 100)}...</p>}
                                   
                                   <div className="border-t border-white/5 pt-4">
                                       <button onClick={() => toggleComments(news.id)} className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors">
                                           <MessageCircle size={14} /> 
                                           {expandedNewsId === news.id ? "Masquer les commentaires" : "Commentaires"}
                                       </button>

                                       {expandedNewsId === news.id && (
                                           <div className="mt-4 animate-in fade-in">
                                               {loadingComments ? <Loader2 size={16} className="animate-spin text-vodoun-gold mx-auto" /> : (
                                                   <div className="space-y-3 mb-4 max-h-40 overflow-y-auto custom-scrollbar">
                                                       {comments.length === 0 && <p className="text-xs text-gray-600 italic">Aucun commentaire pour le moment.</p>}
                                                       {comments.map(c => (
                                                           <div key={c.id} className="text-xs bg-white/5 p-2 rounded">
                                                               <span className="text-vodoun-gold font-bold">{c.user_name}</span>: <span className="text-gray-300">{c.content}</span>
                                                           </div>
                                                       ))}
                                                   </div>
                                               )}
                                               <div className="flex gap-2">
                                                   <input 
                                                     placeholder="Écrire..." 
                                                     value={commentInput} 
                                                     onChange={e => setCommentInput(e.target.value)}
                                                     className="flex-1 bg-black border border-gray-700 rounded p-2 text-xs text-white"
                                                   />
                                                   <button onClick={() => handlePostComment(news.id)} className="p-2 bg-vodoun-orange text-white rounded hover:bg-vodoun-orange/80"><Send size={14}/></button>
                                               </div>
                                           </div>
                                       )}
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>
              )}

              {currentView === 'LEARNING_LANGUE' && (
                  <div className="animate-in slide-in-from-bottom-8">
                      <button onClick={() => setCurrentView('HOME')} className="mb-6 text-sm text-gray-400 hover:text-white flex items-center gap-2"><ArrowLeft size={16} /> Retour au QG</button>
                      <div className="max-w-3xl mx-auto">
                          {!gameFinished ? (
                              <div className="glass-panel border border-vodoun-gold/30 rounded-2xl p-8 relative overflow-hidden">
                                  <div className="absolute top-0 right-0 p-4 opacity-10"><Languages size={120} className="text-white" /></div>
                                  <div className="text-center mb-8">
                                      <span className="text-vodoun-gold font-mono text-xs uppercase tracking-widest">Module 1 : Vocabulaire Tech</span>
                                      {vocabularyList.length > 0 && vocabularyList[gameIndex] ? (
                                        <>
                                            <h2 className="text-4xl font-display font-bold text-white mt-4 mb-2">{vocabularyList[gameIndex].fr}</h2>
                                            <p className="text-gray-400">Comment dit-on cela en Fongbé ?</p>
                                        </>
                                      ) : <div className="py-10 text-gray-500">Chargement...</div>}
                                  </div>
                                  {vocabularyList.length > 0 && vocabularyList[gameIndex] && (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {vocabularyList[gameIndex].options.map((opt, i) => (
                                            <button key={i} onClick={() => handleGameAnswer(opt)} className="py-4 px-6 bg-white/5 border border-white/10 hover:bg-vodoun-gold/10 hover:border-vodoun-gold text-white font-bold rounded-xl transition-all">
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
                                  <button onClick={resetGame} className="px-6 py-3 bg-vodoun-green text-white font-bold rounded hover:bg-vodoun-green/80 transition-colors">Rejouer</button>
                              </div>
                          )}
                      </div>
                  </div>
              )}

              {currentView === 'LEADERBOARD' && (
                  <div className="animate-in slide-in-from-right-4 max-w-4xl mx-auto">
                      <div className="text-center mb-10">
                          <h2 className="text-4xl font-display font-bold text-white mb-2 flex items-center justify-center gap-3"><Trophy className="text-vodoun-gold" /> PANTHÉON DES INITIÉS</h2>
                          <p className="text-gray-400">Top 10 Waniyilo (Admins Exclus).</p>
                      </div>
                      {loadingLeaderboard ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-vodoun-gold" size={32} /></div> : (
                          <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden">
                              <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 bg-white/5 text-xs font-mono text-gray-500 uppercase">
                                  <div className="col-span-1 text-center">#</div>
                                  <div className="col-span-1">Avatar</div>
                                  <div className="col-span-4">Initié</div>
                                  <div className="col-span-4">Archétype</div>
                                  <div className="col-span-2 text-right">WP</div>
                              </div>
                              <div className="divide-y divide-white/5">
                                  {leaderboard.map((entry, idx) => (
                                      <div key={idx} onClick={() => { setPmRecipient(entry.matricule); setCurrentView('NEXUS'); setNexusTab('PRIVATE'); }} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors cursor-pointer group">
                                          <div className="col-span-1 text-center font-display font-bold text-lg text-gray-500">{idx+1}</div>
                                          <div className="col-span-1">
                                              <img src={getAvatarUrl(entry.matricule, entry.avatar_style)} className="w-8 h-8 rounded-full bg-gray-700" alt="av" />
                                          </div>
                                          <div className="col-span-4 font-bold text-white flex items-center gap-2 group-hover:text-cyan-400 transition-colors">{entry.name}</div>
                                          <div className="col-span-4 text-xs text-gray-400 font-mono">{entry.archetype ? entry.archetype.replace(/_/g, ' ') : 'INCONNU'}</div>
                                          <div className="col-span-2 text-right font-display font-bold text-vodoun-green">{entry.xp}</div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>
              )}

              {currentView === 'NEXUS' && (
                  <div className="animate-in slide-in-from-right-4 h-[calc(100vh-140px)] flex flex-col">
                      <div className="mb-4 flex items-center justify-between">
                          <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3"><MessageCircle className="text-cyan-400" /> MESSAGERIE</h2>
                          <div className="flex bg-white/5 rounded-lg p-1">
                              <button onClick={() => setNexusTab('GLOBAL')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${nexusTab === 'GLOBAL' ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white'}`}>GLOBAL</button>
                              <button onClick={() => setNexusTab('PRIVATE')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${nexusTab === 'PRIVATE' ? 'bg-vodoun-purple text-white' : 'text-gray-400 hover:text-white'}`}>PRIVÉ</button>
                          </div>
                      </div>

                      {nexusTab === 'GLOBAL' ? (
                          <div className="flex-1 glass-panel border border-cyan-500/20 rounded-2xl overflow-hidden flex flex-col relative">
                              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar pb-24">
                                  {nexusMessages.map((msg) => {
                                      const isMe = msg.user_phone === userProfile.phone;
                                      return (
                                          <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 group`}>
                                              <div className="flex items-end gap-2 max-w-[80%]">
                                                  {!isMe && <div className="w-8 h-8 rounded-full bg-gray-800 border border-white/10 flex items-center justify-center text-[10px] font-bold text-gray-400">{getAvatarInitials(msg.user_name)}</div>}
                                                  <div className={`rounded-2xl p-3 ${isMe ? 'bg-cyan-500/20 border border-cyan-500/30 text-white rounded-br-none' : 'bg-white/5 border border-white/10 text-gray-200 rounded-bl-none'}`}>
                                                      <div className="flex justify-between items-baseline gap-4 mb-1">
                                                          <span className={`text-[10px] font-bold ${isMe ? 'text-cyan-400' : 'text-vodoun-gold'}`}>{isMe ? 'MOI' : msg.user_name.toUpperCase()}</span>
                                                          {userProfile.archetype === 'ADMIN' && (
                                                              <button onClick={() => handleDeleteNexusMessage(msg.id)} className="text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100"><Trash2 size={12}/></button>
                                                          )}
                                                      </div>
                                                      <p className="text-sm">{msg.content}</p>
                                                  </div>
                                              </div>
                                          </div>
                                      );
                                  })}
                                  <div ref={messagesEndRef} />
                              </div>
                              <div className="p-4 bg-black/40 border-t border-white/10">
                                  <div className="flex gap-2">
                                      <input value={nexusInput} onChange={(e) => setNexusInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Message Global..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50" />
                                      <button onClick={handleSendMessage} disabled={!nexusInput.trim()} className="p-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl"><Send size={18} /></button>
                                  </div>
                              </div>
                          </div>
                      ) : (
                          <div className="flex-1 glass-panel border border-vodoun-purple/20 rounded-2xl overflow-hidden flex flex-col relative">
                              <div className="p-4 border-b border-white/10 bg-black/20 flex gap-2">
                                  <input 
                                    placeholder="Matricule Destinataire (ex: W26-...)" 
                                    value={pmRecipient} 
                                    onChange={e => setPmRecipient(e.target.value.toUpperCase())}
                                    className="bg-black/50 border border-gray-600 rounded px-3 py-2 text-white text-sm w-full"
                                  />
                              </div>
                              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar pb-24">
                                  {privateMessages.filter(m => m.sender_matricule === pmRecipient || m.receiver_matricule === pmRecipient).length === 0 && (
                                      <div className="text-center text-gray-500 mt-10">
                                          <Mail size={32} className="mx-auto mb-2 opacity-50"/>
                                          <p>Aucun message avec ce matricule.</p>
                                          <p className="text-xs">Cliquez sur un utilisateur dans le Panthéon pour commencer.</p>
                                      </div>
                                  )}
                                  {privateMessages.filter(m => m.sender_matricule === pmRecipient || m.receiver_matricule === pmRecipient).map((msg) => {
                                      const isMe = msg.sender_matricule === userProfile.matricule;
                                      return (
                                          <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                                              <div className={`rounded-2xl p-3 max-w-[80%] ${isMe ? 'bg-vodoun-purple/20 border border-vodoun-purple/30 text-white rounded-br-none' : 'bg-white/5 border border-white/10 text-gray-200 rounded-bl-none'}`}>
                                                  <p className="text-sm">{msg.content}</p>
                                                  <span className="text-[9px] text-gray-500 block text-right mt-1">{new Date(msg.created_at).toLocaleTimeString()}</span>
                                              </div>
                                          </div>
                                      );
                                  })}
                              </div>
                              <div className="p-4 bg-black/40 border-t border-white/10">
                                  <div className="flex gap-2">
                                      <input value={pmInput} onChange={(e) => setPmInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendPM()} placeholder="Message Privé..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-vodoun-purple/50" />
                                      <button onClick={handleSendPM} disabled={!pmInput.trim() || !pmRecipient} className="p-3 bg-vodoun-purple hover:bg-vodoun-purple/80 text-white rounded-xl"><Send size={18} /></button>
                                  </div>
                              </div>
                          </div>
                      )}
                  </div>
              )}
              
              {currentView === 'ADMIN' && userProfile.archetype === 'ADMIN' && (
                  <div className="animate-in slide-in-from-bottom-4 max-w-4xl mx-auto space-y-8 pb-20">
                      <div className="text-center mb-6">
                        <h2 className="text-3xl font-display font-bold text-white text-red-500 flex items-center justify-center gap-2">
                            <Key size={32} /> ADMINISTRATION SUPRÊME
                        </h2>
                        {adminStatus && <p className="text-vodoun-gold mt-2">{adminStatus}</p>}
                        
                        <div className="flex justify-center gap-4 mt-6">
                            <button onClick={() => setAdminTab('CONTENT')} className={`px-4 py-2 rounded font-bold ${adminTab === 'CONTENT' ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400'}`}>CONTENU</button>
                            <button onClick={() => setAdminTab('USERS')} className={`px-4 py-2 rounded font-bold ${adminTab === 'USERS' ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400'}`}>UTILISATEURS</button>
                            <button onClick={() => setAdminTab('PARTNERS')} className={`px-4 py-2 rounded font-bold ${adminTab === 'PARTNERS' ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400'}`}>PARTENAIRES</button>
                        </div>
                      </div>

                      {adminTab === 'CONTENT' && (
                          <div className="space-y-8">
                                <div className="glass-panel p-6 rounded-xl border border-red-500/30">
                                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Edit3 size={18}/> Publier une News</h3>
                                    <div className="space-y-4">
                                        <input placeholder="Titre" className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white" value={adminNewsTitle} onChange={e => setAdminNewsTitle(e.target.value)}/>
                                        <select className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white" value={adminNewsCat} onChange={e => setAdminNewsCat(e.target.value)}>
                                            <option value="Tech">Tech</option><option value="Culture">Culture</option><option value="Event">Event</option>
                                        </select>
                                        <textarea placeholder="Contenu (extrait)" className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white" value={adminNewsContent} onChange={e => setAdminNewsContent(e.target.value)}/>
                                        <button onClick={handleCreateNews} className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded">PUBLIER</button>
                                    </div>
                                    
                                    <div className="mt-8 border-t border-white/10 pt-4">
                                        <h4 className="text-sm font-bold text-gray-400 mb-2">Gérer les News existantes</h4>
                                        <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                            {newsList.map(n => (
                                                <div key={n.id} className="flex justify-between items-center bg-white/5 p-2 rounded">
                                                    <span className="text-xs text-white truncate w-2/3">{n.title}</span>
                                                    <button onClick={() => handleDeleteNews(n.id)} className="text-red-500 hover:text-red-400"><Trash2 size={14}/></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-panel p-6 rounded-xl border border-red-500/30">
                                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><PlusCircle size={18}/> Ajouter Vocabulaire</h3>
                                    <div className="space-y-4">
                                        <input placeholder="Mot Français" className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white" value={adminVocabFr} onChange={e => setAdminVocabFr(e.target.value)}/>
                                        <input placeholder="Mot Fon" className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white" value={adminVocabFon} onChange={e => setAdminVocabFon(e.target.value)}/>
                                        <button onClick={handleAddVocab} className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded">AJOUTER</button>
                                    </div>

                                    <div className="mt-8 border-t border-white/10 pt-4">
                                        <h4 className="text-sm font-bold text-gray-400 mb-2">Gérer le Vocabulaire</h4>
                                        <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                            {vocabularyList.map(v => (
                                                <div key={v.id} className="flex justify-between items-center bg-white/5 p-2 rounded">
                                                    <span className="text-xs text-white truncate w-2/3">{v.fr} - {v.fon}</span>
                                                    <button onClick={() => handleDeleteVocab(v.id)} className="text-red-500 hover:text-red-400"><Trash2 size={14}/></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                          </div>
                      )}

                      {adminTab === 'USERS' && (
                          <div className="glass-panel p-6 rounded-xl border border-red-500/30">
                              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Users size={18}/> Utilisateurs du Système ({adminUsers.length})</h3>
                              <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                                  {adminUsers.map(u => (
                                      <div key={u.matricule} className="flex justify-between items-center bg-white/5 p-3 rounded">
                                          <div className="flex items-center gap-3">
                                              <img src={getAvatarUrl(u.matricule, u.avatar_style)} className="w-8 h-8 rounded-full" />
                                              <div>
                                                  <p className="font-bold text-white text-sm">{u.name}</p>
                                                  <p className="text-xs text-gray-500 font-mono">{u.matricule} • Niv {u.level}</p>
                                              </div>
                                          </div>
                                          <button onClick={() => handleAdminDM(u.matricule)} className="px-3 py-1 bg-vodoun-purple/20 text-vodoun-purple hover:bg-vodoun-purple hover:text-white rounded text-xs font-bold transition-colors">MESSAGE</button>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}

                      {adminTab === 'PARTNERS' && (
                          <div className="glass-panel p-6 rounded-xl border border-red-500/30">
                              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Handshake size={18}/> Gestion Partenaires</h3>
                              <div className="space-y-4 mb-6">
                                  <input placeholder="Nom Partenaire" className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white" value={adminPartnerName} onChange={e => setAdminPartnerName(e.target.value)}/>
                                  <select className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white" value={adminPartnerType} onChange={e => setAdminPartnerType(e.target.value)}>
                                      <option value="OFFICIAL">Officiel</option><option value="TECH">Technologique</option><option value="ACADEMIC">Académique</option>
                                  </select>
                                  <button onClick={handleAddPartner} className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded">AJOUTER PARTENAIRE</button>
                              </div>
                              <div className="space-y-2">
                                  {adminPartners.map(p => (
                                      <div key={p.id} className="flex justify-between items-center bg-white/5 p-3 rounded">
                                          <div>
                                              <p className="text-sm font-bold text-white">{p.name}</p>
                                              <p className="text-xs text-gray-500">{p.type}</p>
                                          </div>
                                          <button onClick={() => handleDeletePartner(p.id)} className="text-red-500 hover:text-red-400"><Trash2 size={14}/></button>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>
              )}

          </div>
        </div>
      );
  }

  return null;
};