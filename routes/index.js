const express = require('express');

const router = express.Router();
const path = require('path');
const mysql = require('mysql');
const config = require('../db-config.js');

config.connectionLimit = 10;
const connection = mysql.createPool(config);

router.get('/', (req, res) => {
  res.redirect('/cards');
});

router.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'views', 'about.html'));
});

router.get('/cards', (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'views', 'cards.html'));
});

router.get('/graphs', (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'views', 'graphs.html'));
});

router.get('/countries', (req, res) => {
  const query = `SELECT *
  FROM Country;`;

  connection.query(query, (err, rows) => {
    if (err) console.log(`[!] Cards router: ${err}`);
    else {
      res.json(rows);
    }
  });
});

module.exports = router;
