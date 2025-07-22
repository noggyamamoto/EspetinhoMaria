const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'emteste4.sqlite'));

// Criação das tabelas se não existirem com nova modelagem de categorias
db.serialize(() => {
  // Tabela de Categorias com IDs fixos
  db.run(`CREATE TABLE IF NOT EXISTS Categoria (
    id_categoria INTEGER PRIMARY KEY,
    nome TEXT NOT NULL UNIQUE,
    descricao TEXT
  )`);

  // Inserir categorias predefinidas
  db.run(`INSERT OR IGNORE INTO Categoria (id_categoria, nome, descricao) VALUES 
    (1, 'ESPETOS', 'Categoria para todos os tipos de espetinhos'),
    (2, 'BEBIDAS', 'Categoria para bebidas em geral'),
    (3, 'INSUMOS', 'Categoria para insumos e materiais')`);

  db.run(`CREATE TABLE IF NOT EXISTS Cliente (
    id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    telefone TEXT NOT NULL
  )`);

  // Tabela Estoque modificada para usar id_categoria
  db.run(`CREATE TABLE IF NOT EXISTS Estoque (
    id_estoque INTEGER PRIMARY KEY AUTOINCREMENT,
    descricao TEXT NOT NULL,
    id_categoria INTEGER NOT NULL,
    data_cadastro TEXT NOT NULL,
    disponivel INTEGER NOT NULL,
    FOREIGN KEY (id_categoria) REFERENCES Categoria(id_categoria)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Produto (
    id_produto INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descricao TEXT,
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

  // Migração de dados existentes (se houver)
  console.log('🔄 Verificando migração de dados...');
  
  // Primeiro verifica se a tabela Produto precisa ser atualizada
  db.get("PRAGMA table_info(Produto)", (err, row) => {
    if (!err && row) {
      db.all("PRAGMA table_info(Produto)", (err, columns) => {
        if (!err && columns) {
          const hasNomeColumn = columns.some(col => col.name === 'nome');
          const hasDescricaoColumn = columns.some(col => col.name === 'descricao');
          
          if (!hasNomeColumn || !hasDescricaoColumn) {
            console.log('📦 Atualizando estrutura da tabela Produto...');
            
            // Criar nova tabela com a estrutura correta
            db.run(`CREATE TABLE IF NOT EXISTS Produto_novo (
              id_produto INTEGER PRIMARY KEY AUTOINCREMENT,
              nome TEXT NOT NULL,
              descricao TEXT,
              preco_unitario REAL NOT NULL,
              id_estoque INTEGER NOT NULL,
              FOREIGN KEY (id_estoque) REFERENCES Estoque(id_estoque)
            )`, (err) => {
              if (!err) {
                // Migrar dados existentes
                db.run(`INSERT INTO Produto_novo (id_produto, nome, descricao, preco_unitario, id_estoque)
                  SELECT 
                    p.id_produto,
                    COALESCE(e.descricao, 'Produto') as nome,
                    'Migrado automaticamente' as descricao,
                    p.preco_unitario,
                    p.id_estoque
                  FROM Produto p
                  LEFT JOIN Estoque e ON p.id_estoque = e.id_estoque`, (err) => {
                  if (!err) {
                    // Substituir tabela antiga
                    db.run('DROP TABLE Produto', (err) => {
                      if (!err) {
                        db.run('ALTER TABLE Produto_novo RENAME TO Produto', (err) => {
                          if (!err) {
                            console.log('✅ Estrutura da tabela Produto atualizada!');
                          } else {
                            console.error('❌ Erro ao renomear tabela Produto:', err);
                          }
                        });
                      } else {
                        console.error('❌ Erro ao remover tabela Produto antiga:', err);
                      }
                    });
                  } else {
                    console.error('❌ Erro ao migrar dados do Produto:', err);
                  }
                });
              } else {
                console.error('❌ Erro ao criar nova tabela Produto:', err);
              }
            });
          } else {
            console.log('✅ Estrutura da tabela Produto já está atualizada');
          }
        }
      });
    }
  });
  
  // Migração da tabela Estoque
  db.get("PRAGMA table_info(Estoque)", (err, row) => {
    if (!err && row) {
      // Verifica se ainda existe a coluna 'categoria' (string) ao invés de 'id_categoria'
      db.all("PRAGMA table_info(Estoque)", (err, columns) => {
        if (!err && columns) {
          const hasOldCategoriaColumn = columns.some(col => col.name === 'categoria' && col.type === 'TEXT');
          const hasNewCategoriaColumn = columns.some(col => col.name === 'id_categoria');
          
          if (hasOldCategoriaColumn && !hasNewCategoriaColumn) {
            console.log('📦 Iniciando migração de dados do estoque...');
            
            // Criar nova tabela temporária
            db.run(`CREATE TABLE IF NOT EXISTS Estoque_novo (
              id_estoque INTEGER PRIMARY KEY AUTOINCREMENT,
              descricao TEXT NOT NULL,
              id_categoria INTEGER NOT NULL,
              data_cadastro TEXT NOT NULL,
              disponivel INTEGER NOT NULL,
              FOREIGN KEY (id_categoria) REFERENCES Categoria(id_categoria)
            )`, (err) => {
              if (!err) {
                // Migrar dados convertendo categoria texto para id_categoria
                db.run(`INSERT INTO Estoque_novo (id_estoque, descricao, id_categoria, data_cadastro, disponivel)
                  SELECT 
                    id_estoque, 
                    descricao,
                    CASE 
                      WHEN UPPER(categoria) LIKE '%ESPETO%' OR UPPER(categoria) LIKE '%CARNE%' THEN 1
                      WHEN UPPER(categoria) LIKE '%BEBIDA%' THEN 2
                      ELSE 3
                    END as id_categoria,
                    data_cadastro,
                    disponivel
                  FROM Estoque`, (err) => {
                  if (!err) {
                    // Substituir tabela antiga pela nova
                    db.run('DROP TABLE Estoque', (err) => {
                      if (!err) {
                        db.run('ALTER TABLE Estoque_novo RENAME TO Estoque', (err) => {
                          if (!err) {
                            console.log('✅ Migração de dados concluída com sucesso!');
                          } else {
                            console.error('❌ Erro ao renomear tabela:', err);
                          }
                        });
                      } else {
                        console.error('❌ Erro ao remover tabela antiga:', err);
                      }
                    });
                  } else {
                    console.error('❌ Erro ao migrar dados:', err);
                  }
                });
              } else {
                console.error('❌ Erro ao criar tabela temporária:', err);
              }
            });
          } else {
            console.log('✅ Estrutura do banco já está atualizada');
          }
        }
      });
    }
  });

});

module.exports = db;
