/**
 * Script to create MongoDB indexes for better query performance
 * Run this once to set up indexes: 
 *   MONGODB_URI=your_uri MONGODB_DB=calendarr node scripts/create-indexes.js
 * 
 * Or set environment variables in .env.local and run:
 *   node scripts/create-indexes.js
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Try to load .env.local manually
let uri = process.env.MONGODB_URI;
let dbName = process.env.MONGODB_DB || 'calendarr';

if (!uri) {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envFile = fs.readFileSync(envPath, 'utf8');
      envFile.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          if (key.trim() === 'MONGODB_URI') {
            uri = value;
          } else if (key.trim() === 'MONGODB_DB') {
            dbName = value;
          }
        }
      });
    }
  } catch (error) {
    // Ignore errors reading .env.local
  }
}

if (!uri) {
  console.error('❌ MONGODB_URI is not set.');
  console.error('Set it as an environment variable or in .env.local file');
  process.exit(1);
}

async function createIndexes() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    const collection = db.collection('meetings');
    
    // Create index on 'id' field for fast lookups
    await collection.createIndex({ id: 1 }, { unique: true });
    console.log('✅ Created index on "id" field');
    
    // Create index on 'createdAt' for sorting/filtering
    await collection.createIndex({ createdAt: -1 });
    console.log('✅ Created index on "createdAt" field');
    
    // Create compound index for availability queries
    await collection.createIndex({ 'availability.userId': 1 });
    console.log('✅ Created index on "availability.userId" field');
    
    console.log('\n✅ All indexes created successfully!');
  } catch (error) {
    console.error('Error creating indexes:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

createIndexes();

