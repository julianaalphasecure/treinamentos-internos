const form = document.getElementById("login-form");

// Cria a div de feedback dinamicamente
const feedbackDiv = document.createElement("div");
feedbackDiv.classList.add("form-feedback");
form.appendChild(feedbackDiv);

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  // Limpa feedback anterior
  feedbackDiv.style.display = "none";
  feedbackDiv.classList.remove("success", "error");
  feedbackDiv.textContent = "";

  const dados = {
    email: document.getElementById("email").value.trim(),
    senha: document.getElementById("senha").value
  };

  try {
    const response = await fetch("http://127.0.0.1:5000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });

    const result = await response.json();

    if (response.ok && result.usuario) {
      // Feedback positivo
      feedbackDiv.textContent = "Login realizado com sucesso!";
      feedbackDiv.classList.add("success");
      feedbackDiv.style.display = "block";

      // Armazena dados no localStorage
      localStorage.setItem("usuario_id", result.usuario.id);
      localStorage.setItem("usuario_logado", JSON.stringify(result.usuario)); // <-- chave esperada pelo equipe.js

      // Redireciona de acordo com o tipo de acesso após 1.5s
      setTimeout(() => {
        if (result.usuario.tipo_acesso === "gestor") {
          window.location.href = "/src/templates/gestor/equipe.html";
        } else {
          window.location.href = "/src/templates/colaborador/modulo.html";
        }
      }, 1500);

    } else {
      // Feedback de erro
      feedbackDiv.textContent = result.error || "Erro ao fazer login";
      feedbackDiv.classList.add("error");
      feedbackDiv.style.display = "block";
    }
  } catch (error) {
    feedbackDiv.textContent = "Erro de conexão com o servidor";
    feedbackDiv.classList.add("error");
    feedbackDiv.style.display = "block";
    console.error("Erro no fetch de login:", error);
  }
});
