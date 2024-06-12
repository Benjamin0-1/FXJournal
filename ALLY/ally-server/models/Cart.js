// server based shopping cart
// need to create a seperate "through" table called CartItem to add the quantity column.
const { sequelize } = require('../config/db');
const { Sequelize, DataTypes } = require('sequelize');

const Cart = sequelize.define('Cart', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Cart;
