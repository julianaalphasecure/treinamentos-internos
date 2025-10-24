document.addEventListener("DOMContentLoaded", () => {
  const userName = localStorage.getItem("nomeUsuario") || "Usuário";
  document.getElementById("user-name").textContent = `Olá, ${userName}`;

  const wrapper = document.querySelector(".modules-wrapper");
  const prevBtn = document.querySelector(".carousel-btn.prev");
  const nextBtn = document.querySelector(".carousel-btn.next");
  const searchInput = document.querySelector(".search-bar input");

  const allModules = Array.from(document.querySelectorAll(".module-card")).map(card => ({
    titulo: card.querySelector("h3").textContent,
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

      slideModules.forEach(mod => {
        slide.insertAdjacentHTML("beforeend", mod.html);
      });

      // Centraliza se slide tiver menos de 4 módulos
      if (slideModules.length < 4) {
        slide.style.justifyContent = "center";
      }

      wrapper.appendChild(slide);
    }

    currentSlide = 0;
    updateCarousel();
  }

  function updateCarousel() {
    const slides = document.querySelectorAll(".modules-slide");
    const totalSlides = slides.length;
    const offset = -currentSlide * 100;
    wrapper.style.transform = `translateX(${offset}%)`;

    prevBtn.style.display = totalSlides <= 1 ? "none" : "block";
    nextBtn.style.display = totalSlides <= 1 ? "none" : "block";
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

  renderModules();
});
