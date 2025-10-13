const modalPerfil = document.getElementById("modal-perfil");
const modalSenha = document.getElementById("modal-senha");
const btnEditar = document.querySelector(".btn-editar");
const btnSenha = document.querySelector(".btn-senha");
const spanFecharPerfil = document.getElementById("close-perfil");
const spanFecharSenha = document.getElementById("close-senha");
const formPerfil = document.getElementById("form-perfil");
const formSenha = document.getElementById("form-senha");

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

// ====== Abrir modais ======
btnEditar.onclick = () => modalPerfil.style.display = "flex";
btnSenha.onclick = () => modalSenha.style.display = "flex";

// ====== Fechar modais ======
spanFecharPerfil.onclick = () => modalPerfil.style.display = "none";
spanFecharSenha.onclick = () => modalSenha.style.display = "none";
window.onclick = (e) => {
  if (e.target === modalPerfil) modalPerfil.style.display = "none";
  if (e.target === modalSenha) modalSenha.style.display = "none";
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

// ====== Alterar senha ======
formSenha.onsubmit = async (e) => {
  e.preventDefault();
  const feedback = document.getElementById("modal-senha-feedback");

  const senhaAtual = document.getElementById("senha-atual").value;
  const novaSenha = document.getElementById("nova-senha").value;
  const confirmarSenha = document.getElementById("confirmar-senha").value;

  if (novaSenha !== confirmarSenha) {
    feedback.textContent = "As senhas não coincidem!";
    feedback.classList.add("error");
    feedback.style.display = "block";
    return;
  }

  try {
    const res = await fetch(`http://127.0.0.1:5000/colaborador/alterar-senha/${usuarioId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senha_atual: senhaAtual, nova_senha: novaSenha })
    });
    const result = await res.json();

    if (res.ok) {
      feedback.textContent = "Senha alterada com sucesso!";
      feedback.classList.add("success");
      feedback.style.display = "block";
      modalSenha.style.display = "none";
    } else {
      feedback.textContent = result.error || "Erro ao alterar senha";
      feedback.classList.add("error");
      feedback.style.display = "block";
    }
  } catch (err) {
    feedback.textContent = "Erro de conexão com o servidor";
    feedback.classList.add("error");
    feedback.style.display = "block";
  }
};
