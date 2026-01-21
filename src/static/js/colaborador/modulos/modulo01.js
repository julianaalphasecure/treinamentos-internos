async function carregarConteudoModulo() {
    const res = await fetch(`/colaborador/modulo/${moduleId}/conteudo`, {
        headers: {
            "Authorization": `Bearer ${TOKEN}`
        }
    });

    if (!res.ok) {
        alert("Erro ao carregar módulo");
        return;
    }

    const data = await res.json();

    // título
    const tituloEl = document.getElementById("tituloModulo");
    if (tituloEl) tituloEl.textContent = data.modulo.titulo;

criarSlides(data.slides);
carregarExercicios(data.exercicios);

}
function criarSlides(slidesAPI) {
    slidesNormalData = [];
    slidesDarkData = [];

    slidesAPI
        .sort((a, b) => a.ordem - b.ordem)
        .forEach(slide => {
            if (!slide.imagem_url) return;

            const modo = (slide.modo || '').toLowerCase().trim();

            if (modo === 'dark') {
                slidesDarkData.push(slide);
            }

            if (modo === 'normal' || modo === '') {
                slidesNormalData.push(slide);
            }
        });

    // segurança extra
    darkMode = false;
    slidesAtuais = slidesNormalData;
    renderSlides();
}

function renderSlides() {
    wrapper.innerHTML = '';

    slidesAtuais.forEach(slide => {
        const slideDiv = document.createElement('div');
        slideDiv.classList.add('modules-slide');

        slideDiv.innerHTML = `
            <img src="${slide.imagem_url}" alt="Slide">
        `;

        wrapper.appendChild(slideDiv);
    });

    currentIndex = 0;
    createThumbnails(slidesAtuais);
    updateCarousel();
}

function detectModuleId() {
   
    const bodyAttr = document.body.getAttribute('data-module-id');
    if (bodyAttr && /^\d+$/.test(bodyAttr)) return Number(bodyAttr);

    
    const url = window.location.href;
    
    let m = url.match(/modul?o[_\-]?0*([1-9]\d?)/i);
    if (m && m[1]) return Number(m[1]);

    const params = new URLSearchParams(window.location.search);
    if (params.get('module')) return Number(params.get('module'));
    if (params.get('id')) return Number(params.get('id'));

    // fallback
    return 1;
}

const moduleId = detectModuleId(); 

// ================== VARIÁVEIS PRINCIPAIS ==================
const prevExerciseBtn = document.querySelector('.prev-exercise');
const nextExerciseBtn = document.querySelector('.next-exercise');


const btnFinalizarConteudo = document.createElement('button');
btnFinalizarConteudo.className = 'btn-finalizar';
btnFinalizarConteudo.textContent = 'Finalizar conteúdo';
btnFinalizarConteudo.style.display = 'none';

// ================== VARIÁVEIS DO CARROSSEL E DO MÓDULO ==================

const wrapper = document.getElementById('slidesContainer');
let currentIndex = 0;
let moduleLocked = false;
let isFullScreen = false;
let darkMode = false;

let slidesAtuais = [];
let slidesNormalData = [];
let slidesDarkData = [];

const USUARIO_ID = JSON.parse(localStorage.getItem("usuario_colaborador"))?.id;
const TOKEN = localStorage.getItem("token_colaborador");
const REQUISITO_APROVACAO = 80;

// ================== CHAVES LOCAIS POR MÓDULO (ANTI-COLA) ==================
const EX_KEY_ANDAMENTO = `mod${moduleId}_ex_andamento`;
const EX_KEY_FINALIZADO = `mod${moduleId}_ex_finalizado`;
const EX_KEY_RESET = `mod${moduleId}_ex_reset`;

const QUESTION_COUNT = 10;
function pickNRandom(arr, n) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, n);
}

let allQuestions = [];

