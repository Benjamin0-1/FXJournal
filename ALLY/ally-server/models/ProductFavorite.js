const { sequelize } = require('../config/db');
const { Sequelize, DataTypes } = require('sequelize');

// a user can store products on their favorite's list.
// this way they can get notifications when such products go on sale, etc.

const ProductFavorite = sequelize.define('ProductFavorite', {
    
    product_variant_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
});

module.exports = ProductFavorite;
