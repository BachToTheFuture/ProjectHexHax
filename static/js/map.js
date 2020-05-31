
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
	minZoom: 1,
	maxZoom: 7,
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
			`);
				//date,location,new_cases,new_deaths,total_cases,total_deaths
				let new_cases = []
				let new_deaths = []
				let total_cases = []
				let total_deaths = []
				let dates = []

				for (var n = 0; n < covid_data[country].length; n++) {
					new_cases.push(covid_data[country][n]["new_cases"]);
					new_deaths.push(covid_data[country][n]["new_deaths"]);
					total_cases.push(covid_data[country][n]["total_cases"]);
					total_deaths.push(covid_data[country][n]["total_deaths"]);
					dates.push(covid_data[country][n]["date"]);
				}
				//console.log(new_cases);
				//console.log(dates);
			
				new Chart(document.getElementById("covid-chart-new"), {
					type: 'line',
					data: {
					labels: dates,
					datasets: [{
						data: new_cases,
						label: "New Cases",
						borderColor: "#63d13e",
						fill: false
						}, {
						data: new_deaths,
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
					
				//end chart

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
						text: 'COVID-19 Total Cases and Deaths for '+country
						}
					}
				});
			});
			
				// end
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