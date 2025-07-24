/**
 * ============================================================================
 * PRODUTO ROUTES - ROTAS RESTful PARA GESTÃO DE PRODUTOS
 * ============================================================================
 * 
 * Define todas as rotas relacionadas ao CRUD de produtos.
 * Implementa padrão RESTful completo com integração ao ProdutoController.
 * 
 * Endpoints disponíveis:
 * - GET /api/produtos      - Lista todos os produtos
 * - POST /api/produtos     - Cria novo produto
 * - GET /api/produtos/:id  - Busca produto específico
 * - PUT /api/produtos/:id  - Atualiza produto existente
 * - DELETE /api/produtos/:id - Remove produto
 * 
 * Integração:
 * - Controller: ProdutoController (lógica de negócio)
 * - Model: Produto (operações de banco de dados)
 * - Middleware: Validações e tratamento de erros
 * 
 * @author Equipe Espetinho Maria
 * @version 2.0.0
 * @since 2025-07-24
 */

const express = require('express');
const ProdutoController = require('../controllers/ProdutoController');

// ============================================================================
// CONFIGURAÇÃO DO ROUTER E CONTROLLER
// ============================================================================

/**
 * Cria router específico para rotas de produtos
 * Este router será montado em /api/produtos no index.js
 */
const router = express.Router();

/**
 * Instancia o controller de produtos
 * Uma única instância é reutilizada em todas as rotas para eficiência
 */
const produtoController = new ProdutoController();

// ============================================================================
// DEFINIÇÃO DAS ROTAS RESTful
// ============================================================================

/**
 * GET /api/produtos
 * Lista todos os produtos cadastrados
 * 
 * @description Retorna lista completa de produtos com detalhes da categoria
 * @access Public (pode ser protegido futuramente)
 * @controller ProdutoController.index
 * 
 * Resposta de sucesso (200):
 * [
 *   {
 *     "id_produto": 1,
 *     "nome": "Espeto de Alcatra",
 *     "descricao": "Carne bovina grelhada",
 *     "preco_unitario": 12.50,
 *     "categoria": "ESPETOS",
 *     "disponivel": "Sim",
 *     "id_categoria": 1,
 *     "data_cadastro": "2025-01-20T10:30:00Z"
 *   }
 * ]
 * 
 * Funcionalidades:
 * - Busca com JOIN nas categorias
 * - Formatação de dados para apresentação
 * - Conversão de disponibilidade (boolean → string)
 */
router.get('/', (req, res) => produtoController.index(req, res));

/**
 * POST /api/produtos
 * Cria um novo produto
 * 
 * @description Cria produto com registro automático no estoque
 * @access Private (requer autenticação)
 * @controller ProdutoController.store
 * 
 * Body obrigatório:
 * {
 *   "nome": "Nome do produto",
 *   "descricao": "Descrição opcional",
 *   "preco_unitario": 15.50,
 *   "id_categoria": 1,
 *   "disponivel": true
 * }
 * 
 * Validações:
 * - nome: obrigatório, mínimo 2 caracteres
 * - preco_unitario: obrigatório, maior que zero
 * - id_categoria: obrigatório, deve ser 1, 2 ou 3
 * 
 * Resposta de sucesso (201):
 * {
 *   "sucesso": true,
 *   "mensagem": "Produto criado com sucesso!",
 *   "dados": { produto_criado }
 * }
 */
router.post('/', (req, res) => produtoController.store(req, res));

/**
 * GET /api/produtos/:id
 * Busca um produto específico por ID
 * 
 * @description Retorna detalhes completos de um produto
 * @access Public
 * @controller ProdutoController.show
 * @param {number} id - ID do produto (parâmetro na URL)
 * 
 * Exemplo: GET /api/produtos/1
 * 
 * Resposta de sucesso (200):
 * {
 *   "id_produto": 1,
 *   "nome": "Espeto de Alcatra",
 *   "descricao": "Carne bovina grelhada",
 *   "preco_unitario": 12.50,
 *   "categoria": "ESPETOS",
 *   "disponivel": true,
 *   "id_categoria": 1
 * }
 * 
 * Resposta de erro (404):
 * {
 *   "erro": "Produto não encontrado"
 * }
 */
router.get('/:id', (req, res) => produtoController.show(req, res));

/**
 * PUT /api/produtos/:id
 * Atualiza um produto existente
 * 
 * @description Atualiza produto e estoque simultaneamente
 * @access Private (requer autenticação)
 * @controller ProdutoController.update
 * @param {number} id - ID do produto (parâmetro na URL)
 * 
 * Body obrigatório:
 * {
 *   "preco_unitario": 18.00,
 *   "descricao": "Nova descrição",
 *   "id_categoria": 2,
 *   "disponivel": false
 * }
 * 
 * Observações:
 * - Nome não é alterável (regra de negócio)
 * - Atualização em transação (produto + estoque)
 * 
 * Resposta de sucesso (200):
 * {
 *   "sucesso": true,
 *   "mensagem": "Produto editado com sucesso!"
 * }
 */
router.put('/:id', (req, res) => produtoController.update(req, res));

/**
 * DELETE /api/produtos/:id
 * Remove um produto
 * 
 * @description Remove produto e sua entrada no estoque
 * @access Private (requer autenticação)
 * @controller ProdutoController.destroy
 * @param {number} id - ID do produto (parâmetro na URL)
 * 
 * Processo:
 * - Remoção em cascata (produto + estoque)
 * - Verificação de integridade referencial
 * - Operação atômica (transação)
 * 
 * Resposta de sucesso (200):
 * {
 *   "sucesso": true,
 *   "mensagem": "Produto removido com sucesso!"
 * }
 * 
 * Resposta de erro (404):
 * {
 *   "erro": "Produto não encontrado"
 * }
 */
router.delete('/:id', (req, res) => produtoController.destroy(req, res));

// ============================================================================
// EXPORTAÇÃO
// ============================================================================

/**
 * Exporta o router configurado para uso no index.js de rotas
 * 
 * Uso no index.js:
 * const produtoRoutes = require('./produtoRoutes');
 * router.use('/produtos', produtoRoutes);
 * 
 * Resultando em URLs finais:
 * - GET /api/produtos
 * - POST /api/produtos
 * - GET /api/produtos/123
 * - PUT /api/produtos/123
 * - DELETE /api/produtos/123
 */
module.exports = router;
