/**
 * Caixa Rápido PWA - v3.0
 * Código refatorado e otimizado.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const keypad = document.getElementById('keypad');
  const display = document.getElementById('kbd-display');
  const summaryList = document.getElementById('summary-list');
  const changeEl     = document.getElementById('change');
  const messageEl    = document.getElementById('message');
  const finalizeBtn  = document.getElementById('finalize');
  const clearBtn     = document.getElementById('clear');
  const historyBtn   = document.getElementById('btn-history');
  const backBtn      = document.getElementById('btn-back');
  const historyList  = document.getElementById('history-list');

  // Application state
  let sale = { items: [], total: 0 };
  let inputBuffer = '';
  let activeProduct = null;

  init();

  function init() {
    bindProductButtons();
    bindKeypad();
    bindActionButtons();
  }

  function bindProductButtons() {
    document.querySelectorAll('.product').forEach(prod => {
      prod.addEventListener('click', () => addProduct(prod.dataset));
      const pencil = prod.querySelector('.icon-pencil');
      pencil.addEventListener('click', (evt) => {
        evt.stopPropagation();
        startEditing(prod);
      });
    });
  }

  function bindKeypad() {
    keypad.querySelectorAll('button').forEach(key => {
      key.addEventListener('click', () => handleKeyPress(key.dataset.value));
    });
  }

  function bindActionButtons() {
    finalizeBtn.addEventListener('click', handleFinalize);
    clearBtn.addEventListener('click', resetSale);
    historyBtn.addEventListener('click', () => {
      renderHistory();
      toggleView('history');
    });
    backBtn.addEventListener('click', () => toggleView('main'));
  }

  function addProduct({ id, name, price }) {
    const existing = sale.items.find(i => i.id === id);
    if (existing) existing.qty++;
    else sale.items.push({ id, name, price: +price, qty: 1 });
    updateSummary();
  }

  function startEditing(prod) {
    activeProduct = prod;
    inputBuffer = '';
    display.value = '';
    display.focus();
  }

  function handleKeyPress(val) {
    if (val === 'C') {
      inputBuffer = '';
    } else {
      inputBuffer += val;
    }
    display.value = inputBuffer;
    if (activeProduct) {
      const qty = parseInt(inputBuffer, 10) || 0;
      updateQuantity(activeProduct.dataset.id, qty);
    }
  }

  function updateQuantity(id, qty) {
    const item = sale.items.find(i => i.id === id);
    if (item) item.qty = qty;
    updateSummary();
  }

  function updateSummary() {
    sale.total = sale.items.reduce((sum, { qty, price, custom }) => {
      return sum + (custom || qty * price);
    }, 0);
    summaryList.innerHTML = '';
    sale.items.slice().reverse().forEach(({ name, qty, price, custom }) => {
      const li = document.createElement('li');
      li.textContent = `${name} × ${qty || custom} = ${formatBRL((qty || custom) * price)}`;
      summaryList.appendChild(li);
    });
    document.getElementById('fixed-total').textContent = `Total: ${formatBRL(sale.total)}`;
    changeEl.textContent = '';
    finalizeBtn.disabled = sale.items.length === 0;
  }

  function handleFinalize() {
    const received = parseFloat(document.getElementById('received').value) || 0;
    const change = received - sale.total;
    changeEl.textContent = formatBRL(change);
    messageEl.textContent = change < 0 ? 'Saldo insuficiente' : 'Venda finalizada';
    if (change >= 0) {
      saveHistory();
      resetSale();
      renderHistory();
    }
  }

  function resetSale() {
    sale = { items: [], total: 0 };
    document.getElementById('received').value = '';
    summaryList.innerHTML = '';
    document.getElementById('fixed-total').textContent = 'Total: R$ 0,00';
    changeEl.textContent = '';
    messageEl.textContent = '';
    finalizeBtn.disabled = true;
  }

  function saveHistory() {
    const historyArr = JSON.parse(localStorage.getItem('salesHistory')||'[]');
    historyArr.push({
      id: `v${Date.now()}`,
      date: new Date().toLocaleString(),
      items: sale.items,
      total: sale.total
    });
    localStorage.setItem('salesHistory', JSON.stringify(historyArr));
  }

  function renderHistory() {
    const tbody = historyList;
    tbody.innerHTML = '';
    JSON.parse(localStorage.getItem('salesHistory')||'[]')
      .filter(applyFilters)
      .forEach(sale => {
        const tr = document.createElement('tr');
        const itemsText = sale.items.map(i => `${i.name} (${i.qty})`).slice(0,3).join(', ')
          + (sale.items.length > 3 ? ` +${sale.items.length-3}` : '');
        tr.innerHTML = `
          <td>${sale.date}</td>
          <td>${sale.id}</td>
          <td>${itemsText}</td>
          <td>${formatBRL(sale.total)}</td>
          <td><button class="btn btn-link" onclick="showSaleDetails('${sale.id}')">Detalhes</button></td>
        `;
        tbody.appendChild(tr);
      });
  }

  function applyFilters(sale) {
    const start = document.getElementById('filter-start').value;
    const end   = document.getElementById('filter-end').value;
    const search= document.getElementById('filter-search').value.toLowerCase();
    let valid = true;
    if (start) valid = valid && new Date(sale.date) >= new Date(start);
    if (end)   valid = valid && new Date(sale.date) <= new Date(end);
    if (search) valid = valid && (
      sale.id.toLowerCase().includes(search) ||
      sale.items.some(i => i.name.toLowerCase().includes(search))
    );
    return valid;
  }

  function showSaleDetails(id) {
    const sale = JSON.parse(localStorage.getItem('salesHistory')||'[]')
                  .find(s => s.id === id);
    if (!sale) return;
    alert(`Venda ${sale.id} (${sale.date})\n` +
      sale.items.map(i => `${i.name}: ${i.qty}`).join('\n') +
      `\nTotal: ${formatBRL(sale.total)}`);
  }

  // Utility
  function formatBRL(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

});