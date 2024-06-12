const { sequelize } = require('../config/db');
const { Sequelize, DataTypes } = require('sequelize');

const PasswordRecovery = sequelize.define('PasswordRecovery', {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    recovery_code: {
        type: DataTypes.STRING
    },

    expiration: {
        // here you must configure it correctly
        type: DataTypes.DATE, // not DATEONLY because it needs to be precise.
    }
})

module.exports = PasswordRecovery;

// the code must expire and the entry must be automatically deleted.
// or similar functionality: we could keep track of all the codes as long as they expire properly
