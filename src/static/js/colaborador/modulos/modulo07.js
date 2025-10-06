const slides = document.querySelectorAll('.modules-slide');
const wrapper = document.querySelector('.modules-wrapper');
let currentIndex = 0;
let moduleLocked = false; 

function updateCarousel() {
  wrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
}

document.querySelector('.next').addEventListener('click', () => {
  if(!moduleLocked && currentIndex < slides.length - 1) currentIndex++;
  updateCarousel();
});

document.querySelector('.prev').addEventListener('click', () => {
  if(!moduleLocked && currentIndex > 0) currentIndex--;
  updateCarousel();
});


const btnFinalizar = document.querySelector('.btn-finalizar');
const exercisesSection = document.querySelector('.exercises');
const nextBtn = document.querySelector('.next');
const prevBtn = document.querySelector('.prev');

btnFinalizar.addEventListener('click', () => {
  exercisesSection.style.display = 'block';
  moduleLocked = true; 
  nextBtn.style.opacity = '0.4';
  prevBtn.style.opacity = '0.4';
  nextBtn.style.cursor = 'not-allowed';
  prevBtn.style.cursor = 'not-allowed';
  window.scrollTo({top: exercisesSection.offsetTop - 20, behavior: 'smooth'});
  startTimer();
});


const exWrapper = document.querySelector('.exercise-wrapper');
const exSlides = document.querySelectorAll('.exercise-slide');
let exIndex = 0;

function updateExerciseCarousel() {
  exWrapper.style.transform = `translateX(-${exIndex * 100}%)`;
  const btnSubmit = document.getElementById('submit-exercises');
  btnSubmit.style.display = exIndex === exSlides.length - 1 ? 'block' : 'none';
}

document.querySelector('.next-exercise').addEventListener('click', () => {
  if(exIndex < exSlides.length - 1) exIndex++;
  updateExerciseCarousel();
});

document.querySelector('.prev-exercise').addEventListener('click', () => {
  if(exIndex > 0) exIndex--;
  updateExerciseCarousel();
});

let timerInterval;
let totalTime = 30 * 60;

function startTimer() {
  const timerDisplay = document.getElementById('timer');
  clearInterval(timerInterval);
  totalTime = 30 * 60;

  timerInterval = setInterval(() => {
    let minutes = Math.floor(totalTime / 60);
    let seconds = totalTime % 60;
    timerDisplay.textContent = `Tempo restante: ${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
    totalTime--;

    if(totalTime < 0) {
      clearInterval(timerInterval);
      alert('Tempo esgotado! Você precisa refazer o módulo.');
      location.reload();
    }
  }, 1000);
}


document.getElementById('submit-exercises').addEventListener('click', () => {
  clearInterval(timerInterval);
  let score = 0;

  exSlides.forEach(slide => {
    const selected = slide.querySelector('input[type="radio"]:checked');
    if(selected && selected.value === slide.dataset.answer) score++;
  });

  const percent = Math.round((score / exSlides.length) * 100);
  const scoreDisplay = document.getElementById('score');
  const resultMessage = document.getElementById('result-message');

  scoreDisplay.textContent = `Você acertou ${score} de ${exSlides.length} questões (${percent}%)`;

  if(percent >= 70) {
    resultMessage.innerHTML = `<p style="color:green; font-weight:bold;">🎉 Parabéns! Você finalizou o Módulo 07 com sucesso.</p>`;
  } else {
    resultMessage.innerHTML = `<p style="color:red; font-weight:bold;">❌ Você não atingiu 70%. Refaça todo o módulo.</p>`;
    setTimeout(() => location.reload(), 5000);
  }
});

document.getElementById('download-btn').addEventListener('click', () => {
  const link = document.createElement('a');
  link.href = '/src/static/pdf/modulo07.pdf';
  link.download = 'Modulo07_Conteudo.pdf';
  link.click();
});
