const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const express = require('express');
const router = express.Router();
const Color = require('../models/Color');


async function generateColors() {
    try {
        
        // here create all of the colors that you will need.
        // or they could be created on the fly one the user creates a product variant.

        const generateAllColors = await Color.bulkCreate({
            color: 'White',
            color: 'Green'
            // etc
        })

    } catch (error) {
        
    }
};

module.exports = generateColors;
