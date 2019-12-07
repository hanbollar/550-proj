/* eslint-disable no-unused-vars */
/* eslint-disable no-use-before-define */
/* eslint-disable max-len */
/* globals document fetch */

/**
 * Renders cards based on the user-selected parameters.
 * Passes control to the appropriate function for the selected mode
 * (i.e., increase, yoy, or yoyPairs).
 *
 * Note the following terminology used throughout the "cards" scripts:
 *
 * 1. Primary indicator: Only one may be selected.
 * 2. Secondary indicator: Only one may be selected.
 * 3. Tertiary indicator: Any number may be selected.
 *
 * This standard is maintained throughout,
 * in order to ensure the controls for the selected mode
 * map to the data that will be processed.
 *
 * The "increase" mode uses primary and tertiary indicators.
 * The "yoy" mode uses only a primary indicator.
 * The "yoyPairs" mode uses primary and secondary indicators.
 */
function updateView() {
  const modeDropdown = document.getElementById('modeDropdown');
  const mode = modeDropdown.options[modeDropdown.selectedIndex].value;

  const minYearSlider = document.getElementById('minYearSlider');
  const maxYearSlider = document.getElementById('maxYearSlider');

  let minYear = minYearSlider.value;
  let maxYear = maxYearSlider.value;

  const minYearLabel = document.getElementById('minYearLabel');
  const maxYearLabel = document.getElementById('maxYearLabel');

  minYearLabel.innerHTML = minYear;
  maxYearLabel.innerHTML = maxYear;

  if (minYear > maxYear) {
    const temp = minYear;
    minYear = maxYear;
    maxYear = temp;
  }

  // Call the correct card-creator function for the selected mode
  // (i.e., increase, yoy, or yoyPairs).
  if (mode === 'increase') {
    createIncreaseCards(minYear, maxYear, false);
  } else if (mode === 'increaseInvert') {
    createIncreaseCards(minYear, maxYear, true);
  } else if (mode === 'yoy') {
    createYoyCards(minYear, maxYear, false);
  } else if (mode === 'yoyInvert') {
    createYoyCards(minYear, maxYear, true);
  } else if (mode === 'yoyPairs') {
    createYoyPairsCards(minYear, maxYear, false);
  } else if (mode === 'yoyPairsInvert') {
    createYoyPairsCards(minYear, maxYear, true);
  }
}

/**
 * Removes all displayed cards.
 */
function removeCards() {
  const cardsContainer = document.getElementById('cardsContainer');

  let child = cardsContainer.lastElementChild;

  while (child) {
    cardsContainer.removeChild(child);
    child = cardsContainer.lastElementChild;
  }
}

/**
 * Resets the user controls to their default state.
 * Search filters are cleared, checkboxes are unchecked, etc.
 *
 * Displays the correct indicator controls for the selected mode
 * (i.e., increase, yoy, or yoyPairs).
 */
