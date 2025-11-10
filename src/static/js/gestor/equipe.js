document.addEventListener("DOMContentLoaded", () => {
  const usuarioGestor = JSON.parse(localStorage.getItem("usuario_gestor"));
  const token = localStorage.getItem("token_gestor");
  const baseURL = "http://127.0.0.1:5000/colaborador";

  if (!usuarioGestor || !usuarioGestor.id) {
    alert("Sessão expirada ou usuário não identificado.");
    window.location.href = "/src/templates/auth/login.html";
    return;
  }

  // ====== Exibir nome do gestor no header ======
  const headerNome = document.getElementById("user-name");
  if (headerNome) {
    headerNome.textContent = `Olá, ${usuarioGestor.nome}`;
  }

 
  // ====== Função para carregar equipe ======
  async function carregarEquipe() {
    try {
      const res = await fetch(`${baseURL}/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        console.error(data.error || "Erro ao carregar equipe");
        return;
      }

      const colaboradores = await res.json(); // lista completa do backend
      const lista = document.getElementById("lista-equipe");
      if (!lista) return;
      lista.innerHTML = "";

      colaboradores.forEach((colaborador) => {
        const card = document.createElement("div");
        card.classList.add("card-colaborador");

        const foto = colaborador.foto || "/src/static/img/foto.png";
        const status = colaborador.status?.toLowerCase() || "offline";
        const statusClass = status === "online" ? "online" : "offline";

        card.innerHTML = `
          <div class="info-colaborador">
            <div class="dados">
              <p><strong>${colaborador.nome}</strong></p>
              <p>${colaborador.re || "Sem RE"}</p>
              <p>${colaborador.email || "Sem e-mail"}</p>
            </div>
          </div>
        `;

        lista.appendChild(card);
      });
    } catch (err) {
      console.error("Erro ao conectar com o servidor:", err);
    }
  }

  // ====== Atualização em tempo real + heartbeat ======
  carregarEquipe();
  setInterval(() => {
    carregarEquipe();
    heartbeat();
  }, 10000);

  // ====== Filtro de status ======
  const filtroStatus = document.getElementById("filtro-status");
  if (filtroStatus) {
    filtroStatus.addEventListener("change", (e) => {
      const valor = e.target.value.toLowerCase();
      const cards = document.querySelectorAll(".card-colaborador");
      cards.forEach((card) => {
        const status = card.querySelector(".status").textContent.toLowerCase();
        card.style.display =
          valor === "todos" || status === valor ? "flex" : "none";
      });
    });
  }

  // ====== Busca de colaborador ======
  const searchInput = document.querySelector(".search-bar input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const termo = e.target.value.toLowerCase();
      const cards = document.querySelectorAll(".card-colaborador");
      cards.forEach((card) => {
        const nome = card.querySelector(".dados p strong").textContent.toLowerCase();
        const re = card.querySelector(".dados p:nth-child(2)").textContent.toLowerCase();
        card.style.display =
          nome.includes(termo) || re.includes(termo) ? "flex" : "none";
      });
    });
  }

  // ====== Botão "Ver tudo" ======
  const btnVerTudo = document.getElementById("btn-ver-tudo");
  if (btnVerTudo) {
    btnVerTudo.addEventListener("click", carregarEquipe);
  }
});
