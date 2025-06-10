const mongoose = require("mongoose");
require("dotenv").config();

const { DB_NAME } = require("../constants"); 
const MONGO_URI = process.env.MONGODB_URI;

const DBconnect = async () => {
  try {
    const connect = await mongoose.connect(`${MONGO_URI}/${DB_NAME}`);
    console.log(`✅ DATABASE CONNECTED: ${connect.connection.host}`);
  } catch (error) {
    console.error("❌ ERROR:", error.message);
    process.exit(1);
  }
};

module.exports = DBconnect;
