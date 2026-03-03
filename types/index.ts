export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
}

export interface Baby {
  id: string;
  name: string;
  birthDate: Date;
  gender: "male" | "female";
  weight?: number;
  height?: number;
  photo?: string;
  notes?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Feeding {
  id: string;
  babyId: string;
  type: "breast" | "bottle" | "solid";
  amount?: number; // ml yoki gramm
  duration?: number; // daqiqa (emizish uchun)
  notes?: string;
  time: Date;
  createdAt: Date;
}

export interface Sleep {
  id: string;
  babyId: string;
  startTime: Date;
  endTime: Date;
  duration: number; // daqiqa
  quality: "good" | "normal" | "bad";
  notes?: string;
  createdAt: Date;
}

export interface Diaper {
  id: string;
  babyId: string;
  type: "wet" | "dirty" | "both";
  time: Date;
  notes?: string;
  createdAt: Date;
}

export interface Growth {
  id: string;
  babyId: string;
  weight: number;
  height: number;
  headCircumference?: number;
  date: Date;
  createdAt: Date;
}

export interface Tip {
  id: string;
  title: string;
  content: string;
  category: "feeding" | "sleep" | "health" | "development" | "general";
  ageFrom: number; // oylarda
  ageTo: number; // oylarda
  image?: string;
  createdAt: Date;
}
