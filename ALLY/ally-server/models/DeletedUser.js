const { sequelize } = require('../config/db');
const { Sequelize, DataTypes } = require('sequelize');

// users are never truly deleted, simply banned forever in this case.

// can create a global middleware to check for entries.
const DeletedUser = sequelize.define('DeletedUser', {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
});

module.exports = DeletedUser;

