// Teste "Canário": Se esta mensagem aparecer no console, o arquivo foi carregado.
console.log("✅ main.js foi carregado e está executando!");

// Carrega funções globais se não estiverem disponíveis
if (!window.PainelAdmin) {
    console.log("📦 Carregando funções globais...");
    const script = document.createElement('script');
    script.src = 'js/global-functions.js';
    script.onload = () => console.log("✅ Funções globais carregadas");
    document.head.appendChild(script);
}

document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ Evento DOMContentLoaded disparado. O HTML está pronto.");

    const contentBody = document.querySelector('.content-body');
    const pageTitle = document.getElementById('page-title');

    if (!contentBody || !pageTitle) {
        console.error("❌ ERRO CRÍTICO: Não encontrei o elemento com a classe '.content-body' ou o id '#page-title'.");
        return;
    }

    async function loadContent(pageName, title) {
        console.log(`▶️ Iniciando loadContent para a página: '${pageName}'`);
        try {
            contentBody.innerHTML = '<p>Carregando...</p>';
            pageTitle.textContent = title.toUpperCase();
            
            // =========================================================
            // ✨ CORREÇÃO FINAL: Caminho do fetch sem o "../"
            // =========================================================
            const url = `partes/${pageName}.html`;
            console.log(`... Buscando conteúdo de: ${url}`);

            const response = await fetch(url);
            console.log("... Resposta do 'fetch' recebida:", response);

            if (!response.ok) {
                throw new Error(`Erro na rede ao buscar o arquivo: ${response.status} ${response.statusText}`);
            }
            
            const content = await response.text();
            console.log(`... Conteúdo recebido (tamanho: ${content.length} caracteres).`);

            // =========================================================
            // 🔧 CORREÇÃO: Remove scripts anteriores e executa novos sempre
            // =========================================================
            
            // Remove scripts dinâmicos anteriores
            const oldScripts = document.querySelectorAll('script[data-dynamic-page]');
            oldScripts.forEach(script => script.remove());
            
            // Insere o conteúdo HTML
            contentBody.innerHTML = content;
            
            // Procura e executa todos os scripts da página carregada
            const scripts = contentBody.querySelectorAll('script');
            console.log(`... Encontrados ${scripts.length} scripts para executar`);
            
            scripts.forEach((script, index) => {
                try {
                    console.log(`... Executando script ${index + 1}/${scripts.length}`);
                    
                    if (script.src) {
                        // Script externo
                        const newScript = document.createElement('script');
                        newScript.src = script.src;
                        newScript.setAttribute('data-dynamic-page', pageName);
                        newScript.onload = () => console.log(`✅ Script externo ${index + 1} carregado`);
                        document.head.appendChild(newScript);
                    } else {
                        // Script inline - executa imediatamente
                        console.log(`... Executando script inline ${index + 1}`);
                        try {
                            // Usa eval para executar no escopo global mantendo acesso a todas as variáveis
                            eval(script.textContent);
                            console.log(`✅ Script inline ${index + 1} executado com sucesso`);
                        } catch (evalError) {
                            console.error(`❌ Erro na execução do script inline ${index + 1}:`, evalError);
                            console.log(`Conteúdo do script que falhou:`, script.textContent.substring(0, 200) + '...');
                        }
                    }
                } catch (scriptError) {
                    console.error(`❌ Erro ao processar script ${index + 1}:`, scriptError);
                }
            });
            
            console.log("✅ SUCESSO: Conteúdo inserido na página e scripts executados.");

        } catch (error) {
            contentBody.innerHTML = `<p style="color: red;">Erro ao carregar página: ${error.message}<br>Verifique o console (F12) para mais detalhes.</p>`;
            console.error("❌ ERRO no bloco catch:", error);
        }
    }

    // Torna a função loadContent acessível globalmente
    window.DashboardController = {
        loadContent: loadContent,
        contentBody: contentBody,
        pageTitle: pageTitle
    };
    
    console.log("✅ DashboardController criado e disponível globalmente");

    // --- Lógica do Menu Lateral (Acordeão) ---
    const navItemHeaders = document.querySelectorAll('.nav-item-header');
    navItemHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const navItem = header.parentElement;
            document.querySelectorAll('.nav-item').forEach(item => {
                if (item !== navItem && item.classList.contains('open')) {
                    item.classList.remove('open');
                }
            });
            navItem.classList.toggle('open');
        });
    });

    // --- Lógica de Navegação ---
    const sidebarNav = document.querySelector('.sidebar-nav');
    if (sidebarNav) {
        sidebarNav.addEventListener('click', function(event) {
            const targetLink = event.target.closest('a, .nav-item-header');
            if (!targetLink) return;

            const page = targetLink.dataset.page;
            const title = targetLink.dataset.title;
            
            if (page) {
                event.preventDefault(); 
                loadContent(page, title);
            }
        });
    }
    
    // Carrega a página inicial por padrão
    console.log("Iniciando carregamento da página inicial...");
    loadContent('inicio', 'Dashboard');

});