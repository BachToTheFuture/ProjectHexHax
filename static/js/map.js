
// The map

var map = L.map('mapid', {
    minZoom: 2,
	maxZoom: 5
}).setView([0,0], 3);

L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
}).addTo(map);

var NASAGIBS_ModisTerraLSTDay = L.tileLayer('https://map1.vis.earthdata.nasa.gov/wmts-webmerc/MODIS_Terra_Land_Surface_Temp_Day/default/{time}/{tilematrixset}{maxZoom}/{z}/{y}/{x}.{format}', {
	attribution: 'Imagery provided by services from the Global Imagery Browse Services (GIBS), operated by the NASA/GSFC/Earth Science Data and Information System (<a href="https://earthdata.nasa.gov">ESDIS</a>) with funding provided by NASA/HQ.',
	bounds: [[-85.0511287776, -179.999999975], [85.0511287776, 179.999999975]],
	minZoom: 2,
	maxZoom: 5,
	format: 'png',
	time: '',
	tilematrixset: 'GoogleMapsCompatible_Level',
	opacity: 0.5
}).addTo(map);

/*
L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
	maxZoom: 20,
	attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
}).addTo(map);
*/
var southWest = L.latLng(-89.98155760646617, -1000000),
northEast = L.latLng(89.99346179538875, 1000000);
var bounds = L.latLngBounds(southWest, northEast);

map.setMaxBounds(bounds);
map.on('drag', function() {
    map.panInsideBounds(bounds, { animate: false });
});

/*
sidebar
*/
var sidebar = L.control.sidebar('sidebar', {
	closeButton: true,
	position: 'left',
	//autoSpan: false,
});
map.addControl(sidebar);

setTimeout(function() {
    sidebar.show();
}, 500);


function resetSidebar() {
	$("#sidebar").html(`<br>
	<!--This bar gets updated with graphs and the place info whenever a user clicks-->
	<div id="infobar">
		<div class = "veryshortsummary">
	<h2>
	  AID PACT
	</h2>
	<h5>Artificial Intelligence Derived Predictive Analysis of COVID-19 over Time</h5>
	<hr>
	<p> Interact with our map to explore the past, current, and predicted impacts of COVID-19 around the world.</p>
	<p><b>Click on a country or a region to learn more about it.</b></p>

  <h3> 
	Our Mission
  </h3>
	<hr>
  <p> HexHax is a part of the 2020 NASA Space Apps COVID-19 Challenge. Together we decided to create a responsive and well-informed website that uses "Earth Observation-derived features with available socio-economic data in order to discover or enhance our understanding of COVID-19 impacts." </p>
		</div>
	</div>`);
	sidebar.show();
}

var marker = {};

var bounds_geojson;

