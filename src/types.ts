export interface Pet {
  id: string;
  name: string;
  birthDate: string; // ISO string
  gender: 'male' | 'female' | 'unknown';
  weight: number;
  avatar?: string;
}

export type HealthStatus = 'normal' | 'slight_abnormal' | 'abnormal' | 'none';

export interface DailyRecord {
  id: string;
  petId: string;
  date: string; // YYYY-MM-DD
  isAllNormal: boolean;
  appetite: HealthStatus;
  poop: HealthStatus;
  activity: HealthStatus;
  extraSymptoms: string[]; // ['呕吐', '咳嗽', etc]
  visualEvidence?: string[]; // Array of base64 or object URLs for photos
  completedTasks?: string[]; // IDs of tasks completed on this day
}

export type TaskStatus = 'booking' | 'booked' | 'due' | 'done';

export interface PeriodicTask {
  id: string;
  petId: string;
  name: string;
  cycleDays: number;
  bookingOffsetDays: number;
  lastDoneAt: string; // ISO string
  nextDueAt: string; // ISO string
  bookingAt: string; // ISO string
  finalAppointmentDate?: string; // ISO string (Date of the final appointment)
  status: TaskStatus;
}
