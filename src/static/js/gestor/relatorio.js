const listaFeedback = document.getElementById("lista-feedback");
const btnVerTodos = document.getElementById("btn-ver-todos-feedback");
const progressoMedioElem = document.getElementById("progresso-medio");
const taxaConclusaoElem = document.getElementById("taxa-conclusao");

const baseURL = "http://127.0.0.1:5000/colaborador/perfil"; // ajuste sua rota real

async function carregarFeedback() {
  try {
    const res = await fetch(`${baseURL}/`);
    const data = await res.json();

    if (!res.ok) {
      console.error(data.error || "Erro ao carregar colaboradores");
      return;
    }

    listaFeedback.innerHTML = "";

    let totalProgresso = 0;
    let concluido = 0;

    data.forEach((colaborador) => {
      // Simulação de progresso (ou pode vir da API)
      const progresso = colaborador.progresso || Math.floor(Math.random() * 101);
      totalProgresso += progresso;
      if (progresso >= 70) concluido++;

      const li = document.createElement("li");
      li.innerHTML = `
        <span>${colaborador.nome}</span>
        <span class="percentual">${progresso}%</span>
        <button title="Enviar Feedback">&#9993;</button>
      `;
      listaFeedback.appendChild(li);
    });

    // Atualiza resumo
    const media = Math.round(totalProgresso / data.length);
    const taxaConclusao = Math.round((concluido / data.length) * 100);

    progressoMedioElem.textContent = `${media}%`;
    taxaConclusaoElem.textContent = `${taxaConclusao}%`;

  } catch (err) {
    console.error("Erro ao conectar com o servidor:", err);
  }
}

// Botão ver todos
btnVerTodos.addEventListener("click", carregarFeedback);

// Inicializar
carregarFeedback();
