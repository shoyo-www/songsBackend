const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      "mongodb+srv://shoyostriker_db_user:VZClX6xJsLI9mGAz@mysongs.tekn7cb.mongodb.net/songsdb?retryWrites=true&w=majority&appName=MySongs",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
      }
    );

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }

  mongoose.connection.on("connected", () => {
    console.log("✅ MongoDB connection established.");
  });

  mongoose.connection.on("error", (err) => {
    console.error("❌ MongoDB connection error:", err);
  });
};

module.exports = connectDB;
