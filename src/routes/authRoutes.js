const express = require('express');
const AuthController = require('../controllers/AuthController');

const router = express.Router();
const authController = new AuthController();

// Rotas de autenticação
router.post('/login', (req, res) => authController.login(req, res));
router.get('/logout', (req, res) => authController.logout(req, res));

module.exports = router;