function resetControls() {
  const primaryIndicatorSearchFilter = document.getElementById('primaryIndicatorSearchFilter');
  const primaryIndicatorCheckedFilter = document.getElementById('primaryIndicatorCheckedFilter');
  const secondaryIndicatorSearchFilter = document.getElementById('secondaryIndicatorSearchFilter');
  const secondaryIndicatorCheckedFilter = document.getElementById('secondaryIndicatorCheckedFilter');
  const tertiaryIndicatorSearchFilter = document.getElementById('tertiaryIndicatorSearchFilter');
  const tertiaryIndicatorCheckedFilter = document.getElementById('tertiaryIndicatorCheckedFilter');
  const minYearSlider = document.getElementById('minYearSlider');
  const maxYearSlider = document.getElementById('maxYearSlider');

  const primaryIndicatorControls = document.getElementById('primaryIndicatorControls');
  const secondaryIndicatorControls = document.getElementById('secondaryIndicatorControls');
  const tertiaryIndicatorControls = document.getElementById('tertiaryIndicatorControls');

  const indicatorCheckboxesChecked = Array.from(document.getElementsByClassName('indicatorCheckbox'))
    .filter((countryDropdown) => countryDropdown.checked === true);

  indicatorCheckboxesChecked.forEach((indicatorCheckbox) => {
    const indicatorCheckboxNew = indicatorCheckbox;
    indicatorCheckboxNew.checked = false;
  });

  primaryIndicatorSearchFilter.value = '';
  primaryIndicatorCheckedFilter.checked = false;
  secondaryIndicatorSearchFilter.value = '';
  secondaryIndicatorCheckedFilter.checked = false;
  tertiaryIndicatorSearchFilter.value = '';
  tertiaryIndicatorCheckedFilter.checked = false;
  minYearSlider.value = minYearSlider.min;
  maxYearSlider.value = maxYearSlider.max;

  const modeDropdown = document.getElementById('modeDropdown');
  const mode = modeDropdown.options[modeDropdown.selectedIndex].value;

  // Display the correct indicator controls for the selected mode
  // (i.e., increase, yoy, or yoyPairs).
  if (mode === 'increase' || mode === 'increaseInvert') {
    primaryIndicatorControls.removeAttribute('style');
    secondaryIndicatorControls.style.display = 'none';
    tertiaryIndicatorControls.removeAttribute('style');

    primaryIndicatorSearchFilter.placeholder = 'Filter primary indicators...';
    tertiaryIndicatorSearchFilter.placeholder = 'Filter secondary indicators...';
  } else if (mode === 'yoy' || mode === 'yoyInvert') {
    primaryIndicatorControls.removeAttribute('style');
    primaryIndicatorControls.style.width = '100%';
    secondaryIndicatorControls.style.display = 'none';
    tertiaryIndicatorControls.style.display = 'none';

    primaryIndicatorSearchFilter.placeholder = 'Filter indicators...';
  } else if (mode === 'yoyPairs' || mode === 'yoyPairsInvert') {
    primaryIndicatorControls.removeAttribute('style');
    secondaryIndicatorControls.removeAttribute('style');
    tertiaryIndicatorControls.style.display = 'none';

    primaryIndicatorSearchFilter.placeholder = 'Filter numerator indicators...';
    secondaryIndicatorSearchFilter.placeholder = 'Filter denominator indicators...';
  }
}

/**
 * Displays a message indicating the status of the query.
 */
function showMessage(show, text) {
  const messageCard = document.getElementById('messageCard');
  const message = document.getElementById('message');

  message.innerHTML = text;

  if (show) {
    messageCard.removeAttribute('style');
  } else {
    messageCard.style.display = 'none';
  }
}

/**
 * Converts a percentage value (e.g., 0.55) to a string
 * that is specially formatted to display the percentage (e.g., with text and color).
 */
function displayPercentage(number) {
  const percentage = (number * 100).toFixed(2);

  if (percentage > 0) {
    return `<h4 class="percentageIncrease">${percentage}% increase</h4>`;
  }

  if (percentage < 0) {
    return `<h4 class="percentageDecrease">${-percentage}% decrease</h4>`;
  }

  return '<h4>0% increase</h4>';
}

/**
 * Updates the view if the mode is set to "increase."
 *
 * For the selected primary indicator, determines the magnitude of the change
 * for every country in the dataset over the selected time range.
 * Sorts the cards by the magnitude in descending order.
 *
 * If the "invert" parameter is true, orders the results
 * so that the largest negative changes are on top,
 * instead of the largest positive ones.
 *
 * Optionally, the user may select more ("tertiary") indicators to display on each card as well.
 */
