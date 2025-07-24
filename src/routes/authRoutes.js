/**
 * ============================================================================
 * AUTH ROUTES - ROTAS DE AUTENTICAÇÃO E AUTORIZAÇÃO
 * ============================================================================
 * 
 * Define todas as rotas relacionadas ao sistema de autenticação.
 * Gerencia login, logout e controle de acesso ao painel administrativo.
 * 
 * Endpoints disponíveis:
 * - POST /api/auth/login  - Processa login do usuário
 * - GET /api/auth/logout  - Processa logout do usuário
 * 
 * Características:
 * - Baseado em cookies HTTP-only para segurança
 * - Redirecionamentos inteligentes baseados na URL de origem
 * - Compatibilidade com URLs antigas e novas do painel
 * - Validação de credenciais no backend
 * 
 * Segurança:
 * - Cookies seguros (httpOnly: true)
 * - Não exposição de tokens no JavaScript client-side
 * - Validação server-side de todas as operações
 * 
 * @author Equipe Espetinho Maria
 * @version 2.0.0
 * @since 2025-07-24
 */

const express = require('express');
const AuthController = require('../controllers/AuthController');

// ============================================================================
// CONFIGURAÇÃO DO ROUTER E CONTROLLER
// ============================================================================

/**
 * Cria router específico para rotas de autenticação
 * Este router será montado em /api/auth no index.js
 */
const router = express.Router();

/**
 * Instancia o controller de autenticação
 * Uma única instância é reutilizada em todas as rotas
 */
const authController = new AuthController();

// ============================================================================
// DEFINIÇÃO DAS ROTAS DE AUTENTICAÇÃO
// ============================================================================

/**
 * POST /api/auth/login
 * Processa tentativa de login do usuário
 * 
 * @description Autentica usuário e cria sessão segura
 * @access Public
 * @controller AuthController.login
 * 
 * Body obrigatório:
 * {
 *   "usuario": "admin",
 *   "senha": "1234"
 * }
 * 
 * Credenciais válidas (exemplo):
 * - Usuário: admin
 * - Senha: 1234
 * 
 * Processo de autenticação:
 * 1. Validação de campos obrigatórios
 * 2. Verificação das credenciais
 * 3. Criação de cookie de autenticação (httpOnly)
 * 4. Redirecionamento baseado na URL de origem
 * 
 * Sucesso (302 Redirect):
 * - Origem /painel-administrador → /painel-administrador/painel/dashboard.html
 * - Outras origens → /admin/painel/dashboard.html
 * - Cookie 'auth' = 'true' (httpOnly)
 * 
 * Erro de credenciais (302 Redirect):
 * - Origem /painel-administrador → /painel-administrador/login.html?erro=1
 * - Outras origens → /admin/login.html?erro=1
 * 
 * Erro de sistema (302 Redirect):
 * - Origem /painel-administrador → /painel-administrador/login.html?erro=sistema
 * - Outras origens → /admin/login.html?erro=sistema
 * 
 * Headers importantes:
 * - Set-Cookie: auth=true; HttpOnly (segurança)
 * - Location: URL de redirecionamento
 */
router.post('/login', (req, res) => authController.login(req, res));

/**
 * GET /api/auth/logout
 * Processa logout do usuário
 * 
 * @description Remove sessão e redireciona para login
 * @access Private (usuário deve estar logado)
 * @controller AuthController.logout
 * 
 * Processo de logout:
 * 1. Remove cookie de autenticação
 * 2. Limpa dados da sessão
 * 3. Redireciona para página de login apropriada
 * 
 * Resposta (302 Redirect):
 * - Origem /painel-administrador → /painel-administrador/login.html
 * - Outras origens → /admin/login.html
 * - Cookie 'auth' é removido
 * 
 * Headers importantes:
 * - Set-Cookie: auth=; expires=Thu, 01 Jan 1970 00:00:00 GMT (remove cookie)
 * - Location: URL de redirecionamento
 * 
 * Compatibilidade:
 * - Funciona tanto via GET (link direto) quanto POST (formulário)
 * - Detecta automaticamente a URL de origem
 * - Mantém consistência com o sistema de login
 */
router.get('/logout', (req, res) => authController.logout(req, res));

// ============================================================================
// EXPORTAÇÃO
// ============================================================================

/**
 * Exporta o router configurado para uso no index.js de rotas
 * 
 * Uso no index.js:
 * const authRoutes = require('./authRoutes');
 * router.use('/auth', authRoutes);
 * 
 * Resultando em URLs finais:
 * - POST /api/auth/login
 * - GET /api/auth/logout
 * 
 * Integração com formulários HTML:
 * 
 * Formulário de login:
 * <form action="/api/auth/login" method="post">
 *   <input name="usuario" type="text" required>
 *   <input name="senha" type="password" required>
 *   <button type="submit">Entrar</button>
 * </form>
 * 
 * Link de logout:
 * <a href="/api/auth/logout">Sair</a>
 * 
 * Middleware de proteção (usado em outras rotas):
 * const authController = new AuthController();
 * router.use('/admin/*', authController.isAuthenticated.bind(authController));
 */
module.exports = router;
