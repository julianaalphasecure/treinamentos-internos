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

const moduleId = detectModuleId(); // agora definido dinamicamente

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



// ================== BANCO DE QUESTÕES ==================
const allQuestions = [
    // 1
    {
        enunciado: "O evento teste de reporte periódico indica que:",
        alternativas: {
            a: "A central falhou em enviar o sinal e requer ação imediata do operador",
            b: "O sistema está comunicando corretamente e não requer intervenção do operador",
            c: "O operador deve validar manualmente o funcionamento do alarme",
            d: "O sistema está passando por oscilação e deve ser reiniciado"
        },
        correta: "b"
    },
    // 2
    {
        enunciado: "A falha de auto teste ocorre quando:",
        alternativas: {
            a: "O operador não confirma o teste dentro do tempo limite",
            b: "O sistema detecta movimentação suspeita sem alarme ativo",
            c: "O teste periódico esperado não foi recebido pela central de alarme",
            d: "O usuário tenta armar o alarme sem autorização"
        },
        correta: "c"
    },
    // 3
    {
        enunciado: " Sobre o tempo de espera de 5 minutos na falha de comunicação, o objetivo é:",
        alternativas: {
            a: "Dar tempo para a viatura chegar ao local",
            b: "Evitar deslocamentos desnecessários por oscilações momentâneas",
            c: "Permitir que o operador compare o evento com o histórico da unidade",
            d: "Aguardar atualização automática do status do usuário"
        },
        correta: "b"
    },
    // 4
    {
        enunciado: "Após uma falha de comunicação, o operador deve acessar o sistema GPRS para verificar:",
        alternativas: {
            a: "Se os sensores internos foram disparados",
            b: "Se o horário da última comunicação é coerente com o horário do evento",
            c: "Se o usuário responsável está habilitado para armar a loja",
            d: "Se o botão de pânico está ativo no sistema"
        },
        correta: "b"
    },
    // 5
    {
        enunciado: "Se o horário da última comunicação no GPRS for inferior ao do evento, o operador deve:",
        alternativas: {
            a: "Encerrar o evento automaticamente",
            b: "Encaminhar imediatamente uma viatura",
            c: "Acessar o CFTV para confirmar o status da unidade",
            d: "Desconsiderar o evento e aguardar novo teste"
        },
        correta: "c"
    },
    // 6
    {
        enunciado: "O evento armado pelo usuário exige:",
        alternativas: {
            a: "Acionamento de viatura para confirmar a integridade externa",
            b: "Ligação para validar se o usuário estava autorizado",
            c: "Fechamento automático, sem tratativa manual",
            d: "Acesso imediato ao CFTV"
        },
        correta: "c"
    },
    // 7
    {
        enunciado: "No evento desarmado pelo usuário, o operador deve:",
        alternativas: {
            a: "Confirmar a identidade do usuário por telefone",
            b: "Verificar se o desarme ocorreu no horário programado",
            c: "Encerrar automaticamente, sem intervenção manual",
            d: "Aguardar um novo evento antes de agir"
        },
        correta: "c"
    },
    // 8
    {
        enunciado: "Em disparos de alarme com a unidade aberta ou setor 24h, o operador deve:",
        alternativas: {
            a: "Encaminhar viatura imediatamente",
            b: "Ligar para o local e realizar senha/contrassenha",
            c: "Acessar CFTV apenas se houver falha de comunicação",
            d: "Notificar diretamente a chefia antes de qualquer ação"
        },
        correta: "b"
    },
    // 9
    {
        enunciado: "Em unidade fechada com CFTV online, ao ocorrer um disparo o operador deve:",
        alternativas: {
            a: "Realizar senha/contrassenha",
            b: "Encaminhar viatura automaticamente",
            c: "Verificar as câmeras e confirmar ausência de problemas",
            d: "Notificar a chefia antes de tomar qualquer decisão"
        },
        correta: "c"
    },
    // 10
    {
        enunciado: "Em unidade fechada com CFTV off-line durante disparo, o operador deve:",
        alternativas: {
            a: "Solicitar ao cliente que reative manualmente o sistema",
            b: "Deslocar viatura imediatamente para o local",
            c: "Aguardar reconexão do sistema antes de agir",
            d: "Ligar para validar a identidade do usuário"
        },
        correta: "b"
    },

    //11
    {
        enunciado: "Sobre disparo de pânico, qual afirmação é correta?",
        alternativas: {
            a: "Pode ocorrer com a unidade aberta ou fechada, sem distinção",
            b: "Em caso de resposta suspeita na ligação, aciona-se apenas a viatura",
            c: "Se acionado com a loja fechada, trata-se de falha técnica",
            d: "A etapa de acesso ao CFTV é opcional"
        },
        correta: "c"
    },

    //12
    {
        enunciado: "Ao receber um disparo de pânico com resposta suspeita no procedimento de senha, o operador deve:",
        alternativas: {
            a: "Encerrar o evento aguardando retorno da loja",
            b: "Acionar viatura e o 190 imediatamente",
            c: "Enviar e-mail ao cliente informando a inconsistência",
            d: "Considerar como disparo falso e registrar"
        },
        correta: "b"
    },

    //13
    {
        enunciado: "O evento “Não Armado” exige que o operador:",
        alternativas: {
            a: "Envie viatura para confirmar o motivo do não armamento",
            b: "Registre apenas se houver movimentação suspeita no CFTV",
            c: "Ligue para o local e registre o horário informado para ativação",
            d: "Aguarde o próximo ciclo de ativação antes de intervir"
        },
        correta: "c"
    },

    //14
    {
        enunciado: "O evento “Desarme fora do horário” indica:",
        alternativas: {
            a: "Problema técnico no painel da central",
            b: "Falha de comunicação entre usuário e sistema",
            c: "Que o alarme foi desativado em horário não previsto",
            d: "Que a loja não armou o sistema corretamente"
        },
        correta: "c"
    },

    //15
    {
        enunciado: "Em caso de desarme fora do horário sem contato com o local ou com contrassenha errada, o procedimento correto é:",
        alternativas: {
            a: "Aguardar 5 minutos e tentar novo contato",
            b: "Encaminhar viatura para verificação",
            c: "Ajustar o horário de ativação manualmente no sistema",
            d: "Registrar e encerrar o evento"
        },
        correta: "b"
    }
];

