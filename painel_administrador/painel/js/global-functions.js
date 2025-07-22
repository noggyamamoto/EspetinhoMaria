/**
 * ARQUIVO DE FUNÇÕES GLOBAIS DO PAINEL ADMINISTRATIVO
 * ===================================================
 * 
 * Este arquivo centraliza todas as funções que devem estar disponíveis
 * globalmente no painel administrativo, facilitando o acesso e manutenção.
 * 
 * Todas as funções são anexadas ao objeto window para garantir acesso global.
 */

console.log('🌐 global-functions.js carregado - Funções globais disponíveis');

// =============================================================================
// NAMESPACE GLOBAL PARA O PAINEL ADMINISTRATIVO
// =============================================================================
window.PainelAdmin = window.PainelAdmin || {};

// =============================================================================
// FUNÇÕES UTILITÁRIAS GLOBAIS
// =============================================================================

/**
 * Formata valores monetários no padrão brasileiro
 * @param {number} valor - Valor a ser formatado
 * @returns {string} Valor formatado em R$
 */
window.PainelAdmin.formatarMoeda = function(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
};

/**
 * Formata data de cadastro como tempo relativo
 * @param {string} dataISO - Data no formato ISO
 * @returns {string} Texto formatado como "Adicionado há x tempo"
 */
window.PainelAdmin.formatarDataRelativa = function(dataISO) {
    try {
        const agora = new Date();
        const dataCadastro = new Date(dataISO);
        const diferenca = agora - dataCadastro; // Diferença em milissegundos
        
        const minutos = Math.floor(diferenca / (1000 * 60));
        const horas = Math.floor(diferenca / (1000 * 60 * 60));
        const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
        const meses = Math.floor(dias / 30);
        const anos = Math.floor(dias / 365);
        
        if (minutos < 60) {
            // Primeira hora: mostrar em minutos
            if (minutos < 1) {
                return "Adicionado agora";
            } else if (minutos === 1) {
                return "Adicionado há 1 minuto";
            } else {
                return `Adicionado há ${minutos} minutos`;
            }
        } else if (horas < 24) {
            // Primeiras 24h: mostrar em horas
            if (horas === 1) {
                return "Adicionado há 1 hora";
            } else {
                return `Adicionado há ${horas} horas`;
            }
        } else if (dias < 30) {
            // Primeiros 30 dias: mostrar em dias
            if (dias === 1) {
                return "Adicionado há 1 dia";
            } else {
                return `Adicionado há ${dias} dias`;
            }
        } else if (anos < 1) {
            // Durante um ano: mostrar em meses
            if (meses === 1) {
                return "Adicionado há 1 mês";
            } else {
                return `Adicionado há ${meses} meses`;
            }
        } else {
            // Após um ano: mostrar em anos
            if (anos === 1) {
                return "Adicionado há 1 ano";
            } else {
                return `Adicionado há ${anos} anos`;
            }
        }
    } catch (error) {
        console.error('❌ Erro ao formatar data relativa:', error);
        return "Data indisponível";
    }
};

/**
 * Exibe mensagens de feedback para o usuário
 * @param {string} mensagem - Mensagem a ser exibida
 * @param {string} tipo - Tipo da mensagem: 'sucesso', 'erro', 'aviso'
 */
window.PainelAdmin.exibirMensagem = function(mensagem, tipo = 'sucesso') {
    const icones = {
        'sucesso': '✅',
        'erro': '❌',
        'aviso': '⚠️'
    };
    
    const icone = icones[tipo] || '📢';
    alert(`${icone} ${mensagem}`);
};

/**
 * Valida se uma string não está vazia
 * @param {string} str - String a ser validada
 * @param {number} minLength - Tamanho mínimo (padrão: 1)
 * @returns {boolean} True se válida
 */
window.PainelAdmin.validarString = function(str, minLength = 1) {
    return str && str.trim().length >= minLength;
};

/**
 * Valida se um valor numérico é válido
 * @param {any} valor - Valor a ser validado
 * @param {number} min - Valor mínimo (opcional)
 * @returns {boolean} True se válido
 */
window.PainelAdmin.validarNumero = function(valor, min = 0) {
    const num = parseFloat(valor);
    return !isNaN(num) && num >= min;
};

// =============================================================================
// FUNÇÕES DE PRODUTOS
// =============================================================================

/**
 * Carrega lista de produtos do servidor
 */
