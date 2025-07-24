/**
 * ============================================================================
 * MIDDLEWARES - CAMADA DE PROCESSAMENTO INTERMEDIÁRIO
 * ============================================================================
 * 
 * Conjunto de middlewares personalizados para processamento de requisições.
 * Fornece funcionalidades transversais aplicadas em toda a aplicação.
 * 
 * Middlewares disponíveis:
 * - authMiddleware: Verificação de autenticação
 * - corsMiddleware: Configuração de CORS para APIs
 * - logMiddleware: Log estruturado de requisições
 * - errorHandler: Tratamento centralizado de erros
 * 
 * Ordem de aplicação (importante!):
 * 1. corsMiddleware (sempre primeiro)
 * 2. logMiddleware (para registrar todas as requisições)
 * 3. authMiddleware (apenas em rotas protegidas)
 * 4. errorHandler (sempre último)
 * 
 * Padrão Express.js:
 * - req: Objeto de requisição
 * - res: Objeto de resposta
 * - next: Função para continuar o pipeline
 * 
 * @author Equipe Espetinho Maria
 * @version 2.0.0
 * @since 2025-07-24
 */

// ============================================================================
// MIDDLEWARE: AUTENTICAÇÃO
// ============================================================================

/**
 * Middleware de verificação de autenticação
 * 
 * @param {Object} req - Request do Express
 * @param {Object} res - Response do Express
 * @param {Function} next - Próximo middleware
 * 
 * Funcionalidades:
 * - Verifica se existe cookie de autenticação válido
 * - Permite acesso a rotas protegidas se autenticado
 * - Redireciona para login se não autenticado
 * - Usado especificamente para proteção do painel admin
 * 
 * Verificação:
 * - Cookie 'auth' deve existir
 * - Valor deve ser exatamente 'true'
 * - Cookie deve estar presente em req.cookies
 * 
 * Uso:
 * router.use('/admin/*', authMiddleware);
 * router.get('/protected-route', authMiddleware, handler);
 * 
 * Segurança:
 * - Baseado em cookies HTTP-only
 * - Redirecionamento seguro para login
 * - Não exposição de informações sensíveis
 */
const authMiddleware = (req, res, next) => {
  // Verifica se existe cookie de autenticação válido
  if (req.cookies && req.cookies.auth === 'true') {
    // Usuário autenticado: continua para próximo middleware/rota
    return next();
  }
  
  // Usuário não autenticado: redireciona para login
  return res.redirect('/admin/login.html');
};

// ============================================================================
// MIDDLEWARE: CORS (Cross-Origin Resource Sharing)
// ============================================================================

/**
 * Middleware de configuração CORS
 * 
 * @param {Object} req - Request do Express
 * @param {Object} res - Response do Express
 * @param {Function} next - Próximo middleware
 * 
 * Funcionalidades:
 * - Permite requisições de qualquer origem (desenvolvimento)
 * - Configura métodos HTTP permitidos
 * - Define headers aceitos
 * - Trata requisições OPTIONS (preflight)
 * 
 * Headers configurados:
 * - Access-Control-Allow-Origin: Permite todas as origens (*)
 * - Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
 * - Access-Control-Allow-Headers: Headers padrão + Authorization
 * 
 * Requisições OPTIONS:
 * - Responde automaticamente com status 200
 * - Usado para requisições preflight do navegador
 * - Necessário para APIs REST com AJAX/Fetch
 * 
 * Segurança:
 * - Em produção, substituir '*' por domínios específicos
 * - Considerar implementar whitelist de origens
 * - Validar headers específicos se necessário
 */
const corsMiddleware = (req, res, next) => {
  // Define origem permitida (* = qualquer origem)
  // ⚠️ PRODUÇÃO: Substituir por domínios específicos
  res.header('Access-Control-Allow-Origin', '*');
  
  // Define métodos HTTP permitidos
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  // Define headers permitidos nas requisições
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Trata requisições OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    // Responde imediatamente para requisições preflight
    res.sendStatus(200);
  } else {
    // Continua para próximo middleware para outros métodos
    next();
  }
};

// ============================================================================
// MIDDLEWARE: LOG DE REQUISIÇÕES
// ============================================================================

