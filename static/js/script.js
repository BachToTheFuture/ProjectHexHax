
$(document).ready(function() {
	$(".nav-link").click(function (event){
		var that = $(this);
		$('html, body').animate({
			scrollTop: $(that.attr("scroll-to")).offset().top-window.innerHeight*0.17//0.65 for smaller screen
		}, 200);
	});
});

var covid_data;

//https://stackoverflow.com/questions/7431268/how-to-read-data-from-csv-file-using-javascript
function processData(allText) {
    var record_num = 5;  // or however many elements there are in each row
    var allTextLines = allText.split(/\r\n|\n/);
    var headings = allTextLines[0].split(',');
	var dict = {};
	for (var i = 1; i < allTextLines.length; i++) {
		var row = allTextLines[i].split(',');
		if (!dict[row[1]]) dict[row[1]] = [];
		dict[row[1]].push({"date":row[0], "new_cases":row[2], "new_deaths":row[3], "total_cases": row[4], "total_deaths":row[5]});
	}
	//console.log(dict);
	covid_data = dict;
    // alert(lines);
}

var state_covid_cases;
function process_state_cases(allText) {
  var allTextLines = allText.split(/\r\n|\n/)
  var headings = allTextLines[0].split(',');

  var dict = {}
  for (var row_index = 0; row_index < allTextLines.length; row_index++){
    var row = allTextLines[row_index].split(',');
    if (!dict[row[0]]) dict[row[0]] = [];
    for (var col_index = 1; col_index < row.length; col_index++){
      dict[row[0]].push({"date":headings[col_index], "total_cases":row[col_index]});
    }
  }
  //console.log(dict)
  state_covid_cases = dict;
}

var state_covid_deaths;
function process_state_deaths(allText) {
  var allTextLines = allText.split(/\r\n|\n/)
  var headings = allTextLines[0].split(',');

  var dict = {}
  for (var row_index = 0; row_index < allTextLines.length; row_index++){
    var row = allTextLines[row_index].split(',');
    if (!dict[row[0]]) dict[row[0]] = [];
    for (var col_index = 1; col_index < row.length; col_index++){
      dict[row[0]].push({"date":headings[col_index], "total_deaths":row[col_index]});
    }
  }
  state_covid_deaths = dict;
}
