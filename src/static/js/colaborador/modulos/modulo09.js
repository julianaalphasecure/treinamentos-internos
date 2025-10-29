// ================== VARIÁVEIS PRINCIPAIS ==================
let slidesNormal = document.querySelectorAll('.modules-slide:not(.dark-slide)');
let slidesDark = document.querySelectorAll('.dark-slide');
const wrapper = document.querySelector('.modules-wrapper');
let currentIndex = 0;
let moduleLocked = false;
let isFullScreen = false;
let darkMode = false;
const moduleId = "modulo01"; // ID para salvar progresso
const totalSlides = slidesNormal.length;

// ================== FUNÇÃO ATUALIZA CARROSSEL ==================
function updateCarousel() {
  wrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
  updateProgressBar();
  updateThumbnails();
  updateProgressText();
  updateModuleProgress(moduleId, currentIndex, totalSlides);
}

// ================== FUNÇÃO SALVAR PROGRESSO ==================
function updateModuleProgress(moduleId, lastSlideIndex, totalSlides) {
  const progress = JSON.parse(localStorage.getItem("moduleProgress") || "{}");
  progress[moduleId] = lastSlideIndex;
  localStorage.setItem("moduleProgress", JSON.stringify(progress));

  const moduleCard = document.querySelector(`.module-card[data-id='${moduleId}']`);
  if (moduleCard) {
    let progressBar = moduleCard.querySelector(".module-progress-fill");
    if (!progressBar) {
      progressBar = document.createElement("div");
      progressBar.classList.add("module-progress-fill");
      progressBar.style.height = "5px";
      progressBar.style.background = "#4caf50";
      progressBar.style.width = "0%";
      moduleCard.appendChild(progressBar);
    }
    progressBar.style.width = `${((lastSlideIndex+1)/totalSlides)*100}%`;
  }
}

// ================== CARREGA PROGRESSO ==================
function loadModuleProgress(moduleId) {
  const progress = JSON.parse(localStorage.getItem("moduleProgress") || "{}");
  return progress[moduleId] || 0;
}

// ================== CONTROLES DE EXERCÍCIOS ==================
document.querySelectorAll('.options label').forEach(label => {
  label.addEventListener('click', () => {
    const group = label.parentElement.querySelectorAll('label');
    group.forEach(l => l.classList.remove('selected'));
    label.classList.add('selected');
    const radio = document.getElementById(label.getAttribute('for'));
    if (radio) radio.checked = true;
  });
});

// ----------------- OVERLAY RESULTADO -----------------
const overlay = document.createElement('div');
overlay.id = 'result-overlay';
overlay.setAttribute('role', 'dialog');
overlay.setAttribute('aria-hidden', 'true');
overlay.innerHTML = `
  <div class="result-card" role="document">
    <h2 class="result-title"></h2>
    <p class="result-score" id="overlay-score"></p>
    <div class="result-actions">
      <button class="btn-submit btn-refazer">Refazer módulo</button>
      <button class="btn-submit btn-proximo">Ir para a Home</button>
    </div>
  </div>
`;
document.body.appendChild(overlay);

const overlayCard = overlay.querySelector('.result-card');
const title = overlay.querySelector('.result-title');
const scoreText = overlay.querySelector('#overlay-score');
const btnRefazer = overlay.querySelector('.btn-refazer');
const btnProximo = overlay.querySelector('.btn-proximo');

function openResultOverlay() {
  overlay.style.display = 'flex';
  overlay.setAttribute('aria-hidden', 'false');
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
}

function closeResultOverlay() {
  overlay.style.display = 'none';
  overlay.setAttribute('aria-hidden', 'true');
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
}

// Fechar clicando fora do card
overlay.addEventListener('click', (e) => {
  if (e.target === overlay) closeResultOverlay();
});

// ESC para fechar
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && overlay.style.display === 'flex') closeResultOverlay();
});