function createIncreaseCards(minYear, maxYear, invert) {
  removeCards();

  const cardsContainer = document.getElementById('cardsContainer');

  const primaryIndicatorRadioButtons = Array.from(document.getElementsByClassName('primaryIndicatorRadioButton'));
  let primaryIndicatorRadioButtonChecked;

  for (let i = 0; i < primaryIndicatorRadioButtons.length; i += 1) {
    if (primaryIndicatorRadioButtons[i].checked) {
      primaryIndicatorRadioButtonChecked = primaryIndicatorRadioButtons[i];
      break;
    }
  }

  if (!primaryIndicatorRadioButtonChecked) {
    return;
  }

  showMessage(true, 'Please wait...');

  const tertiaryIndicatorCheckboxesChecked = Array.from(document.getElementsByClassName('tertiaryIndicatorCheckbox'))
    .filter((tertiaryIndicatorCheckbox) => tertiaryIndicatorCheckbox.checked);

  const primaryIndicatorCode = primaryIndicatorRadioButtonChecked.getAttribute('code');
  const primaryIndicatorName = primaryIndicatorRadioButtonChecked.getAttribute('callsign');

  const cardsMap = new Map();
  const tertiaryIndicatorTables = [];

  let url = `/increaseTuples/${primaryIndicatorCode}/${minYear}/${maxYear}/${invert}`;
  const defaultImgSrc = '../assets/flag_images/blank.png';

  // Get data for the primary indicator.
  fetch(url)
    .then((res) => res.json())
    .then((primaryIndicatorTuples) => {
      removeCards();

      if (primaryIndicatorTuples.length > 0) {
        showMessage(false, '');
      } else {
        showMessage(true, 'No cards to display');
      }

      // For each tuple in the primary indicator data, create a card.
      primaryIndicatorTuples.forEach((tuple) => {
        const outerCard = document.createElement('div');
        outerCard.className = 'outerCard';
        cardsContainer.appendChild(outerCard);

        const innerCard = document.createElement('div');
        innerCard.className = 'innerCard';
        outerCard.appendChild(innerCard);

        const image = document.createElement('img');
        const src = `../assets/flag_images/${tuple.name.split(' ').join('').toLowerCase()}.png`;
        image.src = src;
        image.onerror = () => { image.src = defaultImgSrc; };
        image.className = 'flag';
        innerCard.appendChild(image);

        const cardText = document.createElement('div');
        cardText.className = 'cardText';
        innerCard.appendChild(cardText);

        if (tuple.name === 'Samoa') {
          console.log(tuple.percentage_change);
        }

        // We do not need to add tertiary data.
        // Display the card right away.
        if (tertiaryIndicatorCheckboxesChecked.length === 0) {
          cardText.innerHTML = `
            <h3>${tuple.name}</h3><br />
            ${primaryIndicatorName}<br />
            ${displayPercentage(tuple.percentage_change)}<br />
            <small class="yearRange">${minYear}-${maxYear}</small><br />`;
        // We need to add tertiary data.
        // Hide the card until that step is complete.
        } else {
          innerCard.style.display = 'none';
        }

        // Map the card element and its data
        // so tertiary data can be added to it later.
        cardsMap.set(tuple.name, {
          innerCard,
          cardText,
          countryName: tuple.name,
          primaryChange: tuple.percentage_change,
          tertiaryChanges: [],
        });
      });
    })
    .then(() => {
      // For each tertiary indicator, fetch and store its table of data.
      tertiaryIndicatorCheckboxesChecked.forEach((tertiaryIndicatorCheckboxChecked) => {
        const tertiaryIndicatorCode = tertiaryIndicatorCheckboxChecked.getAttribute('code');
        const tertiaryIndicatorName = tertiaryIndicatorCheckboxChecked.getAttribute('callsign');

        // Build the table of data for the tertiary indicator,
        // but don't display it on the cards yet.
        // The data should only be displayed once all server requests complete.
        const newTertiaryIndicatorTable = { indicatorName: tertiaryIndicatorName, tuples: [] };

        url = `/increaseTuples/${tertiaryIndicatorCode}/${minYear}/${maxYear}/${invert}`;

        // Get data for the tertiary indicator.
        fetch(url)
          .then((res) => res.json())
          .then((tertiaryIndicatorTuples) => {
            // Populate the table for this tertiary indicator.
            tertiaryIndicatorTuples.forEach((tuple) => {
              newTertiaryIndicatorTable.tuples.push({
                countryName: tuple.name,
                tertiaryChange: tuple.percentage_change,
              });
            });

            // Add this tertiary indicator to the array of indicators that will be added to cards.
            tertiaryIndicatorTables.push(newTertiaryIndicatorTable);

            // If this was the last tertiary data table to be processed, proceed to displaying the cards.
            if (tertiaryIndicatorTables.length >= tertiaryIndicatorCheckboxesChecked.length) {
              // Add the tertiary data to each card's entry in the map.
              tertiaryIndicatorTables.forEach((tertiaryIndicatorTable) => {
                tertiaryIndicatorTable.tuples.forEach((tertiaryIndicatorTuple) => {
                  // Find the card that will display this data point.
                  if (cardsMap.has(tertiaryIndicatorTuple.countryName)) {
                    // Store the tertiary indicator's name and value (i.e., the percentage change).
                    cardsMap.get(tertiaryIndicatorTuple.countryName).tertiaryChanges.push({
                      indicatorName: tertiaryIndicatorTable.indicatorName,
                      value: tertiaryIndicatorTuple.tertiaryChange,
                    });
                  }
                });
              });

              // Append all tertiary-indicator data to the cards that were constructed previously.
              cardsMap.forEach((card) => {
                const cardNew = card;
                cardNew.innerCard.removeAttribute('style');

                let text = `
                  <h3>${card.countryName}</h3><br />
                  <span class="indicatorName">${primaryIndicatorName}</span><br />
                  ${displayPercentage(card.primaryChange)}`;

                cardNew.tertiaryChanges.forEach((tertiaryChange) => {
                  text += `<br /><span class="indicatorName">${tertiaryChange.indicatorName}</span><br />${displayPercentage(tertiaryChange.value)}`;
                });

                text += `<small class="yearRange">${minYear}-${maxYear}</small><br />`;

                cardNew.cardText.innerHTML = text;
              });
            }
          });
      });
    });
}

