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
            console.warn("Token JWT não recebido do servidor.");
            return;
        }

    
        if (usuario.tipo_acesso === "colaborador") {

            sessionStorage.setItem("token_colaborador", tokenJWT);
            sessionStorage.setItem("usuario_colaborador", JSON.stringify(usuario));

            window.location.href = "/colaborador/modulo/pagina";

        } else if (usuario.tipo_acesso === "gestor") {

            sessionStorage.setItem("token_gestor", tokenJWT);
            sessionStorage.setItem("usuario_gestor", JSON.stringify(usuario));

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