const QUESTION_COUNT = 10;
function pickNRandom(arr, n) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, n);
}

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
                <input type="radio" id="${name}a" name="${name}" value="a"><label for="${name}a">${q.alternativas.a}</label>
                <input type="radio" id="${name}b" name="${name}" value="b"><label for="${name}b">${q.alternativas.b}</label>
                <input type="radio" id="${name}c" name="${name}" value="c"><label for="${name}c">${q.alternativas.c}</label>
                <input type="radio" id="${name}d" name="${name}" value="d"><label for="${name}d">${q.alternativas.d}</label>
            </div>`;
        exWrapper.appendChild(div);
    });
}
renderRandomExercises();


// ================== FUNÇÃO ATUALIZA CARROSSEL ==================
function updateCarousel() {
    wrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
    updateProgressBar();
    updateThumbnails();
    updateProgressText();
    updateArrows();
    saveModuleSlideProgress(moduleId, currentIndex);
}

function updateArrows() {
    const slides = darkMode ? slidesDark : slidesNormal;

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

// ================== CONTROLES DE EXERCÍCIOS (UI) ==================
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
            // REGISTRA A TENTATIVA NO BACKEND
            finalizarModuloAPI(moduleId, 0); // Envia nota 0 para contar tentativa

            // Limpa o estado local do exercício atual (usuário vai refazer)
            localStorage.removeItem(EX_KEY_ANDAMENTO);
            localStorage.removeItem(EX_KEY_RESET);
            // NÃO removemos EX_KEY_FINALIZADO aqui pois não estava finalizado

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
        // marca que o usuário iniciou o exercício (ANTI-COLA)
        marcarAndamentoLocal();

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

    updateExerciseArrows();
}

document.querySelector('.next-exercise').addEventListener('click', () => {
    if (exIndex < exSlides.length - 1) exIndex++;
    updateExerciseCarousel();
});

document.querySelector('.prev-exercise').addEventListener('click', () => {
    if (exIndex > 0) exIndex--;
    updateExerciseCarousel();
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
            location.reload();
        }
    }, 1000);
}

// ================== DOWNLOAD ==================
document.getElementById('download-btn').addEventListener('click', () => {
    // Se ainda não finalizou, marcar reset quando perder foco/abrir PDF
    // (marcação já é feita por visibilitychange/blur)
    const link = document.createElement('a');
    link.href = `/src/static/pdf/modulo${String(moduleId).padStart(2,'0')}.pdf`;
    link.download = `Modulo${String(moduleId).padStart(2,'0')}_Conteudo.pdf`;
    link.click();
});

// ================== MINIATURAS ==================
const thumbnailsContainer = document.querySelector('.thumbnails');
function createThumbnails(slides) {
    thumbnailsContainer.innerHTML = '';
    slides.forEach((slide, idx) => {
        const thumb = document.createElement('img');
        // proteja caso slide não tenha img
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

createThumbnails(slidesNormal);

// ================== PROGRESSO ==================
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

    createThumbnails(currentSlides);
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
    if (e.key === 'ArrowRight') document.querySelector('.next').click();
    if (e.key === 'ArrowLeft') document.querySelector('.prev').click();
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


