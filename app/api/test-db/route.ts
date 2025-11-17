import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// Test endpoint to check MongoDB connection
export async function GET() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.log('MONGODB_DB:', process.env.MONGODB_DB || 'calendarr');
    
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ 
        success: false, 
        error: 'MONGODB_URI is not set',
        message: 'Please set MONGODB_URI in your environment variables'
      }, { status: 500 });
    }

    const client = await Promise.race([
      clientPromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000)
      )
    ]) as any;

    // Test the connection
    await client.db('admin').command({ ping: 1 });
    console.log('✅ MongoDB connection successful');

    // Test database access
    const db = client.db(process.env.MONGODB_DB || 'calendarr');
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map((c: any) => c.name));

    return NextResponse.json({ 
      success: true,
      message: 'MongoDB connection successful',
      database: process.env.MONGODB_DB || 'calendarr',
      collections: collections.map((c: any) => c.name)
    });
  } catch (error: any) {
    console.error('❌ MongoDB connection test failed');
    console.error('Error:', error.message);
    console.error('Error code:', error.code);
    console.error('Error name:', error.name);

    let errorMessage = error.message;
    if (error.message?.includes('authentication')) {
      errorMessage = 'Authentication failed. Check your username and password.';
    } else if (error.message?.includes('timeout') || error.message?.includes('ETIMEOUT')) {
      errorMessage = 'Connection timeout. Check your network access settings in MongoDB Atlas.';
    } else if (error.message?.includes('ENOTFOUND') || error.message?.includes('DNS')) {
      errorMessage = 'Hostname not found. Check your connection string.';
    }

    return NextResponse.json({ 
      success: false,
      error: errorMessage,
      errorCode: error.code,
      errorName: error.name,
      details: 'Check Vercel function logs for more details'
    }, { status: 500 });
  }
}

