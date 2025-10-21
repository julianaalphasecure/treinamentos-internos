document.addEventListener('DOMContentLoaded', async () => {
  const usuarioId = localStorage.getItem("usuario_id");
  const baseURL = "http://127.0.0.1:5000/configuracoes";

  if (!usuarioId) {
    showToast("Usuário não identificado. Faça login novamente.");
    setTimeout(() => window.location.href = "/src/templates/auth/login.html", 1500);
    return;
  }

  
  const emailCheckbox = document.getElementById("emailNotif");
  const pushCheckbox = document.getElementById("pushNotif");
  const themeSelect = document.getElementById("theme-select");
  const fontSelect = document.getElementById("font-select");
  const resetBtn = document.getElementById("reset-btn");

 
  async function carregarConfiguracoes() {
    try {
      const res = await fetch(`${baseURL}/${usuarioId}`);
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Erro ao carregar configurações");
        return;
      }

     
      emailCheckbox.checked = data.notificacoes_email;
      pushCheckbox.checked = data.notificacoes_push;
      themeSelect.value = data.tema || "claro";
      fontSelect.value = localStorage.getItem("fontSize") || "padrao";

      aplicarTema(data.tema);
      aplicarFonte(localStorage.getItem("fontSize") || "padrao");

    } catch (err) {
      showToast("Erro de conexão com o servidor");
    }
  }

  await carregarConfiguracoes();

  // ====== Funções para aplicar tema e fonte ======
  function aplicarTema(tema) {
    if (tema === "escuro") {
      document.body.setAttribute("data-theme", "escuro");
      localStorage.setItem("theme", "escuro");
    } else {
      document.body.removeAttribute("data-theme");
      localStorage.setItem("theme", "claro");
    }
  }

  function aplicarFonte(size) {
    let fontSize;
    switch(size) {
      case "grande": fontSize = "18px"; break;
      case "muito-grande": fontSize = "20px"; break;
      default: fontSize = "16px";
    }
    document.body.style.fontSize = fontSize;
    localStorage.setItem("fontSize", size);
  }

  // ====== Listeners ======
  emailCheckbox.addEventListener("change", atualizarConfiguracoes);
  pushCheckbox.addEventListener("change", atualizarConfiguracoes);
  themeSelect.addEventListener("change", (e) => {
    aplicarTema(e.target.value);
    atualizarConfiguracoes();
  });
  fontSelect.addEventListener("change", (e) => {
    aplicarFonte(e.target.value);
  });

  resetBtn.addEventListener("click", async () => {
    emailCheckbox.checked = true;
    pushCheckbox.checked = true;
    themeSelect.value = "claro";
    aplicarTema("claro");
    fontSelect.value = "padrao";
    aplicarFonte("padrao");
    await atualizarConfiguracoes();
    showToast("Configurações restauradas para o padrão.");
  });

  // ====== Função de update via API ======
  async function atualizarConfiguracoes() {
    const payload = {
      notificacoes_email: emailCheckbox.checked,
      notificacoes_push: pushCheckbox.checked,
      tema: themeSelect.value,
      idioma: "pt-BR" 
    };

    try {
      const res = await fetch(`${baseURL}/${usuarioId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Erro ao atualizar configurações");
        return;
      }

      showToast("Configurações atualizadas com sucesso!");

    } catch (err) {
      showToast("Erro de conexão com o servidor");
    }
  }

  // ====== Toast ======
  function showToast(msg) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 100);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 2500);
  }
});

feedbackForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const tipo = document.getElementById("feedbackType").value;
  const mensagem = document.getElementById("feedbackMessage").value;
  const usuarioId = localStorage.getItem("usuario_id");

  if (!tipo || !mensagem) return;

  try {
    const res = await fetch("http://127.0.0.1:5000/configuracoes/feedback/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ colaborador_id: usuarioId, tipo, mensagem })
    });

    const data = await res.json();

    if (res.ok) {
      showToast("Feedback enviado com sucesso!");
      feedbackForm.reset();
    } else {
      showToast(data.error || "Erro ao enviar feedback");
    }
  } catch (err) {
    showToast("Erro de conexão com o servidor");
  }
});
