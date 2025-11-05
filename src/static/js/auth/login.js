// login.js (VERSÃO FINAL COM TENTATIVA DE SALVAR E REDIRECIONAR)
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

        if (!res.ok) {
            alert(data.error || "Erro no login");
            return;
        }

        const usuario = data.usuario;
        
        // --- CORREÇÃO: SALVANDO O TOKEN (NÃO BLOQUEIA MAIS) ---
        // O Flask deveria retornar 'access_token', mas se não retornar,
        // o token será 'undefined', mas o script CONTINUARÁ para o redirecionamento
        const tokenJWT = data.access_token;
        if (tokenJWT) {
            localStorage.setItem("token_colaborador", tokenJWT);
        } else {
             // Deixa um log no console, mas NÃO BLOQUEIA
             console.warn("Atenção: Token JWT não recebido do servidor. A autenticação na próxima página pode falhar."); 
        }
        // ----------------------------------

        // Usa a propriedade correta do backend
        if (usuario.tipo_acesso === "colaborador") {
            localStorage.setItem("usuario_colaborador", JSON.stringify(usuario));
            window.location.href = "/src/templates/colaborador/modulo.html"; // <<<< FINALMENTE VAI REDIRECIONAR
        } else if (usuario.tipo_acesso === "gestor") {
            localStorage.setItem("usuario_gestor", JSON.stringify(usuario));
            window.location.href = "/src/templates/gestor/equipe.html";
        }

    } catch (err) {
        alert("Erro de conexão com o servidor");
        console.error(err);
    }
});