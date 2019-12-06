/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* global document fetch */

let showControls = true;

// eslint-disable-next-line no-unused-vars
function toggleShowControls() {
  showControls = !showControls;

  const controlsContainer = document.getElementById('controlsContainer');
  const hider = document.getElementById('hider');

  if (showControls) {
    controlsContainer.removeAttribute('style');
    hider.innerHTML = '&uarr;';
  } else {
    controlsContainer.style.display = 'none';
    hider.innerHTML = '&darr;';
  }
}

function populateNavBar() {
  const nav = document.getElementById('nav');
  nav.className = 'navbar navbar-expand-lg navbar-light bg-light';

  const title = document.createElement('span');
  title.className = 'navbar-brand center';
  title.innerHTML = 'WorldStats';
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
}

function filterBoxes(
  boxClass,
  checkOrRadioClass,
  completenessClass,
  searchFilterId,
  checkedFilterId,
  completenessFilterId,
  completenessFilterLabelId,
) {
  const boxes = Array.from(document.getElementsByClassName(boxClass));
  const searchFilter = document.getElementById(searchFilterId);
  const checkedFilter = document.getElementById(checkedFilterId);
  let completenessFilter;
  let completenessFilterValue;
  let completenessFilterLabel;

  if (completenessFilterId) {
    completenessFilter = document.getElementById(completenessFilterId);
    completenessFilterValue = completenessFilter.value;
    completenessFilterLabel = document.getElementById(completenessFilterLabelId);
    completenessFilterLabel.innerHTML = `(${completenessFilterValue}%)`;
  }

  const usingSearchFilter = searchFilter.value !== '';
  const usingCheckedFilter = checkedFilter.checked;
  const usingCompletenessFilter = (completenessClass && completenessFilterId && completenessFilterValue > 0);

  boxes.forEach((box) => {
    const boxNew = box;
    const checkOrRadio = boxNew.getElementsByClassName(checkOrRadioClass)[0];

    const inViaSearchFilter = boxNew.getAttribute('callsign').toLowerCase().includes(searchFilter.value.toLowerCase());
    const inViaCheckedFilter = checkOrRadio.checked;
    let inViaCompletenessFilter;

    if (usingCompletenessFilter) {
      inViaCompletenessFilter = Number(boxNew.getElementsByClassName(completenessClass)[0].innerHTML) >= completenessFilterValue;
    }

    let shouldDisplay = false;

    if (usingSearchFilter && usingCheckedFilter && usingCompletenessFilter) {
      shouldDisplay = inViaSearchFilter && inViaCompletenessFilter;
    } else if (usingSearchFilter && usingCheckedFilter) {
      shouldDisplay = inViaSearchFilter && inViaCheckedFilter;
    } else if (usingCheckedFilter && usingCompletenessFilter) {
      shouldDisplay = inViaCheckedFilter && inViaCompletenessFilter;
    } else if (usingSearchFilter && usingCompletenessFilter) {
      shouldDisplay = inViaSearchFilter && inViaCompletenessFilter;
    } else if (usingSearchFilter) {
      shouldDisplay = inViaSearchFilter;
    } else if (usingCheckedFilter) {
      shouldDisplay = inViaCheckedFilter;
    } else if (usingCompletenessFilter) {
      shouldDisplay = inViaCompletenessFilter;
    } else {
      shouldDisplay = true;
    }

    if (shouldDisplay) {
      boxNew.removeAttribute('style');
    } else {
      boxNew.style.display = 'none';
    }
  });
}

// eslint-disable-next-line no-unused-vars
function filterIndicatorBoxes() {
  filterBoxes('indicatorBox', 'indicatorCheckbox', null, 'indicatorSearchFilter', 'indicatorCheckedFilter', null, null);
}

// eslint-disable-next-line no-unused-vars
function filterCountryBoxes() {
  filterBoxes('countryBox', 'countryCheckbox', 'countryCompleteness', 'countrySearchFilter', 'countryCheckedFilter', 'countryCompletenessFilter', 'countryCompletenessFilterLabel');
}

// eslint-disable-next-line no-unused-vars
function filterPrimaryIndicatorBoxes() {
  filterBoxes('primaryIndicatorBox', 'primaryIndicatorRadioButton', null, 'primaryIndicatorSearchFilter', 'primaryIndicatorCheckedFilter', null, null);
}

// eslint-disable-next-line no-unused-vars
function filterSecondaryIndicatorBoxes() {
  filterBoxes('secondaryIndicatorBox', 'secondaryIndicatorRadioButton', null, 'secondaryIndicatorSearchFilter', 'secondaryIndicatorCheckedFilter', null, null);
}

function filterTertiaryIndicatorBoxes() {
  filterBoxes('tertiaryIndicatorBox', 'tertiaryIndicatorCheckbox', null, 'tertiaryIndicatorSearchFilter', 'tertiaryIndicatorCheckedFilter', null, null);
}