/**
 * Middleware de logging estruturado
 * 
 * @param {Object} req - Request do Express
 * @param {Object} res - Response do Express
 * @param {Function} next - Próximo middleware
 * 
 * Funcionalidades:
 * - Registra todas as requisições HTTP
 * - Inclui timestamp no formato ISO
 * - Mostra método HTTP e URL solicitada
 * - Útil para debugging e monitoramento
 * 
 * Formato do log:
 * [2025-01-20T10:30:45.123Z] GET /api/produtos
 * [2025-01-20T10:30:46.456Z] POST /api/produtos
 * 
 * Informações registradas:
 * - Timestamp: Data/hora da requisição (UTC)
 * - Método: GET, POST, PUT, DELETE, etc.
 * - URL: Caminho completo solicitado
 * 
 * Uso:
 * - Aplicado globalmente em toda a aplicação
 * - Primeiro middleware após CORS
 * - Registra antes do processamento da rota
 * 
 * Extensibilidade:
 * - Pode ser expandido para incluir IP, User-Agent
 * - Integração futura com sistemas de log centralizados
 * - Filtragem de logs por nível (info, debug, error)
 */
const logMiddleware = (req, res, next) => {
  // Gera timestamp no formato ISO (UTC)
  const timestamp = new Date().toISOString();
  
  // Registra requisição no console
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  
  // Continua para próximo middleware
  next();
};

// ============================================================================
// MIDDLEWARE: TRATAMENTO DE ERROS
// ============================================================================

/**
 * Middleware global de tratamento de erros
 * 
 * @param {Error} err - Objeto de erro capturado
 * @param {Object} req - Request do Express
 * @param {Object} res - Response do Express
 * @param {Function} next - Próximo middleware (Express error handler)
 * 
 * Funcionalidades:
 * - Captura erros não tratados em toda a aplicação
 * - Registra detalhes completos do erro para debugging
 * - Retorna resposta padronizada para o cliente
 * - Protege informações sensíveis em produção
 * 
 * Tratamento:
 * - Registra erro completo no console
 * - Verifica se resposta já foi enviada
 * - Retorna JSON padronizado com erro 500
 * - Mostra detalhes apenas em desenvolvimento
 * 
 * Middleware de Erro Express:
 * - DEVE ter 4 parâmetros (err, req, res, next)
 * - Express identifica automaticamente como error handler
 * - Chamado quando next(error) é executado
 * - Deve ser o último middleware registrado
 * 
 * Resposta em desenvolvimento:
 * {
 *   "erro": "Erro interno do servidor",
 *   "details": "Mensagem técnica detalhada"
 * }
 * 
 * Resposta em produção:
 * {
 *   "erro": "Erro interno do servidor"
 * }
 */
const errorHandler = (err, req, res, next) => {
  // Registra erro completo para debugging
  console.error('❌ Erro não tratado:', err);
  
  // Verifica se a resposta já foi enviada
  // Evita erro "Cannot set headers after they are sent"
  if (res.headersSent) {
    // Delega para o handler padrão do Express
    return next(err);
  }
  
  // Retorna resposta padronizada de erro
  res.status(500).json({
    erro: 'Erro interno do servidor',
    // Só mostra detalhes técnicos em desenvolvimento
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

// ============================================================================
// EXPORTAÇÃO DOS MIDDLEWARES
// ============================================================================

/**
 * Exporta todos os middlewares para uso na aplicação
 * 
 * Uso no app.js:
 * const { corsMiddleware, logMiddleware, authMiddleware, errorHandler } = require('./middlewares');
 * 
 * // Aplicação global
 * app.use(corsMiddleware);
 * app.use(logMiddleware);
 * 
 * // Aplicação específica
 * app.use('/admin/*', authMiddleware);
 * 
 * // Handler de erros (sempre por último)
 * app.use(errorHandler);
 * 
 * Ordem recomendada:
 * 1. corsMiddleware (primeiro)
 * 2. logMiddleware  
 * 3. authMiddleware (apenas rotas protegidas)
 * 4. errorHandler (último)
 */
module.exports = {
  authMiddleware,
  corsMiddleware,
  logMiddleware,
  errorHandler
};