function carregarExercicios(exerciciosAPI) {
    if (!Array.isArray(exerciciosAPI) || exerciciosAPI.length === 0) {
        console.warn("Nenhum exercício encontrado para este módulo");
        return;
    }

    allQuestions = exerciciosAPI.map(ex => ({
        id: ex.id,
        enunciado: ex.enunciado,
        alternativas: {
            a: ex.alternativa_a,
            b: ex.alternativa_b,
            c: ex.alternativa_c,
            d: ex.alternativa_d
        },
        correta: ex.correta
    }));

    renderRandomExercises();
}
function renderRandomExercises() {
    const questions = pickNRandom(allQuestions, QUESTION_COUNT);

    const exWrapper = document.querySelector('.exercise-wrapper');
    exWrapper.innerHTML = '';

    questions.forEach((q, index) => {
        const slide = document.createElement('div');
        slide.className = 'exercise-slide';
        slide.dataset.answer = q.correta;

        slide.innerHTML = `
            <h3>${index + 1}. ${q.enunciado}</h3>
            <div class="options">
                ${['a','b','c','d'].map(letter => `
                    <label for="q${index}_${letter}">
                        <input type="radio"
                               id="q${index}_${letter}"
                               name="q${index}"
                               value="${letter.toUpperCase()}">
                        ${q.alternativas[letter]}
                    </label>
                `).join('')}
            </div>
        `;

        exWrapper.appendChild(slide);
    });

    exSlides = document.querySelectorAll('.exercise-slide');
    exIndex = 0;
    updateExerciseCarousel();
}
// ================== FUNÇÃO ATUALIZA CARROSSEL ==================
function updateCarousel() {
    if (!slidesAtuais.length) return;

    if (currentIndex < 0) currentIndex = 0;
    if (currentIndex >= slidesAtuais.length) {
        currentIndex = slidesAtuais.length - 1;
    }

    wrapper.style.transform = `translateX(-${currentIndex * 100}%)`;

    updateProgressBar();
    updateProgressText();
    updateThumbnails();
    updateArrows();
    saveModuleSlideProgress(moduleId, currentIndex);

    
const slideAtual = document.querySelectorAll('.modules-slide')[currentIndex];

if (currentIndex === slidesAtuais.length - 1 && slideAtual) {
    if (!slideAtual.contains(btnFinalizarConteudo)) {
        slideAtual.appendChild(btnFinalizarConteudo);
    }
    btnFinalizarConteudo.style.display = 'block';
} else {
    btnFinalizarConteudo.style.display = 'none';
}

}

btnFinalizarConteudo.addEventListener('click', async () => {

    // 🔥 BACKEND: marca como em_andamento
    await iniciarModuloAPI(moduleId);

    // 🛡️ FRONT (anti-cola)
    marcarAndamentoLocal();

    moduleLocked = true;
    exercisesSection.style.display = 'block';

    nextBtn.style.opacity = '0.4';
    prevBtn.style.opacity = '0.4';
    nextBtn.style.pointerEvents = 'none';
    prevBtn.style.pointerEvents = 'none';

    document.querySelectorAll('.thumbnails img').forEach(img => {
        img.style.pointerEvents = 'none';
        img.style.opacity = '0.4';
        img.style.filter = 'blur(1px) grayscale(0.8)';
    });

    document.addEventListener('keydown', lockArrows);

    window.scrollTo({
        top: exercisesSection.offsetTop - 20,
        behavior: 'smooth'
    });

    startTimer();
});



function updateArrows() {
    const slides = darkMode ? slidesDarkData : slidesNormalData;


    if (currentIndex === 0) {
        prevBtn.style.opacity = "0.4";
        prevBtn.style.pointerEvents = "none";
        prevBtn.style.cursor = "not-allowed";
    } else {
        prevBtn.style.opacity = "1";
        prevBtn.style.pointerEvents = "auto";
        prevBtn.style.cursor = "pointer";
    }

    if (currentIndex === slides.length - 1) {
        nextBtn.style.opacity = "0.4";
        nextBtn.style.pointerEvents = "none";
        nextBtn.style.cursor = "not-allowed";
    } else {
        nextBtn.style.opacity = "1";
        nextBtn.style.pointerEvents = "auto";
        nextBtn.style.cursor = "pointer";
    }
}
function saveModuleSlideProgress(moduleIdLocal, lastSlideIndex) {
    const progress = JSON.parse(localStorage.getItem("moduleProgress") || "{}");
    progress[moduleIdLocal] = lastSlideIndex;
    localStorage.setItem("moduleProgress", JSON.stringify(progress));
}

