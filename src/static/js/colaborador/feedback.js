const feedbackList = document.getElementById('feedbackList');
const viewAllBtn = document.getElementById('viewAllBtn');


const baseURL = "http://127.0.0.1:5000/colaborador/feedback";
const baseUsersURL = "http://127.0.0.1:5000/usuarios";

// ================== AUTOCOMPLETE – Buscar Gestores ==================
async function loadGestores(query) {
    if (!query || query.length < 1) return [];

    try {
        const response = await fetch(`${baseUsersURL}/gestores?nome=${query}`);
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
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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
        const response = await fetch(`${baseURL}/meus-feedbacks`, {
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

        const data = await response.json();
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
            const tipo = fb.tipo || 'Feedback';

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
            const response = await fetch(`${baseURL}/marcar-lido/${feedbackId}`, {
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

    const data = {
        gestor_id: destinatarioHidden.value,
        colaborador_id: colaborador.id,
        assunto: document.getElementById("assunto").value,
        mensagem: document.getElementById("mensagem").value
    };

    if (!data.gestor_id) {
        showToast("Selecione um gestor válido!");
        return;
    }

    try {
        const response = await fetch(`${baseURL}/enviar`, {
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

        showToast("Mensagem enviada com sucesso!");
        form.reset();
        destinatarioHidden.value = "";

    } catch (err) {
        console.error("Erro ao enviar feedback:", err);
        showToast("Erro inesperado.");
    }
});

// ================== Botão "Ver Todos" ==================
viewAllBtn.addEventListener('click', loadFeedbacks);

// ================== Carrega ao iniciar ==================
loadFeedbacks();


document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme") || "claro";
    const savedFont = localStorage.getItem("font-size") || "padrao";

    document.body.setAttribute("data-theme", savedTheme);
    document.body.setAttribute("data-font", savedFont);
});
