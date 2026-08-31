
import mongoose from 'mongoose'


    

export default async function connectToDB() {
  try {
    await mongoose.connect(process.env.mongoUri!);
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.log("Error in MongoDB connection:", error);
    throw error;
  }
}

