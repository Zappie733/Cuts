import { ImageRequestObj } from "./Image";

export interface WorkerObj {
  _id?: string;
  firstName: string;
  lastName: string;
  age: number;
  role: "admin" | "worker" | "others"; //admin adalah org yang diperaya di barber tersebut untuk mengelola bisnis seperti menerima atau menolak pesanan dan melakukan absensi pekerja
  isOnDuty?: boolean;
  history?: HistoryObj[];
  image: ImageRequestObj;
  joinDate: Date;
}

export interface HistoryObj {
  date: Date;
  clockIn?: Date;
  clockOut?: Date;
  isAbsence?: boolean;
  reason?: string;
}

export interface RegisterWorkerRequestObj {
  firstName: string;
  lastName: string;
  age: number;
  role: "admin" | "worker" | "others";
  image: ImageRequestObj;
}

export interface UpdateWorkerRequestObj {
  workerId: string;
  firstName: string;
  lastName: string;
  age: number;
  role: "admin" | "worker" | "others";
  image: ImageRequestObj;
}

export interface AbsenceWorkerRequestObj {
  id: string;
  reason: string;
}
