import React, { useState } from 'react';
import { Pet, PeriodicTask } from '../types';
import { Bell, Shield, CircleUser, HelpCircle, ChevronRight, LogOut, Heart, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { addDays } from 'date-fns';

interface SettingsViewProps {
  pet: Pet;
  setPet: (pet: Pet) => void;
  onLogout: () => void;
  tasks: PeriodicTask[];
  setTasks: (tasks: PeriodicTask[]) => void;
  reminderTime: string;
  setReminderTime: (time: string) => void;
}

export default function SettingsView({ pet, setPet, onLogout, tasks, setTasks, reminderTime, setReminderTime }: SettingsViewProps) {
  const [showCycleEdit, setShowCycleEdit] = useState(false);
  const [showPetProfile, setShowPetProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const AVATARS = ['🐶', '🐱', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁', '🐯', '🐮', '🐷', '🦒', '🦓', '🐘', '🦘'];
  
  const [editedPet, setEditedPet] = useState(pet);

  const handleSavePet = () => {
    setPet(editedPet);
    localStorage.setItem('pet', JSON.stringify(editedPet));
    setShowPetProfile(false);
  };

  const updateCycle = (id: string, newCycle: number) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === id) {
        const nextDueAt = addDays(new Date(t.lastDoneAt), newCycle);
        const bookingAt = addDays(nextDueAt, -t.bookingOffsetDays);
        return { ...t, cycleDays: newCycle, nextDueAt: nextDueAt.toISOString(), bookingAt: bookingAt.toISOString() };
      }
      return t;
    });
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };

  const updateOffset = (id: string, newOffset: number) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === id) {
        const bookingAt = addDays(new Date(t.nextDueAt), -newOffset);
        return { ...t, bookingOffsetDays: newOffset, bookingAt: bookingAt.toISOString() };
      }
      return t;
    });
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };

  return (
    <div className="space-y-10 pb-20">
      <header className="text-center pt-6">
        <div className="w-28 h-28 rounded-full shadow-heavy mx-auto mb-6 bg-brand-yellow overflow-hidden p-1 bg-white">
           <div className="w-full h-full rounded-full overflow-hidden border-2 border-white shadow-inner bg-brand-yellow flex items-center justify-center text-5xl">
             {pet.avatar && !pet.avatar.startsWith('http') && pet.avatar.length <= 4 ? pet.avatar : pet.avatar ? (
              <img src={pet.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : '🐶'}
           </div>
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-brand-brown">{pet.name}</h2>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-20 mt-1 italic">第 {Math.floor(Math.random() * 100) + 1} 位 MomoPet 守护者 ✨</p>
      </header>

      <section className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-4">个人与通用</h3>
        <div className="bg-white rounded-5xl shadow-soft divide-y divide-brand-brown/5 overflow-hidden">
          <SettingItem 
            icon={<CircleUser size={20} className="text-brand-coral"/>} 
            label="宠物档案" 
            sublabel="修改名字、生日及体重" 
            onClick={() => setShowPetProfile(true)}
          />
          <SettingItem 
            icon={<Clock size={20} className="text-brand-coral"/>} 
            label="护理周期与提醒" 
            sublabel="设置美容、驱虫等频率及预约提醒" 
            onClick={() => setShowCycleEdit(true)}
          />
          <SettingItem 
            icon={<Bell size={20} className="text-brand-coral"/>} 
            label="提醒与通知" 
            sublabel={`每日 ${reminderTime} 健康提醒`} 
            onClick={() => setShowNotifications(true)}
          />
        </div>
      </section>

      <div className="px-2 mt-6 space-y-4">
        <button 
          onClick={onLogout}
          className="w-full py-5 rounded-4xl bg-white text-brand-brown/40 font-bold text-sm flex items-center justify-center gap-2 shadow-soft hover:text-brand-coral transition-colors"
        >
          <LogOut size={18}/> 登出当前设备
        </button>
        <p className="text-center text-[10px] opacity-10 px-8 uppercase tracking-tighter font-black leading-relaxed">
          MomoPet Healthy v2.1.0-STABLE<br/>DESIGNED FOR YOUR BEST FRIENDS
        </p>
      </div>

      {/* Pet Profile Overlay */}
      <AnimatePresence>
        {showPetProfile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-brand-brown/40 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-brand-cream rounded-5xl p-8 shadow-heavy relative"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold tracking-tight">宠物档案</h3>
                <button onClick={() => setShowPetProfile(false)} className="p-2 opacity-30 hover:opacity-100 transition-opacity"><X size={24} strokeWidth={3}/></button>
              </div>

              <div className="space-y-8 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-2">选择头像</label>
                  <div className="grid grid-cols-4 gap-3">
                    {AVATARS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => setEditedPet({...editedPet, avatar: emoji})}
                        className={`text-2xl p-2 rounded-2xl transition-all ${editedPet.avatar === emoji ? 'bg-brand-coral scale-110 shadow-soft' : 'bg-white'}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <input 
                    type="text" 
                    placeholder="输入自定义Emoji..."
                    maxLength={2}
                    className="w-full text-center p-3 rounded-2xl bg-white/50 border border-brand-brown/5 text-sm outline-none mt-2"
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) setEditedPet({...editedPet, avatar: val});
                    }}
                  />
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-2">宠物名字</label>
                  <input 
                    type="text" 
                    value={editedPet.name}
                    onChange={e => setEditedPet({...editedPet, name: e.target.value})}
                    className="w-full p-4 rounded-3xl bg-white border border-brand-brown/5 text-brand-brown font-bold focus:ring-2 ring-brand-coral outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-2">出生日期</label>
                  <input 
                    type="date" 
                    value={editedPet.birthDate}
                    onChange={e => setEditedPet({...editedPet, birthDate: e.target.value})}
                    className="w-full p-4 rounded-3xl bg-white border border-brand-brown/5 text-brand-brown font-bold focus:ring-2 ring-brand-coral outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-2">当前体重 (kg)</label>
                  <input 
                    type="number" 
                    value={editedPet.weight}
                    onChange={e => setEditedPet({...editedPet, weight: parseFloat(e.target.value) || 0})}
                    className="w-full p-4 rounded-3xl bg-white border border-brand-brown/5 text-brand-brown font-bold focus:ring-2 ring-brand-coral outline-none transition-all"
                  />
                </div>
              </div>
            </div>
            <button 
              onClick={handleSavePet}
                className="w-full mt-10 bg-brand-brown text-white py-5 rounded-4xl font-bold shadow-heavy active:scale-[0.98] transition-transform"
              >
                保存修改
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications Overlay */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-brand-brown/40 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-brand-cream rounded-5xl p-8 shadow-heavy relative text-center space-y-6"
            >
              <div className="w-20 h-20 bg-brand-coral-soft mx-auto rounded-full flex items-center justify-center text-brand-coral">
                <Bell size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">通知设置</h3>
                <p className="text-sm opacity-60">每日 {reminderTime} 会为您推送健康打卡提醒，确保不漏掉每一个细节。</p>
              </div>
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-4xl flex items-center justify-between">
                  <span className="font-bold">提醒开关</span>
                  <div className="w-12 h-6 bg-brand-brown rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-4xl flex items-center justify-between">
                  <span className="font-bold">提醒时间</span>
                  <input 
                    type="time" 
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="font-bold text-brand-coral border-none outline-none focus:ring-0 cursor-pointer bg-transparent"
                  />
                </div>
              </div>
              <button 
                onClick={() => setShowNotifications(false)}
                className="w-full bg-brand-brown text-white py-5 rounded-4xl font-bold"
              >
                知道了
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cycle Edit Overlay */}
      <AnimatePresence>
        {showCycleEdit && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-brand-brown/40 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-brand-cream rounded-5xl p-8 shadow-heavy relative overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold tracking-tight">护理频次与提醒</h3>
                <button onClick={() => setShowCycleEdit(false)} className="p-2 opacity-30 hover:opacity-100 transition-opacity"><X size={24} strokeWidth={3}/></button>
              </div>
              <div className="space-y-10">
                {tasks.map(task => (
                  <div key={task.id} className="space-y-6 pb-6 border-b border-brand-brown/5 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 rounded-full bg-brand-yellow flex items-center justify-center text-sm shadow-sm">
                         {task.name.charAt(0)}
                       </div>
                       <span className="text-base font-bold text-brand-brown tracking-tight">{task.name}</span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-30">护理周期</span>
                        <span className="text-[10px] font-black text-brand-coral uppercase tracking-widest">{task.cycleDays} Days</span>
                      </div>
                      <input 
                        type="range"
                        min={7}
                        max={365}
                        value={task.cycleDays}
                        onChange={(e) => updateCycle(task.id, parseInt(e.target.value))}
                        className="w-full h-1.5 bg-brand-brown/5 rounded-full appearance-none accent-brand-brown"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-30">提前预约提醒</span>
                        <span className="text-[10px] font-black text-brand-mint-dark uppercase tracking-widest">{task.bookingOffsetDays} Days Ahead</span>
                      </div>
                      <input 
                        type="range"
                        min={0}
                        max={60}
                        value={task.bookingOffsetDays}
                        onChange={(e) => updateOffset(task.id, parseInt(e.target.value))}
                        className="w-full h-1.5 bg-brand-brown/5 rounded-full appearance-none accent-brand-mint-dark"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setShowCycleEdit(false)}
                className="w-full mt-10 bg-brand-brown text-white py-5 rounded-4xl font-bold shadow-heavy active:scale-[0.98] transition-transform"
              >
                保存配置
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SettingItem({ icon, label, sublabel, onClick }: { icon: any, label: string, sublabel?: string, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="p-6 flex items-center justify-between group active:bg-brand-cream-dark/30 transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-5">
        <div className="w-12 h-12 bg-brand-cream-dark/50 rounded-2xl flex items-center justify-center group-hover:bg-brand-mint/40 transition-colors">
          {icon}
        </div>
        <div>
          <p className="text-base font-bold tracking-tight">{label}</p>
          {sublabel && <p className="text-xs font-medium opacity-30 mt-0.5">{sublabel}</p>}
        </div>
      </div>
      <ChevronRight size={18} className="opacity-10 group-hover:opacity-40 transition-all group-hover:translate-x-1" />
    </div>
  );
}
