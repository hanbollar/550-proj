/* eslint-disable max-len */
/* globals document fetch Plotly */

function removeGraphs() {
  const graphs = document.getElementById('graphs-container');

  let child = graphs.lastElementChild;

  while (child) {
    graphs.removeChild(child);
    child = graphs.lastElementChild;
  }
}

function constructGraph(dataMap, indicatorName) {
  const graphs = document.getElementById('graphs-container');

  const graph = document.createElement('div');
  graph.setAttribute('class', 'graph');
  graphs.appendChild(graph);

  const dataSeries = [];

  dataMap.forEach((countryData) => {
    dataSeries.push({
      x: countryData.years,
      y: countryData.values,
      type: 'scatter',
      name: countryData.name,
    });
  });

  const layout = {
    title: indicatorName,
  };

  Plotly.plot(graph, dataSeries, layout, { showSendToCloud: true });
}

// eslint-disable-next-line no-unused-vars
function updateView() {
  removeGraphs();

  const indicatorCheckboxedChecked = Array.from(document.getElementsByClassName('indicatorCheckbox'))
    .filter((countryDropdown) => countryDropdown.checked === true);

  const countryCheckboxesChecked = Array.from(document.getElementsByClassName('countryCheckbox'))
    .filter((countryDropdown) => countryDropdown.checked === true);

  const countryCompletenesses = Array.from(document.getElementsByClassName('countryCompleteness'));

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

  // If no indicators are selected, clear the completeness percentages and return.
  if (indicatorCheckboxedChecked.length === 0) {
    countryCompletenesses.forEach((countryCompleteness) => {
      const newCountryCompleteness = countryCompleteness;
      newCountryCompleteness.innerHTML = '';
    });

    return;
  }

  // At least one indicator is selected.
  // Compute and display average completeness percentages.
  const completenessMap = new Map();
  indicatorCheckboxedChecked.forEach((indicatorCheckbox) => {
    const indicatorCode = indicatorCheckbox.getAttribute('code');

    const url = `/completenessTuples/${indicatorCode}/${minYear}/${maxYear}`;

    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        json.forEach((tuple) => {
          const countryName = tuple.name;
          const completenessForIndicator = Number(tuple.completeness);

          if (!completenessMap.has(countryName)) {
            completenessMap.set(countryName, { count: 0, total: 0, average: 0 });
          }

          const mapValue = completenessMap.get(countryName);

          const newCount = mapValue.count + 1;
          const newTotal = mapValue.total + completenessForIndicator;
          const newAverage = newTotal / newCount;

          completenessMap.set(countryName, {
            count: newCount,
            total: newTotal,
            average: newAverage,
          });
        });
      })
      .then(() => {
        countryCompletenesses.forEach((countryCompleteness) => {
          const countryName = countryCompleteness.getAttribute('name');
          const newCountryCompleteness = countryCompleteness;

          if (completenessMap.has(countryName)) {
            newCountryCompleteness.innerHTML = `${Math.round(completenessMap.get(countryName).average * 100)}`;
          } else {
            newCountryCompleteness.innerHTML = '';
          }
        });
      });
  });

  if (countryCheckboxesChecked.length === 0) { return; }

  indicatorCheckboxedChecked.forEach((indicatorCheckbox) => {
    const indicatorCode = indicatorCheckbox.getAttribute('code');
    const indicatorName = indicatorCheckbox.getAttribute('name');

    let url = `/graphTuples/${indicatorCode}/${minYear}/${maxYear}`;
    countryCheckboxesChecked.forEach((countryDropdown) => { url += `/${countryDropdown.getAttribute('name')}`; });

    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        const graphMap = new Map();

        json.forEach((tuple) => {
          if (!graphMap.has(tuple.cid)) {
            graphMap.set(tuple.cid, { name: tuple.name, years: [], values: [] });
          }

          const countryData = graphMap.get(tuple.cid);
          countryData.years.push(tuple.year);
          countryData.values.push(tuple.value);
        });

        constructGraph(graphMap, indicatorName);
      });
  });
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

    const inViaSearchFilter = boxNew.getAttribute('name').toLowerCase().includes(searchFilter.value.toLowerCase());
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
