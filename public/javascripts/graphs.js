/* globals document fetch Plotly */

function constructGraph(years, values) {
  const graphs = document.getElementById('graphs');

  const graph = document.createElement('div');
  graphs.appendChild(graph);

  Plotly.plot(graph, [{
    x: years,
    y: values,
  }], { margin: { t: 0 } }, { showSendToCloud: true });
}

// eslint-disable-next-line no-unused-vars
function constructGraphs() {
  const indicatorDropdown = document.getElementById('indicatorDropdown');
  const minYearDropdown = document.getElementById('minYearDropdown');
  const maxYearDropdown = document.getElementById('maxYearDropdown');
  const countryDropdown = document.getElementById('countryDropdown');

  if (indicatorDropdown.selectedIndex === 0) { return; }
  if (minYearDropdown.selectedIndex === 0) { return; }
  if (maxYearDropdown.selectedIndex === 0) { return; }
  if (countryDropdown.selectedIndex === 0) { return; }

  const indicator = indicatorDropdown.options[indicatorDropdown.selectedIndex].label;
  const minYear = minYearDropdown.options[minYearDropdown.selectedIndex].label;
  const maxYear = maxYearDropdown.options[maxYearDropdown.selectedIndex].label;
  const country = countryDropdown.options[countryDropdown.selectedIndex].label;

  fetch(`/graphTuples/${indicator}/${minYear}/${maxYear}/${country}`)
    .then((res) => res.json())
    .then((json) => {
      const years = [];
      const values = [];

      for (let i = 0; i < json.length; i += 1) {
        years.push(json[i].year);
        values.push(json[i].value);
      }

      constructGraph(years, values);
    });
}
