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
    SELECT i.code, i.name
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

/**
 * Returns data for the "increase" mode of the "cards" page.
 *
 * For the selected primary indicator, determines the magnitude of the change
 * for every country in the dataset over the selected time range.
 * Sorts the cards by the magnitude in descending order.
 *
 * If the "invert" parameter is true, orders the results
 * so that the largest negative changes are on top,
 * instead of the largest positive ones.
 */
router.get('/increaseTuples/:indicator/:minYear/:maxYear/:invert', (req, res) => {
  if (!req.params.indicator || req.params.indicator === '') { res.sendStatus(400); return; }
  if (!req.params.minYear || req.params.minYear === '') { res.sendStatus(400); return; }
  if (!req.params.maxYear || req.params.maxYear === '') { res.sendStatus(400); return; }
  if (!req.params.invert || !(req.params.invert === 'true' || req.params.invert === 'false')) { res.sendStatus(400); return; }
  if (req.params.minYear > req.params.maxYear) { res.sendStatus(400); return; }

  const invert = (req.params.invert === 'true');

  let query = `
    WITH values_for_countries AS (
      SELECT    i.cid,
                i.year,
                i.value
      FROM      ${req.params.indicator} i
      WHERE     i.year >= ${req.params.minYear}
      AND       i.year <= ${req.params.maxYear} ),
    min_year_per_country AS (
      SELECT    vfc.cid,
                min(vfc.year)
      FROM      values_for_countries vfc
      GROUP BY  vfc.cid ),
    max_year_per_country AS (
      SELECT    vfc.cid,
                max(vfc.year)
      FROM      values_for_countries vfc
      GROUP BY  vfc.cid ),
    start_values_per_country AS (
      SELECT    vfc.cid,
                vfc.year,
                vfc.value
      FROM      values_for_countries vfc
      WHERE     (vfc.cid, vfc.year) IN (SELECT * FROM min_year_per_country) ),
    end_values_per_country AS (
      SELECT    vfc.cid,
                vfc.year,
                vfc.value
      FROM      values_for_countries vfc
      WHERE     (vfc.cid, vfc.year) IN (SELECT * FROM max_year_per_country) ),
    change_per_country AS (
      SELECT    svpc.cid,
                svpc.year                                   AS start_year,
                evpc.year                                   AS end_year,
                ((evpc.value - svpc.value) / svpc.value)    AS percentage_change
      FROM      start_values_per_country svpc
      JOIN      end_values_per_country evpc
      ON        evpc.cid = svpc.cid
      WHERE     svpc.value <> 0 )
    SELECT  c.name,
            cpc.start_year,
            cpc.end_year,
            cpc.percentage_change
    FROM     change_per_country cpc
    JOIN     Country c
    ON       c.cid = cpc.cid
    ORDER BY cpc.percentage_change`;

  if (invert) {
    query += ';';
  } else {
    query += ' DESC;';
  }

  connection.query(query, (err, rows) => {
    if (err) console.log(`[!] /increaseTuples route: ${err}`);
    else {
      res.json(rows);
    }
  });
});

/**
 * Returns data for the "yoy" mode of the "cards" page.
 *
 * For the selected indicator, computes the largest year-over-year changes
 * in that indicator for each country.
 * Displays a card with this data for each country, sorted by magnitude in descending order.
 *
 * If the "invert" parameter is true, finds the largest negative year-over-year change
 * instead of the largest positive one.
 */
