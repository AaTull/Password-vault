import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyTOTP } from '@/lib/totp';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();
    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code required' }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findOne({ email });
    if (!user || !user.twoFactorSecret) {
      return NextResponse.json({ error: 'User not found or 2FA not initialized' }, { status: 404 });
    }

    const ok = verifyTOTP(code, user.twoFactorSecret);
    if (!ok) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
    }

    if (!user.twoFactorEnabled) {
      user.twoFactorEnabled = true;
      await user.save();
    }

    return NextResponse.json({ message: '2FA verified and enabled' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

