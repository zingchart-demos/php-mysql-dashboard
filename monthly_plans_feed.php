<?php
	$host = "172.0.0.1";
    $port = 3306;
    $usernm = "root";
    $passwd = "";
    $dbname = "mydb";

  $mysqli = new mysqli($host, $usernm, $passwd, $dbname, $port);
  if($mysqli->connect_error) {
    die("Connect Error (" . $mysqli->connect_errno . ")" . $mysqli->connect_error);
  }

  $plan_metadata_query = "SELECT COUNT(*),plans.name, plans.cost FROM sales INNER JOIN plans ON sales.id=plans.id GROUP BY sales.id";
  $salesCounts = [];
  $planNames = [];
  $planCosts = [];
  $totalRevenues = [];
  if ($result = $mysqli->query($plan_metadata_query)) {
    // Fetch the result row as a numeric array
    while( $row = $result->fetch_array(MYSQLI_NUM)){
      array_push($salesCounts, $row[0]*1);
      array_push($planNames, $row[1]);
      array_push($planCosts, $row[2]*1);
      array_push($totalRevenues, $row[2] * $row[0]);
    }
    // Free the result set
    $result->close();
  }

  $mysqli->close();

  $sumTotal = 0;
  for ($i = 0; $i < count($totalRevenues); $i++) {
  	$sumTotal += $totalRevenues[$i];
  }

  $data = array(
		names => $planNames,
		salesCounts => $salesCounts,
		prices => $planCosts,
		totalRevenues => $totalRevenues,
		sumTotal => $sumTotal
  );

   echo json_encode($data);

?>