window.onload = function() {
	// Get values for Monthly Plans table
	var xhr = new XMLHttpRequest();
    xhr.open("GET", "monthly_plans_feed.php");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.addEventListener("load", function() {
        myConfig1.series[0].values = JSON.parse(this.responseText);

        zingchart.render({
          id : 'chart1',
          data : myConfig1,
          height: 400,
          width: '100%'
        });
    });
    xhr.send();
}