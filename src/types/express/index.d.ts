import 'express';

declare global {
  namespace Express {
    interface UserPayload {
      id: string;
      email: string;
      role: 'admin';
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};

