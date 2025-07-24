const BaseController = require('./BaseController');
const Categoria = require('../models/Categoria');

class CategoriaController extends BaseController {
  constructor() {
    super();
    this.categoriaModel = new Categoria();
  }

  // Listar todas as categorias
  async index(req, res) {
    try {
      const categorias = await this.categoriaModel.findAllOrdered();
      
      console.log(`✅ ${categorias.length} categorias encontradas`);
      res.json(categorias);
    } catch (error) {
      this.handleError(res, error, 'Erro ao buscar categorias');
    }
  }

  // Buscar categoria por ID
  async show(req, res) {
    try {
      const { id } = req.params;
      const categoria = await this.categoriaModel.findByIdCategoria(id);
      
      if (!categoria) {
        return this.notFoundError(res, 'Categoria não encontrada');
      }
      
      res.json(categoria);
    } catch (error) {
      this.handleError(res, error, 'Erro ao buscar categoria');
    }
  }

  // Buscar produtos por categoria
  async getProdutos(req, res) {
    try {
      const { id } = req.params;
      
      // Verificar se a categoria existe
      const categoria = await this.categoriaModel.findByIdCategoria(id);
      if (!categoria) {
        return this.notFoundError(res, 'Categoria não encontrada');
      }
      
      const produtos = await this.categoriaModel.findProdutosByCategoria(id);
      
      console.log(`✅ ${produtos.length} produtos encontrados para categoria ${categoria.nome}`);
      res.json({
        categoria: categoria,
        produtos: produtos
      });
    } catch (error) {
      this.handleError(res, error, 'Erro ao buscar produtos da categoria');
    }
  }
}

module.exports = CategoriaController;
