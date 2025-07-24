const BaseController = require('./BaseController');
const Estoque = require('../models/Estoque');

class EstoqueController extends BaseController {
  constructor() {
    super();
    this.estoqueModel = new Estoque();
  }

  // Listar todos os itens do estoque
  async index(req, res) {
    try {
      const estoques = await this.estoqueModel.findAllWithCategoria();
      
      console.log(`✅ ${estoques.length} itens de estoque encontrados`);
      res.json(estoques);
    } catch (error) {
      this.handleError(res, error, 'Erro ao buscar itens do estoque');
    }
  }

  // Criar novo item de estoque
  async store(req, res) {
    try {
      const { descricao, id_categoria, disponivel } = req.body;
      
      console.log('📦 Adicionando item ao estoque:', { descricao, id_categoria, disponivel });
      
      // Validações
      const errors = this.validateRequired(req.body, ['descricao', 'id_categoria']);
      
      if (descricao && descricao.trim().length < 3) {
        errors.push('Descrição deve ter pelo menos 3 caracteres');
      }
      
      if (id_categoria && ![1, 2, 3].includes(parseInt(id_categoria))) {
        errors.push('Categoria inválida. Use: 1=ESPETOS, 2=BEBIDAS, 3=INSUMOS');
      }
      
      if (errors.length > 0) {
        return this.validationError(res, errors);
      }
      
      const data_cadastro = new Date().toISOString();
      
      const estoqueData = {
        descricao: descricao.trim(),
        id_categoria: parseInt(id_categoria),
        data_cadastro,
        disponivel: disponivel ? 1 : 0
      };
      
      const result = await this.estoqueModel.create(estoqueData);
      
      console.log('✅ Item de estoque criado com ID:', result.id);
      
      // Buscar dados da categoria para retornar
      const Categoria = require('../models/Categoria');
      const categoriaModel = new Categoria();
      const categoria = await categoriaModel.findByIdCategoria(id_categoria);
      
      this.successResponse(res, {
        id_estoque: result.id,
        descricao: estoqueData.descricao,
        id_categoria: estoqueData.id_categoria,
        categoria: categoria ? categoria.nome : 'Categoria não encontrada',
        data_cadastro: estoqueData.data_cadastro,
        disponivel: estoqueData.disponivel
      }, 'Item adicionado ao estoque com sucesso!', 201);
      
    } catch (error) {
      this.handleError(res, error, 'Erro ao adicionar item ao estoque');
    }
  }

  // Atualizar item do estoque
  async update(req, res) {
    try {
      const { id } = req.params;
      const { descricao, id_categoria, disponivel } = req.body;
      
      console.log('📝 Editando item do estoque ID:', id, { descricao, id_categoria, disponivel });
      
      // Validações
      const errors = this.validateRequired(req.body, ['descricao', 'id_categoria']);
      
      if (descricao && descricao.trim().length < 3) {
        errors.push('Descrição deve ter pelo menos 3 caracteres');
      }
      
      if (id_categoria && ![1, 2, 3].includes(parseInt(id_categoria))) {
        errors.push('Categoria inválida. Use: 1=ESPETOS, 2=BEBIDAS, 3=INSUMOS');
      }
      
      if (errors.length > 0) {
        return this.validationError(res, errors);
      }
      
      const estoqueData = {
        descricao: descricao.trim(),
        id_categoria: parseInt(id_categoria),
        disponivel: disponivel ? 1 : 0
      };
      
      const result = await this.estoqueModel.update(id, estoqueData, 'id_estoque');
      
      if (result.changes === 0) {
        return this.notFoundError(res, 'Item do estoque não encontrado');
      }
      
      console.log('✅ Item do estoque editado com sucesso');
      this.successResponse(res, null, 'Item do estoque editado com sucesso!');
      
    } catch (error) {
      this.handleError(res, error, 'Erro ao editar item do estoque');
    }
  }

  // Deletar item do estoque
  async destroy(req, res) {
    try {
      const { id } = req.params;
      
      console.log('🗑️ Removendo item do estoque ID:', id);
      
      // Verificar se o item está sendo usado em produtos
      const isUsed = await this.estoqueModel.isUsedInProducts(id);
      
      if (isUsed) {
        return this.validationError(res, ['Não é possível remover este item pois ele está sendo usado em produtos']);
      }
      
      const result = await this.estoqueModel.delete(id, 'id_estoque');
      
      if (result.changes === 0) {
        return this.notFoundError(res, 'Item do estoque não encontrado');
      }
      
      console.log('✅ Item do estoque removido com sucesso');
      this.successResponse(res, null, 'Item do estoque removido com sucesso!');
      
    } catch (error) {
      this.handleError(res, error, 'Erro ao remover item do estoque');
    }
  }

  // Buscar item do estoque por ID
  async show(req, res) {
    try {
      const { id } = req.params;
      const estoque = await this.estoqueModel.findByIdEstoque(id);
      
      if (!estoque) {
        return this.notFoundError(res, 'Item do estoque não encontrado');
      }
      
      res.json(estoque);
    } catch (error) {
      this.handleError(res, error, 'Erro ao buscar item do estoque');
    }
  }
}

module.exports = EstoqueController;
