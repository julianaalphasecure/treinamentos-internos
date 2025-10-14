const slides = document.querySelectorAll('.modules-slide');
const wrapper = document.querySelector('.modules-wrapper');
let currentIndex = 0;
let moduleLocked = false; 
let isFullScreen = false;


function updateCarousel() {
  wrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
  updateProgressBar();
}


document.querySelector('.next').addEventListener('click', () => {
  if(!moduleLocked || isFullScreen) {
    if(currentIndex < slides.length - 1) currentIndex++;
    updateCarousel();
  }
});

document.querySelector('.prev').addEventListener('click', () => {
  if(!moduleLocked || isFullScreen) {
    if(currentIndex > 0) currentIndex--;
    updateCarousel();
  }
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

// Timer
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


  resultMessage.innerHTML = '';

  if(percent >= 70) {
    const msg = document.createElement('p');
    msg.style.color = 'green';
    msg.style.fontWeight = 'bold';
    msg.textContent = '🎉 Parabéns! Você finalizou o Módulo 07 com sucesso.';
    resultMessage.appendChild(msg);

    
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Ir para a Home';
    nextBtn.classList.add('btn-submit');
    nextBtn.style.display = 'block';
    nextBtn.style.margin = '15px auto';
    nextBtn.addEventListener('click', () => {
      window.location.href = '/src/templates/colaborador/modulo.html';
    });
    resultMessage.appendChild(nextBtn);

  } else {
    const msg = document.createElement('p');
    msg.style.color = 'red';
    msg.style.fontWeight = 'bold';
    msg.textContent = 'Você não atingiu 70%. Precisa refazer o módulo.';
    resultMessage.appendChild(msg);

 
    const refazerBtn = document.createElement('button');
    refazerBtn.textContent = 'Refazer módulo';
    refazerBtn.classList.add('btn-submit');
    refazerBtn.style.display = 'block';
    refazerBtn.style.margin = '35px auto';
    refazerBtn.addEventListener('click', () => location.reload());
    resultMessage.appendChild(refazerBtn);
  }
});




document.getElementById('download-btn').addEventListener('click', () => {
  const link = document.createElement('a');
  link.href = '/src/static/pdf/modulo07.pdf';
  link.download = 'Modulo07_Conteudo.pdf';
  link.click();
});

// Miniaturas
const thumbnailsContainer = document.querySelector('.thumbnails');

slides.forEach((slide, idx) => {
  const thumb = document.createElement('img');
  thumb.src = slide.querySelector('img').src;
  if(idx === 0) thumb.classList.add('active');
  thumb.addEventListener('click', () => {
    currentIndex = idx;
    updateCarousel();
  });
  thumbnailsContainer.appendChild(thumb);
});

function updateThumbnails() {
  const thumbs = document.querySelectorAll('.thumbnails img');
  thumbs.forEach((t, i) => t.classList.toggle('active', i === currentIndex));
}

// Progresso detalhado
const progressText = document.getElementById('progress-text');
function updateProgressText() {
  progressText.textContent = `Slide ${currentIndex + 1} de ${slides.length}`;
}

// Atualizar funções
function updateCarousel() {
  wrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
  updateProgressBar();
  updateThumbnails();
  updateProgressText();
}

// Notas rápidas
const quickNotesContainer = document.getElementById('quick-notes-container');
const quickNotesTextarea = document.getElementById('quick-notes');
const closeNotesBtn = document.getElementById('close-notes');

// Atalho 'N' para abrir/fechar notas
document.addEventListener('keydown', (e) => {
  if(e.key.toLowerCase() === 'n') {
    quickNotesContainer.style.display = quickNotesContainer.style.display === 'none' ? 'block' : 'none';
  }
});

closeNotesBtn.addEventListener('click', () => {
  quickNotesContainer.style.display = 'none';
});

// Salvar notas no localStorage
quickNotesTextarea.addEventListener('input', () => {
  localStorage.setItem('modulo01_notes', quickNotesTextarea.value);
});

// Carregar notas salvas
window.addEventListener('load', () => {
  const savedNotes = localStorage.getItem('modulo01_notes');
  if(savedNotes) quickNotesTextarea.value = savedNotes;
});

// Modo noturno / contraste
let darkMode = false;
function toggleDarkMode() {
  darkMode = !darkMode;
  document.body.style.background = darkMode ? '#1e1e1e' : '#f5f7fa';
  document.body.style.color = darkMode ? '#f5f5f5' : '#333';
  document.querySelectorAll('.module-card').forEach(c => c.style.filter = darkMode ? 'brightness(0.8)' : 'brightness(1)');
}

// Tecla 'M' para modo noturno
document.addEventListener('keydown', (e) => {
  if(e.key.toLowerCase() === 'm') toggleDarkMode();
});


document.addEventListener('keydown', (e) => {
  if(e.key === 'ArrowRight') document.querySelector('.next').click();
  if(e.key === 'ArrowLeft') document.querySelector('.prev').click();
  if(e.key.toLowerCase() === 'f') fullscreenBtn.click();
  if(e.key.toLowerCase() === 'd') document.getElementById('download-btn').click();
});

btnFinalizar.addEventListener('click', () => {
  exercisesSection.style.display = 'block';
  moduleLocked = true; 
  nextBtn.style.opacity = '0.4';
  prevBtn.style.opacity = '0.4';
  nextBtn.style.cursor = 'not-allowed';
  prevBtn.style.cursor = 'not-allowed';
  window.scrollTo({top: exercisesSection.offsetTop - 20, behavior: 'smooth'});
  startTimer();

 
  localStorage.removeItem('currentModuleSlide');
});




const fullscreenBtn = document.getElementById('fullscreen-btn');

fullscreenBtn.addEventListener('click', () => {
  const currentModuleCard = slides[currentIndex].querySelector('.module-card');

  if (!isFullScreen) {
    if(currentModuleCard.requestFullscreen) {
      currentModuleCard.requestFullscreen();
    } else if(currentModuleCard.webkitRequestFullscreen) {
      currentModuleCard.webkitRequestFullscreen();
    } else if(currentModuleCard.msRequestFullscreen) {
      currentModuleCard.msRequestFullscreen();
    }
    isFullScreen = true;
    nextBtn.style.opacity = '1';
    prevBtn.style.opacity = '1';
    nextBtn.style.cursor = 'pointer';
    prevBtn.style.cursor = 'pointer';
  } else {
    if(document.exitFullscreen) {
      document.exitFullscreen();
    } else if(document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if(document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    isFullScreen = false;
    if(moduleLocked) {
      nextBtn.style.opacity = '0.4';
      prevBtn.style.opacity = '0.4';
      nextBtn.style.cursor = 'not-allowed';
      prevBtn.style.cursor = 'not-allowed';
    }
  }
});



const progressBarContainer = document.createElement('div');
progressBarContainer.classList.add('progress-bar');
const progressBarFill = document.createElement('div');
progressBarFill.classList.add('progress-bar-fill');
progressBarContainer.appendChild(progressBarFill);
document.querySelector('.modules').insertBefore(progressBarContainer, document.querySelector('.modules-carousel'));

function updateProgressBar() {
  const percent = ((currentIndex + 1) / slides.length) * 100;
  progressBarFill.style.width = `${percent}%`;
}

updateProgressBar();

const darkModeBtn = document.getElementById('dark-mode-btn');

darkModeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});