/**
 * Updates the view if the mode is set to "yoy."
 *
 * For the selected indicator, computes the largest year-over-year changes
 * in that indicator for each country.
 * Displays a card with this data for each country, sorted by magnitude in descending order.
 *
 * If the "invert" parameter is true, finds the largest negative year-over-year change
 * instead of the largest positive one.
 */
function createYoyCards(minYear, maxYear, invert) {
  removeCards();

  const cardsContainer = document.getElementById('cardsContainer');

  const primaryIndicatorRadioButtons = Array.from(document.getElementsByClassName('primaryIndicatorRadioButton'));
  let primaryIndicatorRadioButtonChecked;

  for (let i = 0; i < primaryIndicatorRadioButtons.length; i += 1) {
    if (primaryIndicatorRadioButtons[i].checked) {
      primaryIndicatorRadioButtonChecked = primaryIndicatorRadioButtons[i];
      break;
    }
  }

  if (!primaryIndicatorRadioButtonChecked) {
    return;
  }

  showMessage(true, 'Please wait...');

  const primaryIndicatorCode = primaryIndicatorRadioButtonChecked.getAttribute('code');
  const primaryIndicatorName = primaryIndicatorRadioButtonChecked.getAttribute('callsign');

  const url = `/yoyTuples/${primaryIndicatorCode}/${minYear}/${maxYear}/${invert}`;
  const defaultImgSrc = '../assets/flag_images/blank.png';

  fetch(url)
    .then((res) => res.json())
    .then((tuples) => {
      removeCards();

      if (tuples.length > 0) {
        showMessage(false, '');
      } else {
        showMessage(true, 'No cards to display');
      }

      // For each tuple in the data, create a card.
      tuples.forEach((tuple) => {
        const outerCard = document.createElement('div');
        outerCard.className = 'outerCard';
        cardsContainer.appendChild(outerCard);

        const innerCard = document.createElement('div');
        innerCard.className = 'innerCard';
        outerCard.appendChild(innerCard);

        const image = document.createElement('img');
        const src = `../assets/flag_images/${tuple.name.split(' ').join('').toLowerCase()}.png`;
        image.src = src;
        image.onerror = () => { image.src = defaultImgSrc; };
        image.className = 'flag';
        innerCard.appendChild(image);

        const cardText = document.createElement('div');
        cardText.className = 'cardText';
        cardText.innerHTML = `
            <h3>${tuple.name}</h3><br />
            <span class="indicatorName">${primaryIndicatorName}</span><br />
            ${displayPercentage(tuple.percentage_change)}
            between ${tuple.start_year} and ${tuple.end_year}`;
        innerCard.appendChild(cardText);
      });
    });
}

