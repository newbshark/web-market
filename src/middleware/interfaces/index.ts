declare global {
  namespace Express {
    interface Request {
      user?: JwtUser;
    }
  }
}

export interface JwtUser {
  id: number;
}

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export { };