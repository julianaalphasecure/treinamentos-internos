const slidesContainer = document.getElementById("slidesContainer");
const exerciciosContainer = document.getElementById("exerciciosContainer");

const tituloTexto = document.getElementById("tituloModulo");
const inputTitulo = document.getElementById("inputTitulo");
const btnEditarTitulo = document.getElementById("btnEditarTitulo");
const editarTituloBox = document.getElementById("editarTituloBox");
const btnConfirmarTitulo = document.getElementById("btnConfirmarTitulo");
const btnCancelarTitulo = document.getElementById("btnCancelarTitulo");
const btnSalvar = document.getElementById("btnSalvar");

const inputImagemSlide = document.getElementById("imagemSlide");
const selectModoSlide = document.getElementById("modoSlide");
const btnAdicionarExercicio = document.getElementById("btnAdicionarExercicio");

const moduloId = window.location.pathname.split("/")[3];
const BASE_URL = "http://localhost:5000/gestor";
const FILES_URL = "http://localhost:5000";

let TODOS_EXERCICIOS = []; 
let TOKEN = null;
let TODOS_SLIDES = []; 


async function carregarModulo() {
    const token = localStorage.getItem("token_gestor");

    if (!token || token === "undefined" || token === "null") {
        window.location.href = "/auth/login";
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/api/modulo/${moduloId}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (res.status === 401) {
            alert("Sessão expirada. Faça login novamente.");
            localStorage.clear();
            window.location.href = "/auth/login";
            return;
        }

        if (!res.ok) {
            throw new Error("Erro ao carregar módulo");
        }

        const modulo = await res.json();

        tituloTexto.textContent = modulo.titulo;
        inputTitulo.value = modulo.titulo;

        TODOS_SLIDES = modulo.slides || []; 
        filtrarEShowSlides();    
        
        TODOS_EXERCICIOS = modulo.exercicios || [];
        renderExercicios(TODOS_EXERCICIOS);

        renderExercicios(modulo.exercicios || []);

    } catch (err) {
        console.error(err);
        alert("Erro ao carregar dados do módulo");
    }
}

// ==============================
// FILTRO DE SLIDES POR MODO
// ==============================
function filtrarEShowSlides() {
    const modoSelecionado = selectModoSlide.value;

    const slidesFiltrados = TODOS_SLIDES.filter(
        slide => slide.modo === modoSelecionado
    );

    renderSlides(slidesFiltrados);
}

// 🔹 quando troca Normal / Dark
selectModoSlide.addEventListener("change", filtrarEShowSlides);

// ==============================
// RENDER SLIDES
// ==============================
function renderSlides(slides) {
    slidesContainer.innerHTML = "";

    slides.forEach(slide => {
        const div = document.createElement("div");
        div.className = "slide-card";

        div.innerHTML = `
        <img src="${FILES_URL}${slide.imagem_url}" 
        class="slide-img"
        onclick="abrirPreviewSlide('${FILES_URL}${slide.imagem_url}')">

            <div class="slide-info">
                <span class="slide-badge">${slide.modo}</span>
                <button class="slide-delete" onclick="removerSlide(${slide.id})">×</button>
            </div>
        `;

        slidesContainer.appendChild(div);
    });

    // card +
    const addCard = document.createElement("div");
    addCard.className = "add-slide";
    addCard.innerHTML = `
        <span>+</span>
        <p>Adicionar slide</p>
    `;

    addCard.onclick = () => {
        inputImagemSlide.click();
    };

    slidesContainer.appendChild(addCard);
}


function renderExercicios(exercicios) {
    exerciciosContainer.innerHTML = "";

    if (exercicios.length === 0) {
        exerciciosContainer.innerHTML = "<p>Nenhum exercício cadastrado.</p>";
        return;
    }

    exercicios.forEach((ex, index) => {
        const div = document.createElement("div");
        div.className = "exercicio-view";

        div.innerHTML = `
            <div class="exercicio-header">
                <span class="numero">${index + 1})</span>
                <span class="enunciado-texto">${ex.enunciado}</span>
            </div>

            <ul class="alternativas-view">
                ${renderAlternativa("A", ex.alternativa_a, ex.correta)}
                ${renderAlternativa("B", ex.alternativa_b, ex.correta)}
                ${renderAlternativa("C", ex.alternativa_c, ex.correta)}
                ${renderAlternativa("D", ex.alternativa_d, ex.correta)}
            </ul>

            <div class="acoes-exercicio">
                <button onclick="removerExercicio(${ex.id})">🗑️ Remover</button>
            </div>
        `;

        exerciciosContainer.appendChild(div);
    });
}

