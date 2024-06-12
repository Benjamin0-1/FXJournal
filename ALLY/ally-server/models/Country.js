const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Country = sequelize.define('Country', {
    country: {
        type: DataTypes.STRING,
        allowNull: false
    },


});

module.exports = Country;
