// for banned users, not "deleted" ones.
const { sequelize } = require('../config/db');
const { Sequelize, DataTypes } = require('sequelize');

const BannedUser = sequelize.define('BannedUser', {
    user_id: {
        type: DataTypes.INTEGER,
        allownull: false,
    },

    ban_duration: {
        type: DataTypes.DATE,
        defaultValue: null
    },

});

module.exports = BannedUser;
