const colaboradorSearchInput = document.getElementById("colaborador-search");
const colaboradorDestinoId = document.getElementById("colaborador-destino-id");
const searchResultsDiv = document.getElementById("search-results");
const feedbackTitulo = document.getElementById("feedback-titulo");
const feedbackMensagem = document.getElementById("feedback-mensagem");
const feedbackForm = document.getElementById("feedback-form");
const btnEnviarFeedback = document.getElementById("btn-enviar-feedback");
const feedbackStatusMessage = document.getElementById("feedback-status-message");

const recebidosContainer = document.getElementById("historico-feedbacks");
const recebidosStatus = document.getElementById("recebidos-status");
const badgeNaoLidos = document.getElementById("badge-nao-lidos");


const BASE = "http://127.0.0.1:5000";
const baseURLColaborador = `${BASE}/colaborador`;
const baseURLFeedback = `${BASE}/gestor/relatorio`;
const recebidosURL = `${BASE}/gestor/relatorio/recebidos`;
const marcarLidoURL = `${BASE}/gestor/relatorio/marcar-lido`;
const naoLidosURL = `${BASE}/gestor/relatorio/nao-lidos/contagem`;

const token = sessionStorage.getItem("token_gestor");
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
    } catch (err) { console.error("Erro:", err); alert("Erro de conexão."); return []; }
}

function renderSearchResults(query) {
    if (!query || query.length < 2) { searchResultsDiv.innerHTML = ''; isSearchDropdownOpen = false; return; }

    const filtered = todosColaboradores.filter(c => c.nome.toLowerCase().includes(query.toLowerCase()));

    searchResultsDiv.innerHTML = '';
    if (filtered.length === 0) {
        searchResultsDiv.innerHTML = '<div class="no-result-item">Nenhum colaborador encontrado.</div>';
        isSearchDropdownOpen = true;
        return;
    }

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


feedbackForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!colaboradorSelecionado?.id) return alert("Selecione um colaborador.");

    const dados = {
        colaborador_id: parseInt(colaboradorSelecionado.id),
        mensagem: feedbackMensagem.value.trim()
    };

    if (!dados.mensagem) return alert("A mensagem não pode ser vazia.");

    btnEnviarFeedback.disabled = true;
    btnEnviarFeedback.textContent = "Enviando...";

    try {
        const res = await fetch(baseURLFeedback, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(dados),
        });

        const data = await res.json();

        if (res.ok) {
        
            feedbackStatusMessage.textContent = `Feedback enviado!`;
            feedbackStatusMessage.style.color = "green";

            feedbackMensagem.value = "";
            feedbackTitulo.value = "";
            colaboradorSearchInput.value = "";
            colaboradorDestinoId.value = "";
            colaboradorSelecionado = null;
            searchResultsDiv.innerHTML = "";

            btnEnviarFeedback.disabled = true; 

    carregarFeedbacksRecebidos();
    carregarContagemNaoLidos();

        } else {
            alert(data.error || "Erro ao enviar");
        }

    } catch (err) {
        alert("Erro de conexão");
    } finally {
        btnEnviarFeedback.disabled = true;
        btnEnviarFeedback.textContent = "Enviar Feedback";
        setTimeout(() => feedbackStatusMessage.textContent = "", 3000);
    }
});

async function carregarFeedbacksRecebidos() {
    if (!token) return;

    recebidosStatus.textContent = "Carregando...";

    try {
        const res = await fetch(recebidosURL, { headers: { "Authorization": `Bearer ${token}` } });

        if (!res.ok) {
            recebidosContainer.innerHTML = `<p>Erro ${res.status}</p>`;
            recebidosStatus.textContent = "";
            return;
        }

        const data = await res.json();

        recebidosContainer.innerHTML = "";

        if (!Array.isArray(data) || data.length === 0) {
            recebidosContainer.innerHTML = '<p style="padding:10px;color:#777;">Nenhuma dúvida recebida.</p>';
            recebidosStatus.textContent = "";
            return;
        }

        data.forEach(fb => renderCardDuvida(fb));

        recebidosStatus.textContent = `Total: ${data.length}`;

    } catch (err) {
        recebidosContainer.innerHTML = "<p>Erro ao carregar.</p>";
    }
}


function formatarData(dt) {
    const d = new Date(dt);
    return ("0" + d.getDate()).slice(-2) + "/" +
           ("0" + (d.getMonth() + 1)).slice(-2) + "/" +
           d.getFullYear() + " às " +
           ("0" + d.getHours()).slice(-2) + ":" +
           ("0" + d.getMinutes()).slice(-2);
}



function renderCardDuvida(fb) {
    const card = document.createElement("div");
    card.className = "feedback-card";
    card.dataset.id = fb.id;

    const d = new Date(fb.data_feedback);
    const dateStr =
        `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth()+1).padStart(2, "0")}/${d.getFullYear()}`;

    const rawMsg = fb.mensagem || "";
    const cleanMsg = rawMsg.replace(/\[[^\]]*\]/g, "").trim();

    card.innerHTML = `
        <h4>Dúvida</h4>
        <p>${cleanMsg}</p>
        <div class="meta-info" style="display:flex; justify-content:space-between;">
            <small style="color:#888">De: ${fb.colaborador_nome} • ${dateStr}</small>

            <button class="btn-mark-read" ${fb.lido ? "disabled" : ""}>
                ${fb.lido ? "Lida" : "Marcar como lida"}
            </button>
        </div>
    `;

    card.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-mark-read")) return;
        abrirModalDuvida(fb);
    });

    const markBtn = card.querySelector(".btn-mark-read");
    markBtn.addEventListener("click", async (e) => {
        e.stopPropagation();

        if (fb.lido) return;

        const r = await fetch(`${marcarLidoURL}/${fb.id}`, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (r.ok) {
            fb.lido = true;
            markBtn.disabled = true;
            markBtn.textContent = "Lida";

            carregarContagemNaoLidos();
        }
    });

    recebidosContainer.appendChild(card);
}


