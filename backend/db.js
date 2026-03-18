import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Try local MongoDB first, then fall back to Atlas
    const localUri = 'mongodb://127.0.0.1:27017/disaster-relief';
    const atlasUri = process.env.MONGODB_URI || localUri;
    
    let conn;
    try {
      // Try local MongoDB first
      conn = await mongoose.connect(localUri);
      console.log(`MongoDB Connected:`);
    } catch (localError) {
      console.log('Local MongoDB failed, trying Atlas...');
      // Fall back to Atlas
      conn = await mongoose.connect(atlasUri);
      console.log(`MongoDB Connected to Atlas: ${conn.connection.host}`);
    }
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    console.log('Continuing without database - some features may not work');
    // Don't exit the process, just continue without DB
  }
};

export default connectDB;
