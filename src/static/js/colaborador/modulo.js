document.addEventListener("DOMContentLoaded", () => {
  const userName = localStorage.getItem("nomeUsuario") || "Usuário";
  document.getElementById("user-name").textContent = `Olá, ${userName}`;

  const wrapper = document.querySelector(".modules-wrapper");
  const prevBtn = document.querySelector(".carousel-btn.prev");
  const nextBtn = document.querySelector(".carousel-btn.next");
  const searchInput = document.querySelector(".search-bar input");

  // Captura todos os módulos do HTML
  const allModules = Array.from(document.querySelectorAll(".module-card")).map(card => {
    return {
      titulo: card.querySelector("h3").textContent,
      html: card.outerHTML
    };
  });

  let filteredModules = [...allModules];
  let currentSlide = 0;

  // Função para renderizar módulos em slides 2x2
  function renderModules() {
    wrapper.innerHTML = "";

    for (let i = 0; i < filteredModules.length; i += 4) {
      const slideModules = filteredModules.slice(i, i + 4);
      const slide = document.createElement("div");
      slide.classList.add("modules-slide");

      slideModules.forEach(mod => {
        slide.insertAdjacentHTML("beforeend", mod.html); // clona o HTML do módulo
      });

      wrapper.appendChild(slide);
    }

    currentSlide = 0;
    updateCarousel();
  }

  // Atualiza a posição do carrossel
  function updateCarousel() {
    const slides = document.querySelectorAll(".modules-slide");
    const totalSlides = slides.length;
    const offset = -currentSlide * 100;
    wrapper.style.transform = `translateX(${offset}%)`;

    prevBtn.style.display = totalSlides <= 1 ? "none" : "block";
    nextBtn.style.display = totalSlides <= 1 ? "none" : "block";
  }

  // Navegação
  nextBtn.addEventListener("click", () => {
    const slides = document.querySelectorAll(".modules-slide");
    currentSlide = (currentSlide + 1) % slides.length;
    updateCarousel();
  });

  prevBtn.addEventListener("click", () => {
    const slides = document.querySelectorAll(".modules-slide");
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateCarousel();
  });

  // Pesquisa de módulos
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    filteredModules = allModules.filter(mod =>
      mod.titulo.toLowerCase().includes(query)
    );
    renderModules();
  });

  // Inicializa carrossel
  renderModules();
});

document.addEventListener("DOMContentLoaded", () => {
  // Recupera preferências salvas
  const savedTheme = localStorage.getItem("theme") || "claro";
  const savedFont = localStorage.getItem("font-size") || "padrao";

  document.body.setAttribute("data-theme", savedTheme);
  document.body.setAttribute("data-font", savedFont);

  // Função para alterar tema
  window.setTheme = (theme) => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  };

  // Função para alterar tamanho da fonte
  window.setFontSize = (size) => {
    document.body.setAttribute("data-font", size);
    localStorage.setItem("font-size", size);
  };

  // Função para mostrar toast
  window.showToast = (msg, duration = 2500) => {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = msg;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 100);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, duration);
  };
});
