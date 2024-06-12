const { sequelize } = require('../config/db');
const { Sequelize, DataTypes } = require('sequelize');

const CartItem = sequelize.define('CartItem', {
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: 1
        }
    },

    // the specific Cart that belongs to the specific User.
    cart_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    // this is actually and should be the product_variant_id because that is what gets presented to the user.
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    // product_variant ?    come back to this model later, it's NOT finished yet.

});

module.exports = CartItem;
