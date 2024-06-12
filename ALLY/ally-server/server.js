// server.js
const app = require('./index');
const PORT = process.env.PORT || 3001;
const sequelize = require('./config/db');
//const sequelize = require('sequelize');

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

/*
sequelize.sync({force: false}).then(() => { // <-- TEST SHIPPING HISTORIES. AND THE DEBUGGING ROUTE /ALLHISTORIES. 
    const PORT = process.env.PORT || 3001; 
    app.listen(PORT, () => {
        console.log(`Server running on Port: ${PORT}`);
    });
}); */