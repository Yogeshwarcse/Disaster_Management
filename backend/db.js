import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const atlasUri = process.env.MONGODB_URI;
    const localUri = 'mongodb://127.0.0.1:27017/disaster-relief';
    
    let conn;
    
    // If an Atlas URI is provided in .env, try that FIRST
    if (atlasUri) {
      try {
        console.log('Connecting to MongoDB Atlas...');
        conn = await mongoose.connect(atlasUri);
        console.log(`MongoDB Connected to Atlas: ${conn.connection.host}`);
        return; // Success, exit function
      } catch (atlasError) {
        console.log(`Atlas connection failed: ${atlasError.message}`);
        console.log('Falling back to local MongoDB...');
      }
    }
    
    // Try local MongoDB if Atlas failed or wasn't provided
    conn = await mongoose.connect(localUri);
    console.log(`MongoDB Connected Locally: ${conn.connection.host}`);
    
  } catch (error) {
    console.error(`MongoDB connection failed completely: ${error.message}`);
    console.log('Continuing without database - some features may not work');
  }
};

export default connectDB;
