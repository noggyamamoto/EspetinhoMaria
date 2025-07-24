/**
 * ============================================================================
 * INDEX ROUTES - CENTRALIZADOR DE TODAS AS ROTAS DA API
 * ============================================================================
 * 
 * Arquivo principal que organiza e expõe todas as rotas da API REST.
 * Implementa o padrão de roteamento modular do Express.js.
 * 
 * Estrutura da API:
 * - /api/produtos    - CRUD de produtos
 * - /api/categorias  - Gestão de categorias
 * - /api/estoques    - Controle de estoque
 * - /api/pedidos     - Gestão de pedidos
 * - /api/auth        - Autenticação e autorização
 * - /api/status      - Status e health check da API
 * 
 * Padrão RESTful:
 * - GET: Buscar recursos
 * - POST: Criar novos recursos
 * - PUT: Atualizar recursos existentes
 * - DELETE: Remover recursos
 * 
 * @author Equipe Espetinho Maria
 * @version 2.0.0
 * @since 2025-07-24
 */

const express = require('express');

// ============================================================================
// IMPORTAÇÃO DAS ROTAS MODULARES
// ============================================================================

/**
 * Importa todas as rotas específicas organizadas por domínio
 * 
 * Cada arquivo de rota gerencia um conjunto específico de endpoints:
 * - produtoRoutes: Gestão completa de produtos
 * - categoriaRoutes: CRUD de categorias (ESPETOS, BEBIDAS, INSUMOS)
 * - estoqueRoutes: Controle de estoque e disponibilidade
 * - pedidoRoutes: Gestão de pedidos e vendas
 * - authRoutes: Sistema de login/logout
 */
const produtoRoutes = require('./produtoRoutes');
const categoriaRoutes = require('./categoriaRoutes');
const estoqueRoutes = require('./estoqueRoutes');
const pedidoRoutes = require('./pedidoRoutes');
const authRoutes = require('./authRoutes');

// ============================================================================
// CONFIGURAÇÃO DO ROUTER PRINCIPAL
// ============================================================================

/**
 * Cria router principal que agregará todas as sub-rotas
 * Este router será montado em /api no app.js principal
 */
const router = express.Router();

// ============================================================================
// REGISTRO DAS ROTAS DA API
// ============================================================================

/**
 * Configuração das rotas modulares
 * 
 * Prefixo /api será adicionado no app.js, resultando em:
 * - /api/produtos/* → produtoRoutes
 * - /api/categorias/* → categoriaRoutes
 * - /api/estoques/* → estoqueRoutes
 * - /api/pedidos/* → pedidoRoutes
 * - /api/auth/* → authRoutes
 */

// Rotas de produtos: CRUD completo com integração de estoque
router.use('/produtos', produtoRoutes);

// Rotas de categorias: Gestão das 3 categorias principais
router.use('/categorias', categoriaRoutes);

// Rotas de estoque: Controle de disponibilidade e quantidade
router.use('/estoques', estoqueRoutes);

// Rotas de pedidos: Sistema de vendas e histórico
router.use('/pedidos', pedidoRoutes);

// Rotas de autenticação: Login/logout do painel admin
router.use('/auth', authRoutes);

// ============================================================================
// ROTA DE STATUS E HEALTH CHECK
// ============================================================================

/**
 * Endpoint de status da API
 * 
 * @route GET /api/status
 * @description Verifica se a API está funcionando corretamente
 * @access Public
 * 
 * Resposta:
 * {
 *   "status": "API funcionando",
 *   "timestamp": "2025-01-20T10:30:45.123Z",
 *   "version": "1.0.0"
 * }
 * 
 * Usado para:
 * - Health checks automatizados
 * - Monitoramento de uptime
 * - Verificação de conectividade
 * - Debug de problemas de rede
 */
router.get('/status', (req, res) => {
  res.json({
    status: 'API funcionando',
    timestamp: new Date().toISOString(), // Data/hora atual em UTC
    version: '1.0.0' // Versão da API para controle de compatibilidade
  });
});

// ============================================================================
// EXPORTAÇÃO
// ============================================================================

/**
 * Exporta o router configurado para uso no app.js principal
 * 
 * Uso no app.js:
 * const apiRoutes = require('./src/routes');
 * app.use('/api', apiRoutes);
 * 
 * Isso resulta na estrutura final de URLs:
 * - GET /api/status
 * - GET /api/produtos
 * - POST /api/produtos
 * - GET /api/categorias
 * - POST /api/auth/login
 * - etc.
 */
module.exports = router;
