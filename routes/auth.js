// routes/auth.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");

router.post(
  "/signup",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      // Check if username already exists
      let user = await User.findOne({ username });
      if (user) {
        return res
          .status(400)
          .json({ message: "Username already exists. Please choose another." });
      }

      // Create new user
      user = new User({
        username,
        password: await bcrypt.hash(password, 10),
      });

      await user.save();
      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
