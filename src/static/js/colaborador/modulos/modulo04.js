const wrapper = document.querySelector('.modules-wrapper');
const slides = document.querySelectorAll('.modules-slide');
const prevBtn = document.querySelector('.carousel-btn.prev');
const nextBtn = document.querySelector('.carousel-btn.next');
const finalizarBtn = document.querySelector('.btn-finalizar');
const exercisesSection = document.querySelector('.exercises');
const carouselSection = document.querySelector('.modules-carousel');
let index = 0;

// Função para atualizar carrossel
function updateCarousel() {
  wrapper.style.transform = `translateX(-${index * 100}%)`;
}

// Botões
prevBtn.addEventListener('click', () => {
  if (index > 0) index--;
  updateCarousel();
});
nextBtn.addEventListener('click', () => {
  if (index < slides.length - 1) index++;
  updateCarousel();
});

// Botão finalizar mostra exercícios
finalizarBtn.addEventListener('click', () => {
  carouselSection.style.display = 'none';
  document.querySelector('.carousel-controls').style.display = 'none';
  exercisesSection.style.display = 'block';
});

// Formulário de exercícios
document.getElementById('exercise-form').addEventListener('submit', function(e){
  e.preventDefault();
  const questions = document.querySelectorAll('.question');
  let score = 0;
  questions.forEach((q, i) => {
    const answer = q.dataset.answer;
    const selected = q.querySelector(`input[name="q${i+1}"]:checked`);
    if(selected && selected.value === answer) score++;
  });
  document.getElementById('score').innerText = `Sua pontuação: ${score} de ${questions.length}`;
});
