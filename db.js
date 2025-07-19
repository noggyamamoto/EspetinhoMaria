const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'emteste4.sqlite'));

// Criação das tabelas se não existirem (Produto e Estoque)
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS Cliente (
    id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    telefone TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Estoque (
    id_estoque INTEGER PRIMARY KEY AUTOINCREMENT,
    descricao TEXT NOT NULL,
    categoria TEXT NOT NULL,
    data_cadastro TEXT NOT NULL,
    disponivel INTEGER NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Produto (
    id_produto INTEGER PRIMARY KEY AUTOINCREMENT,
    preco_unitario REAL NOT NULL,
    id_estoque INTEGER NOT NULL,
    FOREIGN KEY (id_estoque) REFERENCES Estoque(id_estoque)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Pedido (
    id_pedido INTEGER PRIMARY KEY AUTOINCREMENT,
    dataHora TEXT NOT NULL,
    status TEXT NOT NULL,
    valor_total REAL NOT NULL,
    id_cliente INTEGER NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Administrador (
    id_admin INTEGER PRIMARY KEY AUTOINCREMENT,
    login TEXT NOT NULL,
    senha TEXT NOT NULL,
    id_estoque INTEGER NOT NULL,
    FOREIGN KEY (id_estoque) REFERENCES Estoque(id_estoque)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Monitora (
    id_admin INTEGER NOT NULL,
    id_pedido INTEGER NOT NULL,
    PRIMARY KEY (id_admin, id_pedido),
    FOREIGN KEY (id_admin) REFERENCES Administrador(id_admin),
    FOREIGN KEY (id_pedido) REFERENCES Pedido(id_pedido)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Contem (
    id_produto INTEGER NOT NULL,
    id_pedido INTEGER NOT NULL,
    quantidade INTEGER,
    PRIMARY KEY (id_produto, id_pedido),
    FOREIGN KEY (id_produto) REFERENCES Produto(id_produto),
    FOREIGN KEY (id_pedido) REFERENCES Pedido(id_pedido)
  )`);

});

module.exports = db;
