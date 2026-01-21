document.addEventListener("DOMContentLoaded", async () => {


    const MODULE_ID = Number(document.body.dataset.moduleId);

    if (MODULE_ID && token) {
        await iniciarModulo(MODULE_ID);
    }

    /* ================== AUTH ================== */
    const btnLogout = document.getElementById("btn-logout");
    if (btnLogout) {
        btnLogout.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.replace("/src/templates/auth/login.html");
        });
    }

    const userNameElement = document.getElementById("user-name");
    const usuarioColaborador = JSON.parse(localStorage.getItem("usuario_colaborador"));
    const token = localStorage.getItem("token_colaborador");

    if (!usuarioColaborador || !usuarioColaborador.id) {
        if (userNameElement) userNameElement.textContent = "Olá, Usuário";
        window.location.replace("/src/templates/auth/login.html");
        return;
    }

    if (userNameElement) {
        userNameElement.textContent = `Olá, ${usuarioColaborador.nome}`;
    }

    /* ================== CONTAINER ================== */
    const wrapper = document.querySelector(".modules-wrapper");
    if (!wrapper) {
        console.error("❌ .modules-wrapper não encontrado");
        return;
    }

    /* ================== FETCH MÓDULOS ================== */
    async function carregarModulos() {
        try {
            const res = await fetch("/colaborador/modulo/api/modulos", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Erro ao buscar módulos");

            const modulos = await res.json();
            console.log("✅ Módulos recebidos:", modulos);

            renderizarModulos(modulos);
            carregarProgresso();

        } catch (err) {
            console.error("Erro ao carregar módulos:", err);
        }
    }

async function atualizarImagensModulos() {
    try {
        const res = await fetch("/colaborador/modulo/api/modulos", {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Erro ao buscar módulos para atualizar imagens");

        const modulosAtualizados = await res.json();

        document.querySelectorAll(".module-card").forEach(card => {
            const id = Number(card.dataset.id);
            const moduloAtual = modulosAtualizados.find(m => Number(m.id) === id);

            if (moduloAtual && moduloAtual.imagem_capa) {
                const img = card.querySelector("img");
                if (img) {
                    img.src = moduloAtual.imagem_capa;
                }
            }
        });

    } catch (err) {
        console.error("Erro ao atualizar imagens dos módulos:", err);
    }
}


    /* ================== RENDER GRID ================== */
function renderizarModulos(modulos) {
    wrapper.innerHTML = "";

    if (!modulos || !modulos.length) {
        wrapper.innerHTML = "<p>Nenhum módulo disponível.</p>";
        return;
    }

    modulos.forEach(modulo => {
        const imagemCapa = modulo.imagem_capa 
            ? modulo.imagem_capa 
            : "/static/img/modulo_placeholder.webp";

        wrapper.insertAdjacentHTML("beforeend", `
            <div class="module-card" data-id="${modulo.id}">
                
                <div class="module-cover">
                    <img src="${imagemCapa}" alt="Capa do módulo ${modulo.titulo}">
                </div>

                <div class="module-body">
                    <h3>${modulo.titulo}</h3>

                   <div class="progress-wrapper">
    <div class="progress-bar">
        <div class="progress-bar-inner"></div>
    </div>
    <span class="progress-percent">0%</span>
    </div>


                    <a href="/colaborador/modulo/${modulo.id}">
                        <button>Acessar</button>
                    </a>
                </div>
            </div>
        `);
    });
}


    /* ================== PROGRESSO ================== */
    async function carregarProgresso() {
        try {
            const response = await fetch("/colaborador/progresso/frontend", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) return;

            const data = await response.json();
            const modulosAPI = data.modulos || [];

            const stats = data.stats || {};

const statValues = document.querySelectorAll(".stat-value");

if (data.stats && statValues.length >= 3) {
    statValues[0].textContent = data.stats.concluidos;
    statValues[1].textContent = data.stats.em_andamento;
    statValues[2].textContent = data.stats.nao_iniciados;
}


            document.querySelectorAll(".module-card").forEach(card => {
                const bar = card.querySelector(".progress-bar-inner");
                if (!bar) return;

                const id = Number(card.dataset.id);
                const info = modulosAPI.find(m => Number(m.modulo_id) === id);

                const percent = info ? (info.percent || 0) : 0;

bar.style.width = `${percent}%`;

const percentLabel = card.querySelector(".progress-percent");
if (percentLabel) {
    percentLabel.textContent = `${percent}%`;
}

            });

        } catch (err) {
            console.error("Erro ao carregar progresso:", err);
        }
    }

async function iniciarModulo(moduloId) {
    try {
        const token = localStorage.getItem("token_colaborador");
        if (!token || !moduloId) return;

        const res = await fetch(`/colaborador/progresso/iniciar/${moduloId}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (res.ok) {
            // 🔄 atualiza painel depois de iniciar
            carregarProgresso();
        }

    } catch (err) {
        console.error("Erro ao iniciar módulo:", err);
    }
}


    /* ================== INIT ================== */
    await carregarModulos();
    await atualizarImagensModulos();

});
