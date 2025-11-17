import { MongoClient, MongoClientOptions } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.warn('Warning: MONGODB_URI is not set. Database features will not work.');
}

// MongoDB connection options
// MongoDB Atlas uses SRV connection strings and requires TLS
// These options ensure compatibility with both MongoDB Atlas and other MongoDB providers
const options: MongoClientOptions = {
  retryWrites: true, // Enable retryable writes for better reliability
  // MongoDB Atlas connection strings already include TLS settings
  // Don't override TLS settings unless explicitly needed
  serverSelectionTimeoutMS: 10000, // 10 seconds timeout for server selection
  socketTimeoutMS: 45000, // 45 seconds socket timeout
  connectTimeoutMS: 10000, // 10 seconds connection timeout
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  // If no URI, create a dummy promise that will reject
  clientPromise = Promise.reject(new Error('MongoDB URI is not configured'));
} else {
  // Validate URI format
  try {
    // Check if it's a valid MongoDB URI
    if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
      throw new Error('Invalid MongoDB URI format. Must start with mongodb:// or mongodb+srv://');
    }
    
    // Log connection attempt (without exposing password)
    const uriForLogging = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
    console.log('MongoDB connection URI:', uriForLogging);
    console.log('MongoDB connection options:', JSON.stringify(options, null, 2));
  } catch (error) {
    console.error('Invalid MongoDB URI:', error);
    clientPromise = Promise.reject(error);
  }

  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    let globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect().catch((error) => {
        // Reset the promise on error so we can retry
        globalWithMongo._mongoClientPromise = undefined;
        console.error('MongoDB connection failed:', error.message);
        throw error;
      });
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    // In production mode, create a new client each time
    // This is better for serverless environments like Vercel
    client = new MongoClient(uri, options);
    clientPromise = client.connect().catch((error) => {
      console.error('MongoDB connection failed:', error.message);
      console.error('Error code:', error.code);
      console.error('Error name:', error.name);
      throw error;
    });
  }
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

