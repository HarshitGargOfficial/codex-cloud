import { PLANETS } from './planets.js';
const NS = 'http://www.w3.org/2000/svg';
function svgNode(name, attributes = {}) { const node = document.createElementNS(NS, name); for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value); return node; }

// This renderer uses the same clock and controls as the WebGL scene.
export class SolarFallback {
  constructor(container, onSelect) {
    this.container = container; this.zoom = 1; this.nodes = [];
    this.svg = svgNode('svg', { class: 'solar-flat-scene', role: 'img', 'aria-label': 'Animated solar system with all eight planets', preserveAspectRatio: 'none' });
    const defs = svgNode('defs'); this.svg.append(defs);
    const sunGradient = svgNode('radialGradient', { id: 'flat-sun' });
    for (const [offset, color] of [['0%', '#fff8c4'], ['70%', '#ffc466'], ['100%', '#e78433']]) sunGradient.append(svgNode('stop', { offset, 'stop-color': color })); defs.append(sunGradient);
    const halo = svgNode('radialGradient', { id: 'flat-halo' }); halo.append(svgNode('stop', { offset: '0%', 'stop-color': '#e79656', 'stop-opacity': '.6' }), svgNode('stop', { offset: '100%', 'stop-color': '#e79656', 'stop-opacity': '0' })); defs.append(halo);
    for (const planet of PLANETS) { const gradient = svgNode('radialGradient', { id: `flat-${planet.key}`, cx: '.3', cy: '.25', r: '.8' }); gradient.append(svgNode('stop', { offset: '0%', 'stop-color': planet.palette[2] }), svgNode('stop', { offset: '55%', 'stop-color': planet.color }), svgNode('stop', { offset: '100%', 'stop-color': planet.palette[0] })); defs.append(gradient); }
    this.stars = svgNode('g', { fill: '#ccd9e9' });
    for (let i = 0; i < 120; i++) this.stars.append(svgNode('circle', { cx: (Math.sin(i * 127.1) * 43758.5 % 1 + 1) % 1 * 1000, cy: (Math.sin(i * 311.7) * 43758.5 % 1 + 1) % 1 * 1000, r: i % 3 ? '.65' : '1', opacity: '.35' })); this.svg.append(this.stars);
    this.orbits = svgNode('g', { fill: 'none', stroke: '#536b84', 'stroke-opacity': '.35', 'stroke-width': '.8' }); this.svg.append(this.orbits);
    this.sunHalo = svgNode('circle', { fill: 'url(#flat-halo)' }); this.sun = svgNode('circle', { fill: 'url(#flat-sun)' }); this.svg.append(this.sunHalo, this.sun);
    for (const [index, planet] of PLANETS.entries()) {
      const orbit = svgNode('ellipse'); this.orbits.append(orbit);
      const group = svgNode('g', { class: 'solar-flat-planet', 'data-flat-planet': planet.key, tabindex: '0', role: 'button', 'aria-label': `Explore ${planet.name}` });
      const hit = svgNode('circle', { r: 17, fill: 'transparent' });
      const sphere = svgNode('circle', { fill: `url(#flat-${planet.key})`, stroke: planet.color, 'stroke-opacity': '.2' }); group.append(hit, sphere);
      let ring;
      if (planet.key === 'saturn' || planet.key === 'uranus') { ring = svgNode('ellipse', { fill: 'none', stroke: planet.color, 'stroke-width': planet.key === 'saturn' ? '3' : '1', 'stroke-opacity': '.7', transform: 'rotate(-24)' }); group.append(ring); }
      const label = svgNode('text', { 'text-anchor': 'middle', fill: '#c1ccd5', 'font-size': '9', 'font-family': 'DM Sans, sans-serif' }); label.textContent = planet.name; group.append(label);
      group.addEventListener('click', () => onSelect(planet.key)); group.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(planet.key); } });
      this.svg.append(group); this.nodes.push({ planet, index, group, sphere, ring, label, orbit });
    }
    container.append(this.svg);
  }
  resize(width, height) { this.width = width; this.height = height; this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`); }
  setZoom(factor) { this.zoom = Math.max(.7, Math.min(2, this.zoom / factor)); }
  reset() { this.zoom = 1; }
  render(time, selected) {
    const mobile = this.width <= 700;
    const left = mobile ? 25 : 290, right = this.width - (mobile ? 25 : 70);
    const top = mobile ? (selected ? 70 : 225) : 70, bottom = this.height - 80;
    const centerX = (left + right) / 2, centerY = (top + bottom) / 2;
    const maxRadius = Math.max(40, Math.min((right - left) / 2 - 16, (bottom - top) / 2 - 24));
    this.sun.setAttribute('cx', centerX); this.sun.setAttribute('cy', centerY); this.sun.setAttribute('r', mobile ? 10 : 18);
    this.sunHalo.setAttribute('cx', centerX); this.sunHalo.setAttribute('cy', centerY); this.sunHalo.setAttribute('r', mobile ? 40 : 75);
    for (const node of this.nodes) {
      const radius = maxRadius * (node.index + 1) / 8 * this.zoom;
      const angle = node.planet.phase + time * .26 / Math.sqrt(node.planet.period);
      const x = centerX + Math.cos(angle) * radius, y = centerY + Math.sin(angle) * radius;
      node.group.setAttribute('transform', `translate(${x.toFixed(3)} ${y.toFixed(3)})`);
      node.orbit.setAttribute('cx', centerX); node.orbit.setAttribute('cy', centerY); node.orbit.setAttribute('rx', radius); node.orbit.setAttribute('ry', radius);
      node.orbit.setAttribute('stroke', selected === node.planet.key ? '#e79656' : '#536b84');
      const size = Math.max(mobile ? 3 : 4, node.planet.radius * (mobile ? 3 : 4)) * (selected === node.planet.key ? 1.35 : 1);
      node.sphere.setAttribute('r', size); node.group.setAttribute('aria-pressed', String(selected === node.planet.key));
      if (node.ring) { node.ring.setAttribute('rx', size * 1.9); node.ring.setAttribute('ry', size * .6); }
      node.label.setAttribute('y', size + (mobile ? 10 : 13)); node.label.setAttribute('font-size', mobile ? '7' : '9');
    }
  }
}
