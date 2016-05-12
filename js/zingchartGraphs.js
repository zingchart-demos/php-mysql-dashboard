// ############################################### HELPER FUNCTIONS ####################################################
function updateTitle() {
  var interval = document.getElementById('date-interval').value;
  interval = interval.charAt(0).toUpperCase() + interval.substring(1);
  var year = document.getElementById('year-selector').value;
  var plan = document.getElementById('plans-selector').value;
  plan = plan.charAt(0).toUpperCase() + plan.substring(1);

  var title = 'Revenue For ' + plan + ' Plans\nGrouped by ' + interval;
  if (year != 'all') {
    title += ' in ' + year;
  }

  myConfig1.title.text = title;
}

/**
 * Formats a value to be prepended with $ and enforces 'c' decimal places
 * @param c - number of decimal places
 * @returns {string} - the formatted value in dollars
 */
Number.prototype.formatMoney = function(c){
  var n = this,
      c = isNaN(c = Math.abs(c)) ? 2 : c,
      d = ".",
      t = ",",
      s = n < 0 ? "-" : "",
      i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
      j = (j = i.length) > 3 ? j % 3 : 0;
  return "$" + s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

/**
 *
 * @param chartConfig - the configuration of the chart you wish to plot a trendline for
 * @returns {{slope: number, yIntercept: number, n: number}}
 */
function calculateLinearTrend(chartConfig) {
  var interval = document.getElementById('date-interval').value;
  var config = chartConfig.graphset ? chartConfig.graphset[0] : chartConfig;

  var seriesValues = config.series[0].values;

  var startDate = '';
  var endDate = '';

  if (config['scale-x']['zoom-to-values']) {
    if (interval != 'days') {
      var sDate = new Date(config['scale-x']['zoom-to-values'][0].substring(0,11));
      var eDate = new Date(config['scale-x']['zoom-to-values'][1].substring(0,11));
      startDate = sDate.getTime();
      endDate = eDate.getTime();
    } else {
      startDate = config['scale-x']['zoom-to-values'][0];
      endDate = config['scale-x']['zoom-to-values'][1];
    }
  }
  else {
    if (interval != 'days') {
      var length = config['scale-x']['values'].length;
      startDate =  new Date(config['scale-x']['values'][0].substring(0,11));
      endDate = new Date(config['scale-x']['values'][length-1].substring(0,11));
    } else {
      var length = config['scale-x']['values'].length;
      startDate = config['scale-x']['values'][0];
      endDate = config['scale-x']['values'][length-1];
    }
  }

  var arr = JSON.parse(JSON.stringify(seriesValues));
  var a = 0;
  var b = 0;
  var bX = 0;
  var bY = 0;
  var c = 0;
  var d = 0;
  var m = 0;
  var e = 0;
  var f = 0;
  var g = 0;

  // let a equal n times the summation of all x-values multiplied by their corresponding y-values
  var index = 0;
  var count = 0;
  for (var i = 0; i < arr.length; i++) {
    if (interval != 'days') {
      var currentDate = new Date(config['scale-x']['values'][i].substring(0,11));
      if ((currentDate.getTime() >= startDate) &&
          (currentDate.getTime() <= endDate)) {
        count++;
        index = count;
        a += arr[i] * index;//arr[i][0] * arr[i][1];
        bX += index;//arr[i][1];
        bY += arr[i];//arr[i];
        c += Math.pow(index, 2);//Math.pow(arr[i][1], 2);
        d += index;
      }
    } else {
      if ((config['scale-x']['values'][i] >= startDate) &&
          (config['scale-x']['values'][i] <= endDate)) {
        count++;
        index = count;
        a += arr[i] * index;//arr[i][0] * arr[i][1];
        bX += index;//arr[i][1];
        bY += arr[i];//arr[i];
        c += Math.pow(index, 2);//Math.pow(arr[i][1], 2);
        d += index;
      }
    }

  }

  // Calculate a
  a *= count;//arr.length;
  b = bX * bY;
  c *= count;//arr.length;
  d = Math.pow(d, 2);
  // Calculate slope
  m = (a - b) / (c - d);
  f = m * bX;

  // Calculate y-intercept
  b = (bY - f) / count;//arr.length;

  var returnObj = {
    slope: m,
    yIntercept: b,
    n: count
  };

  return returnObj;
}

/**
 *
 * @param values - array containing the data to which we want to find the max value for
 * @returns {number} - the maximum value
 */
function findMaxRevenue(values) {
  var max = -1;
  values.forEach(function(value, index, array) {
    if (value > max) max = value;
  });
  return max;
}

/**
 * Updates chart1 with data retreived from database for the selected plan from input
 * @param event - Click event from plan-selector input
 */
function loadPlanToChart(event) {
  var selectedPlan = document.getElementById('plans-selector').value;

  // Get the value from the year-selector element
  var year = document.getElementById('year-selector').value;

  // Update the chart title to reflect this new interval
  updateTitle();

  var xhr = new XMLHttpRequest();
  xhr.open("GET", "chart1_feed.php?plan=" + selectedPlan);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.addEventListener("load", function() {
    var data = JSON.parse(this.responseText);
    myConfig1.series[0].values = data.series;
    myConfig1.scaleX.values = data.dates;

    // Preserving state of user's chart configurations ie) selected year and date-interval
    //filterByYear(organizeByInterval(), year);//TODO
    if (document.getElementById('year-selector').value == 'all') {
      organizeByInterval();
    } else {
      filterByYear(organizeByInterval(), year);
    }

    var trendlineButton = document.getElementById('trendline');
    if (trendlineButton.classList.contains('btn-info')) {
      plotTrendline();
    }

    // Setting the maximum revenue value calculated from Server
    document.getElementById('chart1-maxValue').innerHTML = (data.maxRevenue).formatMoney(2);
  });
  xhr.send();
}
/**
 * Toggles the trendline
 * @param event - Click event from trendline button
 */
function toggleTrendline(event) {
  if (this.classList.contains('btn-default')) {
    this.classList.remove('btn-default');
    this.classList.add('btn-info');
    this.innerHTML = 'On';
    plotTrendline();
  } else {
    this.classList.add('btn-default');
    this.classList.remove('btn-info');
    this.innerHTML = 'Off';

    var chartConfig = zingchart.exec('chart1', 'getdata');
    chartConfig.graphset[0]['scale-y']['markers'] = [];

    zingchart.exec('chart1', 'setdata', {
      data: chartConfig.graphset[0]
    });
  }
}


/**
 * Plots a linear trendline on 'chart1'.
 * @return - does not return
 */
function plotTrendline() {
  var chartConfig = zingchart.exec('chart1', 'getdata', {graphid: 0});
  var oTrendline = calculateLinearTrend(chartConfig);
  var newSeriesValues = [];
  var trendPoint = 0;
  var config = chartConfig.graphset ? chartConfig.graphset[0] : chartConfig;

  config['scale-y']['markers'] = [];
  var oMarker = {
    type: 'line',
    range: [],
    lineColor: 'red',
    alpha: 0.5,
    lineWidth: 3,
    lineStyle: 'dashed'
  };

  var newData = {
    data: config
  };

  newData.data['scale-y']['markers'][0] = oMarker;
  newData.data['scale-y']['markers'][0].range.push(oTrendline.yIntercept);
  newData.data['scale-y']['markers'][0].range.push(oTrendline.slope*oTrendline.n+oTrendline.yIntercept);
  zingchart.exec('chart1', 'setdata', newData);
}

/**
 * Displays the valueBox in the center of the donut chart
 * @param p
 */
function displayValueBoxGraph2(p, plotData) {
  var plotIndex = p.plotindex;

  if (inAPieSlice == false) {
    var ruleTemplate = {
    'rules':[]
  };

  ruleTemplate['rules'][0] = {
    'rule': '%p != ' + plotIndex,
    'visible': false
  }
  zingchart.exec(p.id, 'modify', {
    data : {
      'plot': {
        'value-box': {
          'decimals': 2,
          'text': "%t: <br>$%v",
          'rules': ruleTemplate['rules'],
          'font-color': plotData.backgroundColor1
        }
      }
    }
  });

  inAPieSlice = true;
  }
}

/**
 * Simply re-renders the original configuration, ie. interval=days
 */
function organizeByDays() {
  zingchart.exec('chart1', 'setdata', {data: myConfig1});

  // Update the chart title to reflect this new interval
  updateTitle();
}

/**
 * Appends an option to the 'plan-selector' drop-down menu.
 * The option(s) are gathered from the Database
 * @param data - the option's value
 */
function appendOptionToPlanSelector(data) {
  var select = document.getElementById('plans-selector');
  var option = document.createElement('option');
  option.text = data;
  select.appendChild(option);
}
// #####################################################################################################################

// ############################################### WORKER FUNCTIONS ####################################################
/**
 * Calculates the sums of values for the selected date-interval
 * @returns Either the original chart configuration(interval=days) or a copy of original chart
 * configuration with nodes recalculated for the selected date-interval
 */
function organizeByInterval() {
  var interval = document.getElementById('date-interval').value;
  var year = document.getElementById('year-selector').value;

  // Update the chart title to reflect this new interval
  updateTitle();

  // disable the Year Selector
  var yearSelector = document.getElementById('year-selector');
  yearSelector.disabled = interval=='years';

  var trendlineButton = document.getElementById('trendline');
  var year = 'all';

  // Get selected year
  if (document.getElementById('year-selector').disabled == false) {
    year = document.getElementById('year-selector').value;
  }

  if (interval == 'days') {
    filterByYear(myConfig1, year);
    var values = myConfig1.series[0].values;
    document.getElementById('chart1-maxValue').innerHTML = (findMaxRevenue(values)).formatMoney(2);
    //setTimeout(function() {
      if (trendlineButton.classList.contains('btn-info')) {
        plotTrendline();
      }
    //}, 200);
    return;
  }

  var first = myConfig1.scaleX.values[0];
  var oneDay = 86400000;
  var intervalInMilliseconds = oneDay * 1;
  switch (interval) {
    case 'weeks': intervalInMilliseconds = oneDay * 7;break;
    case 'months': intervalInMilliseconds = oneDay * 28;break;
    case 'years': intervalInMilliseconds = oneDay * 365;break;
    default: intervalInMilliseconds = oneDay * 7;break;
  }
  var theDate = new Date(first).toString();
  var endDate = new Date(first + intervalInMilliseconds);
  var start = myConfig1.scaleX.values[0];
  var weekEnd = start + intervalInMilliseconds;
  var weekData = 0.00;
  var newSeries = [];
  var labels = [];

  var seriesArr = myConfig1.series[0].values;
  var datesArr = myConfig1.scaleX.values;
  for (var i = 0; i < datesArr.length; i++) {
    if (datesArr[i] <= weekEnd) {
      weekData += seriesArr[i];//datesArr[i];
    } else {
      var weekStartDate = new Date(start).toString();
      var weekEndDate = new Date(weekEnd).toString();
      var fStartDate = weekStartDate.substring(4, 15);
      var fEndDate = weekEndDate.substring(4, 15);
      var label = fStartDate + '-\n' + fEndDate;
      newSeries.push(weekData);
      labels.push(label);
      weekData = 0.00;
      start = datesArr[i];//array[index][0];
      weekEnd = start + intervalInMilliseconds;
    }
  }

  var myConfig1a = JSON.parse(JSON.stringify(myConfig1));
  myConfig1a.series = [{values:newSeries}];
  myConfig1a.scaleX.values = labels;


  if (year == 'all') {
    zingchart.exec('chart1', 'setdata', {data: myConfig1a});

    if (trendlineButton.classList.contains('btn-info')) {
      plotTrendline();
    }
  } else {
    filterByYear(myConfig1a, year);  
  }
  
  document.getElementById('chart1-maxValue').innerHTML = (findMaxRevenue(myConfig1a.series[0].values)).formatMoney(2);

  return myConfig1a;
}

/**
 * Zooms in to exactly one year's worth of data and updates the max-revenue and quarter boxes in HTML
 * @param config - The configuration of the chart
 * @param year - The year that chart1 will be focused on, zoomed-to
 */
function filterByYear(config, year) {
  var quarter1 = document.getElementById('quarter1');
  var quarter2 = document.getElementById('quarter2');
  var quarter3 = document.getElementById('quarter3');
  var quarter4 = document.getElementById('quarter4');
  var interval = document.getElementById('date-interval').value;
  var oldConfig = config;

  // Update the chart title to reflect this new interval
  updateTitle();

  if (year == 'all') {
    quarter1.innerHTML = '-------';
    quarter2.innerHTML = '-------';
    quarter3.innerHTML = '-------';
    quarter4.innerHTML = '-------';

    // switch on scrolling if it was previously disabled due to selecting a year other that 'all'
    myConfig1.scrollX = {};

    zingchart.exec('chart1', 'setdata', {data: myConfig1});

    if (interval != 'days') {
      organizeByInterval();
    } else {
      if (document.getElementById('trendline').classList.contains('btn-info')) {
        plotTrendline();
      }
    }

    return;
  }

  var selectedYear = year*1;
  var oldDates = oldConfig.scaleX ? oldConfig.scaleX.values : oldConfig['scale-x']['values'];
  //var oldDates = oldConfig.scaleX.values;
  var oldValues = oldConfig.series[0].values;
  var newConfig = JSON.parse(JSON.stringify(oldConfig));

  // if the selected Interval is anything other than 'days', then we need to parse out the date in each string-value
  var interval = document.getElementById('date-interval').value;
  if (interval != 'days') {
    var endSubstringIndex = oldDates[0].indexOf('-');
    var substring = oldDates[0].substring(0, oldDates[0].indexOf('-'));

    var q1Array = ['']
    var q1 = 0;
    var q2 = 0;
    var q3 = 0;
    var q4 = 0;

    var maxRev = 0;
    var startDateString = '';
    var endDateString = '';
    var startDateNotFound = true;
    var endDateNotFound = true;
    for (var i = 0; i < oldDates.length; i++) {
      var year = oldDates[i].substring(20,oldDates[i].length);
      var month = (new Date(oldDates[i].substring(0,3) + '1, 1900')).getMonth();

      if (year == selectedYear) {
        startDateString = startDateNotFound ? oldDates[i] : startDateString;
        startDateNotFound = false;

        // get Max Revenue from a zoomed-in state, not by parsing over the values array
        if (oldValues[i] > maxRev) {
          maxRev = oldValues[i];
        }

        // now we sum the values from each 'quarter' of this year
        if (month <= 3) {
          q1 += oldValues[i];
        }
        else if (month <= 6) {
          q2 += oldValues[i];
        }
        else if (month <= 9) {
          q3 += oldValues[i];
        }
        else {
          q4 += oldValues[i];
        }
      } else if (year > selectedYear) {
        endDateString = endDateNotFound ? oldDates[i] : endDateString;
        endDateNotFound = false;
      }
    }

    var sDate = new Date('Jan 1 ' + selectedYear);
    var eDate = new Date('Jan 1 ' + (selectedYear + 1));

    newConfig.scaleX.zoomToValues = [startDateString, endDateString];//[sDate.getTime(), eDate.getTime()];

    // disabling scrolling because this will mislead the user if they try to scroll once we have zoomed in on the
    delete newConfig.scrollX;

    zingchart.exec('chart1', 'setdata', {data: newConfig});

    quarter1.innerHTML = (q1).formatMoney(2);
    quarter2.innerHTML = (q2).formatMoney(2);
    quarter3.innerHTML = (q3).formatMoney(2);
    quarter4.innerHTML = (q4).formatMoney(2);
    document.getElementById('chart1-maxValue').innerHTML = maxRev.formatMoney(2);

    var trendlineButton = document.getElementById('trendline');
    if (trendlineButton.classList.contains('btn-info')) {
      plotTrendline();
    }
  }
  else {
    var newDates = [];
    var newValues = [];
    var q1Array = ['']
    var q1 = 0;
    var q2 = 0;
    var q3 = 0;
    var q4 = 0;

    var dateNumericFlag = true;
    if (typeof(oldDates[0]) == 'string') {
      dateNumericFlag = false;
    }
    var maxRev = 0;
    for (var i = 0; i < oldDates.length; i++) {
      var year = dateNumericFlag ? (new Date(oldDates[i])).getFullYear() : oldDates[i].substring(18,oldDates[i].length);
      var month = dateNumericFlag ? (new Date(oldDates[i])).getMonth()+1 : (new Date(oldDates[i].substring(0,3) + '1, 1900')).getMonth()+1;

      if (year == selectedYear) {
        newDates.push(oldDates[i]);
        newValues.push(oldValues[i]);

        // get Max Revenue from a zoomed-in state, not by parsing over the values array
        if (oldValues[i] > maxRev) {
          maxRev = oldValues[i];
        }

        // now we sum the values from each 'quarter' of this year
        if (month <= 3) {
          q1 += oldValues[i];
        }
        else if (month <= 6) {
          q2 += oldValues[i];
        }
        else if (month <= 9) {
          q3 += oldValues[i];
        }
        else {
          q4 += oldValues[i];
        }
      }
    }

    var sDate = new Date('Jan 1 ' + selectedYear);
    var eDate = new Date('Jan 1 ' + (selectedYear + 1));

    // we need to confirm that Jan 1 <selectedYear> exists in the series data before we can zoom to it
    for (var index = 0; index < newConfig.scaleX.values.length; index++) {
      if (newConfig.scaleX.values[index] >= sDate) {
        sDate = newConfig.scaleX.values[index];
        break;
      } else {
      }
    }

    for (var index = 0; index < newConfig.scaleX.values.length; index++) {
      if (newConfig.scaleX.values[index] >= eDate) {
        eDate = newConfig.scaleX.values[index];
        break;
      } else {}
    }
    
    newConfig.scaleX.zoomToValues = [sDate, eDate];

    // disabling scrolling because this will mislead the user if they try to scroll once we have zoomed in on the
    delete newConfig.scrollX;

    zingchart.exec('chart1', 'setdata', {data: newConfig});

    quarter1.innerHTML = (q1).formatMoney(2);
    quarter2.innerHTML = (q2).formatMoney(2);
    quarter3.innerHTML = (q3).formatMoney(2);
    quarter4.innerHTML = (q4).formatMoney(2);
    document.getElementById('chart1-maxValue').innerHTML = maxRev.formatMoney(2);

    var trendlineButton = document.getElementById('trendline');
    if (trendlineButton.classList.contains('btn-info')) {
      plotTrendline();
    }
  }
}

function getAndSetBreakoutData() {
  var xhr = new XMLHttpRequest();
    xhr.open("GET", "breakout_feed.php");
    xhr.addEventListener("load", function() {
      var response = JSON.parse(this.responseText);
      var breakoutDiv = document.getElementById('breakout-data');

    });
    xhr.send();
}

function appendRowsToMonthlyPlansTable(response) {
  var table = document.getElementById('monthlyPlansTable');

  var totalUsers = response.salesCounts.reduce(function(a,b) { return a+b; }, 0);

  myConfig2.series = [];
  var j = 1;
  for (var i = 0; i < response['names'].length; i++) {
    var tableRow = table.insertRow(j++);

    var cell1 = tableRow.insertCell(0);
    cell1.classList.add('col-md-3', 'font-med');
    var planName = response['names'][i];
    planName = planName.charAt(0).toUpperCase() + planName.substring(1);
    cell1.innerHTML = planName;

    var cell2 = tableRow.insertCell(1);
    cell2.classList.add('col-md-3', 'font-med');
    cell2.innerHTML = response['salesCounts'][i];

    var cell3 = tableRow.insertCell(2);
    cell3.classList.add('col-md-3', 'font-med');
    cell3.innerHTML = (response['prices'][i]).formatMoney(2);

    var cell4 = tableRow.insertCell(3);
    cell4.classList.add('col-md-3', 'font-med');
    cell4.innerHTML = (response['totalRevenues'][i]).formatMoney(2);

    myConfig2.series.push(
      {
        values: [response['totalRevenues'][i]*1],
        text: response['names'][i]
      }
    );

    // This sets the default donut-slice to be detached so the user will know which slice they are viewing by default
    // if (i == 0) {
    //   myConfig2.series[0].detached = true;
    // }
  }

  // Append one more table-row that is to be the sum totals of all plans
  var tableRow = table.insertRow(j);
  tableRow.classList.add('thin-border-top');

  var cell4 = tableRow.insertCell(table.size-1);
  cell4.classList.add('col-md-3', 'font-med');
  cell4.innerHTML = response['sumTotal'].formatMoney(2);

  var cell3 = tableRow.insertCell(table.size-1);
  cell3.classList.add('col-md-3', 'font-med');
  cell3.innerHTML = '------';

  // This holds the sum of all the users
  var cell2 = tableRow.insertCell(table.size-1);
  cell2.classList.add('col-md-3', 'font-med');
  cell2.innerHTML = totalUsers;

  var cell1 = tableRow.insertCell(table.size-1);
  cell1.classList.add('col-md-3', 'font-med');
  cell1.innerHTML = 'Sum Total';
}
// #####################################################################################################################

// ###################################### INITIAL PAGE LOAD FUNCTIONS ##################################################
window.onload = function() {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "chart1_feed.php");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.addEventListener("load", function() {
    var data = JSON.parse(this.responseText);

    myConfig1.series[0].values = data.series;
    myConfig1.scaleX.values = data.dates;

    filterByYear(myConfig1, 2015);

    zingchart.render({
      id : 'chart1',
      data : myConfig1,
      height: 400,
      width: '100%'
    });

    setTimeout(function() {
      filterByYear(myConfig1, 2015);
    }, 200);

    document.getElementById('year-selector').options[2].selected = true;

    // Update the chart title to reflect this new interval
    updateTitle();

    // Print the Max Revenue
    document.getElementById('chart1-maxValue').innerHTML = (data.maxRevenue).formatMoney(2);
  });
  xhr.send();


  // Getting data from server to fill in the 'Monthly Plans' table
  var xhr2 = new XMLHttpRequest();
  xhr2.open("GET", "chart_plans.php");
  xhr2.addEventListener("load", function() {
    var response = JSON.parse(this.responseText);
    
    for (var i = 0; i < response['names'].length; i++) { 
      appendOptionToPlanSelector(response['names'][i]);
    }
    var select = document.getElementById('plans-selector');
    var option = document.createElement('option');
    option.text = 'all';
    select.appendChild(option);
  });
  xhr2.send();

  var xhr3 = new XMLHttpRequest();
  xhr3.open("GET", "monthly_plans_feed.php");
  xhr3.addEventListener("load", function() {
    var response = JSON.parse(this.responseText);
    appendRowsToMonthlyPlansTable(response);

    zingchart.render({
      id : 'chart2',
      data : myConfig2,
      height: 400,
      width: '100%'
    });
  });
  xhr3.send();
}
// #####################################################################################################################

