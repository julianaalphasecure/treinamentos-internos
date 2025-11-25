// /src/static/js/gestor/relatorio.js
// DOM
const colaboradorSearchInput = document.getElementById("colaborador-search");
const colaboradorDestinoId = document.getElementById("colaborador-destino-id");
const searchResultsDiv = document.getElementById("search-results");
const feedbackTitulo = document.getElementById("feedback-titulo");
const feedbackMensagem = document.getElementById("feedback-mensagem");
const feedbackForm = document.getElementById("feedback-form");
const btnEnviarFeedback = document.getElementById("btn-enviar-feedback");
const feedbackStatusMessage = document.getElementById("feedback-status-message");

const recebidosContainer = document.getElementById("historico-feedbacks");
const btnRefreshRecebidos = document.getElementById("btn-refresh-recebidos");
const recebidosStatus = document.getElementById("recebidos-status");
const badgeNaoLidos = document.getElementById("badge-nao-lidos");

// ROTAS
const BASE = "http://127.0.0.1:5000";
const baseURLColaborador = `${BASE}/colaborador`;
const baseURLFeedback = `${BASE}/gestor/relatorio`;
const recebidosURL = `${BASE}/gestor/relatorio/recebidos`;
const marcarLidoURL = `${BASE}/gestor/relatorio/marcar-lido`;
const naoLidosURL = `${BASE}/gestor/relatorio/nao-lidos/contagem`;

const token = localStorage.getItem("token_gestor");
function authHeaders() { return { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }; }

let todosColaboradores = [];
let colaboradorSelecionado = null;
let isSearchDropdownOpen = false;

async function fetchColaboradores() {
    try {
        const res = await fetch(`${baseURLColaborador}/`, { method: "GET", headers: authHeaders() });
        if (!res.ok) { alert(`Erro ${res.status} ao carregar lista de colaboradores.`); return []; }
        todosColaboradores = await res.json();
        return todosColaboradores;
    } catch (err) { console.error("Erro ao buscar colaboradores:", err); alert("Erro de conexão."); return []; }
}

function renderSearchResults(query) {
    if (!query || query.length < 2) { searchResultsDiv.innerHTML = ''; isSearchDropdownOpen = false; return; }
    const filtered = todosColaboradores.filter(c => c.nome.toLowerCase().includes(query.toLowerCase()));
    searchResultsDiv.innerHTML = '';
    if (filtered.length === 0) { searchResultsDiv.innerHTML = '<div class="no-result-item">Nenhum colaborador encontrado.</div>'; isSearchDropdownOpen = true; return; }
    filtered.forEach(colab => {
        const item = document.createElement('div');
        item.textContent = `${colab.nome} (ID: ${colab.id})`;
        item.dataset.id = colab.id;
        item.dataset.nome = colab.nome;
        item.classList.add('search-result-item');
        item.addEventListener('click', handleSelectColaborador);
        searchResultsDiv.appendChild(item);
    });
    isSearchDropdownOpen = true;
}

function handleSelectColaborador(event) {
    const el = event.currentTarget;
    colaboradorSelecionado = { id: el.dataset.id, nome: el.dataset.nome };
    colaboradorSearchInput.value = colaboradorSelecionado.nome;
    colaboradorDestinoId.value = colaboradorSelecionado.id;
    searchResultsDiv.innerHTML = '';
    isSearchDropdownOpen = false;
    btnEnviarFeedback.disabled = false;
}

colaboradorSearchInput.addEventListener('input', (e) => {
    btnEnviarFeedback.disabled = true;
    colaboradorDestinoId.value = '';
    colaboradorSelecionado = null;
    renderSearchResults(e.target.value.trim());
});

document.addEventListener('click', (e) => {
    if (!feedbackForm.contains(e.target) && isSearchDropdownOpen) {
        searchResultsDiv.innerHTML = '';
        isSearchDropdownOpen = false;
    }
});

// ENVIAR FEEDBACK (GESTOR -> COLABORADOR)
feedbackForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const gestorId = JSON.parse(localStorage.getItem("usuario_gestor"))?.id;
    if (!gestorId || !colaboradorSelecionado?.id) { alert("Selecione um colaborador e faça login como gestor."); return; }
    const dados = { colaborador_id: parseInt(colaboradorSelecionado.id), mensagem: feedbackMensagem.value.trim() };
    if (!dados.mensagem) { alert("A mensagem não pode ser vazia."); return; }

    btnEnviarFeedback.disabled = true; btnEnviarFeedback.textContent = "Enviando...";
    try {
        const res = await fetch(baseURLFeedback, { method: "POST", headers: authHeaders(), body: JSON.stringify(dados) });
        const data = await res.json();
        if (res.ok) {
            feedbackStatusMessage.textContent = `Feedback para ${colaboradorSelecionado.nome} enviado com sucesso!`;
            feedbackStatusMessage.style.color = "green";
            feedbackTitulo.value = ""; feedbackMensagem.value = ""; colaboradorSearchInput.value = ""; colaboradorDestinoId.value = ""; colaboradorSelecionado = null;
            btnEnviarFeedback.disabled = true;
            carregarFeedbacksRecebidos();
            carregarContagemNaoLidos();
        } else {
            feedbackStatusMessage.textContent = "Falha no envio!"; feedbackStatusMessage.style.color = "red";
            alert("Erro ao enviar feedback: " + (data.error || "Erro desconhecido"));
        }
    } catch (err) {
        console.error("Erro:", err); feedbackStatusMessage.textContent = "Erro de Conexão!"; feedbackStatusMessage.style.color = "red";
    } finally {
        btnEnviarFeedback.textContent = "Enviar Feedback";
        setTimeout(() => feedbackStatusMessage.textContent = '', 4000);
    }
});

