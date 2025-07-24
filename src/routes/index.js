const express = require('express');

// Importar todas as rotas
const produtoRoutes = require('./produtoRoutes');
const categoriaRoutes = require('./categoriaRoutes');
const estoqueRoutes = require('./estoqueRoutes');
const pedidoRoutes = require('./pedidoRoutes');
const authRoutes = require('./authRoutes');

const router = express.Router();

// Configurar rotas da API
router.use('/produtos', produtoRoutes);
router.use('/categorias', categoriaRoutes);
router.use('/estoques', estoqueRoutes);
router.use('/pedidos', pedidoRoutes);
router.use('/auth', authRoutes);

// Rota de status da API
router.get('/status', (req, res) => {
  res.json({
    status: 'API funcionando',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

module.exports = router;
