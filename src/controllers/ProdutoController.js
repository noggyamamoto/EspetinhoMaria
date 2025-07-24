/**
 * ============================================================================
 * PRODUTO CONTROLLER - GESTÃO COMPLETA DE PRODUTOS
 * ============================================================================
 * 
 * Controller responsável por todas as operações CRUD relacionadas aos produtos.
 * Gerencia produtos e estoque de forma integrada, mantendo consistência dos dados.
 * 
 * Funcionalidades:
 * - Listagem de produtos com detalhes da categoria
 * - Criação de produto com registro automático no estoque
 * - Atualização de produto e estoque simultaneamente
 * - Remoção de produto com limpeza do estoque
 * - Busca individual de produto por ID
 * - Validações de negócio específicas
 * 
 * Integrações:
 * - Model Produto: Operações na tabela produtos
 * - Model Estoque: Operações na tabela estoque (via Produto)
 * - Categorias: Validação de categorias válidas
 * 
 * @author Equipe Espetinho Maria
 * @version 2.0.0
 * @since 2025-07-24
 */

const BaseController = require('./BaseController');
const Produto = require('../models/Produto');

/**
 * Classe ProdutoController - Gestão de Produtos
 * 
 * Estende BaseController para herdar funcionalidades comuns como
 * validações, tratamento de erros e respostas padronizadas.
 */
class ProdutoController extends BaseController {
  
  /**
   * Construtor do ProdutoController
   * 
   * Inicializa a instância do model Produto que será usado
   * em todas as operações deste controller.
   */
  constructor() {
    super(); // Chama o construtor da classe pai (BaseController)
    this.produtoModel = new Produto();
  }

  // ========================================================================
  // OPERAÇÃO: LISTAR TODOS OS PRODUTOS
  // ========================================================================

  /**
   * Lista todos os produtos com detalhes da categoria
   * 
   * @param {Object} req - Request do Express
   * @param {Object} res - Response do Express
   * 
   * Endpoint: GET /api/produtos
   * 
   * Funcionalidades:
   * - Busca produtos com JOIN nas categorias
   * - Formata dados para exibição consistente
   * - Converte disponibilidade (boolean → Sim/Não)
   * - Inclui informações completas do produto
   * 
   * Resposta de sucesso:
   * [
   *   {
   *     "id_produto": 1,
   *     "nome": "Espeto de Alcatra",
   *     "descricao": "Alcatra no espeto",
   *     "preco_unitario": 12.50,
   *     "categoria": "ESPETOS",
   *     "disponivel": "Sim",
   *     "id_categoria": 1,
   *     "data_cadastro": "2025-01-20T10:30:00Z"
   *   }
   * ]
   */
  async index(req, res) {
    try {
      // Busca todos os produtos com detalhes das categorias
      const produtos = await this.produtoModel.findAllWithDetails();
      
      // Formata os dados para apresentação padronizada
      const produtosFormatados = produtos.map(row => ({
        id_produto: row.id_produto,
        nome: row.nome,
        descricao: row.descricao,
        preco_unitario: row.preco_unitario,
        categoria: row.categoria, // Nome da categoria (ESPETOS, BEBIDAS, etc.)
        disponivel: row.disponivel ? 'Sim' : 'Não', // Conversão boolean → string
        id_categoria: row.id_categoria,
        data_cadastro: row.data_cadastro
      }));
      
      // Log para acompanhamento
      console.log(`✅ ${produtosFormatados.length} produtos encontrados`);
      
      // Retorna lista formatada
      res.json(produtosFormatados);
      
    } catch (error) {
      // Trata erros usando método herdado do BaseController
      this.handleError(res, error, 'Erro ao buscar produtos');
    }
  }

  // ========================================================================
  // OPERAÇÃO: CRIAR NOVO PRODUTO
  // ========================================================================

