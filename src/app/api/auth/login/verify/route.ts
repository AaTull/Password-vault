import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import EmailPin from '@/models/EmailPin';
import User from '@/models/User';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { email, pin } = await request.json();
    if (!email || !pin) return NextResponse.json({ error: 'Email and PIN required' }, { status: 400 });

    await dbConnect();
    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const doc = await EmailPin.findOne({ email, purpose: 'login', consumed: false, expiresAt: { $gt: new Date() } })
      .sort({ createdAt: -1 });
    if (!doc) return NextResponse.json({ error: 'PIN not found or expired' }, { status: 400 });

    const ok = await bcrypt.compare(pin, doc.codeHash);
    if (!ok) return NextResponse.json({ error: 'Invalid PIN' }, { status: 400 });

    doc.consumed = true;
    await doc.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '24h' });
    return NextResponse.json({ message: 'Login successful!', token, userId: user._id }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

