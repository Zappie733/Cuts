import { IImageProps } from "../ComponentTypes/ImageTypes";

export interface HistoryObj {
  date: Date;
  clockIn?: Date;
  clockOut?: Date;
  isAbsence?: boolean;
  reason?: string;
}
export interface WorkerObj {
  _id?: string;
  firstName: string;
  lastName: string;
  age: number;
  role: "admin" | "worker" | "others"; //admin adalah org yang diperaya di barber tersebut untuk mengelola bisnis seperti menerima atau menolak pesanan dan melakukan absensi pekerja
  isOnDuty?: boolean;
  history?: HistoryObj[];
  image: IImageProps;
  joinDate: Date;
}

export interface RegisterWorkerData {
  firstName: string;
  lastName: string;
  age: number;
  role: "admin" | "worker" | "others" | null;
  image: IImageProps;
}

export interface UpdateWorkerData {
  workerId: string;
  firstName: string;
  lastName: string;
  age: number;
  role: "admin" | "worker" | "others" | null;
  image: IImageProps;
}

export interface AbsenceWorkerData {
  id: string;
  reason: string;
}
