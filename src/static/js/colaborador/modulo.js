document.addEventListener("DOMContentLoaded", () => {
  // Pega o nome do usuário do localStorage
  const userName = localStorage.getItem("nomeUsuario") || "Usuário";

  // Atualiza o elemento do header, se existir
  const userNameElement = document.getElementById("user-name");
  if (userNameElement) {
    userNameElement.textContent = `Olá, ${userName}`;
  }

  // CARROSSEL
  const wrapper = document.querySelector('.modules-wrapper');
  const slides = document.querySelectorAll('.modules-slide');
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');

  if (!wrapper || slides.length === 0) return;

  let currentSlide = 0;
  const totalSlides = slides.length;

  // Função para atualizar a posição do carrossel
  function updateCarousel() {
    const offset = -currentSlide * 100; // cada slide ocupa 100% da largura
    wrapper.style.transform = `translateX(${offset}%)`;
  }

  // Botão próximo
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentSlide = (currentSlide + 1) % totalSlides; // loop infinito
      updateCarousel();
    });
  }


  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentSlide = (currentSlide - 1 + totalSlides) % totalSlides; // loop infinito
      updateCarousel();
    });
  }

  // Inicializa carrossel
  updateCarousel();
});
