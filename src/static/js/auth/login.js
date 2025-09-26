document.getElementById("form-login").addEventListener("submit", async function(e) {
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
      // redireciona para página inicial do colaborador ou gestor
      window.location.href = "/home.html";
    } else {
      alert(result.error || "Erro no login");
    }
  } catch (error) {
    alert("Erro de conexão com o servidor");
  }
});
