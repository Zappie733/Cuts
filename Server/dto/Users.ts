export interface UserObj {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword?: string;
  phone: string;
  role: "admin" | "user" | "store";
  // generateAuthToken: () => void;
  verified: boolean;
}

export interface AuthUser {
  email: string;
  password: string;
}
