function detectModuleId() {
    const bodyAttr = document.body.getAttribute('data-module-id');
    if (bodyAttr && /^\d+$/.test(bodyAttr)) return Number(bodyAttr);

    const url = window.location.href;
    let m = url.match(/modul?o[_\-]?0*([1-9]\d?)/i);
    if (m && m[1]) return Number(m[1]);

    const params = new URLSearchParams(window.location.search);
    if (params.get('module')) return Number(params.get('module'));
    if (params.get('id')) return Number(params.get('id'));

    return 1;
}
const moduleId = detectModuleId();

// ================== VARIÁVEIS PRINCIPAIS ==================
const prevExerciseBtn = document.querySelector('.prev-exercise');
const nextExerciseBtn = document.querySelector('.next-exercise');

// ================== VARIÁVEIS DO CARROSSEL E DO MÓDULO ==================
let slidesNormal = document.querySelectorAll('.modules-slide:not(.dark-slide)');
let slidesDark = document.querySelectorAll('.dark-slide');
const wrapper = document.querySelector('.modules-wrapper');
let currentIndex = 0;
let moduleLocked = false;
let isFullScreen = false;
let darkMode = false;
const totalSlides = slidesNormal.length;

const USUARIO_ID = JSON.parse(localStorage.getItem("usuario_colaborador"))?.id;
const TOKEN = localStorage.getItem("token_colaborador");
const REQUISITO_APROVACAO = 80;

// ================== CHAVES LOCAIS POR MÓDULO (ANTI-COLA) ==================
const EX_KEY_ANDAMENTO = `mod${moduleId}_ex_andamento`;
const EX_KEY_FINALIZADO = `mod${moduleId}_ex_finalizado`;
const EX_KEY_RESET = `mod${moduleId}_ex_reset`;

// ================== FUNÇÕES DE CARROSSEL (slides) ==================
function updateCarousel() {
    if (!wrapper) return;
    wrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
    updateProgressBar();
    updateThumbnails();
    updateProgressText();
    updateArrows();
    saveModuleSlideProgress(moduleId, currentIndex);
}

// ================== CHECAGEM DE PRIMEIRA TENTATIVA ==================
const FINALIZADO_KEY = `mod${moduleId}_first_finalizado`;
const primeiraTentativa = !localStorage.getItem(FINALIZADO_KEY);

if (primeiraTentativa) {
    localStorage.setItem(FINALIZADO_KEY, "true");
    marcarFinalizadoLocal();

    setTimeout(() => {
        finalizarModuloAPI(moduleId, 100);
    }, 500); 
}


function updateArrows() {
    const slides = darkMode ? slidesDark : slidesNormal;
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    if (!prevBtn || !nextBtn) return;

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

// ================== SALVAR / CARREGAR PROGRESSO ==================
function saveModuleSlideProgress(moduleIdLocal, lastSlideIndex) {
    const progress = JSON.parse(localStorage.getItem("moduleProgress") || "{}");
    progress[moduleIdLocal] = lastSlideIndex;
    localStorage.setItem("moduleProgress", JSON.stringify(progress));
}

function loadModuleProgress(moduleIdLocal) {
    const progress = JSON.parse(localStorage.getItem("moduleProgress") || "{}");
    return progress[moduleIdLocal] || 0;
}

// ================== API FINALIZAR ==================
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
        setTimeout(() => {
            window.location.href = '/src/templates/colaborador/modulo.html';
        }, 1500);

    } catch (error) {
        console.error("Erro na API de finalização:", error);
        alert(`Erro ao registrar conclusão do módulo: ${error.message}`);
    }
}

