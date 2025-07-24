/**
 * ============================================================================
 * CONFIGURAÇÃO DO BANCO DE DADOS - SQLITE
 * ============================================================================
 * 
 * Classe responsável por:
 * - Conectar com o banco de dados SQLite
 * - Criar tabelas automaticamente na primeira execução
 * - Inserir dados padrão (categorias)
 * - Fornecer conexão para os Models
 * - Gerenciar fechamento da conexão
 * 
 * Padrão Singleton: Uma única instância do banco é exportada e reutilizada
 * em toda a aplicação, evitando múltiplas conexões desnecessárias.
 * 
 * @author Equipe Espetinho Maria
 * @version 2.0.0
 * @since 2025-07-24
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

/**
 * Classe Database - Gerencia conexão e inicialização do SQLite
 * 
 * Implementa o padrão Singleton para garantir uma única conexão
 * com o banco de dados em toda a aplicação.
 */
class Database {
  /**
   * Construtor da classe Database
   * 
   * Estabelece conexão com o arquivo SQLite e chama a inicialização
   * das tabelas. O arquivo do banco fica na raiz do projeto.
   */
  constructor() {
    // Conecta com o arquivo SQLite (será criado se não existir)
    this.db = new sqlite3.Database(path.join(__dirname, '../../emteste4.sqlite'));
    
    // Inicializa as tabelas e dados padrão
    this.init();
  }

