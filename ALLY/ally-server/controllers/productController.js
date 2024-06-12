const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const RecentlyViewed = require('../models/RecentlyViewed');
const Product = require('../models/Product');
// auth middleware.
const isAuthenticated = require('../middleware/isAuthenticated');

// <== /products/ANYTHING.

router.get('/allcategories', async (req, res) => {

    try {
        
        const allcategories = await Category.findAll({
            where: {parent_category_id: null},
            include: [{
                model: Category,
                as: 'subcategories',
                include: [{
                    model: Category,
                    as: 'subcategories'
                }],
            }],
        });

        if (allcategories.length === 0) {
            return res.status(404).json('No categories were found')
        };

        res.json(allcategories);

    } catch (error) {
        res.status(500).json('Internal Server Error', error); // error will not be shown to the user once in production.
    }

});

// when users see the product detail, this will create entries for their RecentlyViewed model.
// products/:id <== for the detail page.
router.get('/:id', async(req, res) => {

    // authenticated and non authenticated users can access this page.
    // however if the user is authenticated then create the corresponding entries.
    const product_id = req.params.id;
    if (!product_id) {
        return res.status(400).json('Must provide a product id')
    };

    const user_id = req.user.user_id;
    // here check if the token exists, if it does then validate it properly.
    // if validated, then create the entries.
    // this route must provide the same experience for authenticated users and visitors.
    // they will not see a difference. 

    if (user_id) {
        await jwt.verify() // here extract the token and verify it.
    };

    // if verified then: 
    const recentlyViewed = await RecentlyViewed.findAll({
        where: { user_id: userId },
        order: [['viewed_at', 'DESC']],
        offset: 10
    });


});

// recently viewed product.
// Home or For You page.
router.get('/recently-viewed', isAuthenticated, async(req, res) => {
    try {

        const user_id =  req.user.user_id; // need to create the middleware first.

        const recentlyViewed = await RecentlyViewed.findAll({
            where: {user_id},
            order: [['viewed_at', 'DESC']],
            limit: 10,
            include: [{model: Product}]
        });

        if (recentlyViewed.length === 0) {
            // if 0 then dont display anything
            return [];
        };


        //res.json(recentlyViewed.map(rv => rv.Product)); 

        res.json(recentlyViewed)

        
    } catch (error) {
        res.status(500).json(`Internal Server Error: ${error}`) // "error" will be gone once in production.
    }
});

// all products excluding the soft deleted ones.
router.get('/allproducts', async(req, res) => {})

// route to restore a soft deleted product, needs admin permissions.
router.put('/restore/:id', async(req, res) => {})

module.exports = router;

