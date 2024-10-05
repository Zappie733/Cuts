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
  image: string;
}

export interface AuthUser {
  email: string;
  password: string;
}

export interface UpdateUserParams {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}
