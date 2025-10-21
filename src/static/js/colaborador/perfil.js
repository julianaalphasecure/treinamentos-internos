const modalPerfil = document.getElementById("modal-perfil");
const btnEditar = document.querySelector(".btn-editar");
const spanFecharPerfil = document.getElementById("close-perfil");
const formPerfil = document.getElementById("form-perfil");

const baseURL = "http://127.0.0.1:5000/colaborador/perfil";
const usuarioId = localStorage.getItem("usuario_id");

const pageFeedback = document.getElementById("perfil-feedback");
const modalFeedback = document.getElementById("modal-feedback");

// ====== Verificar login ======
if (!usuarioId) {
  pageFeedback.textContent = "Usuário não identificado. Faça login novamente.";
  pageFeedback.classList.add("error");
  pageFeedback.style.display = "block";
  setTimeout(() => {
    window.location.href = "/src/templates/auth/login.html";
  }, 1500);
}

// ====== Carregar perfil ======
async function carregarPerfil() {
  try {
    const res = await fetch(`${baseURL}/${usuarioId}`);
    const data = await res.json();

    if (!res.ok) {
      pageFeedback.textContent = data.error || "Erro ao carregar perfil";
      pageFeedback.classList.add("error");
      pageFeedback.style.display = "block";
      return;
    }

    document.getElementById("perfil-nome").innerText = data.nome || "Sem nome";
    document.getElementById("perfil-nome-completo").innerText = data.nome || "-";
    document.getElementById("perfil-email").innerText = data.email || "-";
    document.getElementById("perfil-telefone").innerText = data.telefone || "-";
    document.getElementById("perfil-departamento").innerText = data.departamento || "-";
    document.getElementById("perfil-re").innerText = data.re || "-";
    document.getElementById("foto-perfil").src = data.foto || "/src/static/img/foto.png";

    document.getElementById("input-nome").value = data.nome || "";
    document.getElementById("input-email").value = data.email || "";
    document.getElementById("input-telefone").value = data.telefone || "";
    document.getElementById("input-departamento").value = data.departamento || "";

  } catch (error) {
    pageFeedback.textContent = "Erro de conexão com o servidor";
    pageFeedback.classList.add("error");
    pageFeedback.style.display = "block";
  }
}

carregarPerfil();

// ====== Abrir e fechar modal ======
btnEditar.onclick = () => modalPerfil.style.display = "flex";
spanFecharPerfil.onclick = () => modalPerfil.style.display = "none";

window.onclick = (e) => {
  if (e.target === modalPerfil) modalPerfil.style.display = "none";
};

// ====== Preview foto ======
document.getElementById("input-foto").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (ev) => document.getElementById("foto-perfil").src = ev.target.result;
    reader.readAsDataURL(file);
  }
});

// ====== Salvar perfil ======
formPerfil.onsubmit = async (e) => {
  e.preventDefault();
  const feedback = modalFeedback;

  const formData = new FormData();
  formData.append("nome", document.getElementById("input-nome").value);
  formData.append("email", document.getElementById("input-email").value);
  formData.append("telefone", document.getElementById("input-telefone").value);
  formData.append("departamento", document.getElementById("input-departamento").value);

  const fotoFile = document.getElementById("input-foto").files[0];
  if (fotoFile && fotoFile.size > 0) formData.append("foto", fotoFile);

  try {
    const res = await fetch(`${baseURL}/${usuarioId}`, {
      method: "PUT",
      body: formData
    });
    const result = await res.json();

    if (res.ok) {
      feedback.textContent = "Perfil atualizado com sucesso!";
      feedback.classList.add("success");
      feedback.style.display = "block";
      modalPerfil.style.display = "none";
      carregarPerfil();
    } else {
      feedback.textContent = result.error || "Erro ao atualizar perfil";
      feedback.classList.add("error");
      feedback.style.display = "block";
    }
  } catch (err) {
    feedback.textContent = "Erro de conexão com o servidor";
    feedback.classList.add("error");
    feedback.style.display = "block";
  }
};

document.addEventListener("DOMContentLoaded", () => {
  // Recupera preferências salvas
  const savedTheme = localStorage.getItem("theme") || "claro";
  const savedFont = localStorage.getItem("font-size") || "padrao";

  document.body.setAttribute("data-theme", savedTheme);
  document.body.setAttribute("data-font", savedFont);

  // Função para alterar tema
  window.setTheme = (theme) => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  };

  // Função para alterar tamanho da fonte
  window.setFontSize = (size) => {
    document.body.setAttribute("data-font", size);
    localStorage.setItem("font-size", size);
  };

  // Função para mostrar toast
  window.showToast = (msg, duration = 2500) => {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = msg;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 100);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, duration);
  };
});
