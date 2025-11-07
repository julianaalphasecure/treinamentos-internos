document.addEventListener("DOMContentLoaded", () => {
    
    const TOKEN = localStorage.getItem("token_colaborador");

    if (!TOKEN) {
        console.error("Token de autenticação ausente. Não é possível carregar progresso.");
        // Redireciona se for uma página protegida
        setTimeout(() => {
            window.location.href = "/src/templates/auth/login.html"; 
        }, 500);
        return;
    }
    
    // ---------- Função principal para carregar progresso ----------
    async function carregarProgresso() {
        try {
          const response = await fetch('http://127.0.0.1:5000/colaborador/progresso/frontend', { 
            method: "GET",
            headers: {
                'Authorization': `Bearer ${TOKEN}`, 
                'Content-Type': 'application/json'
            }
        });
            
            // Tratamento de 401/403
            if (response.status === 401 || response.status === 403) {
                console.error('Sessão expirada ou Token inválido.');
                localStorage.removeItem("token_colaborador");
                localStorage.removeItem("usuario_colaborador");
                showToast('Sessão expirada. Por favor, faça login.');
                setTimeout(() => {
                    window.location.href = "/src/templates/auth/login.html"; 
                }, 1000);
                return;
            }

            if (!response.ok) throw new Error('Erro ao buscar dados');

            const dados = await response.json();

            // ---------- Carrega módulos ----------
            const containerModulos = document.querySelector('.progresso-modulos');
            // Remove módulos existentes
            containerModulos.querySelectorAll('.modulo').forEach(m => m.remove());

            dados.modulos.forEach(modulo => {
                const div = document.createElement('div');
                div.className = 'modulo';
                div.dataset.percent = modulo.percent;

                div.innerHTML = `
                    <span>${modulo.nome}</span>
                    <div class="barra">
                        <div class="preenchimento" style="width:0%"></div>
                    </div>
                    <span class="nota">${modulo.percent}%</span>
                `;

                // Insere antes do botão "Ver Mais" se existir
                const verMaisBtn = document.getElementById('verMaisBtn');
                if (verMaisBtn) {
                    containerModulos.insertBefore(div, verMaisBtn);
                } else {
                    containerModulos.appendChild(div);
                }

                // Animação da barra
                setTimeout(() => {
                    div.querySelector('.preenchimento').style.width = modulo.percent + '%';
                }, 300);
            });

            // ---------- Carrega badges (Assumindo que a API retornará 'badges') ----------
            const containerBadges = document.querySelector('.conquistas');
            containerBadges.innerHTML = '<h2>Conquistas e Badges</h2>'; // limpa badges
            // Verifica se 'badges' existe na resposta, senão usa array vazio
            const badges = dados.badges || []; 
            badges.forEach(badge => {
                const div = document.createElement('div');
                div.className = 'badge';
                div.innerHTML = `<h3>${badge.titulo}</h3><p>${badge.descricao}</p>`;
                containerBadges.appendChild(div);
            });

        } catch (err) {
            console.error(err);
            showToast('Não foi possível carregar seu progresso.');
        }
    }

    carregarProgresso();


    // ---------- Botão "Ver Mais" (Mantido como estava) ----------
    const verMaisBtn = document.getElementById('verMaisBtn');
    if (verMaisBtn) {
        verMaisBtn.addEventListener('click', () => {
            const maisModulos = [
                {nome: 'Módulo 01 - Matrix Energia', percent: 0, nota: 0},
                {nome: 'Módulo 02 - Athon Energia', percent: 0, nota: 0},
                {nome: 'Módulo 03 - Inner Energia', percent: 0, nota: 0},
                {nome: 'Módulo 04 - Sódre Santoro', percent: 0, nota: 0},
                {nome: 'Módulo 05 - Comolatti', percent: 0, nota: 0},
                {nome: 'Módulo 06 - Procedimento Operacional Padrão', percent: 0, nota: 0},
                {nome: 'Módulo 07 - Portaria Remota', percent: 0, nota: 0},
                {nome: 'Módulo 08 - BASA (Banco Amazônia)', percent: 0, nota: 0},
            ];

            const containerModulos = document.querySelector('.progresso-modulos');

            maisModulos.forEach(m => {
                const div = document.createElement('div');
                div.className = 'modulo';
                div.dataset.percent = m.percent;

                div.innerHTML = `
                    <span>${m.nome}</span>
                    <div class="barra">
                        <div class="preenchimento" style="width:0%"></div>
                    </div>
                    <span class="nota">${m.nota}%</span>
                `;

                containerModulos.insertBefore(div, verMaisBtn);

                setTimeout(() => {
                    div.querySelector('.preenchimento').style.width = m.percent + '%';
                }, 300);
            });

            verMaisBtn.style.display = 'none';
        });
    }


    // ---------- Funções de UI (Mantidas) ----------
    const savedTheme = localStorage.getItem("theme") || "claro";
    const savedFont = localStorage.getItem("font-size") || "padrao";

    document.body.setAttribute("data-theme", savedTheme);
    document.body.setAttribute("data-font", savedFont);

    window.setTheme = (theme) => {
        document.body.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    };

    window.setFontSize = (size) => {
        document.body.setAttribute("data-font", size);
        localStorage.setItem("font-size", size);
    };

    // ---------- Toasts (Mantidas) ----------
    window.showToast = (msg, duration = 2500) => {
        const toast = document.createElement("div");
        toast.className = "toast";
        toast.textContent = msg;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add("show"), 100);
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 400);
        }, duration);
    };

});