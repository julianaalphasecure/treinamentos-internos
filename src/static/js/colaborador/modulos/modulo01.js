// ================== INÍCIO - modulo01.js completo ==================

// ------------------- DETECÇÃO AUTOMÁTICA DO moduleId -------------------
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
    // Delegation: se clicou em label dentro de .options
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
        enunciado: "Durante uma inspeção noturna, um alarme dispara, mas a câmera principal está sem visibilidade e as câmeras secundárias também não mostram nada. Qual é a conduta correta do operador?",
        alternativas: {
            a: "Silenciar o alarme e registrar como falso disparo no final do turno",
            b: "Registrar como 'sem visibilidade', solicitar imagens de outras câmeras e, se nada for identificado, encerrar com justificativa",
            c: "Acionar imediatamente a Polícia Militar por precaução",
            d: "Ignorar o alarme, pois nenhuma evidência foi capturada"
        },
        correta: "b"
    },
    // 2
    {
        enunciado: "Se um sinistro é confirmado, mas o operador não consegue contato imediato com o supervisor plantonista, qual é a ação correta?",
        alternativas: {
            a: "Registrar o evento e aguardar o supervisor retornar",
            b: "Acionar o CCO do cliente com todos os detalhes, enquanto tenta contato com o supervisor",
            c: "Ignorar o acionamento da Polícia Militar até falar com o supervisor",
            d: "Silenciar o alarme temporariamente e relatar posteriormente"
        },
        correta: "b"
    },
    // 3
    {
        enunciado: "Durante uma queda de energia total, o operador identifica que apenas uma subestação local está funcionando. O procedimento correto é:",
        alternativas: {
            a: "Priorizar a restauração dessa subestação antes de verificar outras áreas críticas",
            b: "Confirmar com o CCO, realizar verificação remota e comunicar concessionárias se necessário",
            c: "Acionar apenas a equipe de campo, ignorando o CCO",
            d: "Registrar e aguardar a energia voltar automaticamente"
        },
        correta: "b"
    },
    // 4
    {
        enunciado: "Um falso disparo de alarme externo é registrado, mas logo em seguida outro disparo ocorre no mesmo local. Qual é a conduta correta do operador?",
        alternativas: {
            a: "Ignorar o segundo disparo, pois o primeiro já foi registrado como falso",
            b: "Silenciar os alarmes dessa zona temporariamente",
            c: "Apenas informar o supervisor sem registrar o evento",
            d: "Tratar o segundo disparo como evento, realizando verificação completa e registro"
        },
        correta: "d"
    },
    // 5
    {
        enunciado: "O operador precisa acionar a equipe de pronta resposta, mas a situação ainda não apresenta risco à integridade física. Qual é a decisão correta?",
        alternativas: {
            a: "Acionar a equipe imediatamente",
            b: "Ignorar a falha",
            c: "Avaliar se o evento atende os critérios predefinidos antes de acionar",
            d: "Registrar no checklist interno sem comunicação externa"
        },
        correta: "c"
    },
    // 6
    {
        enunciado: "Em qual situação o operador pode acionar diretamente a gestão central sem passar pela equipe de campo?",
        alternativas: {
            a: "Nenhuma, sempre há sequência fixa",
            b: "Quando há risco iminente à segurança ou falha grave evidente",
            c: "Sempre que quiser acelerar o processo",
            d: "Quando não conhece o técnico de plantão"
        },
        correta: "b"
    },
    // 7
    {
        enunciado: "Qual informação NÃO é obrigatória ao comunicar um evento à gestão central?",
        alternativas: {
            a: "Tipo de ocorrência",
            b: "Local exato do evento",
            c: "Status da ocorrência",
            d: "Horário do seu almoço"
        },
        correta: "d"
    },
    // 8
    {
        enunciado: "A equipe de pronta resposta deve ser acionada quando:",
        alternativas: {
            a: "Há falhas severas ou risco à segurança",
            b: "Há atraso na chegada do técnico local",
            c: "Há necessidade de manutenção de rotina",
            d: "O operador não souber o que fazer"
        },
        correta: "a"
    },
    // 9
    {
        enunciado: "Qual o tempo máximo recomendado para chegada da equipe de pronta resposta após o acionamento?",
        alternativas: {
            a: "10 minutos",
            b: "30 minutos",
            c: "15 minutos",
            d: "60 minutos"
        },
        correta: "b"
    },
    // 10
    {
        enunciado: "Todas as ocorrências e acionamentos devem ser:",
        alternativas: {
            a: "Comunicado verbalmente apenas",
            b: "Registrados no sistema e documentados",
            c: "Apagados após resolução",
            d: "Tratados como informação sigilosa, sem registro"
        },
        correta: "b"
    },

    
    {
        enunciado: "Qual é a função principal do operador de monitoramento de uma usina?",
        alternativas: {
            a: "Identificar problemas e garantir segurança e eficiência",
            b: "Realizar manutenção elétrica",
            c: "Gerenciar a equipe administrativa",
            d: "Supervisionar contratos de fornecedores"
        },
        correta: "a"
    },
    {
        enunciado: "O que é um sinistro na usina?",
        alternativas: {
            a: "Evento que pode causar risco ou dano à usina",
            b: "Falha administrativa",
            c: "Reunião de equipe",
            d: "Atualização do sistema"
        },
        correta: "a"
    },
    {
        enunciado: "Qual dos seguintes NÃO é um tipo de sinistro?",
        alternativas: {
            a: "Incêndio",
            b: "Invasão",
            c: "Acidente com colaborador",
            d: "Reunião de equipe"
        },
        correta: "d"
    },
    {
        enunciado: "O que é um alarme externo?",
        alternativas: {
            a: "Disparo de sensores externos",
            b: "Erro no software de monitoramento",
            c: "Falha na energia",
            d: "Problema no servidor"
        },
        correta: "a"
    },
    {
        enunciado: "O que caracteriza um falso disparo de alarme?",
        alternativas: {
            a: "Disparo de sensores externos",
            b: "Quando não há alterações visíveis no local",
            c: "Acidente com colaborador",
            d: "Vandalismo"
        },
        correta: "b"
    },
    {
        enunciado: "Como deve ser classificado um evento sem visibilidade?",
        alternativas: {
            a: "Sinistro confirmado",
            b: "Disparo externo",
            c: "Registrar o fato e solicitar imagens adicionais",
            d: "Ignorar o alarme"
        },
        correta: "c"
    },
    {
        enunciado: "Todo disparo de alarme deve ser:",
        alternativas: {
            a: "Registrado no sistema e checklist",
            b: "Ignorar se for falso",
            c: "Desativado manualmente",
            d: "Notificado apenas à equipe local"
        },
        correta: "a"
    },
    {
        enunciado: "O que é considerado queda de energia?",
        alternativas: {
            a: "Problema no software",
            b: "Falha total ou parcial no fornecimento de energia",
            c: "Incêndio na subestação",
            d: "Vazamento de água"
        },
        correta: "b"
    },
    {
        enunciado: "PAREI NESSE AQUI",
        alternativas: {
            a: "No final do mês",
            b: "Imediatamente após a intervenção",
            c: "Somente quando solicitado",
            d: "Nunca"
        },
        correta: "b"
    },
    {
        enunciado: "Ao detectar tentativa de intrusão sem confirmação, o operador deve:",
        alternativas: {
            a: "Fechar o caso",
            b: "Monitorar atentamente e comunicar supervisor",
            c: "Ação imediata sem registro",
            d: "Reagendar monitoramento"
        },
        correta: "b"
    },
    {
        enunciado: "Se uma câmera crítica ficar offline, a ação imediata é:",
        alternativas: {
            a: "Registrar e solicitar manutenção urgente",
            b: "Esperar 24 horas",
            c: "Ignorar se houver outras",
            d: "Remover do inventário"
        },
        correta: "a"
    },
    {
        enunciado: "Ao analisar logs, o operador deve priorizar:",
        alternativas: {
            a: "Somente eventos de baixa prioridade",
            b: "Eventos que indicam risco ou padrões anômalos",
            c: "Excluir logs antigos",
            d: "Modificar logs"
        },
        correta: "b"
    },
    {
        enunciado: "Qual é a conduta se o operador perceber erro humano na operação?",
        alternativas: {
            a: "Ocultar o erro",
            b: "Registrar o erro e comunicar para correção e aprendizado",
            c: "Punir imediatamente",
            d: "Ignorar"
        },
        correta: "b"
    },
    {
        enunciado: "Em uma falha de redundância, o operador deve:",
        alternativas: {
            a: "Tomar nota e seguir com operação normal",
            b: "Avisar supervisor e acionar plano de mitigação",
            c: "Desligar sistema",
            d: "Nada"
        },
        correta: "b"
    },
    {
        enunciado: "Quando houver dúvida sobre procedimentos, o operador deve:",
        alternativas: {
            a: "Improvisar soluções",
            b: "Consultar procedimentos e, se necessário, o supervisor",
            c: "Aguardar até piorar",
            d: "Ignorar"
        },
        correta: "b"
    },
    {
        enunciado: "Se o cliente questionar um registro, o operador deve:",
        alternativas: {
            a: "Apagar o registro",
            b: "Fornecer explicações e evidências do evento",
            c: "Negar qualquer responsabilidade",
            d: "Alterar dados"
        },
        correta: "b"
    },
    {
        enunciado: "Qual é o procedimento de segurança ao acessar sistemas remotos?",
        alternativas: {
            a: "Usar credenciais compartilhadas sem registro",
            b: "Utilizar credenciais próprias, log e justificar acesso",
            c: "Acessar via conta administrativa global",
            d: "Não registrar"
        },
        correta: "b"
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

    // Seleciona 10 únicas
    const selected = pickNRandom(allQuestions, Math.min(QUESTION_COUNT, allQuestions.length));

    // Limpa o wrapper (substitui conteúdo existente)
    exWrapper.innerHTML = '';

    selected.forEach((q, i) => {
        const div = document.createElement('div');
        div.classList.add('exercise-slide');
        div.setAttribute('data-answer', q.correta);

        // Gerar IDs únicos para inputs/labels
        const name = `q${i}_${Date.now()}`;

        // Monta innerHTML
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

// Renderiza as questões antes de inicializar os listeners que dependem delas
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

// ================== HANDLER DE ENVIO (validação e overlay) ==================
const submitBtn = document.getElementById('submit-exercises');
if (submitBtn) {
    submitBtn.addEventListener('click', () => {
        clearInterval(timerInterval);

        // Re-query slides in case dynamic structure changed
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
                finalizarModuloAPI(moduleId, 0);

                localStorage.removeItem(EX_KEY_ANDAMENTO);
                localStorage.removeItem(EX_KEY_RESET);

                closeResultOverlay();
                currentIndex = 0;
                updateCarousel();
                exercisesSection.style.display = 'none';
                moduleLocked = false;
                const nextBtn = document.querySelector('.next');
                const prevBtn = document.querySelector('.prev');
                if (nextBtn) { nextBtn.style.opacity = '1'; nextBtn.style.cursor = 'pointer'; }
                if (prevBtn) { prevBtn.style.opacity = '1'; prevBtn.style.cursor = 'pointer'; }

                document.querySelectorAll('.thumbnails img').forEach(img => {
                    img.style.pointerEvents = 'auto';
                    img.style.opacity = '1';
                    img.style.filter = 'none';
                });

                document.removeEventListener('keydown', lockArrows);
                exIndex = 0;
                // re-render fresh 10 questions for a clean retry
                renderRandomExercises();
                exSlides = document.querySelectorAll('.exercise-slide');
                updateExerciseCarousel();
                clearInterval(timerInterval);
                totalTime = 30 * 60;
                const timerEl = document.getElementById('timer');
                if (timerEl) timerEl.textContent = 'Tempo restante: 30:00';

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

// 4) focus — quando volta
window.addEventListener("focus", () => {
    const precisaResetar = localStorage.getItem(EX_KEY_RESET);

    if (precisaResetar === "true") {
        localStorage.removeItem(EX_KEY_RESET);
        localStorage.removeItem(EX_KEY_ANDAMENTO);

        // REINICIA UI DOS EXERCÍCIOS
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

