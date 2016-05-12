<?php
    // Database configuration
    $host = "172.0.0.1";
    $port = 3306;
    $usernm = "root";
    $passwd = "";
    $dbname = "mydb";

     $plan = $_GET["plan"] ? $_GET["plan"] : "personal";

     $response = array();
     $milliConversion = 1000;

    // // Connect to the database
     $mysqli = new mysqli($host, $usernm, $passwd, $dbname, $port);
     if($mysqli->connect_error) {
       die('Connect Error (' . $mysqli->connect_errno . ')' . $mysqli->connect_error);
     }

     if (strcmp($plan, "all") !== 0) {
         $query = "SELECT COUNT(*), sales.date, plans.cost FROM sales INNER JOIN plans ON sales.id=plans.id WHERE plans.name='".$plan."' GROUP BY sales.date ORDER BY sales.date";
         $dates = []; // Array to hold our date-values/x-axis-labels
         $prices = []; // Array to hold our price/series values
         $quantitySold = []; // Array to hold 
         $revenue = [];// Array to hold the revenue for each day
         $calc = 0;
         $maxRevenue = -1;// Float that will hold the maximum revenue for any given day
       
         // Run the query
         if ($result = $mysqli->query($query)) {

             /* Fetch the result row as a numeric array */
             while( $row = $result->fetch_array(MYSQLI_NUM)){
                 array_push($dates, strtotime($row[1])*$milliConversion);
                 $calc = ($row[0]*1) * ($row[2]*1);
                 array_push($revenue, $calc);
                 if ($calc >= $maxRevenue) {
                     $maxRevenue = $calc;
                 }
             }

             // Free the result set
             $result->close();
             $seriesData = array_map(NULL, $dates, $revenue);
             $response = array(
                 series => $revenue,
                 dates => $dates,
                 maxRevenue => $maxRevenue
             );
         }
         echo json_encode($response);
         $mysqli->close(); 
     }
    else {
        $queryAll = "SELECT date,cost,name FROM sales INNER JOIN plans ON sales.id=plans.id ORDER BY sales.date";
        $dates = [];
        $names = [];
        $costs = [];

         if ($result = $mysqli->query($queryAll)) {
             while( $row = $result->fetch_array(MYSQLI_NUM)){
                 array_push($dates, strtotime($row[0])*$milliConversion);
                 array_push($costs, $row[1]*1);
                 array_push($names, $row[2]);
             }
             $result->close();
         }

         // Now that we have ALL THE DATA, we need to cluster them into like pieces, namely on matching dates
         $seriesData = [];
         $currentDate = $dates[0];
         $seriesDates = [$currentDate];
         $sum = $costs[0];

         //echo "$seriesDates";
        for ($i = 1; $i < count($dates); $i++) {
            if ($dates[$i] <= $currentDate) {
                $sum += $costs[$i];
            } else {
                array_push($seriesData, $sum);
                array_push($seriesDates, $currentDate);
                $currentDate = $dates[$i];
                $sum = 0;
            }
        }

        // Calculate the max value in this clustered array
        $maxRevenue = 0;
        for ($index = 0; $index < count($seriesData); $index++) {
            if ($seriesData[$index] > $maxRevenue) {
                $maxRevenue = $seriesData[$index];
            }
        }

        $response = array(
            series => $seriesData,
            dates => $seriesDates,
            maxRevenue => $maxRevenue
        );

        echo json_encode($response);
        $mysqli->close(); 
    }

    //echo json_encode($response);
    //$mysqli->close(); 
  
?>
