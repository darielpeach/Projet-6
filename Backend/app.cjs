const express = require('express');
const mongoose = require('mongoose');
const booksRouter = require('./routes/books.cjs');
const usersRouter = require('./routes/user.cjs');
const dotenv = require('dotenv');
const path = require('path')
const cors = require('cors')

dotenv.config();

const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI)
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch((error) => console.error('Connexion à MongoDB échouée !', error));

const app = express();

app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use('/api/books', booksRouter);
app.use('/api/auth', usersRouter);
app.use('/images', express.static(path.join(__dirname, 'images')))

module.exports = app;