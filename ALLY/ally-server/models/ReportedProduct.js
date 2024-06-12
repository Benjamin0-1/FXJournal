const { sequelize } = require('../config/db');
const { Sequelize, DataTypes } = require('sequelize');

const ReportedProduct = sequelize.define('ReportedProduct', {
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    reason: {
        type: DataTypes.STRING,
        allowNull: true,
    },

});

module.exports = ReportedProduct;
