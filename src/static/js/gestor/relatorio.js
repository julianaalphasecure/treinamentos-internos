const listaFeedback = document.getElementById("lista-feedback");
const btnVerTodos = document.getElementById("btn-ver-todos-feedback");
const progressoMedioElem = document.getElementById("progresso-medio");
const taxaConclusaoElem = document.getElementById("taxa-conclusao");

const baseURLColaborador = "http://127.0.0.1:5000/colaborador/perfil"; // lista colaboradores
const baseURLFeedback = "http://127.0.0.1:5000/colaborador/feedback"; // envia feedback
const token = localStorage.getItem("token_gestor"); // JWT do gestor

// ================== Formata data ==================
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

// ================== Carrega colaboradores e histórico ==================
async function carregarFeedback() {
    try {
        const res = await fetch(`${baseURLColaborador}/`);
        const colaboradores = await res.json();

        if (!res.ok) {
            console.error("Erro ao carregar colaboradores", colaboradores.error);
            return;
        }

        listaFeedback.innerHTML = "";

        let totalProgresso = 0;
        let concluido = 0;

        for (const colaborador of colaboradores) {
            const progresso = colaborador.progresso || Math.floor(Math.random() * 101);
            totalProgresso += progresso;
            if (progresso >= 70) concluido++;

            // Carrega feedbacks existentes do colaborador
            const resFb = await fetch(`${baseURLFeedback}/?colaborador_id=${colaborador.id}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const feedbacks = await resFb.json();

            const li = document.createElement("li");
            li.dataset.id = colaborador.id;

            let feedbackHistorico = "";
            if (Array.isArray(feedbacks) && feedbacks.length > 0) {
                feedbackHistorico = "<ul class='historico-feedback'>";
                feedbacks.forEach(fb => {
                    feedbackHistorico += `<li>${formatDate(fb.data_feedback)} - ${fb.mensagem}</li>`;
                });
                feedbackHistorico += "</ul>";
            }

            li.innerHTML = `
                <div class="colaborador-info">
                    <span>${colaborador.nome}</span>
                    <span class="percentual">${progresso}%</span>
                    <button class="enviar-feedback-btn" title="Enviar Feedback">&#9993;</button>
                </div>
                ${feedbackHistorico}
            `;

            listaFeedback.appendChild(li);
        }

        // ====== Exibe nome do gestor no header ======
        const usuario = JSON.parse(localStorage.getItem("usuario_gestor")) || {};
        const headerNome = document.getElementById("user-name");
        if (headerNome) {
            headerNome.textContent = `Olá, ${usuario.nome || ""}`;
        }

        // Atualiza resumo
        const media = Math.round(totalProgresso / colaboradores.length);
        const taxaConclusao = Math.round((concluido / colaboradores.length) * 100);
        progressoMedioElem.textContent = `${media}%`;
        taxaConclusaoElem.textContent = `${taxaConclusao}%`;

    } catch (err) {
        console.error("Erro ao conectar com o servidor:", err);
    }
}

// ================== Enviar feedback ==================
listaFeedback.addEventListener("click", async (e) => {
    if (e.target.classList.contains("enviar-feedback-btn")) {
        const li = e.target.closest("li");
        const colaboradorId = li.dataset.id;

        const mensagem = prompt("Digite a mensagem de feedback:");
        if (!mensagem) return;

        try {
            const res = await fetch(baseURLFeedback, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    colaborador_id: parseInt(colaboradorId),
                    mensagem: mensagem
                })
            });

            const data = await res.json();
            if (res.ok) {
                alert("Feedback enviado com sucesso!");
                carregarFeedback(); // Atualiza histórico
            } else {
                alert("Erro ao enviar feedback: " + (data.error || "Erro desconhecido"));
            }
        } catch (err) {
            console.error("Erro ao enviar feedback:", err);
            alert("Erro ao enviar feedback. Veja o console.");
        }
    }
});

// ================== Botão ver todos ==================
btnVerTodos.addEventListener("click", carregarFeedback);

// ================== Inicializar ==================
carregarFeedback();
