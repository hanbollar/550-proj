/* eslint-disable max-len */
/* globals document fetch */

// eslint-disable-next-line no-unused-vars
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

  if (mode === 'increase') {
    primaryIndicatorControls.removeAttribute('style');
    secondaryIndicatorControls.style.display = 'none';
    tertiaryIndicatorControls.removeAttribute('style');
  } else if (mode === 'yoy') {
    primaryIndicatorControls.removeAttribute('style');
    primaryIndicatorControls.style.width = '100%';
    secondaryIndicatorControls.style.display = 'none';
    tertiaryIndicatorControls.style.display = 'none';
  } else if (mode === 'yoyPairs') {
    primaryIndicatorControls.removeAttribute('style');
    secondaryIndicatorControls.removeAttribute('style');
    tertiaryIndicatorControls.style.display = 'none';
  }
}

// eslint-disable-next-line no-unused-vars
function removeCards() {
  const cardsContainer = document.getElementById('cardsContainer');

  let child = cardsContainer.lastElementChild;

  while (child) {
    cardsContainer.removeChild(child);
    child = cardsContainer.lastElementChild;
  }
}

function createIncreaseCards(minYear, maxYear) {
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

  const tertiaryIndicatorCheckboxesChecked = Array.from(document.getElementsByClassName('tertiaryIndicatorCheckbox'))
    .filter((tertiaryIndicatorCheckbox) => tertiaryIndicatorCheckbox.checked);

  const primaryIndicatorCode = primaryIndicatorRadioButtonChecked.getAttribute('code');
  const primaryIndicatorName = primaryIndicatorRadioButtonChecked.getAttribute('callsign');

  const cardsMap = new Map();
  const tertiaryIndicatorTables = [];

  let url = `/increaseTuples/${primaryIndicatorCode}/${minYear}/${maxYear}`;
  const defaultImgSrc = '../assets/flag_images/blank.png';

  fetch(url)
    .then((res) => res.json())
    .then((json) => {
      removeCards();

      // For each tuple in the primary indicator data, create a card.
      json.forEach((tuple) => {
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

        if (tertiaryIndicatorCheckboxesChecked.length === 0) {
          cardText.innerHTML = `<h3>${tuple.name}</h3><br />${primaryIndicatorName}<br />${(tuple.percentage_change * 100).toFixed(2)}% increase`;
        }

        // Map the card so it can be retrieved when tertiary data is added.
        cardsMap.set(tuple.name, {
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

        const newTertiaryIndicatorTable = { indicatorName: tertiaryIndicatorName, tuples: [] };

        url = `/increaseTuples/${tertiaryIndicatorCode}/${minYear}/${maxYear}`;

        fetch(url)
          .then((res) => res.json())
          .then((json) => {
            json.forEach((tuple) => {
              newTertiaryIndicatorTable.tuples.push({ countryName: tuple.name, tertiaryChange: tuple.percentage_change });
            });
          })
          .then(() => {
            tertiaryIndicatorTables.push(newTertiaryIndicatorTable);

            // If all of the tertiary data tables are ready, display everything.
            if (tertiaryIndicatorTables.length >= tertiaryIndicatorCheckboxesChecked.length) {
              // Add the tertiary data to each card's entry in the map.
              tertiaryIndicatorTables.forEach((tertiaryIndicatorTable) => {
                tertiaryIndicatorTable.tuples.forEach((tertiaryIndicatorTuple) => {
                  // Find the card that will display this data point.
                  if (cardsMap.has(tertiaryIndicatorTuple.countryName)) {
                    // Store the tertiary indicator's name and value (i.e., the percentage change).
                    cardsMap.get(tertiaryIndicatorTuple.countryName).tertiaryChanges.push({
                      indicatorName: newTertiaryIndicatorTable.indicatorName,
                      value: tertiaryIndicatorTuple.tertiaryChange,
                    });
                  }
                });
              });

              // Display all of the data.
              cardsMap.forEach((card) => {
                const cardNew = card;

                let text = `<h3>${card.countryName}</h3><br />${primaryIndicatorName}<br />${(card.primaryChange * 100).toFixed(2)}% increase`;

                cardNew.tertiaryChanges.forEach((tertiaryChange) => {
                  text += `<br />${tertiaryChange.indicatorName}<br />${(tertiaryChange.value * 100).toFixed(2)}% increase`;
                });

                cardNew.cardText.innerHTML = text;
              });
            }
          });
      });
    });
}

function createYoyCards(minYear, maxYear) {
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

  const primaryIndicatorCode = primaryIndicatorRadioButtonChecked.getAttribute('code');
  const primaryIndicatorName = primaryIndicatorRadioButtonChecked.getAttribute('callsign');

  const url = `/yoyTuples/${primaryIndicatorCode}/${minYear}/${maxYear}`;
  const defaultImgSrc = '../assets/flag_images/blank.png';

  fetch(url)
    .then((res) => res.json())
    .then((json) => {
      removeCards();

      // For each tuple in the data, create a card.
      json.forEach((tuple) => {
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
          ${primaryIndicatorName}<br />
          ${(tuple.percentage_change * 100).toFixed(2)}% increase between ${tuple.start_year} and ${tuple.end_year}`;
        innerCard.appendChild(cardText);
      });
    });
}

function createYoyPairsCards(minYear, maxYear) {
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

  // Numerator.
  const primaryIndicatorCode = primaryIndicatorRadioButtonChecked.getAttribute('code');
  const primaryIndicatorName = primaryIndicatorRadioButtonChecked.getAttribute('callsign');

  // Denominator.
  const secondaryIndicatorCode = secondaryIndicatorRadioButtonChecked.getAttribute('code');
  const secondaryIndicatorName = secondaryIndicatorRadioButtonChecked.getAttribute('callsign');

  const url = `/yoyPairTuples/${primaryIndicatorCode}/${secondaryIndicatorCode}/${minYear}/${maxYear}`;
  const defaultImgSrc = '../assets/flag_images/blank.png';

  fetch(url)
    .then((res) => res.json())
    .then((json) => {
      removeCards();

      // For each tuple in the data, create a card.
      json.forEach((tuple) => {
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
          The ratio of<br />
          ${primaryIndicatorName}<br />
          relative to<br />
          ${secondaryIndicatorName}<br />
          experienced a ${(tuple.percentage_change * 100).toFixed(2)}% increase between ${tuple.start_year} and ${tuple.end_year}`;
        innerCard.appendChild(cardText);
      });
    });
}

// eslint-disable-next-line no-unused-vars
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

  if (mode === 'increase') {
    createIncreaseCards(minYear, maxYear);
  } else if (mode === 'yoy') {
    createYoyCards(minYear, maxYear);
  } else if (mode === 'yoyPairs') {
    createYoyPairsCards(minYear, maxYear);
  }
}
