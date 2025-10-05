import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import VaultItem from '@/models/VaultItem';

async function verifyToken(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) throw new Error('No token provided');
  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
  return decoded.userId as string;
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await verifyToken(request);
    const body = await request.json();
    const { title, username, url, encryptedPassword, encryptedNotes } = body;

    await dbConnect();

    const updated = await VaultItem.findOneAndUpdate(
      { _id: params.id, userId },
      {
        title,
        username,
        url,
        encryptedPassword,
        encryptedNotes,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await verifyToken(request);
    await dbConnect();

    const deleted = await VaultItem.findOneAndDelete({ _id: params.id, userId });
    if (!deleted) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

