import mongoose from "mongoose";

export async function connectToDatabase() {
    mongoose.connection.on('connected', ()=>{
        console.log("Successfully connected to MongoDB.")
    })
    const connectionString = process.env.MONGODB_URI;
    if (!connectionString) {
        throw new Error("MONGODB_URI is not configured");
    }
    await mongoose.connect(connectionString)
    
}