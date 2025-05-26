const resumo = [];
let total = 0;
let formaPagamento = '';
let virtualValue = '';
let targetField = null;
let editingItemIndex = null;

function renderResumo() {
  document.getElementById('summary-list').innerHTML = '';
  total = 0;
  [...resumo].reverse().forEach((item, idx, arr) => {
    const realIndex = resumo.length - 1 - idx;
    const li = document.createElement('li');
    li.className = 'summary-item';

    // Nome + qtd
    const labelDiv = document.createElement('div');
    labelDiv.className = 'summary-label';
    labelDiv.textContent = `${item.qtd}x ${item.label}`;
    li.appendChild(labelDiv);

    // Valor
    const valor = document.createElement('span');
    const subtotal = item.qtd * item.preco;
    total += subtotal;
    valor.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    valor.className = 'summary-price';
    li.appendChild(valor);

    // Lixeira (sempre na coluna mais à direita)
    const trashBtn = document.createElement('button');
    trashBtn.className = 'trash-btn';
    trashBtn.title = "Remover item";
    const trashImg = document.createElement('img');
    trashImg.src = 'trash-can.png';
    trashImg.alt = "Remover";
    trashImg.className = 'trash-icon';
    trashBtn.appendChild(trashImg);
    trashBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      resumo.splice(realIndex, 1);
      renderResumo();
    });
    li.appendChild(trashBtn);

    // Editar quantidade ao clicar no item (menos lixeira)
    li.addEventListener('click', function(e) {
      if (e.target.closest('.trash-btn')) return;
      editingItemIndex = realIndex;
      virtualValue = '';
      const item = resumo[realIndex];
      if (item.label && item.label.toLowerCase() === 'outros') {
        targetField = 'edit-preco';
      } else {
        targetField = 'edit-qtd';
      }
      document.getElementById('virtual-display').textContent = virtualValue;
      document.getElementById('virtual-keyboard').style.display = 'block';
    });

    document.getElementById('summary-list').appendChild(li);
  });
  document.getElementById('total').textContent = total.toFixed(2).replace('.', ',');
}

document.querySelectorAll('.bread-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const label = btn.dataset.label;
    const preco = parseFloat(btn.dataset.price);
    const existente = resumo.find(i => i.label === label);
    if (existente) existente.qtd += 1;
    else resumo.push({ label, preco, qtd: 1 });
    renderResumo();
  });
});

function openKeyboard(forField) {
  virtualValue = '';
  targetField = forField;
  document.getElementById('virtual-display').textContent = '0';
  document.getElementById('virtual-keyboard').style.display = 'block';
}

document.getElementById('more-btn').addEventListener('click', () => openKeyboard('outros'));
document.getElementById('valor-recebido').addEventListener('click', () => {
  if (formaPagamento === 'Dinheiro') openKeyboard('recebido');
});

document.querySelectorAll('.vk-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const val = btn.textContent;
    if (val === '←') virtualValue = virtualValue.slice(0, -1);
    else if (val === ',') {
      if (!virtualValue.includes(',')) virtualValue += ',';
    }
    else if (!isNaN(val)) virtualValue += val;
    document.getElementById('virtual-display').textContent = virtualValue || '0';
    if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(15);
  });
});

document.getElementById('close-keyboard').addEventListener('click', () => {
  document.getElementById('virtual-keyboard').style.display = 'none';
  editingItemIndex = null;
});

document.getElementById('vk-enter').addEventListener('click', () => {
  const preco = parseFloat(virtualValue.replace(',', '.'));
  if (!isNaN(preco) && preco > 0) {
    if (targetField === 'outros') {
      resumo.push({ label: 'Outros', preco, qtd: 1 });
      renderResumo();
    } else if (targetField === 'recebido') {
      document.getElementById('valor-recebido').value = preco.toFixed(2).replace('.', ',');
      if (formaPagamento === 'Dinheiro') {
        const troco = preco - total;
        document.getElementById('troco').textContent = troco.toFixed(2).replace('.', ',');
      }
    } else if (targetField === 'edit-qtd' && editingItemIndex !== null) {
      const newQtd = parseInt(virtualValue);
      if (!isNaN(newQtd) && newQtd > 0) {
        resumo[editingItemIndex].qtd = newQtd;
        renderResumo();
      }
      editingItemIndex = null;
    }
    else if (targetField === 'edit-preco' && editingItemIndex !== null) {
      resumo[editingItemIndex].preco = preco;
      renderResumo();
      editingItemIndex = null;
    }
    document.getElementById('virtual-keyboard').style.display = 'none';
  }
});

document.getElementById('vk-cancel').addEventListener('click', () => {
  virtualValue = '';
  document.getElementById('virtual-display').textContent = '0';
  document.getElementById('virtual-keyboard').style.display = 'none';
  editingItemIndex = null;
});

document.querySelectorAll('.pay-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.pay-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    formaPagamento = btn.dataset.method;
    document.getElementById('troco-area').style.display = (formaPagamento === 'Dinheiro') ? 'block' : 'none';

    const valorRecebidoArea = document.getElementById('valor-recebido-area');
    const valorRecebidoInput = document.getElementById('valor-recebido');
    valorRecebidoArea.style.display = 'block';
    if (formaPagamento === 'Dinheiro') {
      valorRecebidoInput.value = '';
      valorRecebidoInput.readOnly = true;
    } else if (formaPagamento === 'Cartão/PIX') {
      setTimeout(() => {
        const totalStr = document.getElementById('total').textContent.trim().replace(',', '.');
        const totalNum = parseFloat(totalStr);
        if (!isNaN(totalNum)) {
          valorRecebidoInput.value = totalNum.toFixed(2).replace('.', ',');
        }
        valorRecebidoInput.readOnly = true;
      }, 50);
    }
  });
});

document.getElementById('next-btn').addEventListener('click', () => {
  const inputEl = document.getElementById('valor-recebido');
  const recebidoStr = inputEl.value;
  const recebido = recebidoStr ? parseFloat(recebidoStr.replace(',', '.')) : 0;

  if (!formaPagamento) return showNotification('Selecione uma forma de pagamento.');
  if (!recebidoStr) return showNotification('Digite o valor recebido.');
  if (formaPagamento === 'Dinheiro' && recebido < total) return showNotification('Valor recebido é menor que o total.');

  const venda = {
    timestamp: new Date().toISOString(),
    itens: resumo,
    total,
    recebido,
    troco: formaPagamento === 'Dinheiro' ? recebido - total : 0,
    formaPagamento
  };
  const historico = JSON.parse(localStorage.getItem('salesHistory') || '[]');
  historico.unshift(venda);
  localStorage.setItem('salesHistory', JSON.stringify(historico));
  showNotification('Venda registrada com sucesso');
  location.reload();
});

document.getElementById('clear-btn').addEventListener('click', () => location.reload());
document.getElementById('history-btn').addEventListener('click', () => window.open('historico.html', '_blank'));

renderResumo();


// Notificação flutuante customizada
function showNotification(msg) {
  const box = document.getElementById('notification-box');
  const span = document.getElementById('notification-msg');
  box.style.display = 'flex';
  span.textContent = msg;
  document.getElementById('notification-close').onclick = () => box.style.display = 'none';
  clearTimeout(box.timeout);
  box.timeout = setTimeout(() => { box.style.display = 'none'; }, 4000);
}

// Service Worker registration
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js")
    .then(() => console.log("Service Worker registrado"))
    .catch(err => console.warn("Falha ao registrar Service Worker:", err));
}