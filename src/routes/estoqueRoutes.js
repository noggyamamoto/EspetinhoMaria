const express = require('express');
const EstoqueController = require('../controllers/EstoqueController');

const router = express.Router();
const estoqueController = new EstoqueController();

// Rotas para estoque
router.get('/', (req, res) => estoqueController.index(req, res));
router.post('/', (req, res) => estoqueController.store(req, res));
router.get('/:id', (req, res) => estoqueController.show(req, res));
router.put('/:id', (req, res) => estoqueController.update(req, res));
router.delete('/:id', (req, res) => estoqueController.destroy(req, res));

module.exports = router;
