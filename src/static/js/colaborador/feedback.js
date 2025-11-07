const feedbackList = document.getElementById('feedbackList');
const viewAllBtn = document.getElementById('viewAllBtn');

// URLs da API
const baseURL = "http://127.0.0.1:5000/colaborador/feedback";

// Formata a data
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

// ================== Carrega feedbacks via API (JWT Protegido) ==================
async function loadFeedbacks() {
    const TOKEN = localStorage.getItem("token_colaborador"); 

    if (!TOKEN) {
        console.error("Token de colaborador não encontrado.");
        feedbackList.innerHTML = '<p>Erro de autenticação. Por favor, faça login novamente.</p>';
        return;
    }

    try {
        // ROTA ATUALIZADA: Busca os feedbacks APENAS DESTE colaborador
        const response = await fetch(`${baseURL}/meus-feedbacks`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            }
        }); 
        
        // Tratar erro de autenticação ou servidor
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                // Forçar logout se o token for inválido/expirado
                localStorage.removeItem("token_colaborador");
                localStorage.removeItem("usuario_colaborador");
                window.location.href = "/src/templates/auth/login.html";
                return;
            }
            throw new Error(`Erro ${response.status} ao carregar feedbacks.`);
        }

        const data = await response.json();
        feedbackList.innerHTML = '';

        if (data.length === 0) {
            feedbackList.innerHTML = '<p>Nenhum feedback recebido. Bom trabalho!</p>';
            viewAllBtn.style.display = 'none';
            return;
        }

        // Renderiza os cards de feedback
        data.forEach(fb => {
            const card = document.createElement('div');
            card.classList.add('feedback-card');
            card.dataset.id = fb.id;
            if (fb.lido) {
                card.classList.add('read');
            } else {
                card.classList.add('unread'); 
            }

            const tipo = fb.tipo || 'Feedback';
            // Usa gestor_nome que o Model retorna
            const gestorNome = fb.gestor_nome || `ID ${fb.gestor_id}`; 

            card.innerHTML = `
                <div class="feedback-header">
                    <span class="feedback-type">${tipo}</span>
                    <span class="feedback-from">De: ${gestorNome}</span>
                    <span class="feedback-date">${formatDate(fb.data_feedback)}</span>
                </div>
                <div class="feedback-message">${fb.mensagem}</div>
                <button class="mark-read-btn" ${fb.lido ? 'disabled' : ''}>${fb.lido ? 'Lida' : 'Marcar como lida'}</button>
            `;

            feedbackList.appendChild(card);
        });

    } catch (err) {
        console.error('Erro ao carregar feedbacks:', err);
        feedbackList.innerHTML = `<p>Falha ao carregar feedbacks: ${err.message}</p>`;
    }
}

// ================== Marca como lido via API (PUT) ==================
feedbackList.addEventListener('click', async (e) => {
    if (e.target.classList.contains('mark-read-btn') && !e.target.disabled) {
        const card = e.target.closest('.feedback-card');
        const feedbackId = card.dataset.id;
        const TOKEN = localStorage.getItem("token_colaborador");

        try {
            // ROTA ATUALIZADA: Chama o endpoint de marcar-lido
            const response = await fetch(`${baseURL}/marcar-lido/${feedbackId}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${TOKEN}`
                }
            });

            if (!response.ok) throw new Error("Falha ao marcar como lido.");
            
            // Atualiza o DOM
            card.classList.add('read');
            card.classList.remove('unread');
            e.target.disabled = true;
            e.target.textContent = 'Lida';

        } catch (err) {
            console.error('Erro ao marcar feedback como lido:', err);
        }
    }
});

viewAllBtn.addEventListener('click', loadFeedbacks);
loadFeedbacks();

// ================== Preferências do usuário (Mantido) ==================
document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme") || "claro";
    const savedFont = localStorage.getItem("font-size") || "padrao";

    document.body.setAttribute("data-theme", savedTheme);
    document.body.setAttribute("data-font", savedFont);

    window.setTheme = (theme) => {
        document.body.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    };

    window.setFontSize = (size) => {
        document.body.setAttribute("data-font", size);
        localStorage.setItem("font-size", size);
    };

    window.showToast = (msg, duration = 2500) => {
        const toast = document.createElement("div");
        toast.className = "toast";
        toast.textContent = msg;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add("show"), 100);
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 400);
        }, duration);
    };
});