  /**
   * Cria um novo produto com registro automático no estoque
   * 
   * @param {Object} req - Request do Express
   * @param {Object} res - Response do Express
   * 
   * Endpoint: POST /api/produtos
   * 
   * Body esperado:
   * {
   *   "nome": "Nome do produto",
   *   "descricao": "Descrição opcional",
   *   "preco_unitario": 15.50,
   *   "id_categoria": 1,
   *   "disponivel": true
   * }
   * 
   * Processo de criação:
   * 1. Validação de campos obrigatórios
   * 2. Validação de regras de negócio
   * 3. Preparação dos dados para produto e estoque
   * 4. Transação: criação em ambas as tabelas
   * 5. Resposta com dados do produto criado
   * 
   * Validações aplicadas:
   * - Nome: obrigatório, mínimo 2 caracteres
   * - Preço: obrigatório, maior que zero
   * - Categoria: obrigatória, deve ser 1, 2 ou 3
   * - Disponível: opcional, padrão false
   */
  async store(req, res) {
    try {
      // Extrai dados do corpo da requisição
      const { nome, descricao, preco_unitario, id_categoria, disponivel } = req.body;
      
      // Log para debugging
      console.log('📦 Criando novo produto:', { nome, descricao, preco_unitario, id_categoria, disponivel });
      
      // ===== VALIDAÇÕES =====
      
      // Validação de campos obrigatórios
      const errors = this.validateRequired(req.body, ['nome', 'preco_unitario', 'id_categoria']);
      
      // Validação específica: nome mínimo
      if (nome && nome.trim().length < 2) {
        errors.push('Nome deve ter pelo menos 2 caracteres');
      }
      
      // Validação específica: preço positivo
      if (preco_unitario && preco_unitario <= 0) {
        errors.push('Preço deve ser um valor válido maior que zero');
      }
      
      // Validação específica: categoria válida
      if (id_categoria && ![1, 2, 3].includes(parseInt(id_categoria))) {
        errors.push('Categoria inválida. Use: 1=ESPETOS, 2=BEBIDAS, 3=INSUMOS');
      }
      
      // Se há erros de validação, retorna erro 400
      if (errors.length > 0) {
        return this.validationError(res, errors);
      }
      
      // ===== PREPARAÇÃO DOS DADOS =====
      
      const data_cadastro = new Date().toISOString();
      const disponivelInt = disponivel ? 1 : 0; // Conversão boolean → integer
      
      // Dados para tabela produtos
      const produtoData = {
        nome: nome.trim(),
        descricao: descricao ? descricao.trim() : '',
        preco_unitario: parseFloat(preco_unitario)
      };
      
      // Dados para tabela estoque (relacionada)
      const estoqueData = {
        descricao: nome.trim(), // Usa o mesmo nome do produto
        id_categoria: parseInt(id_categoria),
        data_cadastro,
        disponivel: disponivelInt
      };
      
      // ===== OPERAÇÃO DE CRIAÇÃO =====
      
      // Cria produto e estoque em transação atômica
      const result = await this.produtoModel.createWithEstoque(produtoData, estoqueData);
      
      // Log de sucesso
      console.log('✅ Produto criado com ID:', result.id_produto);
      
      // Resposta de sucesso com dados do produto criado
      this.successResponse(res, {
        id_produto: result.id_produto,
        nome: produtoData.nome,
        descricao: produtoData.descricao,
        preco_unitario: produtoData.preco_unitario,
        id_estoque: result.id_estoque,
        id_categoria: parseInt(id_categoria),
        disponivel: disponivelInt
      }, 'Produto criado com sucesso!', 201); // HTTP 201 Created
      
    } catch (error) {
      // Trata erros de criação
      this.handleError(res, error, 'Erro ao criar produto');
    }
  }

  // ========================================================================
  // OPERAÇÃO: ATUALIZAR PRODUTO EXISTENTE
  // ========================================================================

  /**
   * Atualiza um produto existente e seu registro no estoque
   * 
   * @param {Object} req - Request do Express
   * @param {Object} res - Response do Express
   * 
   * Endpoint: PUT /api/produtos/:id
   * 
   * Parâmetros:
   * - id: ID do produto a ser atualizado (na URL)
   * 
   * Body esperado:
   * {
   *   "preco_unitario": 18.00,
   *   "descricao": "Nova descrição",
   *   "id_categoria": 2,
   *   "disponivel": false
   * }
   * 
   * Observações:
   * - Nome não é alterável (regra de negócio)
   * - Atualização simultânea em produtos e estoque
   * - Validação de produto existente
   */
  async update(req, res) {
    try {
      // Extrai ID da URL e dados do body
      const { id } = req.params;
      const { preco_unitario, descricao, id_categoria, disponivel } = req.body;
      
      // Log da operação
      console.log('📝 Editando produto ID:', id, { preco_unitario, descricao, id_categoria, disponivel });
      
      // ===== VALIDAÇÕES =====
      
      // Campos obrigatórios para atualização
      const errors = this.validateRequired(req.body, ['preco_unitario', 'descricao', 'id_categoria']);
      
      // Validação: preço positivo
      if (preco_unitario && preco_unitario <= 0) {
        errors.push('Preço deve ser um valor válido maior que zero');
      }
      
      // Validação: descrição mínima
      if (descricao && descricao.trim().length < 3) {
        errors.push('Descrição deve ter pelo menos 3 caracteres');
      }
      
      // Validação: categoria válida
      if (id_categoria && ![1, 2, 3].includes(parseInt(id_categoria))) {
        errors.push('Categoria inválida. Use: 1=ESPETOS, 2=BEBIDAS, 3=INSUMOS');
      }
      
      // Retorna erros de validação se existirem
      if (errors.length > 0) {
        return this.validationError(res, errors);
      }
      
      // ===== PREPARAÇÃO DOS DADOS =====
      
      // Dados para atualizar na tabela produtos
      const produtoData = {
        preco_unitario: parseFloat(preco_unitario)
      };
      
      // Dados para atualizar na tabela estoque
      const estoqueData = {
        descricao: descricao.trim(),
        id_categoria: parseInt(id_categoria),
        disponivel: disponivel ? 1 : 0
      };
      
      // ===== OPERAÇÃO DE ATUALIZAÇÃO =====
      
      // Atualiza produto e estoque relacionado
      const result = await this.produtoModel.updateWithEstoque(id, produtoData, estoqueData);
      
      // Verifica se o produto foi encontrado e atualizado
      if (result.changes === 0) {
        return this.notFoundError(res, 'Produto não encontrado');
      }
      
      // Log e resposta de sucesso
      console.log('✅ Produto editado com sucesso');
      this.successResponse(res, null, 'Produto editado com sucesso!');
      
    } catch (error) {
      // Trata erros de atualização
      this.handleError(res, error, 'Erro ao editar produto');
    }
  }

