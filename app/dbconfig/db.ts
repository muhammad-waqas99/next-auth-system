
import mongoose from 'mongoose'
import dns from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
    

export default async function connectToDB() {
  try {
    await mongoose.connect(process.env.mongoUri!);
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.log("Error in MongoDB connection:", error);
    throw error;
  }
}

