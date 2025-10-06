const feedbackList = document.getElementById('feedbackList');
const viewAllBtn = document.getElementById('viewAllBtn');


feedbackList.addEventListener('click', (e) => {
  if (e.target.classList.contains('mark-read-btn')) {
    const card = e.target.closest('.feedback-card');
    card.classList.add('read');
    e.target.disabled = true;
    e.target.textContent = 'Lida';
  }
});


viewAllBtn.addEventListener('click', () => {
  const newFeedbacks = [
    {
      type: 'Reconhecimento',
      from: 'Lucas',
      date: '12/09/2025, 09:30',
      message: 'Excelente desempenho na apresentação do módulo 03!'
    },
    {
      type: 'Orientação',
      from: 'Fernanda',
      date: '13/09/2025, 11:00',
      message: 'Revisar o relatório do módulo 01 antes da entrega.'
    }
  ];

  newFeedbacks.forEach(fb => {
    const card = document.createElement('div');
    card.classList.add('feedback-card');
    card.innerHTML = `
      <div class="feedback-header">
        <span class="feedback-type">${fb.type}</span>
        <span class="feedback-from">De: ${fb.from}</span>
        <span class="feedback-date">${fb.date}</span>
      </div>
      <div class="feedback-message">${fb.message}</div>
      <button class="mark-read-btn">Marcar como lida</button>
    `;
    feedbackList.appendChild(card);
  });

  viewAllBtn.disabled = true;
  viewAllBtn.textContent = 'Todos visualizados';
});
