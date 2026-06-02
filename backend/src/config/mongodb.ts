import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel-management';

export const connectMongoDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    // MongoDB is optional; the app runs fine without it
  }
};

export const disconnectMongoDB = async (): Promise<void> => {
  await mongoose.disconnect();
};

export default mongoose;
