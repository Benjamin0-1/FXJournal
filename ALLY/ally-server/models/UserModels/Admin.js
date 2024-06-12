const { sequelize } = require('../config/db');
const { Sequelize, DataTypes } = require('sequelize');

const Admin = sequelize.define('Admin', {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Admin;
