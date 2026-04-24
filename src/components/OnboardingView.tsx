import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dog, ArrowRight, Camera, Upload } from 'lucide-react';
import { Pet, PeriodicTask, TaskStatus } from '../types';
import { addDays, subDays, format, parseISO } from 'date-fns';

interface OnboardingViewProps {
  onComplete: (pet: Pet, tasks: PeriodicTask[]) => void;
}

export default function OnboardingView({ onComplete }: OnboardingViewProps) {
  const [step, setStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [petInfo, setPetInfo] = useState<Partial<Pet>>({
    name: '',
    birthDate: '',
    gender: 'unknown',
    weight: 0,
    avatar: '',
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPetInfo({ ...petInfo, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const [recentCare, setRecentCare] = useState({
    grooming: 'unknown',
    deworming: 'unknown',
    checkup: 'unknown',
  });

  const [calculatedTasks, setCalculatedTasks] = useState<PeriodicTask[]>([]);

  const handleNextToConfirmation = () => {
    const tempPetId = 'temp_id';
    const initialTasks: PeriodicTask[] = [
      createTask('🛁 美容', 60, 3, recentCare.grooming, tempPetId),
      createTask('💊 驱虫', 30, 7, recentCare.deworming, tempPetId),
      createTask('🏥 体检', 365, 30, recentCare.checkup, tempPetId),
      createTask('💉 疫苗', 365, 30, 'unknown', tempPetId),
    ];
    setCalculatedTasks(initialTasks);
    setStep(3);
  };

  const handleAdjustTaskDate = (id: string, newDateStr: string) => {
    setCalculatedTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextDueAt = new Date(newDateStr);
        const lastDoneAt = subDays(nextDueAt, t.cycleDays);
        const bookingAt = subDays(nextDueAt, t.bookingOffsetDays);
        return {
          ...t,
          lastDoneAt: lastDoneAt.toISOString(),
          nextDueAt: nextDueAt.toISOString(),
          bookingAt: bookingAt.toISOString(),
        };
      }
      return t;
    }));
  };

  const finish = () => {
    const pet: Pet = {
      id: Math.random().toString(36).substring(2, 9),
      name: petInfo.name || '小可爱',
      birthDate: petInfo.birthDate || new Date().toISOString(),
      gender: petInfo.gender || 'unknown',
      weight: petInfo.weight || 0,
      avatar: petInfo.avatar || '🐶',
    };

    const finalTasks = calculatedTasks.map(t => ({ ...t, petId: pet.id }));
    onComplete(pet, finalTasks);
  };

  return (
    <div className="min-h-screen bg-brand-cream p-8 flex flex-col font-sans">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group mx-auto w-24 h-24 cursor-pointer"
                >
                  <div className="w-24 h-24 bg-white border-2 border-brand-brown rounded-3xl mx-auto flex items-center justify-center text-5xl shadow-soft overflow-hidden">
                    {petInfo.avatar ? (
                      <img src={petInfo.avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Upload size={32} className="text-brand-brown/20" />
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-brand-coral rounded-full border-2 border-brand-brown flex items-center justify-center text-white shadow-soft">
                    <Camera size={14} />
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
                <h1 className="text-3xl font-bold">你好，铲屎官！</h1>
                <p className="text-brand-brown/60">点击上方上传一张它的美照吧</p>
              </div>

              <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold ml-1">它的名字</label>
                  <input
                    type="text"
                    value={petInfo.name}
                    onChange={e => setPetInfo({ ...petInfo, name: e.target.value })}
                    placeholder="例如：蛋蛋"
                    className="w-full p-4 rounded-2xl border-2 border-brand-brown bg-white outline-none focus:ring-4 ring-brand-coral/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold ml-1">出生日期</label>
                  <input
                    type="date"
                    value={petInfo.birthDate}
                    onChange={e => setPetInfo({ ...petInfo, birthDate: e.target.value })}
                    className="w-full p-4 rounded-2xl border-2 border-brand-brown bg-white outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <SelectButton 
                    label="弟弟" 
                    active={petInfo.gender === 'male'} 
                    onClick={() => setPetInfo({ ...petInfo, gender: 'male'})}
                  />
                  <SelectButton 
                    label="妹妹" 
                    active={petInfo.gender === 'female'} 
                    onClick={() => setPetInfo({ ...petInfo, gender: 'female'})}
                  />
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!petInfo.name}
                className="w-full bg-brand-coral text-white p-5 rounded-2xl border-2 border-brand-brown font-bold shadow-[6px_6px_0px_0px_rgba(93,64,55,1)] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                下一步 <ArrowRight size={20} />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">同步护理进度</h2>
                <p className="text-brand-brown/60">最近一次做以下事项是什么时候？</p>
              </div>

              <div className="space-y-6">
                <CareSelector 
                  label="🛁 美容" 
                  options={[
                    { label: '一周内', value: '1week' },
                    { label: '两周内', value: '2weeks' },
                    { label: '一个月内', value: '1month' },
                    { label: '两个月内', value: '2months' },
                    { label: '更早', value: 'unknown' }
                  ]}
                  value={recentCare.grooming}
                  onChange={(v) => setRecentCare({...recentCare, grooming: v})}
                />
                <CareSelector 
                  label="💊 驱虫" 
                  options={[
                    { label: '一周内', value: '1week' },
                    { label: '两周内', value: '2weeks' },
                    { label: '一个月内', value: '1month' },
                    { label: '两个月内', value: '2months' },
                    { label: '更早', value: 'unknown' }
                  ]}
                  value={recentCare.deworming}
                  onChange={(v) => setRecentCare({...recentCare, deworming: v})}
                />
                <CareSelector 
                  label="🏥 体检" 
                  options={[
                    { label: '三个月内', value: '3months' },
                    { label: '半年内', value: '6months' },
                    { label: '一年内', value: '1year' },
                    { label: '不记得了', value: 'unknown' }
                  ]}
                  value={recentCare.checkup}
                  onChange={(v) => setRecentCare({...recentCare, checkup: v})}
                />
              </div>

              <button
                onClick={handleNextToConfirmation}
                className="w-full bg-brand-coral text-white p-5 rounded-2xl border-2 border-brand-brown font-bold shadow-[6px_6px_0px_0px_rgba(93,64,55,1)]"
              >
                计算预估日期 <ArrowRight size={20} className="inline ml-2" />
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">最后核对一下</h2>
                <p className="text-brand-brown/60">根据您的选择，我们预估：</p>
              </div>

              <div className="space-y-4">
                {calculatedTasks.map(task => (
                  <div key={task.id} className="bg-white p-4 rounded-2xl border-2 border-brand-brown gap-4 flex flex-col">
                    <div className="flex justify-between items-center">
                      <span className="font-bold">{task.name}</span>
                      <span className="text-xs text-brand-coral font-bold italic">预估下次：{format(parseISO(task.nextDueAt), 'MM月dd日')}</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] opacity-40 ml-1">根据周期推算的下次建议日期：</p>
                      <input 
                        type="date" 
                        value={format(parseISO(task.nextDueAt), 'yyyy-MM-dd')}
                        onChange={(e) => handleAdjustTaskDate(task.id, e.target.value)}
                        className="w-full p-2 rounded-xl border-2 border-brand-brown/10 text-sm outline-none focus:border-brand-coral transition-colors"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-4 px-2 rounded-2xl border-2 border-brand-brown font-bold text-sm opacity-60"
                >
                  返回修改
                </button>
                <button
                  onClick={finish}
                  className="flex-[2] bg-brand-coral text-white py-4 px-2 rounded-2xl border-2 border-brand-brown font-bold shadow-[6px_6px_0px_0px_rgba(93,64,55,1)]"
                >
                  确认进入首页
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SelectButton({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-2xl border-2 border-brand-brown font-bold transition-all ${
        active ? 'bg-brand-coral text-white shadow-none translate-x-1 translate-y-1' : 'bg-white shadow-[4px_4px_0px_0px_rgba(93,64,55,1)]'
      }`}
    >
      {label}
    </button>
  );
}

function CareSelector({ label, options, value, onChange }: { label: string, options: any[], value: string, onChange: (v: string) => void }) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-bold">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-4 py-2 rounded-xl border-2 border-brand-brown text-sm transition-all ${
              value === opt.value ? 'bg-brand-mint border-brand-brown' : 'bg-white/50 text-brand-brown/60'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function createTask(name: string, cycleDays: number, offsetDays: number, recentValue: string, petId: string): PeriodicTask {
  let lastDoneAt = new Date();
  
  switch(recentValue) {
    case '1week': lastDoneAt = subDays(new Date(), 3); break;
    case '2weeks': lastDoneAt = subDays(new Date(), 10); break;
    case '1month': lastDoneAt = subDays(new Date(), 20); break;
    case '2months': lastDoneAt = subDays(new Date(), 45); break;
    case '3months': lastDoneAt = subDays(new Date(), 75); break;
    case '6months': lastDoneAt = subDays(new Date(), 150); break;
    case '1year': lastDoneAt = subDays(new Date(), 300); break;
    default: lastDoneAt = subDays(new Date(), cycleDays);
  }

  const nextDueAt = addDays(lastDoneAt, cycleDays);
  const bookingAt = subDays(nextDueAt, offsetDays);

  return {
    id: Math.random().toString(36).substring(2, 9),
    petId,
    name,
    cycleDays,
    bookingOffsetDays: offsetDays,
    lastDoneAt: lastDoneAt.toISOString(),
    nextDueAt: nextDueAt.toISOString(),
    bookingAt: bookingAt.toISOString(),
    status: 'booking'
  };
}
