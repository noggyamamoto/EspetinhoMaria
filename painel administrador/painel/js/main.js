// Teste "Canário": Se esta mensagem aparecer no console, o arquivo foi carregado.
console.log("✅ main.js foi carregado e está executando!");

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

            contentBody.innerHTML = content;
            console.log("✅ SUCESSO: Conteúdo inserido na página.");

        } catch (error) {
            contentBody.innerHTML = `<p style="color: red;">Ocorreu um erro. Verifique o console (F12).</p>`;
            console.error("❌ ERRO no bloco catch:", error);
        }
    }

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