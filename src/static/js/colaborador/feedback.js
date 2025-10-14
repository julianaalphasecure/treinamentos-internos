const feedbackList = document.getElementById('feedbackList');
const viewAllBtn = document.getElementById('viewAllBtn');

// Formata a data
function formatDate(datetime) {
  const date = new Date(datetime);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// Carrega feedbacks via API
async function loadFeedbacks() {
  try {
    const response = await fetch('/colaborador/feedback/');
    const data = await response.json();

    feedbackList.innerHTML = '';

    if(data.length === 0) {
      feedbackList.innerHTML = '<p>Nenhum feedback recebido.</p>';
      viewAllBtn.style.display = 'none';
      return;
    }

    data.forEach(fb => {
      const card = document.createElement('div');
      card.classList.add('feedback-card');
      card.dataset.id = fb.id;
      if(fb.lido) card.classList.add('read');

      const tipo = fb.tipo || 'Feedback';
      const gestor = fb.gestor_nome || `ID ${fb.gestor_id}`;

      card.innerHTML = `
        <div class="feedback-header">
          <span class="feedback-type">${tipo}</span>
          <span class="feedback-from">De: ${gestor}</span>
          <span class="feedback-date">${formatDate(fb.data_feedback)}</span>
        </div>
        <div class="feedback-message">${fb.mensagem}</div>
        <button class="mark-read-btn">${fb.lido ? 'Lida' : 'Marcar como lida'}</button>
      `;

      feedbackList.appendChild(card);
    });

  } catch(err) {
    console.error('Erro ao carregar feedbacks:', err);
  }
}

// Marca como lido via API
feedbackList.addEventListener('click', async (e) => {
  if(e.target.classList.contains('mark-read-btn')) {
    const card = e.target.closest('.feedback-card');
    const feedbackId = card.dataset.id;

    try {
      await fetch(`/colaborador/feedback/${feedbackId}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({lido: true})
      });
      card.classList.add('read');
      e.target.disabled = true;
      e.target.textContent = 'Lida';
    } catch(err) {
      console.error('Erro ao marcar feedback como lido:', err);
    }
  }
});


viewAllBtn.addEventListener('click', loadFeedbacks);


loadFeedbacks();
