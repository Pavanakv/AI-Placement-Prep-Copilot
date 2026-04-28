const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // connect to mongodb using connection string from .env
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected!");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1); // stop server if DB fails
  }
};

module.exports = connectDB;