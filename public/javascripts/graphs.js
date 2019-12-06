/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* globals document fetch Plotly */

/**
 * Resets the user controls to their default state.
 * Search filters are cleared, checkboxes are unchecked, etc.
 */
function resetControls() {
  const indicatorSearchFilter = document.getElementById('indicatorSearchFilter');
  const indicatorCheckedFilter = document.getElementById('indicatorCheckedFilter');
  const countrySearchFilter = document.getElementById('countrySearchFilter');
  const countryCheckedFilter = document.getElementById('countryCheckedFilter');
  const countryCompletenessFilter = document.getElementById('countryCompletenessFilter');
  const minYearSlider = document.getElementById('minYearSlider');
  const maxYearSlider = document.getElementById('maxYearSlider');

  indicatorSearchFilter.value = '';
  indicatorCheckedFilter.checked = false;
  countrySearchFilter.value = '';
  countryCheckedFilter.checked = false;
  countryCompletenessFilter.value = 0;
  minYearSlider.value = minYearSlider.min;
  maxYearSlider.value = maxYearSlider.max;
}

/**
 * Removes all displayed graphs.
 */
function removeGraphs() {
  const graphsContainer = document.getElementById('graphsContainer');

  let child = graphsContainer.lastElementChild;

  while (child) {
    graphsContainer.removeChild(child);
    child = graphsContainer.lastElementChild;
  }
}

/**
 * Constructs a graph for a single indicator.
 * Can accept data series for multiple countries.
 */
function constructGraph(graphMap, indicatorName) {
  const dataSeries = [];

  graphMap.forEach((countryData) => {
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

  return { dataSeries, layout };
}

/**
 * Renders graphs based on the user-selected parameters.
 * For each indicator, renders multiple countries' data on the same graph.
 *
 * Additionally, marks countries in the user interface with information about data completeness.
 *
 * For example, if a user has selected Indicator X, every country in the user interface
 * will be marked with a percentage indicating how much data is available for that country
 * on Indicator X within the selected time range.
 *
 * If multiple indicators are selected, data-completeness values will be averaged.
 */
function updateView() {
  removeGraphs();

  const indicatorCheckboxesChecked = Array.from(document.getElementsByClassName('indicatorCheckbox'))
    .filter((indicatorCheckbox) => indicatorCheckbox.checked);

  const countryCheckboxesChecked = Array.from(document.getElementsByClassName('countryCheckbox'))
    .filter((countryCheckbox) => countryCheckbox.checked);

  const countryCompletenesses = Array.from(document.getElementsByClassName('countryCompleteness'));

  const graphsContainer = document.getElementById('graphsContainer');

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
  if (indicatorCheckboxesChecked.length === 0) {
    countryCompletenesses.forEach((countryCompleteness) => {
      const newCountryCompleteness = countryCompleteness;
      newCountryCompleteness.innerHTML = '';
    });

    return;
  }

  // At least one indicator is selected.
  // Compute and display average completeness percentages.
  const completenessMap = new Map();
  const count = indicatorCheckboxesChecked.length;
  indicatorCheckboxesChecked.forEach((indicatorCheckbox) => {
    const indicatorCode = indicatorCheckbox.getAttribute('code');

    const url = `/completenessTuples/${indicatorCode}/${minYear}/${maxYear}`;

    // Get completeness data for the indicator.
    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        json.forEach((tuple) => {
          const countryName = tuple.name;
          const completenessForIndicator = Number(tuple.completeness);

          if (!completenessMap.has(countryName)) {
            completenessMap.set(countryName, { total: 0, average: 0 });
          }

          const mapValue = completenessMap.get(countryName);

          const newTotal = mapValue.total + completenessForIndicator;
          let newAverage;

          if (count !== 0) {
            newAverage = newTotal / count;
          } else {
            newAverage = 0;
          }

          completenessMap.set(countryName, {
            total: newTotal,
            average: newAverage,
          });
        });
      })
      // Display average completeness data for all indicators.
      .then(() => {
        countryCompletenesses.forEach((countryCompleteness) => {
          const countryName = countryCompleteness.getAttribute('callsign');
          const newCountryCompleteness = countryCompleteness;

          if (completenessMap.has(countryName)) {
            newCountryCompleteness.innerHTML = `${Math.round(completenessMap.get(countryName).average * 100)}`;
          } else {
            newCountryCompleteness.innerHTML = '';
          }
        });
      });
  });

  // If no countries are selected, no graphs can be rendered.
  // Therefore, terminate early.
  if (countryCheckboxesChecked.length === 0) { return; }

  // Store the graph data in an array
  // and display it only after all server requests complete.
  const graphData = [];
  indicatorCheckboxesChecked.forEach((indicatorCheckbox) => {
    const indicatorCode = indicatorCheckbox.getAttribute('code');
    const indicatorName = indicatorCheckbox.getAttribute('callsign');

    let url = `/graphTuples/${indicatorCode}/${minYear}/${maxYear}`;
    countryCheckboxesChecked.forEach((countryDropdown) => { url += `/${countryDropdown.getAttribute('callsign')}`; });

    // Get time-series data for the indicator.
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

        graphData.push(constructGraph(graphMap, indicatorName));

        // If all server requests have completed, display the graphs.
        if (graphData.length >= indicatorCheckboxesChecked.length) {
          removeGraphs();

          graphData.forEach((graphDatum) => {
            const graph = document.createElement('div');
            graph.setAttribute('class', 'graph');
            graphsContainer.appendChild(graph);

            Plotly.plot(graph, graphDatum.dataSeries, graphDatum.layout);
          });
        }
      });
  });
}
