const BaseModel = require('./BaseModel');

class Produto extends BaseModel {
  constructor() {
    super('Produto');
  }

  // Buscar todos os produtos com informações de categoria e estoque
  async findAllWithDetails() {
    const query = `
      SELECT p.id_produto, p.nome, p.descricao, p.preco_unitario, 
             c.nome as categoria, e.disponivel, 
             e.data_cadastro, e.id_categoria
      FROM Produto p
      JOIN Estoque e ON p.id_estoque = e.id_estoque
      JOIN Categoria c ON e.id_categoria = c.id_categoria
      ORDER BY e.data_cadastro DESC
    `;
    return this.customQuery(query);
  }

  // Criar produto com estoque
  async createWithEstoque(produtoData, estoqueData) {
    const database = require('../config/database');
    const db = database.getConnection();
    
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        // Primeiro criar o estoque
        const estoqueQuery = 'INSERT INTO Estoque (descricao, id_categoria, data_cadastro, disponivel) VALUES (?, ?, ?, ?)';
        db.run(estoqueQuery, [
          estoqueData.descricao,
          estoqueData.id_categoria,
          estoqueData.data_cadastro,
          estoqueData.disponivel
        ], function(err) {
          if (err) {
            db.run('ROLLBACK');
            return reject(err);
          }
          
          const id_estoque = this.lastID;
          
          // Depois criar o produto
          const produtoQuery = 'INSERT INTO Produto (nome, descricao, preco_unitario, id_estoque) VALUES (?, ?, ?, ?)';
          db.run(produtoQuery, [
            produtoData.nome,
            produtoData.descricao,
            produtoData.preco_unitario,
            id_estoque
          ], function(err) {
            if (err) {
              db.run('ROLLBACK');
              return reject(err);
            }
            
            db.run('COMMIT');
            resolve({
              id_produto: this.lastID,
              id_estoque: id_estoque
            });
          });
        });
      });
    });
  }

  // Buscar produto por ID com detalhes
  async findByIdWithDetails(id) {
    const query = `
      SELECT p.*, e.id_categoria, e.disponivel, c.nome as categoria
      FROM Produto p
      JOIN Estoque e ON p.id_estoque = e.id_estoque
      JOIN Categoria c ON e.id_categoria = c.id_categoria
      WHERE p.id_produto = ?
    `;
    return this.customGet(query, [id]);
  }

  // Atualizar produto e estoque
  async updateWithEstoque(id, produtoData, estoqueData) {
    const database = require('../config/database');
    const db = database.getConnection();
    
    return new Promise((resolve, reject) => {
      // Primeiro buscar o id_estoque
      this.customGet('SELECT id_estoque FROM Produto WHERE id_produto = ?', [id])
        .then(produto => {
          if (!produto) {
            return reject(new Error('Produto não encontrado'));
          }
          
          db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            
            // Atualizar produto
            const produtoQuery = 'UPDATE Produto SET preco_unitario = ? WHERE id_produto = ?';
            db.run(produtoQuery, [produtoData.preco_unitario, id], function(err) {
              if (err) {
                db.run('ROLLBACK');
                return reject(err);
              }
              
              // Atualizar estoque
              const estoqueQuery = 'UPDATE Estoque SET descricao = ?, id_categoria = ?, disponivel = ? WHERE id_estoque = ?';
              db.run(estoqueQuery, [
                estoqueData.descricao,
                estoqueData.id_categoria,
                estoqueData.disponivel,
                produto.id_estoque
              ], function(err) {
                if (err) {
                  db.run('ROLLBACK');
                  return reject(err);
                }
                
                db.run('COMMIT');
                resolve({ changes: this.changes });
              });
            });
          });
        })
        .catch(reject);
    });
  }

  // Deletar produto e estoque
  async deleteWithEstoque(id) {
    const database = require('../config/database');
    const db = database.getConnection();
    
    return new Promise((resolve, reject) => {
      // Primeiro buscar o id_estoque
      this.customGet('SELECT id_estoque FROM Produto WHERE id_produto = ?', [id])
        .then(produto => {
          if (!produto) {
            return reject(new Error('Produto não encontrado'));
          }
          
          db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            
            // Deletar produto
            db.run('DELETE FROM Produto WHERE id_produto = ?', [id], function(err) {
              if (err) {
                db.run('ROLLBACK');
                return reject(err);
              }
              
              // Deletar estoque
              db.run('DELETE FROM Estoque WHERE id_estoque = ?', [produto.id_estoque], function(err) {
                if (err) {
                  db.run('ROLLBACK');
                  return reject(err);
                }
                
                db.run('COMMIT');
                resolve({ changes: this.changes });
              });
            });
          });
        })
        .catch(reject);
    });
  }
}

module.exports = Produto;
