const express = require('express');
const CategoriaController = require('../controllers/CategoriaController');

const router = express.Router();
const categoriaController = new CategoriaController();

// Rotas para categorias
router.get('/', (req, res) => categoriaController.index(req, res));
router.get('/:id', (req, res) => categoriaController.show(req, res));
router.get('/:id/produtos', (req, res) => categoriaController.getProdutos(req, res));

module.exports = router;
