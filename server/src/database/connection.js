import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Database connected successfully");
    } catch (err) {
        console.error("Database connection failed:", err);
        process.exit(1); // optional: exit the process on failure
    }
};

connectDB();
