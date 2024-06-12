// for users who have 2FA enabled.
// this needs to be improved such as providing a secret recovery pass-phrase, etc.
const { sequelize } = require('../config/db');
const { Sequelize, DataTypes } = require('sequelize');

const TwoFactorAuth = sequelize.define('TwoFactorAuth', {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    secret_key: {
        type: DataTypes.STRING,
        // this code is the secret from the google authenticator app/.
    }
});

module.exports = TwoFactorAuth;
