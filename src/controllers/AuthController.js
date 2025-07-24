const BaseController = require('./BaseController');

class AuthController extends BaseController {
  // Login
  async login(req, res) {
    try {
      const { usuario, senha } = req.body;
      
      console.log('🔐 Tentativa de login:', { usuario });
      
      // Validações
      const errors = this.validateRequired(req.body, ['usuario', 'senha']);
      
      if (errors.length > 0) {
        return this.validationError(res, errors);
      }
      
      // Usuário e senha fixos para exemplo (em produção seria do banco de dados)
      if (usuario === 'admin' && senha === '1234') {
        res.cookie('auth', 'true', { httpOnly: true });
        console.log('✅ Login realizado com sucesso');
        
        // Redirecionar baseado na URL de origem
        const referer = req.get('Referer') || '';
        if (referer.includes('painel-administrador')) {
          return res.redirect('/painel-administrador/painel/dashboard.html');
        } else {
          return res.redirect('/admin/painel/dashboard.html');
        }
      }
      
      console.log('❌ Credenciais inválidas');
      
      // Redirecionar para a URL de login correta baseada na origem
      const referer = req.get('Referer') || '';
      if (referer.includes('painel-administrador')) {
        return res.redirect('/painel-administrador/login.html?erro=1');
      } else {
        return res.redirect('/admin/login.html?erro=1');
      }
      
    } catch (error) {
      console.error('❌ Erro no login:', error);
      
      // Redirecionar para a URL de login correta baseada na origem
      const referer = req.get('Referer') || '';
      if (referer.includes('painel-administrador')) {
        return res.redirect('/painel-administrador/login.html?erro=sistema');
      } else {
        return res.redirect('/admin/login.html?erro=sistema');
      }
    }
  }

  // Logout
  async logout(req, res) {
    try {
      res.clearCookie('auth');
      console.log('✅ Logout realizado com sucesso');
      
      // Redirecionar baseado na URL de origem
      const referer = req.get('Referer') || '';
      if (referer.includes('painel-administrador')) {
        res.redirect('/painel-administrador/login.html');
      } else {
        res.redirect('/admin/login.html');
      }
    } catch (error) {
      this.handleError(res, error, 'Erro ao fazer logout');
    }
  }

  // Verificar se está autenticado (middleware)
  isAuthenticated(req, res, next) {
    if (req.cookies && req.cookies.auth === 'true') {
      return next();
    }
    
    // Redirecionar baseado na URL solicitada
    if (req.originalUrl.includes('painel-administrador')) {
      return res.redirect('/painel-administrador/login.html');
    } else {
      return res.redirect('/admin/login.html');
    }
  }
}

module.exports = AuthController;
