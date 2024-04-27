declare global {
  namespace Express {
    export interface Request {
      user: any | null;
      User: any | null;
    }
  }
}
