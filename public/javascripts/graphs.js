/* eslint-disable max-len */
/* globals document fetch Plotly */

// eslint-disable-next-line no-unused-vars
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

function removeGraphs() {
  const graphsContainer = document.getElementById('graphsContainer');

  let child = graphsContainer.lastElementChild;

  while (child) {
    graphsContainer.removeChild(child);
    child = graphsContainer.lastElementChild;
  }
}

function constructGraph(dataMap, indicatorName) {
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

  return { dataSeries, layout };
}

// eslint-disable-next-line no-unused-vars
function updateView() {
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
  indicatorCheckboxesChecked.forEach((indicatorCheckbox) => {
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

  if (countryCheckboxesChecked.length === 0) { return; }

  indicatorCheckboxesChecked.forEach((indicatorCheckbox) => {
    const indicatorCode = indicatorCheckbox.getAttribute('code');
    const indicatorName = indicatorCheckbox.getAttribute('callsign');

    let url = `/graphTuples/${indicatorCode}/${minYear}/${maxYear}`;
    countryCheckboxesChecked.forEach((countryDropdown) => { url += `/${countryDropdown.getAttribute('callsign')}`; });
    const graphData = [];

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
      })
      .then(() => {
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
