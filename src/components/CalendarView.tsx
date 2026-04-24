import React, { useMemo, useState } from 'react';
import { DailyRecord, PeriodicTask } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertCircle, CheckCircle2, Utensils, Info, Zap, ImageIcon, ClipboardList } from 'lucide-react';

interface CalendarViewProps {
  records: DailyRecord[];
  allTasks: PeriodicTask[];
}

export default function CalendarView({ records, allTasks }: CalendarViewProps) {
  const [selectedRecord, setSelectedRecord] = useState<DailyRecord | null>(null);
  const currentMonth = new Date();
  
  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const summary = useMemo(() => {
    const results = { normal: 0, abnormal: 0, none: 0 };
    days.forEach(day => {
      const record = records.find(r => isSameDay(parseISO(r.date), day));
      if (!record) results.none++;
      else if (record.isAllNormal) results.normal++;
      else results.abnormal++;
    });
    return results;
  }, [days, records]);

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-white p-8 rounded-5xl shadow-soft">
        <div className="flex justify-between items-center mb-8 px-2">
          <h2 className="text-2xl font-bold tracking-tight">{format(currentMonth, 'MMMM yyyy')}</h2>
          <div className="flex gap-3">
            <Legend color="bg-brand-green" label="正常" />
            <Legend color="bg-brand-coral" label="异常" />
            <Legend color="bg-brand-brown/10" label="无" />
          </div>
        </div>

        <div className="grid grid-cols-7 gap-3">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={`${d}-${i}`} className="text-center text-[10px] font-black opacity-20 py-2 tracking-widest">{d}</div>
          ))}
          {Array(days[0].getDay()).fill(0).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square"></div>
          ))}
          {days.map(day => {
            const record = records.find(r => isSameDay(parseISO(r.date), day));
            let bgColor = 'bg-brand-cream-dark/50';
            let textColor = 'text-brand-brown/40';
            if (record) {
              bgColor = record.isAllNormal ? 'bg-brand-green' : 'bg-brand-coral';
              textColor = 'text-white';
            }
            return (
              <button 
                key={day.toISOString()} 
                onClick={() => record && setSelectedRecord(record)}
                className={`aspect-square rounded-2xl flex items-center justify-center text-xs font-bold transition-all active:scale-90 shadow-sm ${bgColor} ${textColor} ${record ? 'cursor-pointer hover:shadow-soft' : 'cursor-default'}`}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>

      <section className="bg-brand-yellow/10 p-8 rounded-5xl shadow-soft">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <span className="text-xl">📊</span> 本月健康指引
        </h3>
        <div className="space-y-6">
          <StatProgress label="身体表现（正常）" percent={(summary.normal / days.length) * 100} color="bg-brand-green" />
          <StatProgress label="近期波动（异常）" percent={(summary.abnormal / days.length) * 100} color="bg-brand-coral" />
          
          <div className="pt-6 border-t border-brand-brown/5">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-3 ml-1">小主守护寄语</p>
            <div className="bg-white/80 p-4 rounded-3xl text-sm font-medium leading-relaxed italic shadow-sm">
              {summary.abnormal > 3 
                ? "⚠️ 小家伙最近身体波动较大。不仅仅是记录，及时的专业医疗咨询和额外的关怀在此时尤为重要。观察它的每一个细微变化，你是它最可靠的守护者。" 
                : "✨ 记录得很棒！它正在你的悉心照料下快乐健康地成长。每一条绿色的记录都是对你付出的最好肯定，继续保持这份爱与细致吧。"}
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selectedRecord && (
          <DailyDetailOverlay 
            record={selectedRecord} 
            allTasks={allTasks}
            onClose={() => setSelectedRecord(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function DailyDetailOverlay({ record, allTasks, onClose }: { record: DailyRecord, allTasks: PeriodicTask[], onClose: () => void }) {
  const completedTasks = record.completedTasks?.map(id => allTasks.find(t => t.id === id)).filter(Boolean) || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-brand-brown/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-sm bg-brand-cream rounded-5xl p-8 shadow-heavy relative max-h-[85vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-brand-brown/40 hover:text-brand-brown transition-colors">
          <X size={24} strokeWidth={3} />
        </button>

        <div className="space-y-8 pt-4 text-brand-brown">
          <div className="text-center space-y-3">
            <p className="text-xs font-black uppercase tracking-widest opacity-30">{format(parseISO(record.date), 'PPPP')}</p>
            <h3 className="text-3xl font-bold tracking-tight">当日报告</h3>
            <div className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${record.isAllNormal ? 'bg-brand-mint text-brand-brown' : 'bg-brand-coral-soft text-brand-coral'}`}>
              {record.isAllNormal ? <CheckCircle2 size={12}/> : <AlertCircle size={12}/>}
              {record.isAllNormal ? 'Status: Normal' : 'Warning: Fluctuations'}
            </div>
          </div>

          {completedTasks.length > 0 && (
            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-widest opacity-30 ml-2 flex items-center gap-2">
                <ClipboardList size={14}/> 当日完成护理
              </p>
              <div className="flex flex-wrap gap-2">
                {completedTasks.map(t => (
                  <span key={t!.id} className="px-3 py-1.5 bg-brand-brown text-white rounded-xl text-[10px] font-bold">
                    {t!.name.split(' ')[1] || t!.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4 bg-white/60 p-6 rounded-4xl shadow-soft">
            <HealthItem icon={<Utensils size={18} className="text-brand-coral"/>} label="食欲表现" value={record.appetite} />
            <HealthItem icon={<Info size={18} className="text-brand-coral"/>} label="排便情况" value={record.poop} />
            <HealthItem icon={<Zap size={18} className="text-brand-coral"/>} label="精神活力" value={record.activity} />
          </div>

          {record.extraSymptoms.length > 0 && (
            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-widest opacity-30 ml-2">额外观察症状</p>
              <div className="flex flex-wrap gap-2">
                {record.extraSymptoms.map(s => (
                  <span key={s} className="px-4 py-2 bg-brand-brown text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {record.visualEvidence && record.visualEvidence.length > 0 && (
            <div className="space-y-4">
               <p className="text-xs font-black uppercase tracking-widest opacity-30 ml-2 flex items-center gap-1.5">
                <ImageIcon size={14}/> 视觉证据留存
              </p>
              <div className="grid grid-cols-2 gap-3">
                {record.visualEvidence.map((url, i) => (
                  <div key={i} className="aspect-square rounded-3xl overflow-hidden shadow-soft">
                    <img src={url} className="w-full h-full object-cover" alt="Evidence" />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <button 
            onClick={onClose}
            className="w-full bg-brand-brown text-white py-5 rounded-4xl font-bold shadow-heavy active:scale-[0.98] transition-transform"
          >
            收起回顾
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function HealthItem({ icon, label, value }: { icon: any, label: string, value: string }) {
  const getStatusText = (v: string, type: string) => {
    if (v === 'normal') return '正常';
    
    if (type === '食欲表现') {
      if (v === 'slight_abnormal') return '没吃完';
      if (v === 'abnormal') return '没动窝';
    }
    if (type === '排便情况') {
      if (v === 'slight_abnormal') return '软便';
      if (v === 'abnormal') return '异常';
    }
    if (type === '精神活力') {
      if (v === 'slight_abnormal') return '偏静';
      if (v === 'abnormal') return '郁郁';
    }

    if (v === 'slight_abnormal') return '轻微异常';
    return '显著异常';
  };
  const getStatusColor = (v: string) => {
    if (v === 'normal') return 'text-brand-green';
    return 'text-brand-coral';
  };

  return (
    <div className="flex justify-between items-center text-sm">
      <div className="flex items-center gap-2 opacity-60">
        {icon}
        <span>{label}</span>
      </div>
      <span className={`font-bold ${getStatusColor(value)}`}>{getStatusText(value, label)}</span>
    </div>
  );
}

function Legend({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2.5 h-2.5 rounded-full ${color} shadow-sm`}></div>
      <span className="text-[10px] font-black uppercase tracking-widest opacity-20">{label}</span>
    </div>
  );
}

function StatProgress({ label, percent, color }: { label: string, percent: number, color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-40 px-1">
        <span>{label}</span>
        <span>{Math.round(percent)}%</span>
      </div>
      <div className="h-2.5 w-full bg-white/50 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          className={`h-full ${color} shadow-sm rounded-full`}
        ></motion.div>
      </div>
    </div>
  );
}
