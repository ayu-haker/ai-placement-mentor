import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '3e658210ccac2e2936bbdd651ff78f00';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};
