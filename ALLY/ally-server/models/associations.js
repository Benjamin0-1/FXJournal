const User = require('./User');
const BannedUser = require('./BannedUser');
const Product = require('./Product');
const DeletedProduct = require('./DeletedProduct');
const DeletedUser = require('./DeletedUser'); // will not be used.
const ProductFavorite = require('./ProductFavorite');
const Admin = require('./Admin'); 
const Brand = require('./Brand');
const Rating = require('./Rating');
const Review = require('./Review');
const SearchHistory = require('./SearchHistory');
const RecentlyViewed = require('./RecentlyViewed');
const Category = require('./Category');
const ProductVariant = require('./ProductVariant');


// all relationships will be established here.


//relationship between User & BannedUser.
User.hasOne(BannedUser, {foreignKey: 'user_id'});
BannedUser.belongsTo(User, {foreignKey: 'user_id'});

// All the relationships for RecentlyViewed.
User.hasMany(RecentlyViewed, { foreignKey: 'user_id' });
Product.hasMany(RecentlyViewed, { foreignKey: 'product_id' });
RecentlyViewed.belongsTo(User, { foreignKey: 'user_id' });
RecentlyViewed.belongsTo(Product, { foreignKey: 'product_id' });


// hierarchical structure for categories.
Category.hasMany(Category, { as: 'Subcategories', foreignKey: 'parent_category_id' });
Category.belongsTo(Category, { as: 'ParentCategory', foreignKey: 'parent_category_id' });


// Relationship between Product & ProductVariant.
Product.hasMany(ProductVariant, {foreignKey: 'product_id'})

// a user can have many ProductVariants in their ProductFavorite. foreignkey is product_variant_id;


module.exports = {
    User,
    BannedUser,
    Category,
    Product,
    DeletedProduct,
    ProductFavorite,
    Admin,
    Brand,
    Rating,
    Review,
    SearchHistory,
    RecentlyViewed
};