// ######################################## CHART CONFIGURATIONS #######################################################
/******************** Chart 1 ********************/
var myConfig1 = {
  type: "area",
  "utc": true, // Must set utc because zingchart pulls from your local computer time
  labels:[{}],
  plotarea:{},
  title:{
    text: "Revenue For Personal Plans\nGrouped by Days"
  },
  plot:{
    aspect: "spline",
    activeArea:true,
    lineWidth:1,
    marker:{
      visible:false
    },
    tooltip:{
      visible: false,
    }
  },
  scaleX:{
    zooming: true,
    transform:{
      type:'date',
      text:'%M %d, %Y'
    },
    tick:{
      visible:false
    },
    refLine:{
      visible:false
    },
    item:{
      fontSize:12
    },
    lineColor:'none'
  },
  scaleY:{
    guide:{
      visible:true
    },
    tick:{
      visible:false
    },
    refLine:{
      visible:false
    },
    item:{
      fontSize:14
    },
    lineColor:'none',
    format:'$%v',
    label: {
    }
  },
  scrollX:{},
  scrollY:{},
  crosshairX:{
    plotLabel:{
      //text:"Recurring Revenue on <br> %scale-key-value is <span style='font-color:green;font-style:bold;'>$%v</span>",
      text:"Recurring Revenue on<br><span style='color:#900;font-size:17px;'>%scale-key-value</span> is <span style='color:#090;font-size:17px;font-weight:bold;'>$%v</span><br><span style='color:#009;font-weight:bold;'>",
      backgroundColor:"#ffffff",
      alpha:0.6,
      textAlpha:1,
      borderAlpha:1,
      decimals:2,
      textAlign:"center",
      fontFamily:"Georgia",
      fontSize:16,
      fontColor:"black",//"#666699",
      padding:"10%",
      borderRadius:"5px",
      callout:true,
      placement:"node-top",
      multiple:true,
      offsetY:-5
    },
    scaleLabel:{
      visible:false
    },
    marker:{
      type:"circle",
      size:5,
      backgroundColor:"white",
      borderColor:"#666699",
      borderWidth:1
    },
    lineColor:"white",
    lineWidth:2
  },
  zoom: {
    label: {
      visible:true,
      alpha: 0.7,
      text:'%kl'
    }
  },
  series : [
    {
      text:'Recurring Revenue',
      maxTrackers:10000, // default maxTrackers is 750. It will turn off tooltips if you have more nodes than this amount.
    }
  ]
};

