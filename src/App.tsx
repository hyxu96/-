/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home as HomeIcon, Calendar as CalendarIcon, ClipboardList, Settings as SettingsIcon, Plus, Dog, Camera } from 'lucide-react';
import { Pet, DailyRecord, PeriodicTask } from './types';
import HomeView from './components/HomeView';
import CalendarView from './components/CalendarView';
import TasksView from './components/TasksView';
import SettingsView from './components/SettingsView';
import OnboardingView from './components/OnboardingView';
import LogHealthOverlay from './components/LogHealthOverlay';
import { format, subDays, addDays, isSameDay, parseISO } from 'date-fns';

type Tab = 'home' | 'calendar' | 'tasks' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [pet, setPet] = useState<Pet | null>(null);
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [tasks, setTasks] = useState<PeriodicTask[]>([]);
  const [showLogOverlay, setShowLogOverlay] = useState(false);
  const [reminderTime, setReminderTime] = useState<string>('20:00');
  const [isFirstTime, setIsFirstTime] = useState(true);

  // Persistence (Mock)
  useEffect(() => {
    const savedPet = localStorage.getItem('pet');
    const savedRecords = localStorage.getItem('records');
    const savedTasks = localStorage.getItem('tasks');
    const savedTime = localStorage.getItem('reminderTime');

    if (savedPet) {
      const parsedPet = JSON.parse(savedPet);
      setPet(parsedPet);
      setIsFirstTime(false);
    }
    if (savedRecords) setRecords(JSON.parse(savedRecords));
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedTime) setReminderTime(savedTime);
  }, []);

  const handleOnboardingComplete = (newPet: Pet, initialTasks: PeriodicTask[]) => {
    setPet(newPet);
    setTasks(initialTasks);
    setIsFirstTime(false);
    localStorage.setItem('pet', JSON.stringify(newPet));
    localStorage.setItem('tasks', JSON.stringify(initialTasks));
  };

  const handleAddRecord = (record: Omit<DailyRecord, 'id' | 'petId'>) => {
    if (!pet) return;
    
    // Check if we already have a record for this date
    const existingIndex = records.findIndex(r => r.date === record.date);
    
    let updated: DailyRecord[];
    if (existingIndex > -1) {
      // Update existing record
      const updatedRecord: DailyRecord = {
        ...records[existingIndex],
        ...record,
        // Ensure id and petId are preserved
        id: records[existingIndex].id,
        petId: records[existingIndex].petId,
      };
      updated = [...records];
      updated[existingIndex] = updatedRecord;
    } else {
      // Add new record
      const newRecord: DailyRecord = {
        ...record,
        id: Math.random().toString(36).substring(2, 9),
        petId: pet.id,
      };
      updated = [...records, newRecord];
    }

    setRecords(updated);
    localStorage.setItem('records', JSON.stringify(updated));

    // Sync task completion if any tasks were recorded
    const updatedTasks = tasks.map(t => {
      const isCompletedInRecord = record.completedTasks?.includes(t.id);
      
      if (isCompletedInRecord) {
        // If it was just completed on this record's date
        if (!t.lastDoneAt || parseISO(record.date) >= parseISO(t.lastDoneAt)) {
          return {
            ...t,
            lastDoneAt: record.date,
            nextDueAt: format(addDays(parseISO(record.date), t.cycleDays), 'yyyy-MM-dd'),
            status: 'done' as const
          };
        }
      }
      return t;
    });

    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    setShowLogOverlay(false);
  };

  const handleTaskComplete = (taskId: string) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    
    // 1. Update Daily Records
    const record = records.find(r => r.date === todayStr);
    const updatedCompletedTasks = Array.from(new Set([...(record?.completedTasks || []), taskId]));
    
    handleAddRecord({
      date: todayStr,
      isAllNormal: (record?.appetite === 'normal' || !record) && 
                   (record?.poop === 'normal' || !record) && 
                   (record?.activity === 'normal' || !record) && 
                   (record?.extraSymptoms.length === 0 || !record),
      appetite: record?.appetite || 'normal',
      poop: record?.poop || 'normal',
      activity: record?.activity || 'normal',
      extraSymptoms: record?.extraSymptoms || [],
      visualEvidence: record?.visualEvidence || [],
      completedTasks: updatedCompletedTasks,
    });
  };

  const todayRecord = records.find(r => isSameDay(parseISO(r.date), new Date()));

  const handleLogout = () => {
    localStorage.clear();
    setPet(null);
    setRecords([]);
    setTasks([]);
    setIsFirstTime(true);
    setActiveTab('home');
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && pet) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedPet = { ...pet, avatar: reader.result as string };
        setPet(updatedPet);
        localStorage.setItem('pet', JSON.stringify(updatedPet));
      };
      reader.readAsDataURL(file);
    }
  };

  if (isFirstTime) {
    return <OnboardingView onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto relative bg-brand-cream overflow-hidden">
      {/* Header */}
      <header className="px-6 pt-10 pb-6 flex justify-between items-center z-30">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-14 h-14 rounded-full border-2 border-white shadow-soft overflow-hidden bg-brand-yellow flex items-center justify-center text-2xl relative group"
          >
            {pet?.avatar && !pet.avatar.startsWith('http') && pet.avatar.length <= 4 ? (
              pet.avatar
            ) : pet?.avatar ? (
              <img src={pet.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <Dog size={24} />
            )}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera size={16} className="text-white" />
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-brand-brown">{pet?.name}</h1>
            <p className="text-xs font-medium text-brand-brown/40">已守护 {records.length + 1} 天 ✨</p>
          </div>
        </div>
        <button 
          onClick={() => setShowLogOverlay(true)}
          className="w-12 h-12 rounded-full bg-brand-brown text-white flex items-center justify-center shadow-soft hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={24} strokeWidth={3} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 px-4 pt-4">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <HomeView 
                pet={pet!} 
                records={records} 
                tasks={tasks} 
                onNavigate={setActiveTab} 
                onOpenLog={() => setShowLogOverlay(true)}
              />
            </motion.div>
          )}
          {activeTab === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CalendarView records={records} allTasks={tasks} />
            </motion.div>
          )}
          {activeTab === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <TasksView tasks={tasks} setTasks={setTasks} onTaskComplete={handleTaskComplete} />
            </motion.div>
          )}
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <SettingsView 
                pet={pet!} 
                setPet={setPet} 
                onLogout={handleLogout} 
                tasks={tasks} 
                setTasks={setTasks} 
                reminderTime={reminderTime}
                setReminderTime={(time) => {
                  setReminderTime(time);
                  localStorage.setItem('reminderTime', time);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Tab Bar */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[85%] max-w-sm h-18 glass rounded-5xl flex items-center justify-around px-2 shadow-heavy z-40">
        <TabButton 
          active={activeTab === 'home'} 
          icon={<HomeIcon size={22} />} 
          label="首页" 
          onClick={() => setActiveTab('home')} 
        />
        <TabButton 
          active={activeTab === 'calendar'} 
          icon={<CalendarIcon size={22} />} 
          label="月刊" 
          onClick={() => setActiveTab('calendar')} 
        />
        <TabButton 
          active={activeTab === 'tasks'} 
          icon={<ClipboardList size={22} />} 
          label="任务" 
          onClick={() => setActiveTab('tasks')} 
        />
        <TabButton 
          active={activeTab === 'settings'} 
          icon={<SettingsIcon size={22} />} 
          label="设置" 
          onClick={() => setActiveTab('settings')} 
        />
      </nav>

      <AnimatePresence>
        {showLogOverlay && (
          <LogHealthOverlay 
            onClose={() => setShowLogOverlay(false)} 
            onSave={handleAddRecord}
            recentRecords={records}
            todayRecord={todayRecord}
            availableTasks={tasks}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function TabButton({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-all duration-300",
        active ? "text-brand-coral scale-110" : "text-brand-brown/40"
      )}
    >
      {icon}
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}

// Utility to merge tailwind classes
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