// ================== CONTROLES DE EXERCÍCIOS (LABEL CLICK) ==================
document.addEventListener('click', (ev) => {
    const label = ev.target.closest('.options label');
    if (!label) return;
    const group = label.parentElement.querySelectorAll('label');
    group.forEach(l => l.classList.remove('selected'));
    label.classList.add('selected');
    const radio = document.getElementById(label.getAttribute('for'));
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


const allQuestions = [
    // 1
    {
        enunciado: "Sobre o fluxo de atendimento, qual é a ordem correta de tentativas de contato com o morador?",
        alternativas: {
            a: "WhatsApp > Telefone > Interfone",
            b: "Telefone > WhatsApp > Interfone",
            c: "Interfone > Telefone > WhatsApp",
            d: "Interfone > WhatsApp > Telefone"
        },
        correta: "c"
    },
    // 2
    {
        enunciado: "Em condomínio residencial, quando a entrada é solicitada via interfone, qual é o procedimento obrigatório?",
        alternativas: {
            a: "Confirmar nome completo + número do apartamento para validação no sistema",
            b: "Solicitar apenas o primeiro nome e liberar",
            c: "Perguntar somente o número do apartamento",
            d: "Solicitar documento antes de qualquer contato"
        },
        correta: "a"
    },
    // 3
    {
        enunciado: "Em situação de sáida de moradores, a liberação deve ser imediata, exceto em qual caso?",
        alternativas: {
            a: "Prestadores de serviço acompanhando moradores",
            b: "Crianças desacompanhadas",
            c: "Visitantes cadastrados previamente",
            d: "Funcionários domésticos durante horário permitido"
        },
        correta: "b"
    },
    // 4
    {
        enunciado: "Em qual cenário funcionários domésticos devem ter liberação parcial até a clausura antes do aviso ao morador?",
        alternativas: {
            a: "Liberação direta",
            b: "Liberação em dias/horários específicos",
            c: "Liberação com aviso",
            d: "Sem liberação"
        },
        correta: "c"
    },
    // 5
    {
        enunciado: "Sobre entregadores, qual afirmação está correta de acordo com o POP?",
        alternativas: {
            a: "Todos os entregadores podem subir sem autorização se apresentarem documento",
            b: "Entregadores de grande porte devem seguir pela garagem com liberaçao do síndico",
            c: "Pequeno porte deve ser direcionado ao passa-volumes sempre, sem contato com morador",
            d: "Entregadores de grande porte só entram se o morador liberar e acompanhar"
        },
        correta: "d"
    },
    // 6
    {
        enunciado: "Para prestadores de serviço do condomínio, qual é o procedimento correto?",
        alternativas: {
            a: "Liberação imediata com registro de documento",
            b: "Liberação apenas com autorização do morador",
            c: "Consulta ao síndico/zelador e acompanhamento do serviço até o fim",
            d: "Autorização obrigatória pelo sistema Situator"
        },
        correta: "c"
    },
    // 7
    {
        enunciado: "Em condomínio comercial, qual falha exige abertura de OS. SOmente se o equipamento tiver sido adquirido com a Alpha e estiver na garantia?",
        alternativas: {
            a: "Queda de energia",
            b: "Falha na biometria",
            c: "Queda de internet",
            d: "Interfone sem sinal"
        },
        correta: "b"
    },
    // 8
    {
        enunciado: "No atendimento a visitantes em condomínio comercial, quando o visitante é barrado?",
        alternativas: {
            a: "Sempre que não estiver pré-cadastrado",
            b: "Quando o responsável não atender após 3 tentativas",
            c: "Após tentativas frustada de contato + ausência de autorização",
            d: "Quando não apresnetar documento oficial"
        },
        correta: "c"
    },
    // 9
    {
        enunciado: "Qual sistema deve ser consultadp na aba 'anotações' para regras internas de cada condomínio?",
        alternativas: {
            a: "Situator",
            b: "Unis",
            c: "My Village",
            d: "Sigma"
        },
        correta: "c"
    },
    // 10
    {
        enunciado: "Em contingência, quando há queda total do sistema, qual é o procedimento após acionar TI?",
        alternativas: {
            a: "Acionar polícia e notificar moradores",
            b: "Acionar síndico e solicitar porteiro físico imediatamente",
            c: "Se necessário, deslocamento físico até a central",
            d: "Encerrar ocorrências até normalização"
        },
        correta: "c"
    },

    //11
    {
        enunciado: "Em caso de disparo de coação com presença de terceiros ou suspeito, qual deve ser a ação?",
        alternativas: {
            a: "Contatar o morador imediatamente",
            b: "Tentar confirmação via WhatsApp",
            c: "Não fazer contato: acionar pronta resposta + polícia",
            d: "Apenas verificar no CFTV e aguardar nova imagem"
        },
        correta: "c"
    },

    //12
    {
        enunciado: "Sobre reclamações de barulho, qual situação exige acionar a polícia + síndico?",
        alternativas: {
            a: "Barulho alto",
            b: "Festa fora do horário permitido",
            c: "Barulho suspeito interpretador como pedido de socorro",
            d: "Reclamação anônima de condômino"
        },
        correta: "c"
    },

    //13
    {
        enunciado: "No disparo de alarme se sensor, quando o evento deve ser encerrado sem acionar forças externas?",
        alternativas: {
            a: "Quando há pessoas no local, mas sem autorização",
            b: "Sempre que não houver anomalias no CFTV",
            c: "Quando o sensor dispara suas vezes seguidas",
            d: "Quando o síndico não atender"
        },
        correta: "b"
    },

    //14
    {
        enunciado: "Sobre falha de comunicação via GPRS, qual condição permite o encerramento do evento?",
        alternativas: {
            a: "Quando o sensor está em manutenção",
            b: "Quando a última comunicação foi posterior ao horário do evento",
            c: "Quando existe queda de energia relatada pelo morador",
            d: "Sempre que o sistema reiniciar sozinho"
        },
        correta: "b"
    },

    //15
    {
        enunciado: "Qual ação é exigida ao operador quando a porta corte-fogo aparece aberta no CFTV sem evidência de incêndio?",
        alternativas: {
            a: "Acionar bombeiros imediatamente",
            b: "Registrar ocorrência no SIGMA e liberar",
            c: "Acionar o zelador e solicitar fechamento da porta",
            d: "Acionar a PM para vistoria"
        },
        correta: "c"
    }
];

function pickNRandom(arr, n) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, n);
}

