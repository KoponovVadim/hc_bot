<?php
// hc-chat.php — Hangcha chatbot handler
// Works WITH and WITHOUT AI token (Replicate GPT-4.1 mini)

header('Content-Type: application/json; charset=utf-8');

/* ======================
   LOGGING
====================== */
$LOG_FILE = __DIR__ . '/hc-chat.log';

function log_msg($msg) {
  global $LOG_FILE;
  $line = '[' . date('Y-m-d H:i:s') . '] ' . $msg . PHP_EOL;
  file_put_contents($LOG_FILE, $line, FILE_APPEND);
}

log_msg('--- REQUEST START ---');

/* ======================
   METHOD CHECK
====================== */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  log_msg('Invalid method: ' . $_SERVER['REQUEST_METHOD']);
  http_response_code(405);
  echo json_encode(['error' => 'Method not allowed']);
  exit;
}

/* ======================
   INPUT
====================== */
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data || !is_array($data)) {
  log_msg('Invalid JSON input');
  http_response_code(400);
  echo json_encode(['error' => 'Invalid JSON']);
  exit;
}

log_msg('Payload: ' . json_encode($data, JSON_UNESCAPED_UNICODE));

/* ======================
   CONFIG
====================== */
$TO_EMAIL = 'ar@deluxmedia.ru';
$SUBJECT  = 'Заявка с hc-russia.ru';

/* === AI TOKEN (OPTIONAL) === */
$REPLICATE_API_TOKEN = ''; 
$AI_ENABLED = !empty($REPLICATE_API_TOKEN);

/* ======================
   AI SUMMARY
====================== */
function ai_summary(array $data, string $token) {
  if (!$token) return null;

  unset($data['url'], $data['__meta']);

  $prompt = <<<PROMPT
Ты опытный менеджер по продажам складской и погрузочной техники Hangcha.

Задача:
На основе данных клиента кратко и живо оформить заявку
так, как если бы менеджер писал её руководителю по почте.

ВАЖНО:
Ответ должен быть отформатирован с ЯВНЫМИ ПЕРЕНОСАМИ СТРОК.
Каждый блок — с новой строки.
Между блоками — пустая строка.

Формат ответа (строго соблюдать):

Кто:
(текст)

Откуда:
(текст)

Что хочет:
(текст)

Контакт:
(текст)

Правила:
- Используй ТОЛЬКО переданные данные
- Ничего не выдумывай
- Без списков и JSON
- 4–7 предложений
- Строго соблюдай переносы строк

Входные данные клиента:
PROMPT;

  $prompt .= "\n" . json_encode($data, JSON_UNESCAPED_UNICODE);

  $payload = [
    'input' => [
      'prompt' => $prompt,
      'temperature' => 0.2,
      'max_completion_tokens' => 300
    ]
  ];

  $ch = curl_init('https://api.replicate.com/v1/models/openai/gpt-4.1-mini/predictions');
  curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
      "Authorization: Bearer {$token}",
      "Content-Type: application/json"
    ],
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_TIMEOUT => 10
  ]);

  $response = curl_exec($ch);
  curl_close($ch);

  if (!$response) {
    log_msg('AI: no response');
    return null;
  }

  $prediction = json_decode($response, true);
  if (empty($prediction['urls']['get'])) {
    log_msg('AI: no status URL');
    return null;
  }

  $statusUrl = $prediction['urls']['get'];
  log_msg('AI prediction created');

  for ($i = 0; $i < 10; $i++) {
    usleep(500000);

    $ch = curl_init($statusUrl);
    curl_setopt_array($ch, [
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_HTTPHEADER => [
        "Authorization: Bearer {$token}"
      ],
      CURLOPT_TIMEOUT => 10
    ]);

    $res = curl_exec($ch);
    curl_close($ch);

    if (!$res) continue;

    $json = json_decode($res, true);
    if (($json['status'] ?? '') === 'succeeded' && !empty($json['output'])) {
      log_msg('AI success');
      return trim(implode('', $json['output']));
    }

    if (($json['status'] ?? '') === 'failed') {
      log_msg('AI failed');
      return null;
    }
  }

  log_msg('AI timeout');
  return null;
}

/* ======================
   BUILD MESSAGE
====================== */
$summary = null;

if ($AI_ENABLED) {
  log_msg('AI enabled');
  $summary = ai_summary($data, $REPLICATE_API_TOKEN);
} else {
  log_msg('AI disabled, fallback mode');
}

if ($summary) {
  $message = "Новая заявка:\n\n" . $summary;
} else {
  log_msg('Using fallback message');

  $lines = [];

  if (!empty($data['Имя'])) {
    $line = 'Кто: ' . $data['Имя'];
    if (!empty($data['Компания']) && $data['Компания'] !== 'не указано') {
      $line .= ' (' . $data['Компания'] . ')';
    }
    $lines[] = $line;
  }

  if (!empty($data['Город'])) {
    $lines[] = "\nОткуда:\n" . $data['Город'];
  }

  $lines[] = "\nЧто хочет:";
  foreach ($data as $key => $value) {
    if (in_array($key, ['Имя','Компания','Город','Контакт','url'])) continue;
    if ($value === '' || $value === 'не указано') continue;
    $lines[] = '- ' . $key . ': ' . $value;
  }

  if (!empty($data['Контакт'])) {
    $lines[] = "\nКонтакт:\n" . $data['Контакт'];
  }

  $message = implode("\n", $lines);
}

/* ======================
   SEND EMAIL
====================== */
$headers  = "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "From: HC Chat <no-reply@" . $_SERVER['SERVER_NAME'] . ">\r\n";

log_msg('Sending email');

$sent = mail(
  $TO_EMAIL,
  $SUBJECT,
  $message,
  $headers
);

log_msg('mail() result: ' . var_export($sent, true));

if (!$sent) {
  log_msg('Mail failed');
  http_response_code(500);
  echo json_encode(['error' => 'Mail failed']);
  exit;
}

log_msg('Mail sent successfully');
log_msg('--- REQUEST END ---');

echo json_encode(['success' => true]);

