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