const QUESTION_COUNT = 10; 

function renderRandomExercises() {
    const exWrapper = document.querySelector('.exercise-wrapper');
    if (!exWrapper) return;

    const selected = pickNRandom(allQuestions, Math.min(QUESTION_COUNT, allQuestions.length));

    exWrapper.innerHTML = '';

    selected.forEach((q, i) => {
        const div = document.createElement('div');
        div.classList.add('exercise-slide');
        div.setAttribute('data-answer', q.correta);

        const name = `q${i}_${Date.now()}`;

        div.innerHTML = `
            <p><strong>${i + 1}.</strong> ${q.enunciado}</p>
            <div class="options">
                <input type="radio" id="${name}a" name="${name}" value="a">
                <label for="${name}a">${q.alternativas.a}</label>

                <input type="radio" id="${name}b" name="${name}" value="b">
                <label for="${name}b">${q.alternativas.b}</label>

                <input type="radio" id="${name}c" name="${name}" value="c">
                <label for="${name}c">${q.alternativas.c}</label>

                <input type="radio" id="${name}d" name="${name}" value="d">
                <label for="${name}d">${q.alternativas.d}</label>
            </div>
        `;

        exWrapper.appendChild(div);
    });
}
renderRandomExercises();

// ================== CARROSSEL DE EXERCÍCIOS (após render) ==================
const exWrapper = document.querySelector('.exercise-wrapper');
let exSlides = document.querySelectorAll('.exercise-slide');
let exIndex = 0;

function updateExerciseCarousel() {
    if (!exWrapper) return;
    exWrapper.style.transform = `translateX(-${exIndex * 100}%)`;

    const percent = ((exIndex + 1) / exSlides.length) * 100;
    const fill = document.querySelector('.exercise-progress-fill');
    if (fill) fill.style.width = percent + '%';

    const btnSubmit = document.getElementById('submit-exercises');
    if (btnSubmit) btnSubmit.style.display = exIndex === exSlides.length - 1 ? 'block' : 'none';

    updateExerciseArrows();
}

const nextExBtnEl = document.querySelector('.next-exercise');
const prevExBtnEl = document.querySelector('.prev-exercise');

