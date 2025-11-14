document.addEventListener("DOMContentLoaded", async () => {
    const userNameElement = document.getElementById("user-name");
    const usuarioColaborador = JSON.parse(localStorage.getItem("usuario_colaborador"));
    const token = localStorage.getItem("token_colaborador");
    const usuarioId = usuarioColaborador?.id;

    // ================== VERIFICA LOGIN ==================
    if (!usuarioColaborador || !usuarioId) {
        userNameElement.textContent = "Olá, Usuário";
        console.warn("Colaborador não identificado, redirecionando para login.");
        setTimeout(() => {
            window.location.href = "/src/templates/auth/login.html";
        }, 1500);
        return;
    }

    // ================== MOSTRA NOME ==================
    userNameElement.textContent = `Olá, ${usuarioColaborador.nome}`;

    // ================== CARROSSEL E PESQUISA (Mantido) ==================
    const wrapper = document.querySelector(".modules-wrapper");
    const prevBtn = document.querySelector(".carousel-btn.prev");
    const nextBtn = document.querySelector(".carousel-btn.next");
    const searchInput = document.querySelector(".search-bar input");

    const allModules = Array.from(document.querySelectorAll(".module-card")).map(card => ({
        id: parseInt(card.dataset.id),
        html: card.outerHTML
    }));

    let filteredModules = [...allModules];
    let currentSlide = 0;

    function renderModules() {
        wrapper.innerHTML = "";
        for (let i = 0; i < filteredModules.length; i += 4) {
            const slideModules = filteredModules.slice(i, i + 4);
            const slide = document.createElement("div");
            slide.classList.add("modules-slide");
            slide.style.justifyContent = slideModules.length < 4 ? "center" : "flex-start";
            slideModules.forEach(mod => slide.insertAdjacentHTML("beforeend", mod.html));
            wrapper.appendChild(slide);
        }
        currentSlide = 0;
        updateCarousel();
        
        // Chamada inicial da função de progresso após renderizar a estrutura dos módulos
        carregarProgresso(); 
    }

    function updateCarousel() {
        const slides = document.querySelectorAll(".modules-slide");
        const offset = -currentSlide * 100;
        wrapper.style.transform = `translateX(${offset}%)`;
        prevBtn.style.display = slides.length <= 1 ? "none" : "block";
        nextBtn.style.display = slides.length <= 1 ? "none" : "block";
    }

    nextBtn.addEventListener("click", () => {
        const slides = document.querySelectorAll(".modules-slide");
        if (currentSlide < slides.length - 1) {
            currentSlide++;
            updateCarousel();
        }
    });

    prevBtn.addEventListener("click", () => {
        if (currentSlide > 0) {
            currentSlide--;
            updateCarousel();
        }
    });

    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase();
        filteredModules = allModules.filter(mod => mod.html.toLowerCase().includes(query));
        renderModules();
    });
    
    // ================== CARREGAR PROGRESSO (AGORA INTERNO E CENTRALIZADO) ==================
    // Mantendo no window para compatibilidade caso outro script precise chamá-lo
    window.carregarProgresso = async function carregarProgresso() {
        const TOKEN = localStorage.getItem("token_colaborador"); 
        
        if (!TOKEN) {
            console.error("Token de autenticação ausente. Por favor, faça login.");
            return; 
        }

        try {
            const response = await fetch(`http://127.0.0.1:5000/colaborador/progresso/frontend`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${TOKEN}`, 
                    "Content-Type": "application/json"
                }
            }); 

            if (response.status === 401 || response.status === 403) {
                alert("Sessão expirada ou Token inválido. Por favor, faça login novamente."); 
                throw new Error("Não autorizado. Token inválido ou expirado.");
            }
            if (!response.ok) {
                throw new Error(`Erro ${response.status} ao buscar progresso.`);
            }
            
            const data = await response.json();
            const modulosAPI = data.modulos || [];
            const statsAPI = data.stats || { concluidos: 0, nao_iniciados: 9 }; 

            // ATUALIZA CONTADORES
            const statCards = document.querySelectorAll(".stat-card p.stat-value");
            if (statCards.length >= 2) {
                statCards[0].textContent = statsAPI.concluidos; 
                statCards[1].textContent = statsAPI.nao_iniciados; 
            } 

            // ATUALIZA BARRAS E BOTÕES
            const cards = document.querySelectorAll(".module-card");
            cards.forEach((card) => {
                const bar = card.querySelector(".progress-bar-inner");
                // Localiza o botão dentro do card. Se for 'a', ajuste o seletor.
                const button = card.querySelector("button") || card.querySelector("a"); 
                
                if (!bar || !button) return; 

                const moduloId = parseInt(card.dataset.id); 
                const moduloAPI = modulosAPI.find(m => m.modulo_id === moduloId);

                if (moduloAPI) {
                    let percent = moduloAPI.percent || 0; 
                    
                    if (moduloAPI.status === "concluido") {
                        percent = 100;
                        card.classList.add("concluido");
                        
                        // MUDAR PARA REFAZER
                        button.textContent = "Refazer"; 
                        button.classList.add("btn-refazer"); 
                        button.classList.remove("btn-acessar");
                        
                    } else {
                        card.classList.remove("concluido");
                        
                        // MUDAR PARA ACESSAR
                        button.textContent = "Acessar";
                        button.classList.remove("btn-refazer");
                        button.classList.add("btn-acessar");
                        
                        if (percent > 100) percent = 100;
                    }
                    
                    bar.style.width = `${percent}%`;
                } else {
                    bar.style.width = "0%";
                    button.textContent = "Acessar";
                    button.classList.remove("btn-refazer");
                    button.classList.add("btn-acessar");
                }
            });
            
        } catch (error) {
            console.error("Erro ao carregar progresso:", error);
            // Redirecionamento se for erro de autenticação/token
            if (error.message.includes("Não autorizado")) {
                localStorage.removeItem("token_colaborador");
                localStorage.removeItem("usuario_colaborador");
                setTimeout(() => window.location.href = "/src/templates/auth/login.html", 1000);
            }
        }
    }
    // =======================================================================


    // ================== FINALIZAR MÓDULO (Correto) ==================
    async function finalizarModulo(moduloId, nota = 100) {
        try {
            const response = await fetch(`http://127.0.0.1:5000/colaborador/progresso/finalizar/${usuarioId}/${moduloId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ nota_final: nota })
            });

            if (!response.ok) throw new Error("Erro ao finalizar módulo");

            // >>> CHAMADA CRÍTICA: RECARREGA A TELA APÓS SUCESSO <<<
            await carregarProgresso();
            
            // Feedback visual
            if (window.showToast) {
                window.showToast(`Módulo ${moduloId} finalizado com sucesso!`);
            }

        } catch (err) {
            console.error("Erro ao finalizar módulo:", err);
            if (window.showToast) {
                window.showToast("Erro ao finalizar módulo. Verifique se o módulo está sendo enviado corretamente.");
            }
        }
    }

    // LIGAÇÃO DO EVENTO DE FINALIZAÇÃO (Ponto que deve ser adaptado)
    // Se o seu botão de finalizar módulo estiver na página de módulo:
    document.querySelectorAll(".module-card button, .module-card a").forEach(element => {
        // Usa uma função de escuta para todos os botões/links nos cartões
        element.addEventListener("click", (e) => {
            const card = e.target.closest(".module-card");
            const moduloId = parseInt(card.dataset.id);

            // Verifique se este é o botão/evento que DEVE DISPARAR A FINALIZAÇÃO.
            // Se o botão for "Acessar", ele deve levar para a página do módulo, não finalizar.
            // Se for um botão/link "Finalizar Teste" dentro da página do módulo, 
            // este trecho de código DEVE ESTAR LÁ, e não no dashboard (modulo.js).
            
            // SE VOCÊ CLICAR AQUI NO DASHBOARD PARA TESTAR A FINALIZAÇÃO:
            if (moduloId === 2 && (e.target.textContent === "Finalizar" || e.target.textContent === "Acessar")) {
                 // **USE ISTO APENAS PARA TESTE RÁPIDO NO DASHBOARD!**
                 // A lógica correta de finalização DEVE estar na página de quiz/teste.
                 // Vamos simular a finalização com nota 100 para o módulo 2.
                 finalizarModulo(moduloId, 100);
                 e.preventDefault(); // Impede o clique de ir para outro link (Acessar)
            }
        });
    });

    // ================== INICIALIZA ==================
    renderModules();
});