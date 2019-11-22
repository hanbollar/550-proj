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

router.get('/facts', (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'views', 'facts.html'));
});

router.get('/countryTuples', (req, res) => {
  const query = `
    SELECT *
    FROM Country;`;

  connection.query(query, (err, rows) => {
    if (err) console.log(`[!] /countryTuples route: ${err}`);
    else {
      res.json(rows);
    }
  });
});

router.get('/indicatorTuples', (req, res) => {
  const query = `
    SELECT *
    FROM Indicator
    WHERE table_exists;`;

  connection.query(query, (err, rows) => {
    if (err) console.log(`[!] /indicatorTuples route: ${err}`);
    else {
      res.json(rows);
    }
  });
});

// TODO: Make this actually select years properly.
router.get('/yearTuples', (req, res) => {
  const rows = [];

  for (let i = 1900; i <= 2020; i += 1) {
    rows.push(i);
  }

  res.send(rows);
});

router.get('/cardTuples/:indicator/:minYear/:maxYear', (req, res) => {
  const query = `
    WITH values_for_countries AS (
      SELECT    i.cid,
                i.year,
                i.value
      FROM      ${req.params.indicator} i
      WHERE     i.year >= ${req.params.minYear}
      AND       i.year <= ${req.params.maxYear} ),
    start_values_per_country AS (
      SELECT    vfc1.cid,
                vfc1.year,
                vfc1.value
      FROM      values_for_countries vfc1
      WHERE     vfc1.year <= ALL (SELECT vfc2.year
                                  FROM values_for_countries vfc2
                                  WHERE vfc2.cid = vfc1.cid) ),
    end_values_per_country AS (
      SELECT    vfc1.cid,
                vfc1.year,
                vfc1.value
      FROM      values_for_countries vfc1
      WHERE     vfc1.year >= ALL (SELECT vfc2.year
                                  FROM values_for_countries vfc2
                                  WHERE vfc2.cid = vfc1.cid) ),
    change_per_country AS (
      SELECT    svpc.cid,
                svpc.year                                    AS start_year,
                evpc.year                                    AS end_year,
                ( ( evpc.value - svpc.value ) / svpc.value ) AS percentage_change
      FROM      start_values_per_country svpc
      JOIN      end_values_per_country evpc
      ON        evpc.cid = svpc.cid )
    SELECT  c.name,
            cpc.start_year,
            cpc.end_year,
            cpc.percentage_change
    FROM     change_per_country cpc
    JOIN     Country c
    ON       c.cid = cpc.cid
    ORDER BY cpc.percentage_change DESC;`;

  connection.query(query, (err, rows) => {
    if (err) console.log(`[!] /cardTuples route: ${err}`);
    else {
      res.json(rows);
    }
  });
});

// TODO: Convert to a GET route.
router.post('/graphTuples', (req, res) => {
  if (req.body.countryNames.length === 0) {
    res.sendStatus(400);
  }

  let query = `
    SELECT    i.cid,
              c.name,
              i.year,
              i.value
    FROM      ${req.body.indicator} i
    JOIN      Country c
    ON        c.cid = i.cid
    WHERE     (c.name = '${req.body.countryNames[0]}'`;

  // For every country beyond the first, add a line to the query.
  for (let i = 1; i < req.body.countryNames.length; i += 1) {
    query += `
    OR        c.name = '${req.body.countryNames[i]}'`;
  }

  query += `)
    AND       i.year >= ${req.body.minYear}
    AND       i.year <= ${req.body.maxYear}
    ORDER BY  c.name, i.year;`;

  connection.query(query, (err, rows) => {
    if (err) console.log(`[!] /graphTuples route: ${err}`);
    else {
      res.json(rows);
    }
  });
});

// TODO: Convert to a GET route.
router.get('/yoyTuples/:indicator', (req, res) => {
  const query = `
    WITH year_over_year_changes AS (
      SELECT  istart.cid,
              istart.year                                      AS start_year,
              iend.year                                        AS end_year,
              ((iend.value - istart.value) / istart.value)     AS percentage_change
      FROM    ${req.params.indicator} istart
      JOIN    ${req.params.indicator} iend
      ON      iend.cid = istart.cid
      WHERE   iend.year = istart.year + 1 )
    SELECT    c.name,
              yoyc.start_year,
              yoyc.end_year,
              max(yoyc.percentage_change) AS percentage_change
    FROM      year_over_year_changes yoyc
    JOIN      Country c
    ON        c.cid = yoyc.cid
    GROUP BY  yoyc.cid,
              yoyc.percentage_change,
              yoyc.start_year,
              yoyc.end_year
    ORDER BY  yoyc.percentage_change DESC;`;

  connection.query(query, (err, rows) => {
    if (err) console.log(`[!] /yoyTuples route: ${err}`);
    else {
      res.json(rows);
    }
  });
});

// TODO: Convert to a GET route.
router.get('/yoyPairTuples/:indicatorNumerator/:indicatorDenominator', (req, res) => {
  const query = `
    WITH year_over_year_changes AS (
      SELECT    i1start.cid,
                i1start.year    AS start_year,
                i1end.year      AS end_year,
                ((i1end.value / i2end.value) - (i1start.value / i2start.value)) / (i1start.value / i2start.value) AS percentage_change
      FROM      ${req.params.indicatorNumerator} i1start
      JOIN      ${req.params.indicatorNumerator} i1end
      ON        i1end.cid = i1start.cid
      JOIN      ${req.params.indicatorDenominator} i2start
      ON        i2start.cid = i1start.cid
      JOIN      ${req.params.indicatorDenominator} i2end
      ON        i2end.cid = i1start.cid
      WHERE     i1start.year = i2start.year
      AND       i1end.year = i1start.year + 1
      AND       i2end.year = i2start.year + 1 )
    SELECT    c.name,
              yoyc.start_year,
              yoyc.end_year,
              max(yoyc.percentage_change) AS percentage_change
    FROM      year_over_year_changes yoyc
    JOIN      Country c
    ON        c.cid = yoyc.cid
    GROUP BY  yoyc.cid,
              yoyc.start_year,
              yoyc.end_year
    ORDER BY  yoyc.percentage_change DESC;`;

  connection.query(query, (err, rows) => {
    if (err) console.log(`[!] /yoyPairTuples route: ${err}`);
    else {
      res.json(rows);
    }
  });
});

// TODO: Convert to a GET route.
router.post('/completenessTuples', (req, res) => {
  if (req.body.countryNames.length === 0) {
    res.sendStatus(400);
  }

  let query = `
    WITH values_per_country AS (
      SELECT    i.cid,
                c.name,
                count(*) AS num_values
      FROM      ${req.body.indicator} i
      JOIN      Country c
      ON        c.cid = i.cid
      WHERE     i.year >= ${req.body.minYear}
      AND       i.year <= ${req.body.maxYear}
      AND      (c.name = '${req.body.countryNames[0]}'`;

  // For every country beyond the first, add a line to the query.
  for (let i = 1; i < req.body.countryNames.length; i += 1) {
    query += `
      OR        c.name = '${req.body.countryNames[i]}'`;
  }

  query += `)
      GROUP BY  i.cid,
                c.name)
    SELECT    vpc.name,
              (vpc.num_values / (${req.body.maxYear} - ${req.body.minYear} + 1)) AS completeness
    FROM      values_per_country vpc
    ORDER BY  completeness DESC;`;

  connection.query(query, (err, rows) => {
    if (err) console.log(`[!] /completenessTuples route: ${err}`);
    else {
      res.json(rows);
    }
  });
});

module.exports = router;
