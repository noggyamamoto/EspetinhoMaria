const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const db = require('./db');

const PORT = 3000;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Adicionar headers CORS para evitar problemas de cross-origin
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

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
// Listar todos os produtos com informações do estoque e categoria
app.get('/api/produtos', (req, res) => {
  db.all(`SELECT p.id_produto, p.nome, p.descricao, p.preco_unitario, 
                 c.nome as categoria, e.disponivel, 
                 e.data_cadastro, e.id_categoria
          FROM Produto p
          JOIN Estoque e ON p.id_estoque = e.id_estoque
          JOIN Categoria c ON e.id_categoria = c.id_categoria
          ORDER BY e.data_cadastro DESC`, [], (err, rows) => {
    if (err) {
      console.error('❌ Erro ao buscar produtos:', err);
      return res.status(500).json({ erro: 'Erro ao buscar produtos.' });
    }
    
    // Formata os dados dos produtos
    const produtos = rows.map(row => ({
      id_produto: row.id_produto,
      nome: row.nome,
      descricao: row.descricao,
      preco_unitario: row.preco_unitario,
      categoria: row.categoria,
      disponivel: row.disponivel ? 'Sim' : 'Não',
      id_categoria: row.id_categoria,
      data_cadastro: row.data_cadastro
    }));
    
    console.log(`✅ ${produtos.length} produtos encontrados`);
    res.json(produtos);
  });
});

// Adicionar novo produto
app.post('/api/produtos', (req, res) => {
  const { nome, descricao, preco_unitario, id_categoria, disponivel } = req.body;
  const data_cadastro = new Date().toISOString();
  
  console.log('📦 Criando novo produto:', { nome, descricao, preco_unitario, id_categoria, disponivel });
  
  // Validações
  if (!nome || nome.trim().length < 2) {
    return res.status(400).json({ erro: 'Nome deve ter pelo menos 2 caracteres.' });
  }
  
  if (!preco_unitario || preco_unitario <= 0) {
    return res.status(400).json({ erro: 'Preço deve ser um valor válido maior que zero.' });
  }
  
  if (!id_categoria || ![1, 2, 3].includes(parseInt(id_categoria))) {
    return res.status(400).json({ erro: 'Categoria inválida. Use: 1=ESPETOS, 2=BEBIDAS, 3=INSUMOS.' });
  }
  
  const disponivelInt = disponivel ? 1 : 0;
  
  // Primeiro cria o item no estoque
  db.run(
    'INSERT INTO Estoque (descricao, id_categoria, data_cadastro, disponivel) VALUES (?, ?, ?, ?)',
    [nome.trim(), parseInt(id_categoria), data_cadastro, disponivelInt],
    function (err) {
      if (err) {
        console.error('❌ Erro ao adicionar estoque:', err);
        return res.status(500).json({ erro: 'Erro ao adicionar estoque.' });
      }
      
      const id_estoque = this.lastID;
      console.log('✅ Estoque criado com ID:', id_estoque);
      
      // Depois cria o produto vinculado ao estoque
      db.run(
        'INSERT INTO Produto (nome, descricao, preco_unitario, id_estoque) VALUES (?, ?, ?, ?)',
        [nome.trim(), descricao ? descricao.trim() : '', parseFloat(preco_unitario), id_estoque],
        function (err2) {
          if (err2) {
            console.error('❌ Erro ao adicionar produto:', err2);
            return res.status(500).json({ erro: 'Erro ao adicionar produto.' });
          }
          
          const id_produto = this.lastID;
          console.log('✅ Produto criado com ID:', id_produto);
          
          res.status(201).json({ 
            id_produto, 
            nome: nome.trim(),
            descricao: descricao ? descricao.trim() : '',
            preco_unitario: parseFloat(preco_unitario), 
            id_estoque,
            id_categoria: parseInt(id_categoria),
            disponivel: disponivelInt,
            mensagem: 'Produto criado com sucesso!'
          });
        }
      );
    }
  );
});