// ================== HANDLER DE ENVIO ==================
document.getElementById('submit-exercises').addEventListener('click', () => {
  clearInterval(timerInterval);

  let score = 0;
  exSlides.forEach(slide => {
    const selected = slide.querySelector('input[type="radio"]:checked');
    if (selected && selected.value === slide.dataset.answer) score++;
  });

  const percent = Math.round((score / exSlides.length) * 100);

  // Reset classes e botões
  overlayCard.classList.remove('success', 'fail');
  btnRefazer.style.display = 'none';
  btnProximo.style.display = 'none';

  scoreText.textContent = `Você acertou ${percent}% (${score} de ${exSlides.length})`;

  if (percent >= 70) {
    overlayCard.classList.add('success');
    title.textContent = '✅ Parabéns! Módulo concluído com sucesso.';
    btnProximo.style.display = 'inline-block';
    btnProximo.onclick = () => {
      closeResultOverlay();
      window.location.href = '/src/templates/colaborador/modulo.html';
    };
  } else {
    overlayCard.classList.add('fail');
    title.textContent = '❌ Você não atingiu 70%';
    btnRefazer.style.display = 'inline-block';
    btnRefazer.onclick = () => {
      closeResultOverlay();

      // Volta ao primeiro slide do módulo e reinicia visualização do conteúdo
      currentIndex = 0;
      updateCarousel();

      // Mantém a seção de exercícios oculta
      exercisesSection.style.display = 'none';

      // Destrava botões de navegação
      moduleLocked = false;
      nextBtn.style.opacity = '1';
      prevBtn.style.opacity = '1';
      nextBtn.style.cursor = 'pointer';
      prevBtn.style.cursor = 'pointer';

      // Reativa miniaturas
      document.querySelectorAll('.thumbnails img').forEach(img => {
        img.style.pointerEvents = 'auto';
        img.style.opacity = '1';
        img.style.filter = 'none';
      });

      // Remove listener de travamento de setas
      document.removeEventListener('keydown', lockArrows);

      // Reseta índice dos exercícios
      exIndex = 0;
      updateExerciseCarousel();

      // Limpa timer
      clearInterval(timerInterval);
      totalTime = 30 * 60;
      document.getElementById('timer').textContent = '';
    };
  }

  overlay.style.display = 'flex';
  void overlay.offsetWidth;
  overlayCard.classList.add('pop-in');
  openResultOverlay();
});



// ================== CONTROLES DO CARROSSEL PRINCIPAL ==================
document.querySelector('.next').addEventListener('click', () => {
  const slides = darkMode ? slidesDark : slidesNormal;
  if (!moduleLocked || isFullScreen) {
    if (currentIndex < slides.length - 1) currentIndex++;
    updateCarousel();
  }
});

document.querySelector('.prev').addEventListener('click', () => {
  const slides = darkMode ? slidesDark : slidesNormal;
  if (!moduleLocked || isFullScreen) {
    if (currentIndex > 0) currentIndex--;
    updateCarousel();
  }
});

// ================== BOTÃO FINALIZAR MÓDULO ==================
const btnFinalizar = document.querySelectorAll('.btn-finalizar');
const exercisesSection = document.querySelector('.exercises');
const nextBtn = document.querySelector('.next');
const prevBtn = document.querySelector('.prev');

btnFinalizar.forEach(btn => {
  btn.addEventListener('click', () => {
    exercisesSection.style.display = 'block';
    moduleLocked = true;

    nextBtn.style.opacity = '0.4';
    prevBtn.style.opacity = '0.4';
    nextBtn.style.cursor = 'not-allowed';
    prevBtn.style.cursor = 'not-allowed';

    document.querySelectorAll('.thumbnails img').forEach(img => {
      img.style.pointerEvents = 'none';
      img.style.opacity = '0.4';
      img.style.filter = 'blur(1px) grayscale(0.8)';
    });

    document.addEventListener('keydown', lockArrows);

    window.scrollTo({ top: exercisesSection.offsetTop - 20, behavior: 'smooth' });
    startTimer();
    localStorage.removeItem('currentModuleSlide');
  });
});

function lockArrows(e) {
  if (moduleLocked && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
    e.preventDefault();
    e.stopPropagation();
  }
}

// ================== CARROSSEL DE EXERCÍCIOS ==================
const exWrapper = document.querySelector('.exercise-wrapper');
const exSlides = document.querySelectorAll('.exercise-slide');
let exIndex = 0;