/**
 * Updates the view if the mode is set to "yoyPairs."
 *
 * For the selected indicator, computes the largest
 * relative year-over-year change in that indicator for each country.
 * That is, it computes the change in the ratio between
 * the primary indicator (the numerator) and the secondary indicator (the denominator).
 *
 * If the "invert" parameter is true, finds the largest negative year-over-year change
 * instead of the largest positive one.
 */
function createYoyPairsCards(minYear, maxYear, invert) {
  removeCards();

  const cardsContainer = document.getElementById('cardsContainer');

  const primaryIndicatorRadioButtons = Array.from(document.getElementsByClassName('primaryIndicatorRadioButton'));
  let primaryIndicatorRadioButtonChecked;

  for (let i = 0; i < primaryIndicatorRadioButtons.length; i += 1) {
    if (primaryIndicatorRadioButtons[i].checked) {
      primaryIndicatorRadioButtonChecked = primaryIndicatorRadioButtons[i];
      break;
    }
  }

  if (!primaryIndicatorRadioButtonChecked) {
    return;
  }

  const secondaryIndicatorRadioButtons = Array.from(document.getElementsByClassName('secondaryIndicatorRadioButton'));
  let secondaryIndicatorRadioButtonChecked;

  for (let i = 0; i < secondaryIndicatorRadioButtons.length; i += 1) {
    if (secondaryIndicatorRadioButtons[i].checked) {
      secondaryIndicatorRadioButtonChecked = secondaryIndicatorRadioButtons[i];
      break;
    }
  }

  if (!secondaryIndicatorRadioButtonChecked) {
    return;
  }

  showMessage(true, 'Please wait...');

  // Numerator.
  const primaryIndicatorCode = primaryIndicatorRadioButtonChecked.getAttribute('code');
  const primaryIndicatorName = primaryIndicatorRadioButtonChecked.getAttribute('callsign');

  // Denominator.
  const secondaryIndicatorCode = secondaryIndicatorRadioButtonChecked.getAttribute('code');
  const secondaryIndicatorName = secondaryIndicatorRadioButtonChecked.getAttribute('callsign');

  const url = `/yoyPairTuples/${primaryIndicatorCode}/${secondaryIndicatorCode}/${minYear}/${maxYear}/${invert}`;
  const defaultImgSrc = '../assets/flag_images/blank.png';

  fetch(url)
    .then((res) => res.json())
    .then((tuples) => {
      removeCards();

      if (tuples.length > 0) {
        showMessage(false, '');
      } else {
        showMessage(true, 'No cards to display');
      }

      // For each tuple in the data, create a card.
      tuples.forEach((tuple) => {
        const outerCard = document.createElement('div');
        outerCard.className = 'outerCard';
        cardsContainer.appendChild(outerCard);

        const innerCard = document.createElement('div');
        innerCard.className = 'innerCard';
        outerCard.appendChild(innerCard);

        const image = document.createElement('img');
        const src = `../assets/flag_images/${tuple.name.split(' ').join('').toLowerCase()}.png`;
        image.src = src;
        image.onerror = () => { image.src = defaultImgSrc; };
        image.className = 'flag';
        innerCard.appendChild(image);

        const cardText = document.createElement('div');
        cardText.className = 'cardText';
        cardText.innerHTML = `
            <h3>${tuple.name}</h3><br />
            <strong>The ratio of</strong><br />
            <span class="indicatorName">${primaryIndicatorName}</span><br />
            <strong>relative to</strong><br />
            <span class="indicatorName">${secondaryIndicatorName}</span><br />
            <strong>experienced a</strong>
            ${displayPercentage(tuple.percentage_change)}
            <strong>between ${tuple.start_year} and ${tuple.end_year}</strong>`;
        innerCard.appendChild(cardText);
      });
    });
}
