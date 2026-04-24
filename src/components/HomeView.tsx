import React from 'react';
import { Pet, DailyRecord, PeriodicTask } from '../types';
import { CheckCircle2, AlertCircle, Calendar, ArrowRight, Star } from 'lucide-react';
import { format, isSameDay, parseISO, differenceInDays, differenceInMonths, differenceInYears } from 'date-fns';
import { motion } from 'motion/react';

interface HomeViewProps {
  pet: Pet;
  records: DailyRecord[];
  tasks: PeriodicTask[];
  onNavigate: (tab: 'home' | 'calendar' | 'tasks' | 'settings') => void;
}

export default function HomeView({ pet, records, tasks, onNavigate }: HomeViewProps) {
  const todayRecord = records.find(r => isSameDay(parseISO(r.date), new Date()));
  const sortedRecords = [...records].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  
  const activeTasks = tasks.slice(0, 3);

  // Calculate unique recording days
  const uniqueDays = new Set(records.map(r => format(parseISO(r.date), 'yyyy-MM-dd'))).size;

  // Calculate pet age
  const birthDate = parseISO(pet.birthDate);
  const now = new Date();
  const years = differenceInYears(now, birthDate);
  const months = differenceInMonths(now, birthDate) % 12;

  return (
    <div className="space-y-8">
      {/* Status Card */}
      <section className="bg-gradient-to-br from-brand-mint to-brand-mint-deep p-8 rounded-5xl relative overflow-hidden shadow-soft">
        <div className="absolute -top-6 -right-6 text-white/20">
          <Star size={120} fill="currentColor" stroke="none" />
        </div>
        <div className="relative z-10 space-y-5">
          <h2 className="text-xs font-black uppercase tracking-widest text-brand-brown/40">今日状态看板</h2>
          {todayRecord ? (
            <div className="flex items-center gap-4">
              {todayRecord.isAllNormal ? (
                <>
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-soft">
                    <CheckCircle2 className="text-brand-green" size={32} />
                  </div>
                  <div>
                    <span className="text-2xl font-bold block">一切正常</span>
                    <span className="text-sm opacity-60">真是个省心的小天使 ✨</span>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-brand-coral-soft flex items-center justify-center">
                      <AlertCircle className="text-brand-coral" size={24} />
                    </div>
                    <span className="text-2xl font-bold">有些小状况</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {todayRecord.appetite !== 'normal' && <Badge text="食欲" color="bg-white/40" />}
                    {todayRecord.poop !== 'normal' && <Badge text="排便" color="bg-white/40" />}
                    {todayRecord.activity !== 'normal' && <Badge text="活力" color="bg-white/40" />}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-3xl font-bold leading-tight">还没记录<br/>今日状态哦</p>
              <button 
                onClick={() => onNavigate('home')} // This should trigger the overlay via some shared state ideally, but here we just prompt
                className="px-6 py-2 bg-brand-brown text-white rounded-full text-sm font-bold shadow-soft"
              >
                去打卡
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Stats Summary - Bento Grid */}
      <section className="grid grid-cols-2 gap-4">
        <div className="bg-brand-blue/30 p-6 rounded-4xl shadow-soft">
          <p className="text-xs font-bold opacity-40 mb-2 uppercase tracking-tight">累计记录</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">{uniqueDays}</span>
            <span className="text-sm font-medium opacity-60 text-brand-brown-light">天</span>
          </div>
        </div>
        <div className="bg-brand-yellow/30 p-6 rounded-4xl shadow-soft">
          <p className="text-xs font-bold opacity-40 mb-2 uppercase tracking-tight">{pet.name}的年龄</p>
          <div className="flex items-baseline gap-1">
            {years > 0 && <span className="text-3xl font-bold">{years}<span className="text-sm font-medium opacity-60 text-brand-brown-light mr-1">岁</span></span>}
            <span className="text-3xl font-bold">{months}<span className="text-sm font-medium opacity-60 text-brand-brown-light">月</span></span>
          </div>
        </div>
      </section>

      {/* Upcoming Tasks */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Calendar size={20} className="text-brand-coral" /> 周期任务
          </h3>
          <button 
            onClick={() => onNavigate('tasks')}
            className="text-xs font-bold text-brand-brown opacity-40 hover:opacity-100 transition-opacity"
          >
            查看全部
          </button>
        </div>
        <div className="space-y-4">
          {activeTasks.map(task => {
            const daysLeft = differenceInDays(parseISO(task.nextDueAt), new Date());
            return (
              <div 
                key={task.id} 
                className="bg-white p-5 rounded-4xl flex items-center justify-between shadow-soft cursor-pointer active:scale-95 transition-all"
                onClick={() => onNavigate('tasks')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-cream-dark flex items-center justify-center">
                    <span className="text-xl">{task.name.split(' ')[0]}</span>
                  </div>
                  <div>
                    <p className="font-bold text-base">{task.name.split(' ')[1]}</p>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${daysLeft <= 0 ? 'text-brand-coral' : 'opacity-30'}`}>
                      {daysLeft <= 0 ? '⚠️ 已到期' : `${daysLeft}天后`}
                    </p>
                  </div>
                </div>
                <div className="w-10 h-10 bg-brand-cream-dark rounded-full flex items-center justify-center opacity-40">
                  <ArrowRight size={18} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* History Feed */}
      <section className="space-y-4 pb-12">
        <h3 className="font-bold text-lg px-2">最近记录</h3>
        <div className="space-y-4">
          {sortedRecords.length === 0 && <p className="text-center py-12 opacity-30 italic font-medium">暂无记录...</p>}
          {sortedRecords.map(record => (
            <div key={record.id} className="relative pl-8">
              <div className="absolute left-1 top-2 w-1.5 h-1.5 rounded-full bg-brand-brown-light z-10"></div>
              <div className="absolute left-[7px] top-4 bottom-[-16px] w-[2px] bg-brand-brown/5"></div>
              
              <div className="bg-white p-5 rounded-3xl shadow-soft">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-bold text-brand-brown">{format(parseISO(record.date), 'MM月dd日')}</p>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${record.isAllNormal ? 'text-brand-green' : 'text-brand-coral'}`}>
                    {record.isAllNormal ? 'NORMAL' : 'ABNORMAL'}
                  </span>
                </div>
                <p className="text-xs font-medium text-brand-brown/60 leading-relaxed">
                   {record.isAllNormal ? '一切都好～小家伙很健康，活力值拉满！' : `监测到异常：${[
                     record.appetite !== 'normal' && '食欲情况',
                     record.poop !== 'normal' && '排便状况',
                     record.activity !== 'normal' && '精神波动'
                   ].filter(Boolean).join(', ')}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Badge({ text, color }: { text: string, color: string }) {
  return (
    <span className={`${color} px-3 py-1.5 rounded-full border border-white/20 text-[10px] font-bold text-brand-brown/80`}>
      {text}
    </span>
  );
}
