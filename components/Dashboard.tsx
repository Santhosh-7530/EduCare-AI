
import React from 'react';
import { Task, MoodEntry, Mood } from '../types';
import { CheckCircle2, Clock, Calendar, Brain } from 'lucide-react';

interface DashboardProps {
  tasks: Task[];
  moodHistory: MoodEntry[];
  onCompleteTask: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ tasks, moodHistory, onCompleteTask }) => {
  const todayTasks = tasks.filter(t => !t.completed);
  const completedToday = tasks.filter(t => t.completed).length;
  const currentMood = moodHistory[moodHistory.length - 1]?.mood || Mood.CALM;

  const moodEmojis: Record<Mood, string> = {
    [Mood.EXCITED]: '🤩',
    [Mood.HAPPY]: '😊',
    [Mood.CALM]: '🧘',
    [Mood.TIRED]: '😴',
    [Mood.STRESSED]: '😫',
    [Mood.ANXIOUS]: '😰',
    [Mood.SAD]: '😢',
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Welcome back, Scholar</h1>
        <p className="text-slate-500 mt-1">Let's make today productive and peaceful.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />} 
          label="Tasks Completed" 
          value={completedToday.toString()} 
          color="bg-emerald-50"
        />
        <StatCard 
          icon={<Clock className="w-6 h-6 text-indigo-600" />} 
          label="Study Hours" 
          value="4.5h" 
          color="bg-indigo-50"
        />
        <StatCard 
          icon={<Calendar className="w-6 h-6 text-amber-600" />} 
          label="Current Streak" 
          value="12 days" 
          color="bg-amber-50"
        />
        <StatCard 
          icon={<Brain className="w-6 h-6 text-purple-600" />} 
          label="Focus Score" 
          value="88%" 
          color="bg-purple-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-600" />
              Focus Tasks
            </h2>
            <div className="space-y-3">
              {todayTasks.length > 0 ? (
                todayTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer group" onClick={() => onCompleteTask(task.id)}>
                    <div className="flex items-center gap-4">
                      <div className="w-6 h-6 rounded-full border-2 border-slate-300 group-hover:border-indigo-500 flex items-center justify-center transition-colors">
                        <div className="w-3 h-3 bg-indigo-500 rounded-full scale-0 group-hover:scale-100 transition-transform" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{task.title}</p>
                        <p className="text-xs text-slate-500">{task.category} • {task.duration} mins</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                      task.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-center py-8 italic">All tasks done for now! Take a break.</p>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Current Vibe</h2>
            <div className="flex flex-col items-center py-4 bg-gradient-to-br from-slate-50 to-indigo-50 rounded-2xl">
              <span className="text-6xl mb-4">{moodEmojis[currentMood]}</span>
              <p className="font-bold text-slate-800 capitalize">{currentMood.toLowerCase()}</p>
              <p className="text-sm text-slate-500 text-center px-4 mt-2">
                "Small steps every day lead to big results."
              </p>
            </div>
          </section>

          <section className="bg-indigo-600 p-6 rounded-3xl text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-lg font-bold mb-2">Daily Insight</h2>
              <p className="text-sm opacity-90 leading-relaxed">
                You tend to focus best after a 10-minute meditation. Try the Mind Sanctuary before your next study block.
              </p>
            </div>
            <Sparkles className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10" />
          </section>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string, color: string }> = ({ icon, label, value, color }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
    <div className={`p-3 rounded-2xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

const Sparkles: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
  </svg>
);
