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
function constructGraphs() {
  const indicatorCheckboxes = Array.from(document.getElementsByClassName('indicatorCheckbox'))
    .filter((countryDropdown) => countryDropdown.checked === true);

  const countryCheckboxes = Array.from(document.getElementsByClassName('countryCheckbox'))
    .filter((countryDropdown) => countryDropdown.checked === true);

  const minYearDropdown = document.getElementById('minYearDropdown');
  const maxYearDropdown = document.getElementById('maxYearDropdown');

  if (indicatorCheckboxes.length === 0) { return; }
  if (countryCheckboxes.length === 0) { return; }
  if (minYearDropdown.selectedIndex === 0) { return; }
  if (maxYearDropdown.selectedIndex === 0) { return; }

  const minYear = minYearDropdown.options[minYearDropdown.selectedIndex].label;
  const maxYear = maxYearDropdown.options[maxYearDropdown.selectedIndex].label;

  removeGraphs();

  indicatorCheckboxes.forEach((indicatorCheckbox) => {
    const indicatorCode = indicatorCheckbox.getAttribute('code');
    const indicatorName = indicatorCheckbox.getAttribute('name');

    let url = `/graphTuples/${indicatorCode}/${minYear}/${maxYear}`;

    countryCheckboxes.forEach((countryDropdown) => { url += `/${countryDropdown.getAttribute('name')}`; });

    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        const dataMap = new Map();

        json.forEach((tuple) => {
          if (!dataMap.has(tuple.cid)) {
            dataMap.set(tuple.cid, { name: tuple.name, years: [], values: [] });
          }

          const countryData = dataMap.get(tuple.cid);
          countryData.years.push(tuple.year);
          countryData.values.push(tuple.value);
        });

        constructGraph(dataMap, indicatorName);
      });
  });
}

function filterCheckboxes(checkboxName, filterName) {
  const checkboxes = Array.from(document.getElementsByClassName(checkboxName));
  const filter = document.getElementById(filterName);

  if (filter.value === '') {
    return;
  }

  checkboxes.forEach((checkbox) => {
    const domCheckbox = checkbox;

    if (checkbox.getAttribute('name').includes(filter.value)) {
      domCheckbox.style.display = 'block';
    } else {
      domCheckbox.style.display = 'none';
    }
  });
}

// eslint-disable-next-line no-unused-vars
function filterIndicatorCheckboxes() {
  filterCheckboxes('indicatorBox', 'indicatorFilter');
}

// eslint-disable-next-line no-unused-vars
function filterCountryCheckboxes() {
  filterCheckboxes('countryBox', 'countryFilter');
}