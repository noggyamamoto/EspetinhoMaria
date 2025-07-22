# Funções Globais do Painel Administrativo

Este documento descreve todas as funções disponíveis globalmente no painel administrativo do sistema Espetinho Maria.

## 📁 Estrutura de Arquivos

```
painel_administrador/
├── painel/
│   ├── js/
│   │   ├── main.js              # Controlador principal do dashboard
│   │   └── global-functions.js  # Funções globais centralizadas
│   ├── partes/                  # Páginas carregadas dinamicamente
│   └── dashboard.html           # Página principal
```

## 🌐 Namespace Global

Todas as funções estão organizadas no namespace `window.PainelAdmin` para evitar conflitos e facilitar a organização:

```javascript
window.PainelAdmin = {
    // Funções utilitárias
    formatarMoeda(),
    exibirMensagem(),
    validarString(),
    validarNumero(),
    
    // Funções de produtos
    carregarProdutos(),
    editarProduto(),
    excluirProduto(),
    
    // Funções de estoque
    carregarEstoque(),
    editarEstoque(),
    excluirEstoque(),
    
    // Funções de estatísticas
    carregarEstatisticas(),
    inicializarDashboard()
}
```

## 🔧 Funções Utilitárias

### `formatarMoeda(valor)`
Formata valores monetários no padrão brasileiro.
```javascript
window.PainelAdmin.formatarMoeda(123.45); // "R$ 123,45"
```

### `exibirMensagem(mensagem, tipo)`
Exibe mensagens de feedback para o usuário.
```javascript
window.PainelAdmin.exibirMensagem('Operação realizada!', 'sucesso');
window.PainelAdmin.exibirMensagem('Erro encontrado!', 'erro');
window.PainelAdmin.exibirMensagem('Atenção necessária!', 'aviso');
```

### `validarString(str, minLength)`
Valida se uma string não está vazia.
```javascript
window.PainelAdmin.validarString('texto', 3); // true
window.PainelAdmin.validarString('', 1); // false
```

### `validarNumero(valor, min)`
Valida se um valor numérico é válido.
```javascript
window.PainelAdmin.validarNumero(10, 0); // true
window.PainelAdmin.validarNumero(-5, 0); // false
```

## 📦 Funções de Produtos

### `carregarProdutos()`
Carrega e exibe a lista de produtos na tabela.
```javascript
await window.PainelAdmin.carregarProdutos();
```

### `editarProduto(id, preco, estoque)`
Abre modal para edição de produto.
```javascript
window.PainelAdmin.editarProduto(1, 15.50, 10);
```

### `excluirProduto(id)`
Exclui um produto após confirmação.
```javascript
await window.PainelAdmin.excluirProduto(1);
```

## 📋 Funções de Estoque

### `carregarEstoque()`
Carrega e exibe a lista de itens do estoque.
```javascript
await window.PainelAdmin.carregarEstoque();
```

### `editarEstoque(id, descricao, categoria, disponivel)`
Abre modal para edição de item do estoque.
```javascript
window.PainelAdmin.editarEstoque(1, 'Carvão', 'Insumos', true);
```

### `excluirEstoque(id)`
Exclui um item do estoque após confirmação.
```javascript
await window.PainelAdmin.excluirEstoque(1);
```

## 📊 Funções de Estatísticas

### `carregarEstatisticas()`
Carrega estatísticas do dashboard.
```javascript
await window.PainelAdmin.carregarEstatisticas();
```

### `inicializarDashboard()`
Inicializa o dashboard com atualização automática.
```javascript
window.PainelAdmin.inicializarDashboard();
```

## 🔄 Compatibilidade

Para manter compatibilidade com código existente, as funções também estão disponíveis diretamente no `window`:

```javascript
// Estas chamadas são equivalentes:
window.PainelAdmin.carregarProdutos();
window.carregarProdutos();

window.PainelAdmin.formatarMoeda(100);
window.formatarMoeda(100);
```

## 🚀 Como Usar

1. **Carregamento Automático**: As funções são carregadas automaticamente quando o dashboard é aberto.

2. **Uso em HTML**: Pode ser usado diretamente em eventos HTML:
```html
<button onclick="window.PainelAdmin.carregarProdutos()">Atualizar</button>
```

3. **Uso em JavaScript**: Pode ser usado em qualquer script da página:
```javascript
document.addEventListener('DOMContentLoaded', function() {
    window.PainelAdmin.inicializarDashboard();
});
```

## 🛡️ Tratamento de Erros

Todas as funções incluem tratamento de erros e logs detalhados:
- ✅ Sucesso: Logs verde no console
- ❌ Erro: Logs vermelho no console + mensagem para usuário
- ⚠️ Aviso: Logs amarelo no console

## 📝 Logs de Debug

Para acompanhar o funcionamento, monitore o console do navegador (F12):
```
✅ main.js foi carregado e está executando!
🌐 global-functions.js carregado - Funções globais disponíveis
📊 Carregando estatísticas do servidor...
✅ 5 produtos carregados
```

## 🔧 Manutenção

Para adicionar novas funções globais:

1. Edite o arquivo `js/global-functions.js`
2. Adicione a função no namespace `window.PainelAdmin`
3. Adicione compatibilidade direta no window se necessário
4. Atualize esta documentação

Exemplo:
```javascript
// Nova função
window.PainelAdmin.novaFuncao = function() {
    console.log('Nova função executada');
};

// Compatibilidade
window.novaFuncao = window.PainelAdmin.novaFuncao;
```
