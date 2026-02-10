import { SignJWT, jwtVerify } from 'jose';
import type { VercelRequest } from '@vercel/node';

const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET || 'change-me');
const getAdminPassword = () => process.env.ADMIN_PASSWORD || 'admin';

export async function signToken(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .setIssuedAt()
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export function extractToken(req: VercelRequest): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  // Fallback to cookie
  const cookieHeader = req.headers.cookie || '';
  const match = cookieHeader.match(/admin_token=([^;]+)/);
  return match ? match[1] : null;
}

export function verifyPassword(password: string): boolean {
  return password === getAdminPassword();
}

export async function isAdmin(req: VercelRequest): Promise<boolean> {
  const token = extractToken(req);
  if (!token) return false;
  return verifyToken(token);
}
