/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* global document */

let showControls = true;

/**
 * Toggles whether or not the user controls are displayed.
 */
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

/**
 * Updates the labels for the date-range sliders,
 * which indicate the selected years.
 */
function updateSliderLabels() {
  const minYearSlider = document.getElementById('minYearSlider');
  const maxYearSlider = document.getElementById('maxYearSlider');

  const minYear = minYearSlider.value;
  const maxYear = maxYearSlider.value;

  const minYearLabel = document.getElementById('minYearLabel');
  const maxYearLabel = document.getElementById('maxYearLabel');

  minYearLabel.innerHTML = minYear;
  maxYearLabel.innerHTML = maxYear;
}

/**
 * Constructs the navigation bar that appears at the top of every page.
 */
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

/**
 * Applies filters to a user control box
 * (i.e., either a list of indicators or a list of countries).
 *
 * There are three types of filters:
 * 1. Search filter. Filters out options that don't match a search term.
 * 2. Checked filter. Filters out options that are not checked.
 * 3. Completeness filter. Filters out options that do not have a high enough data-completeness percentage.'
 *
 * @param {*} boxClass: The class of the elements that are to be hidden or shown based on the filters.
 * @param {*} checkOrRadioClass: The class of the checkbox or radio button elements inside the boxes.
 * @param {*} completenessClass: The class of the elements holding the completeness data for each box (can be null).
 * @param {*} searchFilterId: The ID of the textbox where search terms can be entered.
 * @param {*} checkedFilterId: The ID of the checkbox used to apply the "checked" filter.
 * @param {*} completenessFilterId: The ID of the range slider used to apply the "completeness" filter (can be null).
 * @param {*} completenessFilterLabelId: The ID of the range slider's label.
 */
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

  // Not all controls use the completeness filter.
  // Only initialize these values if the completeness filter is being used.
  if (completenessFilterId) {
    completenessFilter = document.getElementById(completenessFilterId);
    completenessFilterValue = completenessFilter.value;
    completenessFilterLabel = document.getElementById(completenessFilterLabelId);
    completenessFilterLabel.innerHTML = `(${completenessFilterValue}%)`;
  }

  const usingSearchFilter = searchFilter.value !== '';
  const usingCheckedFilter = checkedFilter.checked;
  const usingCompletenessFilter = (completenessClass && completenessFilterId && completenessFilterValue > 0);

  // Iterate over all boxes, showing them or hiding them based on
  // the state of the data they hold
  // compared against the state of the filters.
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

    // Three possible filters. Eight cases to handle.
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

/**
 * Filters the indicator boxes on the "graphs" page.
 */
function filterIndicatorBoxes() {
  filterBoxes('indicatorBox', 'indicatorCheckbox', null, 'indicatorSearchFilter', 'indicatorCheckedFilter', null, null);
}

/**
 * Filters the country boxes on the "graphs" page.
 */
function filterCountryBoxes() {
  filterBoxes('countryBox', 'countryCheckbox', 'countryCompleteness', 'countrySearchFilter', 'countryCheckedFilter', 'countryCompletenessFilter', 'countryCompletenessFilterLabel');
}

/**
 * Filters the primary indicator boxes on the "cards" page.
 */
function filterPrimaryIndicatorBoxes() {
  filterBoxes('primaryIndicatorBox', 'primaryIndicatorRadioButton', null, 'primaryIndicatorSearchFilter', 'primaryIndicatorCheckedFilter', null, null);
}

/**
 * Filters the secondary indicator boxes on the "cards" page.
 */
function filterSecondaryIndicatorBoxes() {
  filterBoxes('secondaryIndicatorBox', 'secondaryIndicatorRadioButton', null, 'secondaryIndicatorSearchFilter', 'secondaryIndicatorCheckedFilter', null, null);
}

/**
 * Filters the tertiary indicator boxes on the "cards" page.
 */
function filterTertiaryIndicatorBoxes() {
  filterBoxes('tertiaryIndicatorBox', 'tertiaryIndicatorCheckbox', null, 'tertiaryIndicatorSearchFilter', 'tertiaryIndicatorCheckedFilter', null, null);
}
