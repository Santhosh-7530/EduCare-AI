
import React, { useState, useEffect, useRef } from 'react';
import { generateStudyPlan, speakGuidance, decodeBase64, decodeAudioData } from '../services/geminiService';
import { Task, StudyPlan } from '../types';
import { Play, Pause, RotateCcw, Plus, BrainCircuit, Loader2, Volume2, BookOpenCheck, Coffee, Search, Settings2, ExternalLink, Bell, BellOff } from 'lucide-react';

interface StudyZoneProps {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
}

export const StudyZone: React.FC<StudyZoneProps> = ({ tasks, setTasks }) => {
  const [topic, setTopic] = useState('');
  const [hours, setHours] = useState(2);
  const [learningStyle, setLearningStyle] = useState('balanced');
  const [includeBreaks, setIncludeBreaks] = useState(true);
  const [includeReviews, setIncludeReviews] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [timer, setTimer] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [showTimerSettings, setShowTimerSettings] = useState(false);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const alarmIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive && !isAlarmActive) {
      setTimer(isBreak ? breakDuration * 60 : focusDuration * 60);
    }
  }, [focusDuration, breakDuration, isBreak, isActive, isAlarmActive]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(t => t - 1);
      }, 1000);
    } else if (timer === 0 && isActive) {
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const playBeep = (freq: number, duration: number, startTime: number) => {
    const ctx = initAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);
    
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.2, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  const startAlarmSound = () => {
    const ctx = initAudioContext();
    if (alarmIntervalRef.current) return;

    const playSequence = () => {
      const now = ctx.currentTime;
      // Play a triple beep sequence
      playBeep(880, 0.1, now);
      playBeep(880, 0.1, now + 0.2);
      playBeep(880, 0.1, now + 0.4);
    };

    playSequence();
    alarmIntervalRef.current = window.setInterval(playSequence, 2000);
  };

  const stopAlarmSound = () => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
    setIsAlarmActive(false);
  };

  const handleTimerComplete = () => {
    setIsActive(false);
    setIsAlarmActive(true);
    startAlarmSound();
  };

  const dismissAlarm = () => {
    stopAlarmSound();
    const nextModeIsBreak = !isBreak;
    setIsBreak(nextModeIsBreak);
    setTimer(nextModeIsBreak ? breakDuration * 60 : focusDuration * 60);
  };

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const plan: StudyPlan = await generateStudyPlan(topic, hours, learningStyle, includeBreaks, includeReviews);
      const newTasks: Task[] = plan.sessions.map((s) => ({
        id: Math.random().toString(36).substr(2, 9),
        title: s.topic,
        category: plan.title,
        duration: s.duration,
        completed: false,
        priority: s.topic.toLowerCase().includes('break') ? 'Low' : 'Medium',
        links: s.resources
      }));
      setTasks([...tasks, ...newTasks]);
      setTopic('');
    } catch (error) {
      console.error(error);
      alert("Failed to generate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceGuidance = async () => {
    const ctx = initAudioContext();
    setLoading(true);
    try {
      const audioBase64 = await speakGuidance("Focus on your task. Take deep breaths and proceed with calm concentration.");
      if (audioBase64) {
        const audioData = decodeBase64(audioBase64);
        const buffer = await decodeAudioData(audioData, ctx);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalDurationSeconds = (isBreak ? breakDuration : focusDuration) * 60;
  const progress = (1 - timer / totalDurationSeconds) * 360;

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Study Zone</h1>
          <p className="text-slate-500 mt-1">Deep work tools with an adjustable Pomodoro timer.</p>
        </div>
        <button 
          onClick={handleVoiceGuidance}
          disabled={loading}
          className="flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl font-semibold hover:bg-indigo-200 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
          Mindful Prompt
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Adjustable Timer Section */}
        <div className={`bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center relative overflow-hidden transition-all duration-500 ${isAlarmActive ? 'ring-4 ring-orange-400' : ''}`}>
          <button 
            onClick={() => setShowTimerSettings(!showTimerSettings)}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-lg bg-slate-50 hover:bg-indigo-50"
            title="Timer Settings"
          >
            <Settings2 className="w-5 h-5" />
          </button>

          {showTimerSettings ? (
            <div className="w-full max-w-xs space-y-6 py-12 animate-in fade-in zoom-in-95">
              <h3 className="text-lg font-bold text-slate-800 text-center">Timer Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Focus Duration (Mins)</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" min="1" max="60" value={focusDuration} 
                      onChange={(e) => setFocusDuration(parseInt(e.target.value))}
                      className="flex-1 accent-indigo-600"
                    />
                    <span className="font-mono font-bold text-indigo-600 w-8">{focusDuration}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Break Duration (Mins)</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" min="1" max="30" value={breakDuration} 
                      onChange={(e) => setBreakDuration(parseInt(e.target.value))}
                      className="flex-1 accent-emerald-500"
                    />
                    <span className="font-mono font-bold text-emerald-600 w-8">{breakDuration}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setShowTimerSettings(false)}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm"
              >
                Save & Close
              </button>
            </div>
          ) : (
            <>
              <div className="relative mt-8">
                <div className={`w-64 h-64 rounded-full border-8 border-slate-100 flex flex-col items-center justify-center transition-all ${isAlarmActive ? 'animate-pulse scale-105' : ''}`}>
                  <span className={`text-6xl font-mono font-bold tracking-tighter transition-colors duration-500 ${isAlarmActive ? 'text-orange-600' : (isBreak ? 'text-emerald-600' : 'text-slate-800')}`}>
                    {formatTime(timer)}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
                    {isAlarmActive ? "Time's Up!" : (isBreak ? "Resting" : "Focusing")}
                  </span>
                </div>
                <div 
                  className={`absolute inset-0 w-64 h-64 rounded-full border-8 transition-all duration-1000 ${isAlarmActive ? 'border-orange-500 animate-ping opacity-20' : (isBreak ? 'border-emerald-500' : 'border-indigo-600')} border-t-transparent`}
                  style={{ transform: `rotate(${isAlarmActive ? 0 : progress}deg)` }}
                />
              </div>

              <div className="flex gap-4 mt-8">
                {isAlarmActive ? (
                  <button 
                    onClick={dismissAlarm}
                    className="flex items-center gap-2 px-8 py-4 bg-orange-600 text-white rounded-2xl font-bold shadow-lg hover:bg-orange-700 transition-all transform hover:scale-105 active:scale-95 animate-bounce"
                  >
                    <BellOff className="w-6 h-6" />
                    Dismiss Alarm
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => setIsActive(!isActive)}
                      className={`p-4 rounded-2xl ${isActive ? 'bg-slate-100 text-slate-700' : 'bg-indigo-600 text-white'} transition-all shadow-lg hover:scale-105 active:scale-95`}
                    >
                      {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                    </button>
                    <button 
                      onClick={() => { setIsActive(false); setTimer(isBreak ? breakDuration * 60 : focusDuration * 60); }}
                      className="p-4 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all shadow-sm"
                    >
                      <RotateCcw className="w-8 h-8" />
                    </button>
                  </>
                )}
              </div>

              {!isAlarmActive && (
                <div className="text-center mt-6 mb-4">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`w-3 h-3 rounded-full transition-colors ${i <= 1 ? (isBreak ? 'bg-emerald-500' : 'bg-indigo-500') : 'bg-slate-200'}`} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* AI Generator Section */}
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-indigo-600" />
              AI Plan Generator
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-600 block mb-1">What are you studying?</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Organic Chemistry, UI Design..."
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-600 block mb-1">Learning Style</label>
                  <select 
                    value={learningStyle}
                    onChange={(e) => setLearningStyle(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm appearance-none"
                  >
                    <option value="balanced">Balanced</option>
                    <option value="visual">Visual (Videos/Charts)</option>
                    <option value="auditory">Auditory (Listen/Talk)</option>
                    <option value="kinesthetic">Kinesthetic (Active/Hands-on)</option>
                    <option value="reading/writing">Reading & Writing</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600 block mb-1">Duration (Hours)</label>
                  <input 
                    type="range" 
                    min="1" 
                    max="12" 
                    value={hours}
                    onChange={(e) => setHours(parseInt(e.target.value))}
                    className="w-full accent-indigo-600 mt-2"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>1h</span>
                    <span className="font-bold text-slate-700">{hours}h</span>
                    <span>12h</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex-1 flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={includeBreaks}
                    onChange={(e) => setIncludeBreaks(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Coffee className="w-3 h-3" /> Breaks
                    </span>
                    <span className="text-[10px] text-slate-500">Scheduled rest</span>
                  </div>
                </label>
                <label className="flex-1 flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={includeReviews}
                    onChange={(e) => setIncludeReviews(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <BookOpenCheck className="w-3 h-3" /> Reviews
                    </span>
                    <span className="text-[10px] text-slate-500">Recap sessions</span>
                  </div>
                </label>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={loading || !topic}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                Generate Roadmap with Links
              </button>
            </div>
          </section>

          <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex-1">
            <h2 className="text-xl font-bold mb-4">Study Roadmap & Links</h2>
            <div className="max-h-[500px] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {tasks.filter(t => !t.completed).map(task => (
                <div key={task.id} className="p-4 bg-slate-50 rounded-xl group hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-indigo-100">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 bg-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors flex items-center justify-center rounded-lg text-indigo-700 font-bold shrink-0 text-xs">
                      {task.duration}m
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 truncate text-sm">{task.title}</p>
                      <p className="text-[10px] text-slate-400">{task.category}</p>
                    </div>
                  </div>
                  {task.links && task.links.length > 0 && (
                    <div className="pl-14 space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Recommended Resources:</p>
                      {task.links.map((link, idx) => (
                        <a 
                          key={idx} 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs text-indigo-600 hover:text-indigo-800 transition-colors py-1 group/link"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span className="truncate group-hover/link:underline">{link.title}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {tasks.filter(t => !t.completed).length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <div className="bg-slate-50 p-4 rounded-full mb-3">
                    <BrainCircuit className="w-8 h-8 opacity-20" />
                  </div>
                  <p className="italic text-sm">Roadmap and relevant links will appear here.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
