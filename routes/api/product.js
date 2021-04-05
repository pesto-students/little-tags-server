const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

// middleware
const auth = require("../../middleware/auth");
const role = require("../../middleware/role");

// models
const Product = require("../../models/Product");

router.get("/__test", [auth, role("admin")], async (req, res) => {
  try {
    res.status(200).json("products route working");
  } catch (error) {
    console.log(error);
    res.status(401).json({ success: false, message: error });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const page = req.query.page ? req.query.page : 1;
    const skip = (page - 1) * 10;
    const limit = page * 10;
    const products = await Product.find({}).skip(skip).limit(limit);
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.log(error);
    res.status(401).json({ success: false, message: error });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.log(error);
    res.status(401).json({ success: false, message: error });
  }
});

router.post(
  "/",
  [
    auth,
    role("admin"),
    check("title", "Product title is required"),
    check("price", "Product price is required"),
    check("image", "Product image is required"),
  ],
  async (req, res) => {
    const { title, description, price, category, image } = req.body;
    try {
      const product_obj = new Product({
        title,
        description,
        price,
        image,
        category: [category],
      });

      const product = await product_obj.save();
      console.log(product);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      return res
        .status(401)
        .json({ success: false, message: "Something went wrong" });
    }
  }
);

router.delete("/:id", [auth, role("admin")], async (req, res) => {
  try {
    console.log(req.user.role);
    const result = await Product.findByIdAndDelete(req.params.id);
    console.log(result);
    res
      .status(200)
      .json({ success: true, message: "Product deleted", data: result });
  } catch (error) {
    console.log(error);
    res.status(401).json({ success: false, message: error });
  }
});
module.exports = router;
