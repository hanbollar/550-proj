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

router.get('/indicators', (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'views', 'indicators.html'));
});

router.get('/cards', (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'views', 'cards.html'));
});

router.get('/graphs', (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'views', 'graphs.html'));
});

router.get('/countryTuples', (req, res) => {
  const query = `SELECT *
  FROM Country;`;

  connection.query(query, (err, rows) => {
    if (err) console.log(`[!] /countryTuples route: ${err}`);
    else {
      res.json(rows);
    }
  });
});

router.get('/indicatorTuples', (req, res) => {
  const query = `SELECT *
  FROM Indicators;`;

  connection.query(query, (err, rows) => {
    if (err) console.log(`[!] /indicatorTuples route: ${err}`);
    else {
      res.json(rows);
    }
  });
});

module.exports = router;
