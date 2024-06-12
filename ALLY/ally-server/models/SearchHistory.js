const { sequelize } = require('../config/db');
const { Sequelize, DataTypes } = require('sequelize');

// the idea of this model is to store the search history the user types on the search bar on the 
// fron end.

const SearchHistory = sequelize.define('SearchHistory', {
    // will store many of these
    search_term: {
        type: DataTypes.STRING,
        allowNull: false
    },

    // every user's search history will be displayed below the search bar.
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
});

module.exports = SearchHistory;