if (nextExBtnEl) {
    nextExBtnEl.addEventListener('click', () => {
        if (exIndex < exSlides.length - 1) exIndex++;
        updateExerciseCarousel();
    });
}
if (prevExBtnEl) {
    prevExBtnEl.addEventListener('click', () => {
        if (exIndex > 0) exIndex--;
        updateExerciseCarousel();
    });
}

function updateExerciseArrows() {
    const total = exSlides.length;
    if (!prevExerciseBtn || !nextExerciseBtn) return;

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

const submitBtn = document.getElementById('submit-exercises');
if (submitBtn) {
    submitBtn.addEventListener('click', () => {
        clearInterval(timerInterval);

        exSlides = document.querySelectorAll('.exercise-slide');

        let score = 0;
        exSlides.forEach(slide => {
            const selected = slide.querySelector('input[type="radio"]:checked');
            if (selected && selected.value === slide.dataset.answer) score++;
        });

        const totalQuestions = exSlides.length;
        const percent = Math.round((score / totalQuestions) * 100);

        overlayCard.classList.remove('success', 'fail');
        btnRefazer.style.display = 'none';
        btnProximo.style.display = 'none';

        scoreText.textContent = `Você acertou ${percent}% (${score} de ${totalQuestions})`;

        if (percent >= REQUISITO_APROVACAO) {
            overlayCard.classList.add('success');
            title.textContent = `✅ Parabéns! Módulo concluído com ${percent}%.`;
            btnProximo.style.display = 'inline-block';
            btnProximo.textContent = 'Ver Meu Progresso';

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
    // Fecha overlay
    closeResultOverlay();

    // Reinicia o carrossel principal (slides de conteúdo)
    currentIndex = 0;
    updateCarousel();

    // Habilita navegação dos slides principais
    moduleLocked = false;
    const nextBtn = document.querySelector('.next');
    const prevBtn = document.querySelector('.prev');
    if (nextBtn) { 
        nextBtn.style.opacity = '1'; 
        nextBtn.style.pointerEvents = 'auto'; 
        nextBtn.style.cursor = 'pointer'; 
    }
    if (prevBtn) { 
        prevBtn.style.opacity = '1'; 
        prevBtn.style.pointerEvents = 'auto'; 
        prevBtn.style.cursor = 'pointer'; 
    }

    // Reabilita miniaturas do carrossel principal
    document.querySelectorAll('.thumbnails img').forEach(img => {
        img.style.pointerEvents = 'auto';
        img.style.opacity = '1';
        img.style.filter = 'none';
    });

    document.removeEventListener('keydown', lockArrows);

    if (exercisesSection) exercisesSection.style.display = 'none';

    exIndex = 0;
    document.querySelectorAll('input[type="radio"]:checked').forEach(radio => radio.checked = false);
    document.querySelectorAll('.options label').forEach(label => label.classList.remove('selected'));
};

        }

        openResultOverlay();
        overlayCard.classList.add('pop-in');
    });
}

// ================== CONTROLES DO CARROSSEL PRINCIPAL ==================
const nextMain = document.querySelector('.next');
const prevMain = document.querySelector('.prev');

