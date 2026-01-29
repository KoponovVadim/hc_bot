document.addEventListener('DOMContentLoaded', () => {
  const ENDPOINT = '/templates/trendshop/hc_bot/hc-chat.php';

  const el = {
    widget: document.getElementById('chatWidget'),
    open: document.getElementById('chatOpenBtn'),
    close: document.getElementById('chatCloseBtn'),
    messages: document.getElementById('chatMessages'),
    inputArea: document.getElementById('chatInputArea'),
    input: document.getElementById('chatInput'),
    send: document.getElementById('chatSendBtn'),
    back: document.getElementById('backBtn'),
    restart: document.getElementById('restartBtn'),
  };

  let currentStep = 'start';
  let nextAfterIntro = null;
  let introCompleted = false;
  const history = [];
  const answers = {};
  let isSubmitting = false;

  /* =====================
     SCENARIO
  ===================== */
  const steps = {
    start: {
      text: 'Здравствуйте. Я помогу подобрать технику Hangcha, проверить наличие или проконсультировать по сервису.',
      options: [
        ['pick_env', 'Подобрать погрузчик'],
        ['stock_model', 'Проверить наличие'],
        ['warehouse_type', 'Складская техника'],
        ['service_type', 'Сервис, запчасти, АКБ'],
        ['manager_question', 'Задать вопрос менеджеру']
      ]
    },

    name: {
      text: 'Как к вам обращаться?',
      save: 'Имя',
      input: true,
      next: 'company'
    },

    company: {
      text: 'Укажите компанию (если есть). Можно пропустить.',
      save: 'Компания',
      input: true,
      optional: true,
      next: null
    },

    pick_env: {
      text: 'Где в основном будет работать погрузчик?',
      save: 'Условия работы',
      options: [
        ['indoor', 'В помещении'],
        ['outdoor', 'На улице'],
        ['both', 'И там и там'],
        ['unknown', 'Пока не знаю']
      ],
      next: 'pick_engine'
    },
    pick_engine: {
      text: 'Какой тип погрузчика рассматриваете?',
      save: 'Тип погрузчика',
      options: [
        ['electric', 'Электрический'],
        ['diesel', 'Дизельный'],
        ['benz', 'Бензиновый'],
        ['unknown', 'Пока не знаю']
      ],
      next: 'pick_weight'
    },
    pick_weight: {
      text: 'Какой максимальный вес груза нужно поднимать?',
      save: 'Макс. вес груза',
      options: [
        ['1.5', '1,5 т'],
        ['2', '1,8–2 т'],
        ['3', '2,5–3 т'],
        ['5', '3,5–5 т'],
        ['7+', '7 т и более']
      ],
      next: 'pick_height'
    },

    pick_height: {
      text: 'На какую высоту нужно поднимать груз?',
      save: 'Высота подъёма',
      options: [
        ['3', 'До 3 м'],
        ['4.5', '4–4,5 м'],
        ['6', '5–6 м'],
        ['7+', '7 м и выше'],
        ['unknown', 'Не знаю']
      ],
      next: 'pick_shift'
    },

    pick_shift: {
      text: 'Как планируется использовать технику?',
      save: 'Интенсивность',
      options: [
        ['1', '1 смена'],
        ['2', '2 смены'],
        ['24', 'Круглосуточно'],
        ['unknown', 'Пока не знаю']
      ],
      next: 'city'
    },

    city: {
      text: 'В какой город или регион нужна поставка?',
      save: 'Город',
      input: true,
      next: 'contact_method'
    },

    contact_method: {
      text: 'Как удобнее получить коммерческое предложение?',
      save: 'Канал связи',
      options: [
        ['phone', 'Телефон'],
        ['telegram', 'Telegram'],
        ['email', 'Email']
      ],
      next: 'contact_value'
    },

    contact_value: {
      text: 'Оставьте контакт для связи',
      save: 'Контакт',
      input: true,
      next: 'final'
    },

    stock_model: {
      text: 'Какая модель техники интересует?',
      save: 'Модель',
      input: true,
      next: 'city'
    },

    warehouse_type: {
      text: 'Какой тип складской техники требуется?',
      save: 'Тип складской техники',
      options: [
        ['pallet', 'Рохли'],
        ['stacker', 'Штабелёры'],
        ['reach', 'Ричтраки'],
        ['picker', 'Комплектовщики'],
        ['custom', 'Подбор под склад']
      ],
      next: 'warehouse_height'
    },

    warehouse_height: {
      text: 'Какая требуется высота подъёма?',
      save: 'Высота подъёма',
      input: true,
      next: 'warehouse_weight'
    },

    warehouse_weight: {
      text: 'Какая грузоподъёмность нужна?',
      save: 'Грузоподъёмность',
      input: true,
      next: 'city'
    },

    service_type: {
      text: 'Чем можем помочь?',
      save: 'Тип обращения',
      options: [
        ['battery', 'Аккумуляторы и зарядки'],
        ['parts', 'Запчасти'],
        ['tires', 'Шины']
      ],
      next: 'service_request'
    },

    service_request: {
      text: 'Опишите ваш запрос',
      save: 'Запрос',
      input: true,
      next: 'city'
    },

    manager_question: {
      text: 'Введите вопрос для менеджера',
      save: 'Вопрос',
      input: true,
      next: 'contact_method'
    },

    final: { submit: true }
  };

  /* =====================
     HELPERS
  ===================== */
  const scroll = () => el.messages.scrollTop = el.messages.scrollHeight;
function botTyped(text, callback) {
  const row = document.createElement('div');
  row.className = 'msg-row msg-bot';

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  row.appendChild(bubble);

  el.messages.appendChild(row);
  scroll();

  const speed = 20; 
  let i = 0;
  const plainText = text.replace(/<br>/g, '\n');

  function type() {
    if (i < plainText.length) {
      bubble.innerHTML += plainText[i] === '\n' ? '<br>' : plainText[i];
      i++;
      scroll();
      setTimeout(type, speed);
    } else if (callback) {
      callback();
    }
  }

  type();
}

  const bot = (text, callback) => {
  botTyped(text.replace(/\n/g, '<br>'), callback);
};

  const user = text => {
    const row = document.createElement('div');
    row.className = 'msg-row msg-user';
    row.innerHTML = `<div class="msg-bubble">${text}</div>`;
    el.messages.appendChild(row);
    scroll();
  };

  /* =====================
     RENDER
  ===================== */
  function render() {
    const step = steps[currentStep];
    if (!step) return;

    el.back.style.display = history.length ? 'block' : 'none';

    if (step.text) {
  bot(step.text, () => {
    if (step.options) renderOptions(step);
    else if (step.input) renderInput(step);
    else if (step.submit) submitOnce();
  });
} else {
  if (step.options) renderOptions(step);
  else if (step.input) renderInput(step);
  else if (step.submit) submitOnce();
}
  }

  function renderOptions(step) {
    hideInput();
    removeOptions();

    const box = document.createElement('div');
    box.className = 'chat-options';

    step.options.forEach(([value, label]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn';
      btn.textContent = label;

      btn.onclick = () => {
        user(label);
        if (step.save) answers[step.save] = label;
        history.push(currentStep);

        if (currentStep === 'start' && !introCompleted) {
          nextAfterIntro = step.next || value;
          currentStep = 'name';
        } else {
          currentStep = step.next || value;
        }

        box.remove();
        render();
      };

      box.appendChild(btn);
    });

    el.messages.appendChild(box);
    scroll();
  }

  function renderInput(step) {
    removeOptions();
    el.inputArea.style.display = 'flex';
    el.input.value = '';
    el.send.disabled = !step.optional;

    el.input.oninput = () => {
      el.send.disabled = !step.optional && !el.input.value.trim();
    };

    el.send.onclick = () => {
      const val = el.input.value.trim();
      if (!step.optional && !val) return;

      user(val || 'Пропущено');
      answers[step.save] = val || 'не указано';
      history.push(currentStep);

      if (currentStep === 'company') {
        introCompleted = true;
        currentStep = nextAfterIntro;
        nextAfterIntro = null;
      } else {
        currentStep = step.next;
      }

      hideInput();
      render();
    };
  }

  function hideInput() {
    el.inputArea.style.display = 'none';
    el.input.oninput = null;
    el.send.onclick = null;
  }

  function removeOptions() {
    const opt = el.messages.querySelector('.chat-options');
    if (opt) opt.remove();
  }

  /* =====================
     SUBMIT
  ===================== */
  function submitOnce() {
    if (isSubmitting) return;
    isSubmitting = true;

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...answers,
        url: location.href
      })
    })
    .then(() => {
      const name = answers['Имя'] ? `, ${answers['Имя']}` : '';
      bot(`Спасибо${name}. Заявка отправлена, специалист свяжется с вами.`);
    })
    .catch(() => {
      bot('Ошибка отправки. Попробуйте позже.');
      isSubmitting = false;
    });
  }

  /* =====================
     CONTROLS
  ===================== */
  el.open.onclick = () => {
    el.widget.classList.remove('closed');
    el.open.style.display = 'none';
    if (!el.messages.children.length) render();
  };

  el.close.onclick = () => {
    el.widget.classList.add('closed');
    el.open.style.display = '';
  };

  el.back.onclick = () => {
    const prev = history.pop();
    if (!prev) return;
    currentStep = prev;
    hideInput();
    removeOptions();
    render();
  };

  el.restart.onclick = () => {
    currentStep = 'start';
    nextAfterIntro = null;
    introCompleted = false;
    history.length = 0;
    isSubmitting = false;
    Object.keys(answers).forEach(k => delete answers[k]);
    el.messages.innerHTML = '';
    hideInput();
    render();
  };
});
