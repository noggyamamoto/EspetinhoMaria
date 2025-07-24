const express = require('express');
const ProdutoController = require('../controllers/ProdutoController');

const router = express.Router();
const produtoController = new ProdutoController();

// Rotas para produtos
router.get('/', (req, res) => produtoController.index(req, res));
router.post('/', (req, res) => produtoController.store(req, res));
router.get('/:id', (req, res) => produtoController.show(req, res));
router.put('/:id', (req, res) => produtoController.update(req, res));
router.delete('/:id', (req, res) => produtoController.destroy(req, res));

module.exports = router;
