const BaseController = require('./BaseController');
const Produto = require('../models/Produto');

class ProdutoController extends BaseController {
  constructor() {
    super();
    this.produtoModel = new Produto();
  }

  // Listar todos os produtos
  async index(req, res) {
    try {
      const produtos = await this.produtoModel.findAllWithDetails();
      
      // Formatar os dados dos produtos
      const produtosFormatados = produtos.map(row => ({
        id_produto: row.id_produto,
        nome: row.nome,
        descricao: row.descricao,
        preco_unitario: row.preco_unitario,
        categoria: row.categoria,
        disponivel: row.disponivel ? 'Sim' : 'Não',
        id_categoria: row.id_categoria,
        data_cadastro: row.data_cadastro
      }));
      
      console.log(`✅ ${produtosFormatados.length} produtos encontrados`);
      res.json(produtosFormatados);
    } catch (error) {
      this.handleError(res, error, 'Erro ao buscar produtos');
    }
  }

  // Criar novo produto
  async store(req, res) {
    try {
      const { nome, descricao, preco_unitario, id_categoria, disponivel } = req.body;
      
      console.log('📦 Criando novo produto:', { nome, descricao, preco_unitario, id_categoria, disponivel });
      
      // Validações
      const errors = this.validateRequired(req.body, ['nome', 'preco_unitario', 'id_categoria']);
      
      if (nome && nome.trim().length < 2) {
        errors.push('Nome deve ter pelo menos 2 caracteres');
      }
      
      if (preco_unitario && preco_unitario <= 0) {
        errors.push('Preço deve ser um valor válido maior que zero');
      }
      
      if (id_categoria && ![1, 2, 3].includes(parseInt(id_categoria))) {
        errors.push('Categoria inválida. Use: 1=ESPETOS, 2=BEBIDAS, 3=INSUMOS');
      }
      
      if (errors.length > 0) {
        return this.validationError(res, errors);
      }
      
      const data_cadastro = new Date().toISOString();
      const disponivelInt = disponivel ? 1 : 0;
      
      // Dados para criar o produto e estoque
      const produtoData = {
        nome: nome.trim(),
        descricao: descricao ? descricao.trim() : '',
        preco_unitario: parseFloat(preco_unitario)
      };
      
      const estoqueData = {
        descricao: nome.trim(),
        id_categoria: parseInt(id_categoria),
        data_cadastro,
        disponivel: disponivelInt
      };
      
      const result = await this.produtoModel.createWithEstoque(produtoData, estoqueData);
      
      console.log('✅ Produto criado com ID:', result.id_produto);
      
      this.successResponse(res, {
        id_produto: result.id_produto,
        nome: produtoData.nome,
        descricao: produtoData.descricao,
        preco_unitario: produtoData.preco_unitario,
        id_estoque: result.id_estoque,
        id_categoria: parseInt(id_categoria),
        disponivel: disponivelInt
      }, 'Produto criado com sucesso!', 201);
      
    } catch (error) {
      this.handleError(res, error, 'Erro ao criar produto');
    }
  }

  // Atualizar produto
  async update(req, res) {
    try {
      const { id } = req.params;
      const { preco_unitario, descricao, id_categoria, disponivel } = req.body;
      
      console.log('📝 Editando produto ID:', id, { preco_unitario, descricao, id_categoria, disponivel });
      
      // Validações
      const errors = this.validateRequired(req.body, ['preco_unitario', 'descricao', 'id_categoria']);
      
      if (preco_unitario && preco_unitario <= 0) {
        errors.push('Preço deve ser um valor válido maior que zero');
      }
      
      if (descricao && descricao.trim().length < 3) {
        errors.push('Descrição deve ter pelo menos 3 caracteres');
      }
      
      if (id_categoria && ![1, 2, 3].includes(parseInt(id_categoria))) {
        errors.push('Categoria inválida. Use: 1=ESPETOS, 2=BEBIDAS, 3=INSUMOS');
      }
      
      if (errors.length > 0) {
        return this.validationError(res, errors);
      }
      
      const produtoData = {
        preco_unitario: parseFloat(preco_unitario)
      };
      
      const estoqueData = {
        descricao: descricao.trim(),
        id_categoria: parseInt(id_categoria),
        disponivel: disponivel ? 1 : 0
      };
      
      const result = await this.produtoModel.updateWithEstoque(id, produtoData, estoqueData);
      
      if (result.changes === 0) {
        return this.notFoundError(res, 'Produto não encontrado');
      }
      
      console.log('✅ Produto editado com sucesso');
      this.successResponse(res, null, 'Produto editado com sucesso!');
      
    } catch (error) {
      this.handleError(res, error, 'Erro ao editar produto');
    }
  }

  // Deletar produto
  async destroy(req, res) {
    try {
      const { id } = req.params;
      
      console.log('🗑️ Removendo produto ID:', id);
      
      const result = await this.produtoModel.deleteWithEstoque(id);
      
      if (result.changes === 0) {
        return this.notFoundError(res, 'Produto não encontrado');
      }
      
      console.log('✅ Produto removido com sucesso');
      this.successResponse(res, null, 'Produto removido com sucesso!');
      
    } catch (error) {
      this.handleError(res, error, 'Erro ao remover produto');
    }
  }

  // Buscar produto por ID
  async show(req, res) {
    try {
      const { id } = req.params;
      const produto = await this.produtoModel.findByIdWithDetails(id);
      
      if (!produto) {
        return this.notFoundError(res, 'Produto não encontrado');
      }
      
      res.json(produto);
    } catch (error) {
      this.handleError(res, error, 'Erro ao buscar produto');
    }
  }
}

module.exports = ProdutoController;
