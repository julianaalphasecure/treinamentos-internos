const form = document.getElementById("cadastro-form");

// Cria a div de feedback dinamicamente
const feedbackDiv = document.createElement("div");
feedbackDiv.classList.add("form-feedback");
form.appendChild(feedbackDiv);

form.addEventListener("submit", async function(e) {
  e.preventDefault();

  // Limpa feedback anterior
  feedbackDiv.style.display = "none";
  feedbackDiv.classList.remove("success", "error");
  feedbackDiv.textContent = "";

  const dados = {
    re: document.getElementById("re").value,
    nome: document.getElementById("nome").value,
    email: document.getElementById("email").value,
    senha: document.getElementById("senha").value,
    tipo_acesso: document.getElementById("tipo_acesso").value
  };

  try {
    const response = await fetch("http://127.0.0.1:5000/auth/registrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });

    const result = await response.json();

    if (response.ok) {
      feedbackDiv.textContent = "Cadastro realizado com sucesso!";
      feedbackDiv.classList.add("success");
      feedbackDiv.style.display = "block";

      // Redireciona após 1.5 segundos
      setTimeout(() => {
        window.location.href = "/src/templates/auth/login.html";
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
