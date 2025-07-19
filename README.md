# Sistema de Gestão de Pedidos - Jantinha

Este projeto é um sistema completo para gestão de pedidos, produtos, estoque e clientes, voltado para estabelecimentos do tipo "jantinha". Ele possui um painel administrativo protegido por login, integração com banco de dados local (SQLite) e interface web para clientes e administradores.

## Funcionalidades

- Cadastro, consulta, edição e exclusão de produtos, clientes, pedidos e administradores
- Controle de estoque
- Painel administrativo protegido por autenticação
- Integração dinâmica entre frontend e backend via API REST
- Banco de dados local (SQLite), sem necessidade de servidor externo
- Interface web para clientes realizarem pedidos

## Tecnologias Utilizadas

- **Node.js** + **Express.js** (backend)
- **SQLite** (banco de dados local)
- **HTML, CSS, JavaScript** (frontend)

## Estrutura do Projeto

```
home/                       # Página inicial do cliente
  index.html
  script.js
  style.css
  img/

painel_administrador/       # Painel administrativo
  login.html
  script.js
  style.css
  img/
  painel/
    dashboard.html
    css/
    img/
    js/
    partes/
      adicionar-item.html
      cadastrar-produto.html
      consultar-produtos.html
      historico-pedidos.html
      inicio.html
      pedidos-pendentes.html
      visualizar-estoque.html

server.js                   # Servidor Express e rotas da API
 db.js                      # Inicialização e conexão com o banco SQLite
```

## Como Executar

1. **Pré-requisitos:**
   - Node.js instalado

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor:**
   ```bash
   node server.js
   ```

4. **Acesse no navegador:**
   - Página do cliente: [http://localhost:3000/home/index.html](http://localhost:3000/home/index.html)
   - Painel administrativo: [http://localhost:3000/painel_administrador/login.html](http://localhost:3000/painel_administrador/login.html)

## Estrutura do Banco de Dados

O banco SQLite é criado automaticamente ao iniciar o servidor, com as seguintes tabelas principais:
- **Administrador**: id_administrador, nome, login, senha
- **Cliente**: id_cliente, nome, telefone
- **Produto**: id_produto, nome, preco, descricao, imagem
- **Estoque**: id_estoque, id_produto, quantidade
- **Pedido**: id_pedido, id_cliente, data_hora, status
- **Contem**: id_pedido, id_produto, quantidade
- **Monitora**: id_administrador, id_estoque

## API REST

As rotas seguem o padrão REST para cada entidade, por exemplo:
- `GET /api/produtos` — lista produtos
- `POST /api/produtos` — cadastra produto
- `PUT /api/produtos/:id` — edita produto
- `DELETE /api/produtos/:id` — remove produto

E assim para clientes, pedidos, estoque, administradores, etc.

## Segurança
- O painel administrativo é protegido por login e sessão.
- Recomenda-se alterar a senha padrão do administrador após o primeiro acesso.

## Observações
- O sistema pode ser facilmente adaptado para outros tipos de estabelecimentos.
- Para produção, recomenda-se configurar variáveis de ambiente e HTTPS.

---

Desenvolvido com Node.js, Express e SQLite.
