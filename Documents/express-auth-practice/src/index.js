const express = require('express');
const app = express();
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

//models:
const User = require('./models/User');
const Product = require('./models/Product');
const Category = require('./models/Category');
const BannedToken = require('./models/BannedToken');
const Brand = require('./models/Brand');
const Review = require('./models/Review');
const Favorite = require('./models/Favorite');
const ReportedProduct = require('./models/ReportedProduct');

const sequelize = require('./db');
const models = require('./models/associations');
const crypto = require('crypto');
// admin, unique data to each user. 
app.use(express.json());

// configuracion de nodeMailer
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

//2FA 
//middleware para ver revisar si es que usuario (un admin) tiene activado 2FA.
async function requireTwoFactorAuthentication(req, res, next) {
    // speakksy.generateSecret();
    // verificar si is_admin es TRUE en User model
    // si no lo es, entonces return next()

    //luego crear ruta para activar y desactviar
    // crear ruta para verificar codigo
    // este utiliza google authenticator
    const userId = req.user.userId
    try {
        const user = await User.findByPk(userId)
        if (userId && user.is_admin && user.two_factor_authentication) {
            // if user is admin then require them to verify their their otp
            // now ask for their otp
        } else {
            return next();
        }
    } catch (error) {
        
    }
};

// RUTA PARA DEBUGGING. utilizar otp_secret column
app.post('/verify', isAuthenticated, async (req, res) => {
    const { otp } = req.body;
    if (!otp) {
        return res.status(400).json('Faltan datos');
    }
    
    const userId = req.user.userId;
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json('Usuario no encontrado');
        }
        
        const verified = speakeasy.totp.verify({
            secret: user.otp_secret, // va a vericar con la column otp_secret.
            encoding: 'base32',
            token: otp,
            window: 2
        });
        
        if (verified) {
            return res.json({ verified: true });
        } else {
            return res.status(400).json({ verified: false });
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json('Internal Server Error');
    }
});



//ruta para generar secret key. Se puede utilizar codigo para agregar manualmente en caso de no poder escanear QR.
app.get('/generate-secret', isAuthenticated, isAdmin, async (req, res) => {
    const userId = req.user.userId; 
    
    try {
        
        const user = await User.findOne({where: {id: userId}});
        if (user.otp_secret) {return res.status(400).json('Ya has creado tu secreto anteriormente.')};

        const secret = speakeasy.generateSecret();

        await user.update({otp_secret: secret.base32});

        res.json({secret: secret.base32});

    } catch (error) {
        res.status(500).json(`Internal Server Error: ${error.message}`);
    }
});

//generar codigo QR para agregarlo a la app.
app.post('/generate-qr-code', (req, res) => {
    const secret = req.body.secret;
    if (!secret) {return res.status(400).json('Faltan datos')};

    const otpAuthUrl = speakeasy.otpauthURL({secret, label: 'MyApp'});
    QRCode.toDataURL(otpAuthUrl, (error, imageUrl) => {
        if (error) {
            res.status(500).send('Error generating QR code');
        } else {
            res.send(`<img src="${imageUrl}" alt="QR Code">`);
        }
    })
});
/*
// ruta para verificar codigo.
app.post('/verify-otp', (req, res) => {
    const {secret, otp} = req.body;
    if (!secret || !otp) {return res.status(400).json('Faltan datos')};
    
    const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: otp,
        window: 2
    });
    if (verified) {
        return res.json({verified: true})
    } else {
        return res.status(400).json({verified: false})
    }
}); */

//ruta para que usuarios admin puedan activar 2FA.
app.put('/2fa/activate', isAuthenticated, isAdmin, async(req, res) => {
    const userId = req.user.userId;

    try {
        const user = await User.findByPk(userId);
        if (!user) {return res.status(404).json('No existe usuario')}; // el usuario deberia existir siempre.
        if (user && user.two_factor_authentication) {
            return res.status(400).json('Ya tienes 2FA activado')
        } else {
            await user.update({
                two_factor_authentication: true // <-- Esto luego se debe utilizar para requerir a los usuarios ingrear su OTP.
            })
        };
        res.json('2FA activado con exito')

    } catch (error) {
        res.status(500).json(`Internal Server Error: ${error}`);
    }
});


