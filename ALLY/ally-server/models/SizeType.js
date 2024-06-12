const { sequelize } = require('../config/db');
const { Sequelize, DataTypes } = require('sequelize');

const SizeType = sequelize.define('SizeType', {
    size_type: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
});


module.exports = SizeType;

// starting size types: clothe and shoes.
