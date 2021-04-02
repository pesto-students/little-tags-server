const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
  },
  auth_provider: {
    type: String,
  },
  role: {
    type: String,
    default: "user",
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = User = mongoose.model("users", UserSchema);
