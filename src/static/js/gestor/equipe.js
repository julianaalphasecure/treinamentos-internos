document.addEventListener("DOMContentLoaded", () => {
  const baseURL = "http://127.0.0.1:5000/colaborador/perfil";

  // ====== Verificar login ======
  const usuarioId = localStorage.getItem("usuario_id");
  const usuario = JSON.parse(localStorage.getItem("usuario_logado"));

  if (!usuario || !usuarioId) {
    alert("Usuário não identificado. Faça login novamente.");
    window.location.href = "/src/templates/auth/login.html";
    return;
  }

  // ====== Exibir nome do gestor no header ======
  const headerNome = document.getElementById("user-name");
  if (headerNome) {
    console.log("Nome do usuário logado:", usuario.nome); // debug
    headerNome.textContent = `Olá, ${usuario.nome}`;
  } else {
    console.error("Elemento #user-name não encontrado no DOM");
  }

  // ====== Função para carregar equipe ======
  async function carregarEquipe() {
    try {
      const res = await fetch(`${baseURL}/`);
      const data = await res.json();

      if (!res.ok) {
        console.error(data.error || "Erro ao carregar equipe");
        return;
      }

      const lista = document.getElementById("lista-equipe");
      lista.innerHTML = "";

      data.forEach((colaborador) => {
        const card = document.createElement("div");
        card.classList.add("card-colaborador");

        const foto = colaborador.foto || "/src/static/img/foto.png";
        const statusAleatorio = Math.random() > 0.5 ? "Online" : "Offline";

        card.innerHTML = `
          <div class="info-colaborador">
            <img src="${foto}" alt="${colaborador.nome}" />
            <div class="dados">
              <p><strong>${colaborador.nome}</strong></p>
              <p>${colaborador.re}</p>
              <p>${colaborador.email}</p>
            </div>
          </div>
          <span class="status ${statusAleatorio === "Offline" ? "offline" : ""}">
            ${statusAleatorio}
          </span>
        `;

        lista.appendChild(card);
      });
    } catch (err) {
      console.error("Erro ao conectar com o servidor:", err);
    }
  }

  // ====== Filtro de status ======
  const filtroStatus = document.getElementById("filtro-status");
  if (filtroStatus) {
    filtroStatus.addEventListener("change", (e) => {
      const valor = e.target.value.toLowerCase();
      const cards = document.querySelectorAll(".card-colaborador");

      cards.forEach((card) => {
        const status = card.querySelector(".status").textContent.toLowerCase();
        card.style.display = valor === "todos" || status === valor ? "flex" : "none";
      });
    });
  }

  // ====== Buscar colaborador ======
  const searchInput = document.querySelector(".search-bar input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const termo = e.target.value.toLowerCase();
      const cards = document.querySelectorAll(".card-colaborador");

      cards.forEach((card) => {
        const nome = card.querySelector(".dados p strong").textContent.toLowerCase();
        const re = card.querySelector(".dados p:nth-child(2)").textContent.toLowerCase();
        card.style.display = nome.includes(termo) || re.includes(termo) ? "flex" : "none";
      });
    });
  }

  // ====== Botão "Ver tudo" ======
  const btnVerTudo = document.getElementById("btn-ver-tudo");
  if (btnVerTudo) {
    btnVerTudo.addEventListener("click", carregarEquipe);
  }

  // ====== Inicializar ======
  carregarEquipe();
});
