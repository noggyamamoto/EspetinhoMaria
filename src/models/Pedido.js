const BaseModel = require('./BaseModel');

class Pedido extends BaseModel {
  constructor() {
    super('Pedido');
  }

  // Buscar todos os pedidos com cliente
  async findAllWithCliente() {
    const query = `
      SELECT p.*, c.nome as nome_cliente, c.telefone 
      FROM Pedido p
      LEFT JOIN Cliente c ON p.id_cliente = c.id_cliente
      ORDER BY p.dataHora DESC
    `;
    return this.customQuery(query);
  }

  // Buscar pedido por ID
  async findByIdPedido(id) {
    return this.findById(id, 'id_pedido');
  }

  // Buscar pedido com detalhes completos
  async findByIdWithDetails(id) {
    const query = `
      SELECT p.*, c.nome as nome_cliente, c.telefone
      FROM Pedido p
      LEFT JOIN Cliente c ON p.id_cliente = c.id_cliente
      WHERE p.id_pedido = ?
    `;
    return this.customGet(query, [id]);
  }

  // Buscar itens do pedido
  async findItensPedido(id_pedido) {
    const query = `
      SELECT ip.*, prod.nome as nome_produto, prod.descricao
      FROM ItemPedido ip
      JOIN Produto prod ON ip.id_produto = prod.id_produto
      WHERE ip.id_pedido = ?
    `;
    return this.customQuery(query, [id_pedido]);
  }

  // Criar pedido completo com itens
  async createWithItens(pedidoData, itens) {
    const database = require('../config/database');
    const db = database.getConnection();
    
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        // Criar o pedido
        const pedidoQuery = 'INSERT INTO Pedido (dataHora, status, valor_total, id_cliente) VALUES (?, ?, ?, ?)';
        db.run(pedidoQuery, [
          pedidoData.dataHora,
          pedidoData.status || 'PENDENTE',
          pedidoData.valor_total,
          pedidoData.id_cliente
        ], function(err) {
          if (err) {
            db.run('ROLLBACK');
            return reject(err);
          }
          
          const id_pedido = this.lastID;
          
          // Inserir itens do pedido
          if (itens && itens.length > 0) {
            let itemsProcessed = 0;
            const totalItems = itens.length;
            
            itens.forEach(item => {
              const itemQuery = 'INSERT INTO ItemPedido (id_pedido, id_produto, quantidade, preco_unitario) VALUES (?, ?, ?, ?)';
              db.run(itemQuery, [
                id_pedido,
                item.id_produto,
                item.quantidade,
                item.preco_unitario
              ], function(err) {
                if (err) {
                  db.run('ROLLBACK');
                  return reject(err);
                }
                
                itemsProcessed++;
                if (itemsProcessed === totalItems) {
                  db.run('COMMIT');
                  resolve({ id_pedido });
                }
              });
            });
          } else {
            db.run('COMMIT');
            resolve({ id_pedido });
          }
        });
      });
    });
  }

  // Atualizar status do pedido
  async updateStatus(id, status) {
    return this.update(id, { status }, 'id_pedido');
  }

  // Buscar estatísticas do dashboard
  async getEstatisticas(dataInicio) {
    const query = `
      SELECT COUNT(*) as pedidos_24h, COALESCE(SUM(valor_total), 0) as faturamento_24h
      FROM Pedido 
      WHERE dataHora >= ?
    `;
    return this.customGet(query, [dataInicio]);
  }

  // Buscar pedidos pendentes
  async findPendentes() {
    const query = `
      SELECT p.*, c.nome as nome_cliente, c.telefone
      FROM Pedido p
      LEFT JOIN Cliente c ON p.id_cliente = c.id_cliente
      WHERE p.status = 'PENDENTE'
      ORDER BY p.dataHora ASC
    `;
    return this.customQuery(query);
  }
}

module.exports = Pedido;
