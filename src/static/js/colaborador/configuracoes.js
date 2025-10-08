document.addEventListener('DOMContentLoaded', () => {
  const checkboxes = ['emailNotif', 'pushNotif', 'smsNotif', 'feedbackNotif', 'showProgress', 'ranking'];
  const theme = document.getElementById('theme');
  const language = document.getElementById('language');
  const resetBtn = document.getElementById('reset-btn');

 
  checkboxes.forEach(id => {
    const el = document.getElementById(id);
    const saved = localStorage.getItem(id);
    el.checked = saved === 'true';
    el.addEventListener('change', () => localStorage.setItem(id, el.checked));
  });

  const savedTheme = localStorage.getItem('theme') || 'claro';
  document.body.setAttribute('data-theme', savedTheme);
  theme.value = savedTheme;

  const savedLang = localStorage.getItem('language') || 'pt-br';
  language.value = savedLang;


  theme.addEventListener('change', () => {
    const value = theme.value;
    localStorage.setItem('theme', value);
    document.body.setAttribute('data-theme', value);
  });

  
  language.addEventListener('change', () => {
    const value = language.value;
    localStorage.setItem('language', value);
    showToast('Idioma alterado para: ' + (value === 'pt-br' ? 'Português (Brasil)' : 'Inglês'));
  });

 
  resetBtn.addEventListener('click', () => {
    localStorage.clear();
    checkboxes.forEach(id => (document.getElementById(id).checked = false));
    theme.value = 'claro';
    language.value = 'pt-br';
    document.body.setAttribute('data-theme', 'claro');
    showToast('Preferências restauradas para o padrão.');
  });

  
  function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 2500);
  }
});
