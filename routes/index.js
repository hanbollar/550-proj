const express = require('express');

const router = express.Router();
const path = require('path');
const mysql = require('mysql');
const config = require('../db-config.js');

config.connectionLimit = 10;
const connection = mysql.createPool(config);

router.get('/', (req, res) => {
  res.redirect('/about');
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

router.get('/countryTuples', (req, res) => {
  const query = `
    SELECT *
    FROM Country c
    ORDER BY c.name;`;

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
    FROM Indicator i
    WHERE table_exists
    ORDER BY i.name;`;

  connection.query(query, (err, rows) => {
    if (err) console.log(`[!] /indicatorTuples route: ${err}`);
    else {
      res.json(rows);
    }
  });
});

router.get('/increaseTuples/:indicator/:minYear/:maxYear', (req, res) => {
  if (!req.params.indicator || req.params.indicator === '') { res.sendStatus(400); return; }
  if (!req.params.minYear || req.params.minYear === '') { res.sendStatus(400); return; }
  if (!req.params.maxYear || req.params.maxYear === '') { res.sendStatus(400); return; }
  if (req.params.minYear > req.params.maxYear) { res.sendStatus(400); return; }

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

  console.log(query);

  connection.query(query, (err, rows) => {
    if (err) console.log(`[!] /increaseTuples route: ${err}`);
    else {
      res.json(rows);
    }
  });
});

router.get('/yoyTuples/:indicator/:minYear/:maxYear', (req, res) => {
  if (!req.params.indicator || req.params.indicator === '') { res.sendStatus(400); return; }
  if (!req.params.minYear || req.params.minYear === '') { res.sendStatus(400); return; }
  if (!req.params.maxYear || req.params.maxYear === '') { res.sendStatus(400); return; }
  if (req.params.minYear > req.params.maxYear) { res.sendStatus(400); return; }

  const query = `
    WITH year_over_year_changes AS (
      SELECT  istart.cid,
              istart.year                                      AS start_year,
              iend.year                                        AS end_year,
              ((iend.value - istart.value) / istart.value)     AS percentage_change
      FROM    ${req.params.indicator} istart
      JOIN    ${req.params.indicator} iend
      ON      iend.cid = istart.cid
      WHERE   iend.year = istart.year + 1
      AND     istart.year >= ${req.params.minYear}
      AND     istart.year <= ${req.params.maxYear}
      AND     iend.year >= ${req.params.minYear}
      AND     iend.year <= ${req.params.maxYear} )
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

  console.log(query);

  connection.query(query, (err, rows) => {
    if (err) console.log(`[!] /yoyTuples route: ${err}`);
    else {
      res.json(rows);
    }
  });
});

router.get('/yoyPairTuples/:indicatorNumerator/:indicatorDenominator/:minYear/:maxYear', (req, res) => {
  if (!req.params.indicatorNumerator || req.params.indicatorNumerator === '') { res.sendStatus(400); return; }
  if (!req.params.indicatorDenominator || req.params.indicatorDenominator === '') { res.sendStatus(400); return; }
  if (!req.params.minYear || req.params.minYear === '') { res.sendStatus(400); return; }
  if (!req.params.maxYear || req.params.maxYear === '') { res.sendStatus(400); return; }
  if (req.params.minYear > req.params.maxYear) { res.sendStatus(400); return; }

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
      AND       i1end.year = i2end.year
      AND       i1end.year = i1start.year + 1
      AND       i1start.year >= ${req.params.minYear}
      AND       i1start.year <= ${req.params.maxYear}
      AND       i1end.year >= ${req.params.minYear}
      AND       i1end.year <= ${req.params.maxYear} )
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

  console.log(query);

  connection.query(query, (err, rows) => {
    if (err) console.log(`[!] /yoyPairTuples route: ${err}`);
    else {
      res.json(rows);
    }
  });
});

router.get('/graphTuples/*', (req, res) => {
  const params = req.params[0].split('/');

  if (params.length < 4) { res.sendStatus(400); return; }

  const indicator = params[0];
  const minYear = params[1];
  const maxYear = params[2];

  if (minYear > maxYear) { res.sendStatus(400); return; }

  const countryNames = [];
  const timeout = 100;
  let j = 3;

  while (j < timeout) {
    if (params[j]) {
      countryNames.push(params[j]);
      j += 1;
    } else {
      break;
    }
  }

  let query = `
    SELECT    i.cid,
              c.name,
              i.year,
              i.value
    FROM      ${indicator} i
    JOIN      Country c
    ON        c.cid = i.cid
    WHERE     (c.name = '${countryNames[0]}'`;

  // For every country beyond the first, add a line to the query.
  for (let i = 1; i < countryNames.length; i += 1) {
    query += `
    OR        c.name = '${countryNames[i]}'`;
  }

  query += `)
    AND       i.year >= ${minYear}
    AND       i.year <= ${maxYear}
    ORDER BY  c.name, i.year;`;

  console.log(query);

  connection.query(query, (err, rows) => {
    if (err) console.log(`[!] /graphTuples route: ${err}`);
    else {
      res.json(rows);
    }
  });
});

router.get('/completenessTuples/:indicator/:minYear/:maxYear', (req, res) => {
  if (!req.params.indicator || req.params.indicator === '') { res.sendStatus(400); return; }
  if (!req.params.minYear || req.params.minYear === '') { res.sendStatus(400); return; }
  if (!req.params.maxYear || req.params.maxYear === '') { res.sendStatus(400); return; }
  if (req.params.minYear > req.params.maxYear) { res.sendStatus(400); return; }

  const query = `
    WITH values_per_country AS (
      SELECT    i.cid,
                c.name,
                count(*) AS num_values
      FROM      ${req.params.indicator} i
      JOIN      Country c
      ON        c.cid = i.cid
      WHERE     i.year >= ${req.params.minYear}
      AND       i.year <= ${req.params.maxYear}
      GROUP BY  i.cid,
                c.name)
    SELECT    vpc.name,
              (vpc.num_values / (${req.params.maxYear} - ${req.params.minYear} + 1)) AS completeness
    FROM      values_per_country vpc`;

  console.log(query);

  connection.query(query, (err, rows) => {
    if (err) console.log(`[!] /completenessTuples route: ${err}`);
    else {
      res.json(rows);
    }
  });
});

module.exports = router;
