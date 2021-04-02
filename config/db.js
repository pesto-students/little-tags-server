const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "onetagshop",
    });
    console.log(":) mongodb connected");
  } catch (error) {
    console.log(":( Database connection error", error);
  }
};

module.exports = connectDB;
