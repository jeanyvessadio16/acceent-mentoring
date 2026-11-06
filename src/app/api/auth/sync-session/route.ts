import { NextRequest, NextResponse } from 'next/server';
import { getSessionTokens, setAuthCookies, clearAuthCookies } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, accessToken, refreshToken, expiresAt } = body;

    if (event === 'SIGNED_OUT') {
      await clearAuthCookies();
      return NextResponse.json({ success: true, message: 'Session purgée.' });
    }

    if (accessToken && refreshToken) {
      const session = await getSessionTokens();
      await setAuthCookies({
        accessToken,
        refreshToken,
        role: session.role || 'BENEFICIARY',
        userId: session.userId || '',
        userName: session.userName,
        userEmail: session.userEmail,
        expiresAt,
      });

      return NextResponse.json({ success: true, message: 'Jetons rafraîchis avec succès.' });
    }

    return NextResponse.json({ success: false, message: 'Données de session incomplètes.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Erreur interne.' }, { status: 500 });
  }
}

