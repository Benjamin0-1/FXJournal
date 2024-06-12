const { sequelize } = require('../config/db');
const { Sequelize, DataTypes } = require('sequelize');


// this model will NOT be used since Category already starts with Men and Women.
const Gender = sequelize.define('Gender', {
    gender: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true // <== it is unique and this will also make the query faster.
    },
});

module.exports = Gender;
