<?php
    // Database configuration 
    $host = "172.0.0.1";
    $port = 3306;
    $usernm = "root";
    $passwd = "";
    $dbname = "mydb";

    //$response = array(info => "yessir");

    //echo "does this work?";
    //echo json_encode($response);

    $plans_query = "SELECT id, name, expected FROM plans";

    // container for available plans from DB
    $planNames = [];
    $planIds = [];
    $plansExpected = [];

    // Connect to the database
    $mysqli = new mysqli($host, $usernm, $passwd, $dbname, $port);
    if($mysqli->connect_error) {
      die("Connect Error (" . $mysqli->connect_errno . ")" . $mysqli->connect_error);
    }

    // Run the query
    if ($result = $mysqli->query($plans_query)) {

      // Fetch the result row as a numeric array
      while( $row = $result->fetch_array(MYSQLI_NUM)){
        array_push($planIds, $row[0]);
        array_push($planNames, $row[1]);
        array_push($plansExpected, $row[2]);
      }

      // Free the result set
      $result->close();
    }

    $mysqli->close();

    $data = array(
  		ids => $planIds,
			names => $planNames,
			expecteds => $plansExpected
    );

     echo json_encode($data);

?>