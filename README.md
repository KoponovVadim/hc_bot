
# Hangcha B2B Chat-Funnel Widget (Joomla 3)

Интерактивный чат-виджет для подбора техники Hangcha, адаптирован для Joomla 3.

## Установка
1. Скопируйте файлы:
	- `hc-chat.js` — логика и UI чата
	- `hc-chat.css` — стили
	- `hc-chat.php` — PHP-обработчик (в корень сайта или отдельную папку)
	- `hc-chat.html` — HTML-разметка виджета
2. В шаблоне Joomla подключите:
	```html
	<link rel="stylesheet" href="/path/to/hc-chat.css">
	<script src="/path/to/hc-chat.js"></script>
	```
3. Вставьте HTML-разметку из `hc-chat.html` в шаблон Joomla (например, в `<body>` или в модуль).
4. Убедитесь, что путь к hc-chat.php в JS совпадает с реальным расположением файла.

## Как работает отправка
- После заполнения формы данные отправляются AJAX-запросом (POST) на hc-chat.php в формате JSON.
- PHP-скрипт может отправлять письмо, сохранять в БД или просто возвращать success.

## Пример интеграции
В шаблоне Joomla (index.php):
```php
<link rel="stylesheet" href="/templates/your_template/hc-chat.css">
<script src="/templates/your_template/hc-chat.js"></script>
```

Затем вставьте разметку виджета:
```html
<!-- Кнопка открытия чата -->
<button id="chatOpenBtn" class="chat-open-btn">💬 Подобрать технику</button>

<!-- Виджет чата -->
<div id="chatWidget" class="chat-widget closed">
  <div class="chat-header">
    <span class="chat-title">Hangcha Chat</span>
    <button id="chatCloseBtn" class="chat-close-btn">✕</button>
  </div>
  <div id="chatMessages" class="chat-messages" tabindex="0"></div>
  <form id="chatInputArea" class="chat-input-area" style="display:none;">
    <input id="chatInput" type="text" placeholder="">
    <button id="chatSendBtn" type="submit" disabled>Отправить</button>
  </form>
</div>
```

## Доработка отправки
В файле hc-chat.php реализуйте нужную логику (отправка email, запись в БД и т.д.)

## Лицензия
Только для внутреннего использования компанией-заказчиком. Коммерческое распространение запрещено без согласования.
