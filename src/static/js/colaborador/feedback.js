const feedbackList = document.getElementById('feedbackList');
const viewAllBtn = document.getElementById('viewAllBtn');


// Rota CERTA para mostrar APENAS feedbacks do colaborador
const baseURL = "http://127.0.0.1:5000/colaborador/feedback/meus-feedbacks";

// Rota CERTA para enviar dúvidas
const enviarURL = "http://127.0.0.1:5000/colaborador/feedback/enviar";

const gestoresURL = "http://127.0.0.1:5000/colaborador/feedback/gestores";


// ================== AUTOCOMPLETE – Buscar Gestores ==================
async function loadGestores(query) {
    if (!query || query.length < 1) return [];

    const TOKEN = localStorage.getItem("token_colaborador");

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
    const TOKEN = localStorage.getItem("token_colaborador"); 

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
                localStorage.removeItem("token_colaborador");
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
            viewAllBtn.style.display = 'none';
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

// ================== Marcar Feedback como Lido ==================
feedbackList.addEventListener('click', async (e) => {
    if (e.target.classList.contains('mark-read-btn') && !e.target.disabled) {
        const card = e.target.closest('.feedback-card');
        const feedbackId = card.dataset.id;
        const TOKEN = localStorage.getItem("token_colaborador");

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

    const TOKEN = localStorage.getItem("token_colaborador");
    const colaborador = JSON.parse(localStorage.getItem("usuario_colaborador"));

    const mensagemInput = document.getElementById("mensagem");
    const assuntoInput = document.getElementById("assunto");

    const data = {
        gestor_id: destinatarioHidden.value,
        colaborador_id: colaborador.id,
        assunto: assuntoInput.value.trim(),
        mensagem: "[DUVIDA] " + mensagemInput.value.trim()
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

        // ⚡ GARANTE QUE APARECE O TOAST
        showToast("Dúvida enviada com sucesso!");

        // ⚡ Aguarda um tick para renderizar o toast antes de limpar
        setTimeout(() => {
            mensagemInput.value = "";
            assuntoInput.value = "";
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
    const savedTheme = localStorage.getItem("theme") || "claro";
    const savedFont = localStorage.getItem("font-size") || "padrao";

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