map.on('click', function (info) {
	sidebar.show();
    $.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${info.latlng.lat}&lon=${info.latlng.lng}`, function(data){
		// Display the outline
	
		console.log(data);
		var lat = data.lat;
		var lon = data.lon;

		if (lat && lon) {
			// add marker
			
			// Should I zoom in?


			var country = data.address.country;
			var state = data.address.state;
			//<h2>${(data.address.state) ? data.address.state + ", " + data.address.country : data.address.country}</h2>

			/*
			Put these after the graphs
			<p><b>Geographical Info</b></p>
				<table class="table table-bordered">
					<tbody>
					<tr>
						<th>Latitude</th>
						<td>${data.lat}</td>
					</tr>
					<tr>
						<th>Longitude</th>
						<td>${data.lon}</td>
					</tr>
					</tbody>
				</table>
			*/
			// Graphs and stuff go here

			//var data = ["new_cases" for x in covid_data[country]];
		
			if (state_covid_cases[state] && state_covid_deaths[state] && state_unemployment[state]){
			// Loading screen
			$("#infobar").html(`
				<h2>${state + ", " + country}</h2>
				<hr>
				<div class="cssload-container">
				<ul class="cssload-flex-container">
					<li>
						<span class="cssload-loading cssload-one"></span>
						<span class="cssload-loading cssload-two"></span>
						<span class="cssload-loading-center"></span>
					</li>
				</div>
			</div>`);
				
			$.get(`https://nominatim.openstreetmap.org/search?q=${data.address.state + "+" + data.address.country}&polygon_geojson=1&format=json`, function(data) {
				console.log(data);
				if (bounds_geojson !== undefined) map.removeLayer(bounds_geojson);
				bounds_geojson = L.geoJson(data[0].geojson, {
					style: style,
					click: zoomToFeature
				}).addTo(map);
				$("#infobar").html(`
				<h2>${state + ", " + country}</h2>
				<hr>
				<canvas id="covid-chart-totals" width="800" height="500"></canvas>
				<canvas id="unemployment-chart" width="800" height="500">`);
				let total_cases = []
				let total_deaths = []
				let dates = []
		  
				let initial_claims = []
				let continued_claims = []
				let unemployment_dates = []
				for (var n = 0; n < state_covid_cases[state].length; n++) {
				  total_cases.push(state_covid_cases[state][n]["total_cases"]);
				  dates.push(state_covid_cases[state][n]["date"]);
				}
		  
				for (var m = 0; m < state_covid_deaths[state].length; m++) {
				  total_deaths.push(state_covid_deaths[state][m]["total_deaths"]);
				  //covid_dates.push(state_covid_deaths[state][n]["date"]);
				}
		  
				for (var u = 0; u < state_unemployment[state].length; u++){
				   initial_claims.push(state_unemployment[state][u]["initial_claims"]);
				   continued_claims.push(state_unemployment[state][u]["continued_claims"]);
				   unemployment_dates.push(state_unemployment[state][u]["date"]);
				}
		  
				//console.log(total_deaths)
				new Chart(document.getElementById("covid-chart-totals"), {
					type: 'line',
					data: {
					labels: dates,
					datasets: [{
					  data: total_cases,
					  label: "Total Cases",
					  borderColor: "#3e95cd",
					  fill: false
					  }, {
					  data: total_deaths,
					  label: "Total Deaths",
					  borderColor: "#000000",
					  fill: false
					}
					]
					},
					options: {
					title: {
					  display: true,
					  text: 'COVID-19 New Cases and Deaths for '+ state
					}
					}
				  }); //End chart
		  
				  new Chart(document.getElementById("unemployment-chart"), {
						  type: 'line',
						  data: {
						  labels: unemployment_dates,
						  datasets: [{
							  data: initial_claims,
							  label: "Initial Claims",
							  borderColor: "#63d13e",
							  fill: false
							  }, {
							  data: continued_claims,
							  label: "Continued Claims",
							  borderColor: "#ff3e33",
							  fill: false
							  }
						  ]
						  },
						  options: {
						  title: {
							  display: true,
							  text: 'Unemployment during COVID-19 '+country
						  }
						  }
					  });
			  
			});
			
		}

		// Show country data otherwise if state data is undefined
		else if (covid_data[country]) {
			$("#infobar").html(`
				<h2>${country}</h2>
				<hr>
				<center><i>Loading data...</i></center>
				<div class="cssload-container">
				<ul class="cssload-flex-container">
					<li>
						<span class="cssload-loading cssload-one"></span>
						<span class="cssload-loading cssload-two"></span>
						<span class="cssload-loading-center"></span>
					</li>
				</div>
			</div>`);

			$.get(`https://nominatim.openstreetmap.org/search?country=${data.address.country}&polygon_geojson=1&format=json`, function(data) {
				console.log(data);
				if (bounds_geojson !== undefined) map.removeLayer(bounds_geojson);
				bounds_geojson = L.geoJson(data[0].geojson, {
					style: style,
				}).addTo(map);
				map.fitBounds(bounds_geojson.getBounds());

				$("#infobar").html(`
				<h2>${country}</h2>
				<hr>
				<canvas id="covid-chart-new" width="800" height="500"></canvas>
				<canvas id="covid-chart-totals" width="800" height="500"></canvas>
				<canvas id="covid-tests" width="800" height="500"></canvas>
			`);
			for (var n = 17; n < covid_headers.length; n++) {
				$("#infobar").append(`<canvas id="${"comparison"+n}" width="800" height="500"></canvas>`)
			}
				//location,date,total_cases,new_cases,total_deaths,new_deaths,
				//total_cases_per_million,new_cases_per_million,total_deaths_per_million,
				//new_deaths_per_million,total_tests,new_tests,total_tests_per_thousand,
				//new_tests_per_thousand,new_tests_smoothed,new_tests_smoothed_per_thousand,
				//tests_units,stringency_index,population,population_density,median_age,aged_65_older,
				//aged_70_older,gdp_per_capita,extreme_poverty,cvd_death_rate,diabetes_prevalence,
				//female_smokers,male_smokers,handwashing_facilities,hospital_beds_per_100k
				var country_data = covid_data[country];
				// New cases/deaths
				new Chart(document.getElementById("covid-chart-new"), {
					type: 'line',
					data: {
						labels: country_data.date,
						datasets: [{
							data: country_data.new_cases,
							label: "New Cases",
							borderColor: "#63d13e",
							fill: false
							}, {
							data: country_data.new_deaths,
							label: "New Deaths",
							borderColor: "#ff3e33",
							fill: false
							}
						]
					},
					options: {
						title: {
							display: true,
							text: 'COVID-19 New Cases and Deaths for '+country
						}
					}
				});
				// Totals
				new Chart(document.getElementById("covid-chart-totals"), {
					type: 'line',
					data: {
						labels: country_data.date,
						datasets: [{
							data: country_data.total_cases,
							label: "Total Cases",
							borderColor: "#63d13e",
							fill: false
							}, {
							data: country_data.total_deaths,
							label: "Total Deaths",
							borderColor: "#ff3e33",
							fill: false
							}
						]
					},
					options: {
						title: {
							display: true,
							text: 'COVID-19 Total Cases and Deaths for '+country
						}
					}
				});
				
				// New and total tests for COVID
				new Chart(document.getElementById("covid-tests"), {
					type: 'line',
					data: {
						labels: country_data.date,
						datasets: [{
							data: country_data.new_tests,
							label: "New Tests",
							borderColor: "#63d13e",
							fill: false
							}, {
							data: country_data.total_tests,
							label: "Total Tests",
							borderColor: "#ff3e33",
							fill: false
							}
						]
					},
					options: {
						title: {
							display: true,
							text: 'COVID-19 New and Total Tests for '+country
						},
						animation:false
					}
				});

				// Comparison with the world data
				for (var n = 17; n < covid_headers.length; n++) {
					new Chart(document.getElementById("comparison"+n), {
						type: 'line',
						data: {
							labels: country_data.date,
							datasets: [{
								data: country_data[covid_headers[n]],
								label: country + " data",
								borderColor: "#63d13e",
								fill: false
								}, {
								data: covid_data["World"][covid_headers[n]],
								label: "World data",
								borderColor: "#ff3e33",
								fill: false
								}
							]
						},
						options: {
							title: {
								display: true,
								text: covid_headers[n]+' for '+country
							},
							animation:false
						}
					});
				}
			});
		}
		else {
			$("#infobar").html(`
				<h2>${data.address.country}</h2>
				<hr>
				<p><b>No Data</b></p>
			`);
		}
		}
    });
});
//////////////////


