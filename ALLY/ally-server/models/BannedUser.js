// for banned users, not "deleted" ones.
const { sequelize } = require('../config/db');
const { Sequelize, DataTypes } = require('sequelize');

// having a seperate table to handle bans is a more scalable solution
// and more normalized compared to a simple attribute.

const BannedUser = sequelize.define('BannedUser', {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true // <-- ome-to-one relationship.
    },

    ban_duration: {
        type: DataTypes.DATE,
        defaultValue: null
    },

    banned_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW
    },

    reason: {
        type: DataTypes.STRING,
        allowNull: true
    },

});

module.exports = BannedUser;
