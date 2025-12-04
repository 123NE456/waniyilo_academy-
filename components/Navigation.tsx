
import React, { useState } from 'react';
import { Menu, X, Cpu, BookOpen, Map, Users, FlaskConical, Newspaper } from 'lucide-react';
import { Section } from '../types';

interface NavigationProps {
  currentSection: Section;
  onNavigate: (section: Section) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentSection, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: Section.HOME, label: 'Accueil', icon: <Cpu size={18} /> },
    { id: Section.ABOUT, label: 'Vision', icon: <Users size={18} /> },
    { id: Section.CULTURE, label: 'Patrimoine', icon: <Map size={18} /> },
    { id: Section.ACADEMY, label: 'Académie', icon: <BookOpen size={18} /> },
    { id: Section.LAB, label: 'Labo IA', icon: <FlaskConical size={18} /> },
    { id: Section.NEWS, label: 'Actu', icon: <Newspaper size={18} /> },
  ];

  const handleNav = (section: Section) => {
    onNavigate(section);
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 glass-panel border-b border-vodoun-purple/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center cursor-pointer group" onClick={() => handleNav(Section.HOME)}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-vodoun-red to-vodoun-purple flex items-center justify-center animate-pulse-slow group-hover:scale-110 transition-transform">
              <span className="font-display font-bold text-white text-xl">W</span>
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-display font-bold tracking-wider text-white group-hover:text-vodoun-gold transition-colors">
                WANIYILO <span className="text-vodoun-gold text-sm font-tech">2026</span>
              </h1>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                    currentSection === item.id
                      ? 'bg-vodoun-purple/20 text-vodoun-gold border border-vodoun-gold/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden glass-panel border-t border-gray-700 absolute w-full">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`flex items-center gap-3 w-full text-left px-3 py-4 rounded-md text-base font-medium ${
                  currentSection === item.id
                    ? 'bg-vodoun-purple/20 text-vodoun-gold'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};
