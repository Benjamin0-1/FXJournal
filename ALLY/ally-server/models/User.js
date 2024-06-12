const { sequelize } = require('../config/db');
const { Sequelize, DataTypes } = require('sequelize');

const User = sequelize.define('User', {
    first_name: {
        type: DataTypes.STRING,
        allowNull: false
    },


    last_name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    password: {
        type: DataTypes.STRING,
        allowNull: false
    },

    //   paranoid: true
    //  timestamps: true,
    //  deletedAt: 'deletedAt' default column for storing the deletion timestamp


});


module.exports = User;

