// Alternância de abas
const tabs = document.querySelectorAll(".tab");
const produtos = document.querySelectorAll(".produtos");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    produtos.forEach(p => p.classList.remove("active"));
    const id = tab.getAttribute("data-tab");
    document.getElementById(id).classList.add("active");
  });
});

// Classe Item
class Item {
  constructor(nome, preco, quantidade) {
    this.nome = nome;
    this.preco = preco;
    this.quantidade = quantidade;
  }

  get subtotal() {
    return this.preco * this.quantidade;
  }

  toString() {
    return `${this.nome} x${this.quantidade} - R$ ${this.subtotal.toFixed(2)}`;
  }
}

// Classe Pedido
class Pedido {
  constructor() {
    this.itens = [];
    this.codigoUnico = this.gerarCodigoUnico();
  }

  adicionarItem(item) {
    this.itens.push(item);
  }

  gerarCodigoUnico() {
    return Math.floor(Math.random() * 999) + 1;
  }

  calcularTotal() {
    return this.itens.reduce((acc, item) => acc + item.subtotal, 0).toFixed(2);
  }

  getListaItens() {
    return this.itens.map(item => item.toString()).join('\n');
  }

  getMensagemConfirmacao() {
    return `Número do Pedido: ${this.codigoUnico}\n\nItens selecionados:\n${this.getListaItens()}\n\nTotal do Pedido: R$${this.calcularTotal()}\n\nDeseja enviar este pedido ao WhatsApp?`;
  }
}

// Classe WhatsAppService
class WhatsAppService {
  constructor(numeroWhatsApp) {
    this.numeroWhatsApp = numeroWhatsApp;
  }

  enviarMensagem(pedido) {
    const mensagem = `Obrigado por comprar no Espetinho da Maria!\n\n*Nº do pedido:* ${pedido.codigoUnico}\n\n*Itens:*\n${pedido.getListaItens()}\n\n*Total do pedido:* R$${pedido.calcularTotal()}`;
    const mensagemFormatada = encodeURIComponent(mensagem);
    const linkWhatsApp = `https://api.whatsapp.com/send?phone=${this.numeroWhatsApp}&text=${mensagemFormatada}`;
    window.open(linkWhatsApp, '_blank');
  }
}

// Função principal
function gerarListaDeItens() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
  const itensSelecionados = [];

  checkboxes.forEach(checkbox => {
    const card = checkbox.closest('.produto');
    const spanQuantidade = card.querySelector('.quantidade');
    const quantidade = parseInt(spanQuantidade.textContent);
    const nome = checkbox.value;
    const preco = parseFloat(checkbox.dataset.preco || 0);

    itensSelecionados.push(new Item(nome, preco, quantidade));
  });

  if (itensSelecionados.length > 0) {
    const pedido = new Pedido();
    itensSelecionados.forEach(item => pedido.adicionarItem(item));

    const confirmarEnvio = confirm(pedido.getMensagemConfirmacao());

    if (confirmarEnvio) {
      const whatsAppService = new WhatsAppService("5561985613502");
      whatsAppService.enviarMensagem(pedido);
    } else {
      alert("Você pode revisar os itens antes de enviar!");
    }
  } else {
    alert("Por favor, selecione ao menos um item!");
  }
}

// Controle de quantidade
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".quantidade-container").forEach(container => {
    const span = container.querySelector(".quantidade");

    container.querySelector(".aumentar").addEventListener("click", () => {
      let qtd = parseInt(span.textContent);
      span.textContent = qtd + 1;
    });

    container.querySelector(".diminuir").addEventListener("click", () => {
      let qtd = parseInt(span.textContent);
      if (qtd > 1) {
        span.textContent = qtd - 1;
      }
    });
  });
});
