<?php
// Simple endpoint to submit a URL to Google Indexing API.
// Requirements: composer require google/apiclient:^2

header('Content-Type: text/plain; charset=UTF-8');

// 1) Read URL from query
$url = isset($_GET['url']) ? trim($_GET['url']) : '';
if ($url === '') {
    http_response_code(400);
    echo "Error: missing url parameter. Example: ?url=https://sarkaariresult.org/my-job-post.html\n";
    exit;
}
if (!filter_var($url, FILTER_VALIDATE_URL)) {
    http_response_code(400);
    echo "Error: invalid URL.\n";
    exit;
}

// 2) Load Composer autoload (adjust path if your vendor is elsewhere)
$autoload = __DIR__ . '/vendor/autoload.php';
if (!file_exists($autoload)) {
    http_response_code(500);
    echo "Error: Composer autoload not found at {$autoload}. Please install PHP Google API Client (google/apiclient).\n";
    exit;
}
require_once $autoload;

// 3) Configure Google client with service account
try {
    $keyPath = __DIR__ . '/../config/sarkaariresult-indexing-key.json';
    if (!file_exists($keyPath)) {
        http_response_code(500);
        echo "Error: Credentials file not found at {$keyPath}.\n";
        exit;
    }

    $client = new Google_Client();
    $client->setAuthConfig($keyPath);
    $client->setScopes(['https://www.googleapis.com/auth/indexing']);
    $client->setSubject(null); // optional: only if delegated domain-wide authority

    // Fetch access token via JWT assertion
    $client->fetchAccessTokenWithAssertion();
    $tokenInfo = $client->getAccessToken();
    if (!is_array($tokenInfo) || empty($tokenInfo['access_token'])) {
        http_response_code(500);
        echo "Error: Failed to obtain access token.\n";
        exit;
    }
    $accessToken = $tokenInfo['access_token'];

    // 4) Call Google Indexing API (publish)
    $endpoint = 'https://indexing.googleapis.com/v3/urlNotifications:publish';
    $payload = json_encode([
        'url' => $url,
        'type' => 'URL_UPDATED'
    ]);

    $ch = curl_init($endpoint);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $accessToken
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);

    $responseBody = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr  = curl_error($ch);
    curl_close($ch);

    if ($curlErr) {
        http_response_code(500);
        echo "Error: cURL error: {$curlErr}\n";
        exit;
    }

    if ($httpCode < 200 || $httpCode >= 300) {
        http_response_code(502);
        echo "Error: Google Indexing API returned HTTP {$httpCode}. Body: {$responseBody}\n";
        exit;
    }

    // 5) Success
    echo "Success\n";
    exit;
} catch (Throwable $e) {
    http_response_code(500);
    echo 'Error: ' . $e->getMessage() . "\n";
    exit;
}


