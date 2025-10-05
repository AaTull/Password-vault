import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyTOTP } from '@/lib/totp';

export async function POST(request: Request) {
  try {
    const { registrationToken, code } = await request.json();
    if (!registrationToken || !code) {
      return NextResponse.json({ error: 'Missing registration token or code' }, { status: 400 });
    }

    const payload = jwt.verify(registrationToken, process.env.JWT_SECRET!) as any;
    if (!payload || payload.purpose !== 'register') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    const { email, passwordHash, twoFactorSecret } = payload;
    if (!email || !passwordHash || !twoFactorSecret) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 400 });
    }

    // Verify TOTP using secret from token
    const ok = verifyTOTP(code, twoFactorSecret);
    if (!ok) {
      return NextResponse.json({ error: 'Invalid 2FA code' }, { status: 400 });
    }

    await dbConnect();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Create user now with 2FA enabled
    const user = await User.create({
      email,
      password: passwordHash,
      twoFactorEnabled: true,
      twoFactorSecret,
    });

    return NextResponse.json({ message: 'Registration complete' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

