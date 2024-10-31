export interface ServiceProductObj {
  _id?: string;
  name: string;
  quantity: number;
  alertQuantity: number;
  description?: string;
  isAnOption: boolean;
  addtionalPrice?: number;
}

export interface AddServiceProductRequestObj {
  name: string;
  quantity: number;
  alertQuantity: number;
  description?: string;
  isAnOption: boolean;
  addtionalPrice?: number;
}

export interface UpdateServiceProductRequestObj {
  serviceProductId: string;
  name: string;
  quantity: number;
  alertQuantity: number;
  description?: string;
  isAnOption: boolean;
  addtionalPrice?: number;
}
