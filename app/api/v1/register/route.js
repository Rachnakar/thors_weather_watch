import connectDB from '@/utils/db';
import User from '@/models/User';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';


// Register User (POST)
export async function POST(req) {
  await connectDB();
  const { email, password } = await req.json();

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json({ message: 'User already exists' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ email, password: hashedPassword });
  await newUser.save();

  return NextResponse.json({ message: 'User created successfully' });
}