if (nextMain) nextMain.addEventListener('click', () => {
    const slides = darkMode ? slidesDark : slidesNormal;
    if (!moduleLocked || isFullScreen) {
        if (currentIndex < slides.length - 1) currentIndex++;
        updateCarousel();
    }
});
if (prevMain) prevMain.addEventListener('click', () => {
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
        marcarAndamentoLocal();

        if (exercisesSection) exercisesSection.style.display = 'block';
        moduleLocked = true;

        if (nextBtn) { nextBtn.style.opacity = '0.4'; nextBtn.style.cursor = 'not-allowed'; }
        if (prevBtn) { prevBtn.style.opacity = '0.4'; prevBtn.style.cursor = 'not-allowed'; }

        document.querySelectorAll('.thumbnails img').forEach(img => {
            img.style.pointerEvents = 'none';
            img.style.opacity = '0.4';
            img.style.filter = 'blur(1px) grayscale(0.8)';
        });

        document.addEventListener('keydown', lockArrows);

        if (exercisesSection) window.scrollTo({ top: exercisesSection.offsetTop - 20, behavior: 'smooth' });
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
        if (timerDisplay) timerDisplay.textContent = `Tempo restante: ${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
        totalTime--;

        if (totalTime < 0) {
            clearInterval(timerInterval);
            alert('Tempo esgotado! Você precisa refazer o módulo.');
            location.reload();
        }
    }, 1000);
}

// ================== DOWNLOAD ==================
const downloadBtn = document.getElementById('download-btn');
if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = `/src/static/pdf/modulo${String(moduleId).padStart(2,'0')}.pdf`;
        link.download = `Modulo${String(moduleId).padStart(2,'0')}_Conteudo.pdf`;
        link.click();
    });
}

// ================== MINIATURAS ==================
const thumbnailsContainer = document.querySelector('.thumbnails');
function createThumbnails(slides) {
    if (!thumbnailsContainer) return;
    thumbnailsContainer.innerHTML = '';
    slides.forEach((slide, idx) => {
        const thumb = document.createElement('img');
        const imgEl = slide.querySelector('img');
        thumb.src = imgEl ? imgEl.src : '';
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

createThumbnails(Array.from(slidesNormal));

// ================== PROGRESSO (main slides) ==================
const progressText = document.getElementById('progress-text');
function updateProgressText() {
    const slides = darkMode ? slidesDark : slidesNormal;
    if (progressText) progressText.textContent = `Slide ${currentIndex + 1} de ${slides.length}`;
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
    const slides = darkMode ? slidesDark : slidesNormal;
    const percent = ((currentIndex + 1) / slides.length) * 100;
    if (progressBarFill) progressBarFill.style.width = `${percent}%`;
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

    createThumbnails(Array.from(currentSlides));
    updateCarousel();
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
    if (e.key === 'ArrowRight') {
        const nextEl = document.querySelector('.next');
        if (nextEl) nextEl.click();
    }
    if (e.key === 'ArrowLeft') {
        const prevEl = document.querySelector('.prev');
        if (prevEl) prevEl.click();
    }
    if (e.key.toLowerCase() === 'f') {
        const fsBtn = document.getElementById('fullscreen-btn');
        if (fsBtn) fsBtn.click();
    }
    if (e.key.toLowerCase() === 'd') {
        const dlBtn = document.getElementById('download-btn');
        if (dlBtn) dlBtn.click();
    }
});

// ================== CARREGA PROGRESSO AO ABRIR ==================
window.addEventListener('DOMContentLoaded', () => {
    currentIndex = loadModuleProgress(moduleId);
    updateCarousel();
    // re-query slides in case render changed
    exSlides = document.querySelectorAll('.exercise-slide');
    updateExerciseCarousel();
});

// ================== ANTI-COLA: DETECTA SAÍDA E VOLTA ==================
// 1) visibilitychange
document.addEventListener("visibilitychange", () => {
    const andamento = localStorage.getItem(EX_KEY_ANDAMENTO);
    const finalizado = localStorage.getItem(EX_KEY_FINALIZADO);

    if (document.hidden && andamento === "true" && finalizado !== "true") {
        marcarResetLocal();
    }
});

// 2) blur
window.addEventListener("blur", () => {
    const andamento = localStorage.getItem(EX_KEY_ANDAMENTO);
    const finalizado = localStorage.getItem(EX_KEY_FINALIZADO);

    if (andamento === "true" && finalizado !== "true") {
        marcarResetLocal();
    }
});

// 3) beforeunload
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
        exSlides = document.querySelectorAll('.exercise-slide');
        updateExerciseCarousel();

        document.querySelectorAll('input[type="radio"]:checked')
            .forEach(radio => (radio.checked = false));

        document.querySelectorAll('.options label')
            .forEach(label => label.classList.remove('selected'));

        try {
            alert("Você saiu da tela durante o exercício, refaça novamente!");
        } catch (err) {
            console.log("Voltou e reiniciou módulo (alert falhou).");
        }

        location.reload();
    }
});

