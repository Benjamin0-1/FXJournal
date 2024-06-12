// a product/clothe can be of different sizes
// size can only be: XS, S, M, L, XL.
const { sequelize } = require('../config/db');
const { Sequelize, DataTypes } = require('sequelize');

const Size = sequelize.define('Size', {
    // step 2: here we create the "sizes" for such size_type: example: shoe, shirt, ETC.
    size: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    // step 1: here we refence: shoe_size_type, shirt_size_type, ETC.
    size_type_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // all of this goes to the ProductVariant.

    // indexes to ensure a unique combination between size and size_type_id.

});

module.exports = Size;

// WE NEED A SIZE_CATEGORY MODEL TO DIFFERENTIATE BETWEEN CLOTHE SIZE AND SHOE SIZE.

// example size_type: clothe/shoe/belt. <== create these entries.
// we need a SizeType model.