function loadModuleProgress(moduleIdLocal) {
    const progress = JSON.parse(localStorage.getItem("moduleProgress") || "{}");
    return progress[moduleIdLocal] || 0;
}

async function iniciarModuloAPI(moduloIdLocal) {
    try {
        await fetch(`/colaborador/progresso/iniciar/${moduloIdLocal}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${TOKEN}`
            }
        });
    } catch (err) {
        console.error("Erro ao iniciar módulo:", err);
    }
}


async function finalizarModuloAPI(moduloIdLocal, notaFinal) {
    try {
        const response = await fetch(`http://127.0.0.1:5000/colaborador/progresso/finalizar/${moduloIdLocal}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${TOKEN}`
            },
            body: JSON.stringify({ nota_final: notaFinal })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: "Erro desconhecido ou falha na comunicação" }));
            throw new Error(`Erro ${response.status} ao finalizar módulo: ${errorData.error || response.statusText}`);
        }

        console.log(`Módulo ${moduloIdLocal} finalizado com nota ${notaFinal}%. Redirecionando...`);
        window.location.href = `/colaborador/modulo/${moduleId}`;




    } catch (error) {
        console.error("Erro na API de finalização:", error);
        alert(`Erro ao registrar conclusão do módulo: ${error.message}`);
    }
}

// ================== CONTROLES DE EXERCÍCIOS (UI) ==================
document.addEventListener('click', (e) => {
    const label = e.target.closest('.options label');
    if (!label) return;

    const options = label.closest('.options');
    if (!options) return;

    // remove seleção do grupo
    options.querySelectorAll('label').forEach(l =>
        l.classList.remove('selected')
    );

    // marca o selecionado
    label.classList.add('selected');

    const radioId = label.getAttribute('for');
    const radio = document.getElementById(radioId);
    if (radio) radio.checked = true;
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
            <button class="btn-submit btn-proximo">Ver Meu Progresso</button> 
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
    overlayCard.classList.remove('pop-in');
}

overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeResultOverlay();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.style.display === 'flex') closeResultOverlay();
});

// ================== HELPERS DO ANTI-COLA ==================
function marcarFinalizadoLocal() {
    localStorage.setItem(EX_KEY_FINALIZADO, "true");
    localStorage.removeItem(EX_KEY_ANDAMENTO);
    localStorage.removeItem(EX_KEY_RESET);
}

function marcarAndamentoLocal() {
    localStorage.setItem(EX_KEY_ANDAMENTO, "true");
    localStorage.removeItem(EX_KEY_FINALIZADO);
    localStorage.removeItem(EX_KEY_RESET);
}

function marcarResetLocal() {
    localStorage.setItem(EX_KEY_RESET, "true");
}

// ================== HANDLER DE ENVIO ==================
document.getElementById('submit-exercises').addEventListener('click', () => {
    clearInterval(timerInterval);

    let score = 0;
    exSlides.forEach(slide => {
        const selected = slide.querySelector('input[type="radio"]:checked');
        if (selected && selected.value === slide.dataset.answer) score++;
    });

    const totalQuestions = exSlides.length;
    const percent = Math.round((score / totalQuestions) * 100);

    // Reset classes e botões
    overlayCard.classList.remove('success', 'fail');
    btnRefazer.style.display = 'none';
    btnProximo.style.display = 'none';

    scoreText.textContent = `Você acertou ${percent}% (${score} de ${totalQuestions})`;

    if (percent >= REQUISITO_APROVACAO) {
        overlayCard.classList.add('success');
        title.textContent = `✅ Parabéns! Módulo concluído com ${percent}%.`;
        btnProximo.style.display = 'inline-block';
        btnProximo.textContent = 'Ver Meu Progresso';

        // MARCA LOCALMENTE COMO FINALIZADO (antes de chamar API)
        btnProximo.onclick = () => {
            marcarFinalizadoLocal();
            closeResultOverlay();
            finalizarModuloAPI(moduleId, percent);
        };

    } else {
        overlayCard.classList.add('fail');
        title.textContent = `❌ Nota insuficiente. Você precisa de ${REQUISITO_APROVACAO}%.`;
        btnRefazer.style.display = 'inline-block';
        btnRefazer.onclick = () => {
            
            localStorage.removeItem(EX_KEY_ANDAMENTO);
            localStorage.removeItem(EX_KEY_RESET);
            closeResultOverlay();
            currentIndex = 0;
            updateCarousel();
            exercisesSection.style.display = 'none';
            moduleLocked = false;
            nextBtn.style.opacity = '1';
            prevBtn.style.opacity = '1';
            nextBtn.style.cursor = 'pointer';
            prevBtn.style.cursor = 'pointer';

            document.querySelectorAll('.thumbnails img').forEach(img => {
                img.style.pointerEvents = 'auto';
                img.style.opacity = '1';
                img.style.filter = 'none';
            });

            document.removeEventListener('keydown', lockArrows);
            exIndex = 0;
            updateExerciseCarousel();
            clearInterval(timerInterval);
            totalTime = 30 * 60;
            document.getElementById('timer').textContent = 'Tempo restante: 30:00';

            document.querySelectorAll('input[type="radio"]:checked').forEach(radio => radio.checked = false);
            document.querySelectorAll('.options label').forEach(label => label.classList.remove('selected'));
        };
    }

    openResultOverlay();
    overlayCard.classList.add('pop-in');
});

