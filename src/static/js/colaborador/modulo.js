document.addEventListener("DOMContentLoaded", () => {
  const userName = localStorage.getItem("nomeUsuario") || "Usuário";
  document.getElementById("user-name").textContent = `Olá, ${userName}`;
});

// Seleciona elementos do carrossel
const wrapper = document.querySelector('.modules-wrapper');
const slides = document.querySelectorAll('.modules-slide');
const prevBtn = document.querySelector('.carousel-btn.prev');
const nextBtn = document.querySelector('.carousel-btn.next');

let currentSlide = 0;
const totalSlides = slides.length;

// Função para atualizar a posição do carrossel
function updateCarousel() {
  const offset = -currentSlide * 100; // cada slide ocupa 100% da largura
  wrapper.style.transform = `translateX(${offset}%)`;
}

// Botão próximo
nextBtn.addEventListener('click', () => {
  currentSlide = (currentSlide + 1) % totalSlides; // loop infinito
  updateCarousel();
});

// Botão anterior
prevBtn.addEventListener('click', () => {
  currentSlide = (currentSlide - 1 + totalSlides) % totalSlides; // loop infinito
  updateCarousel();
});

// Inicializa
updateCarousel();
