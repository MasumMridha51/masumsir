<?php
header("Content-Type: application/json");

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database connection details
$servername = "localhost";
$username = "root"; // Your MySQL username
$password = ""; // Your MySQL password
$dbname = "tuitionfee_app";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Connection failed: ' . $conn->connect_error]));
}

// Get the JSON input
$data = json_decode(file_get_contents("php://input"));

if (isset($data->b_name)) {
    $batchName = $conn->real_escape_string($data->b_name);

    // Prepare and bind
    $stmt = $conn->prepare("INSERT INTO batches (name) VALUES (?)");
    $stmt->bind_param("s", $batchName);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Batch added successfully!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $stmt->error]);
    }
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
}

// Close the connection
$conn->close();
?>
