const { sequelize } = require('../config/db');
const { Sequelize, DataTypes } = require('sequelize');


// we do not really ever delete products from the database.
const DeletedProduct = sequelize.define('DeletedProduct', {
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // should it be unique ?
    },
});

// products/clothes which are "deleted" will just be added to this table and then ghosted from customers.

module.exports = DeletedProduct;
