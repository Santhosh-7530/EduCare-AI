
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Sparkles, Loader2, MessageCircle, Volume2, VolumeX, GraduationCap, Coffee, Trophy, Brain } from 'lucide-react';
import { mentorChatStream, generateFollowUpQuestions, speakGuidance, decodeBase64, decodeAudioData } from '../services/geminiService';
import { ChatMessage, MentorPersona } from '../types';

export const MentorChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hi! I am EduCare AI, your AI Study Mentor. What can I help you understand today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [persona, setPersona] = useState<MentorPersona>('balanced');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const playMessage = async (text: string) => {
    if (!text || isSpeaking) return;
    
    setIsSpeaking(true);
    const ctx = initAudioContext();
    
    try {
      const audioBase64 = await speakGuidance(text.substring(0, 1000)); // Limit length for TTS stability
      if (audioBase64) {
        const audioData = decodeBase64(audioBase64);
        const buffer = await decodeAudioData(audioData, ctx);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.onended = () => setIsSpeaking(false);
        source.start();
      } else {
        setIsSpeaking(false);
      }
    } catch (e) {
      console.error('TTS Error:', e);
      setIsSpeaking(false);
    }
  };

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isTyping) return;

    const userMessage: ChatMessage = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSuggestions([]);
    setIsTyping(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    let modelResponseText = '';
    try {
      const stream = mentorChatStream(textToSend, history, persona);
      setMessages(prev => [...prev, { role: 'model', text: '' }]);
      
      for await (const chunk of stream) {
        modelResponseText += chunk;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].text = modelResponseText;
          return updated;
        });
      }

      // After streaming finishes, generate suggestions
      const followUps = await generateFollowUpQuestions(textToSend, modelResponseText);
      setSuggestions(followUps);

      // Auto-speak if enabled
      if (autoSpeak) {
        playMessage(modelResponseText);
      }

    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I am having trouble connecting right now.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const personas = [
    { id: 'balanced', label: 'Balanced', icon: Brain, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'formal', label: 'Formal', icon: GraduationCap, color: 'text-slate-700', bg: 'bg-slate-100' },
    { id: 'casual', label: 'Casual', icon: Coffee, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'encouraging', label: 'Coach', icon: Trophy, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] animate-in fade-in duration-500">
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">AI Chat Mentor</h1>
          <p className="text-slate-500 mt-1">Your 24/7 personal tutor, now with custom tones.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
            {personas.map((p) => (
              <button
                key={p.id}
                onClick={() => setPersona(p.id as MentorPersona)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  persona === p.id 
                    ? `${p.bg} ${p.color} shadow-sm` 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <p.icon className="w-3.5 h-3.5" />
                {p.label}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => {
              initAudioContext();
              setAutoSpeak(!autoSpeak);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all shadow-sm ${
              autoSpeak 
                ? 'bg-indigo-600 text-white shadow-indigo-100' 
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="text-sm">{autoSpeak ? 'Voice On' : 'Voice Off'}</span>
          </button>
        </div>
      </header>

      <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        {/* Mobile Persona Selector */}
        <div className="lg:hidden flex justify-around p-2 border-b border-slate-100 bg-slate-50/30">
          {personas.map((p) => (
            <button
              key={p.id}
              onClick={() => setPersona(p.id as MentorPersona)}
              className={`p-2 rounded-xl transition-all ${
                persona === p.id 
                  ? `${p.bg} ${p.color} ring-1 ring-inset ring-black/5` 
                  : 'text-slate-400'
              }`}
              title={p.label}
            >
              <p.icon className="w-5 h-5" />
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar" ref={scrollRef}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                  msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-indigo-600'
                }`}>
                  {msg.role === 'user' ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                </div>
                <div className="relative group">
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100'
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  </div>
                  
                  {msg.role === 'model' && msg.text && (
                    <button 
                      onClick={() => playMessage(msg.text)}
                      className="absolute -right-10 top-2 p-2 text-slate-300 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100"
                      title="Speak message"
                    >
                      <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse text-indigo-600' : ''}`} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isTyping && messages[messages.length-1].text === '' && (
            <div className="flex justify-start">
              <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                <span className="text-xs text-slate-400 font-medium italic">EduCare AI is thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggestions chips */}
        {suggestions.length > 0 && !isTyping && (
          <div className="px-6 py-2 flex flex-wrap gap-2 animate-in slide-in-from-bottom-2 duration-300">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSend(s)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold rounded-full hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"
              >
                <MessageCircle className="w-3 h-3" />
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="relative max-w-4xl mx-auto">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={`Ask ${persona.charAt(0).toUpperCase() + persona.slice(1)} EduCare AI anything...`}
              className="w-full pl-6 pr-16 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
            />
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[10px] text-center text-slate-400 mt-2">
            Currently using <strong>{persona}</strong> tone. Select a different icon above to change.
          </p>
        </div>
      </div>
    </div>
  );
};