/******************** Chart 2 ********************/
var myConfig2 = {
  type: 'pie',
  plot:{
    detach: false,
    cursor: 'hand',
    valueBox: {
      fontSize: 14
    },
    slice:100, //creates the donut
    valueBox:{
      decimal: 2,
      thousandsSeparator: ",",
      text: "",             //"%t: <br>$%v", //Value box text.
      placement:'center',   //Value box placement is centered.
      fontColor:'black',
      fontSize:30,
      fontWeight:'normal',
      rules:[
        {
          rule:"%p != 0",
          visible:false
        }
      ]
    },
    tooltip: {
      visible:true,
      text:"%t: $%v -- %npv%",
      decimals: 2,
      thousandsSeparator:","
    },
    onChange:true, // onChange true will listen for changes to re-animate
    onLegend:true, // Will trigger the onLegend change when toggleAction is set to remove
    animation: {
      effect:5,
      speed:360
    }
  },
  plotarea: {
    x: 40
  },
  legend:{
    backgroundColor: 'none',
    align:'left',
    layout:'vertical',
    toggleAction:'remove',
    borderWidth:0,
    marker:{
      borderWidth:0,
      size:7
    },
    item:{
      cursor: 'hand',
      markerStyle:'circle',
      fontColor:'#3f3f3f',
      fontSize:10,
      decimals: 2,
      text:"%t $%v <span style='font-style:italic; color:#cacaca; padding-right:20px;'>( %npv% )</span>"
    }
  },
  scaleR:{
    refAngle:200 // rotates the donut
  }
};



