document.addEventListener('DOMContentLoaded', () => {
  const checkboxes = ['emailNotif', 'pushNotif', 'smsNotif', 'feedbackNotif', 'showProgress', 'ranking'];
  const theme = document.getElementById('theme');
  const language = document.getElementById('language');
  const resetBtn = document.getElementById('reset-btn');

  // Carregar preferências salvas
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

  // Alteração de tema
  theme.addEventListener('change', () => {
    const value = theme.value;
    localStorage.setItem('theme', value);
    document.body.setAttribute('data-theme', value);
  });

  // Alteração de idioma
  language.addEventListener('change', () => {
    const value = language.value;
    localStorage.setItem('language', value);
    showToast('Idioma alterado para: ' + (value === 'pt-br' ? 'Português (Brasil)' : 'Inglês'));
  });

  // Restaurar padrões
  resetBtn.addEventListener('click', () => {
    localStorage.clear();
    checkboxes.forEach(id => (document.getElementById(id).checked = false));
    theme.value = 'claro';
    language.value = 'pt-br';
    document.body.setAttribute('data-theme', 'claro');
    showToast('Preferências restauradas para o padrão.');
  });

  // Toast de feedback
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

const themeSelect = document.getElementById("theme-select");
const body = document.body;
const toast = document.getElementById("toast");
const feedbackForm = document.getElementById("feedbackForm");


themeSelect.addEventListener("change", (e) => {
  if (e.target.value === "escuro") {
    body.setAttribute("data-theme", "escuro");
  } else {
    body.removeAttribute("data-theme");
  }
});


feedbackForm.addEventListener("submit", (e) => {
  e.preventDefault();
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
  feedbackForm.reset();
});


