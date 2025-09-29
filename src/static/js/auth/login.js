document.getElementById("login-form").addEventListener("submit", async function(e) {
  e.preventDefault();

  const dados = {
    email: document.getElementById("email").value,
    senha: document.getElementById("senha").value
  };

  try {
    const response = await fetch("http://127.0.0.1:5000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });

    const result = await response.json();

    if (response.ok) {
      alert("Login realizado com sucesso!");

      // Se a API retornar token, armazena
      if (result.token) {
        localStorage.setItem("token", result.token);
      }

      // Salva também o tipo de acesso, se a API retornar
      if (result.tipo_acesso) {
        localStorage.setItem("tipo_acesso", result.tipo_acesso);
      }

      // Redirecionamento com base no tipo de acesso
      if (result.tipo_acesso === "gestor") {
        window.location.href = "/src/templates/gestor/dashboard.html"; 
      } else if (result.tipo_acesso === "colaborador") {
        window.location.href = "/src/templates/colaborador/modulo.html"; 
      } else {
        // fallback se a API não retornar nada
        window.location.href = "/src/templates/home.html";
      }
    } else {
      alert(result.error || "Erro ao fazer login");
    }
  } catch (error) {
    alert("Erro de conexão com o servidor");
  }
});
