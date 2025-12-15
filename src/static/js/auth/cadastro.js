const form = document.getElementById("cadastro-form");

const baseURL = "http://localhost:5000/auth/cadastro"; 


form.addEventListener("submit", async (e) => {

    e.preventDefault(); 
    
    const re = document.getElementById("re").value.trim();
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();
    const tipoAcesso = document.getElementById("tipo_acesso").value;

    const feedbackDiv = document.getElementById("cadastro-feedback");
    feedbackDiv.textContent = ''; 

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
            feedbackDiv.style.color = 'red';
            feedbackDiv.textContent = data.error || "Erro ao tentar cadastrar usuário.";
            console.error("Erro de Cadastro:", data);
            return;
        }

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