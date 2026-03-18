import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('FATAL ERROR: MONGODB_URI is not defined in .env file');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected to Atlas: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection to Atlas failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
