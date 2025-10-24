const modalPerfil = document.getElementById("modal-perfil");
const btnEditar = document.querySelector(".btn-editar");
const spanFecharPerfil = document.getElementById("close-perfil");
const formPerfil = document.getElementById("form-perfil");
const pageFeedback = document.getElementById("perfil-feedback");
const modalFeedback = document.getElementById("modal-feedback");
const formSenha = document.getElementById("form-alterar-senha");
const feedbackSenha = document.getElementById("feedback-senha");


const baseURL = "http://127.0.0.1:5000/auth/usuario";
const usuarioId = localStorage.getItem("usuario_id");
let usuarioEmail = "";


if (!usuarioId) {
  pageFeedback.textContent = "Usuário não identificado. Faça login novamente.";
  pageFeedback.classList.add("error");
  pageFeedback.style.display = "block";
  setTimeout(() => window.location.href = "/src/templates/auth/login.html", 1500);
}


async function carregarPerfil() {
  try {
    const res = await fetch(`${baseURL}/${usuarioId}`);
    if (!res.ok) throw new Error("Erro ao carregar perfil");

    const data = await res.json();
    const usuario = data.usuario || data;

    usuarioEmail = usuario.email || "";

    document.getElementById("perfil-nome").innerText = usuario.nome || "Sem nome";
    document.getElementById("perfil-nome-completo").innerText = usuario.nome || "-";
    document.getElementById("perfil-email").innerText = usuario.email || "-";
    document.getElementById("perfil-telefone").innerText = usuario.telefone || "-";
    document.getElementById("perfil-departamento").innerText = usuario.departamento || "-";
    document.getElementById("perfil-re").innerText = usuario.re || "-";
    document.getElementById("foto-perfil").src = usuario.foto || "/src/static/img/foto.png";

    document.getElementById("input-nome").value = usuario.nome || "";
    document.getElementById("input-email").value = usuario.email || "";
    document.getElementById("input-telefone").value = usuario.telefone || "";
    document.getElementById("input-departamento").value = usuario.departamento || "";

    const labelEmail = document.querySelector(".config-section ul li:first-child label");
    if(labelEmail) labelEmail.textContent = `Por e-mail (${usuarioEmail})`;

  } catch (error) {
    console.error(error);
    pageFeedback.textContent = "Erro de conexão com o servidor ou usuário não encontrado.";
    pageFeedback.classList.add("error");
    pageFeedback.style.display = "block";
  }
}

carregarPerfil();


btnEditar.onclick = () => modalPerfil.style.display = "flex";
spanFecharPerfil.onclick = () => modalPerfil.style.display = "none";
window.onclick = (e) => { if (e.target === modalPerfil) modalPerfil.style.display = "none"; };


document.getElementById("input-foto").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if(file) {
    const reader = new FileReader();
    reader.onload = (ev) => document.getElementById("foto-perfil").src = ev.target.result;
    reader.readAsDataURL(file);
  }
});


formPerfil.onsubmit = async (e) => {
  e.preventDefault();
  modalFeedback.style.display = "none";
  modalFeedback.classList.remove("error", "success");

  const formData = new FormData();
  formData.append("nome", document.getElementById("input-nome").value);
  formData.append("email", document.getElementById("input-email").value);
  formData.append("telefone", document.getElementById("input-telefone").value);
  formData.append("departamento", document.getElementById("input-departamento").value);

  const fotoFile = document.getElementById("input-foto").files[0];
  if(fotoFile) formData.append("foto", fotoFile);

  try {
    const res = await fetch(`${baseURL}/${usuarioId}`, { method: "PUT", body: formData });
    const result = await res.json();

    if(res.ok) {
      modalFeedback.textContent = "Perfil atualizado com sucesso!";
      modalFeedback.classList.add("success");
      modalFeedback.style.display = "block";
      modalPerfil.style.display = "none";
      carregarPerfil();
    } else {
      modalFeedback.textContent = result.error || "Erro ao atualizar perfil";
      modalFeedback.classList.add("error");
      modalFeedback.style.display = "block";
    }
  } catch(err) {
    console.error(err);
    modalFeedback.textContent = "Erro de conexão com o servidor";
    modalFeedback.classList.add("error");
    modalFeedback.style.display = "block";
  }
};


formSenha.onsubmit = async (e) => {
  e.preventDefault();
  feedbackSenha.style.display = "none";
  feedbackSenha.classList.remove("error", "success");

  const senhaAtual = document.getElementById("senha-atual").value;
  const novaSenha = document.getElementById("nova-senha").value;
  const confirmaSenha = document.getElementById("confirma-senha").value;

  if(novaSenha !== confirmaSenha) {
    feedbackSenha.textContent = "As senhas não coincidem!";
    feedbackSenha.classList.add("error");
    feedbackSenha.style.display = "block";
    return;
  }

  try {
    const res = await fetch(`${baseURL}/${usuarioId}/alterar-senha`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senha_atual: senhaAtual, nova_senha: novaSenha })
    });

    const data = await res.json();
    if(res.ok) {
      feedbackSenha.textContent = "Senha alterada com sucesso!";
      feedbackSenha.classList.add("success");
      feedbackSenha.style.display = "block";
      formSenha.reset();
    } else {
      feedbackSenha.textContent = data.error || "Erro ao alterar senha";
      feedbackSenha.classList.add("error");
      feedbackSenha.style.display = "block";
    }
  } catch(err) {
    console.error(err);
    feedbackSenha.textContent = "Erro de conexão com o servidor";
    feedbackSenha.classList.add("error");
    feedbackSenha.style.display = "block";
  }
};


const toggleEmail = document.querySelector("#toggle-email");
const togglePush = document.querySelector("#toggle-push");

function atualizarNotificacao(tipo, status) {
  fetch(`${baseURL}/${usuarioId}/notificacoes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tipo, status, email: usuarioEmail })
  })
  .then(res => res.json())
  .then(data => console.log("Preferência atualizada:", data))
  .catch(err => console.error("Erro ao atualizar notificação:", err));
}

if(toggleEmail) toggleEmail.addEventListener("change", function(){ atualizarNotificacao("email", this.checked); });
if(togglePush) togglePush.addEventListener("change", function(){ atualizarNotificacao("push", this.checked); });
