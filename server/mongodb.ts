import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Bhavya:O6eZs2PHuPYybU8M@financialflow.st6lofj.mongodb.net/FinancialFlow?retryWrites=true&w=majority&appName=FinancialFlow';

let isConnected = false;

export async function connectToMongoDB() {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export { mongoose };