// ================== CONTROLES DO CARROSSEL PRINCIPAL ==================
document.querySelector('.next').addEventListener('click', () => {
    if (moduleLocked && !isFullScreen) return;

    if (currentIndex < slidesAtuais.length - 1) {
        currentIndex++;
        updateCarousel();
    }
});

document.querySelector('.prev').addEventListener('click', () => {
    if (moduleLocked && !isFullScreen) return;

    if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
    }
});


// ================== BOTÃO FINALIZAR MÓDULO ==================
const exercisesSection = document.querySelector('.exercises');
const nextBtn = document.querySelector('.next');
const prevBtn = document.querySelector('.prev');



function lockArrows(e) {
    if (moduleLocked && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        e.preventDefault();
        e.stopPropagation();
    }
}

// ================== CARROSSEL DE EXERCÍCIOS ==================
const exWrapper = document.querySelector('.exercise-wrapper');
let exSlides = [];
let exIndex = 0;

function updateExerciseCarousel() {
    exWrapper.style.transform = `translateX(-${exIndex * 100}%)`;

    const percent = ((exIndex + 1) / exSlides.length) * 100;
    document.querySelector('.exercise-progress-fill').style.width = percent + '%';

    const btnSubmit = document.getElementById('submit-exercises');
    btnSubmit.style.display = exIndex === exSlides.length - 1 ? 'block' : 'none';

    updateExerciseArrows();
}

document.querySelector('.next-exercise').addEventListener('click', () => {
    if (exIndex < exSlides.length - 1) {
        exIndex++;
        updateExerciseCarousel();
    }
});

document.querySelector('.prev-exercise').addEventListener('click', () => {
    if (exIndex > 0) {
        exIndex--;
        updateExerciseCarousel();
    }
});


function updateExerciseArrows() {
    const total = exSlides.length;

    if (exIndex === 0) {
        prevExerciseBtn.style.opacity = "0.4";
        prevExerciseBtn.style.pointerEvents = "none";
        prevExerciseBtn.style.cursor = "not-allowed";
    } else {
        prevExerciseBtn.style.opacity = "1";
        prevExerciseBtn.style.pointerEvents = "auto";
        prevExerciseBtn.style.cursor = "pointer";
    }

    if (exIndex === total - 1) {
        nextExerciseBtn.style.opacity = "0.4";
        nextExerciseBtn.style.pointerEvents = "none";
        nextExerciseBtn.style.cursor = "not-allowed";
    } else {
        nextExerciseBtn.style.opacity = "1";
        nextExerciseBtn.style.pointerEvents = "auto";
        nextExerciseBtn.style.cursor = "pointer";
    }
}

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
           window.location.href = `/colaborador/modulo/${moduleId}`;

        }
    }, 1000);
}



// ================== MINIATURAS ==================
const thumbnailsContainer = document.querySelector('.thumbnails');

