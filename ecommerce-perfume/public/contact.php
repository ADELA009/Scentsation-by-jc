<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = htmlspecialchars(trim($_POST["name"]));
    $email = htmlspecialchars(trim($_POST["email"]));
    $message = htmlspecialchars(trim($_POST["message"]));

    // Debugging statements
    error_log("Form submitted: Name = $name, Email = $email, Message = $message");

    $to = "adeyekunadelola2009@gmail.com"; // Replace with your email address
    $subject = "New Contact Form Submission from $name";
    $body = "Name: $name\nEmail: $email\n\nMessage:\n$message";
    $headers = "From: $email";

    if (mail($to, $subject, $body, $headers)) {
        error_log("Mail sent successfully to $to");
        echo "<script>alert('Message sent successfully!'); window.location.href = 'contact.html';</script>";
    } else {
        error_log("Failed to send mail to $to");
        echo "<script>alert('Failed to send message. Please try again.'); window.location.href = 'contact.html';</script>";
    }
} else {
    header("Location: contact.html");
    exit();
}
?>