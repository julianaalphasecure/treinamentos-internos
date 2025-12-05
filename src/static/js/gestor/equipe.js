document.addEventListener("DOMContentLoaded", () => {
    const usuarioGestor = JSON.parse(sessionStorage.getItem("usuario_gestor"));
    const token = sessionStorage.getItem("token_gestor");
    const baseURL = "http://127.0.0.1:5000/colaborador"; 

    if (!usuarioGestor || !usuarioGestor.id) {
        alert("Sessão expirada ou usuário não identificado.");
        window.location.href = "/src/templates/auth/login.html";
        return;
    }

    const headerNome = document.getElementById("user-name");
    if (headerNome) {
        headerNome.textContent = `Olá, ${usuarioGestor.nome}`;
    }

   
    async function carregarProgressoColaborador(colaboradorId, colaboradorNome) {
        const modal = document.getElementById('modal-progresso'); 
        const detalhes = document.getElementById('detalhes-progresso'); 

        if (!modal || !detalhes) {
            console.error("Estrutura do modal (#modal-progresso ou #detalhes-progresso) ausente no HTML.");
            return;
        }

      
        detalhes.innerHTML = `<h3>Progresso de ${colaboradorNome}</h3><p>Carregando...</p>`;
        modal.style.display = 'flex'; 

        try {
         
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
            
            
            let htmlModulos = '';
            dadosProgresso.modulos.forEach(modulo => {
                const statusClass = modulo.status === 'concluido' ? 'concluido' : modulo.status === 'em_andamento' ? 'em-andamento' : 'nao-iniciado';
                
              
                let notaTexto = '';
                
                if (modulo.status === 'concluido' && typeof modulo.nota_final === 'number') {
                   
                    notaTexto = ` - Nota ${modulo.nota_final.toFixed(1)}`; 
                }
                
             
            
let tentativasTexto = "";
const t = modulo.tentativas ?? 0;

// Nunca fez
if (t === 0) {
    tentativasTexto = `
        <span class="status-nao-iniciado">Não iniciado</span>
    `;
}
// Fez 1+ vez
else {
    tentativasTexto = `
        <div class="linha-tentativas">
            <span class="status-final ${
                modulo.status === 'concluido' ? 'status-concluido' : 'status-andamento'
            }">
                ${modulo.status === 'concluido' ? 'Concluído' : 'Em andamento'}
            </span><br>

            <span class="tentativas">Tentativas: ${t}</span>
        </div>
    `;
}

htmlModulos += `
    <div class="modulo ${statusClass}">
        <span>${modulo.nome}</span>

        <div class="barra">
            <div class="preenchimento" style="width:${modulo.percent}%"></div>
        </div>

        <span class="nota">
    Nota: ${modulo.nota_final ? (modulo.nota_final / 10) : 0} (${modulo.percent}%)
        </span>


        ${tentativasTexto}
    </div>
`;


            });

          
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

  
    carregarEquipe();
    setInterval(() => {
        carregarEquipe();

    }, 10000);


    const modalProgresso = document.getElementById('modal-progresso');
    if (modalProgresso) {
      
        modalProgresso.addEventListener('click', (e) => {
            if (e.target === modalProgresso) {
                modalProgresso.style.display = 'none';
            }
        });
    }

    
    const filtroStatus = document.getElementById("filtro-status");
    if (filtroStatus) {
        filtroStatus.addEventListener("change", (e) => {
            const valor = e.target.value.toLowerCase();
            const cards = document.querySelectorAll(".card-colaborador");
            cards.forEach((card) => {
                
            });
        });
    }

  const searchInput = document.querySelector(".search-bar input");
if (searchInput) {
    searchInput.addEventListener("input", (e) => {
        const termo = e.target.value.toLowerCase();
        const cards = document.querySelectorAll(".card-colaborador");

        cards.forEach((card) => {
            const nome = card.querySelector(".dados p strong")?.textContent.toLowerCase() || "";
            const re = card.querySelector(".dados p:nth-child(2)")?.textContent.toLowerCase() || "";

            if (nome.includes(termo) || re.includes(termo)) {
                card.style.display = "flex";
            } else {
                card.style.display = "none";
            }
        });
    });
}



});