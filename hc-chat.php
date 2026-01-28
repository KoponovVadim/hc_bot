<?php
// hc-chat.php — обработчик заявок Hangcha для Joomla 3
// Подключайте через шаблон, POST-запросы от JS

header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!$data || !isset($data['answers'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No data']);
    exit;
}

// TODO: здесь добавить отправку письма или запись в БД
// Пример: mail($to, $subject, $body);

// Ответ клиенту
echo json_encode(['success' => true]);
