// ====== Verificar tipo de acesso ======
const usuarioLogado = JSON.parse(localStorage.getItem("usuario_gestor"));
const usuarioId = usuarioLogado ? usuarioLogado.id : null;

if (!usuarioLogado || usuarioLogado.tipo_acesso !== "gestor") {
  alert("Acesso restrito à área do gestor.");
  window.location.href = "/src/templates/auth/login.html";
}

const modalPerfil = document.getElementById("modal-perfil");
const btnEditar = document.querySelector(".btn-editar");
const spanFecharPerfil = document.getElementById("close-perfil");
const formPerfil = document.getElementById("form-perfil");

const baseURL = "http://127.0.0.1:5000/usuario";
const pageFeedback = document.getElementById("perfil-feedback");
const modalFeedback = document.getElementById("modal-feedback");

// ====== Verificar login ======
if (!usuarioId) {
  pageFeedback.textContent = "Usuário não identificado. Faça login novamente.";
  pageFeedback.classList.add("error");
  pageFeedback.style.display = "block";
  setTimeout(() => window.location.href = "/src/templates/auth/login.html", 1500);
}

// ====== Carregar perfil ======
let usuarioEmail = "";
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
    pageFeedback.textContent = "Erro de conexão com o servidor";
    pageFeedback.classList.add("error");
    pageFeedback.style.display = "block";
  }
}

carregarPerfil();

// ====== Abrir e fechar modal ======
btnEditar.onclick = () => modalPerfil.style.display = "flex";
spanFecharPerfil.onclick = () => modalPerfil.style.display = "none";
window.onclick = (e) => { if (e.target === modalPerfil) modalPerfil.style.display = "none"; };

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
  if (fotoFile) formData.append("foto", fotoFile);

  try {
    const res = await fetch(`${baseURL}/${usuarioId}`, { method: "PUT", body: formData });
    const result = await res.json();

    if (res.ok) {
      feedback.textContent = "Perfil atualizado com sucesso!";
      feedback.classList.add("success");
      feedback.style.display = "block";
      modalPerfil.style.display = "none";
      carregarPerfil();

      // Atualiza localStorage do gestor
      const usuarioAtualizado = { ...usuarioLogado, ...Object.fromEntries(formData) };
      localStorage.setItem("usuario_gestor", JSON.stringify(usuarioAtualizado));
      localStorage.setItem("nomeUsuario", usuarioAtualizado.nome);

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
