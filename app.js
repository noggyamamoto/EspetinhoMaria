const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

// Importar configurações e middlewares
const database = require('./src/config/database');
const { corsMiddleware, logMiddleware, errorHandler, authMiddleware } = require('./src/middlewares');

// Importar rotas
const apiRoutes = require('./src/routes');
const authRoutes = require('./src/routes/authRoutes');

const PORT = process.env.PORT || 3000;
const app = express();

// Configurações básicas do Express
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Aplicar middlewares
app.use(corsMiddleware);
app.use(logMiddleware);

// Rotas da API (devem vir antes dos arquivos estáticos para evitar conflitos)
app.use('/api', apiRoutes);

// Rotas de autenticação (não protegidas)
app.use('/admin', authRoutes);
app.use('/painel-administrador', authRoutes); // Compatibilidade com URL antiga

// Servir arquivos estáticos
app.use('/', express.static(path.join(__dirname, 'public/home')));
app.use('/admin', express.static(path.join(__dirname, 'public/admin')));

// Compatibilidade com URLs antigas do painel administrativo
app.use('/painel-administrador', express.static(path.join(__dirname, 'public/admin')));

// Rota específica para estatísticas (manter compatibilidade)
app.get('/api/estatisticas', (req, res, next) => {
  // Redirecionar para a nova rota
  req.url = '/api/pedidos/estatisticas';
  next();
});

// Rota de logout global (compatibilidade com o sistema antigo)
app.get('/logout', (req, res) => {
  const AuthController = require('./src/controllers/AuthController');
  const authController = new AuthController();
  authController.logout(req, res);
});

// Rotas de logout adicionais para compatibilidade
app.get('/admin/logout', (req, res) => {
  const AuthController = require('./src/controllers/AuthController');
  const authController = new AuthController();
  authController.logout(req, res);
});

app.get('/painel-administrador/logout', (req, res) => {
  const AuthController = require('./src/controllers/AuthController');
  const authController = new AuthController();
  authController.logout(req, res);
});

// Proteger acesso ao painel administrativo
app.use('/admin/painel', authMiddleware, express.static(path.join(__dirname, 'public/admin/painel')));
app.use('/painel-administrador/painel', authMiddleware, express.static(path.join(__dirname, 'public/admin/painel'))); // Compatibilidade

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

// Inicializar servidor
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
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Encerrando servidor...');
  try {
    await database.close();
    console.log('✅ Conexão com banco de dados fechada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao fechar conexão com banco:', error);
    process.exit(1);
  }
});
