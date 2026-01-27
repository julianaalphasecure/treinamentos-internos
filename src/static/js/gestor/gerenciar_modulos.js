const modulosContainer = document.getElementById("modulosContainer");
const btnNovoModulo = document.getElementById("btnNovoModulo");


const modal = document.getElementById("modalNovoModulo");
const closeModal = document.getElementById("closeModal");
const btnCriarModulo = document.getElementById("btnCriarModulo");
const inputTituloModulo = document.getElementById("inputTituloModulo");
const inputDescricaoModulo = document.getElementById("inputDescricaoModulo");
const inputImagemCapa = document.getElementById("inputImagemCapa");
const previewCapa = document.getElementById("previewCapa");


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
            if (!m.ativo) {
    card.classList.add("oculto");
}


card.innerHTML = `
    <div class="modulo-capa">
    ${
        m.imagem_capa
        ? `<img src="${m.imagem_capa}" alt="Capa do módulo" />`
        : `<div class="sem-imagem">Sem imagem</div>`
    }

    <label class="btn-capa">
        Alterar capa
        <input 
            type="file"
            accept="image/png, image/jpeg, image/webp"
            hidden
            onchange="alterarCapaModulo(${m.id}, this.files[0])"
        />
    </label>
</div>


    <h3>${m.titulo}</h3>
    <p>${m.descricao || "Sem descrição."}</p>

    <div class="modulo-footer">
    <button class="btn-editar" onclick="editarModulo(${m.id})">Gerenciar</button>

    <button 
        class="btn-ocultar"
        onclick="toggleVisibilidade(${m.id})"
        style="background: ${m.ativo ? '#f39c12' : '#27ae60'}"
    >
        ${m.ativo ? "Ocultar" : "Mostrar"}
    </button>

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
inputImagemCapa.addEventListener("change", () => {
    const file = inputImagemCapa.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
        previewCapa.src = e.target.result;
        previewCapa.style.display = "block";
    };
    reader.readAsDataURL(file);
});
async function toggleVisibilidade(id) {
    try {
        const res = await fetch(`${MODULOS_API}/${id}/toggle-visibilidade`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${getToken()}`
            }
        });

        if (!res.ok) throw new Error("Erro ao alterar visibilidade");

        await carregarModulos(); 

    } catch (err) {
        console.error(err);
        alert("Erro ao ocultar/mostrar módulo.");
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
    const imagem = inputImagemCapa.files[0];

    if (!titulo) {
        alert("Digite o título do módulo.");
        return;
    }

    const formData = new FormData();
    formData.append("titulo", titulo);
    formData.append("nome", titulo);
    formData.append("descricao", descricao);

    if (imagem) {
        formData.append("imagem", imagem);
    }

    try {
        const res = await fetch(MODULOS_API, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${getToken()}`
            },
            body: formData
        });

        if (!res.ok) throw new Error("Erro ao criar módulo");

        modal.style.display = "none";
        inputImagemCapa.value = "";
        previewCapa.style.display = "none";

        await carregarModulos();

    } catch (err) {
        console.error(err);
        alert("Erro ao criar módulo.");
    }
});

async function alterarCapaModulo(moduloId, file) {
    if (!file) return;

    const formData = new FormData();
    formData.append("imagem", file);

    try {
        const res = await fetch(`${MODULOS_API}/${moduloId}/capa`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${getToken()}`
            },
            body: formData
        });

        if (!res.ok) throw new Error("Erro ao atualizar capa");

        const data = await res.json();


        const img = document.querySelector(
            `.modulo-card img[src*="modulo_${moduloId}"]`
        );

        if (img) {
            img.src = data.imagem_capa + "?t=" + Date.now();
        }

    } catch (err) {
        console.error(err);
        alert("Erro ao atualizar imagem de capa.");
    }
}


// ======== INICIALIZAÇÃO ========
document.addEventListener("DOMContentLoaded", carregarModulos);
