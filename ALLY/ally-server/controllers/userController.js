// controllers/userController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const express = require('express');
const router = express.Router();

// User signup
router.post('/signup', async (req, res) => {
    const { first_name, last_name, email, password } = req.body;

    const emailRegex = /^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)+[a-zA-Z]{2,7}$/;

    if (!first_name || !last_name || !email || !password) {
        return res.status(400).json('Missing required data');
    }

    if (!emailRegex.test(email)) {
        return res.status(400).json('Invalid email format');
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json('User already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            first_name,
            last_name,
            email,
            password: hashedPassword
        });

        await user.save();

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ token });
    } catch (error) {
        console.error(error.message);
        res.status(500).json('Server error');
    }
});

// User login
// chekc if the user is banned or has been "deleted".
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json('Missing required data');
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json('Invalid credentials');
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json('Invalid credentials');
        }

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        console.error(error.message);
        res.status(500).json('Server error');
    }
});

module.exports = router;
