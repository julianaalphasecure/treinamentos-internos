const form = document.getElementById("login-form");
const senhaInput = document.getElementById("senha");
const toggleBtn = document.getElementById("toggleSenha");

toggleBtn.addEventListener("click", () => {
    if (senhaInput.type === "password") {
        senhaInput.type = "text"; // mostra a senha
        toggleBtn.innerHTML = `
          <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.35 21.35 0 0 1 5.06-6.94"/>
          <path d="M1 1l22 22"/>
        `;
    } else {
        senhaInput.type = "password"; // esconde a senha
        toggleBtn.innerHTML = `
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        `;
    }
});

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
            console.warn("Token JWT não recebido do servidor.");
            return;
        }

    
        if (usuario.tipo_acesso === "colaborador") {

            localStorage.setItem("token_colaborador", tokenJWT);
            localStorage.setItem("usuario_colaborador", JSON.stringify(usuario));

            window.location.href = "/colaborador/modulo/pagina";

        } else if (usuario.tipo_acesso === "gestor") {

            localStorage.setItem("token_gestor", tokenJWT);
            localStorage.setItem("usuario_gestor", JSON.stringify(usuario));

            window.location.href = "/gestor/equipe/pagina";

        } else {
            alert("Tipo de acesso desconhecido. Contate o administrador.");
        }

        console.log(`Token salvo em sessionStorage: token_${usuario.tipo_acesso}`);

    } catch (err) {
        alert("Erro de conexão com o servidor");
        console.error(err);
    }
});
