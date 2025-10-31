const form = document.getElementById("login-form");

// Feedback dinâmico
const feedbackDiv = document.createElement("div");
feedbackDiv.classList.add("form-feedback");
form.appendChild(feedbackDiv);

form.addEventListener("submit", async function (e) {
  e.preventDefault();

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
      const usuario = result.usuario;

      // Limpa dados antigos
      localStorage.clear();

      // Salva conforme tipo de acesso
      if (usuario.tipo_acesso === "gestor") {
        localStorage.setItem("usuario_gestor", JSON.stringify(usuario));
        localStorage.setItem("usuario_id", usuario.id);
        localStorage.setItem("nomeUsuario", usuario.nome);
        window.location.href = "/src/templates/gestor/equipe.html";

      } else if (usuario.tipo_acesso === "colaborador") {
        localStorage.setItem("usuario_colaborador", JSON.stringify(usuario));
        localStorage.setItem("usuario_id", usuario.id);
        localStorage.setItem("nomeUsuario", usuario.nome);
        window.location.href = "/src/templates/colaborador/modulo.html";

      } else {
        feedbackDiv.textContent = "Tipo de acesso inválido.";
        feedbackDiv.classList.add("error");
        feedbackDiv.style.display = "block";
      }

    } else {
      feedbackDiv.textContent = result.error || "Erro ao fazer login";
      feedbackDiv.classList.add("error");
      feedbackDiv.style.display = "block";
    }

  } catch (error) {
    feedbackDiv.textContent = "Erro de conexão com o servidor";
    feedbackDiv.classList.add("error");
    feedbackDiv.style.display = "block";
    console.error(error);
  }
});