  // ========================================================================
  // OPERAÇÃO: REMOVER PRODUTO
  // ========================================================================

  /**
   * Remove um produto e sua entrada no estoque
   * 
   * @param {Object} req - Request do Express
   * @param {Object} res - Response do Express
   * 
   * Endpoint: DELETE /api/produtos/:id
   * 
   * Parâmetros:
   * - id: ID do produto a ser removido (na URL)
   * 
   * Processo de remoção:
   * 1. Validação de existência do produto
   * 2. Remoção em cascata (produto + estoque)
   * 3. Verificação de integridade referencial
   * 4. Confirmação da operação
   * 
   * Regras de negócio:
   * - Remove produto da tabela produtos
   * - Remove entrada relacionada da tabela estoque
   * - Operação atômica (transação)
   */
  async destroy(req, res) {
    try {
      // Extrai ID da URL
      const { id } = req.params;
      
      // Log da operação
      console.log('🗑️ Removendo produto ID:', id);
      
      // ===== OPERAÇÃO DE REMOÇÃO =====
      
      // Remove produto e estoque relacionado em transação
      const result = await this.produtoModel.deleteWithEstoque(id);
      
      // Verifica se o produto foi encontrado e removido
      if (result.changes === 0) {
        return this.notFoundError(res, 'Produto não encontrado');
      }
      
      // Log e resposta de sucesso
      console.log('✅ Produto removido com sucesso');
      this.successResponse(res, null, 'Produto removido com sucesso!');
      
    } catch (error) {
      // Trata erros de remoção (ex: violações de integridade referencial)
      this.handleError(res, error, 'Erro ao remover produto');
    }
  }

  // ========================================================================
  // OPERAÇÃO: BUSCAR PRODUTO POR ID
  // ========================================================================

  /**
   * Busca um produto específico por seu ID
   * 
   * @param {Object} req - Request do Express
   * @param {Object} res - Response do Express
   * 
   * Endpoint: GET /api/produtos/:id
   * 
   * Parâmetros:
   * - id: ID do produto a ser buscado (na URL)
   * 
   * Funcionalidades:
   * - Busca produto com detalhes da categoria
   * - Inclui informações completas do estoque
   * - Formatação consistente dos dados
   * 
   * Usado por:
   * - Formulários de edição
   * - Páginas de detalhes do produto
   * - Integrações com outros sistemas
   */
  async show(req, res) {
    try {
      // Extrai ID da URL
      const { id } = req.params;
      
      // ===== BUSCA DO PRODUTO =====
      
      // Busca produto com detalhes da categoria
      const produto = await this.produtoModel.findByIdWithDetails(id);
      
      // Verifica se o produto foi encontrado
      if (!produto) {
        return this.notFoundError(res, 'Produto não encontrado');
      }
      
      // Retorna dados do produto encontrado
      res.json(produto);
      
    } catch (error) {
      // Trata erros de busca
      this.handleError(res, error, 'Erro ao buscar produto');
    }
  }
}

// ============================================================================
// EXPORTAÇÃO
// ============================================================================

/**
 * Exporta a classe ProdutoController para uso nas rotas
 * 
 * Uso nas rotas:
 * const ProdutoController = require('../controllers/ProdutoController');
 * const produtoController = new ProdutoController();
 * 
 * router.get('/produtos', produtoController.index.bind(produtoController));
 * router.post('/produtos', produtoController.store.bind(produtoController));
 */
module.exports = ProdutoController;
