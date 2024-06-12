const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// we don't even soft delete a Product,
// because the user only sees the ProductVariant, so that is what we really
// soft delete.
const Product = sequelize.define('Product', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
        // should this be unique and if so will it work with different sizes and colors ?
    },


    // this is the precise sub-category, the product variant
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }, // first create the category, or it can be done on the fly when creating a clothe? probably not.

    // gender has been removed Altogether as it was redundant.

    // price has been removed.
    // stock has been removed.
    // description has been removed.
    
});

module.exports = Product;

/**
 * In the context of your e-commerce application, it makes more sense for category_id to belong to the Product model, as the category is a higher-level attribute that applies to the product as a whole, rather than to individual variants of the product. Each variant (size, color, etc.) will still fall under the same category as its parent product.
 */