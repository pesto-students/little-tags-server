const express = require("express");
const router = express.Router();
const { OAuth2Client } = require("google-auth-library");

const { check, validationResult } = require("express-validator");
const {
  generatePasswordHash,
  verifyPasswordHash,
  getToken,
} = require("../../_helpers/password-service");

// middleware
const requiredRole = require("../../middleware/role");
const auth = require("../../middleware/auth");

const Admin = require("../../models/Admin");
const User = require("../../models/User");

// @route GET /api/auth/v1/__test
// @desc Test route
// @access PUBLIC
router.get("/__test", auth, (req, res) => res.send("auth routes working :)"));

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

    // Check if user exists
    const { email, password } = req.body;
    try {
      let admin = await Admin.findOne({ email: req.body.email });

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
        user: {
          id: admin.id,
          role: admin.role,
          approved: admin.role_approved,
        },
      };

      const token = await getToken(payload);
      const { name, email } = admin;
      res.status(201).json({
        message: "Login success",
        data: { user: { name, email }, token: token },
      });
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

// @route POST api/auth/v1/google_login
// @desc SIGNUP AS USER
// @access PUBLIC

router.post("/google_login", async (req, res) => {
  try {
    const client = new OAuth2Client(process.env.GOOGLE_AUTH_CLIENT_ID);
    const { tokenId } = req.body;
    console.log(tokenId);
    const clientVerificationResponse = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_AUTH_CLIENT_ID,
    });
    console.log(clientVerificationResponse.payload);
    const {
      email_verified,
      name,
      email,
      picture,
    } = clientVerificationResponse.payload;

    if (!email_verified) {
      return res.status(400).json({
        success: false,
        message: "Login failed, email not verified by google",
      });
    }
    const user = await User.findOne({ email });

    if (!user) {
      //create a new user in the db
      const password = await generatePasswordHash(
        email + process.env.PASSWORD_SECRET
      );
      const new_user = new User({
        name: name,
        email: email,
        password: password,
        picture: picture,
        auth_provider: "google",
      }).save();

      const payload = {
        user: {
          id: new_user.id,
          role: "user",
        },
      };

      const token = await getToken(payload);

      res.status(201).json({
        message: "Login success",
        data: { user: { name, email, picture }, token: token },
      });
    } else {
      const payload = {
        user: {
          id: user.id,
          role: "user",
        },
      };
      const token = await getToken(payload);

      res.status(201).json({
        message: "Login success",
        data: { user: { name, email, picture }, token: token },
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