function renderAlternativa(letra, texto, correta) {
    const marcada = letra === correta ? "correta" : "";
    return `<li class="${marcada}">(${letra}) ${texto}</li>`;
}


btnAdicionarExercicio.addEventListener("click", () => {
    // evita abrir vários formulários
    if (document.querySelector(".exercicio-form")) return;

    const div = document.createElement("div");
    div.className = "exercicio-form";

    div.innerHTML = `
        <textarea class="enunciado" placeholder="Digite o enunciado"></textarea>

        <div class="alternativas-form">
            <label><input type="radio" name="correta" value="A"> A</label>
            <input type="text" class="alt-a" placeholder="Alternativa A">

            <label><input type="radio" name="correta" value="B"> B</label>
            <input type="text" class="alt-b" placeholder="Alternativa B">

            <label><input type="radio" name="correta" value="C"> C</label>
            <input type="text" class="alt-c" placeholder="Alternativa C">

            <label><input type="radio" name="correta" value="D"> D</label>
            <input type="text" class="alt-d" placeholder="Alternativa D">
        </div>

        <div class="acoes-exercicio">
            <button class="btn-salvar">Salvar</button>
            <button class="btn-cancelar">Cancelar</button>
        </div>

        <div class="feedback-exercicio"></div>
    `;

    exerciciosContainer.prepend(div);

    div.querySelector(".btn-cancelar").onclick = () => div.remove();

    div.querySelector(".btn-salvar").onclick = async () => {
        const enunciado = div.querySelector(".enunciado").value.trim();
        const altA = div.querySelector(".alt-a").value.trim();
        const altB = div.querySelector(".alt-b").value.trim();
        const altC = div.querySelector(".alt-c").value.trim();
        const altD = div.querySelector(".alt-d").value.trim();
        const correta = div.querySelector("input[name='correta']:checked")?.value;
        const feedback = div.querySelector(".feedback-exercicio");

        if (!enunciado || !altA || !altB || !altC || !altD || !correta) {
            showFeedback("Preencha tudo e marque a correta.", "erro", feedback);
            return;
        }

        try {
            const res = await fetch(`${BASE_URL}/api/modulos/${moduloId}/exercicios`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${TOKEN}`
                },
                body: JSON.stringify({
                    enunciado,
                    alternativa_a: altA,
                    alternativa_b: altB,
                    alternativa_c: altC,
                    alternativa_d: altD,
                    correta
                })
            });

            if (!res.ok) throw new Error();

            const novo = await res.json();
            TODOS_EXERCICIOS.push(novo);
            renderExercicios(TODOS_EXERCICIOS);

        } catch {
            showFeedback("Erro ao salvar exercício.", "erro", feedback);
        }
    };
});



async function salvarExercicio(exercicioId, div) {
    const enunciado = div.querySelector(".enunciado").value.trim();
    const altA = div.querySelector(".alt-a").value.trim();
    const altB = div.querySelector(".alt-b").value.trim();
    const altC = div.querySelector(".alt-c").value.trim();
    const altD = div.querySelector(".alt-d").value.trim();
    const correta = div.querySelector(".correta").value;

    const feedbackDiv = div.querySelector(".feedback-exercicio");
    feedbackDiv.className = "feedback-exercicio"; // reset

    if (!enunciado) {
        feedbackDiv.textContent = "O enunciado não pode ficar vazio.";
        feedbackDiv.classList.add("erro");
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/api/exercicios/${exercicioId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${TOKEN}`
            },
            body: JSON.stringify({
                enunciado,
                alternativa_a: altA,
                alternativa_b: altB,
                alternativa_c: altC,
                alternativa_d: altD,
                correta
            })
        });

        if (!res.ok) throw new Error("Erro ao salvar exercício");

        feedbackDiv.textContent = "Exercício salvo com sucesso!";
        feedbackDiv.classList.add("sucesso");

        // Atualiza lista sem precisar recarregar toda a página
        const index = TODOS_EXERCICIOS.findIndex(e => e.id === exercicioId);
        if (index !== -1) {
            TODOS_EXERCICIOS[index] = { id: exercicioId, enunciado, alternativa_a: altA, alternativa_b: altB, alternativa_c: altC, alternativa_d: altD, correta };
        }

    } catch (err) {
        console.error(err);
        feedbackDiv.textContent = "Erro ao salvar exercício!";
        feedbackDiv.classList.add("erro");
    }
}


async function removerExercicio(exercicioId) {
    // substitui confirm
    const confirmar = confirm("Deseja remover este exercício?");
    if (!confirmar) return;

    try {
        const res = await fetch(`${BASE_URL}/api/exercicios/${exercicioId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${TOKEN}` }
        });

        if (!res.ok) throw new Error("Erro ao remover exercício");

        TODOS_EXERCICIOS = TODOS_EXERCICIOS.filter(e => e.id !== exercicioId);
        renderExercicios(TODOS_EXERCICIOS);

    } catch(err) {
        console.error(err);
        showFeedback("Erro ao remover exercício", "erro");
    }
}

