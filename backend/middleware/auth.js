const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email, // Email tetap disimpan di database tapi tidak dipakai login
      password: hashedPassword,
    });

    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

// LOGIN (Sekarang pakai Username! ✨)
router.post("/login", async (req, res) => {
  try {
    // Cari user berdasarkan username yang diketik
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.status(400).json("Username tidak ditemukan! ❌");

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json("Password salah! ❌");

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(200).json({ token, username: user.username });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;