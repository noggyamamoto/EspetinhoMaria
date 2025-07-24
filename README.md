# 🍢 Espetinho Maria - Sistema de Gestão de Pedidos

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-16.x-green)
![Express](https://img.shields.io/badge/Express-4.18.2-blue)
![SQLite](https://img.shields.io/badge/SQLite-3-orange)
![MVC](https://img.shields.io/badge/Architecture-MVC-red)
![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)

</div>

Sistema completo de gestão de pedidos para o **Espetinho Maria**, desenvolvido com **arquitetura MVC** (Model-View-Controller) utilizando Node.js, Express.js e SQLite. Oferece painel administrativo completo, API REST, controle de estoque e interface intuitiva para clientes.

## 📋 Índice

- [✨ Funcionalidades](#-funcionalidades)
- [🏗️ Arquitetura](#️-arquitetura)
- [🚀 Instalação e Execução](#-instalação-e-execução)
- [🌐 URLs e Acesso](#-urls-e-acesso)
- [📊 API REST](#-api-rest)
- [💾 Banco de Dados](#-banco-de-dados)
- [🔐 Autenticação](#-autenticação)
- [📁 Estrutura do Projeto](#-estrutura-do-projeto)
- [🛠️ Tecnologias](#️-tecnologias)
- [📝 Changelog](#-changelog)

## ✨ Funcionalidades

### 🏪 Para Clientes
- ✅ Visualização do cardápio completo
- ✅ Interface responsiva e intuitiva
- ✅ Informações detalhadas dos produtos
- ✅ Contato direto via WhatsApp

### 👨‍💼 Para Administradores
- ✅ **Gestão de Produtos**: CRUD completo com categorias
- ✅ **Controle de Estoque**: Monitoramento em tempo real
- ✅ **Gerenciamento de Pedidos**: Status, histórico e relatórios
- ✅ **Dashboard**: Estatísticas de vendas e faturamento
- ✅ **Categorização**: Sistema de categorias (Espetos, Bebidas, Insumos)
- ✅ **Autenticação Segura**: Login protegido por cookies
- ✅ **Interface Moderna**: Design responsivo e profissional

### 🔧 Técnicas
- ✅ **Arquitetura MVC**: Código organizado e maintível
- ✅ **API REST**: Endpoints padronizados
- ✅ **Banco SQLite**: Sem dependências externas
- ✅ **Middlewares**: CORS, autenticação e logs
- ✅ **Tratamento de Erros**: Centralizado e consistente
- ✅ **Compatibilidade**: URLs antigas mantidas

## 🏗️ Arquitetura

### Padrão MVC Implementado

```
┌─────────────────┐    ┌──────────────────┐    ┌────────────────┐
│      VIEW       │    │   CONTROLLER     │    │     MODEL      │
│                 │    │                  │    │                │
│ • Frontend HTML │◄──►│ • ProdutoCtrl    │◄──►│ • Produto.js   │
│ • Dashboard     │    │ • EstoqueCtrl    │    │ • Estoque.js   │
│ • API Clients   │    │ • PedidoCtrl     │    │ • Pedido.js    │
│                 │    │ • AuthCtrl       │    │ • Cliente.js   │
└─────────────────┘    └──────────────────┘    └────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │    DATABASE      │
                       │                  │
                       │   SQLite 3.x     │
                       │  • emteste4.db   │
                       └──────────────────┘
```

### Organização das Camadas

- **Model**: Lógica de negócio e acesso aos dados
- **View**: Interface do usuário (HTML/CSS/JS)
- **Controller**: Coordenação entre Model e View
- **Routes**: Roteamento e organização de endpoints
- **Middlewares**: Funcionalidades transversais (CORS, Auth, Logs)

## 🚀 Instalação e Execução

### Pré-requisitos
- **Node.js** 16.x ou superior
- **npm** (incluído com Node.js)

### 1. Clone o Repositório
```bash
git clone https://github.com/noggyamamoto/EspetinhoMaria.git
cd EspetinhoMaria
```

### 2. Instale as Dependências
```bash
npm install
```

### 3. Inicie o Servidor
```bash
# Servidor MVC (Recomendado)
npm start

# Alternativa para desenvolvimento
npm run dev

# Servidor legado (apenas para referência)
npm run legacy
```

### 4. Acesse o Sistema
O servidor estará rodando em `http://localhost:3000`

## 🌐 URLs e Acesso

### 🏠 Site Principal
- **Homepage**: `http://localhost:3000/`
- **Cardápio**: Navegação interna da homepage

### 🔐 Painel Administrativo

#### Login (ambas funcionam):
- **Nova estrutura**: `http://localhost:3000/admin/login.html`
- **URL legacy**: `http://localhost:3000/painel-administrador/login.html`

#### Credenciais de Acesso:
```
Usuário: admin
Senha: 1234
```

#### Dashboard (após login):
- **Nova estrutura**: `http://localhost:3000/admin/painel/dashboard.html`
- **URL legacy**: `http://localhost:3000/painel-administrador/painel/dashboard.html`

### 🔄 Logout
- `http://localhost:3000/logout`
- `http://localhost:3000/admin/logout`
- `http://localhost:3000/painel-administrador/logout`

## 📊 API REST

### Status da API
```http
GET /api/status
```
Retorna informações sobre o status e versão da API.

### 🍢 Produtos
```http
GET    /api/produtos           # Listar todos os produtos
POST   /api/produtos           # Criar novo produto
GET    /api/produtos/:id       # Buscar produto por ID
PUT    /api/produtos/:id       # Atualizar produto
DELETE /api/produtos/:id       # Remover produto
```

### 📂 Categorias
```http
GET /api/categorias            # Listar categorias
GET /api/categorias/:id        # Buscar categoria por ID
GET /api/categorias/:id/produtos # Produtos de uma categoria
```

### 📦 Estoque
```http
GET    /api/estoques           # Listar itens do estoque
POST   /api/estoques           # Adicionar item ao estoque
GET    /api/estoques/:id       # Buscar item por ID
PUT    /api/estoques/:id       # Atualizar item
DELETE /api/estoques/:id       # Remover item
```

### 📋 Pedidos
```http
GET /api/pedidos               # Listar todos os pedidos
POST /api/pedidos              # Criar novo pedido
GET /api/pedidos/:id           # Buscar pedido por ID
PUT /api/pedidos/:id/status    # Atualizar status do pedido
GET /api/pedidos/pendentes     # Listar pedidos pendentes
GET /api/pedidos/estatisticas  # Estatísticas do dashboard
```

### 🔐 Autenticação
```http
POST /admin/login              # Fazer login
GET  /admin/logout             # Fazer logout
```

### Exemplo de Uso da API

#### Criar um Produto
```javascript
fetch('/api/produtos', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nome: 'Espetinho de Alcatra',
    descricao: 'Delicioso espetinho de alcatra grelhado',
    preco_unitario: 12.50,
    id_categoria: 1,
    disponivel: true
  })
})
```

#### Buscar Produtos
```javascript
fetch('/api/produtos')
  .then(response => response.json())
  .then(produtos => console.log(produtos))
```

## 💾 Banco de Dados

### SQLite - Estrutura das Tabelas

```sql
-- Categorias predefinidas
Categoria (
  id_categoria INTEGER PRIMARY KEY,    -- 1: ESPETOS, 2: BEBIDAS, 3: INSUMOS
  nome TEXT NOT NULL,
  descricao TEXT
)

-- Clientes
Cliente (
  id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL
)

-- Estoque
Estoque (
  id_estoque INTEGER PRIMARY KEY AUTOINCREMENT,
  descricao TEXT NOT NULL,
  id_categoria INTEGER NOT NULL,
  data_cadastro TEXT NOT NULL,
  disponivel INTEGER NOT NULL,        -- 0: Não, 1: Sim
  FOREIGN KEY (id_categoria) REFERENCES Categoria(id_categoria)
)

-- Produtos
Produto (
  id_produto INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco_unitario REAL NOT NULL,
  id_estoque INTEGER NOT NULL,
  FOREIGN KEY (id_estoque) REFERENCES Estoque(id_estoque)
)

-- Pedidos
Pedido (
  id_pedido INTEGER PRIMARY KEY AUTOINCREMENT,
  dataHora TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDENTE',
  valor_total REAL NOT NULL,
  id_cliente INTEGER,
  FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente)
)

-- Itens do Pedido
ItemPedido (
  id_item_pedido INTEGER PRIMARY KEY AUTOINCREMENT,
  id_pedido INTEGER NOT NULL,
  id_produto INTEGER NOT NULL,
  quantidade INTEGER NOT NULL,
  preco_unitario REAL NOT NULL,
  FOREIGN KEY (id_pedido) REFERENCES Pedido(id_pedido),
  FOREIGN KEY (id_produto) REFERENCES Produto(id_produto)
)
```

### Inicialização Automática
- O banco é criado automaticamente na primeira execução
- Dados padrão são inseridos (categorias)
- Localização: `emteste4.sqlite` (raiz do projeto)

## 🔐 Autenticação

### Sistema de Login
- **Método**: Cookie-based authentication
- **Proteção**: HTTP-only cookies
- **Middleware**: Verificação automática de sessão
- **Redirecionamento**: Inteligente baseado na URL de origem

### Segurança
```javascript
// Middleware de autenticação
const authMiddleware = (req, res, next) => {
  if (req.cookies && req.cookies.auth === 'true') {
    return next();
  }
  return res.redirect('/admin/login.html');
};
```

### Rotas Protegidas
- `/admin/painel/*` - Dashboard administrativo
- `/painel-administrador/painel/*` - Dashboard (compatibilidade)

## 📁 Estrutura do Projeto

```
EspetinhoMaria/
├── 📄 app.js                          # Servidor principal (MVC)
├── 📄 server.js                       # Servidor legado (referência)
├── 📄 package.json                    # Dependências e scripts
├── 💾 emteste4.sqlite                 # Banco de dados SQLite
│
├── 📁 src/                            # Código MVC
│   ├── 📁 config/
│   │   └── 📄 database.js             # Configuração do banco
│   ├── 📁 models/                     # Camada Model
│   │   ├── 📄 BaseModel.js            # Classe base CRUD
│   │   ├── 📄 Produto.js              # Model de produtos
│   │   ├── 📄 Categoria.js            # Model de categorias
│   │   ├── 📄 Estoque.js              # Model de estoque
│   │   ├── 📄 Cliente.js              # Model de clientes
│   │   └── 📄 Pedido.js               # Model de pedidos
│   ├── 📁 controllers/                # Camada Controller
│   │   ├── 📄 BaseController.js       # Classe base
│   │   ├── 📄 ProdutoController.js
│   │   ├── 📄 CategoriaController.js
│   │   ├── 📄 EstoqueController.js
│   │   ├── 📄 PedidoController.js
│   │   └── 📄 AuthController.js
│   ├── 📁 routes/                     # Sistema de rotas
│   │   ├── 📄 index.js                # Roteador principal
│   │   ├── 📄 produtoRoutes.js
│   │   ├── 📄 categoriaRoutes.js
│   │   ├── 📄 estoqueRoutes.js
│   │   ├── 📄 pedidoRoutes.js
│   │   └── 📄 authRoutes.js
│   └── 📁 middlewares/                # Middlewares
│       └── 📄 index.js                # CORS, Auth, Logs, Errors
│
├── 📁 public/                         # Camada View (arquivos estáticos)
│   ├── 📁 home/                       # Site público
│   │   ├── 📄 index.html
│   │   ├── 📄 script.js
│   │   ├── 📄 style.css
│   │   └── 📁 img/                    # Imagens dos produtos
│   └── 📁 admin/                      # Painel administrativo
│       ├── 📄 login.html
│       ├── 📄 script.js
│       ├── 📄 style.css
│       ├── 📁 img/
│       └── 📁 painel/
│           ├── 📄 dashboard.html
│           ├── 📁 css/
│           ├── 📁 js/
│           ├── 📁 img/
│           └── 📁 partes/             # Componentes do dashboard
│
└── 📁 docs/                           # Documentação
    ├── 📄 ARQUITETURA_MVC.md          # Detalhes da arquitetura
    ├── 📄 MIGRACAO_CONCLUIDA.md       # Status da migração
    └── 📄 URLS_CORRIGIDAS.md          # Mapeamento de URLs
```

## 🛠️ Tecnologias

### Backend
- **Node.js** 16.x+ - Runtime JavaScript
- **Express.js** 4.18.2 - Framework web
- **SQLite3** 5.1.6 - Banco de dados
- **Cookie-Parser** 1.4.6 - Gerenciamento de cookies

### Frontend
- **HTML5** - Estrutura das páginas
- **CSS3** - Estilização e responsividade
- **JavaScript ES6+** - Interatividade e requisições AJAX
- **Fetch API** - Comunicação com a API REST

### Arquitetura
- **MVC Pattern** - Separação de responsabilidades
- **RESTful API** - Endpoints padronizados
- **Component-based** - Componentes reutilizáveis
- **Cookie Authentication** - Autenticação segura

### Ferramentas de Desenvolvimento
- **npm** - Gerenciador de pacotes
- **Git** - Controle de versão
- **PowerShell** - Scripts de automação

## 📝 Changelog

### v2.0.0 - Arquitetura MVC (24/07/2025)
#### 🎉 Novidades Principais
- ✨ **Implementação completa da arquitetura MVC**
- ✨ **Sistema de rotas organizado e modular**
- ✨ **Classes base para Models e Controllers**
- ✨ **Middlewares centralizados (CORS, Auth, Logs)**
- ✨ **API REST padronizada e documentada**

#### 🔧 Melhorias Técnicas
- ✅ **Separação de responsabilidades em camadas**
- ✅ **Código mais maintível e escalável**
- ✅ **Tratamento de erros centralizado**
- ✅ **Compatibilidade total com versão anterior**
- ✅ **Configuração de banco de dados isolada**

#### 🐛 Correções
- 🔧 Corrigido "Cannot GET /" na página inicial
- 🔧 Corrigido "Cannot GET /painel-administrador/login.html"
- 🔧 Corrigido "Cannot GET /logout"
- 🔧 Melhorado sistema de redirecionamento
- 🔧 URLs de compatibilidade implementadas

#### 📁 Estrutura
- 📦 Nova organização de pastas seguindo MVC
- 📦 Arquivos estáticos movidos para `public/`
- 📦 Código fonte organizado em `src/`
- 📦 Documentação completa adicionada

### v1.0.0 - Sistema Base
- 🎯 Sistema de gestão de pedidos funcional
- 🎯 Painel administrativo completo
- 🎯 API REST básica
- 🎯 Interface do cliente responsiva

---

## 👥 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Contato

- **Desenvolvedor**: Equipe Espetinho Maria
- **Repositório**: [https://github.com/noggyamamoto/EspetinhoMaria](https://github.com/noggyamamoto/EspetinhoMaria)
- **Documentação**: [Google Docs](https://docs.google.com/document/d/1cYrgBeXaAyYi1l8cf5gmNw3AqhaWKpzddq4zlPPcre8/edit?tab=t.0)

---

<div align="center">

**🍢 Desenvolvido com ❤️ para o Espetinho Maria**

[![Node.js](https://img.shields.io/badge/Built%20with-Node.js-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Framework-Express-blue)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-orange)](https://sqlite.org/)
[![MVC](https://img.shields.io/badge/Pattern-MVC-red)](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller)

</div>
