/**
 * ARQUIVO DE TESTE PARA FUNÇÕES GLOBAIS
 * ====================================
 * 
 * Este arquivo contém testes para verificar se todas as funções
 * globais do painel administrativo estão funcionando corretamente.
 * 
 * Para executar os testes, abra o console do navegador (F12) e execute:
 * testarFuncoesGlobais();
 */

window.testarFuncoesGlobais = function() {
    console.log('🧪 Iniciando testes das funções globais...');
    console.log('==========================================');
    
    let sucessos = 0;
    let falhas = 0;
    
    function testar(nome, teste) {
        try {
            const resultado = teste();
            if (resultado) {
                console.log(`✅ ${nome}: PASSOU`);
                sucessos++;
            } else {
                console.log(`❌ ${nome}: FALHOU`);
                falhas++;
            }
        } catch (error) {
            console.log(`❌ ${nome}: ERRO - ${error.message}`);
            falhas++;
        }
    }
    
    // Teste 1: Verificar se o namespace existe
    testar('Namespace PainelAdmin existe', () => {
        return typeof window.PainelAdmin === 'object';
    });
    
    // Teste 2: Verificar funções utilitárias
    testar('formatarMoeda está definida', () => {
        return typeof window.PainelAdmin.formatarMoeda === 'function';
    });
    
    testar('formatarMoeda funciona corretamente', () => {
        const resultado = window.PainelAdmin.formatarMoeda(123.45);
        return resultado.includes('123,45');
    });
    
    testar('formatarDataRelativa está definida', () => {
        return typeof window.PainelAdmin.formatarDataRelativa === 'function';
    });
    
    testar('formatarDataRelativa funciona corretamente', () => {
        const agora = new Date().toISOString();
        const resultado = window.PainelAdmin.formatarDataRelativa(agora);
        return resultado.includes('Adicionado');
    });
    
    testar('exibirMensagem está definida', () => {
        return typeof window.PainelAdmin.exibirMensagem === 'function';
    });
    
    testar('validarString está definida', () => {
        return typeof window.PainelAdmin.validarString === 'function';
    });
    
    testar('validarString funciona corretamente', () => {
        return window.PainelAdmin.validarString('teste', 3) === true &&
               window.PainelAdmin.validarString('', 1) === false;
    });
    
    testar('validarNumero está definida', () => {
        return typeof window.PainelAdmin.validarNumero === 'function';
    });
    
    testar('validarNumero funciona corretamente', () => {
        return window.PainelAdmin.validarNumero(10, 0) === true &&
               window.PainelAdmin.validarNumero(-5, 0) === false;
    });
    
    // Teste 3: Verificar funções de produtos
    testar('carregarProdutos está definida', () => {
        return typeof window.PainelAdmin.carregarProdutos === 'function';
    });
    
    testar('editarProduto está definida', () => {
        return typeof window.PainelAdmin.editarProduto === 'function';
    });
    
    testar('excluirProduto está definida', () => {
        return typeof window.PainelAdmin.excluirProduto === 'function';
    });
    
    testar('cadastrarProduto está definida', () => {
        return typeof window.PainelAdmin.cadastrarProduto === 'function';
    });
    
    // Teste 4: Verificar funções de estoque
    testar('carregarEstoque está definida', () => {
        return typeof window.PainelAdmin.carregarEstoque === 'function';
    });
    
    testar('editarEstoque está definida', () => {
        return typeof window.PainelAdmin.editarEstoque === 'function';
    });
    
    testar('excluirEstoque está definida', () => {
        return typeof window.PainelAdmin.excluirEstoque === 'function';
    });
    
    testar('adicionarItemEstoque está definida', () => {
        return typeof window.PainelAdmin.adicionarItemEstoque === 'function';
    });
    
    // Teste 5: Verificar funções de estatísticas
    testar('carregarEstatisticas está definida', () => {
        return typeof window.PainelAdmin.carregarEstatisticas === 'function';
    });
    
    testar('inicializarDashboard está definida', () => {
        return typeof window.PainelAdmin.inicializarDashboard === 'function';
    });
    
    // Teste 6: Verificar compatibilidade com window
    testar('Compatibilidade carregarProdutos', () => {
        return window.carregarProdutos === window.PainelAdmin.carregarProdutos;
    });
    
    testar('Compatibilidade formatarMoeda', () => {
        return window.formatarMoeda === window.PainelAdmin.formatarMoeda;
    });
    
    testar('Compatibilidade carregarEstoque', () => {
        return window.carregarEstoque === window.PainelAdmin.carregarEstoque;
    });
    
    testar('Compatibilidade carregarEstatisticas', () => {
        return window.carregarEstatisticas === window.PainelAdmin.carregarEstatisticas;
    });
    
    // Resultado final
    console.log('==========================================');
    console.log(`🎯 RESULTADO DOS TESTES:`);
    console.log(`✅ Sucessos: ${sucessos}`);
    console.log(`❌ Falhas: ${falhas}`);
    console.log(`📊 Total: ${sucessos + falhas}`);
    
    if (falhas === 0) {
        console.log('🎉 TODOS OS TESTES PASSARAM! As funções globais estão funcionando corretamente.');
    } else {
        console.log('⚠️ ALGUNS TESTES FALHARAM. Verifique os erros acima.');
    }
    
    return falhas === 0;
};

