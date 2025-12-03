import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Secure debug endpoint to check for an admin user in the database.
 *
 * Usage:
 * - Set environment variable `ADMIN_CHECK_TOKEN` on the server (Vercel) to a random secret.
 * - Call: `GET /api/debug/admin-check?token=<secret>&email=mbende2000@yahoo.com` or
 *   include header `Authorization: Bearer <secret>`
 *
 * Response (200): { exists: boolean, email?: string, emailVerified?: boolean, role?: string }
 * 401 if token missing/invalid. 500 on server error.
 */

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const tokenParam = url.searchParams.get('token');
    const emailParam = url.searchParams.get('email');

    // Accept token from query or Authorization header
    const authHeader = request.headers.get('authorization') || '';
    const headerToken = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const token = tokenParam || headerToken;

    const secret = process.env.ADMIN_CHECK_TOKEN;
    if (!secret) {
      return NextResponse.json({ error: 'Server not configured (missing ADMIN_CHECK_TOKEN)' }, { status: 500 });
    }

    if (!token || token !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Default email to check if not provided
    const emailToCheck = emailParam || 'mbende2000@yahoo.com';

    const user = await prisma.user.findUnique({ where: { email: emailToCheck } });

    if (!user) {
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({
      exists: true,
      email: user.email,
      emailVerified: Boolean(user.emailVerified),
      role: user.role,
    });
  } catch (err) {
    console.error('admin-check error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
