
import React from 'react';
import { LayoutDashboard, FileText, MessageSquare, BookOpen, Heart, BarChart2, Sparkles } from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: 'home', icon: LayoutDashboard, label: 'Home' },
    { id: 'library', icon: FileText, label: 'Upload' },
    { id: 'mentor', icon: MessageSquare, label: 'Chat Mentor' },
    { id: 'planner', icon: BookOpen, label: 'Planner' },
    { id: 'wellness', icon: Heart, label: 'Wellness' },
    { id: 'report', icon: BarChart2, label: 'Report' },
  ];

  return (
    <aside className="w-20 md:w-64 bg-white border-r border-slate-200 flex flex-col h-full transition-all z-20">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-lg shadow-sm group cursor-pointer">
          <Sparkles className="w-6 h-6 text-white transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
        </div>
        <span className="hidden md:block font-bold text-xl text-slate-800 tracking-tight">EduCare AI</span>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as AppView)}
            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group relative ${
              currentView === item.id
                ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            {/* Active Indicator Bar */}
            {currentView === item.id && (
              <div className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full" />
            )}
            
            <item.icon 
              className={`w-5 h-5 shrink-0 transition-all duration-300 ease-out 
                ${currentView === item.id 
                  ? 'text-indigo-600 scale-110 rotate-0' 
                  : 'group-hover:text-slate-800 group-hover:scale-110 group-hover:-rotate-6'
                }`} 
            />
            
            <span className={`hidden md:block font-medium text-sm transition-colors duration-200 ${
              currentView === item.id ? 'text-indigo-700' : 'group-hover:text-slate-900'
            }`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="hidden md:block bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl text-white shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 transition-transform duration-700 group-hover:scale-150 group-hover:rotate-12">
            <Sparkles className="w-12 h-12" />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-semibold opacity-80 uppercase tracking-wider mb-1">Deep Focus</p>
            <p className="text-sm font-medium">Ready to start?</p>
            <button 
              onClick={() => setView('planner')}
              className="mt-3 w-full bg-white/20 hover:bg-white/30 py-2 rounded-lg text-xs font-bold transition-all duration-200 active:scale-95"
            >
              Go to Planner
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
