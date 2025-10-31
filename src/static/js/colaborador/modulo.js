document.addEventListener("DOMContentLoaded", async () => {
  const userNameElement = document.getElementById("user-name");
  const usuarioId = localStorage.getItem("usuario_id");

  // ================== VERIFICA LOGIN ==================
  if (!usuarioId) {
    userNameElement.textContent = "Olá, Usuário";
    console.warn("Usuário não identificado, redirecionando para login.");
    setTimeout(() => {
      window.location.href = "/src/templates/auth/login.html";
    }, 1500);
    return;
  }

  // ================== CARREGAR DADOS DO USUÁRIO ==================
  try {
    const res = await fetch(`http://127.0.0.1:5000/auth/usuario/${usuarioId}`);
    if (!res.ok) throw new Error("Erro ao buscar usuário");
    const data = await res.json();

    const usuario = data.usuario || data;
    const nomeUsuario = usuario.nome || "Usuário";

    userNameElement.textContent = `Olá, ${nomeUsuario}`;
    localStorage.setItem("nomeUsuario", nomeUsuario); // mantém sincronizado
  } catch (err) {
    console.error("Erro ao buscar usuário:", err);
    userNameElement.textContent = "Olá, Usuário";
  }

  // ================== VARIÁVEIS ==================
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
    filteredModules = allModules.filter(mod => mod.titulo.toLowerCase().includes(query));
    renderModules();
  });

  // ================== PROGRESSO ==================
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
