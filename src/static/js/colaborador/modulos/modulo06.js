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

const USUARIO_ID = JSON.parse(sessionStorage.getItem("usuario_colaborador"))?.id;
const TOKEN = sessionStorage.getItem("token_colaborador");
const REQUISITO_APROVACAO = 80;

// ================== CHAVES LOCAIS POR MÓDULO (ANTI-COLA) ==================
const EX_KEY_ANDAMENTO = `mod${moduleId}_ex_andamento`;
const EX_KEY_FINALIZADO = `mod${moduleId}_ex_finalizado`;
const EX_KEY_RESET = `mod${moduleId}_ex_reset`;



// ================== BANCO DE QUESTÕES ==================
const allQuestions = [
    // 1
    {
        enunciado: "Durante um disparo no monitoramento kit anti-arrastão, qual é o critério que determina o acionamento imediato da Polícia Militar?",
        alternativas: {
            a: "Falha de autoteste simultânea com abertura de porta",
            b: "Não confirmação da senha e contrassenha após verificação da câmera",
            c: "Ausência do vigilante na guarita",
            d: "Queda de nergia seguida de tamper"
        },
        correta: "b"
    },
    // 2
    {
        enunciado: "Em um evento de Falha de Autoteste, qual é o procedimento correto após verificar as imagens e identificar possível queda de energia/internet?",
        alternativas: {
            a: "Encerrar o evento imediatamente para evitar duplicidade",
            b: "Acionar a Polícia Militar antes de qualquer contato",
            c: "Aguardar 10 minutos para descartar oscilações",
            d: "Enviar pronta resposta automaticamente"
        },
        correta: "c"
    },
    // 3
    {
        enunciado: "No monitoramento de CFTV, quando uma anormalidade é detectada, qual é a sequência correta de tratativa?",
        alternativas: {
            a: "Contato direto > Supervisor > Cliente",
            b: "Verificação no local > Abertura de OS > Relatório",
            c: "Contato imediato + senha e contrassenha, se negativo, acionar PM",
            d: "Acionamento de supervisor antes da tentativa de contato"
        },
        correta: "c"
    },
    // 4
    {
        enunciado: "Em um monitoramento de alarme com CFTV, quando é necessária vistoria interna, quem pode ser solicitado para acompanhar além da pronta resposta?",
        alternativas: {
            a: "Apenas o supervisor",
            b: "Cliente, policial e síndico",
            c: "Cliente, agente de pronta resposta e Polícia Militar",
            d: "Apenas o cliente e zelador"
        },
        correta: "c"
    },
    // 5
    {
        enunciado: "Sobre o sensor IVP (infravermelho passivo), qual característica reduz falsos disparos?",
        alternativas: {
            a: "Feixe direcionado para varredura horizontal completa",
            b: "Feixe de 90° que capta movimento abaixo de nível de instalação",
            c: "Necessidade de dupla interrupção do feixe",
            d: "Uso exclusivo em áreas externas"
        },
        correta: "b"
    },
    // 6
    {
        enunciado: "O que caracteriza a ronda como recurso de segurança?",
        alternativas: {
            a: "Somente ocorrências geradas por disparos de alarme",
            b: "Verificação ondemand por solicitação do síndico",
            c: "Verificação sem disparo, por necessidade ou evento externo",
            d: "Apenas vistorias programadas pela equipe técnica"
        },
        correta: "c"
    },
    // 7
    {
        enunciado: "Ao detectar desvio de conduta de um colaborador no CFTV, qual é a ação NÃO prevista no POP?",
        alternativas: {
            a: "Contato com o colaborador",
            b: "Geração de relatório no SIGMA",
            c: "Acionamento da Polícia Militar",
            d: "Registro do desvio como ocorrência interna"
        },
        correta: "c"
    },
    // 8
    {
        enunciado: "Em monitoramento de alarme sem CFTV, qual é a cronologia correta de acionamento quando senha/contrassenha nao são confirmadas?",
        alternativas: {
            a: "Cliente > PM > Supervisor",
            b: "Supervisor > Pronta resposta > PM",
            c: "PM > Supervisor > Cliente",
            d: "Supervisor > Cliente > PM"
        },
        correta: "c"
    },
    // 9
    {
        enunciado: "Qual situação não caracteriza um exemplo de sinistro na abertura de porta?",
        alternativas: {
            a: "Porta aberta apenas para recepção de encomendas",
            b: "Pessoas não autorizadas na guarita",
            c: "Zelador permanecendo longos períodos dentro da guarita",
            d: "Supervisor autorizando entrada por telefone"
        },
        correta: "d"
    },
    // 10
    {
        enunciado: "No evento desarme fora do horário, qual é a ação específica exigida?",
        alternativas: {
            a: "Abertura obrigatória de OS",
            b: "Contato com colaborador ou responsável direto",
            c: "Envio de pronta resposta automático",
            d: "Encerramento imediato se o colaborador responder"
        },
        correta: "b"
    },

    //11
    {
        enunciado: "O evento não armado ocorre quando:",
        alternativas: {
            a: "O alarme é desarmado antes do horário programado",
            b: "Há falha na transmissão do teste periódico",
            c: "O alarme não é ativado no horário definido",
            d: "Um sensor permanece inoperante por mais de 10 minutos"
        },
        correta: "c"
    },

    //12
    {
        enunciado: "Sobre disparos de pânico, qual afirmação está correta?",
        alternativas: {
            a: "Em teste, nunca deve haver contato com o condomínio",
            b: "Se negativo (senha/contrassenha), apenas registra no SIGMA",
            c: "Se negativo, é obrigatório enviar pronta resposta + 190",
            d: "Se positivo, acionar supervisor e cliente"
        },
        correta: "c"
    },

    //13
    {
        enunciado: "Em caso de Tamper, qual ação é considerada correta segundo o POP?",
        alternativas: {
            a: "Solicitar que o cliente reinicie a central",
            b: "Aguardar 10 minutos e repetir o teste",
            c: "Envio de técnico ou abertura de OS",
            d: "Apenas contato no local com senha e contrassenha"
        },
        correta: "c"
    },

    //14
    {
        enunciado: "Sobre queda de energia, quando é necessário enviar agente ao local?",
        alternativas: {
            a: "Sempre que for horário noturno",
            b: "Se não houver normalização após acompanhamento",
            c: "Sempre que houver tamper simultâneo",
            d: "Após 10 minutos sem receber imagens da guarita"
        },
        correta: "b"
    },

    //15
    {
        enunciado: "Qula ação é obrigatória em qualquer envio de pronta resposta?",
        alternativas: {
            a: "Geração de relatório manual em papel",
            b: "Registro no SIGMA contendo ordem de deslocamento, chegada e situação",
            c: "Acionamento automático da PM",
            d: "Abertura de OS e registro em planilha paralela"
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
    const progress = JSON.parse(sessionStorage.getItem("moduleProgress") || "{}");
    progress[moduleIdLocal] = lastSlideIndex;
    sessionStorage.setItem("moduleProgress", JSON.stringify(progress));
}

function loadModuleProgress(moduleIdLocal) {
    const progress = JSON.parse(sessionStorage.getItem("moduleProgress") || "{}");
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
    sessionStorage.setItem(EX_KEY_FINALIZADO, "true");
    sessionStorage.removeItem(EX_KEY_ANDAMENTO);
    sessionStorage.removeItem(EX_KEY_RESET);
}

function marcarAndamentoLocal() {
    sessionStorage.setItem(EX_KEY_ANDAMENTO, "true");
    sessionStorage.removeItem(EX_KEY_FINALIZADO);
    sessionStorage.removeItem(EX_KEY_RESET);
}

function marcarResetLocal() {
    sessionStorage.setItem(EX_KEY_RESET, "true");
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
            sessionStorage.removeItem(EX_KEY_ANDAMENTO);
            sessionStorage.removeItem(EX_KEY_RESET);
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
        sessionStorage.removeItem('currentModuleSlide');
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
    const andamento = sessionStorage.getItem(EX_KEY_ANDAMENTO);
    const finalizado = sessionStorage.getItem(EX_KEY_FINALIZADO);

    if (document.hidden && andamento === "true" && finalizado !== "true") {
        // marca para reset quando voltar
        marcarResetLocal();
    }
});

// 2) blur (perda de foco da janela)
window.addEventListener("blur", () => {
    const andamento = sessionStorage.getItem(EX_KEY_ANDAMENTO);
    const finalizado = sessionStorage.getItem(EX_KEY_FINALIZADO);

    if (andamento === "true" && finalizado !== "true") {
        marcarResetLocal();
    }
});

// 3) beforeunload — opcional, para casos de fechar/refresh — marca reset
window.addEventListener("beforeunload", (e) => {
    const andamento = sessionStorage.getItem(EX_KEY_ANDAMENTO);
    const finalizado = sessionStorage.getItem(EX_KEY_FINALIZADO);

    if (andamento === "true" && finalizado !== "true") {
        
        sessionStorage.setItem(EX_KEY_RESET, "true");
    }
});

window.addEventListener("focus", () => {
    const precisaResetar = sessionStorage.getItem(EX_KEY_RESET);

    if (precisaResetar === "true") {
        sessionStorage.removeItem(EX_KEY_RESET);
        sessionStorage.removeItem(EX_KEY_ANDAMENTO);

  
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

