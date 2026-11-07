import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { twoFactorRateLimit, safeRateLimit } from '@/lib/redis';
import { hashIP } from '@/lib/utils/security';
import { extractClientIP } from '@/lib/utils/ip';

export async function POST(request: Request) {
    const headersList = await headers();

    // SECURITY: Rate limit 2FA setup attempts (5 per 15 minutes per IP)
    // Prevents brute-force attacks on password verification during 2FA setup
    const clientIP = extractClientIP(headersList);
    const ipHash = hashIP(clientIP);
    const { success: limitSuccess } = await safeRateLimit(twoFactorRateLimit, `2fa-setup:${ipHash}`);

    if (!limitSuccess) {
        console.warn(`[AUTH] 2FA setup rate limit exceeded for IP: ${clientIP}`);
        return NextResponse.json(
            { error: 'Trop de tentatives. Réessayez dans 15 minutes.' },
            { status: 429 }
        );
    }

    const session = await auth.api.getSession({
        headers: headersList,
    });

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { password } = await request.json();

    if (!password) {
        return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    try {
        const setup = await auth.api.enableTwoFactor({
            headers: headersList,
            body: {
                password,
                issuer: 'Aspeo',
            },
        });

        if (!setup || !setup.totpURI) {
            return NextResponse.json({ error: 'Failed to generate secret' }, { status: 500 });
        }

        const { totpURI, backupCodes } = setup;
        const qrCode = await QRCode.toDataURL(totpURI);

        return NextResponse.json({
            qrCode,
            backupCodes,
        });
    } catch (error) {
        console.error('[AUTH] 2FA setup error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
