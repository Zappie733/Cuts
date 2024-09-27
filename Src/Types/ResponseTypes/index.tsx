export interface IResponseProps<T = {}> {
  status: number;
  data?: T;
  message: string;
}
