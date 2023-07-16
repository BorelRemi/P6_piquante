const express = require('express');
const helmet = require('helmet');
const mongoose = require ('mongoose');
const path = require('path');
const dotenv = require('dotenv').config();

const userRoutes = require('./routes/user');
const saucesRoutes = require('./routes/sauces');

const app = express();
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(express.json());

/* connection MongoDB*/

const uri = process.env.URI;
mongoose.connect(uri,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));


  /*en-tete debug CORS*/

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });


app.use('/api/auth', userRoutes);
app.use('/api/sauces', saucesRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));


module.exports = app;