async function carregarFeedbacksRecebidos() {
    if (!token) { 
        if (recebidosContainer) recebidosContainer.innerHTML = '<p>Não autenticado.</p>'; 
        return; 
    }
    recebidosStatus.textContent = 'Carregando...';

    try {
        const res = await fetch(recebidosURL, { method: "GET", headers: { "Authorization": `Bearer ${token}` } });

        if (!res.ok) { 
            recebidosContainer.innerHTML = `<p>Erro ${res.status}</p>`; 
            recebidosStatus.textContent = '';
            return; 
        }

        const data = await res.json();
        recebidosContainer.innerHTML = '';

        if (!Array.isArray(data) || data.length === 0) {
            recebidosContainer.innerHTML = '<p style="padding:10px;color:#777;">Nenhuma dúvida recebida.</p>';
            recebidosStatus.textContent = '';
            return;
        }

        data.forEach(fb => {
            const card = document.createElement('div');
            card.className = 'feedback-card';
            card.dataset.id = fb.id;

            // ====== DATA ======
            let dateStr = '';
            try { 
                const d = new Date(fb.data_feedback);
                dateStr = `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
            } catch(e){ dateStr = fb.data_feedback; }

            // ====== EXTRAIR TIPO ======
            const raw = fb.mensagem || "";
            const tags = (raw.match(/\[(.*?)\]/g) || []).map(t => t.replace(/\[|\]/g, '').toLowerCase());

            let tipo = "Dúvida";
            for (const t of tags) {
                if (t !== "duvida" && t !== "duvida-modulo") {
                    tipo = t.charAt(0).toUpperCase() + t.slice(1);
                    break;
                }
            }

            // ====== MENSAGEM LIMPA ======
            const mensagemLimpa = raw.replace(/\[[^\]]*\]/g, '').trim();

            card.innerHTML = `
                <h4>${tipo}</h4>
                <p>${mensagemLimpa}</p>
                <div class="meta-info" style="display:flex; justify-content:space-between; align-items:center;">
                    <small style="color:#888">De: ${fb.colaborador_nome || 'Colaborador'} • ${dateStr}</small>
                    <div>
                        <button class="btn-mark-read" ${fb.lido ? 'disabled' : ''}>
                            ${fb.lido ? 'Lida' : 'Marcar como lida'}
                        </button>
                    </div>
                </div>
            `;

            // Botão marcar como lido
            const markBtn = card.querySelector('.btn-mark-read');
            markBtn.addEventListener('click', async () => {
                try {
                    const r = await fetch(`${marcarLidoURL}/${fb.id}`, { method: "PUT", headers: { "Authorization": `Bearer ${token}` } });
                    if (r.ok) { 
                        markBtn.disabled = true;
                        markBtn.textContent = 'Lida';
                        markBtn.style.background = '#999';
                        carregarContagemNaoLidos();
                    } else {
                        const err = await r.json();
                        alert(err.error || `Erro ${r.status}`);
                    }
                } catch (err) { console.error("Erro ao marcar lido:", err); }
            });

            recebidosContainer.appendChild(card);
        });

        recebidosStatus.textContent = `Total: ${data.length}`;

    } catch (err) {
        console.error("Erro ao carregar recebidos:", err);
        recebidosContainer.innerHTML = '<p>Erro ao carregar.</p>';
        recebidosStatus.textContent = '';
    }
}

// BADGE não-lidos
async function carregarContagemNaoLidos() {
    if (!token || !badgeNaoLidos) return;
    try {
        const res = await fetch(naoLidosURL, { method: "GET", headers: { "Authorization": `Bearer ${token}` } });
        if (!res.ok) return;
        const data = await res.json();
        const qtd = data.nao_lidos || 0;
        if (qtd > 0) { badgeNaoLidos.style.display = 'inline-block'; badgeNaoLidos.textContent = qtd; }
        else { badgeNaoLidos.style.display = 'none'; }
    } catch (err) { console.error("Erro ao carregar contagem não lidos:", err); }
}

if (btnRefreshRecebidos) btnRefreshRecebidos.addEventListener('click', () => { 
    carregarFeedbacksRecebidos(); 
    carregarContagemNaoLidos(); 
});

document.addEventListener("DOMContentLoaded", async () => {
    if (!token || !localStorage.getItem("usuario_gestor")) { 
        window.location.href = "/src/templates/auth/login.html"; 
        return; 
    }
    await fetchColaboradores();
    carregarFeedbacksRecebidos();
    carregarContagemNaoLidos();
});
