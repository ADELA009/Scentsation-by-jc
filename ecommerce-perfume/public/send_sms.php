<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// Africa's Talking API credentials
$username = "sandbox"; // Your Africa's Talking username
$api_key = "atsk_ae2e18300af63eb18b2a6adf02fca001ce524a4f5ef6cd1fae7fb04045b90f7b23114ab5"; // Your Africa's Talking API key
$AT = new AfricasTalkingGateway($username, $api_key);

// Get phone number and message from the request
$phoneNumber = isset($_POST['phoneNumber']) ? $_POST['phoneNumber'] : null;
$message = isset($_POST['message']) ? $_POST['message'] : null;

if ($phoneNumber === null || $message === null) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Phone number and message are required']);
    exit;
}

// Send SMS using Africa's Talking API
try {
    $result = $AT->sendMessage($phoneNumber, $message);
    $responses = $result[0];

    if ($responses->status == "Success") {
        echo json_encode(['success' => true, 'message' => 'SMS sent successfully', 'responses' => $responses]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to send SMS: ' . $responses->status]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to send SMS: ' . $e->getMessage()]);
}

// Africa's Talking gateway class
class AfricasTalkingGateway {
    protected $_username;
    protected $_apiKey;

    protected $_baseUrl = 'https://api.africastalking.com/version1/';

    protected $_requestTimeout = 30;

    const SMS_URL = 'messaging';

    public function __construct($username, $apiKey) {
        $this->_username = $username;
        $this->_apiKey   = $apiKey;
    }

    protected function makeRequest($url, $params, $method = 'POST') {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'Content-Type: application/x-www-form-urlencoded',
            'Accept: application/json',
            'apikey: ' . $this->_apiKey
        ));

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_TIMEOUT, $this->_requestTimeout);

        if ($method == 'POST') {
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
        } else {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');
        }

        $responseBody = curl_exec($ch);

        if (curl_errno($ch)) {
            throw new Exception('Curl error: ' . curl_error($ch));
        }

        $responseCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        curl_close($ch);

        if ($responseCode >= 200 && $responseCode < 300) {
            return json_decode($responseBody);
        } else {
            throw new Exception('HTTP error: ' . $responseCode . ' ' . $responseBody);
        }
    }

    public function sendMessage($recipients, $message) {
        $params = array(
            'username' => $this->_username,
            'to'       => $recipients,
            'message'  => $message
        );

        $url = $this->_baseUrl . self::SMS_URL;
        return $this->makeRequest($url, $params);
    }
}
?>