import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import VaultItem from '@/models/VaultItem';

async function verifyToken(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) throw new Error('No token provided');
  
  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
  return decoded.userId;
}

export async function GET(request: Request) {
  try {
    const userId = await verifyToken(request);
    await dbConnect();
    
    const items = await VaultItem.find({ userId }).sort({ updatedAt: -1 });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await verifyToken(request);
    const { title, username, encryptedPassword, url, encryptedNotes } = await request.json();
    
    await dbConnect();
    
    const vaultItem = await VaultItem.create({
      userId,
      title,
      username,
      encryptedPassword,
      url,
      encryptedNotes
    });
    
    return NextResponse.json(vaultItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

