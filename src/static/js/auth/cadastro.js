document.addEventListener("DOMContentLoaded", () => {
  const formCadastro = document.getElementById("cadastro-form"); // corrigido
  const feedbackCadastro = document.getElementById("cadastro-feedback");
  const baseURL = "http://127.0.0.1:5000/auth/cadastro";

  if (!formCadastro || !feedbackCadastro) return;

  formCadastro.addEventListener("submit", async (e) => {
    e.preventDefault();

    feedbackCadastro.textContent = "";
    feedbackCadastro.classList.remove("error", "success");
    feedbackCadastro.style.display = "none";

    // Captura valores do formulário
    const re = document.getElementById("re").value.trim(); // corrigido
    const nome = document.getElementById("nome").value.trim(); // corrigido
    const email = document.getElementById("email").value.trim(); // corrigido
    const senha = document.getElementById("senha").value.trim(); // corrigido
    const tipo_acesso = document.getElementById("tipo_acesso").value.trim().toLowerCase(); // corrigido

    if (!re || !nome || !email || !senha || !tipo_acesso) {
      feedbackCadastro.textContent = "Todos os campos são obrigatórios.";
      feedbackCadastro.classList.add("error");
      feedbackCadastro.style.display = "block";
      return;
    }

    if (!["colaborador", "gestor"].includes(tipo_acesso)) {
      feedbackCadastro.textContent = "Tipo de acesso inválido. Escolha 'colaborador' ou 'gestor'.";
      feedbackCadastro.classList.add("error");
      feedbackCadastro.style.display = "block";
      return;
    }

    try {
      const res = await fetch(baseURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ re, nome, email, senha, tipo_acesso })
      });

      const data = await res.json();

      if (res.ok) {
        feedbackCadastro.textContent = data.message || "Cadastro realizado com sucesso!";
        feedbackCadastro.classList.add("success");
        feedbackCadastro.style.display = "block";

        setTimeout(() => {
          window.location.href = "/src/templates/auth/login.html";
        }, 1500);
      } else {
        feedbackCadastro.textContent = data.error || "Erro ao cadastrar usuário.";
        feedbackCadastro.classList.add("error");
        feedbackCadastro.style.display = "block";
      }

    } catch (err) {
      feedbackCadastro.textContent = "Erro de conexão com o servidor.";
      feedbackCadastro.classList.add("error");
      feedbackCadastro.style.display = "block";
    }
  });
});
