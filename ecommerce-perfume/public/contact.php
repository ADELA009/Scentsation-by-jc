<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST["name"];
    $email = $_POST["email"];
    $message = $_POST["message"];

    // Replace with your email address
    $to = "adeyekunadelola2009@gmail.com";  // Replace with your actual email

    $subject = "Contact Form Submission from Scentsation by JC";
    $body = "Name: " . $name . "\r\n" .
            "Email: " . $email . "\r\n" .
            "Message:\r\n" . $message;

    $headers = "From: " . $email . "\r\n" .
               "Reply-To: " . $email . "\r\n" .
               "X-Mailer: PHP/" . phpversion();

    if (mail($to, $subject, $body, $headers)) {
        echo "Thank you for your message! We will get back to you soon.";
    } else {
        echo "Oops! Something went wrong and we couldn't send your message.";
    }
} else {
    echo "There was a problem with your submission, please try again.";
}
?>