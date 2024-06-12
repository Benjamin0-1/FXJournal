const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const express = require('express');
const router = express.Router();
const Gender = require('../models/Gender');


// auth middlewares.
const isAdmin = require('../middleware/isAdmin');
const isAuthenticated = require('../middleware/isAuthenticated');

// Apply middlewares to all routes in this router.
router.use(isAuthenticated);
router.use(isAdmin);


async function generateGenders() {
    const menGender = await Gender.findOne({where: {gender: 'Men'}});
    const womenGender = await Gender.findOne({where: {gender: 'Women'}});

    if (!menGender) {
        await Gender.create({gender: 'Men'});
    };

    if (!womenGender) {
        await Gender.create({gender: 'Women'})
    };

    return {menGender, womenGender}

};

module.exports = generateGenders;
