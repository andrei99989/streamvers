import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.log("MongoDB dezactivat: MONGO_URI lipsește.");
      return;
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB conectat.");
  } catch (error) {
    console.log("MongoDB indisponibil. Backend-ul pornește în mod demo.");
    console.log(error.message);
  }
};
