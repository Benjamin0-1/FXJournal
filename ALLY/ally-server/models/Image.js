// a product can have many images
const { sequelize } = require('../config/db');
const { Sequelize, DataTypes } = require('sequelize');

// many-to-many with Product

const Image = sequelize.define('Image', {
    image: {
        type: DataTypes.STRING, // will usually be a link
    },

    // what is the relationship with the Color model ?
    color_id: {
        type: DataTypes.INTEGER,
        allowNull: true // should it be allowed to be NULL ?
    },

    // here goes the id of the product_variant and not the product.
    // a variant can have many images and these will change for each color.
    product_variant: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

});




module.exports = Image;
