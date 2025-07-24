const express = require('express');
const PedidoController = require('../controllers/PedidoController');

const router = express.Router();
const pedidoController = new PedidoController();

// Rotas para pedidos
router.get('/', (req, res) => pedidoController.index(req, res));
router.post('/', (req, res) => pedidoController.store(req, res));
router.get('/pendentes', (req, res) => pedidoController.getPendentes(req, res));
router.get('/estatisticas', (req, res) => pedidoController.getEstatisticas(req, res));
router.get('/:id', (req, res) => pedidoController.show(req, res));
router.put('/:id/status', (req, res) => pedidoController.updateStatus(req, res));

module.exports = router;