window.PainelAdmin.carregarProdutos = async function() {
    try {
        const tbody = document.getElementById('produtos-tbody');
        if (!tbody) {
            console.warn('Elemento produtos-tbody não encontrado');
            return;
        }
        
        tbody.innerHTML = '<tr><td colspan="4">Carregando...</td></tr>';
        const res = await fetch('/api/produtos');
        
        if (!res.ok) {
            throw new Error(`Erro HTTP: ${res.status}`);
        }
        
        const produtos = await res.json();
        tbody.innerHTML = '';
        
        produtos.forEach(prod => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${prod.id_produto}</td>
                <td>R$ ${Number(prod.preco_unitario).toFixed(2)}</td>
                <td>${prod.id_estoque}</td>
                <td>
                    <button class='btn btn-blue' onclick='window.PainelAdmin.editarProduto(${prod.id_produto},${prod.preco_unitario},${prod.id_estoque})'>Editar</button>
                    <button class='btn btn-red' onclick='window.PainelAdmin.excluirProduto(${prod.id_produto})'>Excluir</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        console.log(`✅ ${produtos.length} produtos carregados`);
        
    } catch (error) {
        console.error('❌ Erro ao carregar produtos:', error);
        window.PainelAdmin.exibirMensagem('Erro ao carregar produtos: ' + error.message, 'erro');
    }
};

/**
 * Edita um produto específico
 * @param {number} id - ID do produto
 * @param {number} preco - Preço atual
 * @param {number} estoque - ID do estoque
 */
window.PainelAdmin.editarProduto = function(id, preco, estoque) {
    const modal = document.getElementById('modalProduto');
    if (!modal) return;
    
    document.getElementById('modalTitulo').textContent = 'Editar Produto';
    document.getElementById('produtoId').value = id;
    document.getElementById('produtoPreco').value = preco;
    document.getElementById('produtoEstoque').value = estoque;
    modal.style.display = 'flex';
};

/**
 * Exclui um produto
 * @param {number} id - ID do produto a ser excluído
 */
window.PainelAdmin.excluirProduto = async function(id) {
    if (!confirm('Deseja excluir este produto?')) return;
    
    try {
        const response = await fetch(`/api/produtos/${id}`, {method: 'DELETE'});
        
        if (response.ok) {
            window.PainelAdmin.exibirMensagem('Produto excluído com sucesso!', 'sucesso');
            window.PainelAdmin.carregarProdutos();
        } else {
            throw new Error('Erro ao excluir produto');
        }
    } catch (error) {
        console.error('❌ Erro ao excluir produto:', error);
        window.PainelAdmin.exibirMensagem('Erro ao excluir produto: ' + error.message, 'erro');
    }
};

/**
 * Cadastra um novo produto
 * @param {Object} formData - Dados do produto
 */
window.PainelAdmin.cadastrarProduto = async function(formData) {
    try {
        const response = await fetch('/api/produtos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            const resultado = await response.json();
            window.PainelAdmin.exibirMensagem('Produto cadastrado com sucesso!', 'sucesso');
            return resultado;
        } else {
            const erro = await response.json();
            throw new Error(erro.erro || 'Erro ao cadastrar produto');
        }
    } catch (error) {
        console.error('❌ Erro ao cadastrar produto:', error);
        window.PainelAdmin.exibirMensagem('Erro ao cadastrar produto: ' + error.message, 'erro');
        throw error;
    }
};

/**
 * Carrega categorias disponíveis do servidor
 * @returns {Array} Lista de categorias
 */
window.PainelAdmin.carregarCategorias = async function() {
    try {
        const response = await fetch('/api/categorias');
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const categorias = await response.json();
        console.log('✅ Categorias carregadas:', categorias);
        
        return categorias;
        
    } catch (error) {
        console.error('❌ Erro ao carregar categorias:', error);
        
        // Retorna categorias padrão em caso de erro
        return [
            { id_categoria: 1, nome: 'ESPETOS', descricao: 'Categoria para todos os tipos de espetinhos' },
            { id_categoria: 2, nome: 'BEBIDAS', descricao: 'Categoria para bebidas em geral' },
            { id_categoria: 3, nome: 'INSUMOS', descricao: 'Categoria para insumos e materiais' }
        ];
    }
};

/**
 * Popula um select com as categorias disponíveis
 * @param {string} selectId - ID do elemento select
 */
window.PainelAdmin.popularSelectCategorias = async function(selectId) {
    const select = document.getElementById(selectId);
    if (!select) {
        console.warn(`Select com ID '${selectId}' não encontrado`);
        return;
    }
    
    const categorias = await window.PainelAdmin.carregarCategorias();
    
    // Limpa opções existentes (exceto a primeira se for placeholder)
    const hasPlaceholder = select.firstElementChild && 
                          select.firstElementChild.hasAttribute('disabled');
    
    if (hasPlaceholder) {
        // Remove todas exceto a primeira (placeholder)
        while (select.children.length > 1) {
            select.removeChild(select.lastElementChild);
        }
    } else {
        select.innerHTML = '';
    }
    
    // Adiciona as categorias
    categorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria.id_categoria;
        option.textContent = categoria.nome;
        option.title = categoria.descricao;
        select.appendChild(option);
    });
};

