(() => {
  // Elements
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
  let activeInput = null;
  let inputBuffer = '';

  function updateTotal() {
    sale.total = sale.items.reduce((sum, i) => sum + (i.custom ? i.custom : i.qty * i.price), 0);
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
      const troco = (rec - sale.total).toFixed(2);
      messageEl.textContent = 'Pagamento OK';
      messageEl.className = 'message success';
      changeEl.textContent = troco;
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
    history.forEach(e => {
      const li = document.createElement('li');
      li.textContent = e;
      historyList.append(li);
    });
  }

  // Keypad logic unchanged...
  function showKeypad(input) {
    activeInput = input;
    inputBuffer = '';
    display.textContent = '';
    keypad.classList.remove('hidden');
  }
  function hideKeypad() {
    keypad.classList.add('hidden');
    if (activeInput === receivedEl) updateChange();
    else if (activeInput === customValue) customValue.value = '';
    activeInput = null;
  }
  keys.forEach(btn => btn.addEventListener('click', () => {
    if (inputBuffer.length < 7) {
      inputBuffer += btn.textContent;
      display.textContent = inputBuffer;
    }
  }));
  document.getElementById('key-clear').addEventListener('click', () => { inputBuffer = ''; display.textContent = ''; });
  document.getElementById('key-back').addEventListener('click', () => { inputBuffer = inputBuffer.slice(0, -1); display.textContent = inputBuffer; });
  document.getElementById('key-ok').addEventListener('click', () => {
    if (activeInput) {
      activeInput.value = inputBuffer;
      if (activeInput === customValue) addCustom.click();
      hideKeypad();
    }
  });
  document.getElementById('custom-value').addEventListener('click', () => showKeypad(customValue));
  document.getElementById('received').addEventListener('click', () => showKeypad(receivedEl));

  // Products logic unchanged
  products.forEach(prod => {
    const name = prod.dataset.name;
    const price = parseFloat(prod.dataset.price);
    let qty = 0;
    function sync() { /* ... */ }
    prod.addEventListener('click', e => { if (!e.target.classList.contains('pencil')) { qty++; sync(); } });
    prod.querySelector('.pencil').addEventListener('click', () => {
      const val = prompt(`Qtd ${name}:`, qty);
      if (!isNaN(val) && val >= 0) { qty = parseInt(val, 10); sync(); }
    });
  });

  // Finalize & clear unchanged
  finalizeBtn.addEventListener('click', () => { /* ... */ });
  clearBtn.addEventListener('click', () => { /* ... */ });

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(() => console.log('SW registrado'))
      .catch(console.error);
  }

  // Init
  renderHistory();
  finalizeBtn.disabled = true;
})();
