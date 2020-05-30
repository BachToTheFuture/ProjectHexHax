
$(document).ready(function (){
	$(".nav-link").click(function (event){
		$('html, body').animate({
			scrollTop: $(event.target.getAttribute("scroll-to")).offset().top-110
		}, 200);
	});
});

$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: "global_covid.csv",
        dataType: "text",
        success: function(data) {processData(data);}
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
		dict[row[1]]["data"].push({"date":row[0], "new_cases":row[2], "new_deaths":row[3],"total_cases": row[4], "total_deaths":row[5]});
	}
	console.log(dict);
    // alert(lines);
}