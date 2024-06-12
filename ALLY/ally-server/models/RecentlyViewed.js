const { sequelize } = require('../config/db');
const { Sequelize, DataTypes } = require('sequelize');

const RecentlyViewed = sequelize.define('RecentlyViewed', {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    viewed_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: false 
});

module.exports = RecentlyViewed;
