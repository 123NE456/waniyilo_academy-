

import React, { useState, useEffect } from 'react';
import { Newspaper, ArrowUpRight, Handshake, User, Phone, X, CheckCircle, Loader2 } from 'lucide-react';
import { NewsItem, Section, Partner } from '../types';
import { fetchPartners, fetchNews } from '../services/supabase';

interface PartnersProps {
    onNavigate: (section: Section) => void;
}

export const PartnersAndNews: React.FC<PartnersProps> = ({ onNavigate }) => {
  const [showContactForm, setShowContactForm] = useState(false);
  const [formStep, setFormStep] = useState<'IDLE' | 'SUBMITTING' | 'SUCCESS'>('IDLE');
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(true);
  const [news, setNews] = useState<NewsItem[]>([]);
  
  const [formData, setFormData] = useState({
      nom: '',
      prenom: '',
      telephone: ''
  });

  useEffect(() => {
    fetchPartners().then(data => {
        setPartners(data);
        setLoadingPartners(false);
    });
    fetchNews().then(data => setNews(data.slice(0, 3)));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setFormStep('SUBMITTING');
      setTimeout(() => {
          setFormStep('SUCCESS');
          setTimeout(() => {
              setShowContactForm(false);
              setFormStep('IDLE');
              setFormData({ nom: '', prenom: '', telephone: '' });
          }, 2000);
      }, 1500);
  };

  return (
    <div className="py-20 bg-cyber-gray border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* News Section */}
          <div>
             <div className="flex items-center gap-3 mb-8">
                <Newspaper className="text-vodoun-orange" size={24} />
                <h3 className="text-2xl font-display font-bold text-white">ACTUALITÉS</h3>
             </div>
             
             <div className="space-y-6">
                {news.length === 0 ? <p className="text-gray-500">Aucune actualité.</p> : news.map((item) => (
                  <div key={item.id} className="group cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-xs font-mono text-vodoun-orange border border-vodoun-orange/30 px-2 rounded">{item.category}</span>
                       <span className="text-xs text-gray-500">{item.date}</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-200 group-hover:text-vodoun-gold transition-colors">{item.title}</h4>
                    <p className="text-sm text-gray-400 mt-1">{item.excerpt}</p>
                    <div className="h-px w-full bg-white/5 mt-6 group-hover:bg-white/10 transition-colors"></div>
                  </div>
                ))}
             </div>
             <button 
                onClick={() => onNavigate(Section.BLOG)}
                className="mt-8 text-vodoun-orange text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all"
             >
               VOIR TOUT LE BLOG <ArrowUpRight size={16} />
             </button>
          </div>

          {/* Partners Section */}
          <div>
             <div className="flex items-center gap-3 mb-8">
                <Handshake className="text-vodoun-gold" size={24} />
                <h3 className="text-2xl font-display font-bold text-white">PARTENAIRES</h3>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                {loadingPartners ? (
                    <div className="col-span-2 text-center text-gray-500"><Loader2 className="animate-spin inline mr-2"/> Chargement...</div>
                ) : (
                    partners.map((partner) => (
                        <div key={partner.id} className="h-24 glass-panel border border-white/5 flex items-center justify-center p-4 hover:bg-white/5 transition-colors group relative overflow-hidden">
                           <div className={`absolute top-0 right-0 w-2 h-2 rounded-bl ${partner.type === 'OFFICIAL' ? 'bg-vodoun-gold' : 'bg-gray-700'}`}></div>
                           <span className="text-center text-xs font-bold text-gray-500 group-hover:text-white transition-colors tracking-widest">{partner.name}</span>
                        </div>
                    ))
                )}
             </div>

             <div className="mt-10 p-6 rounded-xl bg-gradient-to-r from-vodoun-purple/10 to-transparent border border-vodoun-purple/20">
                <h4 className="text-white font-bold mb-2">Devenir Partenaire</h4>
                <p className="text-sm text-gray-400 mb-4">Rejoignez l'écosystème WANIYILO et participez à la renaissance numérique.</p>
                <button 
                    onClick={() => setShowContactForm(true)}
                    className="px-4 py-2 bg-white text-black font-bold text-sm rounded hover:bg-gray-200 transition-colors"
                >
                  NOUS CONTACTER
                </button>
             </div>
          </div>
        </div>

        {/* Contact Form Modal */}
        {showContactForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                <div className="w-full max-w-lg glass-panel border border-vodoun-purple/30 rounded-2xl relative animate-in zoom-in-95 duration-300">
                    <button 
                        onClick={() => setShowContactForm(false)} 
                        className="absolute top-4 right-4 text-gray-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>

                    <div className="p-8">
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-display font-bold text-white mb-2">CONTACTEZ-NOUS</h3>
                            <p className="text-sm text-gray-400">Laissez vos coordonnées pour rejoindre l'initiative.</p>
                        </div>

                        {formStep === 'SUCCESS' ? (
                            <div className="flex flex-col items-center py-8">
                                <CheckCircle size={64} className="text-vodoun-green mb-4 animate-bounce" />
                                <h4 className="text-xl font-bold text-white">Message Reçu !</h4>
                                <p className="text-gray-400 text-center mt-2">L'équipe G-CROWN vous répondra rapidement.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500 uppercase font-mono">Nom</label>
                                        <div className="relative">
                                            <User size={16} className="absolute left-3 top-3 text-gray-500" />
                                            <input 
                                                required name="nom" value={formData.nom} onChange={handleInputChange}
                                                className="w-full bg-black/40 border border-gray-700 rounded p-2.5 pl-10 text-white text-sm focus:border-vodoun-purple focus:outline-none" 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500 uppercase font-mono">Prénom</label>
                                        <input 
                                            required name="prenom" value={formData.prenom} onChange={handleInputChange}
                                            className="w-full bg-black/40 border border-gray-700 rounded p-2.5 text-white text-sm focus:border-vodoun-purple focus:outline-none" 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500 uppercase font-mono">Téléphone (+229)</label>
                                    <div className="relative">
                                        <Phone size={16} className="absolute left-3 top-3 text-gray-500" />
                                        <input 
                                            required name="telephone" type="tel" placeholder="+229..." value={formData.telephone} onChange={handleInputChange}
                                            className="w-full bg-black/40 border border-gray-700 rounded p-2.5 pl-10 text-white text-sm focus:border-vodoun-purple focus:outline-none" 
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={formStep === 'SUBMITTING'}
                                    className="w-full py-3 mt-4 bg-vodoun-purple hover:bg-vodoun-purple/80 text-white font-bold font-tech uppercase rounded transition-colors disabled:opacity-50"
                                >
                                    {formStep === 'SUBMITTING' ? 'ENVOI EN COURS...' : 'ENVOYER LA DEMANDE'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};