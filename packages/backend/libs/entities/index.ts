import { User } from '@prisma/client';
export * from './pagination';

export type IUser = Omit<User, 'password' | 'token'>;

export { User };
