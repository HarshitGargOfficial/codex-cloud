const section = document.querySelector('#solar-system');
let started = false;
function loadExplorer() {
  if (started) return;
  started = true;
  import('/solar-system.js').catch(() => {
    document.querySelector('#solar-status').textContent = '3D COULD NOT LOAD · REFRESH TO RETRY';
    document.querySelector('#solar-hint').textContent = 'EXPLORE THE DESTINATION CARDS BELOW';
    section.classList.add('solar-unavailable');
    section.querySelectorAll('button, select').forEach(control => { control.disabled = true; });
  });
}
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); loadExplorer(); } }, { rootMargin: '400px' });
  observer.observe(section);
} else loadExplorer();
section.addEventListener('pointerdown', loadExplorer, { once: true });
section.addEventListener('focusin', loadExplorer, { once: true });
