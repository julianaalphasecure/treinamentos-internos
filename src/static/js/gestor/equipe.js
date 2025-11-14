document.addEventListener("DOMContentLoaded", () => {
    const usuarioGestor = JSON.parse(localStorage.getItem("usuario_gestor"));
    const token = localStorage.getItem("token_gestor");
    const baseURL = "http://127.0.0.1:5000/colaborador"; // baseURL para chamadas de API

    if (!usuarioGestor || !usuarioGestor.id) {
        alert("Sessão expirada ou usuário não identificado.");
        window.location.href = "/src/templates/auth/login.html";
        return;
    }

    const headerNome = document.getElementById("user-name");
    if (headerNome) {
        headerNome.textContent = `Olá, ${usuarioGestor.nome}`;
    }

    // ==========================================================
    // >>> 1. NOVA FUNÇÃO: CARREGAR PROGRESSO DO COLABORADOR (COM NOTA) <<<
    // ==========================================================
    async function carregarProgressoColaborador(colaboradorId, colaboradorNome) {
        const modal = document.getElementById('modal-progresso'); // O Modal em si
        const detalhes = document.getElementById('detalhes-progresso'); // O conteúdo dentro do modal

        if (!modal || !detalhes) {
            console.error("Estrutura do modal (#modal-progresso ou #detalhes-progresso) ausente no HTML.");
            return;
        }

        // Exibe o modal e mensagem de carregamento
        detalhes.innerHTML = `<h3>Progresso de ${colaboradorNome}</h3><p>Carregando...</p>`;
        modal.style.display = 'flex'; 

        try {
            // Chama a nova rota protegida do gestor
            const url = `${baseURL}/progresso/gestor/colaborador/${colaboradorId}`;
            const res = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const data = await res.json();
                detalhes.innerHTML = `<h3>Progresso de ${colaboradorNome}</h3><p>Erro: ${data.error || "Não foi possível carregar os dados. Verifique a permissão do gestor."}</p>`;
                return;
            }

            const dadosProgresso = await res.json();
            
            // Renderiza os módulos
            let htmlModulos = '';
            dadosProgresso.modulos.forEach(modulo => {
                const statusClass = modulo.status === 'concluido' ? 'concluido' : modulo.status === 'em_andamento' ? 'em-andamento' : 'nao-iniciado';
                
                // >>> IMPLEMENTAÇÃO DA NOTA AQUI <<<
                let notaTexto = '';
                // Assume que a nota (de 0 a 10) está no campo `modulo.nota_final` retornado pela API.
                // Verifica se está concluído e se a nota é um número antes de exibir.
                if (modulo.status === 'concluido' && typeof modulo.nota_final === 'number') {
                    // toFixed(1) garante uma casa decimal (ex: 8.0)
                    notaTexto = ` - Nota ${modulo.nota_final.toFixed(1)}`; 
                }
                
                // Estrutura de progresso baseada no progresso.js original
                htmlModulos += `
                    <div class="modulo ${statusClass}">
                        <span>${modulo.nome}</span>
                        <div class="barra">
                            <div class="preenchimento" style="width:${modulo.percent}%"></div>
                        </div>
                        <span class="nota">${modulo.status.replace('_', ' ')}${notaTexto} (${modulo.percent}%)</span>
                    </div>
                `;
            });

            // Preenche o conteúdo do modal com os dados
            detalhes.innerHTML = `
                <h3>Progresso de ${colaboradorNome}</h3>
                <div class="estatisticas">
                    <p>Módulos Concluídos: <strong>${dadosProgresso.stats.concluidos}</strong></p>
                    <p>Módulos Não Iniciados: <strong>${dadosProgresso.stats.nao_iniciados}</strong></p>
                </div>
                <div class="progresso-modulos">
                    ${htmlModulos}
                </div>
                <button onclick="document.getElementById('modal-progresso').style.display = 'none'" class="btn-fechar-modal">Fechar</button>
            `;

        } catch (err) {
            console.error("Erro ao buscar progresso do colaborador:", err);
            detalhes.innerHTML = `<h3>Progresso de ${colaboradorNome}</h3><p>Erro de conexão com a API.</p>`;
        }
    }
    // ==========================================================
    
    // ==========================================================
    // >>> 2. FUNÇÃO carregarEquipe (MODIFICADA) <<<
    // ==========================================================
    async function carregarEquipe() {
        try {
            const res = await fetch(`${baseURL}/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const data = await res.json();
                console.error(data.error || "Erro ao carregar equipe");
                return;
            }

            const colaboradores = await res.json(); 
            const lista = document.getElementById("lista-equipe");
            if (!lista) return;
            lista.innerHTML = "";

            colaboradores.forEach((colaborador) => {
                const card = document.createElement("div");
                card.classList.add("card-colaborador");

                // Armazena ID e Nome para usar no clique
                card.dataset.colaboradorId = colaborador.id; 
                card.dataset.colaboradorNome = colaborador.nome; 
                card.style.cursor = 'pointer'; 

                const foto = colaborador.foto || "/src/static/img/foto.png";
                const status = colaborador.status?.toLowerCase() || "offline";
                const statusClass = status === "online" ? "online" : "offline";

                card.innerHTML = `
                    <div class="info-colaborador">
                        <div class="dados">
                            <p><strong>${colaborador.nome}</strong></p>
                            <p>${colaborador.re || "Sem RE"}</p>
                            <p>${colaborador.email || "Sem e-mail"}</p>
                        </div>
                    </div>
                `;

                lista.appendChild(card);
                
                // Adiciona o Event Listener de Clique
                card.addEventListener('click', () => {
                    const id = card.dataset.colaboradorId;
                    const nome = card.dataset.colaboradorNome;
                    if (id) {
                        carregarProgressoColaborador(id, nome);
                    }
                });
            });
        } catch (err) {
            console.error("Erro ao conectar com o servidor:", err);
        }
    }

    // ==========================================================
    // >>> 3. INICIA E RODA carregarEquipe <<<
    // ==========================================================
    carregarEquipe();
    setInterval(() => {
        carregarEquipe();
        // heartbeat(); // Mantenha sua função heartbeat se for externa
    }, 10000);

    // ==========================================================
    // >>> 4. LÓGICA DO MODAL (Fechar ao clicar fora) <<<
    // ==========================================================
    const modalProgresso = document.getElementById('modal-progresso');
    if (modalProgresso) {
        // Fecha ao clicar fora do conteúdo
        modalProgresso.addEventListener('click', (e) => {
            if (e.target === modalProgresso) {
                modalProgresso.style.display = 'none';
            }
        });
    }

    // O restante do código (Filtros, Pesquisa, Botão Ver Tudo) permanece inalterado.
    // ...
    const filtroStatus = document.getElementById("filtro-status");
    if (filtroStatus) {
        filtroStatus.addEventListener("change", (e) => {
            const valor = e.target.value.toLowerCase();
            const cards = document.querySelectorAll(".card-colaborador");
            cards.forEach((card) => {
                // ... (lógica de filtro) ...
            });
        });
    }

    const searchInput = document.querySelector(".search-bar input");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const termo = e.target.value.toLowerCase();
            const cards = document.querySelectorAll(".card-colaborador");
            cards.forEach((card) => {
                // ... (lógica de pesquisa) ...
            });
        });
    }

    const btnVerTudo = document.getElementById("btn-ver-tudo");
    if (btnVerTudo) {
        btnVerTudo.addEventListener("click", carregarEquipe);
    }
});