  /**
   * Inicializa o banco de dados
   * 
   * Cria todas as tabelas necessárias e insere dados padrão.
   * Usa db.serialize() para garantir execução sequencial das queries.
   */
  init() {
    this.db.serialize(() => {
      
      // ====================================================================
      // TABELA DE CATEGORIAS
      // ====================================================================
      
      /**
       * Tabela Categoria - Armazena tipos de produtos
       * 
       * Estrutura:
       * - id_categoria: Chave primária (1, 2, 3)
       * - nome: Nome da categoria (ESPETOS, BEBIDAS, INSUMOS)
       * - descricao: Descrição detalhada da categoria
       */
      this.db.run(`CREATE TABLE IF NOT EXISTS Categoria (
        id_categoria INTEGER PRIMARY KEY,
        nome TEXT NOT NULL UNIQUE,
        descricao TEXT
      )`);

      /**
       * Inserir categorias predefinidas
       * 
       * Use INSERT OR IGNORE para evitar duplicatas na reinicialização
       * IDs fixos facilitam a integração com o frontend
       */
      this.db.run(`INSERT OR IGNORE INTO Categoria (id_categoria, nome, descricao) VALUES 
        (1, 'ESPETOS', 'Categoria para todos os tipos de espetinhos'),
        (2, 'BEBIDAS', 'Categoria para bebidas em geral'),
        (3, 'INSUMOS', 'Categoria para insumos e materiais')`);

      // ====================================================================
      // TABELA DE CLIENTES
      // ====================================================================
      
      /**
       * Tabela Cliente - Dados dos clientes
       * 
       * Estrutura:
       * - id_cliente: Chave primária auto-incremento
       * - nome: Nome completo do cliente
       * - telefone: Telefone para contato (usado como identificador único)
       */
      this.db.run(`CREATE TABLE IF NOT EXISTS Cliente (
        id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        telefone TEXT NOT NULL
      )`);

      // ====================================================================
      // TABELA DE ESTOQUE
      // ====================================================================
      
      /**
       * Tabela Estoque - Controle de itens disponíveis
       * 
       * Estrutura:
       * - id_estoque: Chave primária auto-incremento
       * - descricao: Descrição do item
       * - id_categoria: Referência para Categoria (FK)
       * - data_cadastro: Data/hora de criação (ISO String)
       * - disponivel: Status de disponibilidade (0=Não, 1=Sim)
       * 
       * Relacionamento: N:1 com Categoria
       */
      this.db.run(`CREATE TABLE IF NOT EXISTS Estoque (
        id_estoque INTEGER PRIMARY KEY AUTOINCREMENT,
        descricao TEXT NOT NULL,
        id_categoria INTEGER NOT NULL,
        data_cadastro TEXT NOT NULL,
        disponivel INTEGER NOT NULL,
        FOREIGN KEY (id_categoria) REFERENCES Categoria(id_categoria)
      )`);

      // ====================================================================
      // TABELA DE PRODUTOS
      // ====================================================================
      
      /**
       * Tabela Produto - Produtos vendidos no estabelecimento
       * 
       * Estrutura:
       * - id_produto: Chave primária auto-incremento
       * - nome: Nome comercial do produto
       * - descricao: Descrição detalhada (opcional)
       * - preco_unitario: Preço de venda (REAL para decimais)
       * - id_estoque: Referência para Estoque (FK)
       * 
       * Relacionamento: 1:1 com Estoque (cada produto tem um item no estoque)
       */
      this.db.run(`CREATE TABLE IF NOT EXISTS Produto (
        id_produto INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        descricao TEXT,
        preco_unitario REAL NOT NULL,
        id_estoque INTEGER NOT NULL,
        FOREIGN KEY (id_estoque) REFERENCES Estoque(id_estoque)
      )`);

      // ====================================================================
      // TABELA DE PEDIDOS
      // ====================================================================
      
      /**
       * Tabela Pedido - Pedidos realizados pelos clientes
       * 
       * Estrutura:
       * - id_pedido: Chave primária auto-incremento
       * - dataHora: Data/hora do pedido (ISO String)
       * - status: Status atual (PENDENTE, PREPARANDO, PRONTO, ENTREGUE, CANCELADO)
       * - valor_total: Valor total do pedido
       * - id_cliente: Referência para Cliente (FK, opcional)
       * 
       * Relacionamento: N:1 com Cliente (opcional para pedidos sem cadastro)
       */
      this.db.run(`CREATE TABLE IF NOT EXISTS Pedido (
        id_pedido INTEGER PRIMARY KEY AUTOINCREMENT,
        dataHora TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'PENDENTE',
        valor_total REAL NOT NULL,
        id_cliente INTEGER,
        FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente)
      )`);

      // ====================================================================
      // TABELA DE ITENS DO PEDIDO
      // ====================================================================
      
      /**
       * Tabela ItemPedido - Itens específicos de cada pedido
       * 
       * Estrutura:
       * - id_item_pedido: Chave primária auto-incremento
       * - id_pedido: Referência para Pedido (FK)
       * - id_produto: Referência para Produto (FK)
       * - quantidade: Quantidade do produto no pedido
       * - preco_unitario: Preço unitário no momento do pedido (histórico)
       * 
       * Relacionamento: N:N entre Pedido e Produto (tabela de ligação)
       * 
       * Nota: preco_unitario é armazenado para manter histórico,
       * pois preços podem mudar após o pedido ser feito.
       */
      this.db.run(`CREATE TABLE IF NOT EXISTS ItemPedido (
        id_item_pedido INTEGER PRIMARY KEY AUTOINCREMENT,
        id_pedido INTEGER NOT NULL,
        id_produto INTEGER NOT NULL,
        quantidade INTEGER NOT NULL,
        preco_unitario REAL NOT NULL,
        FOREIGN KEY (id_pedido) REFERENCES Pedido(id_pedido),
        FOREIGN KEY (id_produto) REFERENCES Produto(id_produto)
      )`);

      // Log de sucesso da inicialização
      console.log('✅ Banco de dados inicializado com sucesso');
    });
  }

  /**
   * Retorna a conexão do banco de dados
   * 
   * Método usado pelos Models para executar queries.
   * Retorna a instância do sqlite3.Database.
   * 
   * @returns {sqlite3.Database} Conexão ativa do banco
   */
  getConnection() {
    return this.db;
  }

  /**
   * Fecha a conexão com o banco de dados
   * 
   * Método assíncrono que fecha a conexão adequadamente.
   * Usado no graceful shutdown do servidor.
   * 
   * @returns {Promise} Promise que resolve quando a conexão é fechada
   */
  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

// ============================================================================
// EXPORTAÇÃO SINGLETON
// ============================================================================

/**
 * Exporta uma única instância da classe Database
 * 
 * Padrão Singleton garante que toda a aplicação use a mesma conexão,
 * evitando problemas de concorrência e múltiplas conexões desnecessárias.
 */
module.exports = new Database();