// Função para testar funções específicas
window.testarFuncaoEspecifica = function(nomeFuncao) {
    console.log(`🔍 Testando função específica: ${nomeFuncao}`);
    
    if (typeof window.PainelAdmin[nomeFuncao] === 'function') {
        console.log(`✅ A função ${nomeFuncao} está definida no namespace PainelAdmin`);
        
        if (typeof window[nomeFuncao] === 'function') {
            console.log(`✅ A função ${nomeFuncao} está disponível globalmente`);
            
            if (window[nomeFuncao] === window.PainelAdmin[nomeFuncao]) {
                console.log(`✅ A compatibilidade está funcionando corretamente`);
                return true;
            } else {
                console.log(`❌ A função global não aponta para a função do namespace`);
                return false;
            }
        } else {
            console.log(`❌ A função ${nomeFuncao} NÃO está disponível globalmente`);
            return false;
        }
    } else {
        console.log(`❌ A função ${nomeFuncao} NÃO está definida no namespace PainelAdmin`);
        return false;
    }
};

// Lista todas as funções disponíveis
window.listarFuncoesDisponiveis = function() {
    console.log('📋 FUNÇÕES DISPONÍVEIS NO PAINEL ADMINISTRATIVO:');
    console.log('==============================================');
    
    if (window.PainelAdmin) {
        console.log('🌐 Namespace window.PainelAdmin:');
        Object.keys(window.PainelAdmin).forEach(key => {
            if (typeof window.PainelAdmin[key] === 'function') {
                console.log(`  📦 ${key}()`);
            }
        });
        
        console.log('\n🔄 Compatibilidade direta (window):');
        const funcoesCompativeis = [
            'carregarProdutos', 'editarProduto', 'excluirProduto', 'cadastrarProduto',
            'carregarEstoque', 'editarEstoque', 'excluirEstoque', 'adicionarItemEstoque',
            'carregarEstatisticas', 'formatarMoeda'
        ];
        
        funcoesCompativeis.forEach(funcao => {
            if (typeof window[funcao] === 'function') {
                console.log(`  ✅ ${funcao}()`);
            } else {
                console.log(`  ❌ ${funcao}() - NÃO DISPONÍVEL`);
            }
        });
    } else {
        console.log('❌ Namespace PainelAdmin não encontrado!');
    }
};

console.log('🧪 Arquivo de testes carregado!');
console.log('📝 Para executar os testes, digite no console:');
console.log('   testarFuncoesGlobais()           - Executa todos os testes');
console.log('   testarFuncaoEspecifica("nome")   - Testa uma função específica');
console.log('   listarFuncoesDisponiveis()       - Lista todas as funções disponíveis');
