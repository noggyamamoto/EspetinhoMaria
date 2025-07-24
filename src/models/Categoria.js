const BaseModel = require('./BaseModel');

class Categoria extends BaseModel {
  constructor() {
    super('Categoria');
  }

  // Buscar todas as categorias ordenadas por ID
  async findAllOrdered() {
    return this.findAll('ORDER BY id_categoria');
  }

  // Buscar categoria por ID
  async findByIdCategoria(id) {
    return this.findById(id, 'id_categoria');
  }

  // Validar se uma categoria existe
  async exists(id) {
    const categoria = await this.findByIdCategoria(id);
    return !!categoria;
  }

  // Buscar produtos por categoria
  async findProdutosByCategoria(id_categoria) {
    const query = `
      SELECT p.*, e.disponivel, e.data_cadastro
      FROM Produto p
      JOIN Estoque e ON p.id_estoque = e.id_estoque
      WHERE e.id_categoria = ?
      ORDER BY p.nome
    `;
    return this.customQuery(query, [id_categoria]);
  }
}

module.exports = Categoria;
