import React, { useState } from 'react';
import { PeriodicTask, TaskStatus } from '../types';
import { format, parseISO, differenceInDays, addDays, isSameDay, subDays } from 'date-fns';
import { Clock, ShieldCheck, Scissors, HeartPulse, Plus, Calendar, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { persistentStorage } from '../lib/pwa-persistence';

interface TasksViewProps {
  tasks: PeriodicTask[];
  setTasks: (tasks: PeriodicTask[]) => void;
  onTaskComplete: (id: string) => void;
}

export default function TasksView({ tasks, setTasks, onTaskComplete }: TasksViewProps) {
  const [bookingTaskId, setBookingTaskId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [tempDate, setTempDate] = useState<string>('');
  const [newTask, setNewTask] = useState({ name: '✨ 护理', cycleDays: 30, bookingOffsetDays: 7, lastDoneAt: format(new Date(), 'yyyy-MM-dd') });

  const handleAddTask = () => {
    const nextDueAt = addDays(parseISO(newTask.lastDoneAt), newTask.cycleDays);
    const bookingAt = subDays(nextDueAt, newTask.bookingOffsetDays);
    const task: PeriodicTask = {
      id: Math.random().toString(36).substring(2, 9),
      petId: tasks[0]?.petId || 'default',
      name: newTask.name,
      cycleDays: newTask.cycleDays,
      bookingOffsetDays: newTask.bookingOffsetDays,
      lastDoneAt: newTask.lastDoneAt,
      nextDueAt: nextDueAt.toISOString(),
      bookingAt: bookingAt.toISOString(),
      status: 'done'
    };
    const updated = [...tasks, task];
    setTasks(updated);
    persistentStorage.setItem('tasks', JSON.stringify(updated));
    setShowAddModal(false);
  };

  const handleCompleteTask = (id: string) => {
    onTaskComplete(id);
  };

  const handleSetBooking = (id: string, date: string) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === id) {
        return {
          ...t,
          finalAppointmentDate: new Date(date).toISOString(),
          status: 'booked' as TaskStatus
        };
      }
      return t;
    });
    setTasks(updatedTasks);
    persistentStorage.setItem('tasks', JSON.stringify(updatedTasks));
    setBookingTaskId(null);
  };

  const handleCancelBooking = (id: string) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === id) {
        return {
          ...t,
          finalAppointmentDate: undefined,
          status: 'booking' as TaskStatus
        };
      }
      return t;
    });
    setTasks(updatedTasks);
    persistentStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };

  const today = new Date();

  return (
    <div className="space-y-8 pb-12">
      <header className="px-2 pt-2">
        <h2 className="text-3xl font-bold tracking-tight">护理计划</h2>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mt-1 italic">健康源于持之以恒的呵护 ✨</p>
      </header>

      <div className="space-y-6">
        {tasks.map(task => {
          const nextDue = parseISO(task.nextDueAt);
          const bookingAt = parseISO(task.bookingAt);
          const finalAppt = task.finalAppointmentDate ? parseISO(task.finalAppointmentDate) : null;
          
          const daysToDue = differenceInDays(nextDue, today);
          const shouldBook = today >= bookingAt && task.status !== 'booked';
          const isReminderDay = finalAppt && isSameDay(subDays(finalAppt, 1), today);
          const isUrgent = daysToDue <= 7;

          return (
            <div key={task.id} className="bg-white rounded-5xl shadow-soft overflow-hidden relative">
              <div className="p-6 flex justify-between items-start">
                <div className="flex gap-4">
                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-soft ${getIconColor(task.name)}`}>
                    {getIcon(task.name)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight">{task.name}</h3>
                    <p className="text-xs font-medium opacity-30 mt-0.5">每 {task.cycleDays} 天一个周期</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${isUrgent ? 'bg-brand-coral text-white' : 'bg-brand-cream-dark text-brand-brown/40'}`}>
                    {daysToDue <= 0 ? (task.status === 'done' ? 'DONE' : 'DUE') : `IN ${daysToDue} DAYS`}
                  </div>
                  {isReminderDay && (
                    <motion.div 
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="px-3 py-1 bg-brand-yellow rounded-full text-[9px] font-black uppercase tracking-tighter flex items-center gap-1 shadow-sm border border-brand-brown/10"
                    >
                      <AlertCircle size={10} /> 明日预约提醒
                    </motion.div>
                  )}
                </div>
              </div>
              
              <div className="px-6 py-5 bg-brand-cream-dark/30 flex justify-between items-center text-sm border-y border-brand-brown/5">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase opacity-20 tracking-wider">上次记录</p>
                  <p className="font-bold text-brand-brown/60">{format(parseISO(task.lastDoneAt), 'yyyy-MM-dd')}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-black uppercase opacity-20 tracking-wider">
                    {task.status === 'booked' ? '最终预约日期' : '建议下次日期'}
                  </p>
                  <p className={`font-bold ${task.status === 'booked' ? 'text-brand-brown' : 'text-brand-coral'}`}>
                    {format(task.status === 'booked' && finalAppt ? finalAppt : nextDue, 'yyyy-MM-dd')}
                  </p>
                </div>
              </div>

              {shouldBook && task.status !== 'booked' && (
                <div className="px-6 py-3 bg-brand-coral/5 flex items-center justify-center gap-2 border-b border-brand-brown/5">
                  <span className="text-[10px] font-bold text-brand-coral uppercase tracking-widest animate-pulse">📢 建议现在进行预约</span>
                </div>
              )}

              <div className="p-6 flex gap-3">
                {task.status === 'booked' ? (
                  <button 
                    onClick={() => handleCancelBooking(task.id)}
                    className="flex-1 py-4 rounded-3xl bg-brand-yellow text-brand-brown font-black text-[10px] uppercase tracking-widest shadow-soft active:scale-95 transition-all"
                  >
                    取消预约
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setBookingTaskId(task.id);
                      setTempDate(format(nextDue, 'yyyy-MM-dd'));
                    }}
                    className="flex-1 py-4 rounded-3xl bg-brand-cream-dark text-brand-brown/40 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                  >
                    标记预约
                  </button>
                )}
                <button 
                  onClick={() => handleCompleteTask(task.id)}
                  className="flex-1 py-4 rounded-3xl bg-brand-brown text-white font-black text-[10px] uppercase tracking-widest shadow-heavy active:scale-95 transition-all"
                >
                  确认完成
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button 
        onClick={() => setShowAddModal(true)}
        className="w-full py-6 rounded-4xl bg-white border border-dashed border-brand-brown/20 text-brand-brown/20 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/50 transition-colors"
      >
        <Plus size={18}/> 增加其他周期任务
      </button>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAddModal && (
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
              className="w-full max-w-sm bg-brand-cream rounded-5xl p-8 shadow-heavy space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold tracking-tight">自定义护理项</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 opacity-30"><Plus size={24} className="rotate-45" /></button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-1">任务名称 (建议携带Emoji)</label>
                  <input 
                    type="text" 
                    value={newTask.name}
                    onChange={(e) => setNewTask({...newTask, name: e.target.value})}
                    placeholder="如：💉 疫苗"
                    className="w-full p-4 rounded-2xl bg-white border border-brand-brown/5 text-brand-brown font-bold outline-none ring-brand-brown/5 focus:ring-4 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-1">周期长度 (天)</label>
                  <input 
                    type="number" 
                    value={newTask.cycleDays}
                    onChange={(e) => setNewTask({...newTask, cycleDays: parseInt(e.target.value) || 0})}
                    className="w-full p-4 rounded-2xl bg-white border border-brand-brown/5 text-brand-brown font-bold outline-none ring-brand-brown/5 focus:ring-4 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-1">提前多久提醒预约 (天)</label>
                  <input 
                    type="number" 
                    value={newTask.bookingOffsetDays}
                    onChange={(e) => setNewTask({...newTask, bookingOffsetDays: parseInt(e.target.value) || 0})}
                    className="w-full p-4 rounded-2xl bg-white border border-brand-brown/5 text-brand-brown font-bold outline-none ring-brand-brown/5 focus:ring-4 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-1">上次完成日期</label>
                  <input 
                    type="date" 
                    value={newTask.lastDoneAt}
                    onChange={(e) => setNewTask({...newTask, lastDoneAt: e.target.value})}
                    className="w-full p-4 rounded-2xl bg-white border border-brand-brown/5 text-brand-brown font-bold outline-none ring-brand-brown/5 focus:ring-4 transition-all"
                  />
                </div>
              </div>

              <button 
                onClick={handleAddTask}
                className="w-full py-5 rounded-4xl bg-brand-brown text-white font-bold shadow-heavy active:scale-95 transition-all mt-4"
              >
                创建护理计划
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Modal */}
      <AnimatePresence>
        {bookingTaskId && (
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
              className="w-full max-w-sm bg-brand-cream rounded-5xl p-8 shadow-heavy text-center space-y-6"
            >
              <div className="w-16 h-16 bg-brand-mint mx-auto rounded-3xl flex items-center justify-center shadow-soft">
                <Calendar size={32} className="text-brand-brown" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold tracking-tight">设定预约日期</h3>
                <p className="text-xs font-medium opacity-40">告知我们您实际约定的看诊/美容日期</p>
              </div>

              <input 
                type="date"
                value={tempDate}
                onChange={(e) => setTempDate(e.target.value)}
                className="w-full p-5 rounded-3xl border-2 border-brand-brown/5 bg-white text-brand-brown font-bold outline-none focus:border-brand-brown transition-colors"
              />

              <div className="flex gap-3">
                <button 
                  onClick={() => setBookingTaskId(null)}
                  className="flex-1 py-4 rounded-3xl bg-white border border-brand-brown/5 text-brand-brown/40 font-bold text-xs"
                >
                  取消
                </button>
                <button 
                  onClick={() => handleSetBooking(bookingTaskId, tempDate)}
                  className="flex-[2] py-4 rounded-3xl bg-brand-brown text-white font-bold text-xs shadow-soft"
                >
                  确定预约日期
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getIcon(name: string) {
  if (name.includes('美容')) return <Scissors size={28} />;
  if (name.includes('驱虫') || name.includes('驱')) return <ShieldCheck size={28} />;
  if (name.includes('体检') || name.includes('疫苗')) return <HeartPulse size={28} />;
  if (name.includes('药')) return <AlertCircle size={28} />;
  
  // Try to find an emoji at the start
  const emojiMatch = name.match(/^[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27ff]/);
  if (emojiMatch) return <span className="text-2xl">{emojiMatch[0]}</span>;

  return <Clock size={28} />;
}

function getIconColor(name: string) {
  if (name.includes('美容')) return 'bg-brand-yellow/30';
  if (name.includes('驱虫')) return 'bg-brand-mint/30';
  if (name.includes('体检')) return 'bg-brand-coral/30';
  return 'bg-brand-cream';
}
