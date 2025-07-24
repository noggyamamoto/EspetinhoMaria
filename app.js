/**
 * ============================================================================
 * ESPETINHO MARIA - SERVIDOR PRINCIPAL (ARQUITETURA MVC)
 * ============================================================================
 * 
 * Este é o arquivo principal do servidor seguindo o padrão MVC (Model-View-Controller).
 * Responsável por:
 * - Configurar o servidor Express
 * - Aplicar middlewares globais
 * - Configurar rotas da API e autenticação
 * - Servir arquivos estáticos (Views)
 * - Manter compatibilidade com URLs antigas
 * 
 * Estrutura MVC:
 * - Models: src/models/ (Lógica de dados e banco)
 * - Views: public/ (Interface do usuário)
 * - Controllers: src/controllers/ (Lógica de negócio)
 * - Routes: src/routes/ (Roteamento)
 * - Middlewares: src/middlewares/ (Funcionalidades transversais)
 * 
 * @author Equipe Espetinho Maria
 * @version 2.0.0 - Arquitetura MVC
 * @since 2025-07-24
 */

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

// ============================================================================
// IMPORTAÇÕES DA ARQUITETURA MVC
// ============================================================================

// Configurações e banco de dados
const database = require('./src/config/database');

// Middlewares centralizados
const { 
  corsMiddleware,      // Permite requisições cross-origin
  logMiddleware,       // Log de todas as requisições
  errorHandler,        // Tratamento centralizado de erros
  authMiddleware       // Verificação de autenticação
} = require('./src/middlewares');

// Sistema de rotas organizadas
const apiRoutes = require('./src/routes');           // Todas as rotas da API
const authRoutes = require('./src/routes/authRoutes'); // Rotas de autenticação

// ============================================================================
// CONFIGURAÇÃO DO SERVIDOR EXPRESS
// ============================================================================

const PORT = process.env.PORT || 3000; // Porta do servidor (padrão: 3000)
const app = express();

// Middlewares básicos do Express
app.use(express.urlencoded({ extended: true })); // Parser para dados de formulário
app.use(express.json());                         // Parser para JSON
app.use(cookieParser());                         // Parser para cookies (autenticação)

// ============================================================================
// APLICAÇÃO DE MIDDLEWARES GLOBAIS
// ============================================================================

// Middleware CORS - Permite requisições de qualquer origem
app.use(corsMiddleware);

// Middleware de Log - Registra todas as requisições no console
app.use(logMiddleware);

// ============================================================================
// CONFIGURAÇÃO DE ROTAS
// ============================================================================

/**
 * IMPORTANTE: A ordem das rotas é crucial!
 * 1. APIs primeiro (evita conflito com arquivos estáticos)
 * 2. Rotas de autenticação
 * 3. Arquivos estáticos por último
 */

// Rotas da API REST - Prefixo /api
app.use('/api', apiRoutes);

// Rotas de autenticação (login/logout)
app.use('/admin', authRoutes);                      // Nova estrutura
app.use('/painel-administrador', authRoutes);       // Compatibilidade com URL antiga

// ============================================================================
// ARQUIVOS ESTÁTICOS (CAMADA VIEW)
// ============================================================================

/**
 * Servir arquivos estáticos seguindo a estrutura MVC:
 * - public/home/ -> Site público dos clientes
 * - public/admin/ -> Painel administrativo
 */

// Site público (página inicial e cardápio)
app.use('/', express.static(path.join(__dirname, 'public/home')));

// Painel administrativo - Nova estrutura MVC
app.use('/admin', express.static(path.join(__dirname, 'public/admin')));

// Painel administrativo - Compatibilidade com URLs antigas
app.use('/painel-administrador', express.static(path.join(__dirname, 'public/admin')));

// ============================================================================
// ROTAS DE COMPATIBILIDADE E ESPECIAIS
// ============================================================================

/**
 * Rota para estatísticas - Mantém compatibilidade com código anterior
 * Redireciona /api/estatisticas para /api/pedidos/estatisticas
 */
app.get('/api/estatisticas', (req, res, next) => {
  // Redirecionar para a nova rota seguindo padrão REST
  req.url = '/api/pedidos/estatisticas';
  next();
});

/**
 * Rotas de logout múltiplas para máxima compatibilidade
 * Permite logout de qualquer URL que o usuário tente acessar
 */

// Logout global (URL mais comum do sistema anterior)
app.get('/logout', (req, res) => {
  const AuthController = require('./src/controllers/AuthController');
  const authController = new AuthController();
  authController.logout(req, res);
});

// Logout na nova estrutura
app.get('/admin/logout', (req, res) => {
  const AuthController = require('./src/controllers/AuthController');
  const authController = new AuthController();
  authController.logout(req, res);
});

// Logout na estrutura antiga (compatibilidade)
app.get('/painel-administrador/logout', (req, res) => {
  const AuthController = require('./src/controllers/AuthController');
  const authController = new AuthController();
  authController.logout(req, res);
});

// ============================================================================
// PROTEÇÃO DE ROTAS ADMINISTRATIVAS
// ============================================================================

/**
 * Protege o acesso ao dashboard administrativo com middleware de autenticação
 * Usuários não autenticados são redirecionados para o login
 */

// Dashboard - Nova estrutura MVC
app.use('/admin/painel', authMiddleware, express.static(path.join(__dirname, 'public/admin/painel')));

// Dashboard - Compatibilidade com estrutura antiga
app.use('/painel-administrador/painel', authMiddleware, express.static(path.join(__dirname, 'public/admin/painel')));

// ============================================================================
// TRATAMENTO DE ERROS GLOBAL
// ============================================================================

/**
 * Middleware de tratamento de erros - DEVE SER O ÚLTIMO!
 * Captura todos os erros não tratados e retorna resposta adequada
 */
app.use(errorHandler);

// ============================================================================
// INICIALIZAÇÃO DO SERVIDOR
// ============================================================================

/**
 * Inicia o servidor HTTP na porta especificada
 * Exibe informações sobre endpoints disponíveis
 * Configura graceful shutdown para o banco de dados
 */
app.listen(PORT, async () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log('📁 Estrutura MVC implementada com sucesso!');
  console.log('📋 Endpoints disponíveis:');
  console.log('   - GET /api/status - Status da API');
  console.log('   - /api/produtos - Gerenciar produtos');
  console.log('   - /api/categorias - Gerenciar categorias'); 
  console.log('   - /api/estoques - Gerenciar estoque');
  console.log('   - /api/pedidos - Gerenciar pedidos');
  console.log('   - /admin/login - Login administrativo');
  console.log('   - /admin/painel - Painel administrativo');
  console.log('💡 URLs de compatibilidade mantidas para /painel-administrador/*');
});

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

/**
 * Configura o encerramento gracioso do servidor
 * Fecha conexões do banco de dados adequadamente
 * Responde ao sinal CTRL+C (SIGINT)
 */
process.on('SIGINT', async () => {
  console.log('\n🛑 Encerrando servidor...');
  try {
    // Fecha a conexão com o banco de dados SQLite
    await database.close();
    console.log('✅ Conexão com banco de dados fechada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao fechar conexão com banco:', error);
    process.exit(1);
  }
});
