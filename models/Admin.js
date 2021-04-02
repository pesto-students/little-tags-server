const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AdminSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "admin",
  },
  role_approved: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = Admin = mongoose.model("admins", AdminSchema);
