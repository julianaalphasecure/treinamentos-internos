document.addEventListener("DOMContentLoaded", async () => {

    // ================== BLOQUEAR BOTÃO VOLTAR ==================
    history.pushState(null, null, location.href);
    window.onpopstate = function () {
        history.go(1);
    };

    // ================== LOGOUT SEGURO ==================
    const btnLogout = document.getElementById("btn-logout");
    if (btnLogout) {
        btnLogout.addEventListener("click", (e) => {
            e.preventDefault();

            // Remove dados
            sessionStorage.removeItem("token_colaborador");
            sessionStorage.removeItem("usuario_colaborador");

            // Redireciona sem permitir voltar
            window.location.replace("/src/templates/auth/login.html");
        });
    }

    // ================== VERIFICA LOGIN ==================
    const userNameElement = document.getElementById("user-name");
    const usuarioColaborador = JSON.parse(sessionStorage.getItem("usuario_colaborador"));
    const token = sessionStorage.getItem("token_colaborador");
    const usuarioId = usuarioColaborador?.id;

    if (!usuarioColaborador || !usuarioId) {
        userNameElement.textContent = "Olá, Usuário";
        console.warn("Colaborador não identificado, redirecionando para login.");
        setTimeout(() => {
            window.location.replace("/src/templates/auth/login.html");
        }, 1500);
        return;
    }

    // ================== MOSTRA NOME ==================
    userNameElement.textContent = `Olá, ${usuarioColaborador.nome}`;

    // ================== CARROSSEL E PESQUISA ==================
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

    // ================== CARREGAR PROGRESSO ==================
    window.carregarProgresso = async function carregarProgresso() {
        const TOKEN = sessionStorage.getItem("token_colaborador");

        if (!TOKEN) {
            console.error("Token ausente.");
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
                alert("Sessão expirada. Faça login novamente.");
                throw new Error("Não autorizado.");
            }

            if (!response.ok) throw new Error(`Erro ${response.status}`);

            const data = await response.json();
            const modulosAPI = data.modulos || [];
            const statsAPI = data.stats || { concluidos: 0, nao_iniciados: 9 };

            const statCards = document.querySelectorAll(".stat-card p.stat-value");
            if (statCards.length >= 2) {
                statCards[0].textContent = statsAPI.concluidos;
                statCards[1].textContent = statsAPI.nao_iniciados;
            }

            const cards = document.querySelectorAll(".module-card");
            cards.forEach((card) => {
                const bar = card.querySelector(".progress-bar-inner");
                const button = card.querySelector("button") || card.querySelector("a");
                if (!bar || !button) return;

                const moduloId = parseInt(card.dataset.id);
                const moduloAPI = modulosAPI.find(m => String(m.modulo_id) === String(moduloId));

                if (moduloAPI) {
                    let percent = moduloAPI.percent || 0;
                    
                    let status = moduloAPI.status;
                    if (status === "concluido" && percent === 0) {
                        status = "nao_iniciado"; 
                    }

                    if (status === "concluido") {
                        percent = 100;
                        card.classList.add("concluido");

                        button.textContent = "Refazer";
                        button.classList.add("btn-refazer");
                        button.classList.remove("btn-acessar");

                    } else {
                        card.classList.remove("concluido");

                        button.textContent = "Acessar";
                        button.classList.remove("btn-refazer");
                        button.classList.add("btn-acessar");
                    }

                    bar.style.width = `${percent}%`;
                } else {
                    bar.style.width = "0%";
                }
            });

        } catch (error) {
            console.error("Erro ao carregar progresso:", error);

            if (error.message.includes("Não autorizado")) {
                sessionStorage.removeItem("token_colaborador");
                sessionStorage.removeItem("usuario_colaborador");
                window.location.replace("/src/templates/auth/login.html");
            }
        }
    };

    // ================== FINALIZAR MÓDULO ==================
    async function finalizarModulo(moduloId, nota = 100) {
        try {
            const response = await fetch(`http://127.0.0.1:5000/colaborador/progresso/finalizar/${moduloId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ nota_final: nota })
            });

            if (!response.ok) throw new Error("Erro ao finalizar módulo");
            await carregarProgresso();

            if (window.showToast) {
                window.showToast(`Módulo ${moduloId} finalizado com sucesso!`);
            }

        } catch (err) {
            console.error("Erro ao finalizar módulo:", err);
            if (window.showToast) {
                window.showToast("Erro ao finalizar módulo.");
            }
        }
    }

    // ================== INICIALIZA ==================
    renderModules();
});
