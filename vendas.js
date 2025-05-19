
export let vendas = [];

export function adicionarItem(label, preco, quantidade = 1) {
  const existente = vendas.find(v => v.label === label);
  if (existente) {
    existente.quantidade += quantidade;
    existente.total += preco * quantidade;
  } else {
    vendas.push({ label, preco, quantidade, total: preco * quantidade });
  }
}

export function adicionarItemSimples(label, preco) {
  adicionarItem(label, preco);
}

export function adicionarItemOutros(valor) {
  vendas.push({ label: 'Outros', preco: valor, quantidade: 1, total: valor });
}

export function calcularTotal() {
  return vendas.reduce((soma, item) => soma + item.total, 0);
}

export function limparVendas() {
  vendas = [];
}

export function obterResumo() {
  return vendas.map(item => ({ ...item }));
}

export function registrarVenda(valorRecebido, formaPagamento) {
  const total = calcularTotal();
  const troco = +(valorRecebido - total).toFixed(2);
  const venda = {
    timestamp: new Date().toISOString(),
    itens: obterResumo(),
    total,
    recebido: valorRecebido,
    troco,
    formaPagamento: formaPagamento || 'Desconhecido'
  };
  const historico = JSON.parse(localStorage.getItem('salesHistory')) || [];
  historico.unshift(venda);
  localStorage.setItem('salesHistory', JSON.stringify(historico));
  limparVendas();
  return venda;
}

export function exportarCSV() {
  const historico = JSON.parse(localStorage.getItem('salesHistory')) || [];
  let csv = 'Data,Forma de Pagamento,Item,Quantidade,Preço Unitário,Total\n';
  historico.forEach(venda => {
    const data = new Date(venda.timestamp).toLocaleString('pt-BR');
    const forma = venda.formaPagamento || 'Desconhecido';
    venda.itens.forEach(item => {
      csv += `${data},${forma},${item.label},${item.quantidade || 1},${item.preco.toFixed(2)},${item.total.toFixed(2)}\n`;
    });
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.setAttribute('href', URL.createObjectURL(blob));
  link.setAttribute('download', 'historico_vendas.csv');
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