/**
 * Global zingchart events
 * Zingchart Captures events above page level events
 * and zingchart does not capture events per chart basis.
 * It captures events for all charts on the page and
 * will return and the id of the graph which fired the
 * event
 */
// zingchart.node_click = function(p) {
//   var graphId = p.id;

//   switch(graphId) {
//     case 'chart1':
//       break;
//     case 'chart2':
//       displayValueBoxGraph2(p);
//       break;
//     default:
//       break;
//   }
// }

var inAPieSlice = false;
var currentPieIndex = 1;
zingchart.node_mouseover = function(p) {
  var graphId = p.id;

  var plotindexData = zingchart.exec('chart2', 'getobjectinfo', {
    object: 'plot',
    plotindex: p.plotindex
  });

  switch(graphId) {
    case 'chart1': break;
    case 'chart2':
      if (p.plotindex != currentPieIndex) {
        displayValueBoxGraph2(p, plotindexData);
      } else {}//do nothing
      break;
    default: break;
  }
}
zingchart.node_mouseout = function(p) {
  var graphId = p.id;

  switch(graphId) {
    case 'chart1': break;
    case 'chart2': 
      inAPieSlice = false;
      currentPieIndex = p.plotindex;
      break;
    default: break;
  }
}

// ############################## Adding event listeners for graph interactions ########################################
document.getElementById('trendline').addEventListener('click', toggleTrendline);
document.getElementById('date-interval').addEventListener('change', organizeByInterval);
document.getElementById('plans-selector').addEventListener('change', loadPlanToChart);
document.getElementById('year-selector').addEventListener('change', function(ev) {

  // disable the 'years' option under Interval Selector unless user is selection 'all' years.
  var interval = document.getElementById('date-interval');
  interval.options[3].disabled = this.value != 'all';
  if (interval.value != 'days') {
    filterByYear(organizeByInterval(), this.value);
  } else {
    filterByYear(myConfig1, this.value);
  }
});


