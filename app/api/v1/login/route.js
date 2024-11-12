import connectDB from '@/utils/db';
import User from '@/models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = (user) => {
    return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
};

export async function POST(req) {
    await connectDB();
    const { email, password } = await req.json();
  
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 });
    }
  
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 });
    }
  
    // Generate JWT for valid credentials
    const token = generateToken(user);
    return NextResponse.json({ token, message: 'Login successful' });
}