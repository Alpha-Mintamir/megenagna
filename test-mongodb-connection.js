const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Read .env.local file
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        process.env[key] = value;
      }
    });
  }
}

loadEnvFile();

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'calendarr';

console.log('🔍 Testing MongoDB Connection...\n');
console.log('MONGODB_URI:', uri ? uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@') : 'NOT SET');
console.log('MONGODB_DB:', dbName);
console.log('');

if (!uri) {
  console.error('❌ ERROR: MONGODB_URI is not set in .env.local');
  process.exit(1);
}

async function testConnection() {
  let client;
  
  try {
    console.log('📡 Connecting to MongoDB...');
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });
    
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');
    
    // Test ping
    console.log('\n📊 Testing database access...');
    await client.db('admin').command({ ping: 1 });
    console.log('✅ Ping successful');
    
    // List databases
    const adminDb = client.db('admin');
    const databases = await adminDb.admin().listDatabases();
    console.log('\n📚 Available databases:');
    databases.databases.forEach(db => {
      console.log(`   - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    // Test target database
    console.log(`\n🎯 Testing target database: ${dbName}`);
    const db = client.db(dbName);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log(`✅ Database "${dbName}" is accessible`);
    console.log(`📁 Collections in "${dbName}":`);
    if (collections.length === 0) {
      console.log('   (no collections yet - database is empty)');
    } else {
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
    }
    
    // Test write operation
    console.log(`\n✍️  Testing write operation...`);
    const testCollection = db.collection('test_connection');
    const testDoc = {
      test: true,
      timestamp: new Date(),
      message: 'Connection test successful'
    };
    
    const insertResult = await testCollection.insertOne(testDoc);
    console.log(`✅ Write test successful! Inserted document ID: ${insertResult.insertedId}`);
    
    // Clean up test document
    await testCollection.deleteOne({ _id: insertResult.insertedId });
    console.log('🧹 Cleaned up test document');
    
    console.log('\n🎉 All tests passed! MongoDB connection is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Connection test failed!');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    
    if (error.message?.includes('authentication')) {
      console.error('\n💡 Tip: Check your username and password in the connection string');
    } else if (error.message?.includes('timeout') || error.message?.includes('ETIMEOUT')) {
      console.error('\n💡 Tip: Check your network access settings in MongoDB Atlas');
      console.error('   Make sure your IP is whitelisted (or use 0.0.0.0/0)');
    } else if (error.message?.includes('ENOTFOUND') || error.message?.includes('DNS')) {
      console.error('\n💡 Tip: Check your connection string hostname');
    } else if (error.message?.includes('not authorized')) {
      console.error('\n💡 Tip: Check your database user permissions in MongoDB Atlas');
    }
    
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Connection closed');
    }
  }
}

testConnection();

