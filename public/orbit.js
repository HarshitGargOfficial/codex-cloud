'use strict';
const worlds = {
  saturn: { number: '06', name: 'Saturn', subtitle: 'The ringed giant', title: 'A world with a signature.', description: 'Billions of pieces of ice and rock. One extraordinary silhouette. Saturn reminds us that the most beautiful things are often a little unconventional.', distance: '1.4 billion', year: '29.4', type: 'Gas giant' },
  mars: { number: '04', name: 'Mars', subtitle: 'The red planet', title: 'The next chapter of discovery.', description: 'Rust-red deserts, towering volcanoes, and traces of ancient rivers. Our neighboring world holds a billion-year story — and a future we’re still imagining.', distance: '228 million', year: '1.88', type: 'Terrestrial' },
  neptune: { number: '08', name: 'Neptune', subtitle: 'Beyond the blue', title: 'A beautiful kind of far away.', description: 'At the edge of our planetary neighborhood, an ice giant dances in the dark. Neptune’s winds race through an atmosphere where sunlight is only a distant whisper.', distance: '4.5 billion', year: '165', type: 'Ice giant' }
};
const tabs = [...document.querySelectorAll('[data-planet]')];
function selectWorld(tab) {
  const key = tab.dataset.planet;
  const world = worlds[key];
  tabs.forEach(item => { const active = item === tab; item.classList.toggle('active', active); item.setAttribute('aria-selected', String(active)); item.tabIndex = active ? 0 : -1; });
  document.querySelector('.planet-system').dataset.world = key;
  document.querySelector('.cosmos').setAttribute('aria-label', `An illustrated ${world.name} against a star filled sky`);
  document.querySelector('.label-name').textContent = world.name.toUpperCase();
  document.querySelector('.label-detail').textContent = world.subtitle;
  document.querySelector('.cosmic-coordinate').textContent = `${world.number} / SOLAR SYSTEM`;
  document.querySelector('.story-index').textContent = world.number;
  document.querySelector('#planet-title').textContent = world.title;
  document.querySelector('#planet-description').textContent = world.description;
  document.querySelector('#planet-distance').replaceChildren(document.createTextNode(`${world.distance} `), Object.assign(document.createElement('small'), { textContent: 'km' }));
  document.querySelector('#planet-year').replaceChildren(document.createTextNode(`${world.year} `), Object.assign(document.createElement('small'), { textContent: 'Earth years' }));
  document.querySelector('#planet-year').previousElementSibling.textContent = `ONE YEAR ON ${world.name.toUpperCase()}`;
  document.querySelector('#planet-type').textContent = world.type;
  const link = document.querySelector('#planet-link');
  link.href = `https://science.nasa.gov/${key}/`;
  link.replaceChildren(document.createTextNode(`Get to know ${world.name} `), Object.assign(document.createElement('span'), { className: 'arrow-icon' }));
  document.querySelector('#planet-info').setAttribute('aria-labelledby', tab.id);
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectWorld(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); selectWorld(tabs[next]); tabs[next].focus(); }
  });
});
