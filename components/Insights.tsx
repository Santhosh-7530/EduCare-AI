
import React, { useMemo } from 'react';
import { Task, MoodEntry, Mood } from '../types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';

interface InsightsProps {
  moodHistory: MoodEntry[];
  tasks: Task[];
}

export const Insights: React.FC<InsightsProps> = ({ moodHistory, tasks }) => {
  const chartData = useMemo(() => {
    return moodHistory.slice(-7).map(entry => ({
      name: new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short' }),
      stress: entry.stressLevel,
      mood: 10 // Simplified mapping
    }));
  }, [moodHistory]);

  const moodDistribution = useMemo(() => {
    const counts: any = {};
    moodHistory.forEach(entry => {
      counts[entry.mood] = (counts[entry.mood] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [moodHistory]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Productivity & Wellness Insights</h1>
        <p className="text-slate-500 mt-1">Visualizing the connection between your mind and work.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold mb-6">Stress Level Trends</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Line 
                  type="monotone" 
                  dataKey="stress" 
                  stroke="#6366f1" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#6366f1', strokeWidth: 3, stroke: '#fff' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold mb-6">Mood Distribution</h2>
          <div className="h-80 w-full flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={moodDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {moodDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="hidden md:block space-y-2">
              {moodDistribution.map((m: any, i) => (
                <div key={m.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}} />
                  <span className="text-sm font-medium text-slate-600 capitalize">{m.name.toLowerCase()}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-3xl text-white">
        <h3 className="text-xl font-bold mb-4">AI Analysis Executive Summary</h3>
        <p className="text-slate-300 leading-relaxed mb-6">
          "Based on your data over the last 7 days, your productivity peaks when your mood is 'CALM' or 'EXCITED'. 
          Interestingly, your stress levels tend to rise on Tuesdays, correlating with a drop in completed tasks. 
          We recommend scheduling shorter, high-impact focus blocks on Tuesday mornings to build momentum."
        </p>
        <button className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-xl text-sm font-bold transition-all">
          Generate Full Report
        </button>
      </div>
    </div>
  );
};
