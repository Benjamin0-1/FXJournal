const jwt = require('jsonwebtoken');
const { isAuthenticated } = require('./isAuthenticated'); // verify
const User = require('../models/User');
const Admin = require('../models/Admin');
const express = require('express');
const router = express.Router();

// Middleware to check whether a user is an admin or not.
async function isAdmin(req, res, next) {
    const user_id = req.user.user_id;

    try {
        // Check if the user exists
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify that there are entries associated with that User inside the Admin model.
        const checkIsAdmin = await Admin.findOne({ where: { user_id } });
        if (!checkIsAdmin) {
            return res.status(403).json({ message: 'You are not an admin' });
        }

        return next();
    } catch (error) {
        res.status(500).json({ message: `Internal Server Error: ${error.message}` });
    }
};

module.exports = isAdmin;
