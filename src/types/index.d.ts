import { UserDbType } from 'src/users/users.scheme.types';

declare global {
  namespace Express {
    export interface Request {
      user: UserDbType | null;
    }
  }
}
