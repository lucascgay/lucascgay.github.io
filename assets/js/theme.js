const toggle = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
  document.body.classList.add('dark');
}

if (toggle) {
  const setIcon = () => {
    toggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
  };
  setIcon();
  toggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    setIcon();
  });
}
