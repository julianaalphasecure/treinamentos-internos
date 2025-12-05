const feedbackList = document.getElementById('feedbackList');
const viewAllBtn = document.getElementById('viewAllBtn');


const baseURL = "http://127.0.0.1:5000/colaborador/feedback/meus-feedbacks";

const enviarURL = "http://127.0.0.1:5000/colaborador/feedback/enviar";

const gestoresURL = "http://127.0.0.1:5000/colaborador/feedback/gestores";


// ================== AUTOCOMPLETE – Buscar Gestores ==================
async function loadGestores(query) {
    if (!query || query.length < 1) return [];

    const TOKEN = sessionStorage.getItem("token_colaborador");

    try {
        const response = await fetch(`${gestoresURL}?nome=${query}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${TOKEN}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) return [];

        return await response.json();
    } catch (err) {
        console.error("Erro ao buscar gestores:", err);
        return [];
    }
}


const destinatarioInput = document.getElementById("destinatario");
const destinatarioHidden = document.getElementById("destinatario_id");
const autocompleteBox = document.getElementById("autocomplete-gestores");


destinatarioInput.addEventListener("input", async () => {
    autocompleteBox.innerHTML = "";
    const nome = destinatarioInput.value.trim();

    if (nome.length < 1) return;

    const gestores = await loadGestores(nome);

    autocompleteBox.style.display = gestores.length > 0 ? "block" : "none";

    gestores.forEach(g => {
        const item = document.createElement("div");
        item.classList.add("autocomplete-item");
        item.textContent = g.nome;

        item.addEventListener("click", () => {
            destinatarioInput.value = g.nome;
            destinatarioHidden.value = g.id;
            autocompleteBox.innerHTML = "";
            autocompleteBox.style.display = "none";
        });

        autocompleteBox.appendChild(item);
    });
});


document.addEventListener("click", (e) => {
    if (!destinatarioInput.contains(e.target) && !autocompleteBox.contains(e.target)) {
        autocompleteBox.style.display = "none";
    }
});

// ================== Função: Formatar Data ==================
function formatDate(datetime) {
    const date = new Date(datetime);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric' // <-- Removido 'hour' e 'minute'
        // 'hour': '2-digit',
        // 'minute': '2-digit'
    });
}
// ================== Carregar Feedbacks ==================
async function loadFeedbacks() {
    const TOKEN = sessionStorage.getItem("token_colaborador"); 

    if (!TOKEN) {
        feedbackList.innerHTML = '<p>Erro de autenticação. Faça login novamente.</p>';
        return;
    }

    try {
        const response = await fetch(baseURL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                sessionStorage.removeItem("token_colaborador");
                window.location.href = "/src/templates/auth/login.html";
                return;
            }
            throw new Error(`Erro ${response.status}.`);
        }

        let data = await response.json();

// garante que só mensagens de gestores aparecem
data = data.filter(fb => fb.mensagem.startsWith("[FEEDBACK]"));

        feedbackList.innerHTML = '';

        if (data.length === 0) {
            feedbackList.innerHTML = '<p>Nenhum feedback recebido.</p>';
            if (viewAllBtn) viewAllBtn.style.display = 'none';
            return;
        }

        data.forEach(fb => {
            const card = document.createElement('div');
            card.classList.add('feedback-card');
            card.dataset.id = fb.id;

            card.classList.add(fb.lido ? 'read' : 'unread');

            const gestorNome = fb.gestor_nome || `ID ${fb.gestor_id}`;
            const tipo = "Feedback";


            card.innerHTML = `
                <div class="feedback-header">
                    <span class="feedback-type">${tipo}</span>
                    <span class="feedback-from">De: ${gestorNome}</span>
                    <span class="feedback-date">${formatDate(fb.data_feedback)}</span>
                </div>

                <div class="feedback-message">${fb.mensagem}</div>

                <button class="mark-read-btn" ${fb.lido ? 'disabled' : ''}>
                    ${fb.lido ? 'Lida' : 'Marcar como lida'}
                </button>
            `;

            feedbackList.appendChild(card);
        });

    } catch (err) {
        feedbackList.innerHTML = `<p>Falha ao carregar feedbacks: ${err.message}</p>`;
    }
}
loadDuvidas();


/* ============================================
      CARREGAR DÚVIDAS ENVIADAS (CHAT)
=============================================== */
async function loadDuvidas() {
    const TOKEN = sessionStorage.getItem("token_colaborador");
    const duvidasBox = document.getElementById("duvidasList");

    // =============================
    // FUNÇÃO PARA NORMALIZAR E FORMATAR SÓ A DATA (AMERICA/SAO_PAULO)
    // =============================
    function formatDateToSaoPaulo(dateStr) {
        if (!dateStr) return null;

        // Normaliza "YYYY-MM-DD HH:MM:SS" -> "YYYY-MM-DDTHH:MM:SSZ"
        if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateStr)) {
            dateStr = dateStr.replace(" ", "T") + "Z";
        }

        // Normaliza "YYYY-MM-DDTHH:MM:SS" -> assume UTC se não houver timezone
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(dateStr)) {
            dateStr = dateStr + "Z";
        }

        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return null;

        // Tenta formatar usando timeZone de São Paulo
        try {
            return d.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                timeZone: "America/Sao_Paulo"
            });
        } catch (e) {
            // Fallback: subtrai 3h (UTC-3) e retorna apenas a data local
            const fallback = new Date(d.getTime() - 3 * 60 * 60 * 1000);
            return fallback.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            });
        }
    }

    try {
        const response = await fetch("http://127.0.0.1:5000/colaborador/feedback/duvidas", {
            method: "GET",
            headers: { "Authorization": `Bearer ${TOKEN}` }
        });

        let data = await response.json();

        // Filtrar apenas dúvidas
        data = data.filter(fb => fb.mensagem && fb.mensagem.startsWith("[duvida-modulo]"));

        duvidasBox.innerHTML = "";

        if (data.length === 0) {
            duvidasBox.innerHTML = "<p>Nenhuma dúvida enviada ainda.</p>";
            return;
        }

        data.forEach(fb => {
            const perguntaOriginal = fb.mensagem ? fb.mensagem.replace(/\[.*?\]/g, "").trim() : "";

            const dataEnvio = formatDateToSaoPaulo(fb.data_feedback) || "—";
            const dataResposta = formatDateToSaoPaulo(fb.data_resposta) || "—";

            const bloco = document.createElement("div");
            bloco.classList.add("chat-item");

            bloco.innerHTML = `
                <div class="chat-pergunta">
                    <p><strong>Você:</strong> ${perguntaOriginal}</p>
                    <span class="chat-data">${dataEnvio}</span>
                </div>

                ${fb.resposta ? `
                    <div class="chat-resposta">
                        <p><strong>${fb.gestor_nome || 'Gestor'} respondeu:</strong> ${fb.resposta}</p>
                        <span class="chat-data">${dataResposta}</span>
                    </div>
                ` : `
                    <div class="chat-aguardando">
                        <p><em>Aguardando resposta do gestor...</em></p>
                    </div>
                `}
            `;

            duvidasBox.appendChild(bloco);
        });

    } catch (err) {
        console.error("Erro ao carregar dúvidas:", err);
        duvidasBox.innerHTML = "<p>Erro ao carregar histórico.</p>";
    }
}



// ================== Marcar Feedback como Lido ==================
feedbackList.addEventListener('click', async (e) => {
    if (e.target.classList.contains('mark-read-btn') && !e.target.disabled) {
        const card = e.target.closest('.feedback-card');
        const feedbackId = card.dataset.id;
        const TOKEN = sessionStorage.getItem("token_colaborador");

        try {
            const response = await fetch(`http://127.0.0.1:5000/colaborador/feedback/marcar-lido/${feedbackId}`,
            {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${TOKEN}` }
});


            if (!response.ok) throw new Error("Erro ao marcar como lido.");

            card.classList.add('read');
            card.classList.remove('unread');
            e.target.disabled = true;
            e.target.textContent = 'Lida';

        } catch (err) {
            console.error("Erro:", err);
        }
    }
});

// ================== Enviar Feedback ==================
const form = document.getElementById("sendFeedbackForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const TOKEN = sessionStorage.getItem("token_colaborador");
    const colaborador = JSON.parse(sessionStorage.getItem("usuario_colaborador"));

    const mensagemInput = document.getElementById("mensagem");
    const assuntoInput = document.getElementById("assunto");

    const data = {
        gestor_id: destinatarioHidden.value,
        assunto: assuntoInput.value.trim(),
        mensagem: "[duvida-modulo] " + mensagemInput.value.trim()
    };

    if (!data.gestor_id) {
        showToast("Selecione um gestor válido!");
        return;
    }

    if (!mensagemInput.value.trim()) {
        showToast("Digite uma mensagem antes de enviar!");
        return;
    }

    try {
        const response = await fetch(enviarURL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            showToast(result.error || "Erro ao enviar feedback.");
            return;
        }

        // GARANTE QUE APARECE O TOAST
        showToast("Dúvida enviada com sucesso!");

        // Aguarda um tick para renderizar o toast antes de limpar
        setTimeout(() => {
            // Limpa todos os campos
            mensagemInput.value = "";
            assuntoInput.value = "";
            destinatarioInput.value = "";
            destinatarioHidden.value = "";
            autocompleteBox.innerHTML = "";
            autocompleteBox.style.display = "none";
        }, 50);

    } catch (err) {
        console.error("Erro ao enviar feedback:", err);
        showToast("Erro inesperado.");
    }
});


// ================== Botão "Ver Todos" ==================
if (viewAllBtn) {
    viewAllBtn.addEventListener('click', loadFeedbacks);
}


// ================== Carrega ao iniciar ==================
loadFeedbacks();


document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = sessionStorage.getItem("theme") || "claro";
    const savedFont = sessionStorage.getItem("font-size") || "padrao";

    document.body.setAttribute("data-theme", savedTheme);
    document.body.setAttribute("data-font", savedFont);
});

// ================== TOAST NOTIFICATION (ANIMADO) ==================
function showToast(message) {
    let toast = document.getElementById("toast-notification");

    // Criar caso não exista
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast-notification";
        toast.style.position = "fixed";
        toast.style.bottom = "-60px"; 
        toast.style.right = "20px";
        toast.style.background = "#28a745";  // Verde sucesso
        toast.style.color = "#fff";
        toast.style.padding = "14px 20px";
        toast.style.borderRadius = "10px";
        toast.style.fontSize = "15px";
        toast.style.fontWeight = "500";
        toast.style.zIndex = "9999";
        toast.style.opacity = "0";
        toast.style.boxShadow = "0 4px 12px rgba(0,0,0,0.25)";
        toast.style.transition = "all 0.4s ease";
        toast.style.pointerEvents = "none"; // não bloqueia clique no site
        document.body.appendChild(toast);
    }

    toast.textContent = message;

    // ANIMAÇÃO DE ENTRADA
    setTimeout(() => {
        toast.style.opacity = "1";
        toast.style.bottom = "20px";
    }, 10);

    // ANIMAÇÃO DE SAÍDA
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.bottom = "-60px";
    }, 2500);
}
