document.addEventListener('DOMContentLoaded', () => {

  const ENDPOINT = '/templates/trendshop/hc_bot/hc-chat.php';

  let currentStep = 'welcome';
  let isTyping = false;
  let finalRendered = false;
  const answers = {};
  const historyStack = [];

  const chatWidget   = document.getElementById('chatWidget');
  const chatOpenBtn  = document.getElementById('chatOpenBtn');
  const chatCloseBtn = document.getElementById('chatCloseBtn');
  const chatMessages = document.getElementById('chatMessages');
  const chatForm     = document.getElementById('chatInputArea');
  const chatInput    = document.getElementById('chatInput');
  const chatSendBtn  = document.getElementById('chatSendBtn');

  const backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.className = 'back-btn';
  backBtn.textContent = 'Назад';
  backBtn.style.display = 'none';
  chatForm.insertBefore(backBtn, chatInput);

  const restartBtn = document.createElement('button');
  restartBtn.type = 'button';
  restartBtn.className = 'restart-btn';
  restartBtn.textContent = 'Начать заново';
  chatWidget.appendChild(restartBtn);

  const steps = {
    welcome: {
      text: 'Привет! Я помогу подобрать технику Hangcha. С чего начнём?',
      options: [
        ['pick', 'Подобрать погрузчик'],
        ['warehouse', 'Складская техника'],
        ['service', 'Сервис / запчасти'],
        ['question', 'Задать вопрос']
      ]
    },

    pick: {
      text: 'Какой тип двигателя нужен?',
      options: [
        ['electric', 'Электрический'],
        ['diesel', 'Дизельный'],
        ['gas', 'Бензиновый']
      ],
      saveAs: 'Тип двигателя',
      next: 'pick_weight'
    },

    pick_weight: {
      text: 'Максимальная грузоподъёмность?',
      options: [
        ['1.5', 'До 1,5 т'],
        ['3', 'До 3 т'],
        ['5', 'До 5 т'],
        ['7+', '7 т и более']
      ],
      saveAs: 'Грузоподъёмность',
      next: 'city'
    },

    warehouse: {
      text: 'Какая складская техника интересует?',
      options: [
        ['reach', 'Ричтрак'],
        ['stacker', 'Штабелёр'],
        ['pallet', 'Тележка']
      ],
      saveAs: 'Тип техники',
      next: 'city'
    },

    service: {
      text: 'Опишите ваш запрос',
      input: true,
      saveAs: 'Запрос',
      next: 'city'
    },

    question: {
      text: 'Введите ваш вопрос',
      input: true,
      saveAs: 'Вопрос',
      next: 'city'
    },

    city: {
      text: 'В какой город нужна поставка?',
      input: true,
      saveAs: 'Город',
      next: 'contact'
    },

    contact: {
      text: 'Оставьте контакт для связи',
      input: true,
      saveAs: 'Контакт',
      next: 'final'
    },

    final: {
      text: 'Проверьте данные и отправьте заявку'
    }
  };

  chatOpenBtn.onclick = () => {
    chatWidget.classList.remove('closed');
    chatOpenBtn.style.display = 'none';
    if (!chatMessages.children.length) start();
  };

  chatCloseBtn.onclick = closeChat;
  document.addEventListener('keydown', e => e.key === 'Escape' && closeChat());

  restartBtn.onclick = start;

  function closeChat() {
    chatWidget.classList.add('closed');
    chatOpenBtn.style.display = '';
  }

  function start() {
    chatMessages.innerHTML = '';
    Object.keys(answers).forEach(k => delete answers[k]);
    historyStack.length = 0;
    currentStep = 'welcome';
    finalRendered = false;
    hideInput();
    renderStep();
  }

  async function renderStep() {
    const step = steps[currentStep];
    if (!step || isTyping) return;

    await botMessage(step.text);

    if (step.options) {
      hideInput();
      renderOptions(step.options, step);
      return;
    }

    if (step.input) {
      showInput(step);
      return;
    }

    if (currentStep === 'final' && !finalRendered) {
      finalRendered = true;
      hideInput();
      renderFinalForm();
    }
  }

  function botMessage(text) {
    isTyping = true;
    return new Promise(resolve => {
      const row = document.createElement('div');
      row.className = 'msg-row msg-bot';
      const bubble = document.createElement('div');
      bubble.className = 'msg-bubble';
      row.appendChild(bubble);
      chatMessages.appendChild(row);

      let i = 0;
      (function type() {
        bubble.textContent = text.slice(0, i++);
        scroll();
        if (i <= text.length) {
          setTimeout(type, 12);
        } else {
          isTyping = false;
          resolve();
        }
      })();
    });
  }

  function userMessage(text) {
    const row = document.createElement('div');
    row.className = 'msg-row msg-user';
    row.innerHTML = `<div class="msg-bubble">${text}</div>`;
    chatMessages.appendChild(row);
    scroll();
  }

  function renderOptions(options, step) {
    removeOptions();
    const box = document.createElement('div');
    box.className = 'chat-options';

    options.forEach(([value, label]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn';
      btn.textContent = label;

      btn.onclick = () => {
        userMessage(label);
        if (step.saveAs) answers[step.saveAs] = label;
        removeOptions();
        historyStack.push(currentStep);
        currentStep = step.next || value;
        renderStep();
      };

      box.appendChild(btn);
    });

    chatMessages.appendChild(box);
    scroll();
  }

  function removeOptions() {
    const old = chatMessages.querySelector('.chat-options');
    if (old) old.remove();
  }

  function showInput(step) {
    chatForm.style.display = 'flex';
    chatInput.value = '';
    chatSendBtn.disabled = true;
    chatInput.focus();

    backBtn.style.display = historyStack.length > 0 ? 'block' : 'none';

    chatInput.oninput = () => {
      chatSendBtn.disabled = chatInput.value.trim() === '';
    };

    chatSendBtn.onclick = () => {
      const val = chatInput.value.trim();
      if (!val) return;

      userMessage(val);
      answers[step.saveAs] = val;

      chatInput.value = '';
      hideInput();

      historyStack.push(currentStep);
      currentStep = step.next;
      renderStep();
    };

    backBtn.onclick = () => {
      const prevStep = historyStack.pop();
      if (prevStep) {
        delete answers[step.saveAs];
        currentStep = prevStep;
        hideInput();
        renderStep();
      }
    };
  }

  function hideInput() {
    chatForm.style.display = 'none';
    chatSendBtn.onclick = null;
    chatInput.oninput = null;
    backBtn.onclick = null;
    backBtn.style.display = 'none';
  }

  function renderFinalForm() {
    const wrap = document.createElement('div');

    const list = document.createElement('ul');
    list.className = 'summary-list';

    Object.entries(answers).forEach(([k, v]) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="summary-label">${k}:</span> ${v}`;
      list.appendChild(li);
    });

    wrap.appendChild(list);

    const form = document.createElement('form');
    form.className = 'final-form';

    form.innerHTML = `
      <textarea id="finalComment" rows="3" placeholder="Комментарий (необязательно)"></textarea>
      <div class="privacy-row">
        <input type="checkbox" id="privacyCheck">
        <label for="privacyCheck">
          Я согласен с <a href="/privacy" target="_blank">политикой конфиденциальности</a>
        </label>
      </div>
      <button type="submit" class="submit-btn" disabled>Отправить заявку</button>
    `;

    const checkbox = form.querySelector('#privacyCheck');
    const submitBtn = form.querySelector('.submit-btn');
    const commentEl = form.querySelector('#finalComment');

    checkbox.onchange = () => {
      submitBtn.disabled = !checkbox.checked;
    };

    form.onsubmit = async e => {
      e.preventDefault();
      if (!checkbox.checked) return;

      submitBtn.disabled = true;
      submitBtn.textContent = 'Отправка…';

      const dataToSend = { ...answers, comment: commentEl.value.trim() };

      try {
        const res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSend)
        });

        if (!res.ok) throw new Error('Server error');

        await botMessage('Спасибо! Заявка отправлена. Мы свяжемся с вами в ближайшее время.');
      } catch (err) {
        alert('Ошибка отправки. Попробуйте позже.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Отправить заявку';
      }
    };

    wrap.appendChild(form);
    chatMessages.appendChild(wrap);
    scroll();
  }

  function scroll() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

});
