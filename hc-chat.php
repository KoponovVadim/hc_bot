<?php
// hc-chat.php — обработчик заявок Hangcha (Joomla-safe)

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['error' => 'Method not allowed']);
  exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data || !is_array($data)) {
  http_response_code(400);
  echo json_encode(['error' => 'Invalid JSON']);
  exit;
}

/* ======================
   CONFIG
   ====================== */
$TO_EMAIL = 'sales@hc-russia.ru'; // ← НУЖНЫЙ EMAIL
$SUBJECT  = 'Заявка с hc-russia.ru';

/* ======================
   BUILD MESSAGE
   ====================== */
$lines = [];

foreach ($data as $key => $value) {
  if ($value === '') continue;
  $label = htmlspecialchars($key, ENT_QUOTES | ENT_HTML5, 'UTF-8');
  $val   = htmlspecialchars($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
  $lines[] = "$label: $val";
}

if (!$lines) {
  http_response_code(400);
  echo json_encode(['error' => 'Empty payload']);
  exit;
}

$message = implode("\n", $lines);

/* ======================
   SEND EMAIL
   ====================== */
$headers = [
  'MIME-Version: 1.0',
  'Content-Type: text/plain; charset=UTF-8',
  'From: hc-russia.ru <no-reply@hc-russia.ru>'
];

$sent = mail(
  $TO_EMAIL,
  $SUBJECT,
  $message,
  implode("\r\n", $headers)
);

if (!$sent) {
  http_response_code(500);
  echo json_encode(['error' => 'Mail failed']);
  exit;
}

echo json_encode(['success' => true]);