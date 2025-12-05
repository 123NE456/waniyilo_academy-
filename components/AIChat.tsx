
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Loader2, Sparkles, Volume2, Mic } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendMessageToSpirit, generateSpiritVoice } from '../services/geminiService';

// Audio helper
const playAudio = async (base64Audio: string) => {
  try {
    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start(0);
  } catch (e) {
    console.error("Audio playback error", e);
  }
};

export const AIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: 'Bienvenue, voyageur. Je suis l\'Esprit Waniyilo. Je connais les secrets du passé et les codes du futur. Que souhaites-tu découvrir aujourd\'hui ?',
      timestamp: Date.now()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const historyText = messages.map(m => `${m.role === 'user' ? 'Utilisateur' : 'Esprit'}: ${m.text}`);
    const responseText = await sendMessageToSpirit(userMsg.text, historyText.slice(-4));

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const handleSpeak = async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    const audioData = await generateSpiritVoice(text);
    if (audioData) {
      await playAudio(audioData);
    }
    setIsSpeaking(false);
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[90vw] sm:w-[400px] h-[500px] glass-panel rounded-2xl border border-vodoun-gold/30 flex flex-col overflow-hidden shadow-[0_0_30px_rgba(124,58,237,0.2)] animate-float">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-vodoun-purple/20 to-vodoun-red/20 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black border border-vodoun-gold flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-vodoun-purple to-vodoun-orange opacity-50 animate-pulse-slow"></div>
                <Sparkles size={18} className="text-white relative z-10" />
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-sm">ESPRIT WANIYILO</h3>
                <p className="text-xs text-vodoun-green flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-vodoun-green animate-pulse"></span> En ligne
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-vodoun-purple/40 text-white rounded-br-none border border-vodoun-purple/50' 
                    : 'bg-white/5 text-gray-200 rounded-bl-none border border-white/10'
                }`}>
                  {msg.text}
                </div>
                {msg.role === 'model' && (
                  <button 
                    onClick={() => handleSpeak(msg.text)}
                    disabled={isSpeaking}
                    className="mt-1 flex items-center gap-1 text-[10px] text-gray-500 hover:text-vodoun-gold transition-colors"
                  >
                    {isSpeaking ? <Loader2 size={10} className="animate-spin" /> : <Volume2 size={10} />}
                    <span>Écouter</span>
                  </button>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/5 p-3 rounded-2xl rounded-bl-none border border-white/10 flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-vodoun-gold" />
                  <span className="text-xs text-gray-400">L'esprit réfléchit...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10 bg-black/40">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Posez une question à l'IA..."
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-vodoun-gold/50 transition-colors"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="w-10 h-10 rounded-full bg-vodoun-gold/20 hover:bg-vodoun-gold/40 flex items-center justify-center text-vodoun-gold transition-colors disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 md:w-16 md:h-16 rounded-full glass-panel border border-vodoun-gold/50 flex items-center justify-center text-white shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all duration-300 hover:scale-110 group ${isOpen ? 'rotate-90 opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <div className="absolute inset-0 rounded-full bg-vodoun-gold opacity-10 animate-ping"></div>
        <MessageSquare size={28} className="group-hover:text-vodoun-gold transition-colors" />
      </button>
    </div>
  );
};
