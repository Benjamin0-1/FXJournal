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
        unique: true,
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
    two_factor_authentication: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
    },
    // aqui deberia ir una column de secret para autenticar al usuario con su otp y que siempre utilize el mismo secreto,
    // y que este este guardado en el servidor y no tenga que ser enviado con la solicitud (POST).
    otp_secret: {
        type: DataTypes.STRING,
        unique: true
    },
    
    password_reset_token: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    password_reset_token_expires: {
        type: DataTypes.DATE,
        allowNull: true
    }
});

//User.hasMany(Products) <- if you want to describe User and get the products that belong to a specific user.

module.exports = User;

// add email field.
// name is: username.
