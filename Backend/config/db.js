const mongoose = require("mongoose");

let isDbConnected = false;

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ai-ledger";
  try {
    await mongoose.connect(MONGO_URI);
    console.log("SUCCESS: Connected to MongoDB for Lead Captures.");
    isDbConnected = true;
    return true;
  } catch (err) {
    console.error("WARNING: MongoDB connection failed. Server running in simulation mode.", err.message);
    isDbConnected = false;
    return false;
  }
};

const getDbStatus = () => isDbConnected;

module.exports = { connectDB, getDbStatus };
