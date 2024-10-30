export interface ServiceObj {
  _id?: string;
  name: string;
  price: number;
  duration: number;
  description: string;
  serviceProduct?: string[];
}
