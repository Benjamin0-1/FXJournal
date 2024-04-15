const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    is_admin: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
    },
    // propiedad/column para activar/desactivar 2FA (para activarla is_admin debe ser TRUE).
  //  two_factor_authentication: {
   //     type: DataTypes.BOOLEAN,
   //     allowNull: true,
   //     defaultValue: false
   // },
});

//User.hasMany(Products) <- if you want to describe User and get the products that belong to a specific user.

module.exports = User;

// add email field.
// name is: username.