
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard as HomeDashboard } from './components/Dashboard';
import { Library } from './components/Library';
import { MentorChat } from './components/MentorChat';
import { StudyZone as StudyPlanner } from './components/StudyZone';
import { MindSanctuary as MentalHealthCheck } from './components/MindSanctuary';
import { Insights as PerformanceReport } from './components/Insights';
import { AppView, Task, MoodEntry } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  
  useEffect(() => {
    const savedTasks = localStorage.getItem('lumina_tasks');
    const savedMoods = localStorage.getItem('lumina_moods');
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedMoods) setMoodHistory(JSON.parse(savedMoods));
  }, []);

  const handleSetTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem('lumina_tasks', JSON.stringify(newTasks));
  };

  const handleAddMood = (entry: MoodEntry) => {
    const updated = [...moodHistory, entry];
    setMoodHistory(updated);
    localStorage.setItem('lumina_moods', JSON.stringify(updated));
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar currentView={currentView} setView={setCurrentView} />
      
      <main className="flex-1 overflow-y-auto relative">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {currentView === 'home' && (
            <HomeDashboard 
              tasks={tasks} 
              moodHistory={moodHistory} 
              onCompleteTask={(id) => handleSetTasks(tasks.map(t => t.id === id ? {...t, completed: !t.completed} : t))}
            />
          )}
          {currentView === 'library' && <Library />}
          {currentView === 'mentor' && <MentorChat />}
          {currentView === 'planner' && <StudyPlanner tasks={tasks} setTasks={handleSetTasks} />}
          {currentView === 'wellness' && <MentalHealthCheck moodHistory={moodHistory} onAddMood={handleAddMood} />}
          {currentView === 'report' && <PerformanceReport moodHistory={moodHistory} tasks={tasks} />}
        </div>
      </main>
    </div>
  );
};

export default App;
