// ======== ELEMENTOS ========
const modulosContainer = document.getElementById("modulosContainer");
const btnNovoModulo = document.getElementById("btnNovoModulo");

// Modal para criar módulo
const modal = document.getElementById("modalNovoModulo");
const closeModal = document.getElementById("closeModal");
const btnCriarModulo = document.getElementById("btnCriarModulo");
const inputTituloModulo = document.getElementById("inputTituloModulo");
const inputDescricaoModulo = document.getElementById("inputDescricaoModulo");

// ======== CONSTANTES ========
const BASE_URL = "http://127.0.0.1:5000";
const MODULOS_API = `${BASE_URL}/gestor/api/modulos`;

function getToken() {
    return localStorage.getItem("token_gestor");
}

// ======== FUNÇÃO CARREGAR MÓDULOS ========
async function carregarModulos() {
    try {
        const response = await fetch(MODULOS_API, {
            headers: { "Authorization": `Bearer ${getToken()}` }
        });

        if (!response.ok) throw new Error("Erro ao buscar módulos");

        const modulos = await response.json();
        modulosContainer.innerHTML = "";

        if (!modulos || modulos.length === 0) {
            modulosContainer.innerHTML = "<p>Nenhum módulo cadastrado.</p>";
            return;
        }

        modulos.forEach(m => {
            const card = document.createElement("div");
            card.classList.add("modulo-card");

            card.innerHTML = `
                <h3>${m.titulo}</h3>
                <p>${m.descricao || "Sem descrição."}</p>

                <div class="modulo-footer">
                    <button class="btn-editar" onclick="editarModulo(${m.id})">Gerenciar</button>
                    <button class="btn-remover" onclick="removerModulo(${m.id})">Remover</button>
                </div>
            `;

            modulosContainer.appendChild(card);
        });

    } catch (err) {
        console.error(err);
        modulosContainer.innerHTML = "<p>Erro ao carregar módulos.</p>";
    }
}

// ======== FUNÇÃO EDITAR ========
function editarModulo(id) {
    window.location.href = `/gestor/modulo/${id}/editar`;
}


async function removerModulo(id) {
    if (!confirm("Tem certeza que deseja remover este módulo?")) return;

    try {
        const response = await fetch(`${MODULOS_API}/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${getToken()}` }
        });

        if (!response.ok) throw new Error("Erro ao remover módulo");
        await carregarModulos();

    } catch (err) {
        console.error(err);
        alert("Erro ao remover módulo.");
    }
}

// ======== MODAL - ABRIR E FECHAR ========
btnNovoModulo.addEventListener("click", () => {
    modal.style.display = "block";
    inputTituloModulo.value = "";
    inputDescricaoModulo.value = "";
    inputTituloModulo.focus();
});

closeModal.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });

// ======== CRIAR MÓDULO ========
btnCriarModulo.addEventListener("click", async () => {
    const titulo = inputTituloModulo.value.trim();
    const descricao = inputDescricaoModulo.value.trim();

    if (!titulo) {
        alert("Digite o título do módulo.");
        return;
    }

    try {
        const res = await fetch(MODULOS_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getToken()}`
            },
            body: JSON.stringify({ titulo, nome: titulo, descricao })
        });

        if (!res.ok) throw new Error("Erro ao criar módulo");

        modal.style.display = "none";
        await carregarModulos();

    } catch (err) {
        console.error(err);
        alert("Erro ao criar módulo.");
    }
});

// ======== INICIALIZAÇÃO ========
document.addEventListener("DOMContentLoaded", carregarModulos);
