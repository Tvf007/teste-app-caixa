(() => {
  const products = document.querySelectorAll('.product');
  const totalEl = document.getElementById('total');
  const receivedEl = document.getElementById('received');
  const changeEl = document.getElementById('change');
  const messageEl = document.getElementById('message');
  const addCustom = document.getElementById('add-custom');
  const customValue = document.getElementById('custom-value');
  const finalizeBtn = document.getElementById('finalize');
  const clearBtn = document.getElementById('clear');
  const historyList = document.getElementById('history-list');
  const keypad = document.getElementById('keypad');
  const display = document.getElementById('kbd-display');
  const keys = keypad.querySelectorAll('.key');
  const keyClear = document.getElementById('key-clear');
  const keyBack = document.getElementById('key-back');
  const keyOk = document.getElementById('key-ok');

  let sale = { items: [], total: 0 };
  let history = JSON.parse(localStorage.getItem('history') || '[]');
  let activeProduct = null;
  let activeInput = null;
  let inputBuffer = '';
  const productHandlers = new Map();

  function updateTotal() {
    sale.total = sale.items.reduce((sum, i) => sum + (i.custom || i.qty * i.price), 0);
    totalEl.textContent = sale.total.toFixed(2);
    updateChange();
  }

  function updateChange() {
    const rec = parseFloat(receivedEl.value) || 0;
    if (!receivedEl.value) {
      messageEl.textContent = 'Aguardando pagamento';
      messageEl.className = 'message';
      changeEl.textContent = 'Aguardando pagamento';
      finalizeBtn.disabled = true;
    } else if (rec < sale.total) {
      messageEl.textContent = 'Pagamento insuficiente';
      messageEl.className = 'message error';
      changeEl.textContent = 'Valor insuficiente';
      finalizeBtn.disabled = true;
    } else {
      messageEl.textContent = 'Pagamento OK';
      messageEl.className = 'message success';
      changeEl.textContent = (rec - sale.total).toFixed(2);
      finalizeBtn.disabled = false;
    }
  }

  function addHistory(entry) {
    history.unshift(entry);
    localStorage.setItem('history', JSON.stringify(history));
    renderHistory();
  }

  function renderHistory() {
    historyList.innerHTML = '';
    history.forEach(record => {
      const li = document.createElement('li');
      if (typeof record === 'string') {
        li.textContent = record;
      } else {
        li.innerHTML = `<div class="timestamp">${record.timestamp}</div>
                        <ul class="details">
                          ${record.lines.map(line => `<li>${line}</li>`).join('')}
                        </ul>`;
      }
      historyList.append(li);
    });
  }

  function showKeypad(target) {
    activeProduct = null;
    activeInput = null;
    if (target.classList.contains('product')) {
      activeProduct = target;
    } else {
      activeInput = target;
    }
    document.querySelector('.custom').classList.toggle('active', activeInput === customValue);
    inputBuffer = '';
    display.textContent = '';
    keypad.classList.remove('hidden');
  }

  function hideKeypad() {
    keypad.classList.add('hidden');
    document.querySelector('.custom').classList.remove('active');
    if (activeInput) {
      activeInput.value = inputBuffer;
      if (activeInput === receivedEl) updateChange();
    } else if (activeProduct) {
      const handler = productHandlers.get(activeProduct);
      const val = parseInt(inputBuffer, 10);
      if (!isNaN(val) && val >= 0) handler.setQty(val);
    }
    activeProduct = null;
    activeInput = null;
  }

  keys.forEach(btn => btn.addEventListener('click', () => {
    if (inputBuffer.length < 7) {
      inputBuffer += btn.textContent;
      display.textContent = inputBuffer;
    }
  }));
  keyClear.addEventListener('click', () => { inputBuffer = ''; display.textContent = ''; });
  keyBack.addEventListener('click', () => { inputBuffer = inputBuffer.slice(0, -1); display.textContent = inputBuffer; });
  keyOk.addEventListener('click', hideKeypad);

  customValue.addEventListener('click', () => showKeypad(customValue));
  receivedEl.addEventListener('click', () => showKeypad(receivedEl));

  products.forEach(prod => {
    const price = parseFloat(prod.dataset.price);
    let qty = 0;
    function sync() {
      prod.querySelector('.count').textContent = qty;
      const idx = sale.items.findIndex(i => i.name === prod.dataset.name && !i.custom);
      if (qty > 0) {
        if (idx >= 0) sale.items[idx].qty = qty;
        else sale.items.push({ name: prod.dataset.name, price, qty });
      } else if (idx >= 0) {
        sale.items.splice(idx, 1);
      }
      updateTotal();
    }
    productHandlers.set(prod, { setQty: v => { qty = v; sync(); } });
    prod.addEventListener('click', e => {
      if (e.target.classList.contains('pencil')) return;
      qty++;
      sync();
    });
    prod.querySelector('.pencil').addEventListener('click', () => showKeypad(prod));
  });

  addCustom.addEventListener('click', () => {
    const val = parseFloat(customValue.value);
    if (!isNaN(val) && val > 0) {
      sale.items.push({ custom: val });
      updateTotal();
      customValue.value = '';
    }
  });

  finalizeBtn.addEventListener('click', () => {
    const timestamp = new Date().toLocaleString();
    const lines = sale.items.map(i => i.custom
      ? `Outros: R$ ${i.custom.toFixed(2)}`
      : `${i.name} x${i.qty} = R$ ${(i.qty * i.price).toFixed(2)}`
    );
    lines.push(`Total: R$ ${sale.total.toFixed(2)}`, `Recebido: R$ ${receivedEl.value}`, `Troco: R$ ${changeEl.textContent}`);
    addHistory({ timestamp, lines });
    clearBtn.click();
  });

  clearBtn.addEventListener('click', () => {
    sale = { items: [], total: 0 };
    products.forEach(p => p.querySelector('.count').textContent = '0');
    totalEl.textContent = '0.00';
    receivedEl.value = '';
    changeEl.textContent = 'Aguardando pagamento';
    messageEl.textContent = 'Aguardando pagamento';
    messageEl.className = 'message';
    finalizeBtn.disabled = true;
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js');
  }

  renderHistory();
  finalizeBtn.disabled = true;
})();
