/**
 * ============================================================================
 * BASE CONTROLLER - CLASSE BASE PARA TODOS OS CONTROLLERS
 * ============================================================================
 * 
 * Classe abstrata que fornece métodos utilitários comuns para todos os Controllers.
 * Implementa padronização de respostas, validações e tratamento de erros.
 * 
 * Funcionalidades:
 * - Validação de campos obrigatórios
 * - Respostas padronizadas (sucesso, erro, validação)
 * - Tratamento centralizado de erros
 * - Utilitários para sanitização e paginação
 * - Consistência nas APIs REST
 * 
 * Padrão de Herança:
 * BaseController <- ProdutoController, CategoriaController, etc.
 * 
 * @author Equipe Espetinho Maria
 * @version 2.0.0
 * @since 2025-07-24
 */

/**
 * Classe BaseController - Funcionalidades comuns dos Controllers
 * 
 * Esta classe não deve ser instanciada diretamente.
 * Deve ser estendida por Controllers específicos (ProdutoController, etc.)
 */
class BaseController {
  
  // ========================================================================
  // MÉTODOS DE TRATAMENTO DE ERROS
  // ========================================================================

  /**
   * Trata erros de forma consistente e padronizada
   * 
   * @param {Object} res - Objeto response do Express
   * @param {Error} error - Objeto de erro capturado
   * @param {string} message - Mensagem de erro personalizada
   * 
   * Funcionalidades:
   * - Registra erro detalhado no console para debugging
   * - Retorna resposta JSON padronizada para o cliente
   * - Mostra detalhes técnicos apenas em desenvolvimento
   * - Código HTTP 500 (Internal Server Error)
   */
  handleError(res, error, message = 'Erro interno do servidor') {
    // Registra o erro completo no console para debugging
    console.error('❌ Erro:', error);
    
    // Retorna resposta padronizada para o cliente
    res.status(500).json({ 
      erro: message,
      // Só mostra detalhes técnicos em ambiente de desenvolvimento
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }

  // ========================================================================
  // MÉTODOS DE VALIDAÇÃO
  // ========================================================================

  /**
   * Valida se todos os campos obrigatórios estão presentes e válidos
   * 
   * @param {Object} data - Objeto com os dados a serem validados
   * @param {Array<string>} requiredFields - Array com nomes dos campos obrigatórios
   * @returns {Array<string>} Array com mensagens de erro (vazio se válido)
   * 
   * Validações realizadas:
   * - Verifica se o campo existe no objeto
   * - Para strings: verifica se não está vazia após trim()
   * - Para outros tipos: verifica se não é null/undefined
   * 
   * Exemplo de uso:
   * const errors = this.validateRequired(req.body, ['nome', 'preco', 'categoria']);
   * if (errors.length > 0) return this.validationError(res, errors);
   */
  validateRequired(data, requiredFields) {
    const errors = [];
    
    // Itera sobre cada campo obrigatório
    requiredFields.forEach(field => {
      // Verifica se o campo existe e não está vazio
      if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
        errors.push(`Campo '${field}' é obrigatório`);
      }
    });
    
    return errors;
  }

  // ========================================================================
  // MÉTODOS DE RESPOSTA PADRONIZADA
  // ========================================================================

  /**
   * Resposta de sucesso padronizada
   * 
   * @param {Object} res - Objeto response do Express
   * @param {any} data - Dados a serem retornados
   * @param {string} message - Mensagem de sucesso
   * @param {number} statusCode - Código HTTP (padrão: 200)
   * 
   * Formato da resposta JSON:
   * {
   *   "sucesso": true,
   *   "mensagem": "Operação realizada com sucesso",
   *   "dados": { ... }
   * }
   * 
   * Códigos HTTP comuns:
   * - 200: Sucesso geral
   * - 201: Recurso criado com sucesso
   * - 202: Operação aceita/processando
   */
  successResponse(res, data, message = 'Operação realizada com sucesso', statusCode = 200) {
    res.status(statusCode).json({
      sucesso: true,
      mensagem: message,
      dados: data
    });
  }

  /**
   * Resposta de erro de validação
   * 
   * @param {Object} res - Objeto response do Express
   * @param {Array<string>} errors - Lista de erros de validação
   * 
   * Usado quando os dados enviados pelo cliente são inválidos:
   * - Campos obrigatórios ausentes
   * - Formatos incorretos (email, telefone, etc.)
   * - Valores fora do range permitido
   * - Violações de regras de negócio
   * 
   * Código HTTP: 400 (Bad Request)
   */
  validationError(res, errors) {
    res.status(400).json({
      erro: 'Dados inválidos',
      detalhes: errors
    });
  }

  /**
   * Resposta de recurso não encontrado
   * 
   * @param {Object} res - Objeto response do Express
   * @param {string} message - Mensagem personalizada de erro
   * 
   * Usado quando o recurso solicitado não existe:
   * - Produto com ID inexistente
   * - Página não encontrada
   * - Usuário não existe
   * - Categoria removida
   * 
   * Código HTTP: 404 (Not Found)
   */
  notFoundError(res, message = 'Recurso não encontrado') {
    res.status(404).json({
      erro: message
    });
  }
}

// ============================================================================
// EXPORTAÇÃO
// ============================================================================

/**
 * Exporta a classe BaseController para ser estendida por Controllers específicos
 * 
 * Padrão de uso:
 * const BaseController = require('./BaseController');
 * 
 * class ProdutoController extends BaseController {
 *   // Implementação específica do controller
 * }
 * 
 * Não instancie diretamente esta classe.
 */
module.exports = BaseController;
