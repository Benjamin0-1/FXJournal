const Category = require('../models/Category');
const { sequelize } = require('../config/db');
const { QueryTypes } = require('sequelize');

async function validateCategoryHierarchy(category_id, gender_id) {
    const categoryPathQuery = `
        WITH RECURSIVE category_path AS (
            SELECT id, name, parent_category_id
            FROM categories
            WHERE id = :category_id
            UNION ALL
            SELECT c.id, c.name, c.parent_category_id
            FROM categories c
            INNER JOIN category_path cp ON c.parent_category_id = cp.id
        )
        SELECT * FROM category_path;
    `;

    const categoryPath = await sequelize.query(categoryPathQuery, {
        type: QueryTypes.SELECT,
        replacements: { category_id }
    });

    for (const category of categoryPath) {
        if (category.name === 'Men' && gender_id !== 'male') return false;
        if (category.name === 'Women' && gender_id !== 'female') return false;
    }

    return true;
}


module.exports = validateCategoryHierarchy;
