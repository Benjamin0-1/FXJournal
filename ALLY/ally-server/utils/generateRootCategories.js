const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const express = require('express');
const router = express.Router();
const Category = require('../models/Category');


// auth middlewares.
const isAdmin = require('../middleware/isAdmin');
const isAuthenticated = require('../middleware/isAuthenticated');

// Apply middlewares to all routes in this router.
router.use(isAuthenticated);
router.use(isAdmin);


async function generateRootCategories() {
    let menCategory = await Category.findOne({ where: { name: 'Men' } });
    let womenCategory = await Category.findOne({ where: { name: 'Women' } });

    if (!menCategory) {
        menCategory = await Category.create({ name: 'Men' });
    }

    if (!womenCategory) {
        womenCategory = await Category.create({ name: 'Women' });
    }

    return { menCategory, womenCategory };
}



module.exports = generateRootCategories;