function createThumbnails(slides) {
    thumbnailsContainer.innerHTML = '';

    slides.forEach((slide, idx) => {
        const thumb = document.createElement('img');
        thumb.src = slide.imagem_url;

        if (idx === currentIndex) thumb.classList.add('active');

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

// ================== PROGRESSO ==================
const progressText = document.getElementById('progress-text');
function updateProgressText() {
    const slides = darkMode ? slidesDarkData : slidesNormalData;
    if (progressText) {
        progressText.textContent = `Slide ${currentIndex + 1} de ${slides.length}`;
    }
}
const progressBarContainer = document.createElement('div');
progressBarContainer.classList.add('progress-bar');
const progressBarFill = document.createElement('div');
progressBarFill.classList.add('progress-bar-fill');
progressBarContainer.appendChild(progressBarFill);
const modulesEl = document.querySelector('.modules');
const modulesCarouselEl = document.querySelector('.modules-carousel');
if (modulesEl && modulesCarouselEl) {
    modulesEl.insertBefore(progressBarContainer, modulesCarouselEl);
}

function updateProgressBar() {
    const slides = darkMode ? slidesDarkData : slidesNormalData;
    const percent = ((currentIndex + 1) / slides.length) * 100;
    progressBarFill.style.width = `${percent}%`;
}

updateProgressBar();

// ================== DARK MODE ==================
function toggleDarkMode() {
    const destino = darkMode ? slidesNormalData : slidesDarkData;

    if (!destino.length) {
        alert("Este módulo não possui slides neste modo.");
        return;
    }

    darkMode = !darkMode;
    document.body.classList.toggle('dark-mode', darkMode);

    slidesAtuais = destino;
    currentIndex = 0;
    renderSlides();
}

const darkModeBtn = document.getElementById('dark-mode-btn');
if (darkModeBtn) {
    darkModeBtn.addEventListener('click', toggleDarkMode);
}
document.addEventListener('keydown', e => {
    if (e.key.toLowerCase() === 'm') toggleDarkMode();
});

// ================== TECLAS DE ATALHO ==================
document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') document.querySelector('.next').click();
    if (e.key === 'ArrowLeft') document.querySelector('.prev').click();
    if (e.key.toLowerCase() === 'f') {
        const fsBtn = document.getElementById('fullscreen-btn');
        if (fsBtn) fsBtn.click();
    }
 
});

window.addEventListener('DOMContentLoaded', async () => {
    await carregarConteudoModulo();
    updateExerciseCarousel();
});


// ================== ANTI-COLA: DETECTA SAÍDA E VOLTA ==================

// 1) visibilitychange (trocar de aba / minimizar em alguns navegadores)
document.addEventListener("visibilitychange", () => {
    const andamento = localStorage.getItem(EX_KEY_ANDAMENTO);
    const finalizado = localStorage.getItem(EX_KEY_FINALIZADO);

    if (document.hidden && andamento === "true" && finalizado !== "true") {
        // marca para reset quando voltar
        marcarResetLocal();
    }
});

// 2) blur (perda de foco da janela)
window.addEventListener("blur", () => {
    const andamento = localStorage.getItem(EX_KEY_ANDAMENTO);
    const finalizado = localStorage.getItem(EX_KEY_FINALIZADO);

    if (andamento === "true" && finalizado !== "true") {
        marcarResetLocal();
    }
});

// 3) beforeunload — opcional, para casos de fechar/refresh — marca reset
window.addEventListener("beforeunload", (e) => {
    const andamento = localStorage.getItem(EX_KEY_ANDAMENTO);
    const finalizado = localStorage.getItem(EX_KEY_FINALIZADO);

    if (andamento === "true" && finalizado !== "true") {
        
        localStorage.setItem(EX_KEY_RESET, "true");
    }
});

window.addEventListener("focus", () => {
    const precisaResetar = localStorage.getItem(EX_KEY_RESET);

    if (precisaResetar === "true") {
        localStorage.removeItem(EX_KEY_RESET);
        localStorage.removeItem(EX_KEY_ANDAMENTO);

  
        exIndex = 0;
        updateExerciseCarousel();

        document.querySelectorAll('input[type="radio"]:checked')
            .forEach(radio => (radio.checked = false));

        document.querySelectorAll('.options label')
            .forEach(label => label.classList.remove('selected'));

    
        try {
            alert("Você saiu da tela durante o exercício. O exercício foi reiniciado.");
        } catch (err) {
            console.log("Voltou e reiniciou módulo (alert falhou).");
        }

        location.reload();
    }
});


