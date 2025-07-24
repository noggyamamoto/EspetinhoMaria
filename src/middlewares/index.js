// Middleware de autenticação
const authMiddleware = (req, res, next) => {
  if (req.cookies && req.cookies.auth === 'true') {
    return next();
  }
  return res.redirect('/admin/login.html');
};

// Middleware de CORS
const corsMiddleware = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
};

// Middleware de log de requisições
const logMiddleware = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
};

// Middleware de tratamento de erros
const errorHandler = (err, req, res, next) => {
  console.error('❌ Erro não tratado:', err);
  
  // Se a resposta já foi enviada, delegar para o handler padrão do Express
  if (res.headersSent) {
    return next(err);
  }
  
  res.status(500).json({
    erro: 'Erro interno do servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

module.exports = {
  authMiddleware,
  corsMiddleware,
  logMiddleware,
  errorHandler
};