// Editar produto
app.put('/api/produtos/:id', (req, res) => {
  const { id } = req.params;
  const { preco_unitario, descricao, id_categoria, disponivel } = req.body;
  
  console.log('📝 Editando produto ID:', id, { preco_unitario, descricao, id_categoria, disponivel });
  
  // Validações
  if (!preco_unitario || preco_unitario <= 0) {
    return res.status(400).json({ erro: 'Preço deve ser um valor válido maior que zero.' });
  }
  
  if (!descricao || descricao.trim().length < 3) {
    return res.status(400).json({ erro: 'Descrição deve ter pelo menos 3 caracteres.' });
  }
  
  if (!id_categoria || ![1, 2, 3].includes(parseInt(id_categoria))) {
    return res.status(400).json({ erro: 'Categoria inválida. Use: 1=ESPETOS, 2=BEBIDAS, 3=INSUMOS.' });
  }
  
  // Busca o id_estoque do produto
  db.get('SELECT id_estoque FROM Produto WHERE id_produto = ?', [id], (err, row) => {
    if (err || !row) {
      console.error('❌ Produto não encontrado:', err);
      return res.status(404).json({ erro: 'Produto não encontrado.' });
    }
    
    const id_estoque = row.id_estoque;
    
    // Atualiza o preço do produto
    db.run('UPDATE Produto SET preco_unitario = ? WHERE id_produto = ?', [parseFloat(preco_unitario), id], function (err2) {
      if (err2) {
        console.error('❌ Erro ao editar produto:', err2);
        return res.status(500).json({ erro: 'Erro ao editar produto.' });
      }
      
      // Atualiza as informações do estoque
      db.run('UPDATE Estoque SET descricao = ?, id_categoria = ?, disponivel = ? WHERE id_estoque = ?', 
        [descricao.trim(), parseInt(id_categoria), disponivel ? 1 : 0, id_estoque], function (err3) {
        if (err3) {
          console.error('❌ Erro ao editar estoque:', err3);
          return res.status(500).json({ erro: 'Erro ao editar estoque.' });
        }
        
        console.log('✅ Produto editado com sucesso');
        res.json({ 
          sucesso: true,
          mensagem: 'Produto editado com sucesso!'
        });
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

// =====================================================
// ROTAS PARA GERENCIAMENTO DE CATEGORIAS (API REST)
// =====================================================

// Listar todas as categorias disponíveis
app.get('/api/categorias', (req, res) => {
  db.all(`SELECT id_categoria, nome, descricao FROM Categoria ORDER BY id_categoria`, [], (err, rows) => {
    if (err) {
      console.error('❌ Erro ao buscar categorias:', err);
      return res.status(500).json({ erro: 'Erro ao buscar categorias.' });
    }
    res.json(rows);
  });
});

// =====================================================
// ROTAS PARA GERENCIAMENTO DE ESTOQUE (API REST)
// =====================================================

// Listar todos os itens do estoque com informações da categoria
app.get('/api/estoques', (req, res) => {
  db.all(`SELECT e.id_estoque, e.descricao, c.nome as categoria, e.data_cadastro, e.disponivel, e.id_categoria
          FROM Estoque e
          JOIN Categoria c ON e.id_categoria = c.id_categoria
          ORDER BY e.data_cadastro DESC`, [], (err, rows) => {
    if (err) {
      console.error('❌ Erro ao buscar estoque:', err);
      return res.status(500).json({ erro: 'Erro ao buscar itens do estoque.' });
    }
    res.json(rows);
  });
});

// Adicionar novo item ao estoque
app.post('/api/estoques', (req, res) => {
  const { descricao, id_categoria, disponivel, fornecedor, notas } = req.body;
  const data_cadastro = new Date().toISOString();
  
  console.log('📦 Adicionando item ao estoque:', { descricao, id_categoria, disponivel });
  
  // Validações
  if (!descricao || descricao.trim().length < 3) {
    return res.status(400).json({ erro: 'Descrição deve ter pelo menos 3 caracteres.' });
  }
  
  if (!id_categoria || ![1, 2, 3].includes(parseInt(id_categoria))) {
    return res.status(400).json({ erro: 'Categoria inválida. Use: 1=ESPETOS, 2=BEBIDAS, 3=INSUMOS.' });
  }
  
  db.run(
    'INSERT INTO Estoque (descricao, id_categoria, data_cadastro, disponivel) VALUES (?, ?, ?, ?)',
    [descricao.trim(), parseInt(id_categoria), data_cadastro, disponivel ? 1 : 0],
    function (err) {
      if (err) {
        console.error('❌ Erro ao inserir no estoque:', err);
        return res.status(500).json({ erro: 'Erro ao adicionar item ao estoque.' });
      }
      
      const id_estoque = this.lastID;
      console.log('✅ Item de estoque criado com ID:', id_estoque);
      
      // Buscar o nome da categoria para retornar
      db.get('SELECT nome FROM Categoria WHERE id_categoria = ?', [id_categoria], (err, categoria) => {
        res.status(201).json({ 
          id_estoque, 
          descricao: descricao.trim(), 
          id_categoria: parseInt(id_categoria),
          categoria: categoria ? categoria.nome : 'Categoria não encontrada',
          data_cadastro,
          disponivel: disponivel ? 1 : 0,
          mensagem: 'Item adicionado ao estoque com sucesso!'
        });
      });
    }
  );
});

// Editar item do estoque
app.put('/api/estoques/:id', (req, res) => {
  const { id } = req.params;
  const { descricao, id_categoria, disponivel } = req.body;
  
  console.log('📝 Editando item do estoque ID:', id, { descricao, id_categoria, disponivel });
  
  // Validações
  if (!descricao || descricao.trim().length < 3) {
    return res.status(400).json({ erro: 'Descrição deve ter pelo menos 3 caracteres.' });
  }
  
  if (!id_categoria || ![1, 2, 3].includes(parseInt(id_categoria))) {
    return res.status(400).json({ erro: 'Categoria inválida. Use: 1=ESPETOS, 2=BEBIDAS, 3=INSUMOS.' });
  }
  
  db.run(
    'UPDATE Estoque SET descricao = ?, id_categoria = ?, disponivel = ? WHERE id_estoque = ?',
    [descricao.trim(), parseInt(id_categoria), disponivel ? 1 : 0, id],
    function (err) {
      if (err) {
        console.error('❌ Erro ao editar estoque:', err);
        return res.status(500).json({ erro: 'Erro ao editar item do estoque.' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ erro: 'Item do estoque não encontrado.' });
      }
      
      console.log('✅ Item do estoque editado com sucesso');
      res.json({ 
        sucesso: true,
        mensagem: 'Item do estoque editado com sucesso!'
      });
    }
  );
});

// Remover item do estoque
app.delete('/api/estoques/:id', (req, res) => {
  const { id } = req.params;
  
  console.log('🗑️ Removendo item do estoque ID:', id);
  
  // Primeiro verifica se o item está sendo usado em algum produto
  db.get('SELECT COUNT(*) as count FROM Produto WHERE id_estoque = ?', [id], (err, row) => {
    if (err) {
      console.error('❌ Erro ao verificar uso do estoque:', err);
      return res.status(500).json({ erro: 'Erro ao verificar item do estoque.' });
    }
    
    if (row.count > 0) {
      return res.status(400).json({ 
        erro: 'Não é possível remover este item pois ele está sendo usado em produtos.' 
      });
    }
    
    // Remove o item do estoque
    db.run('DELETE FROM Estoque WHERE id_estoque = ?', [id], function (err) {
      if (err) {
        console.error('❌ Erro ao remover estoque:', err);
        return res.status(500).json({ erro: 'Erro ao remover item do estoque.' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ erro: 'Item do estoque não encontrado.' });
      }
      
      console.log('✅ Item do estoque removido com sucesso');
      res.json({ 
        sucesso: true,
        mensagem: 'Item do estoque removido com sucesso!'
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

// Rotas para pedidos (API REST)
// Listar todos os pedidos
app.get('/api/pedidos', (req, res) => {
  db.all(`SELECT p.*, c.nome as nome_cliente, c.telefone 
          FROM Pedido p
          LEFT JOIN Cliente c ON p.id_cliente = c.id_cliente
          ORDER BY p.dataHora DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar pedidos.' });
    res.json(rows);
  });
});

// Criar novo pedido (versão simplificada)
app.post('/api/pedidos', (req, res) => {
  const { cliente, telefone, itens, valor_total } = req.body;
  const dataHora = new Date().toISOString();

  console.log('📝 Criando novo pedido:', { cliente, telefone, valor_total });

  // Versão simplificada - apenas cria o pedido com dados mínimos
  // Primeiro verifica se existe tabela Cliente, se não cria uma entrada simples
  db.run(
    'INSERT OR IGNORE INTO Cliente (nome, telefone) VALUES (?, ?)',
    [cliente, telefone],
    function (clienteErr) {
      if (clienteErr) {
        console.log('⚠️ Aviso ao criar/verificar cliente:', clienteErr);
      }

      // Busca o ID do cliente
      db.get('SELECT id_cliente FROM Cliente WHERE telefone = ?', [telefone], (err, clienteData) => {
        let id_cliente = clienteData ? clienteData.id_cliente : 1; // Fallback para ID 1

        // Tenta criar pedido com estrutura atual da tabela
        db.run(
          'INSERT INTO Pedido (dataHora, valor_total, id_cliente) VALUES (?, ?, ?)',
          [dataHora, valor_total, id_cliente],
          function (err) {
            if (err) {
              console.error('❌ Erro detalhado ao criar pedido:', err);
              
              // Fallback: tenta sem id_cliente se não existir a coluna
              db.run(
                'INSERT INTO Pedido (dataHora, valor_total) VALUES (?, ?)',
                [dataHora, valor_total],
                function (err2) {
                  if (err2) {
                    console.error('❌ Erro final ao criar pedido:', err2);
                    return res.status(500).json({ erro: 'Erro ao criar pedido - estrutura da tabela incompatível.' });
                  }

                  const id_pedido = this.lastID;
                  console.log('✅ Pedido criado com ID (fallback):', id_pedido);

                  res.status(201).json({
                    id_pedido,
                    dataHora,
                    valor_total,
                    mensagem: 'Pedido criado com sucesso!'
                  });
                }
              );
            } else {
              const id_pedido = this.lastID;
              console.log('✅ Pedido criado com ID:', id_pedido);

              res.status(201).json({
                id_pedido,
                dataHora,
                valor_total,
                id_cliente,
                mensagem: 'Pedido criado com sucesso!'
              });
            }
          }
        );
      });
    }
  );
});

// Endpoint para estatísticas do dashboard
app.get('/api/estatisticas', (req, res) => {
  try {
    // Data de 24 horas atrás
    const vinteQuatroHorasAtras = new Date();
    vinteQuatroHorasAtras.setHours(vinteQuatroHorasAtras.getHours() - 24);
    const dataISOString = vinteQuatroHorasAtras.toISOString();
    
    console.log('📊 Calculando estatísticas desde:', dataISOString);
    
    // Query para contar pedidos das últimas 24h
    db.get(
      `SELECT COUNT(*) as pedidos_24h, COALESCE(SUM(valor_total), 0) as faturamento_24h
       FROM Pedido 
       WHERE dataHora >= ?`,
      [dataISOString],
      (err, row) => {
        if (err) {
          console.error('❌ Erro ao buscar estatísticas:', err);
          return res.status(500).json({ erro: 'Erro ao calcular estatísticas.' });
        }
        
        const estatisticas = {
          pedidos_24h: row.pedidos_24h || 0,
          faturamento_24h: row.faturamento_24h || 0,
          ultima_atualizacao: new Date().toISOString()
        };
        
        console.log('✅ Estatísticas calculadas:', estatisticas);
        res.json(estatisticas);
      }
    );
  } catch (error) {
    console.error('❌ Erro no endpoint de estatísticas:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
