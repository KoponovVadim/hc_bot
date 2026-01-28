// Hangcha Chat Widget JS (Joomla-ready)
// Подключите <script src="/path/to/hc-chat.js"></script> в шаблон Joomla
// Требует наличия разметки из hc-chat.html и стилей hc-chat.css

document.addEventListener('DOMContentLoaded', function() {
    // Все сценарии структурированы, id уникальны, ветки не пересекаются
    const steps = [
      // 1️⃣ ВЕТКА: Приветствие и выбор сценария
      {
        id: 'welcome',
        bot: 'Привет! Я помогу подобрать вилочный погрузчик или складскую технику. С чего начнём?',
        options: [
          { value: 'pick', label: 'Подобрать погрузчик' },
          { value: 'stock', label: 'Проверить наличие' },
          { value: 'warehouse', label: 'Складская техника (штабелёры, ричтраки и т.д.)' },
          { value: 'service', label: 'Сервис, запчасти, АКБ' },
          { value: 'question', label: 'Задать вопрос менеджеру' }
        ],
        answerKey: 'start',
        next: function() {
          switch(userAnswers['start']) {
            case 'pick': return 'pick_intro';
            case 'stock': return 'stock_intro';
            case 'warehouse': return 'warehouse_intro';
            case 'service': return 'service_intro';
            case 'question': return 'question_intro';
            default: return 'pick_intro';
          }
        }
      },
      // 2️⃣ ВЕТКА: Подобрать погрузчик
      {
        id: 'pick_intro',
        bot: 'Отлично. Давайте подберём технику под ваши условия. Это займёт 1–2 минуты.',
        next: 'pick_engine'
      },
      {
        id: 'pick_engine',
        bot: 'Укажите тип двигателя',
        options: [
          { value: 'Электрический', label: 'Электрический' },
          { value: 'Бензиновый', label: 'Бензиновый' },
          { value: 'Дизельный', label: 'Дизельный' }
        ],
        answerKey: 'Тип двигателя',
        next: 'pick_place'
      },
      {
        id: 'pick_place',
        bot: 'Где в основном будет работать погрузчик?',
        options: [
          { value: 'В помещении', label: 'В помещении' },
          { value: 'На улице', label: 'На улице' },
          { value: 'И там и там', label: 'И там и там' },
          { value: 'Пока не знаю', label: 'Пока не знаю' }
        ],
        answerKey: 'Место работы',
        next: 'pick_weight'
      },
      {
        id: 'pick_weight',
        bot: 'Какой максимальный вес груза нужно поднимать?',
        options: [
          { value: '1,5 т', label: '1,5 т' },
          { value: '1,8–2 т', label: '1,8–2 т' },
          { value: '2,5–3 т', label: '2,5–3 т' },
          { value: '3,5–5 т', label: '3,5–5 т' },
          { value: '7 т и более', label: '7 т и более' }
        ],
        answerKey: 'Макс. вес',
        next: 'pick_height'
      },
      {
        id: 'pick_height',
        bot: 'На какую высоту нужно поднимать груз?',
        options: [
          { value: 'До 3 м', label: 'До 3 м' },
          { value: '4–4,5 м', label: '4–4,5 м' },
          { value: '5–6 м', label: '5–6 м' },
          { value: '7 м и выше', label: '7 м и выше' },
          { value: 'Не знаю', label: 'Не знаю' }
        ],
        answerKey: 'Высота подъёма',
        next: function() {
          return userAnswers['Высота подъёма'] === 'Не знаю' ? 'pick_height_hint' : 'pick_intensity';
        }
      },
      {
        id: 'pick_height_hint',
        bot: 'Ничего страшного — подберём по стеллажам и складу.',
        next: 'pick_intensity'
      },
      {
        id: 'pick_intensity',
        bot: 'Как планируется использовать технику?',
        options: [
          { value: '1 смена', label: '1 смена' },
          { value: '2 смены', label: '2 смены' },
          { value: '24/7', label: '24/7' },
          { value: 'Пока не знаю', label: 'Пока не знаю' }
        ],
        answerKey: 'Интенсивность',
        next: 'pick_city'
      },
      {
        id: 'pick_city',
        bot: 'В какой город нужна поставка?',
        input: {
          type: 'text',
          placeholder: 'Город / регион'
        },
        answerKey: 'Город',
        next: 'pick_contact_way'
      },
      {
        id: 'pick_contact_way',
        bot: 'Как удобнее получить предложение?',
        options: [
          { value: 'Телефон', label: 'Телефон' },
          { value: 'Telegram', label: 'Telegram' },
          { value: 'Email', label: 'Email' }
        ],
        answerKey: 'Способ связи',
        next: 'pick_contact_value'
      },
      {
        id: 'pick_contact_value',
        bot: 'Оставьте контакт для связи:',
        input: {
          type: 'text',
          placeholder: 'Телефон, Telegram или Email'
        },
        answerKey: 'Контакт',
        next: 'pick_final'
      },
      {
        id: 'pick_final',
        bot: 'Спасибо! Передал задачу специалисту — скоро свяжемся и предложим оптимальные варианты.',
        summary: true
      },
      // 3️⃣ ВЕТКА: Проверить наличие
      {
        id: 'stock_intro',
        bot: 'Проверим наличие на складе. Какая модель техники интересует?',
        input: {
          type: 'text',
          placeholder: 'Укажите модель'
        },
        answerKey: 'Модель',
        next: 'stock_pick_or_param'
      },
      {
        id: 'stock_pick_or_param',
        bot: 'Хотите подобрать по параметрам?',
        options: [
          { value: 'yes', label: 'Подобрать по параметрам' },
          { value: 'no', label: 'Нет, оставить заявку' }
        ],
        answerKey: 'Подбор по параметрам',
        next: function() {
          return userAnswers['Подбор по параметрам'] === 'yes' ? 'pick_intro' : 'stock_contact';
        }
      },
      {
        id: 'stock_contact',
        bot: 'Оставьте контакт для связи:',
        input: {
          type: 'text',
          placeholder: 'Телефон, Telegram или Email'
        },
        answerKey: 'Контакт',
        next: 'stock_final'
      },
      {
        id: 'stock_final',
        bot: 'Уточним наличие и сроки поставки — вернёмся с ответом.',
        summary: true
      },
      // 4️⃣ ВЕТКА: Складская техника (основная)
      {
        id: 'warehouse_intro',
        bot: 'Для каких задач нужна техника?',
        options: [
          { value: 'Рохли', label: 'Рохли (ручные / электрические)' },
          { value: 'Штабелёры', label: 'Штабелёры' },
          { value: 'Ричтраки', label: 'Ричтраки' },
          { value: 'Комплектовщики', label: 'Комплектовщики' },
          { value: 'Подбор под склад', label: 'Подбор под склад' }
        ],
        answerKey: 'Тип складской техники',
        next: 'warehouse_params'
      },
      {
        id: 'warehouse_params',
        bot: 'Уточните параметры: высота подъёма, грузоподъёмность, ширина проходов.',
        input: {
          type: 'text',
          placeholder: 'Параметры/задача'
        },
        answerKey: 'Параметры',
        next: 'warehouse_city'
      },
      {
        id: 'warehouse_city',
        bot: 'В какой город нужна поставка?',
        input: {
          type: 'text',
          placeholder: 'Город / регион'
        },
        answerKey: 'Город',
        next: 'warehouse_contact'
      },
      {
        id: 'warehouse_contact',
        bot: 'Оставьте контакт для связи:',
        input: {
          type: 'text',
          placeholder: 'Телефон, Telegram или Email'
        },
        answerKey: 'Контакт',
        next: 'warehouse_final'
      },
      {
        id: 'warehouse_final',
        bot: 'Спасибо! Передал задачу специалисту — скоро свяжемся и предложим варианты.',
        summary: true
      },
      // 5️⃣ ВЕТКА: Сервис, запчасти, АКБ
      {
        id: 'service_intro',
        bot: 'Чем можем помочь?',
        options: [
          { value: 'Аккумуляторы и зарядки', label: 'Аккумуляторы и зарядки' },
          { value: 'Запчасти', label: 'Запчасти' },
          { value: 'Шины', label: 'Шины' }
        ],
        answerKey: 'Вид услуги',
        next: 'service_request'
      },
      {
        id: 'service_request',
        bot: 'Опишите ваш запрос:',
        input: {
          type: 'text',
          placeholder: 'Что требуется?'
        },
        answerKey: 'Запрос',
        next: 'service_city'
      },
      {
        id: 'service_city',
        bot: 'В какой город нужна поставка?',
        input: {
          type: 'text',
          placeholder: 'Город / регион'
        },
        answerKey: 'Город',
        next: 'service_contact'
      },
      {
        id: 'service_contact',
        bot: 'Оставьте контакт для связи:',
        input: {
          type: 'text',
          placeholder: 'Телефон, Telegram или Email'
        },
        answerKey: 'Контакт',
        next: 'service_final'
      },
      {
        id: 'service_final',
        bot: 'Спасибо! Передал задачу специалисту — скоро свяжемся и предложим варианты.',
        summary: true
      },
      // 6️⃣ ВЕТКА: Задать вопрос менеджеру
      {
        id: 'question_intro',
        bot: 'Напишите вопрос — передам специалисту.',
        input: {
          type: 'text',
          placeholder: 'Ваш вопрос'
        },
        answerKey: 'Вопрос',
        next: 'question_contact_way'
      },
      {
        id: 'question_contact_way',
        bot: 'Как удобнее получить ответ?',
        options: [
          { value: 'Телефон', label: 'Телефон' },
          { value: 'Telegram', label: 'Telegram' },
          { value: 'Email', label: 'Email' }
        ],
        answerKey: 'Способ связи',
        next: 'question_contact_value'
      },
      {
        id: 'question_contact_value',
        bot: 'Оставьте контакт для связи:',
        input: {
          type: 'text',
          placeholder: 'Телефон, Telegram или Email'
        },
        answerKey: 'Контакт',
        next: 'question_final'
      },
      {
        id: 'question_final',
        bot: 'Спасибо! Передал вопрос специалисту — скоро свяжемся с ответом.',
        summary: true
      },
      // 7️⃣ Альтернативная ветка складской техники
      {
        id: 'warehouse_type',
        bot: 'Какой именно вид складской техники вас интересует?',
        options: [
          { value: 'Ричтраки', label: 'Ричтраки (высотные штабелеры)' },
          { value: 'Штабелеры', label: 'Штабелеры' },
          { value: 'Тележки', label: 'Электрические тележки' },
          { value: 'Другая складская', label: 'Другая складская техника' }
        ],
        answerKey: 'Вид складской техники',
        next: 'capacity'
      },
      {
        id: 'capacity',
        bot: 'Укажите требуемую грузоподъёмность (кг):',
        input: {
          type: 'number',
          placeholder: 'Например, 2000'
        },
        answerKey: 'Грузоподъёмность',
        next: 'height'
      },
      {
        id: 'height',
        bot: 'Укажите необходимую высоту подъёма (мм):',
        input: {
          type: 'number',
          placeholder: 'Например, 4500'
        },
        answerKey: 'Высота подъема',
        next: 'conditions'
      },
      {
        id: 'conditions',
        bot: 'В каких условиях будет использоваться техника?',
        options: [
          { value: 'Склад', label: 'Закрытый склад/помещение' },
          { value: 'Улица', label: 'Открытая площадка/улица' },
          { value: 'Смешанные', label: 'Смешанные условия' }
        ],
        answerKey: 'Условия эксплуатации',
        next: 'email'
      },
      {
        id: 'email',
        bot: 'Пожалуйста, укажите ваш e-mail для отправки подобранных вариантов:',
        input: {
          type: 'email',
          placeholder: 'Например, example@site.ru'
        },
        answerKey: 'E-mail',
        next: 'phone'
      },
      {
        id: 'phone',
        bot: 'Укажите ваш телефон для оперативной связи нашего специалиста:',
        input: {
          type: 'tel',
          placeholder: '+7 999 123-45-67'
        },
        answerKey: 'Телефон',
        next: 'final'
      },
      {
        id: 'final',
        bot: 'Проверьте заявку и подтвердите отправку:',
        final: true
      },
      // 8️⃣ Общий финальный экран
      {
        id: 'summary',
        bot: 'Спасибо за обращение! Вот сводка вашей заявки:',
        summary: true
      }
    ];

    // Создаем карту шагов для O(1) доступа
    const stepsMap = steps.reduce((map, step) => {
      map[step.id] = step;
      return map;
    }, {});

    // --- State ---
    let currentStepId = steps[0].id;
    let userAnswers = {};
    let isTransitioning = false;
    const chatWidget = document.getElementById('chatWidget');
    const chatOpenBtn = document.getElementById('chatOpenBtn');
    const chatCloseBtn = document.getElementById('chatCloseBtn');
    const chatMessages = document.getElementById('chatMessages');
    const chatInputArea = document.getElementById('chatInputArea');
    const chatInput = document.getElementById('chatInput');
    const chatSendBtn = document.getElementById('chatSendBtn');

    // --- Открытие/закрытие чата ---
    chatOpenBtn.addEventListener('click', () => {
      chatWidget.classList.remove('closed');
      chatOpenBtn.style.display = 'none';
      setTimeout(() => chatMessages.focus(), 200);
      if (chatMessages.childElementCount === 0) {
        startChat();
      }
    });
    // Закрытие по Esc
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !chatWidget.classList.contains('closed')) {
        chatWidget.classList.add('closed');
        chatOpenBtn.style.display = '';
      }
    });

    // Кнопка закрытия
    chatCloseBtn.addEventListener('click', () => {
      chatWidget.classList.add('closed');
      chatOpenBtn.style.display = '';
    });

    // Клик вне чата — закрыть чат
    document.addEventListener('mousedown', function(e) {
      if (!chatWidget.classList.contains('closed')) {
        if (!chatWidget.contains(e.target) && e.target !== chatOpenBtn) {
          chatWidget.classList.add('closed');
          chatOpenBtn.style.display = '';
        }
      }
    });

    // --- Запуск чата ---
    function startChat() {
      currentStepId = steps[0].id;
      userAnswers = {};
      chatMessages.innerHTML = '';
      renderStep();
    }

    // --- Рендер шага ---
    function getStepById(id) {
      return stepsMap[id];
    }

    async function renderStep() {
      const step = getStepById(currentStepId);
      if (!step) return;

      // Вывод сообщения бота
      await renderBotMessage(step);

      // Выбор типа взаимодействия
      renderInteraction(step);
    }

    // --- Вывод сообщения бота ---
    async function renderBotMessage(step) {
      let botText = step.bot;
      if (typeof step.bot === 'function') {
        botText = step.bot();
      }
      await typeBotMessage(botText);
    }

    // --- Выбор типа взаимодействия ---
    function renderInteraction(step) {
      // Если шаг не требует пользовательского действия — сразу перейти к следующему
      if (!('options' in step) && !('input' in step) && !step.final && !step.summary) {
        chatInputArea.style.display = 'none';
        let nextStep = step.next;
        if (typeof step.next === 'function') {
          if (!Object.keys(userAnswers).length) return; // защита от раннего вызова
          nextStep = step.next();
        }
        setTimeout(() => {
          currentStepId = nextStep;
          renderStep();
        }, 900);
        scrollToBottom();
        return;
      }

      // Варианты выбора
      if (step.options) {
        renderOptions(step.options, step);
        chatInputArea.style.display = 'none';
      }
      // Ввод значения
      else if (step.input) {
        renderInput(step.input, step);
      }
      // Финальный экран с кнопкой и чекбоксом
      else if (step.final) {
        renderFinalSubmit();
        chatInputArea.style.display = 'none';
      }
      // Финальный экран (резюме)
      else if (step.summary) {
        renderSummary();
        chatInputArea.style.display = 'none';
      }
      else {
        chatInputArea.style.display = 'none';
      }
      scrollToBottom();
    }

    // --- Анимация набора текста для сообщений бота ---
    function typeBotMessage(text) {
      return new Promise(resolve => {
        const row = document.createElement('div');
        row.className = 'msg-row msg-bot';
        const bubble = document.createElement('div');
        bubble.className = 'msg-bubble';
        row.appendChild(bubble);
        chatMessages.appendChild(row);
        let i = 0;
        function typeChar() {
          bubble.textContent = text.slice(0, i);
          scrollToBottom();
          if (i < text.length) {
            i++;
            setTimeout(typeChar, text.length > 80 ? 7 : 18); // длинные тексты быстрее
          } else {
            bubble.textContent = text;
            resolve();
          }
        }
        typeChar();
      });
    }

    // --- Финальный экран с кнопкой и согласием ---
    function renderFinalSubmit() {
      // Список ответов
      const ul = document.createElement('ul');
      ul.className = 'summary-list';
      Object.entries(userAnswers).forEach(([k, v]) => {
        const li = document.createElement('li');
        li.innerHTML = `<span class=\"summary-label\">${k}:</span> ${v}`;
        ul.appendChild(li);
      });
      chatMessages.appendChild(ul);

      // Форма с textarea, чекбоксом и кнопкой
      const form = document.createElement('form');
      form.style.margin = '0';

      // Текстовое поле для комментария
      const commentLabel = document.createElement('label');
      commentLabel.htmlFor = 'userComment';
      commentLabel.style.display = 'block';
      commentLabel.style.marginBottom = '6px';
      commentLabel.style.fontSize = '15px';
      commentLabel.style.color = 'var(--text-secondary)';
      commentLabel.textContent = 'Комментарий (пожелания, детали):';

      const textarea = document.createElement('textarea');
      textarea.id = 'userComment';
      textarea.rows = 3;
      textarea.style.width = '100%';
      textarea.style.boxSizing = 'border-box';
      textarea.style.border = '1.5px solid var(--border)';
      textarea.style.borderRadius = 'var(--radius)';
      textarea.style.padding = '10px 14px';
      textarea.style.fontSize = '15px';
      textarea.style.marginBottom = '12px';
      textarea.style.resize = 'vertical';
      textarea.placeholder = 'Оставьте свои пожелания или детали (необязательно)';

      form.appendChild(commentLabel);
      form.appendChild(textarea);

      // Чекбокс и кнопка
      const privacyRow = document.createElement('div');
      privacyRow.className = 'privacy-row';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = 'privacyAgree';
      const label = document.createElement('label');
      label.htmlFor = 'privacyAgree';
      label.innerHTML = 'Я согласен с <a href="/privacy" target="_blank" style="color:var(--blue);text-decoration:underline;">политикой конфиденциальности</a>';
      privacyRow.appendChild(checkbox);
      privacyRow.appendChild(label);

      const submitBtn = document.createElement('button');
      submitBtn.type = 'submit';
      submitBtn.className = 'submit-btn';
      submitBtn.textContent = 'Отправить заявку';
      submitBtn.disabled = true;

      checkbox.addEventListener('change', () => {
        submitBtn.disabled = !checkbox.checked;
      });

      form.appendChild(privacyRow);
      form.appendChild(submitBtn);

      form.onsubmit = async e => {
        e.preventDefault();
        if (!checkbox.checked) return;
        userAnswers['Комментарий'] = textarea.value.trim();

        // Отправка данных на сервер
        try {
          const response = await fetch('hc-chat.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(userAnswers)
          });
          if (response.ok) {
            // Переход к финальному экрану
            currentStepId = 'summary';
            renderStep();
          } else {
            alert('Ошибка отправки. Попробуйте позже.');
          }
        } catch (error) {
          console.error('Ошибка:', error);
          alert('Ошибка отправки. Попробуйте позже.');
        }
      };

      chatMessages.appendChild(form);
    }

    // --- Сообщения ---
    function addBotMessage(text) {
      const row = document.createElement('div');
      row.className = 'msg-row msg-bot';
      const bubble = document.createElement('div');
      bubble.className = 'msg-bubble';
      bubble.textContent = text;
      row.appendChild(bubble);
      chatMessages.appendChild(row);
    }
    function addUserMessage(text) {
      const row = document.createElement('div');
      row.className = 'msg-row msg-user';
      const bubble = document.createElement('div');
      bubble.className = 'msg-bubble';
      bubble.textContent = text;
      row.appendChild(bubble);
      chatMessages.appendChild(row);
    }

    // --- Варианты выбора ---
    function renderOptions(options, step) {
      removeOptions();
      const optionsDiv = document.createElement('div');
      optionsDiv.className = 'chat-options';
      options.forEach(opt => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'option-btn';
        btn.textContent = opt.label;
        btn.addEventListener('click', () => {
          userAnswers[step.answerKey] = opt.value;
          addUserMessage(opt.label);
          removeOptions();
          let next = step.next;
          if (typeof step.next === 'function') {
            next = step.next();
          }
          goToNextStep(next);
        });
        optionsDiv.appendChild(btn);
      });
      chatMessages.appendChild(optionsDiv);
    }
    function removeOptions() {
      const old = chatMessages.querySelector('.chat-options');
      if (old) old.remove();
    }

    // --- Ввод значения ---
    function renderInput(inputCfg, step) {
      chatInputArea.style.display = '';
      // Для email и tel используем type="text" чтобы не было автозаполнения браузера
      if (inputCfg.type === 'email' || inputCfg.type === 'tel') {
        chatInput.type = 'text';
      } else {
        chatInput.type = inputCfg.type || 'text';
      }
      chatInput.placeholder = inputCfg.placeholder || '';
      chatInput.value = '';
      chatSendBtn.disabled = true;
      chatInput.focus();

      // Сброс старых обработчиков
      chatInput.oninput = null;
      chatInputArea.onsubmit = null;

      // Валидация
      chatInput.oninput = () => {
        let val = chatInput.value.trim();
        if (inputCfg.type === 'number') {
          chatSendBtn.disabled = !/^\d+$/.test(val);
        } else if (inputCfg.type === 'email') {
          chatSendBtn.disabled = !/^([a-zA-Z0-9_.+-]+)@([a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)$/.test(val);
        } else if (inputCfg.type === 'tel') {
          // Примитивная проверка: +7 и 10 цифр
          chatSendBtn.disabled = !/^\+?\d[\d\s\-()]{9,}$/.test(val);
        } else {
          chatSendBtn.disabled = val === '';
        }
      };
      chatInputArea.onsubmit = e => {
        e.preventDefault();
        let val = chatInput.value.trim();
        if (inputCfg.type === 'number') {
          if (!/^\d+$/.test(val)) return;
        } else if (inputCfg.type === 'email') {
          if (!/^([a-zA-Z0-9_.+-]+)@([a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)$/.test(val)) return;
        } else if (inputCfg.type === 'tel') {
          if (!/^\+?\d[\d\s\-()]{9,}$/.test(val)) return;
        } else {
          if (val === '') return;
        }
        userAnswers[step.answerKey] = val;
        addUserMessage(val);
        chatInput.value = '';
        chatSendBtn.disabled = true;
        chatInputArea.style.display = 'none';
        let next = step.next;
        if (typeof step.next === 'function') {
          next = step.next();
        }
        goToNextStep(next);
      };
    }

    // --- Финальный экран ---
    function renderSummary() {
      // Список ответов (кроме 'start')
      const ul = document.createElement('ul');
      ul.className = 'summary-list';
      Object.entries(userAnswers).forEach(([k, v]) => {
        if (k === 'start') return; // не выводим выбор стартовой ветки
        const li = document.createElement('li');
        li.innerHTML = `<span class="summary-label">${k}:</span> ${v}`;
        ul.appendChild(li);
      });
      chatMessages.appendChild(ul);
      // Сообщение бота
      addBotMessage('Наш специалист свяжется с вами в ближайшее время для уточнения деталей и подготовки индивидуального предложения. Спасибо за обращение в компанию Hangcha!');
    }

    // --- Переход к следующему шагу ---
    function goToNextStep(nextStep) {
      if (!nextStep || isTransitioning) return;
      isTransitioning = true;
      currentStepId = nextStep;
      setTimeout(() => {
        isTransitioning = false;
        renderStep();
      }, 350);
      scrollToBottom();
    }

    // --- Автоскролл вниз ---
    function scrollToBottom() {
      setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 100);
    }
});