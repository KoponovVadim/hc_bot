<?php
/**
 * hc-chat.php
 * Обработчик заявок из чат-воронки Hangcha
 * Joomla 3
 * Файл расположен в:
 * /templates/trendshop/hc_bot/hc-chat.php
 */

// ---------------------------------------------------------------------
// ИНИЦИАЛИЗАЦИЯ JOOMLA
// ---------------------------------------------------------------------

define('_JEXEC', 1);

// Корень Joomla: /home/amkodor/hc-russia.ru/docs/
define('JPATH_BASE', dirname(__FILE__) . '/../../../');

require_once JPATH_BASE . 'includes/defines.php';
require_once JPATH_BASE . 'includes/framework.php';

$app = JFactory::getApplication('site');
$app->initialise();

// ---------------------------------------------------------------------
// ПРОВЕРКА МЕТОДА
// ---------------------------------------------------------------------

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// ---------------------------------------------------------------------
// ПОЛУЧЕНИЕ JSON
// ---------------------------------------------------------------------

$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data || !is_array($data)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

// ---------------------------------------------------------------------
// ПОИСК КОНТАКТА
// ---------------------------------------------------------------------

$contact = '';
foreach ($data as $key => $value) {
    if (
        mb_stripos($key, 'контакт') !== false ||
        mb_stripos($key, 'телефон') !== false ||
        mb_stripos($key, 'email') !== false
    ) {
        $contact = trim($value);
        break;
    }
}

if ($contact === '') {
    http_response_code(422);
    echo json_encode(['error' => 'Contact is required']);
    exit;
}

// ---------------------------------------------------------------------
// ФОРМИРОВАНИЕ ПИСЬМА
// ---------------------------------------------------------------------

$lines   = [];
$lines[] = 'Новая заявка с чат-воронки Hangcha';
$lines[] = 'Сайт: hc-russia.ru';
$lines[] = 'Дата: ' . date('d.m.Y H:i');
$lines[] = '-----------------------------------';

foreach ($data as $key => $value) {
    if (is_array($value)) continue;
    $lines[] = $key . ': ' . trim($value);
}

$body = implode("\n", $lines);

// ---------------------------------------------------------------------
// ОТПРАВКА EMAIL
// ---------------------------------------------------------------------

$mailer = JFactory::getMailer();

// ВАЖНО: почта должна существовать на домене
$mailer->setSender([
    'no-reply@hc-russia.ru',   // <-- ОБЯЗАТЕЛЬНО существующий ящик или алиас
    'Hangcha HC Russia'
]);

// КУДА ПРИХОДЯТ ВСЕ ЗАЯВКИ
$mailer->addRecipient('sales@hc-russia.ru'); // <-- ОСНОВНАЯ ПОЧТА

// Если пользователь оставил email — можно ответить
if (filter_var($contact, FILTER_VALIDATE_EMAIL)) {
    $mailer->addReplyTo($contact);
}

$mailer->setSubject('Новая заявка с чат-воронки Hangcha');
$mailer->setBody($body);

$send = $mailer->Send();

if ($send !== true) {
    http_response_code(500);
    echo json_encode(['error' => 'Mail send failed']);
    exit;
}

// ---------------------------------------------------------------------
// OK
// ---------------------------------------------------------------------

echo json_encode(['success' => true]);