// =============================================================================
// FUNÇÕES DE ESTOQUE
// =============================================================================

/**
 * Carrega lista de itens do estoque
 */
window.PainelAdmin.carregarEstoque = async function() {
    try {
        const tbody = document.getElementById('estoque-tbody');
        if (!tbody) {
            console.warn('Elemento estoque-tbody não encontrado');
            return;
        }
        
        tbody.innerHTML = '<tr><td colspan="6">Carregando...</td></tr>';
        const res = await fetch('/api/estoques');
        
        if (!res.ok) {
            throw new Error(`Erro HTTP: ${res.status}`);
        }
        
        const estoques = await res.json();
        tbody.innerHTML = '';
        
        estoques.forEach(e => {
            const tr = document.createElement('tr');
            const dataFormatada = window.PainelAdmin.formatarDataRelativa(e.data_cadastro);
            
            tr.innerHTML = `
                <td>${e.id_estoque}</td>
                <td>${e.categoria}</td>
                <td>${e.descricao}</td>
                <td title="${e.data_cadastro}">${dataFormatada}</td>
                <td>${e.disponivel ? 'Sim' : 'Não'}</td>
                <td>
                    <button class='btn btn-blue' onclick='window.PainelAdmin.editarEstoque(${e.id_estoque},"${e.descricao}","${e.categoria}",${e.disponivel})'>Editar</button>
                    <button class='btn btn-red' onclick='window.PainelAdmin.excluirEstoque(${e.id_estoque})'>Excluir</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        console.log(`✅ ${estoques.length} itens de estoque carregados`);
        
    } catch (error) {
        console.error('❌ Erro ao carregar estoque:', error);
        window.PainelAdmin.exibirMensagem('Erro ao carregar estoque: ' + error.message, 'erro');
    }
};

/**
 * Edita um item do estoque
 * @param {number} id - ID do item
 * @param {string} descricao - Descrição atual
 * @param {string} categoria - Nome da categoria atual
 * @param {boolean} disponivel - Status de disponibilidade
 */
window.PainelAdmin.editarEstoque = function(id, descricao, categoria, disponivel) {
    const modal = document.getElementById('modalEstoque');
    if (!modal) return;
    
    document.getElementById('modalTituloEstoque').textContent = 'Editar Item de Estoque';
    document.getElementById('estoqueId').value = id;
    document.getElementById('estoqueDescricao').value = descricao;
    
    // Converter nome da categoria para ID
    let id_categoria = 3; // Default para INSUMOS
    if (categoria === 'ESPETOS') id_categoria = 1;
    else if (categoria === 'BEBIDAS') id_categoria = 2;
    
    document.getElementById('estoqueCategoria').value = id_categoria;
    document.getElementById('estoqueDisponivel').value = disponivel;
    modal.style.display = 'flex';
};

/**
 * Exclui um item do estoque
 * @param {number} id - ID do item a ser excluído
 */
window.PainelAdmin.excluirEstoque = async function(id) {
    if (!confirm('Deseja excluir este item do estoque?')) return;
    
    try {
        const response = await fetch(`/api/estoques/${id}`, {method: 'DELETE'});
        
        if (response.ok) {
            window.PainelAdmin.exibirMensagem('Item de estoque excluído com sucesso!', 'sucesso');
            window.PainelAdmin.carregarEstoque();
        } else {
            throw new Error('Erro ao excluir item do estoque');
        }
    } catch (error) {
        console.error('❌ Erro ao excluir item do estoque:', error);
        window.PainelAdmin.exibirMensagem('Erro ao excluir item: ' + error.message, 'erro');
    }
};

/**
 * Adiciona um novo item ao estoque
 * @param {Object} formData - Dados do item
 */
window.PainelAdmin.adicionarItemEstoque = async function(formData) {
    try {
        console.log('📦 Enviando dados para o servidor:', formData);
        
        const response = await fetch('/api/estoques', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            const resultado = await response.json();
            console.log('✅ Resposta do servidor:', resultado);
            window.PainelAdmin.exibirMensagem('Item adicionado ao estoque com sucesso!', 'sucesso');
            return resultado;
        } else {
            const erro = await response.json();
            console.error('❌ Erro do servidor:', erro);
            throw new Error(erro.erro || 'Erro ao adicionar item ao estoque');
        }
    } catch (error) {
        console.error('❌ Erro ao adicionar item ao estoque:', error);
        
        // Verifica se é erro de conexão
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            window.PainelAdmin.exibirMensagem('Erro de conexão. Verifique se o servidor está rodando.', 'erro');
        } else {
            window.PainelAdmin.exibirMensagem('Erro ao adicionar item: ' + error.message, 'erro');
        }
        throw error;
    }
};

// =============================================================================
// FUNÇÕES DE ESTATÍSTICAS/DASHBOARD
// =============================================================================

/**
 * Carrega estatísticas do dashboard
 */
window.PainelAdmin.carregarEstatisticas = async function() {
    try {
        console.log('📊 Carregando estatísticas do servidor...');
        
        const response = await fetch('/api/estatisticas');
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const stats = await response.json();
        console.log('📈 Estatísticas recebidas:', stats);
        
        // Atualiza total de pedidos das últimas 24h
        const totalPedidosElement = document.getElementById('total-pedidos');
        if (totalPedidosElement) {
            totalPedidosElement.textContent = stats.pedidos_24h || '0';
        }
        
        // Atualiza total faturado das últimas 24h
        const totalFaturadoElement = document.getElementById('total-faturado');
        if (totalFaturadoElement) {
            const valorFormatado = window.PainelAdmin.formatarMoeda(stats.faturamento_24h || 0);
            totalFaturadoElement.textContent = valorFormatado;
        }
        
        console.log('✅ Estatísticas atualizadas na página');
        
    } catch (error) {
        console.error('❌ Erro ao carregar estatísticas:', error);
        
        // Em caso de erro, mostra valores padrão
        const totalPedidosElement = document.getElementById('total-pedidos');
        const totalFaturadoElement = document.getElementById('total-faturado');
        
        if (totalPedidosElement) {
            totalPedidosElement.textContent = '0';
            totalPedidosElement.title = 'Erro ao carregar dados';
        }
        
        if (totalFaturadoElement) {
            totalFaturadoElement.textContent = 'R$ 0,00';
            totalFaturadoElement.title = 'Erro ao carregar dados';
        }
    }
};

// =============================================================================
// FUNÇÕES DE INICIALIZAÇÃO
// =============================================================================

/**
 * Inicializa o dashboard com carregamento automático de estatísticas
 */
window.PainelAdmin.inicializarDashboard = function() {
    console.log('🚀 Configurando dashboard inicial...');
    
    // Carrega estatísticas imediatamente
    window.PainelAdmin.carregarEstatisticas();
    
    // Recarrega estatísticas a cada 30 segundos para manter dados atualizados
    setInterval(window.PainelAdmin.carregarEstatisticas, 30000);
    
    console.log('✅ Dashboard configurado com atualização automática');
};

// =============================================================================
// COMPATIBILIDADE COM CÓDIGO EXISTENTE
// =============================================================================
// Mantém referências diretas no window para compatibilidade com código existente

window.carregarProdutos = window.PainelAdmin.carregarProdutos;
window.editarProduto = window.PainelAdmin.editarProduto;
window.excluirProduto = window.PainelAdmin.excluirProduto;
window.cadastrarProduto = window.PainelAdmin.cadastrarProduto;
window.carregarEstoque = window.PainelAdmin.carregarEstoque;
window.editarEstoque = window.PainelAdmin.editarEstoque;
window.excluirEstoque = window.PainelAdmin.excluirEstoque;
window.adicionarItemEstoque = window.PainelAdmin.adicionarItemEstoque;
window.carregarEstatisticas = window.PainelAdmin.carregarEstatisticas;
window.formatarMoeda = window.PainelAdmin.formatarMoeda;
window.formatarDataRelativa = window.PainelAdmin.formatarDataRelativa;
window.carregarCategorias = window.PainelAdmin.carregarCategorias;
window.popularSelectCategorias = window.PainelAdmin.popularSelectCategorias;

console.log('✅ Todas as funções globais do painel administrativo foram carregadas e estão disponíveis');
