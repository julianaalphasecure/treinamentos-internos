const modal = document.getElementById("modal");
const btnEditar = document.querySelector(".btn-editar");
const spanClose = document.querySelector(".close");
const form = document.getElementById("form-perfil");

// Abrir modal com dados preenchidos
btnEditar.onclick = () => {
  document.getElementById("input-nome").value = document.getElementById("perfil-nome-completo").innerText;
  document.getElementById("input-email").value = document.getElementById("perfil-email").innerText;
  document.getElementById("input-telefone").value = document.getElementById("perfil-telefone").innerText;
  document.getElementById("input-departamento").value = document.getElementById("perfil-departamento").innerText;
  document.getElementById("input-re").value = document.getElementById("perfil-re").innerText;

  modal.style.display = "flex";
};

// Fechar modal
spanClose.onclick = () => modal.style.display = "none";
window.onclick = (event) => { if (event.target === modal) modal.style.display = "none"; };

// Salvar alterações
form.onsubmit = (e) => {
  e.preventDefault();

  // Atualizar dados no card
  document.getElementById("perfil-nome-completo").innerText = document.getElementById("input-nome").value;
  document.getElementById("perfil-email").innerText = document.getElementById("input-email").value;
  document.getElementById("perfil-telefone").innerText = document.getElementById("input-telefone").value;
  document.getElementById("perfil-departamento").innerText = document.getElementById("input-departamento").value;
  document.getElementById("perfil-re").innerText = document.getElementById("input-re").value;

  modal.style.display = "none";
  alert("Perfil atualizado com sucesso!");
};
