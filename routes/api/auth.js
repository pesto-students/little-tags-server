const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const { check, validationResult, body } = require("express-validator");
const {
  generatePasswordHash,
  verifyPasswordHash,
} = require("../../_helpers/password-service");

// middleware
const requiredRole = require("../../middleware/role");
const auth = require("../../middleware/auth");

const Admin = require("../../models/Admin");
const User = require("../../models/Admin");

// @route GET /api/auth/v1/__test
// @desc Test route
// @access PUBLIC
router.get("/__test", (req, res) => res.send("auth routes working :)"));

// @route POST /api/auth/v1/login
// @desc LOGIN with email and password
// @access PUBLIC
router.post(
  "/login",
  [
    check("email").isEmail(),
    check("password")
      .isLength({ min: 5 })
      .withMessage("must be at least 5 chars long")
      .matches(/\d/)
      .withMessage("must contain a number"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    // Check if user exists
    try {
      let admin = await Admin.findOne({ email });

      if (!admin) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }
      const isMatch = await verifyPasswordHash(password, admin.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      const payload = {
        admin: {
          id: admin.id,
          role: admin.role,
          approved: admin.role_approved,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "5 days" },
        (err, token) => {
          if (err) throw err;
          res.status(201).json({ message: "Login success", token: token });
        }
      );
    } catch (err) {
      console.log(err);
      res.status(500).send("Server Error");
    }
  }
);

// @route POST api/auth/v1/signup
// @desc SIGNUP AS USER
// @access PUBLIC
router.post(
  "/signup",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please enter a valid email").isEmail(),
    check("password")
      .isLength({ min: 5 })
      .withMessage("must be at least 5 chars long")
      .matches(/\d/)
      .withMessage("must contain a number"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    const emailRegex = new RegExp(email);
    try {
      let admin = await Admin.findOne({
        email: { $regex: emailRegex, $options: "i" },
        password: { $exists: true },
      });

      if (admin) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Admin already exists" }] });
      }

      admin = new Admin({
        name: name,
        email,
        password,
      });

      admin.password = await generatePasswordHash(password);

      admin = await admin.save();

      return res
        .status(201)
        .json({ success: true, message: "Signup successfully :)" });
    } catch (err) {
      console.log(err);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
