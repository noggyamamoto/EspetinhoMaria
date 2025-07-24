class BaseController {
  // Método para tratar erros de forma consistente
  handleError(res, error, message = 'Erro interno do servidor') {
    console.error('❌ Erro:', error);
    res.status(500).json({ 
      erro: message,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }

  // Método para validações
  validateRequired(data, requiredFields) {
    const errors = [];
    
    requiredFields.forEach(field => {
      if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
        errors.push(`Campo '${field}' é obrigatório`);
      }
    });
    
    return errors;
  }

  // Método para resposta de sucesso
  successResponse(res, data, message = 'Operação realizada com sucesso', statusCode = 200) {
    res.status(statusCode).json({
      sucesso: true,
      mensagem: message,
      dados: data
    });
  }

  // Método para resposta de erro de validação
  validationError(res, errors) {
    res.status(400).json({
      erro: 'Dados inválidos',
      detalhes: errors
    });
  }

  // Método para resposta de não encontrado
  notFoundError(res, message = 'Recurso não encontrado') {
    res.status(404).json({
      erro: message
    });
  }
}

module.exports = BaseController;
