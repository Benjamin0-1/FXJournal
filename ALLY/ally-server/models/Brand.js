const { sequelize } = require('../config/db');
const { Sequelize, DataTypes } = require('sequelize');

const Brand = sequelize.define('Brand', {
    brand: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true // each brand should be unique (although everthing belongs to Ally)
    },
    
});






module.exports = Brand;
