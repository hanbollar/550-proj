const express = require('express');

const router = express.Router();
// const path = require('path');
// const mysql = require('mysql');
const config = require('../db-config.js');

config.connectionLimit = 10;
// const connection = mysql.createPool(config);

router.get('/', (req, res) => {
  res.redirect('/about');
});

router.get('/about', (req, res) => {
  res.render('about.ejs');
});

router.get('/cards', (req, res) => {
  res.render('cards.ejs');
});

router.get('/graphs', (req, res) => {
  res.render('graphs.ejs');
});

module.exports = router;
