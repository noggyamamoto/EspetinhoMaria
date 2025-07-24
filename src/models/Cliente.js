const BaseModel = require('./BaseModel');

class Cliente extends BaseModel {
  constructor() {
    super('Cliente');
  }

  // Buscar cliente por telefone
  async findByTelefone(telefone) {
    const query = 'SELECT * FROM Cliente WHERE telefone = ?';
    return this.customGet(query, [telefone]);
  }

  // Buscar ou criar cliente
  async findOrCreate(nome, telefone) {
    try {
      // Primeiro tenta encontrar o cliente existente
      let cliente = await this.findByTelefone(telefone);
      
      if (cliente) {
        return cliente;
      }
      
      // Se não encontrou, cria um novo
      const result = await this.create({ nome, telefone });
      return {
        id_cliente: result.id,
        nome,
        telefone
      };
    } catch (error) {
      throw error;
    }
  }

  // Buscar cliente por ID
  async findByIdCliente(id) {
    return this.findById(id, 'id_cliente');
  }

  // Buscar pedidos do cliente
  async findPedidos(id_cliente) {
    const query = `
      SELECT p.*, COUNT(ip.id_item_pedido) as total_itens
      FROM Pedido p
      LEFT JOIN ItemPedido ip ON p.id_pedido = ip.id_pedido
      WHERE p.id_cliente = ?
      GROUP BY p.id_pedido
      ORDER BY p.dataHora DESC
    `;
    return this.customQuery(query, [id_cliente]);
  }
}

module.exports = Cliente;
