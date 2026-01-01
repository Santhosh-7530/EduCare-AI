
import React, { useState } from 'react';
// Fix: Removed non-existent JournalEntry import from types
import { Mood, MoodEntry } from '../types';
import { analyzeJournalStream } from '../services/geminiService';
import { Heart, Send, Sparkles, Loader2, History } from 'lucide-react';

interface MindSanctuaryProps {
  moodHistory: MoodEntry[];
  onAddMood: (entry: MoodEntry) => void;
}

export const MindSanctuary: React.FC<MindSanctuaryProps> = ({ moodHistory, onAddMood }) => {
  const [journal, setJournal] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);

  const moods = [
    { type: Mood.EXCITED, emoji: '🤩' },
    { type: Mood.HAPPY, emoji: '😊' },
    { type: Mood.CALM, emoji: '🧘' },
    { type: Mood.TIRED, emoji: '😴' },
    { type: Mood.STRESSED, emoji: '😫' },
    { type: Mood.ANXIOUS, emoji: '😰' },
    { type: Mood.SAD, emoji: '😢' },
  ];

  const handleSubmitJournal = async () => {
    if (!journal) return;
    setAnalyzing(true);
    setFeedback('');
    
    let fullText = '';
    try {
      const stream = analyzeJournalStream(journal);
      for await (const chunk of stream) {
        fullText += (chunk || '');
        setFeedback(fullText);
      }
      
      if (selectedMood) {
        onAddMood({
          date: new Date().toISOString(),
          mood: selectedMood,
          note: journal,
          stressLevel: 5
        });
      }
    } catch (e) {
      console.error(e);
      setFeedback('Sorry, I encountered an issue while reflecting on your entry. Please try again later.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Mind Sanctuary</h1>
        <p className="text-slate-500 mt-1">A safe space for your thoughts and well-being.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold mb-6">How are you feeling right now?</h2>
            <div className="grid grid-cols-4 md:grid-cols-7 gap-4">
              {moods.map(m => (
                <button
                  key={m.type}
                  onClick={() => setSelectedMood(m.type)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
                    selectedMood === m.type 
                      ? 'bg-indigo-600 text-white scale-110 shadow-lg' 
                      : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-[10px] font-bold uppercase tracking-tight">{m.type.substring(0, 3)}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Mindful Journaling
            </h2>
            <div className="relative">
              <textarea
                value={journal}
                onChange={(e) => setJournal(e.target.value)}
                placeholder="What's on your mind today? Don't worry, I'm here to listen..."
                className="w-full h-48 p-4 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all placeholder:text-slate-400"
              />
              <button
                onClick={handleSubmitJournal}
                disabled={analyzing || !journal}
                className="absolute bottom-4 right-4 bg-slate-900 text-white p-3 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-lg"
              >
                {analyzing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
              </button>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          {feedback && (
            <section className="bg-indigo-50 border-2 border-indigo-200 p-8 rounded-3xl animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-indigo-600 p-2 rounded-lg">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-indigo-900">AI Companion Response</h2>
              </div>
              <div className="prose prose-indigo text-indigo-800 leading-relaxed italic whitespace-pre-wrap">
                {feedback}
                {analyzing && <span className="inline-block w-2 h-4 ml-1 bg-indigo-400 animate-pulse" />}
              </div>
            </section>
          )}

          <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-slate-400" />
              Mood History
            </h2>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {moodHistory.slice().reverse().map((entry, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl">
                  <span className="text-2xl mt-1">
                    {moods.find(m => m.type === entry.mood)?.emoji || '🧘'}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-slate-800 capitalize">{entry.mood.toLowerCase()}</p>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                    </div>
                    {entry.note && <p className="text-sm text-slate-500 line-clamp-2 italic">"{entry.note}"</p>}
                  </div>
                </div>
              ))}
              {moodHistory.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <p>No entries yet. Start by sharing how you feel.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
