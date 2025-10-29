document.addEventListener("DOMContentLoaded", () => {
  const userName = localStorage.getItem("nomeUsuario") || "Usuário";
  document.getElementById("user-name").textContent = `Olá, ${userName}`;

  const wrapper = document.querySelector(".modules-wrapper");
  const prevBtn = document.querySelector(".carousel-btn.prev");
  const nextBtn = document.querySelector(".carousel-btn.next");
  const searchInput = document.querySelector(".search-bar input");

  const allModules = Array.from(document.querySelectorAll(".module-card")).map(card => ({
    id: card.dataset.id || "", // opcional, mas não usado na API
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
    carregarProgresso(); // atualiza barras e stats
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
    filteredModules = allModules.filter(mod => mod.titulo.toLowerCase().includes(query));
    renderModules();
  });

  // ================== FUNÇÃO DE PROGRESSO ==================
  async function carregarProgresso() {
    try {
      const response = await fetch("http://localhost:5000/colaborador/progresso/frontend");
      if (!response.ok) throw new Error("Erro ao buscar progresso");

      const data = await response.json();
      const modulosAPI = data.modulos || [];

      let concluidos = 0;
      let naoIniciados = 0;

      modulosAPI.forEach(m => {
        if (m.percent >= 70) concluidos++;
        else naoIniciados++;
      });

      // Atualiza cards de stats
      const statCards = document.querySelectorAll(".stat-card");
      if (statCards.length >= 2) {
        statCards[0].innerHTML = `<h3>Concluídos</h3><p class="stat-value">${concluidos}</p>`;
        statCards[1].innerHTML = `<h3>Não Iniciados</h3><p class="stat-value">${naoIniciados}</p>`;
      }

      // Atualiza barras existentes
      const cards = document.querySelectorAll(".module-card");
      cards.forEach((card, idx) => {
        const bar = card.querySelector(".progress-bar-inner");
        if (!bar) return;

        const moduloAPI = modulosAPI[idx]; // associa pelo índice
        if (moduloAPI) {
          let percent = moduloAPI.percent;
          if (percent > 100) percent = 100;
          bar.style.width = percent + "%";
        }
      });

    } catch (error) {
      console.error("Erro ao carregar progresso:", error);
    }
  }

  // ================== INICIALIZA ==================
  renderModules();
});
