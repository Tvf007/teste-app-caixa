const precos = {
    "Pão Francês": 0.70,
    "Pão Doce": 0.70,
    "Pão Doce Especial": 0.80
};

const quantidades = {};
const historico = [];
let total = 0;

document.querySelectorAll(".item-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const item = btn.dataset.item;
        quantidades[item] = (quantidades[item] || 0) + 1;
        atualizarNota();
    });
});

document.querySelectorAll(".edit-icon").forEach(icon => {
    icon.addEventListener("click", () => {
        const item = icon.dataset.item;
        const novaQtd = prompt(`Editar quantidade de ${item}:`, quantidades[item] || 0);
        if (!isNaN(novaQtd)) {
            quantidades[item] = parseInt(novaQtd) || 0;
            atualizarNota();
        }
    });
});

document.getElementById("addOutros").addEventListener("click", () => {
    const valor = parseFloat(document.getElementById("outrosInput").value);
    if (!isNaN(valor)) {
        quantidades[`Outros ${Date.now()}`] = valor;
        atualizarNota();
    }
});

document.getElementById("valorRecebido").addEventListener("input", atualizarTroco);

document.getElementById("finalizar").addEventListener("click", () => {
    const recebido = parseFloat(document.getElementById("valorRecebido").value);
    if (isNaN(recebido) || recebido < total) {
        document.getElementById("erroMsg").textContent = "Pagamento insuficiente.";
        return;
    }
    document.getElementById("erroMsg").textContent = "";
    const troco = (recebido - total).toFixed(2);
    historico.push({
        itens: { ...quantidades },
        total,
        recebido,
        troco
    });
    exibirHistorico();
    limparTudo();
});

document.getElementById("limpar").addEventListener("click", limparTudo);

function atualizarNota() {
    total = 0;
    Object.entries(quantidades).forEach(([item, qtd]) => {
        const preco = precos[item] || qtd;
        total += preco * (precos[item] ? qtd : 1);
    });
    document.getElementById("total").textContent = `Total: R$ ${total.toFixed(2)}`;
    atualizarTroco();
}

function atualizarTroco() {
    const recebido = parseFloat(document.getElementById("valorRecebido").value);
    if (!isNaN(recebido) && recebido >= total) {
        document.getElementById("troco").textContent = `Troco: R$ ${(recebido - total).toFixed(2)}`;
    } else {
        document.getElementById("troco").textContent = "Troco: Aguardando pagamento";
    }
}

function exibirHistorico() {
    const div = document.getElementById("historico");
    div.innerHTML = historico.map(h => {
        const itens = Object.entries(h.itens).map(([k, v]) => `<li>${k}: ${v}</li>`).join("");
        return `<ul>${itens}<li>Total: R$ ${h.total.toFixed(2)}</li><li>Recebido: R$ ${h.recebido.toFixed(2)}</li><li>Troco: R$ ${h.troco}</li></ul><hr>`;
    }).join("");
}

function limparTudo() {
    for (const k in quantidades) delete quantidades[k];
    document.getElementById("valorRecebido").value = "";
    atualizarNota();
}