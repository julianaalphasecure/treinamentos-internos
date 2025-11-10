// Arquivo: login.js (CORRIGIDO)
const form = document.getElementById("login-form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();

    if (!email || !senha) {
        alert("Preencha todos os campos");
        return;
    }

    try {
        const res = await fetch("http://localhost:5000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, senha })
        });

        const data = await res.json();
        
        console.log("Resposta completa do servidor (data):", data);

        if (!res.ok) {
            alert(data.error || "Erro no login");
            return;
        }

        const usuario = data.usuario;
        const tokenJWT = data.access_token;
        
        if (!tokenJWT) {
            console.warn("Atenção: Token JWT não recebido do servidor. Login falhou."); 
            return;
        }

        // NOVO BLOCO DE LÓGICA: Salva o token e o usuário na chave correta
        if (usuario.tipo_acesso === "colaborador") {
            // Salva o token para colaborador
            localStorage.setItem("token_colaborador", tokenJWT); 
            localStorage.setItem("usuario_colaborador", JSON.stringify(usuario));
            window.location.href = "/src/templates/colaborador/modulo.html"; 

        } else if (usuario.tipo_acesso === "gestor") {
            // Salva o token para gestor
            localStorage.setItem("token_gestor", tokenJWT); 
            localStorage.setItem("usuario_gestor", JSON.stringify(usuario));
            window.location.href = "/src/templates/gestor/equipe.html";
        } else {
            alert("Tipo de acesso desconhecido. Contate o administrador.");
        }

        console.log(`Token recebido e salvo em localStorage. Chave: token_${usuario.tipo_acesso}`);

    } catch (err) {
        alert("Erro de conexão com o servidor");
        console.error(err);
    }
});