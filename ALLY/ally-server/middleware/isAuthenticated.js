const jwt = require('jsonwebtoken');
require('dotenv').config();

const ACCESS_SECRET = process.env.ACCESS_SECRET; // long lived.
const REFRESH_SECRET = process.env.REFRESH_SECRET; // short lived.

function isAuthenticated(req, res, next) {
    let token = req.headers?.authorization ? req.headers.authorization.split(" ")[1] : null;
    token = token || req.cookies?.accessToken;

    if (!token) {
        return res.status(401).json({ message: "Authentication token is missing" });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, ACCESS_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Failed to authenticate token:', error.message);
        return res.status(401).json({ message: "Token is not valid" });
    }
};

module.exports = isAuthenticated;
