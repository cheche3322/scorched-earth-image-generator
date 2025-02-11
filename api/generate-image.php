<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $prompt = $input['prompt'] ?? '';
    $email = $input['email'] ?? '';

    if (empty($prompt) || empty($email)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid input']);
        exit;
    }

    $apiKey = '766ce50e9fe13ce5f8345fcebb1a7bd2'; // Replace with your Stability AI API Key
    $apiUrl = 'https://api.stability.ai/v2beta/stable-image/generate/sd3';

    $data = [
        'prompt' => $prompt,
        'output_format' => 'jpeg'
    ];

    $headers = [
        'Authorization: Bearer ' . $apiKey,
        'Accept: image/*',
        'Content-Type: application/json'
    ];

    $ch = curl_init($apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

    $response = curl_exec($ch);

    if (curl_errno($ch) || !$response) {
        http_response_code(500);
        echo json_encode(['error' => 'Image generation failed']);
        exit;
    }

    curl_close($ch);

    header('Content-Type: image/jpeg');
    echo $response;
    exit;
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}
?>
