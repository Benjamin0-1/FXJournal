// a product/clothe can have different colors
const { sequelize } = require('../config/db');
const { Sequelize, DataTypes } = require('sequelize');

const Color = sequelize.define('Color', {
    color: {
        type: DataTypes.STRING,
    },

    // some ids HERE

});

// a product/clothe can be of different colors so establish the correct relations.

module.exports = Color;