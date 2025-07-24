/**
 * ============================================================================
 * AUTH CONTROLLER - SISTEMA DE AUTENTICAÇÃO E AUTORIZAÇÃO
 * ============================================================================
 * 
 * Controller responsável por todas as operações relacionadas à autenticação.
 * Gerencia login, logout e controle de acesso ao painel administrativo.
 * 
 * Funcionalidades:
 * - Sistema de login com credenciais fixas
 * - Logout com limpeza de sessão
 * - Middleware de verificação de autenticação
 * - Redirecionamentos inteligentes baseados na URL de origem
 * - Compatibilidade com múltiplas URLs do painel admin
 * - Gerenciamento de cookies HTTP-only para segurança
 * 
 * Segurança:
 * - Cookies HTTP-only (não acessíveis via JavaScript)
 * - Validação de credenciais no backend
 * - Controle de acesso por middleware
 * - Redirecionamentos seguros
 * 
 * Compatibilidade:
 * - URLs antigas: /painel-administrador/*
 * - URLs novas: /admin/*
 * 
 * @author Equipe Espetinho Maria
 * @version 2.0.0
 * @since 2025-07-24
 */

const BaseController = require('./BaseController');

/**
 * Classe AuthController - Gerenciamento de Autenticação
 * 
 * Estende BaseController para herdar funcionalidades comuns como
 * validações e tratamento de erros padronizados.
 */
class AuthController extends BaseController {

  // ========================================================================
  // OPERAÇÃO: LOGIN DO USUÁRIO
  // ========================================================================

  /**
   * Processa tentativa de login do usuário
   * 
   * @param {Object} req - Request do Express
   * @param {Object} res - Response do Express
   * 
   * Endpoint: POST /api/auth/login
   * 
   * Body esperado:
   * {
   *   "usuario": "admin",
   *   "senha": "1234"
   * }
   * 
   * Processo de login:
   * 1. Validação de campos obrigatórios
   * 2. Verificação de credenciais (fixas para exemplo)
   * 3. Criação de cookie de autenticação
   * 4. Redirecionamento inteligente baseado na origem
   * 
   * Credenciais válidas (exemplo):
   * - Usuário: admin
   * - Senha: 1234
   * 
   * Segurança:
   * - Cookie HTTP-only para prevenir acesso via JavaScript
   * - Redirecionamentos seguros
   * - Validação no backend
   * 
   * Compatibilidade:
   * - Detecta origem da requisição (URL antiga vs nova)
   * - Redireciona para URL correspondente
   */
  async login(req, res) {
    try {
      // Extrai credenciais do corpo da requisição
      const { usuario, senha } = req.body;
      
      // Log da tentativa de login (sem expor a senha)
      console.log('🔐 Tentativa de login:', { usuario });
      
      // ===== VALIDAÇÕES =====
      
      // Validação de campos obrigatórios
      const errors = this.validateRequired(req.body, ['usuario', 'senha']);
      
      if (errors.length > 0) {
        return this.validationError(res, errors);
      }
      
      // ===== VERIFICAÇÃO DE CREDENCIAIS =====
      
      // Credenciais fixas para demonstração
      // Em produção, consultar banco de dados com hash da senha
      if (usuario === 'admin' && senha === '1234') {
        
        // ===== LOGIN VÁLIDO =====
        
        // Cria cookie de autenticação seguro
        // httpOnly: true previne acesso via JavaScript (XSS protection)
        res.cookie('auth', 'true', { httpOnly: true });
        
        console.log('✅ Login realizado com sucesso');
        
        // ===== REDIRECIONAMENTO INTELIGENTE =====
        
        // Detecta URL de origem para manter compatibilidade
        const referer = req.get('Referer') || '';
        
        if (referer.includes('painel-administrador')) {
          // URL antiga: redireciona para dashboard antigo
          return res.redirect('/painel-administrador/painel/dashboard.html');
        } else {
          // URL nova: redireciona para dashboard novo
          return res.redirect('/admin/painel/dashboard.html');
        }
      }
      
      // ===== LOGIN INVÁLIDO =====
      
      console.log('❌ Credenciais inválidas');
      
      // Redireciona para login com parâmetro de erro
      const referer = req.get('Referer') || '';
      
      if (referer.includes('painel-administrador')) {
        // URL antiga com erro
        return res.redirect('/painel-administrador/login.html?erro=1');
      } else {
        // URL nova com erro
        return res.redirect('/admin/login.html?erro=1');
      }
      
    } catch (error) {
      // ===== TRATAMENTO DE ERROS =====
      
      console.error('❌ Erro no login:', error);
      
      // Redireciona para login com erro de sistema
      const referer = req.get('Referer') || '';
      
      if (referer.includes('painel-administrador')) {
        return res.redirect('/painel-administrador/login.html?erro=sistema');
      } else {
        return res.redirect('/admin/login.html?erro=sistema');
      }
    }
  }