function updateExerciseCarousel() {
  exWrapper.style.transform = `translateX(-${exIndex * 100}%)`;
  const percent = ((exIndex + 1) / exSlides.length) * 100;
  document.querySelector('.exercise-progress-fill').style.width = percent + '%';
  const btnSubmit = document.getElementById('submit-exercises');
  btnSubmit.style.display = exIndex === exSlides.length - 1 ? 'block' : 'none';
}

document.querySelector('.next-exercise').addEventListener('click', () => {
  if (exIndex < exSlides.length - 1) exIndex++;
  updateExerciseCarousel();
});

document.querySelector('.prev-exercise').addEventListener('click', () => {
  if (exIndex > 0) exIndex--;
  updateExerciseCarousel();
});

// ================== TIMER ==================
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

    if (totalTime < 0) {
      clearInterval(timerInterval);
      alert('Tempo esgotado! Você precisa refazer o módulo.');
      location.reload();
    }
  }, 1000);
}

// ================== DOWNLOAD ==================
document.getElementById('download-btn').addEventListener('click', () => {
  const link = document.createElement('a');
  link.href = '/src/static/pdf/modulo01.pdf';
  link.download = 'Modulo01_Conteudo.pdf';
  link.click();
});

// ================== MINIATURAS ==================
const thumbnailsContainer = document.querySelector('.thumbnails');
function createThumbnails(slides) {
  thumbnailsContainer.innerHTML = '';
  slides.forEach((slide, idx) => {
    const thumb = document.createElement('img');
    thumb.src = slide.querySelector('img').src;
    if (idx === 0) thumb.classList.add('active');

    thumb.addEventListener('click', () => {
      if (moduleLocked) return;
      currentIndex = idx;
      updateCarousel();
    });

    if (moduleLocked) {
      thumb.style.pointerEvents = 'none';
      thumb.style.opacity = '0.4';
      thumb.style.filter = 'blur(1px) grayscale(0.8)';
    }

    thumbnailsContainer.appendChild(thumb);
  });
}

function updateThumbnails() {
  const thumbs = document.querySelectorAll('.thumbnails img');
  thumbs.forEach((t, i) => t.classList.toggle('active', i === currentIndex));
}

createThumbnails(slidesNormal);

// ================== PROGRESSO ==================
const progressText = document.getElementById('progress-text');
function updateProgressText() {
  const slides = darkMode ? slidesDark : slidesNormal;
  progressText.textContent = `Slide ${currentIndex + 1} de ${slides.length}`;
}

const progressBarContainer = document.createElement('div');
progressBarContainer.classList.add('progress-bar');
const progressBarFill = document.createElement('div');
progressBarFill.classList.add('progress-bar-fill');
progressBarContainer.appendChild(progressBarFill);
document.querySelector('.modules').insertBefore(progressBarContainer, document.querySelector('.modules-carousel'));

function updateProgressBar() {
  const slides = darkMode ? slidesDark : slidesNormal;
  const percent = ((currentIndex + 1) / slides.length) * 100;
  progressBarFill.style.width = `${percent}%`;
}
updateProgressBar();

// ================== DARK MODE ==================
function toggleDarkMode() {
  darkMode = !darkMode;
  document.body.classList.toggle('dark-mode');

  const currentSlides = darkMode ? slidesDark : slidesNormal;
  const previousSlides = darkMode ? slidesNormal : slidesDark;

  previousSlides.forEach(slide => slide.style.display = 'none');
  currentSlides.forEach(slide => slide.style.display = 'flex');

  if (currentIndex >= currentSlides.length) currentIndex = currentSlides.length - 1;

  createThumbnails(currentSlides);
  updateCarousel();
}

const darkModeBtn = document.getElementById('dark-mode-btn');
darkModeBtn.addEventListener('click', toggleDarkMode);
document.addEventListener('keydown', e => {
  if (e.key.toLowerCase() === 'm') toggleDarkMode();
});

// ================== TECLAS DE ATALHO ==================
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') document.querySelector('.next').click();
  if (e.key === 'ArrowLeft') document.querySelector('.prev').click();
  if (e.key.toLowerCase() === 'f') document.getElementById('fullscreen-btn').click();
  if (e.key.toLowerCase() === 'd') document.getElementById('download-btn').click();
});

// ================== CARREGA PROGRESSO AO ABRIR ==================
window.addEventListener('DOMContentLoaded', () => {
  currentIndex = loadModuleProgress(moduleId);
  updateCarousel();
});
