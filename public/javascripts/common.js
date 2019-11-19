/* eslint-disable no-unused-vars */
/* global document fetch */

function populateNavBar() {
  const nav = document.getElementById('nav');
  nav.className = 'navbar navbar-expand-lg navbar-light bg-light';

  const title = document.createElement('span');
  title.className = 'navbar-brand center';
  title.innerHTML = 'CIS550 Project';
  nav.appendChild(title);

  const outerContainer = document.createElement('div');
  outerContainer.id = 'navbarNavAltMarkup';
  outerContainer.className = 'collapse navbar-collapse';
  nav.appendChild(outerContainer);

  const innerContainer = document.createElement('div');
  innerContainer.className = 'navbar-nav';
  outerContainer.appendChild(innerContainer);

  const about = document.createElement('a');
  about.className = 'nav-item nav-link';
  about.href = '/about';
  about.innerHTML = 'About';
  innerContainer.appendChild(about);

  const cards = document.createElement('a');
  cards.className = 'nav-item nav-link';
  cards.href = '/cards';
  cards.innerHTML = 'Country Cards';
  innerContainer.appendChild(cards);

  const graphs = document.createElement('a');
  graphs.className = 'nav-item nav-link';
  graphs.href = '/graphs';
  graphs.innerHTML = 'Country Graphs';
  innerContainer.appendChild(graphs);

  const facts = document.createElement('a');
  facts.className = 'nav-item nav-link';
  facts.href = '/facts';
  facts.innerHTML = 'Country Facts';
  innerContainer.appendChild(facts);
}

async function getCountryTuples() {
  fetch('/countryTuples',
    {
      method: 'GET',
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
        Accept: 'application/json; charset=UTF-8',
      },
    })
    .then((res) => res.json())
    .then((json) => console.log(json));
}

async function getIndicatorTuples() {
  fetch('/indicatorTuples',
    {
      method: 'GET',
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
        Accept: 'application/json; charset=UTF-8',
      },
    })
    .then((res) => res.json())
    .then((json) => console.log(json));
}

// TODO: Un-hardcode the req body data.
async function getCardTuples() {
  const indicator = 'ny_gdp_mktp_kd';
  const minYear = '1970';
  const maxYear = '2010';

  fetch('/cardTuples',
    {
      method: 'POST',
      body: JSON.stringify({
        indicator,
        minYear,
        maxYear,
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
        Accept: 'application/json; charset=UTF-8',
      },
    })
    .then((res) => res.json())
    .then((json) => console.log(json));
}

// TODO: Un-hardcode the req body data.
async function getGraphTuples() {
  const indicator = 'ny_gdp_mktp_kd';
  const countryNames = ['China', 'Armenia'];
  const minYear = '1970';
  const maxYear = '2010';

  fetch('/graphTuples',
    {
      method: 'POST',
      body: JSON.stringify({
        indicator,
        countryNames,
        minYear,
        maxYear,
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
        Accept: 'application/json; charset=UTF-8',
      },
    })
    .then((res) => res.json())
    .then((json) => console.log(json));
}

// TODO: Un-hardcode the req body data.
async function getYoyTuples() {
  const indicator = 'ny_gdp_mktp_kd';

  fetch('/yoyTuples',
    {
      method: 'POST',
      body: JSON.stringify({
        indicator,
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
        Accept: 'application/json; charset=UTF-8',
      },
    })
    .then((res) => res.json())
    .then((json) => console.log(json));
}

// TODO: Un-hardcode the req body data.
async function getYoyPairTuples() {
  const indicatorNumerator = 'ny_gdp_mktp_kd';
  const indicatorDenominator = 'ny_gnp_mktp_kd';

  fetch('/yoyPairTuples',
    {
      method: 'POST',
      body: JSON.stringify({
        indicatorNumerator,
        indicatorDenominator,
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
        Accept: 'application/json; charset=UTF-8',
      },
    })
    .then((res) => res.json())
    .then((json) => console.log(json));
}

// TODO: Un-hardcode the req body data.
async function getCompletenessTuples() {
  const indicator = 'ny_gdp_mktp_kd';
  const countryNames = ['China', 'Armenia'];
  const minYear = '1970';
  const maxYear = '2010';

  fetch('/completenessTuples',
    {
      method: 'POST',
      body: JSON.stringify({
        indicator,
        countryNames,
        minYear,
        maxYear,
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
        Accept: 'application/json; charset=UTF-8',
      },
    })
    .then((res) => res.json())
    .then((json) => console.log(json));
}
