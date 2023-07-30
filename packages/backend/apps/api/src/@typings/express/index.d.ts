import { IUser } from '~libs/entities';

declare module 'express' {
  export interface Request {
    user: IUser;
    token: string;
  }
}
