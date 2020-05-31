
$(document).ready(function (){
	$(".nav-link").click(function (event){
		$('html, body').animate({
			scrollTop: $(event.target.getAttribute("scroll-to")).offset().top-110
		}, 200);
	});
});

var covid_data;

//https://stackoverflow.com/questi ons/7431268/how-to-read-data-from-csv-file-using-javascript
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
	covid_data = dict;
}