/**
 * ============================================================================
 * BASE MODEL - CLASSE BASE PARA TODOS OS MODELS
 * ============================================================================
 * 
 * Classe abstrata que fornece métodos CRUD genéricos para todos os Models.
 * Implementa o padrão Active Record, onde cada Model herda operações básicas
 * de banco de dados.
 * 
 * Funcionalidades:
 * - CRUD completo (Create, Read, Update, Delete)
 * - Queries com JOIN
 * - Queries customizadas
 * - Tratamento de erros com Promises
 * - Métodos utilitários para operações comuns
 * 
 * Padrão de Herança:
 * BaseModel <- Produto, Categoria, Estoque, Cliente, Pedido
 * 
 * @author Equipe Espetinho Maria
 * @version 2.0.0
 * @since 2025-07-24
 */

const database = require('../config/database');

/**
 * Classe BaseModel - Operações de banco de dados genéricas
 * 
 * Esta classe não deve ser instanciada diretamente.
 * Deve ser estendida por Models específicos (Produto, Cliente, etc.)
 */
class BaseModel {
  /**
   * Construtor da classe BaseModel
   * 
   * @param {string} tableName - Nome da tabela no banco de dados
   */
  constructor(tableName) {
    this.tableName = tableName;           // Nome da tabela (ex: 'Produto', 'Cliente')
    this.db = database.getConnection();   // Conexão ativa com o banco SQLite
  }

  // ========================================================================
  // MÉTODOS DE LEITURA (SELECT)
  // ========================================================================

  /**
   * Busca todos os registros da tabela
   * 
   * @param {string} conditions - Condições WHERE, ORDER BY, etc. (opcional)
   * @param {Array} params - Parâmetros para a query (prevenção de SQL injection)
   * @returns {Promise<Array>} Array com todos os registros encontrados
   * 
   * Exemplo:
   * findAll('WHERE ativo = ? ORDER BY nome', [1])
   */
  findAll(conditions = '', params = []) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM ${this.tableName} ${conditions}`;
      
      this.db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Busca registros com JOIN de outras tabelas
   * 
   * @param {string} joinClause - Cláusula JOIN completa
   * @param {string} conditions - Condições WHERE, ORDER BY, etc. (opcional)
   * @param {Array} params - Parâmetros para a query
   * @returns {Promise<Array>} Array com registros joinados
   * 
   * Exemplo:
   * findWithJoin('JOIN Categoria c ON e.id_categoria = c.id_categoria', 'WHERE c.nome = ?', ['ESPETOS'])
   */
  findWithJoin(joinClause, conditions = '', params = []) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM ${this.tableName} ${joinClause} ${conditions}`;
      
      this.db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Busca um único registro por ID
   * 
   * @param {number|string} id - Valor do ID a ser buscado
   * @param {string} idField - Nome do campo ID (padrão: 'id')
   * @returns {Promise<Object|null>} Objeto com o registro ou null se não encontrado
   * 
   * Exemplo:
   * findById(5, 'id_produto')
   */
  findById(id, idField = 'id') {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM ${this.tableName} WHERE ${idField} = ?`;
      
      this.db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // ========================================================================
  // MÉTODOS DE ESCRITA (INSERT, UPDATE, DELETE)
  // ========================================================================

  /**
   * Cria um novo registro na tabela
   * 
   * @param {Object} data - Objeto com os dados a serem inseridos
   * @returns {Promise<Object>} Objeto com ID do registro criado e número de mudanças
   * 
   * Exemplo:
   * create({ nome: 'Produto X', preco: 10.50 })
   * Retorna: { id: 15, changes: 1 }
   */
  create(data) {
    return new Promise((resolve, reject) => {
      // Extrai campos e valores do objeto
      const fields = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);
      
      const query = `INSERT INTO ${this.tableName} (${fields}) VALUES (${placeholders})`;
      
      this.db.run(query, values, function(err) {
        if (err) {
          reject(err);
        } else {
          // 'this' refere-se ao contexto da função run()
          resolve({ 
            id: this.lastID,      // ID do registro inserido
            changes: this.changes // Número de linhas afetadas
          });
        }
      });
    });
  }

  /**
   * Atualiza um registro existente
   * 
   * @param {number|string} id - ID do registro a ser atualizado
   * @param {Object} data - Objeto com os novos dados
   * @param {string} idField - Nome do campo ID (padrão: 'id')
   * @returns {Promise<Object>} Objeto com número de mudanças realizadas
   * 
   * Exemplo:
   * update(5, { nome: 'Novo Nome', preco: 15.00 }, 'id_produto')
   * Retorna: { changes: 1 }
   */
  update(id, data, idField = 'id') {
    return new Promise((resolve, reject) => {
      // Cria cláusulas SET para UPDATE
      const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(data), id]; // Valores + ID no final
      
      const query = `UPDATE ${this.tableName} SET ${fields} WHERE ${idField} = ?`;
      
      this.db.run(query, values, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  /**
   * Remove um registro da tabela
   * 
   * @param {number|string} id - ID do registro a ser removido
   * @param {string} idField - Nome do campo ID (padrão: 'id')
   * @returns {Promise<Object>} Objeto com número de mudanças realizadas
   * 
   * Exemplo:
   * delete(5, 'id_produto')
   * Retorna: { changes: 1 }
   */
  delete(id, idField = 'id') {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM ${this.tableName} WHERE ${idField} = ?`;
      
      this.db.run(query, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  // ========================================================================
  // MÉTODOS PARA QUERIES CUSTOMIZADAS
  // ========================================================================

  /**
   * Executa uma query customizada que retorna múltiplos registros
   * 
   * @param {string} query - Query SQL completa
   * @param {Array} params - Parâmetros para a query
   * @returns {Promise<Array>} Array com os resultados
   * 
   * Uso: Para queries complexas que não se enquadram nos métodos padrão
   */
  customQuery(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Executa uma query customizada que retorna um único registro
   * 
   * @param {string} query - Query SQL completa
   * @param {Array} params - Parâmetros para a query
   * @returns {Promise<Object|null>} Objeto com o resultado ou null
   * 
   * Uso: Para buscar um registro específico com query customizada
   */
  customGet(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(query, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }
}

// ============================================================================
// EXPORTAÇÃO
// ============================================================================

/**
 * Exporta a classe BaseModel para ser estendida por Models específicos
 * 
 * Não instancie diretamente. Use apenas como classe pai:
 * class Produto extends BaseModel { ... }
 */
module.exports = BaseModel;
