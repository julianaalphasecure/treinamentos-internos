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

    // ================== CARROSSEL ==================
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

    // ================== CARREGAR PROGRESSO (COM CORREÇÃO) ==================
    async function carregarProgresso() {
        // 1. OBTÉM O TOKEN E VERIFICA SE ELE EXISTE
        const TOKEN = localStorage.getItem("token_colaborador"); 
        
        console.log("Token lido do localStorage:", TOKEN ? "Token presente" : "Token AUSENTE/NULL"); 
        
        if (!TOKEN) {
            console.error("Token de autenticação ausente. Por favor, faça login.");
            return; 
        }

        try {
            // 2. FAZ A REQUISIÇÃO, ENVIANDO O TOKEN
            const response = await fetch(`http://127.0.0.1:5000/colaborador/progresso/frontend`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${TOKEN}`, // Envio do token
                    "Content-Type": "application/json"
                }
            }); 

            // 3. TRATAMENTO DE ERRO
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

            // ATUALIZA BARRAS
            const cards = document.querySelectorAll(".module-card");
            cards.forEach((card) => {
                const bar = card.querySelector(".progress-bar-inner");
                
                // 🚨 NOVO: Localiza o botão dentro do card. Se não for 'button', ajuste aqui!
                const button = card.querySelector("button"); 
                
                // Agora verifica se o botão também existe
                if (!bar || !button) return; 

                const moduloId = parseInt(card.dataset.id); 
                const moduloAPI = modulosAPI.find(m => m.modulo_id === moduloId);

                if (moduloAPI) {
                    let percent = moduloAPI.percent || 0; 
                    
                    // === LÓGICA DE PROGRESSO E BOTÃO CORRIGIDA ===
                    if (moduloAPI.status === "concluido") {
                        // 1. BARRA: Força 100%
                        percent = 100;
                        card.classList.add("concluido");
                        
                        // 2. BOTÃO: Mudar para Refazer
                        button.textContent = "Refazer"; 
                        button.classList.add("btn-refazer"); // Classe para estilização
                        
                    } else {
                        card.classList.remove("concluido");
                        
                        // 2. BOTÃO: Mudar para Acessar
                        button.textContent = "Acessar";
                        button.classList.remove("btn-refazer");
                        
                        // 1. BARRA: Progresso parcial
                        if (percent > 100) percent = 100;
                    }
                    // ===============================================
                    
                    bar.style.width = `${percent}%`;

                } else {
                    bar.style.width = "0%";
                    // Módulos não iniciados
                    button.textContent = "Acessar";
                    button.classList.remove("btn-refazer");
                }
            });
            
        } catch (error) {
            console.error("Erro ao carregar progresso:", error);
        }
    }
    // =======================================================================


    // ================== FINALIZAR MÓDULO ==================
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

            await carregarProgresso();
        } catch (err) {
            console.error("Erro ao finalizar módulo:", err);
        }
    }

    // Exemplo: botão dentro do card para finalizar módulo
    document.querySelectorAll(".module-card .btn-finalizar").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const card = e.target.closest(".module-card");
            const moduloId = parseInt(card.dataset.id);
            finalizarModulo(moduloId);
        });
    });

    // ================== INICIALIZA ==================
    renderModules();
});