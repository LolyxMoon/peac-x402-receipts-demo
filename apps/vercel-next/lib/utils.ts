// lib/utils.ts - Utility functions
import { createHash } from 'crypto';

export function sha256Hex(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}

export function getPublicOrigin(): string {
  return process.env.PUBLIC_ORIGIN || process.env.NEXT_PUBLIC_ORIGIN || 'http://localhost:3000';
}
