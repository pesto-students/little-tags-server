const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
  },
  image: {
    type: String,
  },
  other_images: {
    type: [String],
  },
  category: {
    type: [String],
  },
  added_at: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = Product = mongoose.model("products", ProductSchema);
