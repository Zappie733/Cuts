export interface RatingObj {
  userId: string;
  storeId: string;
  serviceId: string; //agar bisa di sort rating per service
  orderId: string; //buat check order yang terkait sudah ngerate atau belum
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  date: Date;
}

export interface AddRatingRequestObj {
  storeId: string;
  serviceId: string;
  orderId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
}
