const nav = document.querySelector('.orbit-nav');
const navLinks = [...nav.querySelectorAll('[data-section]')];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let sideMode = false, navAnimation = null, scheduled = false;
function morphNavigation(side) {
  if (side === sideMode) return;
  navAnimation?.cancel();
  const before = nav.getBoundingClientRect();
  sideMode = side;
  nav.classList.toggle('is-side', side);
  if (reducedMotion.matches) return;
  const after = nav.getBoundingClientRect();
  const base = getComputedStyle(nav).transform;
  const dx = before.left - after.left, dy = before.top - after.top;
  nav.classList.add('is-morphing');
  navAnimation = nav.animate([
    { transform: `translate(${dx}px, ${dy}px) ${base === 'none' ? '' : base} scale(${before.width / after.width}, ${before.height / after.height})`, borderRadius: '24px' },
    { transform: base, borderRadius: side ? '28px' : '24px' }
  ], { duration: 520, easing: 'cubic-bezier(.22,1,.36,1)' });
  const current = navAnimation;
  current.finished.catch(() => {}).then(() => { if (navAnimation === current) { nav.classList.remove('is-morphing'); navAnimation = null; } });
}
function updateNavigation() {
  scheduled = false;
  morphNavigation(window.scrollY > 72);
  let active = 'top';
  for (const link of navLinks.slice(1)) {
    if (document.getElementById(link.dataset.section).getBoundingClientRect().top <= innerHeight * .38) active = link.dataset.section;
  }
  for (const link of navLinks) {
    if (link.dataset.section === active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
}
window.addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateNavigation); } }, { passive: true });
window.addEventListener('resize', () => { navAnimation?.cancel(); nav.classList.remove('is-morphing'); updateNavigation(); });
navLinks[0].addEventListener('click', event => { event.preventDefault(); window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' }); });
reducedMotion.addEventListener('change', event => { if (event.matches) { navAnimation?.cancel(); nav.classList.remove('is-morphing'); } });
updateNavigation();

// Pointer light follows the surface of the larger interactive cards.
for (const surface of document.querySelectorAll('.destination, .solar-panel')) {
  surface.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse') return;
    const bounds = surface.getBoundingClientRect();
    surface.style.setProperty('--hover-x', `${event.clientX - bounds.left}px`);
    surface.style.setProperty('--hover-y', `${event.clientY - bounds.top}px`);
  }, { passive: true });
}
