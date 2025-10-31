// ====== Verificar tipo de acesso ======
let usuarioLogado = JSON.parse(localStorage.getItem("usuario_colaborador"));
const usuarioId = usuarioLogado ? usuarioLogado.id : null;

if (!usuarioLogado || usuarioLogado.tipo_acesso !== "colaborador") {
  alert("Acesso restrito à área do colaborador.");
  window.location.href = "/src/templates/auth/login.html";
}

const modalPerfil = document.getElementById("modal-perfil");
const btnEditar = document.querySelector(".btn-editar");
const spanFecharPerfil = document.getElementById("close-perfil");
const formPerfil = document.getElementById("form-perfil");
const pageFeedback = document.getElementById("perfil-feedback");
const modalFeedback = document.getElementById("modal-feedback");

const baseURL = "http://127.0.0.1:5000/auth/usuario";
let usuarioEmail = "";

// ====== Carregar perfil ======
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

  } catch (error) {
    pageFeedback.textContent = "Erro ao carregar dados do servidor.";
    pageFeedback.classList.add("error");
    pageFeedback.style.display = "block";
  }
}

carregarPerfil();

// ====== Modal perfil ======
btnEditar.onclick = () => (modalPerfil.style.display = "flex");
spanFecharPerfil.onclick = () => (modalPerfil.style.display = "none");
window.onclick = (e) => {
  if (e.target === modalPerfil) modalPerfil.style.display = "none";
};

// ====== Preview foto ======
document.getElementById("input-foto").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (ev) => (document.getElementById("foto-perfil").src = ev.target.result);
    reader.readAsDataURL(file);
  }
});

// ====== Atualizar perfil ======
formPerfil.addEventListener("submit", async (e) => {
  e.preventDefault();
  modalFeedback.style.display = "none";
  modalFeedback.classList.remove("error", "success");

  const formData = new FormData();
  formData.append("nome", document.getElementById("input-nome").value);
  formData.append("email", document.getElementById("input-email").value);
  formData.append("telefone", document.getElementById("input-telefone").value);
  formData.append("departamento", document.getElementById("input-departamento").value);

  const fotoFile = document.getElementById("input-foto").files[0];
  if (fotoFile) formData.append("foto", fotoFile);

  try {
    const res = await fetch(`${baseURL}/${usuarioId}`, {
      method: "PUT",
      body: formData,
    });

    const result = await res.json();

    if (res.ok) {
      modalFeedback.textContent = "Perfil atualizado com sucesso!";
      modalFeedback.classList.add("success");
      modalFeedback.style.display = "block";

      const usuarioAtualizado = { ...usuarioLogado, ...Object.fromEntries(formData) };
      localStorage.setItem("usuario_colaborador", JSON.stringify(usuarioAtualizado));
      localStorage.setItem("nomeUsuario", usuarioAtualizado.nome);

      modalPerfil.style.display = "none";
      carregarPerfil();
    } else {
      modalFeedback.textContent = result.error || "Erro ao atualizar perfil";
      modalFeedback.classList.add("error");
      modalFeedback.style.display = "block";
    }
  } catch (err) {
    modalFeedback.textContent = "Erro de conexão com o servidor";
    modalFeedback.classList.add("error");
    modalFeedback.style.display = "block";
  }
});
 