  // ========================================================================
  // OPERAÇÃO: LOGOUT DO USUÁRIO
  // ========================================================================

  /**
   * Processa logout do usuário
   * 
   * @param {Object} req - Request do Express
   * @param {Object} res - Response do Express
   * 
   * Endpoint: POST /api/auth/logout
   * 
   * Processo de logout:
   * 1. Remove cookie de autenticação
   * 2. Limpa sessão do usuário
   * 3. Redireciona para página de login apropriada
   * 
   * Segurança:
   * - Limpeza completa da sessão
   * - Redirecionamento seguro
   * - Remoção de cookies de autenticação
   */
  async logout(req, res) {
    try {
      // ===== LIMPEZA DA SESSÃO =====
      
      // Remove cookie de autenticação
      res.clearCookie('auth');
      
      console.log('✅ Logout realizado com sucesso');
      
      // ===== REDIRECIONAMENTO INTELIGENTE =====
      
      // Detecta URL de origem para manter compatibilidade
      const referer = req.get('Referer') || '';
      
      if (referer.includes('painel-administrador')) {
        // Redireciona para login antigo
        res.redirect('/painel-administrador/login.html');
      } else {
        // Redireciona para login novo
        res.redirect('/admin/login.html');
      }
      
    } catch (error) {
      // Trata erros durante logout
      this.handleError(res, error, 'Erro ao fazer logout');
    }
  }

  // ========================================================================
  // MIDDLEWARE: VERIFICAÇÃO DE AUTENTICAÇÃO
  // ========================================================================

  /**
   * Middleware para verificar se o usuário está autenticado
   * 
   * @param {Object} req - Request do Express
   * @param {Object} res - Response do Express
   * @param {Function} next - Função next do Express
   * 
   * Funcionalidades:
   * - Verifica presença e validade do cookie de autenticação
   * - Permite acesso se autenticado
   * - Redireciona para login se não autenticado
   * - Mantém compatibilidade com URLs antigas e novas
   * 
   * Uso:
   * router.get('/admin/*', authController.isAuthenticated, ...)
   * 
   * Verificação:
   * - Cookie 'auth' deve existir
   * - Valor do cookie deve ser 'true'
   * - Cookie deve ser acessível via req.cookies
   * 
   * Redirecionamentos:
   * - URLs com 'painel-administrador' → login antigo
   * - Outras URLs → login novo
   */
  isAuthenticated(req, res, next) {
    // ===== VERIFICAÇÃO DE AUTENTICAÇÃO =====
    
    // Verifica se existe cookie de autenticação válido
    if (req.cookies && req.cookies.auth === 'true') {
      // Usuário autenticado: permite acesso
      return next(); // Continua para o próximo middleware/rota
    }
    
    // ===== USUÁRIO NÃO AUTENTICADO =====
    
    // Redireciona para login baseado na URL solicitada
    if (req.originalUrl.includes('painel-administrador')) {
      // URL antiga: redireciona para login antigo
      return res.redirect('/painel-administrador/login.html');
    } else {
      // URL nova: redireciona para login novo
      return res.redirect('/admin/login.html');
    }
  }
}

// ============================================================================
// EXPORTAÇÃO
// ============================================================================

/**
 * Exporta a classe AuthController para uso nas rotas
 * 
 * Uso nas rotas:
 * const AuthController = require('../controllers/AuthController');
 * const authController = new AuthController();
 * 
 * // Rotas de autenticação
 * router.post('/login', authController.login.bind(authController));
 * router.post('/logout', authController.logout.bind(authController));
 * 
 * // Middleware de proteção
 * router.use('/admin/*', authController.isAuthenticated.bind(authController));
 * 
 * Nota: É importante fazer o bind para preservar o contexto 'this'
 */
module.exports = AuthController;
