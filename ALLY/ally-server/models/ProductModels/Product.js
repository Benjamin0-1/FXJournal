const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Product = sequelize.define('Product', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
        // should this be unique and if so will it work with different sizes and colors ?
    },

    // a product/clothe can only belong to one category?
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }, // first create the category, or it can be done on the fly when creating a clothe.

    // should a Product have the gender or should the variant have it instead ?
    gender_id: {
        type: DataTypes.INTEGER,  // remember to first create the genders.
        allowNull: false
    },

    price: {
        type: DataTypes.DECIMAL,
        allowNull: false
    },

    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    // needs to be in 3rd normal form
    gender: {
        type: DataTypes.ENUM('male', 'female', 'unisex'),
        allowNull: true
    },

    // needs to be in 3rd normal form
    age_group: {
        type: DataTypes.ENUM('adult', 'kids'), // kids is devided into boy and girl, therefore another table is needed
        allowNull: true
    },
    
});

module.exports = Product;
