<?php
header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);

header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, X-Requested-With, X-CSRF-Token");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    header("HTTP/1.1 200 OK");
    exit();
}
session_start();

if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

//Handle CSRF token request
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['csrf-token'])) {
    echo json_encode(['csrfToken' => $_SESSION['csrf_token']]);
    exit;
}
// Return CSRF token in response
if (isset($_GET['csrf-token'])) {
    echo json_encode(['csrfToken' => $_SESSION['csrf_token']]);
    exit();
}

$headers = getallheaders();
error_log("Received Headers: " . print_r($headers, true)); 

// Validate CSRF token for POST requests
$headers = array_change_key_case(getallheaders(), CASE_LOWER);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($headers['x-csrf-token']) || $headers['x-csrf-token'] !== $_SESSION['csrf_token']) {
        http_response_code(403);
        echo json_encode(['error' => 'Invalid CSRF token']);
        exit;
    }
}

// Read JSON request body
$json = file_get_contents('php://input');
$data = json_decode($json, true);
$prompt = $data['prompt'] ?? '';
if (empty($prompt)) {
    http_response_code(400);
    echo json_encode(['error' => 'Prompt is required']);
    exit;
}

// Function to load the .env file
function loadEnv($filePath) {
    if (!file_exists($filePath)) {
        throw new Exception(".env file not found: $filePath");
    }

    $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Ignore comments (lines starting with #)
        if (strpos($line, '#') === 0) {
            continue;
        }

        // Split the line into key-value pairs
        list($key, $value) = explode('=', $line, 2);
        if ($key && $value) {
            putenv("$key=$value");  // Set the environment variable
            $_ENV[$key] = $value;   // Optionally store in the $_ENV superglobal
        }
    }
}

    // Load the .env file
    loadEnv(__DIR__ . '/.env');


  // Call to Horde AI API (you'll need to implement this)
  $imageUrl = generateImage($prompt);

  if ($imageUrl) {
      echo json_encode(['imageUrl' => $imageUrl]);
  } else {
      http_response_code(500);
      echo json_encode(['error' => 'Failed to generate image']);
  }
  exit;

function generateImage($prompt) {
    $baseUrl = 'https://stablehorde.net/api/v2';
    $apiKey = getenv('REACT_APP_API_KEY');  // Retrieve the API key from the environment
    if (!$apiKey) {
        http_response_code(500);
        echo json_encode(['error' => 'API key is missing']);
        exit;
    }

    try {
        // Post async image generation request
        $postData = [
            'prompt' => $prompt,
            'params' => [
                'sampler_name' => 'k_dpmpp_2m',
                'cfg_scale' => 7.5,
                'width' => 512,
                'height' => 512,
                'steps' => 30,
                'karras' => false,
                'post_processing' => ['GFPGAN']
            ]
        ];

        $ch = curl_init("$baseUrl/generate/async");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            "apikey: $apiKey"
        ]);

        $response = curl_exec($ch);
        if (curl_errno($ch)) {
            throw new Exception(curl_error($ch));
        }
        curl_close($ch);
        
        $generation = json_decode($response, true);
        if (!isset($generation['id'])) {
            throw new Exception('Failed to get generation ID');
        }

        // Poll for generation status
        $maxAttempts = 30;
        $attempts = 0;
        do {
            sleep(2); // Wait 2 seconds

            $ch = curl_init("$baseUrl/generate/check/{$generation['id']}");
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ["apikey: $apiKey"]);
            $checkResponse = curl_exec($ch);
            if (curl_errno($ch)) {
                throw new Exception(curl_error($ch));
            }
            curl_close($ch);

            $check = json_decode($checkResponse, true);
            $attempts++;
        } while (!$check['done'] && $attempts < $maxAttempts);

        if ($attempts >= $maxAttempts) {
            throw new Exception('Image generation timed out: MAX Attempts reached');
        }

        //echo "Final check result: " . json_encode($check, JSON_PRETTY_PRINT) . "\n";

       // Get image URL
        $ch = curl_init("$baseUrl/generate/status/{$generation['id']}");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ["apikey: $apiKey"]);
        $statusResponse = curl_exec($ch);
        if (curl_errno($ch)) {
            throw new Exception(curl_error($ch));
        }
        curl_close($ch);

        $status = json_decode($statusResponse, true);
        //echo "Image generation status: " . json_encode($status, JSON_PRETTY_PRINT) . "\n";

        if (!isset($status['generations']) || empty($status['generations'])) {
            throw new Exception('No generations received from AI Horde');
        }

        $imageUrl = $status['generations'][0]['img'] ?? null;
        if (!$imageUrl) {
            throw new Exception('No image URL found in the generation result');
        }

        //echo "Image URL generated: $imageUrl\n";
        return $imageUrl;

    } catch (Exception $error) {
        echo "Error generating image: " . $error->getMessage() . "\n";
        throw $error;
    }
}

// Usage example:
// try {
//     echo "Testing PHP backend\n";
//     $imageUrl = generateImage("A beautiful landscape");
  
// } catch (Exception $e) {
//     echo "Failed to generate image: " . $e->getMessage() . "\n";
// }
