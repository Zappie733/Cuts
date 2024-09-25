export interface IRegistrationProps {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  role: "user"; //admin tidak boleh register dari app, langsung lewat api atua db.
}
