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
    { enunciado: "O monitoramento do leilão é realizado utilizando:", alternativas: { a: "Sistema de rádio interno", b: "Software VMS (Sistema de gerenciamento de vídeo)", c: "Planilha eletrônica", d: "Aplicativo móvel de segurança" }, correta: "b" },
    { enunciado: "O operador no monitoramento do leilão deve atuar de forma:", alternativas: { a: "Rápida e agressiva", b: "Discreta, precisa e responsável", c: "Comunicativa, exposta e organizada", d: "Exclusivamente técnica, sem comunicação" }, correta: "b" },
    { enunciado: "Quem é o contato de checagem?", alternativas: { a: "O gestor administrativo da empresa", b: "O responsável por liberar gravações", c: "A pessoa que verifica atividades suspeitas na unidade", d: "O operador de suporte técnico" }, correta: "c" },
    { enunciado: "Quando o operador deve ligar para o contato de checagem?", alternativas: { a: "Apenas durante o horário comercial", b: "Somente quando solicitado pela gestão", c: "Diante de movimentação suspeita, falha nas câmeras ou abertura fora do horário", d: "Apenas após consultar todos os responsáveis" }, correta: "c" },
    { enunciado: "Os contatos de contigência são acionados quando:", alternativas: { a: "O contato de checagem autoriza", b: "A polícia faz a solicitação", c: "O operador não consegue acessar as imagens", d: "O contato principal não responde" }, correta: "d" },
    { enunciado: "A ordem de acionamento da lista de contingência é:", alternativas: { a: "Polícia Militar > Checagem local > Responsáveis", b: "Responsável 2 > Checagem local > PM", c: "Checagem local > Polícia Militar > Responsável 1 > Responsável 2", d: "Contato de checagem > Responsavel 2 > Polícia > Responsável 1" }, correta: "c" },
    { enunciado: "As áreas trancadas do pátio são utilizadas para:", alternativas: { a: "Armazenar caminhões cegonha", b: "Guardar as motos de maior valor", c: "Abrigo de funcionários", d: "Depósito de documentos" }, correta: "b" },
    { enunciado: "Ao identificar abertura não autorizada de uma área trancada, o operador deve:", alternativas: { a: "Gravar um áudio avisando a equipe", b: "Ignorar e aguardar nova movimentação", c: "Acionar imediatamente o contato de checagem", d: "Aguardar o fechamento automático" }, correta: "c" },
    { enunciado: "Na movimentação diária, o operador deve observar:", alternativas: { a: "Apenas entrada e saída de funcionários", b: "Somente caminhões cegonha", c: "Entrada e saída de veículos, presença de pessoas e operações no pátio", d: "Apenas acesso ao escritório administrativo" }, correta: "c" },
    { enunciado: "Durante a queda das imagens, o operador deve:", alternativas: { a: "Reiniciar o VMS sem informar ninguém", b: "Notificar apenas o cliente", c: "Acionar suporte técnico e informar o gestor imediato", d: "Encerrar o turno até o sistema voltar" }, correta: "c" },
    { enunciado: "Em uma situação em que uma área tranacada é aberta e a imagem da câmera correspondente cai simultaneamente, qual é o procedimento mais adequado segundo o protocolo do módulo?", alternativas: { a: "Registrar a queda e aguardar o restabelecimento automático das imagens para confirmar o motivo da abertura", b: "Acionar imediatamente o contato de checagem, registrar a abertura e somente depois acionar suporte técnico", c: "Primeiro acionar suporte técnico para restaurar a câmera, e só após confirmar se houve atividade suspeita", d: "Acionar diretamente a Polícia Militar, pois abertura com queda de câmera sempre caracteriza violação crítica" }, correta: "b" },
    { enunciado: "Se durante o monitoramento o operador observar movimentação no pátio compatível com atividade autorizada, porém realizada fora do horário permitido e sem contato prévio, qual ação está de acordo com os procedimentos?", alternativas: { a: "Considerar a movimentação normal, pois pode ser atraso operacional da equipe local", b: "Acionar imediatamente o contato de contingência, pulando o contato de checagem por se tratar de atividade fora do horário", c: "Registrar apenas se houver evidência de dano ao patrimônio", d: "Acionar o contato de checagem para confirmar autorização, registrar o evento e aguardar instruções" }, correta: "d" },
    { enunciado: "Durante uma queda parcial das imagens, o operador nota que apenas câmeras que cobrem áreas sensíveis ficaram offline. Qual é a interpretação e conduta mais coerente com os protocolos?", alternativas: { a: "Considerar falha técnica isolada e acionar apenas suporte técnico", b: "Tratar como possível ação direcionada, acionar suporte técnico, informar o gestor imediato e monitorar as demais áreas", c: "Recarregar o VMS e aguardar retorno, se persistir por mais de 10 minutos, registrar como ocorre^ncia menor", d: "Registrar queda geral do sistema, mesmo que somente parte dele esteja offline" }, correta: "b" },
    { enunciado: "Sobre solicitações de gravação, qual situação representa violação direta do protocolo?", alternativas: { a: "Encaminhar a solicitação ao e-mail oficial dos responsáveis antes de resgatar as imagens", b: "Informar ao solicitante não autorizado que o pedido será encaminhado para análise", c: "Enviar as imagens diretamente ao solicitante se ele se identificar como funcionário do pátio, mesmo sem estar na lista", d: "Aguardar a autorização do cliente para iniciar qualquer etapa de resgate" }, correta: "c" },
    { enunciado: "Caso algúem não autorizado solicite gravações, o operador deve:", alternativas: { a: "Enviar apenas trechos curtos como prova", b: "Atender para agilizar o processo", c: "Encaminhar a solicitação para o e-mail dos responsáveis", d: "Repassar o pedido ao contato de checagem" }, correta: "c" }
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


