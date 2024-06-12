const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const RecentlyViewed = require('../models/RecentlyViewed');
const Product = require('../models/Product');
const Gender = require('../models/Gender');
const ProductVariant = require('../models/ProductVariant');
// auth middlewares.
const isAdmin = require('../middleware/isAdmin');
const isAuthenticated = require('../middleware/isAuthenticated');

const generateRootCategories = require('../utils/generateRootCategories');
const generateGenders = require('../utils/GenerateGenders'); // "G" not "g"

// import isAdmin and isAuthenticated middlewares HERE.
// apply them here to all of the routes.

// All routes start with /admin/*

// this file was created for the adminController so these 2 middlewares can simply be applied
// to all of the routes present here.
router.use(isAuthenticated());
router.use(isAdmin());

router.post('/create-product', async(req, res) => {    
    // before creating a product make sure Men and Women categories exist.
    // these are the "root" categories.
    // they don't have a parent_category_id.

    try {

        // generate the root categories if they don't exist.
        const { menCategory, womenCategory } = await generateRootCategories();
        
        const { name, category_id, price, description } = req.body;

        // add proper gender validation.
        if (!name || !category_id || !price) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        };

        // category will and can be passed as "name" instead of id.

        // Ensure category_id is valid and points to a leaf category (most specific subcategory)
        const newCategory = await Category.findByPk(category_id);
        if (!newCategory) {
            return res.status(404).json(`Category id ${category_id} not found`)
        };

        // Verify that the category is a leaf node (has no children)
        const subcategories = await Category.findAll({ where: { parent_category_id: category_id } });
        if (subcategories.length > 0) {
            return res.status(400).json({ error: 'Category ID must be a leaf category.' });
        }

        const newProduct = await Product.create({
            name,
            category_id,
            gender_id,
            price,
            description
        });

        res.status(201).json(newProduct);


    } catch (error) {
        res.status(500).json(`Internal Server Error: ${error}`); // error will not be shown once in production.
    }
 
});

//create product variant, which is what the user will actually see.
router.post('/create-variant', async(req, res) => {

    try {

        const {
            product_id,
            // is it size_id or size_type_id ?
            size_id,
            color_id,
            stock,
            price,
        } = req.body;

        if (!product_id || !size_id || !color_id || !stock || !price) {
            return res.status(400).json('Missing required fields')
        };

        // here do a good validation of all the data coming in.
        
    } catch (error) {
        res.status(500).json(`Internal Server Error: ${error}`)
    }
});

// route to soft delete a user.
router.delete('/soft-delete/:id', async(req, res) => {});

// route to soft delete a ProductVariant
router.delete('/product-variant/:id', async(req, res) => {
    try {

        const variant_id = req.params.id;
        if (!variant_id) {
            return res.status(400).json('Missing required data: variant ID');
        };

        const productVariant = await ProductVariant.findByPk(req.params.id);
        if (!productVariant) {
            return res.status(404).json(`Product variant id: ${req.params.id} not found`)
        };

        await productVariant.update({
            deleted_at: Date.now()
        })
        
    } catch (error) {
        res.status(500).json(`Error deleting variant: ${error}`)
    }
});

module.exports = router;
// check the json body parser.
