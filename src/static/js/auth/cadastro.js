// Arquivo: /src/static/js/auth/cadastro.js

// CRÍTICO 1: Mudar para o ID do formulário de cadastro
const form = document.getElementById("cadastro-form");
// CRÍTICO 2: Definir a URL correta da sua API Flask para o cadastro
const baseURL = "http://localhost:5000/auth/cadastro"; 
// ^^^ VERIFIQUE SE ESTA É A ROTA CORRETA NO SEU BACKEND ^^^

form.addEventListener("submit", async (e) => {
    // ✅ CRÍTICO 3: Previne o comportamento padrão do HTML (que causa o refresh)
    e.preventDefault(); 
    
    // Coleta dos dados do formulário
    const re = document.getElementById("re").value.trim();
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();
    const tipoAcesso = document.getElementById("tipo_acesso").value;

    const feedbackDiv = document.getElementById("cadastro-feedback");
    feedbackDiv.textContent = ''; // Limpa mensagens anteriores

    if (!re || !nome || !email || !senha || !tipoAcesso) {
        alert("Preencha todos os campos obrigatórios.");
        return;
    }

    try {
        const res = await fetch(baseURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                re: re, 
                nome: nome, 
                email: email, 
                senha: senha,
                tipo_acesso: tipoAcesso 
            })
        });

        const data = await res.json();

        if (!res.ok) {
            // Falha no cadastro (ex: email já existe)
            feedbackDiv.style.color = 'red';
            feedbackDiv.textContent = data.error || "Erro ao tentar cadastrar usuário.";
            console.error("Erro de Cadastro:", data);
            return;
        }

        // SUCESSO NO CADASTRO
        feedbackDiv.style.color = 'green';
        feedbackDiv.textContent = data.message || "Cadastro realizado com sucesso! Redirecionando para o login...";

        
        setTimeout(() => {
             window.location.href = "/src/templates/auth/login.html";
        }, 2000); 

    } catch (err) {
        feedbackDiv.style.color = 'red';
        feedbackDiv.textContent = "Erro de conexão com o servidor. Verifique o console.";
        console.error("Erro de conexão/API:", err);
    }
});