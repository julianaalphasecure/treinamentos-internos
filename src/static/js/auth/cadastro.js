document.getElementById("form-cadastro").addEventListener("submit", async function(e) {
  e.preventDefault();

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
      alert("Cadastro realizado com sucesso!");
      window.location.href = "login.html";
    } else {
      alert(result.error || "Erro ao cadastrar");
    }
  } catch (error) {
    alert("Erro de conexão com o servidor");
  }
});
