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

    // ================== Atualiza status online no backend ==================
    try {
        await fetch(`http://127.0.0.1:5000/colaborador/status/${usuarioId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status: "online" }),
        });
    } catch (err) {
        console.error("Erro ao atualizar status:", err);
    }

    // ================== VARIÁVEIS DO CAROUSEL ==================
    const wrapper = document.querySelector(".modules-wrapper");
    const prevBtn = document.querySelector(".carousel-btn.prev");
    const nextBtn = document.querySelector(".carousel-btn.next");
    const searchInput = document.querySelector(".search-bar input");

    const allModules = Array.from(document.querySelectorAll(".module-card")).map(card => ({
        id: card.dataset.id || "",
        titulo: card.querySelector("h3").textContent,
        html: card.outerHTML
    }));

    let filteredModules = [...allModules];
    let currentSlide = 0;

    // ================== CAROUSEL ==================
    function renderModules() {
        wrapper.innerHTML = "";
        for (let i = 0; i < filteredModules.length; i += 4) {
            const slideModules = filteredModules.slice(i, i + 4);
            const slide = document.createElement("div");
            slide.classList.add("modules-slide");
            slide.style.justifyContent = slideModules.length < 4 ? "center" : "flex-start";

            slideModules.forEach(mod => {
                slide.insertAdjacentHTML("beforeend", mod.html);
            });
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
        filteredModules = allModules.filter(mod =>
            mod.titulo.toLowerCase().includes(query)
        );
        renderModules();
    });


    // Marca offline ao sair ou fechar a aba
async function marcarOffline() {
  const usuario = JSON.parse(localStorage.getItem("usuario_colaborador"));
  if (!usuario) return;

  try {
    await fetch("http://127.0.0.1:5000/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: usuario.email })
    });
  } catch (err) {
    console.error("Erro ao marcar offline:", err);
  }
}

// Logout manual
document.getElementById("btn-logout")?.addEventListener("click", async () => {
  await marcarOffline();
  localStorage.removeItem("usuario_colaborador");
  window.location.href = "/src/templates/auth/login.html";
});

// Fechar aba/janela
window.onbeforeunload = async () => {
  await marcarOffline();
};

    // ================== CARREGAR PROGRESSO ==================
    async function carregarProgresso() {
        try {
            const response = await fetch(`http://127.0.0.1:5000/colaborador/progresso/${usuarioId}`);
            if (!response.ok) throw new Error("Erro ao buscar progresso");

            const data = await response.json();
            const modulosAPI = data.modulos || [];

            let concluidos = 0;
            let naoIniciados = 0;

            modulosAPI.forEach(m => {
                if (m.percent >= 70) concluidos++;
                else naoIniciados++;
            });

            const statCards = document.querySelectorAll(".stat-card");
            if (statCards.length >= 2) {
                statCards[0].innerHTML = `<h3>Concluídos</h3><p class="stat-value">${concluidos}</p>`;
                statCards[1].innerHTML = `<h3>Não Iniciados</h3><p class="stat-value">${naoIniciados}</p>`;
            }

            const cards = document.querySelectorAll(".module-card");
            cards.forEach((card, idx) => {
                const bar = card.querySelector(".progress-bar-inner");
                if (!bar) return;

                const moduloAPI = modulosAPI[idx];
                if (moduloAPI) {
                    let percent = moduloAPI.percent;
                    if (percent > 100) percent = 100;
                    bar.style.width = `${percent}%`;
                }
            });

        } catch (error) {
            console.error("Erro ao carregar progresso:", error);
        }
    }

    // ================== INICIALIZA ==================
    renderModules();
});
