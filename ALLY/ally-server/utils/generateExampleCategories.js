const Category = require('../models/Category');

// export this.
async function generateCategories() {
    const menCategory = await Category.create({category: 'Men'});
    const womencategory = await Category.create({category: 'Women'});

    const menClothingCategory = await Category.create({category: 'Clothing', parent_category_id: menCategory.id});
    const menShoesCategory = await Category.create({category: 'shoes', parent_category_id: menCategory.id});
    // clothing and shoes can also have sub categories within them.

    // same for women
    const womenClothingCategory = await Category.create({category: 'Clothing', parent_category_id: womencategory.id});
    const womenShoesCategory = await Category.create({category: 'Shoes', parent_category_id: womencategory.id});

    await Category.bulkCreate([
        { name: 'T-Shirts', parent_category_id: menClothingCategory.id },
        { name: 'Jackets', parent_category_id: menClothingCategory.id },
        { name: 'Sneakers', parent_category_id: menShoesCategory.id },
        { name: 'Boots', parent_category_id: menShoesCategory.id },
        { name: 'T-Shirts', parent_category_id: womenClothingCategory.id },
        { name: 'Dresses', parent_category_id: womenClothingCategory.id },
        { name: 'Heels', parent_category_id: womenShoesCategory.id },
        { name: 'Flats', parent_category_id: womenShoesCategory.id },
    ]);
};

module.exports = generateCategories;

// we will need admin routes in which they can generate this manually at will.