// get color depending on population density value

function getColor(d) {
	return d > 1000 ? '#800026' :
			d > 500  ? '#BD0026' :
			d > 200  ? '#E31A1C' :
			d > 100  ? '#FC4E2A' :
			d > 50   ? '#FD8D3C' :
			d > 20   ? '#FEB24C' :
			d > 10   ? '#FED976' :
						'#FFEDA0';
}

function style(feature) {
	return {
		weight: 2,
		opacity: 1,
		color: 'white',
		dashArray: '3',
		fillOpacity: 0.7,
		fillColor: "#d14a38"
	};
}

function highlightFeature(e) {
	var layer = e.target;

	layer.setStyle({
		weight: 5,
		color: '#666',
		dashArray: '',
		fillOpacity: 0.7
	});

	if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
		layer.bringToFront();
	}
}

var geojson;

function resetHighlight(e) {
	geojson.resetStyle(e.target);
}

function zoomToFeature(e) {
	map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
	layer.on({
		mouseover: highlightFeature,
		mouseout: resetHighlight,
		//click: zoomToFeature
	});
}

/*
geojson = L.geoJson(statesData, {
	style: style,
	onEachFeature: onEachFeature
}).addTo(map);
*/

/*
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

	var div = L.DomUtil.create('div', 'info legend'),
		grades = [0, 10, 20, 50, 100, 200, 500, 1000],
		labels = [],
		from, to;

	for (var i = 0; i < grades.length; i++) {
		from = grades[i];
		to = grades[i + 1];

		labels.push(
			'<i style="background:' + getColor(from + 1) + '"></i> ' +
			from + (to ? '&ndash;' + to : '+'));
	}

	div.innerHTML = labels.join('<br>');
	return div;
};

legend.addTo(map);
*/