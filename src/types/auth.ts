export interface AdminUser {
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}
