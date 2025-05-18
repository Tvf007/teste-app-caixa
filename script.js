
document.addEventListener('DOMContentLoaded', () => {
  const confirmBox = document.getElementById('confirm-box');
  const confirmSim = document.getElementById('confirm-sim');
  const confirmNao = document.getElementById('confirm-nao');
  let deleteIndex = null;
  confirmNao.addEventListener('click', () => confirmBox.classList.add('hidden'));
  confirmSim.addEventListener('click', () => {
    if (deleteIndex !== null) {
      // remove item and update total
      const entry = summaryDisplayList.splice(deleteIndex, 1)[0];
      total = +(total - entry.totalPrice).toFixed(2);
      totalEl.textContent = total.toFixed(2).replace('.', ',');
      renderSummary();
      deleteIndex = null;
    }
    confirmBox.classList.add('hidden');
  // navigate to history page
  const historyBtn = document.getElementById('history-btn');
  if (historyBtn) {
    historyBtn.addEventListener('click', () => {
      window.location.href = 'history.html';
    });
  }

  });
  const alertBox = document.getElementById('alert-box');
  const alertMessage = document.getElementById('alert-message');
  const alertClose = document.getElementById('alert-close');
  function showAlert(msg) {
    alertMessage.textContent = msg;
    alertBox.classList.remove('hidden');
  }
  alertClose.addEventListener('click', () => alertBox.classList.add('hidden'));
  const buttons = document.querySelectorAll('.bread-btn');
  const moreBtn = document.getElementById('more-btn');
  const totalEl = document.getElementById('total');
  const valorRecebidoInput = document.getElementById('valor-recebido');
  const trocoEl = document.getElementById('troco');
  const nextBtn = document.getElementById('next-btn');
  const clearBtn = document.getElementById('clear-btn');
  const summaryList = document.getElementById('summary-list');
  const keypad = document.getElementById('num-keypad');
  const keys = keypad.querySelectorAll('button[data-key]');

  let total = 0;
  const summaryDisplayList = []; // holds items entries in order
  let rawValorRecebido = '';
  let rawValorOutros = '';
  let keypadMode = null;

  function renderSummary() {
    summaryList.innerHTML = '';
    summaryDisplayList.forEach(entry => {
      const li = document.createElement('li');
      li.textContent = entry.count ? `${entry.count} ${entry.label}` : entry.label;
      const span = document.createElement('span');
      span.textContent = `R$ ${entry.totalPrice.toFixed(2).replace('.', ',')}`;
      li.appendChild(span);
      // add delete icon
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      
      deleteBtn.dataset.index = Array.from(summaryList.children).length;
      deleteBtn.addEventListener('click', () => {
        deleteIndex = parseInt(deleteBtn.dataset.index, 10);
        confirmBox.classList.remove('hidden');
      });
      li.appendChild(deleteBtn);
      summaryList.appendChild(li);
    });
  }

  function addStandardItem(label, price) {
    total = +(total + price).toFixed(2);
    totalEl.textContent = total.toFixed(2).replace('.', ',');
    // find existing
    const idx = summaryDisplayList.findIndex(e => e.label === label && e.count);
    let count = 1;
    if (idx > -1) {
      const existing = summaryDisplayList.splice(idx, 1)[0];
      count = existing.count + 1;
    }
    const entry = { label, count, totalPrice: price * count };
    summaryDisplayList.unshift(entry);
    renderSummary();
  }

  function confirmOther(price) {
    // remove temp preview
    const tempIdx = summaryDisplayList.findIndex(e => e.temp);
    if (tempIdx > -1) summaryDisplayList.splice(tempIdx, 1);
    // add final entry
    summaryDisplayList.unshift({ label: 'Outros', count: null, totalPrice: price });
    total = +(total + price).toFixed(2);
    totalEl.textContent = total.toFixed(2).replace('.', ',');
    renderSummary();
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      addStandardItem(btn.textContent.trim(), parseFloat(btn.dataset.price));
    });
  });

  valorRecebidoInput.addEventListener('click', () => {
    keypadMode = 'valor';
    rawValorRecebido = '';
    valorRecebidoInput.value = 'R$ 0,00';
    keypad.classList.remove('hidden');
  });

  moreBtn.addEventListener('click', () => {
    keypadMode = 'outros';
    rawValorOutros = '';
    keypad.classList.remove('hidden');
});

  keys.forEach(keyBtn => {
    keyBtn.addEventListener('click', () => {
      const key = keyBtn.getAttribute('data-key');
      if (key === 'enter') {
        keypad.classList.add('hidden');
        if (keypadMode === 'outros') {
          const price = parseFloat(rawValorOutros.replace(',', '.')) || 0;
          confirmOther(price);
        } else {
          calculateTroco();
        }
      } else if (key === 'close') {
        keypad.classList.add('hidden');
        // remove temp preview if exists
        const tempIdx = summaryDisplayList.findIndex(e => e.temp);
        if (tempIdx > -1) summaryDisplayList.splice(tempIdx, 1);
        renderSummary();
      } else if (key === 'back') {
        if (keypadMode === 'valor') rawValorRecebido = rawValorRecebido.slice(0, -1);
        if (keypadMode === 'outros') rawValorOutros = rawValorOutros.slice(0, -1);
      } else if (key === 'comma') {
        if (keypadMode === 'valor' && !rawValorRecebido.includes(',')) rawValorRecebido += ',';
        if (keypadMode === 'outros' && !rawValorOutros.includes(',')) rawValorOutros += ',';
      } else {
        if (keypadMode === 'valor') rawValorRecebido += key;
        if (keypadMode === 'outros') rawValorOutros += key;
      }

      if (keypadMode === 'valor') {
        valorRecebidoInput.value = rawValorRecebido ? `R$ ${rawValorRecebido}` : 'R$ 0,00';
        calculateTroco();
      } else if (keypadMode === 'outros' && key !== 'enter') {
        // live preview in summary
        const price = parseFloat(rawValorOutros.replace(',', '.')) || 0;
        // remove existing temp
        const tempIdx = summaryDisplayList.findIndex(e => e.temp);
        if (tempIdx > -1) summaryDisplayList.splice(tempIdx, 1);
        // add temp entry at top
        summaryDisplayList.unshift({ label: 'Outros', count: null, totalPrice: price, temp: true });
        renderSummary();
      }
    });
  });

  function calculateTroco() {
    const valorRecNum = parseFloat(rawValorRecebido.replace(',', '.')) || 0;
    const troco = +(valorRecNum - total).toFixed(2);
    trocoEl.textContent = troco.toFixed(2).replace('.', ',');
  }

  nextBtn.addEventListener('click', () => {
    if (!rawValorRecebido) { showAlert('Falta pagamento'); return; }
    const valorNum = parseFloat(rawValorRecebido.replace(',', '.')) || 0;
    if (valorNum < total) { showAlert('Pagamento insuficiente'); return; }
    calculateTroco();
    alert(`Troco: R$ ${trocoEl.textContent}`);
    
      // persist sale to localStorage
      const sale = {
        timestamp: new Date().toISOString(),
        items: summaryDisplayList.map(entry => ({
          label: entry.label,
          count: entry.count != null ? entry.count : null,
          unitPrice: entry.count ? entry.totalPrice / entry.count : entry.totalPrice,
          totalPrice: entry.totalPrice
        })),
        total: total
      };
      const history = JSON.parse(localStorage.getItem('salesHistory')) || [];
      history.unshift(sale);
      localStorage.setItem('salesHistory', JSON.stringify(history));

    // reset all
    total = 0;
    summaryDisplayList.length = 0;
    totalEl.textContent = '0,00';
    valorRecebidoInput.value = 'R$ 0,00';
    trocoEl.textContent = '0,00';
    renderSummary();
  });

  clearBtn.addEventListener('click', () => {
    total = 0;
    summaryDisplayList.length = 0;
    totalEl.textContent = '0,00';
    valorRecebidoInput.value = 'R$ 0,00';
    trocoEl.textContent = '0,00';
    renderSummary();
  });
});
