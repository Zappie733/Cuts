import { ImageRequestObj } from "./Image";

export interface WorkerObj {
  _id?: string;
  firstName: string;
  lastName: string;
  age: number;
  role: "admin" | "worker"; //admin adalah org yang diperaya di barber tersebut untuk mengelola bisnis seperti menerima atau menolak pesanan dan melakukan absensi pekerja
  isOnDuty?: boolean;
  history?: HistoryObj[];
  image: ImageRequestObj;
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
  role: "admin" | "worker";
  image: ImageRequestObj;
}

export interface UpdateWorkerRequestObj {
  workerId: string;
  firstName: string;
  lastName: string;
  age: number;
  role: "admin" | "worker";
  image: ImageRequestObj;
}

export interface AbsenceWorkerRequestObj {
  id: string;
  reason: string;
}
