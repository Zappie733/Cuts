export interface ServiceObj {
  _id?: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
  serviceProduct?: string[];
  discount?: number;
}

export interface AddServiceRequestObj {
  name: string;
  price: number;
  duration: number;
  description?: string;
  serviceProduct?: string[];
}

export interface UpdateServiceRequestObj {
  serviceId: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
  serviceProduct?: string[];
  discount?: number;
}
