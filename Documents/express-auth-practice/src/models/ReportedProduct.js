const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../db');
const Product = require('./Product');
const User = require('./User');
const Review = require('./Review');
const Favorite = require('./Favorite');

//esto se puede exportar/importat
const nodemailerOptions = {
    service: 'gmail',
    auth: {
        user: 'oliver125125@gmail.com',
        pass: 'aiyp fvhl djxd rjny',
    }
};

async function initializeTransporter() {
    const testAccount = await nodemailer.createTestAccount();

    nodemailerOptions.auth.user = nodemailerOptions.auth.user;
    nodemailerOptions.auth.pass = nodemailerOptions.auth.pass;

    const transporter = nodemailer.createTransport(nodemailerOptions);

    return transporter;
};

async function sendMail(transporter, to, subject, message) {
    try {
        const info = await transporter.sendMail({
            from: nodemailerOptions.auth.user,
            to: to,
            subject: subject,
            text: message,
            html: `<p>${message}</p>`
        });
        console.log(`Message sent: ${info.messageId}`);
        console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    } catch (error) {
        console.error(`Error sending email to ${to}: ${error}`);
        throw error;
    }
};

// definicion de modelo
const ReportedProduct = sequelize.define('ReportedProduct', {
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

// FALTA COMPROBAR QUE FUNCIONE
async function checkReportCounts() {
    try {
        const products = await ReportedProduct.findAll({
            attributes: ['productId', [sequelize.fn('COUNT', sequelize.col('productId')), 'reportCount']],
            group: ['productId']
        });

        for (const product of products) {
            if (product.reportCount >= 3) {
                const productId = product.productId;

                // Delete the product and its reviews.
                await sequelize.transaction(async (transaction) => {
                    await Product.destroy({ where: { id: productId }, transaction });
                    await Review.destroy({ where: { productId }, transaction });

                    // Remove the product from users' wishlists
                    await Favorite.destroy({ where: { productId }, transaction });
                });

                // SEND EMAIL
                const users = await Favorite.findAll({
                    where: { productId },
                    include: [{ model: User, attributes: ['email'] }] // Include the User model and specify the email attribute
                });
                
                const transporter = await initializeTransporter();
                for (const user of users) {
                    await sendMail(transporter, user.email, 'Producto Eliminado', `El producto con ID ${productId} ha sido eliminado debido a informes de usuarios.`);
                }

                console.log(`Product with ID ${productId} deleted due to reports.`);
            }
        }
    } catch (error) {
        console.error('Error checking report counts:', error);
    }
}

setInterval(checkReportCounts, 24 * 60 * 60 * 1000);



module.exports = ReportedProduct;
