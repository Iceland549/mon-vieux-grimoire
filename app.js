const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bookRoutes = require('./routes/book');


mongoose.connect('mongodb+srv://iceland549:jhVSuxlf0PCzyPxR@cluster0.rkc2po4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch((err) => console.log('Connexion à MongoDB échouée !', err));

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use('/api/book', bookRoutes);

module.exports = app;