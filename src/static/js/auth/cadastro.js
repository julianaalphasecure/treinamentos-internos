const form = document.getElementById("cadastro-form");
const feedbackDiv = document.getElementById("cadastro-feedback");
feedbackDiv.classList.add("form-feedback");
form.appendChild(feedbackDiv);

form.addEventListener("submit", async function(e) {
  e.preventDefault();

  feedbackDiv.style.display = "none";
  feedbackDiv.classList.remove("success", "error");
  feedbackDiv.textContent = "";

  // Pega os valores do formulário
  const re = document.getElementById("re").value.trim();
  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;
  let tipo_acesso = document.getElementById("tipo_acesso").value.trim().toLowerCase();

  // Garantir que o tipo de acesso seja válido
  if (!["colaborador", "gestor"].includes(tipo_acesso)) {
    feedbackDiv.textContent = "Tipo de acesso inválido. Escolha 'Colaborador' ou 'Gestor'.";
    feedbackDiv.classList.add("error");
    feedbackDiv.style.display = "block";
    return;
  }

  const dados = { re, nome, email, senha, tipo_acesso };

  try {
    const response = await fetch("http://127.0.0.1:5000/auth/cadastro", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(dados)
    });


    const result = await response.json();

    if (response.ok && result.success) {
      feedbackDiv.textContent = result.message;
      feedbackDiv.classList.add("success");
      feedbackDiv.style.display = "block";

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);
    } else {
      feedbackDiv.textContent = result.error || "Erro ao cadastrar";
      feedbackDiv.classList.add("error");
      feedbackDiv.style.display = "block";
    }
  } catch (error) {
    feedbackDiv.textContent = "Erro de conexão com o servidor";
    feedbackDiv.classList.add("error");
    feedbackDiv.style.display = "block";
  }
});
