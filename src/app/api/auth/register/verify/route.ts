import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import dbConnect from '@/lib/mongodb';
import EmailPin from '@/models/EmailPin';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    const { email, pin } = await request.json();
    if (!email || !pin) return NextResponse.json({ error: 'Email and PIN required' }, { status: 400 });

    await dbConnect();

    // Find latest, unconsumed registration PIN
    const doc = await EmailPin.findOne({ email, purpose: 'register', consumed: false, expiresAt: { $gt: new Date() } })
      .sort({ createdAt: -1 });
    if (!doc) return NextResponse.json({ error: 'PIN not found or expired' }, { status: 400 });

    const ok = await bcrypt.compare(pin, doc.codeHash);
    if (!ok) return NextResponse.json({ error: 'Invalid PIN' }, { status: 400 });

    // Create user with stored passwordHash
    const existing = await User.findOne({ email });
    if (existing) return NextResponse.json({ error: 'User already exists' }, { status: 400 });

    await User.create({ email, password: doc.passwordHash, twoFactorEnabled: false, twoFactorSecret: '' });

    doc.consumed = true;
    await doc.save();

    return NextResponse.json({ message: 'Registration successful!' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

