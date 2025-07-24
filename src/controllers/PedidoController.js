const BaseController = require('./BaseController');
const Pedido = require('../models/Pedido');
const Cliente = require('../models/Cliente');

class PedidoController extends BaseController {
  constructor() {
    super();
    this.pedidoModel = new Pedido();
    this.clienteModel = new Cliente();
  }

  // Listar todos os pedidos
  async index(req, res) {
    try {
      const pedidos = await this.pedidoModel.findAllWithCliente();
      
      console.log(`✅ ${pedidos.length} pedidos encontrados`);
      res.json(pedidos);
    } catch (error) {
      this.handleError(res, error, 'Erro ao buscar pedidos');
    }
  }

  // Criar novo pedido
  async store(req, res) {
    try {
      const { cliente, telefone, itens, valor_total } = req.body;
      const dataHora = new Date().toISOString();
      
      console.log('📝 Criando novo pedido:', { cliente, telefone, valor_total });
      
      // Validações básicas
      const errors = this.validateRequired(req.body, ['cliente', 'telefone', 'valor_total']);
      
      if (valor_total && valor_total <= 0) {
        errors.push('Valor total deve ser maior que zero');
      }
      
      if (errors.length > 0) {
        return this.validationError(res, errors);
      }
      
      try {
        // Buscar ou criar cliente
        const clienteData = await this.clienteModel.findOrCreate(cliente, telefone);
        
        const pedidoData = {
          dataHora,
          status: 'PENDENTE',
          valor_total: parseFloat(valor_total),
          id_cliente: clienteData.id_cliente
        };
        
        // Processar itens se fornecidos
        const itensProcessados = itens ? itens.map(item => ({
          id_produto: item.id_produto,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario
        })) : [];
        
        const result = await this.pedidoModel.createWithItens(pedidoData, itensProcessados);
        
        console.log('✅ Pedido criado com ID:', result.id_pedido);
        
        this.successResponse(res, {
          id_pedido: result.id_pedido,
          dataHora,
          valor_total: parseFloat(valor_total),
          id_cliente: clienteData.id_cliente,
          status: 'PENDENTE'
        }, 'Pedido criado com sucesso!', 201);
        
      } catch (clienteError) {
        console.error('⚠️ Erro ao processar cliente, tentando fallback:', clienteError);
        
        // Fallback: criar pedido sem cliente
        const pedidoDataFallback = {
          dataHora,
          status: 'PENDENTE',
          valor_total: parseFloat(valor_total)
        };
        
        const result = await this.pedidoModel.create(pedidoDataFallback);
        
        console.log('✅ Pedido criado com ID (fallback):', result.id);
        
        this.successResponse(res, {
          id_pedido: result.id,
          dataHora,
          valor_total: parseFloat(valor_total)
        }, 'Pedido criado com sucesso!', 201);
      }
      
    } catch (error) {
      this.handleError(res, error, 'Erro ao criar pedido');
    }
  }

  // Buscar pedido por ID
  async show(req, res) {
    try {
      const { id } = req.params;
      const pedido = await this.pedidoModel.findByIdWithDetails(id);
      
      if (!pedido) {
        return this.notFoundError(res, 'Pedido não encontrado');
      }
      
      // Buscar itens do pedido
      const itens = await this.pedidoModel.findItensPedido(id);
      
      res.json({
        ...pedido,
        itens
      });
    } catch (error) {
      this.handleError(res, error, 'Erro ao buscar pedido');
    }
  }

  // Atualizar status do pedido
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      console.log('📝 Atualizando status do pedido ID:', id, 'para:', status);
      
      // Validar status
      const statusValidos = ['PENDENTE', 'PREPARANDO', 'PRONTO', 'ENTREGUE', 'CANCELADO'];
      if (!statusValidos.includes(status)) {
        return this.validationError(res, ['Status inválido. Use: ' + statusValidos.join(', ')]);
      }
      
      const result = await this.pedidoModel.updateStatus(id, status);
      
      if (result.changes === 0) {
        return this.notFoundError(res, 'Pedido não encontrado');
      }
      
      console.log('✅ Status do pedido atualizado com sucesso');
      this.successResponse(res, null, 'Status do pedido atualizado com sucesso!');
      
    } catch (error) {
      this.handleError(res, error, 'Erro ao atualizar status do pedido');
    }
  }

  // Buscar pedidos pendentes
  async getPendentes(req, res) {
    try {
      const pedidos = await this.pedidoModel.findPendentes();
      
      console.log(`✅ ${pedidos.length} pedidos pendentes encontrados`);
      res.json(pedidos);
    } catch (error) {
      this.handleError(res, error, 'Erro ao buscar pedidos pendentes');
    }
  }

  // Buscar estatísticas
  async getEstatisticas(req, res) {
    try {
      // Data de 24 horas atrás
      const vinteQuatroHorasAtras = new Date();
      vinteQuatroHorasAtras.setHours(vinteQuatroHorasAtras.getHours() - 24);
      const dataISOString = vinteQuatroHorasAtras.toISOString();
      
      console.log('📊 Calculando estatísticas desde:', dataISOString);
      
      const estatisticas = await this.pedidoModel.getEstatisticas(dataISOString);
      
      const result = {
        pedidos_24h: estatisticas.pedidos_24h || 0,
        faturamento_24h: estatisticas.faturamento_24h || 0,
        ultima_atualizacao: new Date().toISOString()
      };
      
      console.log('✅ Estatísticas calculadas:', result);
      res.json(result);
    } catch (error) {
      this.handleError(res, error, 'Erro ao calcular estatísticas');
    }
  }
}

module.exports = PedidoController;
