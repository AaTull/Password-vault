import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import EmailPin from '@/models/EmailPin';
import { sendEmailPin } from '@/lib/mailer';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    await dbConnect();
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Generate and send a login PIN
    const pin = crypto.randomInt(0, 1000000).toString().padStart(6, '0');
    const codeHash = await bcrypt.hash(pin, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await EmailPin.create({ email, purpose: 'login', codeHash, expiresAt });
    await sendEmailPin(email, pin, 'login');

    return NextResponse.json({ message: 'PIN sent to email. Verify to login.' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