const modal = document.getElementById("modal-duvida");
const modalClose = document.getElementById("modal-close");
const modalTitulo = document.getElementById("modal-titulo");
const modalInfo = document.getElementById("modal-info");
const modalMensagem = document.getElementById("modal-mensagem");
const modalBtnLido = document.getElementById("modal-marcar-lido");
const textareaResposta = document.getElementById("modal-resposta");
const btnEnviarResposta = document.getElementById("modal-enviar-resposta");

let modalFeedbackId = null;

function abrirModalDuvida(fb) {

    modalFeedbackId = fb.id;

    modalTitulo.textContent = "Dúvida";
    modalInfo.textContent = `De: ${fb.colaborador_nome} • ${fb.data_feedback}`;
    modalMensagem.textContent = fb.mensagem.replace(/\[[^\]]*\]/g, "").trim();

    const box = document.getElementById("modal-resposta-enviada");
    box.style.display = "none";
    box.innerHTML = "";

    textareaResposta.value = "";
    textareaResposta.disabled = false;
    textareaResposta.style.display = "block";

    btnEnviarResposta.disabled = false;
    btnEnviarResposta.style.display = "block";
    btnEnviarResposta.textContent = "Enviar resposta";

    const respondido = fb.resposta && fb.resposta.trim() !== "";

    if (respondido) {

        textareaResposta.style.display = "none";
        btnEnviarResposta.style.display = "none";

        let dataResp = "—";
        if (fb.respondido_em) {
            const d = new Date(fb.respondido_em);
            dataResp =
                ("0" + d.getDate()).slice(-2) + "/" +
                ("0" + (d.getMonth() + 1)).slice(-2) + "/" +
                d.getFullYear() + " às " +
                ("0" + d.getHours()).slice(-2) + ":" +
                ("0" + d.getMinutes()).slice(-2);
        }

        box.innerHTML =
            '<div style="background:#e8ffe8; padding:12px; border-radius:6px; border-left:5px solid #2ecc71;">' +
                '<p style="margin-top:6px;"><strong>Resposta:</strong><br>' + fb.resposta + '</p>' +
            '</div>';

        box.style.display = "block";
    }

    modalBtnLido.style.display = fb.lido ? "none" : "block";
    modal.style.display = "flex";
}


modalClose.addEventListener("click", () => modal.style.display = "none");
modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
});



modalClose.addEventListener("click", () => modal.style.display = "none");
modal.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });


btnEnviarResposta.addEventListener("click", async () => {
    const resposta = textareaResposta.value.trim();
    if (!resposta) return alert("Digite uma resposta.");

    btnEnviarResposta.disabled = true;
    btnEnviarResposta.textContent = "Enviando...";

    try {
        const res = await fetch(`${baseURLFeedback}/responder/${modalFeedbackId}`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ resposta }),
        });

        const data = await res.json();

const card = document.querySelector(`[data-id="${modalFeedbackId}"]`);

if (card) {
    const fbAtualizado = {
        ...data.feedback,   
        ...{ resposta }     
    };
    
    card.onclick = () => abrirModalDuvida(fbAtualizado);
}



if (res.ok) {
textareaResposta.value = "";
textareaResposta.style.display = "none";
textareaResposta.disabled = true;
btnEnviarResposta.style.display = "none";

const box = document.getElementById("modal-resposta-enviada");

const agora = new Date();
const dataFormatada = formatarData(agora);

box.innerHTML =
    "<p><strong>Resposta enviada em:</strong> " + dataFormatada + "</p>" +
    "<p><strong>Resposta:</strong> " + resposta + "</p>";

box.style.display = "block";


const card = document.querySelector('[data-id="' + modalFeedbackId + '"]');
if (card) {
    const btn = card.querySelector(".btn-mark-read");
    if (btn) {
        btn.textContent = "Lida";
        btn.disabled = true;
    }
}

carregarFeedbacksRecebidos();


} else {
    alert(data.error || "Erro ao responder.");
}


    } catch (err) {
        alert("Erro ao conectar.");
    } finally {
        btnEnviarResposta.disabled = false;
        btnEnviarResposta.textContent = "Enviar resposta";
    }
});



async function carregarContagemNaoLidos() {
    try {
        const res = await fetch(naoLidosURL, {
            headers: { "Authorization": `Bearer ${token}` },
        });

        const data = await res.json();
        const qtd = data.nao_lidos || 0;

        if (qtd > 0) {
            badgeNaoLidos.style.display = "inline-block";
            badgeNaoLidos.textContent = qtd;
        } else badgeNaoLidos.style.display = "none";

    } catch (err) {}
}

document.addEventListener("DOMContentLoaded", async () => {
    if (!token) window.location.href = "/src/templates/auth/login.html";

    await fetchColaboradores();
    carregarFeedbacksRecebidos();
    carregarContagemNaoLidos();
});
