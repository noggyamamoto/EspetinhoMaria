const BaseModel = require('./BaseModel');

class Estoque extends BaseModel {
  constructor() {
    super('Estoque');
  }

  // Buscar todos os itens do estoque com categoria
  async findAllWithCategoria() {
    const query = `
      SELECT e.id_estoque, e.descricao, c.nome as categoria, 
             e.data_cadastro, e.disponivel, e.id_categoria
      FROM Estoque e
      JOIN Categoria c ON e.id_categoria = c.id_categoria
      ORDER BY e.data_cadastro DESC
    `;
    return this.customQuery(query);
  }

  // Buscar item do estoque por ID
  async findByIdEstoque(id) {
    return this.findById(id, 'id_estoque');
  }

  // Verificar se item está sendo usado em produtos
  async isUsedInProducts(id) {
    const query = 'SELECT COUNT(*) as count FROM Produto WHERE id_estoque = ?';
    const result = await this.customGet(query, [id]);
    return result.count > 0;
  }

  // Buscar itens disponíveis por categoria
  async findAvailableByCategoria(id_categoria) {
    const query = `
      SELECT e.*, c.nome as categoria
      FROM Estoque e
      JOIN Categoria c ON e.id_categoria = c.id_categoria
      WHERE e.id_categoria = ? AND e.disponivel = 1
      ORDER BY e.descricao
    `;
    return this.customQuery(query, [id_categoria]);
  }

  // Atualizar disponibilidade
  async updateDisponibilidade(id, disponivel) {
    return this.update(id, { disponivel }, 'id_estoque');
  }
}

module.exports = Estoque;
