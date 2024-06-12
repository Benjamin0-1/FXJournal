const { sequelize } = require('../config/db');
const { Sequelize, DataTypes } = require('sequelize');

// SubCategory is needed
const Category = sequelize.define('Category', {
    category: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true // Changed to true to ensure category names are unique
    },

    // self JOIN
    parent_category_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Allow null for root categories (e.g., "Men")
        references: {
            model: 'Categories', // self reference, postgres changes the table name.
            key: 'id'
        },
    }
}, {
    paranoid: true, // soft deletion
    timestamps: true
});

// Relationship definitions
Category.hasMany(Category, { as: 'Subcategories', foreignKey: 'parent_category_id' });
Category.belongsTo(Category, { as: 'Parent', foreignKey: 'parent_category_id' });

module.exports = Category;
