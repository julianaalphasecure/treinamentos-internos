// VARIÁVEIS DO DOM
const colaboradorSearchInput = document.getElementById("colaborador-search");
const colaboradorDestinoId = document.getElementById("colaborador-destino-id");
const searchResultsDiv = document.getElementById("search-results");
const feedbackTitulo = document.getElementById("feedback-titulo");
const feedbackMensagem = document.getElementById("feedback-mensagem");
const feedbackForm = document.getElementById("feedback-form");
const btnEnviarFeedback = document.getElementById("btn-enviar-feedback");
const feedbackStatusMessage = document.getElementById("feedback-status-message");

// VARIÁVEIS DA API
const baseURLColaborador = "http://127.0.0.1:5000/colaborador"; 
const baseURLFeedback = "http://127.0.0.1:5000/gestor/relatorio/";
const token = localStorage.getItem("token_gestor");


let todosColaboradores = [];
let colaboradorSelecionado = null; 
let isSearchDropdownOpen = false;


// ================== Funções de Utilitário ==================

// Função para buscar a lista de colaboradores
async function fetchColaboradores() {

    try {
        const res = await fetch(`${baseURLColaborador}/`, { 
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
        
    if (!res.ok) {
                
        console.error("Erro ao carregar colaboradores:", res.status);
        alert(`Erro ${res.status} ao carregar lista de colaboradores. Verifique o servidor.`);
        return [];
}
todosColaboradores = await res.json();
return todosColaboradores;
} catch (err) {
    console.error("Erro de conexão ao buscar colaboradores:", err);
    alert("Erro de conexão. Servidor desligado?");
        return [];
    }
}

// ================== Lógica de Autocomplete ==================

function renderSearchResults(query) {

    if (query.length < 2) { 
        searchResultsDiv.innerHTML = '';
        isSearchDropdownOpen = false;
        return;
}
 

const filteredResults = todosColaboradores.filter(colab => 
colab.nome.toLowerCase().includes(query.toLowerCase())
);

searchResultsDiv.innerHTML = '';

    if (filteredResults.length > 0) {
    filteredResults.forEach(colab => {
    const resultItem = document.createElement('div');
    resultItem.textContent = `${colab.nome} (ID: ${colab.id})`;
    resultItem.dataset.id = colab.id;
    resultItem.dataset.nome = colab.nome;
    resultItem.addEventListener('click', handleSelectColaborador);
    searchResultsDiv.appendChild(resultItem);
});
isSearchDropdownOpen = true;
} else {
    const noResultItem = document.createElement('div');
    noResultItem.textContent = 'Nenhum colaborador encontrado.';
    searchResultsDiv.appendChild(noResultItem);
    isSearchDropdownOpen = true;
    }
}

function handleSelectColaborador(event) {
    const selectedItem = event.target;


    colaboradorSelecionado = {
        id: selectedItem.dataset.id,
        nome: selectedItem.dataset.nome
 };


colaboradorSearchInput.value = selectedItem.dataset.nome;
colaboradorDestinoId.value = selectedItem.dataset.id;


    searchResultsDiv.innerHTML = '';
    isSearchDropdownOpen = false;


    btnEnviarFeedback.disabled = false;
}

// Listener para digitação no campo de pesquisa
colaboradorSearchInput.addEventListener('input', (e) => {
    // Força desabilitar o botão se o texto for alterado antes da seleção
    btnEnviarFeedback.disabled = true;
    colaboradorDestinoId.value = '';
    colaboradorSelecionado = null;
    
    renderSearchResults(e.target.value.trim());
});

// Fecha o dropdown ao clicar fora
document.addEventListener('click', (e) => {
    if (!feedbackForm.contains(e.target) && isSearchDropdownOpen) {
        searchResultsDiv.innerHTML = '';
        isSearchDropdownOpen = false;
    }
});


// ================== AÇÃO DE ENVIO DE FEEDBACK ==================

feedbackForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const gestorId = JSON.parse(localStorage.getItem("usuario_gestor"))?.id; 
    
    // Validação final de quem está enviando e para quem
    if (!gestorId || !colaboradorSelecionado?.id) {
        alert("Erro: Selecione um colaborador válido e faça login como gestor.");
        return;
    }
    
    const dadosFeedback = {
        colaborador_id: parseInt(colaboradorSelecionado.id),
        gestor_id: gestorId,
        mensagem: feedbackMensagem.value.trim(),
        tipo: feedbackTitulo.value.trim() || null // O título/assunto
    };

    if (dadosFeedback.mensagem.length === 0) {
        alert("A mensagem de feedback não pode estar vazia.");
        return;
    }
    
    btnEnviarFeedback.disabled = true; 
    btnEnviarFeedback.textContent = "Enviando...";
    feedbackStatusMessage.textContent = 'Processando...';

    try {
        const res = await fetch(baseURLFeedback, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify(dadosFeedback)
        });

        const data = await res.json();

        if (res.ok) {
            feedbackStatusMessage.textContent = `Feedback para ${colaboradorSelecionado.nome} enviado com sucesso!`;
            
            // Limpar formulário e seleção (para forçar nova pesquisa)
            feedbackTitulo.value = "";
            feedbackMensagem.value = "";
            colaboradorSearchInput.value = "";
            colaboradorDestinoId.value = "";
            colaboradorSelecionado = null;
            btnEnviarFeedback.disabled = true; // Desabilita até que um novo seja selecionado

        } else {
            feedbackStatusMessage.textContent = "Falha no envio!";
            alert("Erro ao enviar feedback: " + (data.error || "Erro desconhecido"));
        }
    } catch (err) {
        feedbackStatusMessage.textContent = "Erro de Conexão!";
        console.error("Erro ao enviar feedback:", err);
        alert("Erro de conexão. Veja o console.");
    } finally {
        btnEnviarFeedback.textContent = "Enviar Feedback";
        // Mantém desabilitado se não houver colaborador selecionado
        if (colaboradorSelecionado) {
             btnEnviarFeedback.disabled = false;
        }
        setTimeout(() => feedbackStatusMessage.textContent = '', 5000); // Limpa a mensagem após 5s
    }
});


// ================== Inicializar ==================
document.addEventListener("DOMContentLoaded", async () => {
    // VERIFICAÇÃO DE LOGIN
    if (!token || !localStorage.getItem("usuario_gestor")) {
        console.error("Token de autenticação ausente. Redirecionando.");
        window.location.href = "/src/templates/auth/login.html"; 
        return;
    }

    await fetchColaboradores();
    
    // Exibir o nome do gestor (se o elemento existir)
    const usuario = JSON.parse(localStorage.getItem("usuario_gestor")) || {};
    const headerNome = document.getElementById("user-name");
    if (headerNome) {
         headerNome.textContent = `Olá, ${usuario.nome || ""}`;
    }
});