import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, AlertCircle, Info, Utensils, Zap, Camera, Trash2, ImageIcon, Star, ClipboardList } from 'lucide-react';
import { DailyRecord, HealthStatus, PeriodicTask } from '../types';
import { format } from 'date-fns';

interface LogHealthOverlayProps {
  onClose: () => void;
  onSave: (record: Omit<DailyRecord, 'id' | 'petId'>) => void;
  recentRecords: DailyRecord[];
  todayRecord?: DailyRecord;
  availableTasks: PeriodicTask[];
}

export default function LogHealthOverlay({ onClose, onSave, recentRecords, todayRecord, availableTasks }: LogHealthOverlayProps) {
  const [mode, setMode] = useState<'quick' | 'detail'>('quick');
  const [showConflict, setShowConflict] = useState(false);
  const [pendingSave, setPendingSave] = useState<Omit<DailyRecord, 'id' | 'petId'> | null>(null);
  
  const [data, setData] = useState<Partial<DailyRecord>>({
    isAllNormal: todayRecord?.isAllNormal ?? true,
    appetite: todayRecord?.appetite ?? 'normal',
    poop: todayRecord?.poop ?? 'normal',
    activity: todayRecord?.activity ?? 'normal',
    extraSymptoms: todayRecord?.extraSymptoms ?? [],
    visualEvidence: todayRecord?.visualEvidence ?? [],
    completedTasks: todayRecord?.completedTasks ?? [],
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const checkConflictsAndSave = (newData: Omit<DailyRecord, 'id' | 'petId'>) => {
    if (!todayRecord) {
      onSave(newData);
      return;
    }

    // Check for status conflicts (appetite, poop, activity)
    // A conflict is when the old value was NOT 'normal' (or not explicitly set, but here they default to 'normal')
    // and the new value is different.
    // Actually, any change in these categorical fields could be seen as a conflict if we want to be safe.
    const conflicts = [];
    if (todayRecord.appetite !== newData.appetite) conflicts.push('食欲');
    if (todayRecord.poop !== newData.poop) conflicts.push('排便');
    if (todayRecord.activity !== newData.activity) conflicts.push('活力');

    if (conflicts.length > 0) {
      setPendingSave(newData);
      setShowConflict(true);
    } else {
      onSave(newData);
    }
  };

  const handleQuickNormal = () => {
    const newData: Omit<DailyRecord, 'id' | 'petId'> = {
      date: format(new Date(), 'yyyy-MM-dd'),
      isAllNormal: true,
      appetite: 'normal',
      poop: 'normal',
      activity: 'normal',
      extraSymptoms: todayRecord?.extraSymptoms || [],
      visualEvidence: todayRecord?.visualEvidence || [],
      completedTasks: data.completedTasks || [],
    };
    checkConflictsAndSave(newData);
  };

  const handleDetailSave = () => {
    const newData: Omit<DailyRecord, 'id' | 'petId'> = {
      date: format(new Date(), 'yyyy-MM-dd'),
      isAllNormal: data.appetite === 'normal' && data.poop === 'normal' && data.activity === 'normal' && (data.extraSymptoms?.length === 0),
      appetite: data.appetite as HealthStatus,
      poop: data.poop as HealthStatus,
      activity: data.activity as HealthStatus,
      extraSymptoms: Array.from(new Set([...(todayRecord?.extraSymptoms || []), ...(data.extraSymptoms || [])])),
      visualEvidence: Array.from(new Set([...(todayRecord?.visualEvidence || []), ...(data.visualEvidence || [])])),
      completedTasks: data.completedTasks || [],
    };
    checkConflictsAndSave(newData);
  };

  const toggleSymptom = (s: string) => {
    const current = data.extraSymptoms || [];
    if (current.includes(s)) {
      setData({ ...data, extraSymptoms: current.filter(x => x !== s) });
    } else {
      setData({ ...data, extraSymptoms: [...current, s] });
    }
  };

  const toggleTask = (taskId: string) => {
    const current = data.completedTasks || [];
    if (current.includes(taskId)) {
      setData({ ...data, completedTasks: current.filter(id => id !== taskId) });
    } else {
      setData({ ...data, completedTasks: [...current, taskId] });
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Simulate real upload with local URL
      const newUrls = Array.from(files).map(file => URL.createObjectURL(file as File));
      setData(prev => ({
        ...prev,
        visualEvidence: [...(prev.visualEvidence || []), ...newUrls]
      }));
    }
  };

  const removePhoto = (url: string) => {
    setData(prev => ({
      ...prev,
      visualEvidence: (prev.visualEvidence || []).filter(u => u !== url)
    }));
  };

  const hasAbnormality = data.appetite !== 'normal' || data.poop !== 'normal' || data.activity !== 'normal' || (data.extraSymptoms?.length || 0) > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-12 bg-brand-brown/40 backdrop-blur-sm"
    >
        <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="w-full max-w-md bg-brand-cream rounded-5xl p-8 shadow-heavy relative max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-brand-brown/40 hover:text-brand-brown transition-colors z-10">
          <X size={24} strokeWidth={3} />
        </button>

        <AnimatePresence mode="wait">
          {mode === 'quick' ? (
            <motion.div
              key="quick"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="text-center space-y-12 py-8"
            >
              <div className="space-y-4">
                <div className="w-20 h-20 bg-brand-mint-deep mx-auto rounded-4xl flex items-center justify-center text-4xl shadow-soft">🐶</div>
                <h2 className="text-3xl font-bold tracking-tight">今天一切正常吗？</h2>
                <p className="text-brand-brown/40 text-sm font-medium">我们会帮你记录下这个美好的瞬间</p>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  onClick={handleQuickNormal}
                  className="w-full bg-brand-brown text-white p-6 rounded-4xl font-bold flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-heavy"
                >
                  <Check size={24} strokeWidth={3} /> 
                  <span className="text-lg">是的，一切正常</span>
                </button>
                <button
                  onClick={() => setMode('detail')}
                  className="w-full bg-white text-brand-brown/60 p-5 rounded-4xl font-bold flex items-center justify-center gap-2 border border-brand-brown/10 hover:bg-brand-cream-dark transition-colors"
                >
                  发现了一些异常...
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-10 py-4"
            >
              <div className="space-y-2">
                <h3 className="text-2xl font-bold tracking-tight">健康详实日记</h3>
                <p className="text-xs font-bold opacity-30 uppercase tracking-widest">请选择具体的生理表现</p>
              </div>

              <div className="space-y-8">
                <DetailRow 
                  label="🍖 食欲表现" 
                  value={data.appetite!} 
                  icon={<Utensils size={18} className="text-brand-coral"/>}
                  options={[
                    { label: '正常', value: 'normal' },
                    { label: '没吃完', value: 'slight_abnormal' },
                    { label: '没动窝', value: 'abnormal' }
                  ]}
                  onChange={v => setData({...data, appetite: v as HealthStatus})}
                />
                <DetailRow 
                  label="💩 排便状况" 
                  value={data.poop!} 
                  icon={<Info size={18} className="text-brand-coral"/>}
                  options={[
                    { label: '正常', value: 'normal' },
                    { label: '软便', value: 'slight_abnormal' },
                    { label: '拉稀', value: 'abnormal' }
                  ]}
                  onChange={v => setData({...data, poop: v as HealthStatus})}
                />
                <DetailRow 
                  label="⚡️ 精神活力" 
                  value={data.activity!} 
                  icon={<Zap size={18} className="text-brand-coral"/>}
                  options={[
                    { label: '正常', value: 'normal' },
                    { label: '偏静', value: 'slight_abnormal' },
                    { label: '郁郁', value: 'abnormal' }
                  ]}
                  onChange={v => setData({...data, activity: v as HealthStatus})}
                />

                <div className="space-y-4">
                  <p className="text-sm font-bold flex items-center gap-2">
                    <ClipboardList size={16} className="text-brand-coral"/>
                    完成了哪些护理？
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {availableTasks.map(task => (
                      <button
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                          data.completedTasks?.includes(task.id) 
                          ? 'bg-brand-brown text-white border-brand-brown shadow-soft' 
                          : 'bg-white text-brand-brown/30 border-brand-brown/5'
                        }`}
                      >
                        {task.name.split(' ')[1] || task.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-bold flex items-center gap-2">
                    <Star size={16} fill="currentColor" className="text-brand-yellow"/>
                    还有其他症状吗？
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['呕吐', '咳嗽', '皮肤异常', '流泪', '其他'].map(s => (
                      <button
                        key={s}
                        onClick={() => toggleSymptom(s)}
                        className={`px-6 py-3 rounded-2xl text-xs font-bold transition-all border ${
                          data.extraSymptoms?.includes(s) 
                          ? 'bg-brand-brown text-white border-brand-brown' 
                          : 'bg-white text-brand-brown/40 border-brand-brown/5'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Multimedia Input for Anomalies */}
                <AnimatePresence>
                  {hasAbnormality && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 pt-4 overflow-hidden border-t border-brand-brown/5"
                    >
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-bold flex items-center gap-2">
                          <ImageIcon size={18} className="text-brand-coral"/>
                          视觉异常记录
                        </p>
                        <span className="text-[10px] opacity-30 font-black uppercase tracking-widest">支持点击多选</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-3">
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          accept="image/*" 
                          multiple 
                          onChange={handlePhotoUpload}
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-20 h-20 rounded-3xl bg-brand-cream-dark flex flex-col items-center justify-center gap-1 hover:bg-brand-mint-deep transition-colors group"
                        >
                          <Camera size={20} className="opacity-30 group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] opacity-30 font-bold">拍照</span>
                        </button>

                        {data.visualEvidence?.map((url, idx) => (
                          <div key={idx} className="relative w-20 h-20 rounded-3xl overflow-hidden shadow-soft group">
                            <img src={url} className="w-full h-full object-cover" alt="Symptom" />
                            <button 
                              onClick={() => removePhoto(url)}
                              className="absolute top-1 right-1 p-1 bg-brand-coral text-white rounded-xl shadow-soft opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] font-medium opacity-30 leading-relaxed italic">
                        拍摄呕吐物、排泄物或患处，能在就医时提供有效线索 ✨
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={handleDetailSave}
                className="w-full bg-brand-brown text-white p-6 rounded-4xl font-bold shadow-heavy transition-transform active:scale-[0.98] sticky bottom-0"
              >
                保存当日记录
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Conflict Confirmation Modal */}
        <AnimatePresence>
          {showConflict && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[60] bg-brand-cream flex flex-col items-center justify-center p-10 text-center space-y-8 rounded-5xl border border-brand-brown/5"
            >
              <div className="w-20 h-20 bg-brand-yellow rounded-full flex items-center justify-center shadow-soft">
                <AlertCircle size={40} className="text-brand-brown" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold tracking-tight">记录冲突提醒</h3>
                <p className="text-sm font-medium opacity-60 leading-relaxed">检测到今日已存在不同状态的记录。是否要以当前的最新选择为准？</p>
              </div>
              
              <div className="grid grid-cols-1 gap-3 w-full">
                <button 
                  onClick={() => {
                    if (pendingSave) onSave(pendingSave);
                    setShowConflict(false);
                  }}
                  className="p-5 rounded-3xl bg-brand-brown text-white font-bold shadow-soft hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  确认覆盖
                </button>
                <button 
                  onClick={() => setShowConflict(false)}
                  className="p-5 rounded-3xl bg-white text-brand-brown/60 font-bold border border-brand-brown/5 hover:bg-brand-cream-dark transition-colors"
                >
                  不，保持原样
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function DetailRow({ label, value, options, onChange, icon }: { label: string, value: string, options: any[], onChange: (v: string) => void, icon?: any }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-bold">
        {icon}
        {label}
      </div>
      <div className="flex gap-2 p-1.5 bg-brand-cream-dark rounded-3xl">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-3 px-1 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              value === opt.value 
              ? 'bg-white text-brand-brown shadow-soft scale-[1.02]' 
              : 'text-brand-brown/30 hover:text-brand-brown/50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
