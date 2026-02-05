<?php
// ===== process.php =====
// This file receives the form data, validates it server-side,
// sanitises inputs, and stores them in a MySQL database.

// ===== 1. DATABASE CONNECTION =====
// These would normally go in a separate config file
$host     = "localhost";
$dbname   = "myapp_db";
$username = "root";
$password = "";              // empty for local XAMPP/WAMP

// mysqli_connect() creates the connection
$conn = mysqli_connect($host, $username, $password, $dbname);

// If connection fails, stop and show error
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

// ===== 2. CHECK REQUEST METHOD =====
// Only process if the form was submitted via POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // ===== 3. RETRIEVE & SANITISE INPUTS =====
    // htmlspecialchars() converts < > & " ' to HTML entities — prevents XSS
    // trim() removes leading/trailing whitespace

    $fullname         = htmlspecialchars(trim($_POST['fullname']));
    $email            = htmlspecialchars(trim($_POST['email']));
    $password         = trim($_POST['password']);           // don't htmlspecialchars passwords
    $confirmPassword  = trim($_POST['confirmPassword']);
    $dob              = htmlspecialchars(trim($_POST['dob']));
    $role             = htmlspecialchars(trim($_POST['role']));
    $gender           = htmlspecialchars(trim($_POST['gender']));
    $terms            = isset($_POST['terms']) ? 'yes' : 'no';  // checkbox: only in POST if checked

    // ===== 4. SERVER-SIDE VALIDATION =====
    // Never trust client-side validation alone — always re-validate on server

    $errors = [];  // array to collect all error messages

    // --- Full Name: required, letters and spaces only ---
    if (empty($fullname)) {
        $errors[] = "Full name is required.";
    } elseif (!preg_match('/^[A-Za-z\s]{2,}$/', $fullname)) {
        $errors[] = "Full name must contain only letters.";
    }

    // --- Email: required, must be valid format ---
    if (empty($email)) {
        $errors[] = "Email is required.";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        // filter_var with FILTER_VALIDATE_EMAIL is PHP's built-in email check
        $errors[] = "Invalid email format.";
    }

    // --- Password: required, minimum 6 characters ---
    if (empty($password)) {
        $errors[] = "Password is required.";
    } elseif (strlen($password) < 6) {
        $errors[] = "Password must be at least 6 characters.";
    }

    // --- Confirm Password: must match password ---
    if ($password !== $confirmPassword) {
        $errors[] = "Passwords do not match.";
    }

    // --- Date of Birth: required, not in the future ---
    if (empty($dob)) {
        $errors[] = "Date of birth is required.";
    } else {
        $dobDate  = new DateTime($dob);
        $today    = new DateTime('today');
        if ($dobDate > $today) {
            $errors[] = "Date of birth cannot be in the future.";
        }
    }

    // --- Role: must not be empty ---
    if (empty($role)) {
        $errors[] = "Please select a role.";
    }

    // --- Gender: must not be empty ---
    if (empty($gender)) {
        $errors[] = "Please select a gender.";
    }

    // --- Terms: must be agreed to ---
    if ($terms !== 'yes') {
        $errors[] = "You must agree to the terms.";
    }

    // --- Email: must not already exist in database (uniqueness check) ---
    $checkSql    = "SELECT id FROM users WHERE email = ?";
    $checkStmt   = mysqli_prepare($conn, $checkSql);
    mysqli_stmt_bind_param($checkStmt, "s", $email);  // "s" = string
    mysqli_stmt_execute($checkStmt);
    $checkResult = mysqli_stmt_get_result($checkStmt);

    if (mysqli_num_rows($checkResult) > 0) {
        $errors[] = "This email is already registered.";
    }
    mysqli_stmt_close($checkStmt);

    // ===== 5. IF ERRORS EXIST, STOP AND SHOW THEM =====
    if (!empty($errors)) {
        mysqli_close($conn);
        // Join all errors into one string, separated by <br>
        echo "<script>
            document.getElementById('message').className = 'message error-msg';
            document.getElementById('message').innerHTML = '" . implode('<br>', $errors) . "';
        </script>";
        // Re-include the form so the user stays on the same page
        include 'index.html';
        exit;  // stop script execution
    }

    // ===== 6. HASH THE PASSWORD =====
    // NEVER store plain-text passwords!
    // password_hash() uses bcrypt by default
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    // ===== 7. INSERT INTO DATABASE (using Prepared Statement) =====
    // Prepared statements protect against SQL Injection
    $sql = "INSERT INTO users (fullname, email, password, dob, role, gender, terms)
            VALUES (?, ?, ?, ?, ?, ?, ?)";

    $stmt = mysqli_prepare($conn, $sql);

    // Bind variables to the statement
    // s = string, s = string, s = string, s = date string, s = string, s = string, s = string
    mysqli_stmt_bind_param($stmt, "sssssss",
        $fullname,
        $email,
        $hashedPassword,    // store the HASHED version
        $dob,
        $role,
        $gender,
        $terms
    );

    // Execute the statement
    if (mysqli_stmt_execute($stmt)) {
        // ===== 8. SUCCESS =====
        mysqli_stmt_close($stmt);
        mysqli_close($conn);

        // Redirect back to the form with a success message
        // session_start() must be the very first thing if used
        session_start();
        $_SESSION['message'] = "Registration successful! Welcome, " . $fullname . ".";
        $_SESSION['msg_type'] = 'success';
        header("Location: index.html");  // redirect
        exit;

    } else {
        // ===== 9. DATABASE ERROR =====
        echo "Database error: " . mysqli_stmt_error($stmt);
        mysqli_stmt_close($stmt);
        mysqli_close($conn);
        exit;
    }

} else {
    // If someone accesses process.php directly without POST
    echo "Invalid request.";
}
?>