// ==============================
// Ajuste geral: carregarModulo
// ==============================
async function carregarModulo() {
    const token = localStorage.getItem("token_gestor");

    if (!token || token === "undefined" || token === "null") {
        window.location.href = "/auth/login";
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/api/modulo/${moduloId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.status === 401) {
            showFeedback("Sessão expirada. Faça login novamente.", "erro");
            localStorage.clear();
            window.location.href = "/auth/login";
            return;
        }

        if (!res.ok) throw new Error("Erro ao carregar módulo");

        const modulo = await res.json();

        tituloTexto.textContent = modulo.titulo;
        inputTitulo.value = modulo.titulo;

        TODOS_SLIDES = modulo.slides || [];
        filtrarEShowSlides();

        TODOS_EXERCICIOS = modulo.exercicios || [];
        renderExercicios(TODOS_EXERCICIOS);

    } catch (err) {
        console.error(err);
        showFeedback("Erro ao carregar dados do módulo", "erro");
    }
}




// ==============================
// REMOVER SLIDE
// ==============================
async function removerSlide(id) {
    if (!confirm("Deseja remover este slide?")) return;

    try {
        const res = await fetch(`${BASE_URL}/api/slides/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${TOKEN}`
            }
        });

        if (!res.ok) {
            throw new Error("Erro ao remover slide");
        }

        await carregarModulo();

    } catch (err) {
        console.error(err);
        alert("Erro ao remover slide");
    }
}

// ==============================
// UPLOAD SLIDE
// ==============================
inputImagemSlide.addEventListener("change", async () => {
    const file = inputImagemSlide.files[0];
    const modo = selectModoSlide.value; // 🔹 usa o modo atual

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("modo", modo);

    try {
        const res = await fetch(
            `${BASE_URL}/api/modulos/${moduloId}/slides/upload`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${TOKEN}`
                },
                body: formData
            }
        );

        if (!res.ok) {
            throw new Error("Erro ao enviar slide");
        }

        await carregarModulo();
        inputImagemSlide.value = "";

    } catch (err) {
        console.error(err);
        alert("Erro ao adicionar slide");
    }
});


document.addEventListener("DOMContentLoaded", () => {
    TOKEN = localStorage.getItem("token_gestor");
    carregarModulo();
});
btnSalvar.addEventListener("click", () => {
    btnSalvar.disabled = true;
    const textoOriginal = btnSalvar.textContent;

    btnSalvar.textContent = "Salvando...";

    setTimeout(() => {
        btnSalvar.textContent = "Alterações salvas ✓";
        btnSalvar.classList.add("salvo");

        setTimeout(() => {
            btnSalvar.textContent = textoOriginal;
            btnSalvar.classList.remove("salvo");
            btnSalvar.disabled = false;
        }, 2000);
    }, 600);
});
// Função para mostrar feedback dentro do card ou container
function showFeedback(message, tipo = "erro", divPai = null, tempo = 3000) {
    const feedback = document.createElement("div");
    feedback.className = `feedback-message ${tipo}`; // classe para estilizar
    feedback.textContent = message;

    if (divPai) {
        divPai.appendChild(feedback);
    } else {
        // se não passar divPai, mostra no topo da página
        document.body.prepend(feedback);
    }

    setTimeout(() => feedback.remove(), tempo);
}

function abrirPreviewSlide(src) {
    let modal = document.getElementById("slidePreviewModal");

    if (!modal) {
        modal = document.createElement("div");
        modal.id = "slidePreviewModal";
        modal.innerHTML = `
            <div class="slide-preview-backdrop" onclick="fecharPreviewSlide()">
                <div class="slide-preview-content" onclick="event.stopPropagation()">
                    <button class="slide-preview-close" onclick="fecharPreviewSlide()">×</button>
                    <img id="slidePreviewImg" src="">
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    document.getElementById("slidePreviewImg").src = src;
    modal.classList.add("open");

    document.addEventListener("keydown", escListener);
}

function fecharPreviewSlide() {
    const modal = document.getElementById("slidePreviewModal");
    if (modal) modal.classList.remove("open");
    document.removeEventListener("keydown", escListener);
}

function escListener(e) {
    if (e.key === "Escape") {
        fecharPreviewSlide();
    }
}

const btnVoltar = document.getElementById("btnVoltar");

btnVoltar.addEventListener("click", () => {
    window.history.back();
});
