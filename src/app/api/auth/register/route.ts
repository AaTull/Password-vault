import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import EmailPin from '@/models/EmailPin';
import User from '@/models/User';
import { sendEmailPin } from '@/lib/mailer';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    await dbConnect();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Generate secure 6-digit PIN
    const pin = crypto.randomInt(0, 1000000).toString().padStart(6, '0');
    const codeHash = await bcrypt.hash(pin, 10);
    const passwordHash = await bcrypt.hash(password, 10);

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await EmailPin.create({ email, purpose: 'register', codeHash, passwordHash, expiresAt });

    // Send email with PIN
    await sendEmailPin(email, pin, 'register');

    return NextResponse.json({ message: 'PIN sent to email. Verify to complete registration.' });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
