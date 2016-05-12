<?php
    // Database configuration
    $host = "172.0.0.1";
    $port = 3306;
    $usernm = "root";
    $passwd = "";
    $dbname = "mydb";

    // Building up the data
    $time1 = "11/12/10";
    echo "time1 = $time1\r\n";

    $dateTime1 = strtotime($time1);
    echo $dateTime1."\r\n";

    echo date("Y-m-d",$dateTime1);

    // Now what we want to do is to randomly generate each piece of the date string: Month, Day, and Year
    $conn = new mysqli($host, $usernm, $passwd, $dbname, $port);
	    if($conn->connect_error) {
        die('Connect Error:' . $conn->conect_error);
    }
    echo "Connection successfull";

    $plan1Sales = [20,39,74,103,199,330,583];
    $plan2Sales = [4,12,19,24,5,19,38];
    $plan3Sales = [0,6,10,13,11,17,18];
    $plan4Sales = [0,0,1,3,4,6,4];
    $plan5Sales = [0,0,0,3,9,15,27];
    
    $year = 2013;
    $yearCount = 0;
    $monthStart = 1;
    $monthEnd = 6;
    for ($k = 0; $k < count($plan1Sales); $k++) {
        for ($i = 0; $i < $plan1Sales[$k]; $i++) {
            $theDate = ($year+$yearCount) . "-" . rand($monthStart,$monthEnd) . "-" . rand(1,28);
            $sql = "INSERT INTO sales (date, id) VALUES ('" . $theDate . "', 1)";
            if (!mysqli_query($conn, $sql)) { echo "Error desription: " . mysqli_error($conn); }
        }
        if (($k % 2) == 0) {
            $monthStart = 6;
            $monthEnd = 12;
        } else {
            $monthStart = 1;
            $monthEnd = 6;
            $yearCount++;
        }
    }
    $year = 2013;
    $yearCount = 0;
    $monthStart = 1;
    $monthEnd = 6;
    for ($k = 0; $k < count($plan2Sales); $k++) {
        for ($i = 0; $i < $plan2Sales[$k]; $i++) {
            $theDate = ($year+$yearCount) . "-" . rand($monthStart,$monthEnd) . "-" . rand(1,28);
            $sql = "INSERT INTO sales (date, id) VALUES ('" . $theDate . "', 2)";
            if (!mysqli_query($conn, $sql)) { echo "Error desription: " . mysqli_error($conn); }
        }
        if (($k % 2) == 0) {
            $monthStart = 6;
            $monthEnd = 12;
        } else {
            $monthStart = 1;
            $monthEnd = 6;
            $yearCount++;
        }
    }
    $year = 2013;
    $yearCount = 0;
    $monthStart = 1;
    $monthEnd = 6;
    for ($k = 0; $k < count($plan3Sales); $k++) {
        for ($i = 0; $i < $plan3Sales[$k]; $i++) {
            $theDate = ($year+$yearCount) . "-" . rand($monthStart,$monthEnd) . "-" . rand(1,28);
            $sql = "INSERT INTO sales (date, id) VALUES ('" . $theDate . "', 3)";
            if (!mysqli_query($conn, $sql)) { echo "Error desription: " . mysqli_error($conn); }
        }
        if (($k % 2) == 0) {
            $monthStart = 6;
            $monthEnd = 12;
        } else {
            $monthStart = 1;
            $monthEnd = 6;
            $yearCount++;
        }
    }
    $year = 2013;
    $yearCount = 0;
    $monthStart = 1;
    $monthEnd = 6;
    for ($k = 0; $k < count($plan4Sales); $k++) {
        for ($i = 0; $i < $plan4Sales[$k]; $i++) {
            $theDate = ($year+$yearCount) . "-" . rand($monthStart,$monthEnd) . "-" . rand(1,28);
            $sql = "INSERT INTO sales (date, id) VALUES ('" . $theDate . "', 4)";
            if (!mysqli_query($conn, $sql)) { echo "Error desription: " . mysqli_error($conn); }
        }
        if (($k % 2) == 0) {
            $monthStart = 6;
            $monthEnd = 12;
        } else {
            $monthStart = 1;
            $monthEnd = 6;
            $yearCount++;
        }
    }
    $year = 2013;
    $yearCount = 0;
    $monthStart = 1;
    $monthEnd = 6;
    for ($k = 0; $k < count($plan5Sales); $k++) {
        for ($i = 0; $i < $plan5Sales[$k]; $i++) {
            $theDate = ($year+$yearCount) . "-" . rand($monthStart,$monthEnd) . "-" . rand(1,28);
            $sql = "INSERT INTO sales (date, id) VALUES ('" . $theDate . "', 5)";
            if (!mysqli_query($conn, $sql)) { echo "Error desription: " . mysqli_error($conn); }
        }
        if (($k % 2) == 0) {
            $monthStart = 6;
            $monthEnd = 12;
        } else {
            $monthStart = 1;
            $monthEnd = 6;
            $yearCount++;
        }
    }

    $conn->close();

    header('Location: http://examples.zingchart.com/dashboards/php/index.html');
?>