function isAuthenticated(req, res, next) {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1]; // <- what is this doing?
    if (!token) {
        return res.status(401).json({ message: 'No token provided.' });
    }

    jwt.verify(token, 'access-secret', (error, decoded) => {
        if (error) {
            return res.status(401).json({ message: 'Invalid access token.' });
        }
        req.user = decoded;
        next();
    });
};

// Middleware to check for admin privileges
async function isAdmin(req, res, next) {
    const userId = req.user.userId;
    try {
        const user = await User.findByPk(userId);
        if (user && user.is_admin) {
            next();
        } else {
            res.status(403).json('You are not an admin, cannot access this route.');
        }
    } catch (error) {
        console.error('Error checking admin privileges:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

//to generate reset token for forgotten password.
function generateToken() {
    return crypto.randomBytes(20).toString('hex')
};

// function must also send a token/code with an exp date so that certain users can access this page/route to reset password.
app.post('/reset-password-request', isAuthenticated, async (req, res) => { 
    const email = req.body.email;
    if (!email) {
        return res.status(400).json('Missing email'); // <-- nodeMailer. Funciona correctamente.
    }

    try {
        const resetToken = generateToken();
        const currentTime = Date.now();
        console.log(currentTime);
        const expirationDate = currentTime + (10 * 60 * 1000); 

        
        if (Date.now() >= expirationDate) {
            return res.json('Reset code/token Expired.');
        }

        // Save reset token and expiration date to the request object
        req.resetToken = resetToken;
        req.resetTokenExpiration = expirationDate;

        //email de cambio de password. 
        /*
        const subject = 'Reset Password Request';
        const text = `Your reset password token is: ${resetToken}`;
        await sendMail(email, subject, text);
        console.log(`Email sent to: `);  */

        const transporter = await initializeTransporter();
        await sendMail(transporter, email, 'Cambio de contraseña', `Tu codigo secreto es: ${resetToken} y
        expira dentro de 10 minutos. No lo compartas con nadie.`);

        console.log(`Reset token sent to user: ${req.user.userId} con email: ${email}`);

        return res.status(200).json({ resetToken, expirationDate });
    } catch (error) {
        return res.status(500).json(`Internal Server Error: ${error}`);
    }
});


// this route must verify the code so that only users who requested a password reset can access it. 
// this route must reset the password.
app.post('/reset-password', isAuthenticated, async (req, res) => {
    const userId = req.user.userId;
    const resetToken = req.body.resetToken; // Get reset token from request body
    const newPassword = req.body.newPassword;
    const confirmNewPassword = req.body.confirmNewPassword;

    if (!resetToken) {
        return res.status(400).json('Missing reset token');
    }

    // Check if reset token has expired
    if (req.resetTokenExpiration < Date.now()) {
        return res.status(401).json('Expired reset token');
    }

    if (!newPassword || !confirmNewPassword || newPassword !== confirmNewPassword) {
        return res.status(400).json('Credentials must be provided and must also match.');
    }

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await user.update({ password: hashedPassword });

        return res.status(200).json({ message: 'Password reset successful.' });
    } catch (error) {
        console.error('Error resetting password:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});




app.put('/users/grant-admin/:id', isAuthenticated, async(req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json('Must provide an id');
    };

    if (req.user.is_admin) {return res.json('User is already an admin')}; // <- this line never triggers.

    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        await user.update({ is_admin: true });

        res.json({ message: `User ${user.username} has been granted admin privileges.` });
    } catch (error) {
        console.error('Error granting admin privileges:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


async function isTokenBanned(token) {
    const bannedToken = await BannedToken.findOne({where: {token: token}});
   return bannedToken ? true: false
};

//middleware to check against banned tokens before giving a new one.
async function checkBannedToken(req, res, next) {
    const refreshToken = req.body.refreshToken;
    const accessToken = req.body.accessToken;

    if (refreshToken) {
        const isRefreshTokenBanned = await isTokenBanned(refreshToken);
        if (isRefreshTokenBanned) {
            return res.status(403).json({ message: 'Refresh token is banned.' });
        }
    }

    if (accessToken) {
        const isAccessTokenBanned = await isTokenBanned(accessToken);
        if (isAccessTokenBanned) {
            return res.status(403).json({ message: 'Access token is banned.' });
        }
    }

    next();
};


// route to get a new access token after it expires in 10 minutes
app.post('/access-token', async (req, res) => {
    const refreshToken = req.body.refreshToken; // User provides long-lived token as proof.

    // Check if refreshToken is provided
    if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token provided.' });
    }

    // Check if refreshToken is banned
    if (await isTokenBanned(refreshToken)) {
        return res.status(403).json({ message: 'Refresh token has been banned' });
    }

    // Verify refreshToken
    jwt.verify(refreshToken, 'refresh-secret', (error, decoded) => {
        if (error) {
            console.error('Error verifying refresh token:', error); // Debugging statement
            return res.status(401).json({ message: 'Invalid refresh token.' });
        }

        console.log('Decoded:', decoded); // Debugging statement

        // Generate a new access token
        const accessToken = jwt.sign({ userId: decoded.userId, username: decoded.username }, 'access-secret', { expiresIn: '20m' });

        console.log('New Access Token:', accessToken); // Debugging statement

        // Add the new access token to the banned tokens
        BannedToken.create({ token: accessToken })
            .then(() => {
                // Send the new access token in the response
                res.json({ accessToken });
            })
            .catch((error) => {
                console.error('Error adding access token to banned tokens:', error);
                res.status(500).json({ message: 'Internal server error' });
            });
    });
});

app.get('/test/admin', isAuthenticated, isAdmin, (req, res) => {
    res.json('you are an admin')
});

// loggearse
app.post('/login', async (req, res) => { // FALTA AGREGAR: SI USUARIO ES ADMIN Y TIENE 2FA ACTIVADO ENTONCES REQUERIR OTP.
    const username = req.body.username;  // tambien se puede solicitar otp para eliminar usuario, producto, etc.
    const password = req.body.password;

    try {
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(404).json({ message: `Username ${username} Not Found` });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        // Generate new tokens
        const accessToken = jwt.sign({ userId: user.id, username: user.username }, 'access-secret', { expiresIn: '20m' }); // era: 10m.
        const refreshToken = jwt.sign({ userId: user.id, username: user.username }, 'refresh-secret', { expiresIn: '15d' });

        res.json({ message: 'Login successful', accessToken, refreshToken });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error.' });
    }
});

/*
// crear cuenta. <-- enviar email de bienvenida a usuario
app.post('/signup', async(req, res) => {
    const {username, confirmUsername, password, confirmPassword} = req.body;
    if (!username || !confirmUsername || !password || !confirmPassword) {
        return res.status(400).json('Missing data');
    };

    try {
        const checkUserExists = await User.findOne({where: {username: username}});
        if (checkUserExists) {return res.json(`Username ${username} already exists`)};
        
        if (username === confirmUsername && password && confirmPassword) {
            const hashedPassword = await bcrypt.hash(password, 10)
            const newUser = await User.create({username, password: hashedPassword});
            return res.status(201).json(`Username: ${newUser.username} created successfully`);
        } else {
            res.status(400).json({message: 'fields must match'})
        }
    } catch (error) {
        res.status(500).json(`Internal Server Error: ${error.message}`);
    }
}); */

// ruta actualizada: incluye email e email de bienvenida enviado automaticamente, tambien regex para confirmar email.
// username and email must both be unique
app.post('/signup', async(req, res) => {

    const {username, confirmUsername, email, confirmEmail, password, confirmPassword} = req.body;

    if (!username || !confirmUsername || !email || !confirmEmail || !password || !confirmPassword) {
        return res.status(400).json('Missing data');
    };

    const emailRegex = /^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)+[a-zA-Z]{2,7}$/;
        if (!email || !email.match(emailRegex)) {
        return res.status(400).json(`Formato de email incorrecto`);
        };


    try {
        const checkUserExists = await User.findOne({where: {username: username}});
        if (checkUserExists) {return res.json(`Username ${username} already exists`)};
        
        if (username === confirmUsername && email === confirmEmail && password === confirmPassword) {
            const hashedPassword = await bcrypt.hash(password, 10)
            const newUser = await User.create({username, email, password: hashedPassword});

            // SEND WELCOME EMAIL HERE.
            const transporter = await initializeTransporter();
            await sendMail(transporter, email, 'Bienvenido a nuestro sitio', 'Gracias por registrarte');
            console.log(`Email sent no new user: ${email}`);
            return res.status(201).json(`Username: ${newUser.username} created successfully`);

        } else {
            res.status(400).json({message: 'fields must match'})
        }
    } catch (error) {
        res.status(500).json(`Internal Server Error: ${error.message}`);
    }
});

// ruta para crear review, un usuario solamente puede escribir una review de un producto una vez.
app.post('/review', isAuthenticated, async (req, res) => {
    const userId = req.user.userId;
    const { productId, review } = req.body;

    console.log(`User id: ${userId}`); // array de palabras que no sigan las guias

    if (!review) {
        return res.status(400).json('Debe incluir una review');
    }
    if (!productId) {
        return res.status(400).json('Debe incluir un id de producto');
    }
    if (!/^\d+$/.test(productId)) {
        return res.status(400).json('El id de producto debe ser un número.');
    }

    try {
        const existingReview = await Review.findOne({
            where: { productId, userId }
        });
        if (existingReview) {
            return res.status(400).json('Ya has escrito una review para este producto.');
        }

        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json('Id de producto no encontrado.');
        }

        const createdReview = await Review.create({ productId, userId, review });
        res.status(201).json({ message: 'Review creada con éxito', review: createdReview });
    } catch (error) {
        res.status(500).json(`Error interno del servidor: ${error}`);
    }
});

//ruta para que un usuario pueda eliminar su review escrita sobre un producto especifico (por productId)
app.delete('/review/:reviewId', isAuthenticated, async (req, res) => {
    const userId = req.user.userId;
    const reviewId = req.params.reviewId; // <-- deja la reviewId y esa review sera eliminada (si es que tu usuario la ha escrito).

    if (reviewId) {return res.status(400).json('Debe incluir reviewId')}

    try {
        const reviewToDelete = await Review.findOne({ where: { id: reviewId, userId } });

        if (!reviewToDelete) {
            return res.status(404).json('Review not found or you are not authorized to delete it');
        }

        await reviewToDelete.destroy();
        res.json('Review deleted successfully');
    } catch (error) {
        res.status(500).json(`Internal Server Error: ${error}`);
    }
});


///ruta para ver todas las reviews que un usuario ha escrito. Posible bug (resultado siempre es: 1)
app.get('/user/reviews', isAuthenticated, async (req, res) => {
    const userId = req.user.userId;
    console.log(`User id: ${userId}`);

    try {
        const productsWithReviews = await Product.findAll({
            include: [
                {
                    model: Review,
                    where: { userId },
                    include: {
                        model: User,
                        attributes: ['id', 'username']
                    }
                }
            ]
        });
       // console.log('Products with Reviews:', productsWithReviews); 

        res.json({ resultado: productsWithReviews.length, productsWithReviews });
    } catch (error) {
        console.error('Error fetching products with reviews:', error); 
        res.status(500).json(`Internal Server Error: ${error}`);
    }
});


// debugging route. <-- works.
app.get('/reviews', async(req, res) => {
    try {
        const reviews = await Product.findAll({
            include: [
                { model: Review, include: User }
            ]
        });
        res.json({resultado: reviews.length, reviews});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// debugging route to get the right amount of reviews per user id.
app.get('/my-reviews', isAuthenticated, async(req, res) => {
    const userId = req.user.userId;
    console.log(`user id: ${userId}`);

    try {
        const allReviews = await Review.findAll({
            where: {userId: userId}
        });
        if (allReviews.length === 0) {return res.status(404).json('No reviews available')};
        res.json({reviewCount: allReviews.length ,allReviews})
    } catch (error) {
        res.status(500).json(`Internal Server Error: ${error.message}`)
    }
});

//ruta para ver todas las reviews de todos los productos y los nombres de los usuarios que las escribieron.
app.get('/reviews/products/all', async(req, res) => {})

//ruta para crear brands.
app.post('/brand', isAuthenticated, isAdmin, async(req, res) => {
    const brandName = req.body.brandName; 
    if (!brandName) { return res.status(400).json('Missing brand name'); }
    if (brandName.length > 50) { return res.status(400).json(`Brand name is too long: ${brandName}`); }

    try {
        const existingBrand = await Brand.findOne({ where: { brand: brandName } }); // <-- cada marca es Unica.
        if (existingBrand) {
            return res.status(400).json(`Brand: ${brandName} already exists`);
        } else {
            await Brand.create({ brand: brandName }); 
            return res.status(201).json(`Brand: ${brandName} created successfully`);
        }
    } catch (error) {
        res.status(500).json(`Internal Server Error: ${error}`);
    }
});

// ver todas las marcas disponibles
app.get('/allbrands', async(req, res) => {
    try {
        const allBrands = await Brand.findAll();
        if (allBrands.length === 0) {return res.status(404).json('There are no brands.')}
        res.json(allBrands)
    } catch (error) {
        res.status(500).json(`Internal Server Error: ${error}`)
    }
});

// buscar marca por id
app.get('/brand/:id', async(req, res) => {
    const {id} = req.params;
    if (!id) {return res.status(400).json('Missing brand id')};

    try {
        const item = await Product.findAll({where: {brandId: id}})
        if (item.length === 0) {return res.status(404).json(`No se encontraron productos con brand id: ${id}`)} 
        res.json(item)
    } catch (error) {
        res.json(error)
    }
});

//buscar producto por su nombre de marca
app.get('/product/:brand', async (req, res) => {
    const brandName = req.params.brand;
    if (!brandName) {
        return res.status(400).json('Missing brand name');
    }
    try {
        const products = await Brand.findAll({
            where: {brand: brandName},
        });
        if (products.length === 0) {
            return res.status(404).json(`No hay productos con la marca: ${brandName}`);
        }
        return res.json(products);
    } catch (error) {
        return res.status(500).json(`Internal Server Error: ${error.message}`);
    }
});


//crear producto, una vez agregado TODOS los usuarios reciben un email.
app.post('/product', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { 
            brandId,
            product, 
            stock, 
            rating, 
            price, // Include price here
            description, 
            brand, 
            tags, 
            attributes, 
            reviews, 
            salePrice, 
            featured, 
            categoryNames
        } = req.body;

        const userId = req.user.userId; // Extract userId from the decoded JWT token

        // check that brandId exists.

        // Create the product with the provided attributes and userId
        const createdProduct = await Product.create({
            brandId,
            product,
            stock,
            rating,
            price, // Include price
            description,
            brand,
            tags,
            attributes,
            reviews,
            salePrice,
            featured,
            userId // Include userId
        });

        if (categoryNames && categoryNames.length > 0) {
            const categories = await Promise.all(categoryNames.map(async (categoryData) => {
                // Find or create category by name
                let category = await Category.findOne({ where: { category: categoryData.name } });
                if (!category) {
                    category = await Category.create({ category: categoryData.name, description: categoryData.description });
                }
                return category;
            }));
            await createdProduct.addCategories(categories);
        }

        //SEND EMAIL
        const transporter = await initializeTransporter();
        const users = await User.findAll();
        for (const user of users) {
            if (user.email) {
                const userEmail = user.email;
                await sendMail(transporter, userEmail, 
                `Hemos agregado un nuevo producto`, `Que tal? te escribimos porque hemos agregado un nuevo producto a la 
                tienda, ya disponible para adquirir ! ${createdProduct.product}`);
            }
        }
        

        res.status(201).json({ message: `Product added successfully`, product: createdProduct });
    } catch (error) {
        res.status(500).json({ error: `Internal Server Error: ${error.message}` });
    }
});

//REPORTES: 

// make sure a user can only port it ONCE.
//ruta para que usuarios puedan reportar un producto. (por id)
app.post('/products/report/id', isAuthenticated, async(req, res) => {
    const userId = req.user.userId;
    const productId = req.body.productId;
    if (!productId) {return res.status(400).json('Debe uncluir el id del producto')};

    console.log(`User id: ${userId}`);
    
    try {
        // first check if product exists.
        const existingProduct = await Product.findByPk(productId);
        if (!existingProduct) {return res.status(404).json(`No existe el producto con id: ${productId}`)};

        const existingReport = await ReportedProduct.findOne({
            where: {
                productId: productId,
                userId: userId
            }
        });
        if (existingReport) {return res.status(400).json(`Ya has reportado este producto. con id: ${productId}`)};

        const newReport = await ReportedProduct.create({
            productId, 
            userId
        });

        res.status(201).json(`Producto con id: ${productId} reportado con exito`);

    } catch (error) {
        res.status(500).json(`Internal Server Error: ${error}`);
    }
});

//ruta para que usuarios puedan reportar un producto. (por nombre)
app.post('/products/report/name', isAuthenticated, async(req, res) => {});

// obtener TODOS los productos
app.get('/allproducts', async (req, res) => {
    try {
        const allProducts = await Product.findAll({
            include: [
                { model: Category },
                { model: Brand },
                { model: Review,
                include: {
                    model: User,
                    attributes: ['username'] // <-- para ver quien escribio la review de cada producto
                } } 
            ]
        });
        

        if (allProducts.length > 0) {
            res.json(allProducts);
        } else {
            return res.status(404).json('There are no products available');
        }
    } catch (error) {
        res.status(500).json(`Internal Server Error: ${error}`);
    }
});


app.get('/category/:name', async(req, res) => {
    const name = req.params.name;
    if (!name || name.length > 90) {return res.status(400).json('Introduzca una categoria valida')};

    try {
        const products = await Category.findAll({
            include: Product,
            where: {category: name}
        });
        if (products.length === 0) {return res.status(404).json(`No existe categoria: ${name}`)};
        res.json(products)
    } catch (error) {
        res.status(500).json(`Internal Server Error: ${error}`)
    }
})


app.get('/searchproduct/:productname', async(req, res) => {
    const productname = req.params.productname;
    if (!productname) {return res.status(400).json('Missing product name')};
    if (productname.length < 50) {return res.status(400).json('Product name is too long')};

    try {
        const products = await Product.findAll({
            where: { product: productname },
            include: [Category] // Include associated categories
        });

        if (products && products.length > 0) {
            res.json(products);

        } else {
            res.status(404).json(`No products with name: ${productname}`);
        };
    } catch (error) {
        res.status(500).json(`Internal Server Error: ${error}`);
    }
})

  app.get('/allusers', isAuthenticated, isAdmin, async (req, res) => { // /admin/dashboard on the front end. // /admin/allusers on the server.
    try {
        const allUsers = await User.findAll();
        if (allUsers && allUsers.length > 0) {
            return res.json({ message: 'All users:', users: allUsers });
        } else {
            return res.status(404).json({ message: 'No users found.' });
        }
    } catch (error) {
        return res.status(500).json({ message: `Internal Server Error: ${error}` });
    }
});

app.delete('/deleteuser/:id', isAuthenticated, isAdmin, async(req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json('Falta id');
    }

    try {
        const userToDelete = await User.findByPk(id);
        if (!userToDelete) {
            return res.status(404).json(`No user with ID: ${id} was found.`);
        } else {
            await userToDelete.destroy();
            return res.status(201).json(`Usuario con ID: ${id} eliminado con exito`);
        }
    } catch (error) {
        res.status(500).json(`Internal Server Error: ${error}`);
    }
});

// cuando un usuario es eliminado, deberian recibir un email incluyendo la razon de su eliminacion.

// admin puede eliminar usuario por su username (unico)
app.delete('/deleteuser/:username', isAuthenticated, isAdmin, async(req, res) => {
    const username = req.params.username;
    if (!username) {
        return res.status(400).json('Debe incluir un nombre de usuario');
    }
    if (username.length > 90) {
        return res.status(400).json('Debe incluir un nombre de usuario valido');
    }

    try {
        const userToDelete = await User.findOne({ where: { username } });
        if (!userToDelete) {
            return res.status(404).json(`No se ha encontrado el usuario: ${username}`);
        } else {
            await userToDelete.destroy();
            return res.status(201).json(`Usuario: ${username} eliminado con exito`);
        }
    } catch (error) {
        res.status(500).json(`Internal Server Error: ${error}`);
    }
});



// admin puede eliminar usuario por su email (unico)
app.delete('/deleteuser/email/:email', isAuthenticated, isAdmin, async(req, res) => {
    const email = req.params.email;
    if (!email) {return res.status(400).json('Debe incluir email de usuario a eliminar')};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;  
    if (!emailRegex.test(email)) {return res.status(400).json('Email invalido.')};

    try {
        const userToDelete = await User.findOne({
            where: {email}
        });
        if (userToDelete) {
            await User.destroy({
                where: {email}
            });

            //SEND EMAIL.
            const transporter = await initializeTransporter();
            await sendMail(transporter, email, 'Tu cuenta ha sido eliminada', 
            'Te escribimos para informarte que debido a no haber seguido nuestras reglas, tu cuenta ha sido eliminada.');

            return res.status(201).json(`Usuario con email: ${email} eliminado con exito`);
        } else {
            return res.status(404).json(`No se ha encontrado un usuario con el email: ${email}`);
        }
    } catch (error) {
        res.status(500).json(`Internal Server Error: ${error}`);
    }
});

// ruta para que un usuario puede eliminar SU PROPIA CUENTA.    
app.delete('/delete/user', isAuthenticated, async (req, res) => {
    const userId = req.user.userId;

    try {
        await User.destroy({
            where: {
                id: userId
            }
        });
        res.status(200).json('Tu cuente ha sido eliminada con exito.');
    } catch (error) {
        res.status(500).json({ error: `Internal Server Error: ${error.message}` });
    }
});


// ruta para productos en orden alfabetico
app.get('/products/alphorder', async(req, res) => {
    try {
        const allProducts = await Product.findAll({
            order: [
                ['product', 'ASC']
            ]
        });

        if (allProducts.length > 0) {
            res.json(allProducts);
        } else {
            return res.status(404).json('No hay productos disponibles');
        }

    } catch (error) {
        res.status(500).json(`Internal Server Error: ${error}`)
    }
});

// ruta para buscar producto especifico por su nombre.
app.get('/search/product/:name', async(req, res) => {
    const name = req.params.name;
    if (!name || name.length > 90) {return res.status(400).json('Introduzca un nombre valido')};

    try {
        const products = await Product.findAll({
            include: Category, Brand,
            where: {
                product: name
            }
        });
        if (products.length === 0) {return res.status(404).json(`No se encontraron productos con el nombre: ${name}`)};
        res.json({resultado: products.length, productos: products})
    } catch (error) {
        res.status(500).json(`Internal Server Error: ${error}`)
    }
});

//ruta para buscar por precio mayor a: x
app.get('/searchbypricebigger/:price', async (req, res) => {
    const price = req.params.price;
    if (!price) {
        return res.status(400).json('Falta el precio');
    }
    if (isNaN(price)) {
        return res.status(400).json('Debe ser un precio valido');
    }

    try {
        const products = await Product.findAll({
            include: Category, Brand,
            where: {
                price: {
                    [Op.gt]: price
                }
            }
        });
        if (products.length === 0) {
            return res.status(404).json(`No se encontraron productos mayor a el precio: ${price}`);
        }

        res.json({ resultado: products.length, products: products });
    } catch (error) {
        return res.status(500).json(`Internal Server Error: ${error}`);
    }
});


//ruta para buscar por precio menor a: x
app.get('/searchbypriceless/:price', async (req, res) => {
    const price = req.params.price;
    if (!price) {
        return res.status(400).json('Falta el precio');
    }
    if (isNaN(price)) {
        return res.status(400).json('Debe ser un precio valido');
    }

    try {
        const products = await Product.findAll({
            include: Category, Brand,
            where: {
                price: {
                    [Op.lt]: price
                }
            }
        });
        if (products.length === 0) {
            return res.status(404).json(`No se encontraron productos menor a el precio: ${price}`);
        }

        res.json({ resultado: products.length, products: products });
    } catch (error) {
        return res.status(500).json(`Internal Server Error: ${error}`);
    }
});

//ruta para buscar por rango de precio entre: y x
app.get('/searchbypricerange/:start/:end', async(req, res) => {
    const start = req.params.start;
    const end = req.params.end;

    if (isNaN(start) || isNaN(end)) {
        return res.status(400).json('Deben ser numeros');
    }

    try {
      
        const products = await Product.findAll({
            include: Category, Brand, // <-- falta: Description, Review.
            where: {
                price: {
                    [Op.between]: [start, end]
                }
            }
        });

        if (products.length === 0) {
            return res.status(404).json(`No se han econtrado productos con el rango de precio: ${start} y ${end}`)
        }

        res.json({resultados: `${products.length}`, products});
    } catch (error) {
        res.status(500).json({ error: `Internal Server Error: ${error.message}` });
    }
});


// when an admin deletes a product, users should know. nodeMailer
app.delete('/product/:id', isAuthenticated, isAdmin, async (req, res) => {
    const id = req.params.id;

    if (!id) {
        return res.status(400).json('Falta id.');
    }

    try {
       
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json(`No hay producto con id: ${id}`);
        }

        const productName = product.product;

        const transporter = await initializeTransporter();

       
        const users = await User.findAll();

      
        for (const user of users) {
            if (user.email) { 
                const userEmail = user.email;
                await sendMail(transporter, userEmail, 'Producto Eliminado', `El producto "${productName}" ha sido eliminado.`);
            } else {
                console.log(`No se pudo enviar el correo electrónico a ${user.id} porque no tiene una dirección de correo electrónico válida.`);
            }
        }

        await Product.destroy({ where: { id: id } });

        res.json(`Producto con id: ${id} eliminado con éxito`);
    } catch (error) {
        console.error('Error al eliminar el producto y notificar a los usuarios:', error);
        res.status(500).json(`Internal Server Error: ${error}`);
    }
});


// ruta para filtrar por categoria (devuelvo todos los productos que entran en la categoria ingresada(podria ser mas de uno))
app.get('/products/category/:categoryname', async(req, res) => {});

// ruta para que admins puedan enviar email masivos a todos los usuarios registrados.
app.post('/send-email-to-all-users', isAuthenticated, isAdmin, async(req, res) => {
    const {subject, message} = req.body;
    if (!subject || !message) {
        return res.status(400).json('Faltan datos');
    }

    try {

        const allUserEmails = await User.findAll();

        if (allUserEmails.length === 0) {
            return res.status(404).json('No hay correos disponibles');
        }
        
        const transporter = await initializeTransporter();

        for (const user of allUserEmails) {
            if (user.email) {
                const userEmail = user.email; // Extract email address from user object
                await sendMail(transporter, userEmail, subject, message);
            }
        };

        res.json('Emails enviados con exito');

    } catch (error) {
        console.error('Error sending emails:', error);
        res.status(500).json('Internal Server Error');
    }
});


//rutas de favorites: 

//ruta para ver todos los favoritos que el usuario especifico tiene en su lista.
app.get('/products/user/favorites', isAuthenticated, async (req, res) => {
    const userId = req.user.userId; // <-- for each user specific data.
    
    try {
        const allFavorites = await Favorite.findAll({ where: { userId }, include: [Product] });
        if (allFavorites.length === 0) {
            return res.status(404).json('No se han encontrado favoritos, intenta agregar uno.');
        } else {
            res.json({ total: allFavorites.length, allFavorites });
        }
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// ruta para anadir producto a su favorito (usuario).
app.post('/products/user/favorites', isAuthenticated, async (req, res) => {
    const userId = req.user.userId;
    const { productId } = req.body;

    try {
      
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json(`Product with id: ${productId} does not exist.`);
        }
        
        const existingFavorite = await Favorite.findOne({ where: { userId, productId } });
        if (existingFavorite) {
            return res.status(400).json(`Product with id ${productId} already in favorites.`);
        }

        await Favorite.create({ userId, productId });
        res.json(`Product with id: ${productId} successfully added to favorites.`);

    } catch (error) {
        console.error('Error adding product to favorites:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


const PORT = 3001
sequelize.sync({alter: true}).then(() => { // <- alter and force set to false.
    app.listen(PORT, () => {
        console.log(`Server running on Port: ${PORT}`);
    })
});

/*
esto falta implementar.
// Route to update categories for a product
app.put('/products/:productId/categories', async (req, res) => {
    try {
      const { productId } = req.params;
      const { categoryIds } = req.body;
  
      // Find product by ID
      const product = await Product.findByPk(productId);
  
      // Update categories
      if (product) {
        const categories = await Category.findAll({ where: { id: categoryIds } });
        await product.setCategories(categories);
        res.json({ message: 'Product categories updated successfully' });
      } else {
        res.status(404).json({ error: 'Product not found' });
      }
    } catch (error) {
      console.error('Error updating product categories:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Route to display categories for a product
  app.get('/products/:productId/categories', async (req, res) => {
    try {
      const { productId } = req.params;
  
      // Find product by ID with associated categories
      const product = await Product.findByPk(productId, {
        include: [{ model: Category, attributes: ['id', 'name'] }]
      });
  
      if (product) {
        res.json(product.Categories);
      } else {
        res.status(404).json({ error: 'Product not found' });
      }
    } catch (error) {
      console.error('Error fetching product categories:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Route to remove a product from a category
  app.delete('/products/:productId/categories/:categoryId', async (req, res) => {
    try {
      const { productId, categoryId } = req.params;
  
      // Find product by ID
      const product = await Product.findByPk(productId);
  
      // Remove category association
      if (product) {
        await product.removeCategory(categoryId);
        res.json({ message: 'Product removed from category successfully' });
      } else {
        res.status(404).json({ error: 'Product not found' });
      }
    } catch (error) {
      console.error('Error removing product from category:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

*/