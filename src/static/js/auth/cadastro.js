const form = document.getElementById("cadastro-form");
const feedbackDiv = document.createElement("div");
feedbackDiv.classList.add("form-feedback");
form.appendChild(feedbackDiv);

form.addEventListener("submit", async function(e) {
  e.preventDefault();

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
    const response = await fetch("/auth/cadastro", {
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
        window.location.href = "/auth/login"; // Agora redireciona para a rota Flask
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
