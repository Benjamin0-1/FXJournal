
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('sequelize');
//const helmet = require('helmet'); ?

/*
const rateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes'); */

const userController = require('./controllers/userController');
const productController = require('./controllers/productController');
const adminController = require('./controllers/adminController');

 
//const paymentRoutes = require('./routes/paymentController');
const { connectDB } = require('./config/db');

const app = express();

// Middleware
app.use(bodyParser.json());

//app.use(helmet());

//app.use(rateLimiter);

// Database connection
connectDB();

// Routes
//app.use('/auth', authRoutes);
//app.use('/products', productRoutes);
//app.use('/orders', orderRoutes);


app.use('/users', userController); 
app.use('/products', productController);
app.use('/admin', adminController); 

//app.use('/payments', paymentRoutes);

// Error handling
//app.use(errorHandler);

module.exports = app; // exporting it as app, therefore inside of server.js it's called 
