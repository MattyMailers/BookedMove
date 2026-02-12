import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
const JWT_SECRET = process.env.JWT_SECRET || 'bookedmove-dev-secret';
export interface JWTPayload { userId: number; email: string; type: 'company' | 'admin'; companyId?: number; }
export function signToken(payload: JWTPayload): string { return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }); }
export function verifyToken(token: string): JWTPayload | null { try { return jwt.verify(token, JWT_SECRET) as JWTPayload; } catch { return null; } }
export function getTokenFromRequest(req: NextRequest): JWTPayload | null {
  const ah = req.headers.get('authorization');
  if (ah?.startsWith('Bearer ')) return verifyToken(ah.slice(7));
  const t = req.cookies.get('token')?.value;
  return t ? verifyToken(t) : null;
}
export function requireCompanyAuth(req: NextRequest): JWTPayload { const p = getTokenFromRequest(req); if (!p || p.type !== 'company') throw new Error('Unauthorized'); return p; }
export function requireAdminAuth(req: NextRequest): JWTPayload { const p = getTokenFromRequest(req); if (!p || p.type !== 'admin') throw new Error('Unauthorized'); return p; }
