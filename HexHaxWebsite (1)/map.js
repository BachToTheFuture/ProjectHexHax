
// The map
var map = L.map('mapid').setView([0,0], 3);
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
}).addTo(map);


/*
sidebar
*/
var sidebar = L.control.sidebar('sidebar',{
    position: 'left',
    autoPan: false,
});
map.addControl(sidebar);

setTimeout(function() {
    sidebar.show();
}, 500);

map.on('click', function (info) {
    $.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${info.latlng.lat}&lon=${info.latlng.lng}`, function(data){
        //console.log(data);
		var lat = data.lat;
		var lon = data.lon;
		var country = data.address.country;
		var state = data.address.state;
		
        $("#infobar").html(`
            <h2>${(data.address.state) ? data.address.state + ", " + data.address.country : data.address.country}</h2>
			<hr>
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
			<p><b>Graphs</b></p>

			<canvas id="covid-chart" width="800" height="450"></canvas>
        `);
		// Graphs and stuff go here
		console.log(covid_data);

		if (country == "United States of America"){
      new Chart(document.getElementById("covid-chart"), {
        type: 'line',
        data: {
          labels: [1500, 1600, 1700, 1750, 1800, 1850, 1900, 1950, 1999, 2050],
          datasets: [{
              data: [86, 114, 106, 106, 107, 111, 133, 221, 783, 2478],
              label: "Africa",
              borderColor: "#3e95cd",
              fill: false
            }, {
              data: [282, 350, 411, 502, 635, 809, 947, 1402, 3700, 5267],
              label: "Asia",
              borderColor: "#8e5ea2",
              fill: false
            }, {
              data: [168, 170, 178, 190, 203, 276, 408, 547, 675, 734],
              label: "Europe",
              borderColor: "#3cba9f",
              fill: false
            }, {
              data: [40, 20, 10, 16, 24, 38, 74, 167, 508, 784],
              label: "Latin America",
              borderColor: "#e8c3b9",
              fill: false
            }, {
              data: [6, 3, 2, 2, 7, 26, 82, 172, 312, 433],
              label: "North America",
              borderColor: "#c45850",
              fill: false
            }
          ]
        },
        options: {
          title: {
            display: true,
            text: 'Covid cases per region (in millions)'
          }
        }
      });
    }
    
    else{

    }
    
		//end chart
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
		fillColor: getColor(feature.properties.density)
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

geojson = L.geoJson(statesData, {
	style: style,
	onEachFeature: onEachFeature
}).addTo(map);

map.attributionControl.addAttribution('Population data &copy; <a href="http://census.gov/">US Census Bureau</a>');


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