const database = require('../config/database');

class BaseModel {
  constructor(tableName) {
    this.tableName = tableName;
    this.db = database.getConnection();
  }

  // Método genérico para SELECT
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

  // Método genérico para SELECT com JOIN
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

  // Método genérico para SELECT específico
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

  // Método genérico para INSERT
  create(data) {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);
      
      const query = `INSERT INTO ${this.tableName} (${fields}) VALUES (${placeholders})`;
      this.db.run(query, values, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  // Método genérico para UPDATE
  update(id, data, idField = 'id') {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(data), id];
      
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

  // Método genérico para DELETE
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

  // Método para executar queries customizadas
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

  // Método get customizado
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

module.exports = BaseModel;
