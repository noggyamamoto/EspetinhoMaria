const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = new sqlite3.Database(path.join(__dirname, '../../emteste4.sqlite'));
    this.init();
  }

  init() {
    this.db.serialize(() => {
      // Tabela de Categorias com IDs fixos
      this.db.run(`CREATE TABLE IF NOT EXISTS Categoria (
        id_categoria INTEGER PRIMARY KEY,
        nome TEXT NOT NULL UNIQUE,
        descricao TEXT
      )`);

      // Inserir categorias predefinidas
      this.db.run(`INSERT OR IGNORE INTO Categoria (id_categoria, nome, descricao) VALUES 
        (1, 'ESPETOS', 'Categoria para todos os tipos de espetinhos'),
        (2, 'BEBIDAS', 'Categoria para bebidas em geral'),
        (3, 'INSUMOS', 'Categoria para insumos e materiais')`);

      this.db.run(`CREATE TABLE IF NOT EXISTS Cliente (
        id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        telefone TEXT NOT NULL
      )`);

      // Tabela Estoque modificada para usar id_categoria
      this.db.run(`CREATE TABLE IF NOT EXISTS Estoque (
        id_estoque INTEGER PRIMARY KEY AUTOINCREMENT,
        descricao TEXT NOT NULL,
        id_categoria INTEGER NOT NULL,
        data_cadastro TEXT NOT NULL,
        disponivel INTEGER NOT NULL,
        FOREIGN KEY (id_categoria) REFERENCES Categoria(id_categoria)
      )`);

      this.db.run(`CREATE TABLE IF NOT EXISTS Produto (
        id_produto INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        descricao TEXT,
        preco_unitario REAL NOT NULL,
        id_estoque INTEGER NOT NULL,
        FOREIGN KEY (id_estoque) REFERENCES Estoque(id_estoque)
      )`);

      this.db.run(`CREATE TABLE IF NOT EXISTS Pedido (
        id_pedido INTEGER PRIMARY KEY AUTOINCREMENT,
        dataHora TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'PENDENTE',
        valor_total REAL NOT NULL,
        id_cliente INTEGER,
        FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente)
      )`);

      this.db.run(`CREATE TABLE IF NOT EXISTS ItemPedido (
        id_item_pedido INTEGER PRIMARY KEY AUTOINCREMENT,
        id_pedido INTEGER NOT NULL,
        id_produto INTEGER NOT NULL,
        quantidade INTEGER NOT NULL,
        preco_unitario REAL NOT NULL,
        FOREIGN KEY (id_pedido) REFERENCES Pedido(id_pedido),
        FOREIGN KEY (id_produto) REFERENCES Produto(id_produto)
      )`);

      console.log('✅ Banco de dados inicializado com sucesso');
    });
  }

  getConnection() {
    return this.db;
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

module.exports = new Database();