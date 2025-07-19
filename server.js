const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const db = require('./db');

const PORT = 3000;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Servir arquivos estáticos da home
app.use('/', express.static(path.join(__dirname, 'home')));

// Servir arquivos estáticos do painel_administrador (login)
app.use('/painel-administrador', express.static(path.join(__dirname, 'painel_administrador')));

// Middleware de autenticação simples
function authMiddleware(req, res, next) {
  if (req.cookies && req.cookies.auth === 'true') {
    return next();
  }
  return res.redirect('/painel-administrador/login.html');
}

// Rotas para produtos e estoque (API REST)
// Listar todos os produtos com informações do estoque
app.get('/api/produtos', (req, res) => {
  db.all(`SELECT p.id_produto, p.preco_unitario, e.id_estoque, e.descricao, e.categoria, e.disponivel
          FROM Produto p
          JOIN Estoque e ON p.id_estoque = e.id_estoque
          ORDER BY p.id_produto`, [], (err, rows) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar produtos.' });
    res.json(rows);
  });
});

// Adicionar novo produto
app.post('/api/produtos', (req, res) => {
  const { preco_unitario, descricao, categoria, disponivel } = req.body;
  const data_cadastro = new Date().toISOString();
  db.run(
    'INSERT INTO Estoque (descricao, categoria, data_cadastro, disponivel) VALUES (?, ?, ?, ?)',
    [descricao, categoria, data_cadastro, disponivel ? 1 : 0],
    function (err) {
      if (err) return res.status(500).json({ erro: 'Erro ao adicionar estoque.' });
      const id_estoque = this.lastID;
      db.run(
        'INSERT INTO Produto (preco_unitario, id_estoque) VALUES (?, ?)',
        [preco_unitario, id_estoque],
        function (err2) {
          if (err2) return res.status(500).json({ erro: 'Erro ao adicionar produto.' });
          res.status(201).json({ id_produto: this.lastID, preco_unitario, id_estoque });
        }
      );
    }
  );
});

// Editar produto
app.put('/api/produtos/:id', (req, res) => {
  const { id } = req.params;
  const { preco_unitario, descricao, categoria, disponivel } = req.body;
  db.get('SELECT id_estoque FROM Produto WHERE id_produto = ?', [id], (err, row) => {
    if (err || !row) return res.status(404).json({ erro: 'Produto não encontrado.' });
    const id_estoque = row.id_estoque;
    db.run('UPDATE Produto SET preco_unitario = ? WHERE id_produto = ?', [preco_unitario, id], function (err2) {
      if (err2) return res.status(500).json({ erro: 'Erro ao editar produto.' });
      db.run('UPDATE Estoque SET descricao = ?, categoria = ?, disponivel = ? WHERE id_estoque = ?', [descricao, categoria, disponivel ? 1 : 0, id_estoque], function (err3) {
        if (err3) return res.status(500).json({ erro: 'Erro ao editar estoque.' });
        res.json({ sucesso: true });
      });
    });
  });
});

// Remover produto
app.delete('/api/produtos/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT id_estoque FROM Produto WHERE id_produto = ?', [id], (err, row) => {
    if (err || !row) return res.status(404).json({ erro: 'Produto não encontrado.' });
    const id_estoque = row.id_estoque;
    db.run('DELETE FROM Produto WHERE id_produto = ?', [id], function (err2) {
      if (err2) return res.status(500).json({ erro: 'Erro ao remover produto.' });
      db.run('DELETE FROM Estoque WHERE id_estoque = ?', [id_estoque], function (err3) {
        if (err3) return res.status(500).json({ erro: 'Erro ao remover estoque.' });
        res.json({ sucesso: true });
      });
    });
  });
});

// Rota de login (POST)
app.post('/painel-administrador/login', (req, res) => {
  const { usuario, senha } = req.body;
  // Usuário e senha fixos para exemplo
  if (usuario === 'admin' && senha === '1234') {
    res.cookie('auth', 'true', { httpOnly: true });
    return res.redirect('/painel-administrador/painel/dashboard.html');
  }
  return res.redirect('/painel-administrador/login.html?erro=1');
});

// Proteger acesso ao painel
app.use('/painel-administrador/painel', authMiddleware, express.static(path.join(__dirname, 'painel_administrador/painel')));

// Logout
app.get('/logout', (req, res) => {
  res.clearCookie('auth');
  res.redirect('/painel-administrador/login.html');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
