const { sequelize } = require('../config/db');
const { Sequelize, DataTypes } = require('sequelize');
// this is what actually gets presented to the User.

const ProductVariant = sequelize.define('ProductVariant', {
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    // size is a seperate table.

    color_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    size_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    stock_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    price: {
        type: DataTypes.DECIMAL,
        allowNull: false
    },

    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: 'This is an example description'
    },

    // this model is NOT finished yet.

});



module.exports = ProductVariant;