router.get('/yoyTuples/:indicator/:minYear/:maxYear/:invert', (req, res) => {
  if (!req.params.indicator || req.params.indicator === '') { res.sendStatus(400); return; }
  if (!req.params.minYear || req.params.minYear === '') { res.sendStatus(400); return; }
  if (!req.params.maxYear || req.params.maxYear === '') { res.sendStatus(400); return; }
  if (!req.params.invert || !(req.params.invert === 'true' || req.params.invert === 'false')) { res.sendStatus(400); return; }
  if (req.params.minYear > req.params.maxYear) { res.sendStatus(400); return; }

  const invert = (req.params.invert === 'true');

  let query = `
    WITH year_over_year_changes AS (
      SELECT    istart.cid,
                istart.year                                      AS start_year,
                iend.year                                        AS end_year,
                ((iend.value - istart.value) / istart.value)     AS percentage_change
      FROM      ${req.params.indicator} istart
      JOIN      ${req.params.indicator} iend
      ON        iend.cid = istart.cid
      WHERE     iend.year = istart.year + 1
      AND       istart.year >= ${req.params.minYear}
      AND       istart.year < ${req.params.maxYear}
      AND       istart.value <> 0
      HAVING    abs(percentage_change) > 1e-6 ),
    max_change_per_country AS (
      SELECT    yoyc1.cid,
                yoyc1.start_year,
                yoyc1.end_year,
                yoyc1.percentage_change
      FROM      year_over_year_changes yoyc1
      LEFT JOIN year_over_year_changes yoyc2
      ON        yoyc1.cid = yoyc2.cid
      `;

  if (invert) {
    query += 'AND       yoyc1.percentage_change > yoyc2.percentage_change';
  } else {
    query += 'AND       yoyc1.percentage_change < yoyc2.percentage_change';
  }

  query += `
    WHERE     yoyc2.percentage_change IS NULL )
    SELECT    c.name,
              mcpc.start_year,
              mcpc.end_year,
              mcpc.percentage_change
    FROM      max_change_per_country mcpc
    JOIN      Country c
    ON        c.cid = mcpc.cid
    ORDER BY  mcpc.percentage_change`;

  if (invert) {
    query += ';';
  } else {
    query += ' DESC;';
  }

  connection.query(query, (err, rows) => {
    if (err) console.log(`[!] /yoyTuples route: ${err}`);
    else {
      res.json(rows);
    }
  });
});

/**
 * Returns data for the "yoyPairs" mode of the "cards" page.
 *
 * For the selected indicator, computes the largest
 * relative year-over-year change in that indicator for each country.
 * That is, it computes the change in the ratio between
 * the primary indicator (the numerator) and the secondary indicator (the denominator).
 *
 * If the "invert" parameter is true, finds the largest negative year-over-year change
 * instead of the largest positive one.
 */
router.get('/yoyPairTuples/:indicatorNumerator/:indicatorDenominator/:minYear/:maxYear/:invert', (req, res) => {
  if (!req.params.indicatorNumerator || req.params.indicatorNumerator === '') { res.sendStatus(400); return; }
  if (!req.params.indicatorDenominator || req.params.indicatorDenominator === '') { res.sendStatus(400); return; }
  if (!req.params.minYear || req.params.minYear === '') { res.sendStatus(400); return; }
  if (!req.params.maxYear || req.params.maxYear === '') { res.sendStatus(400); return; }
  if (!req.params.invert || !(req.params.invert === 'true' || req.params.invert === 'false')) { res.sendStatus(400); return; }
  if (req.params.minYear > req.params.maxYear) { res.sendStatus(400); return; }

  const invert = (req.params.invert === 'true');

  let query = `
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
      AND       i1start.year < ${req.params.maxYear}
      AND       (i1start.value / i2start.value) <> 0
      HAVING    abs(percentage_change) > 1e-6 ),
    max_change_per_country AS (
      SELECT    yoyc1.cid,
                yoyc1.start_year,
                yoyc1.end_year,
                yoyc1.percentage_change
      FROM      year_over_year_changes yoyc1
      LEFT JOIN year_over_year_changes yoyc2
      ON        yoyc1.cid = yoyc2.cid
      `;

  if (invert) {
    query += 'AND       yoyc1.percentage_change > yoyc2.percentage_change';
  } else {
    query += 'AND       yoyc1.percentage_change < yoyc2.percentage_change';
  }

  query += `
    WHERE     yoyc2.percentage_change IS NULL )
    SELECT    c.name,
              mcpc.start_year,
              mcpc.end_year,
              mcpc.percentage_change
    FROM      max_change_per_country mcpc
    JOIN      Country c
    ON        c.cid = mcpc.cid
    ORDER BY  mcpc.percentage_change`;

  if (invert) {
    query += ';';
  } else {
    query += ' DESC;';
  }

  connection.query(query, (err, rows) => {
    if (err) console.log(`[!] /yoyPairTuples route: ${err}`);
    else {
      res.json(rows);
    }
  });
});

/**
 * Returns graph data for the "graphs" page.
 *
 * Given an indicator, a date range, and any number of countries.
 * Assembles time-series data for that range, which can be plotted on a graph.
 */
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

  connection.query(query, (err, rows) => {
    if (err) console.log(`[!] /graphTuples route: ${err}`);
    else {
      res.json(rows);
    }
  });
});

/**
 * Returns completeness data for the "graphs" page.
 *
 * Given an indicator and a date range,
 * computes how much data is available for each country
 * given those parameters.
 */
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
    FROM      values_per_country vpc;`;

  connection.query(query, (err, rows) => {
    if (err) console.log(`[!] /completenessTuples route: ${err}`);
    else {
      res.json(rows);
    }
  });
});

module.exports = router;
