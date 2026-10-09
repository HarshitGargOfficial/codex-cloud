import * as THREE from 'three';

// Deterministic, seamless textures are made locally; no third-party image requests.
const fract = value => value - Math.floor(value);
const hash = (x, y) => fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453);
function noise(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  return THREE.MathUtils.lerp(THREE.MathUtils.lerp(hash(ix, iy), hash(ix + 1, iy), u), THREE.MathUtils.lerp(hash(ix, iy + 1), hash(ix + 1, iy + 1), u), v);
}
function fbm(x, y) { return noise(x, y) * .55 + noise(x * 2.1, y * 2.1) * .28 + noise(x * 4.3, y * 4.3) * .12 + noise(x * 8.1, y * 8.1) * .05; }
function canvas(width, height) { const element = document.createElement('canvas'); element.width = width; element.height = height; return element; }
function texture(element, color = true) { const map = new THREE.CanvasTexture(element); if (color) map.colorSpace = THREE.SRGBColorSpace; map.wrapS = THREE.RepeatWrapping; return map; }
function polygon(ctx, points, width, height) {
  ctx.beginPath(); points.forEach(([lon, lat], index) => { const x = (lon + 180) / 360 * width, y = (90 - lat) / 180 * height; if (!index) ctx.moveTo(x, y); else ctx.lineTo(x, y); }); ctx.closePath(); ctx.fill();
}
const continents = [
  [[-168,68],[-140,70],[-125,60],[-105,73],[-82,62],[-60,52],[-80,42],[-82,27],[-98,17],[-105,22],[-117,32],[-128,51],[-155,58]],
  [[-81,12],[-62,9],[-49,0],[-35,-8],[-40,-23],[-55,-35],[-68,-55],[-74,-40],[-80,-10]],
  [[-17,35],[2,37],[20,32],[34,31],[43,11],[50,2],[37,-18],[20,-35],[12,-25],[8,-6],[-10,5],[-17,18]],
  [[-10,36],[-10,58],[5,62],[15,71],[40,68],[60,75],[110,73],[145,59],[179,65],[160,45],[140,35],[120,22],[108,4],[100,7],[82,8],[72,22],[50,28],[35,40],[26,40],[18,48],[2,44]],
  [[112,-12],[130,-11],[143,-12],[153,-27],[145,-39],[125,-35],[113,-23]],
  [[-53,59],[-44,62],[-22,76],[-30,83],[-50,81],[-62,71]],
  [[47,-13],[51,-16],[49,-25],[44,-25]], [[130,32],[137,38],[144,44],[146,40],[140,34]], [[166,-35],[177,-39],[173,-46],[166,-45]],
  [[95,5],[106,-6],[122,-8],[132,-4],[113,1]], [[-180,-73],[-120,-70],[-60,-76],[0,-70],[60,-75],[120,-71],[180,-73],[180,-90],[-180,-90]]
];
export function makePlanetTexture(planet, compact) {
  const width = compact ? 512 : 1024, height = width / 2;
  const surface = canvas(width, height), ctx = surface.getContext('2d');
  const pixels = ctx.createImageData(width, height);
  const colors = planet.palette.map(hex => { const color = new THREE.Color(hex); return [color.r * 255, color.g * 255, color.b * 255]; });
  // Palette values are converted back to sRGB when writing the canvas.
  planet.palette.forEach((hex, i) => { const raw = parseInt(hex.slice(1), 16); colors[i] = [raw >> 16, raw >> 8 & 255, raw & 255]; });
  const banded = ['jupiter', 'saturn', 'venus', 'uranus', 'neptune'].includes(planet.key);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const phi = x / width * Math.PI * 2;
      const nx = Math.cos(phi) * 7 + 20, ny = y / height * 14 + Math.sin(phi) * 2;
      const n = fbm(nx + planet.number * 3, ny);
      const bands = .5 + .5 * Math.sin(y / height * (planet.key === 'jupiter' ? 75 : 120) + n * 1.7);
      let value = banded ? n * .45 + bands * .55 : n;
      if (planet.key === 'uranus') value = .48 + (value - .5) * .2;
      if (planet.key === 'neptune') value = .55 + (value - .5) * .5;
      const lo = value < .5 ? colors[0] : colors[1], hi = value < .5 ? colors[1] : colors[2];
      const t = value < .5 ? value * 2 : (value - .5) * 2, offset = (y * width + x) * 4;
      for (let channel = 0; channel < 3; channel++) pixels.data[offset + channel] = THREE.MathUtils.lerp(lo[channel], hi[channel], t);
      pixels.data[offset + 3] = 255;
    }
  }
  ctx.putImageData(pixels, 0, 0);
  if (planet.key === 'earth') {
    const land = canvas(width, height), landCtx = land.getContext('2d');
    const gradient = landCtx.createLinearGradient(0, 0, 0, height); gradient.addColorStop(0, '#e6e8d5'); gradient.addColorStop(.27, '#5d7350'); gradient.addColorStop(.43, '#b7a26c'); gradient.addColorStop(.57, '#476c45'); gradient.addColorStop(.75, '#73845e'); gradient.addColorStop(1, '#e2e8e4'); landCtx.fillStyle = gradient;
    continents.forEach(points => polygon(landCtx, points, width, height));
    landCtx.globalCompositeOperation = 'source-atop';
    for (let i = 0; i < 12000; i++) { const x = hash(i, 1) * width, y = hash(i, 2) * height; landCtx.fillStyle = i % 2 ? '#ffffff10' : '#152b1714'; landCtx.fillRect(x, y, 3, 2); }
    ctx.drawImage(land, 0, 0);
  }
  if (planet.key === 'mercury' || planet.key === 'mars') {
    for (let i = 0; i < 280; i++) { const x = hash(i, 7) * width, y = hash(i, 12) * height, radius = 1 + hash(i, 3) * width * .018; const crater = ctx.createRadialGradient(x + radius * .2, y + radius * .2, 0, x, y, radius); crater.addColorStop(0, '#1b171b44'); crater.addColorStop(.65, '#19131920'); crater.addColorStop(.84, '#ffe9cb30'); crater.addColorStop(1, '#fff0'); ctx.fillStyle = crater; ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2); }
    if (planet.key === 'mars') { ctx.fillStyle = '#eee0bf'; ctx.beginPath(); ctx.ellipse(width / 2, 0, width / 2, height * .055, 0, 0, Math.PI * 2); ctx.fill(); }
  }
  if (planet.key === 'jupiter') {
    ctx.save(); ctx.translate(width * .67, height * .62); ctx.scale(1, .47); const storm = ctx.createRadialGradient(0, 0, 0, 0, 0, width * .075); storm.addColorStop(0, '#c5936e'); storm.addColorStop(.45, '#a75d3f'); storm.addColorStop(.73, '#c67e51'); storm.addColorStop(1, '#caa48500'); ctx.fillStyle = storm; ctx.beginPath(); ctx.arc(0, 0, width * .075, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  return texture(surface);
}
export function makeCloudTexture(compact) {
  const width = compact ? 512 : 1024, height = width / 2, surface = canvas(width, height), ctx = surface.getContext('2d'), pixels = ctx.createImageData(width, height);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) { const phi = x / width * Math.PI * 2, n = fbm(Math.cos(phi) * 11 + 73, y / height * 27 + Math.sin(phi) * 4); const offset = (y * width + x) * 4; pixels.data[offset] = pixels.data[offset + 1] = pixels.data[offset + 2] = 255; pixels.data[offset + 3] = Math.max(0, (n - .51) * 650); }
  ctx.putImageData(pixels, 0, 0); return texture(surface);
}
export function makeRingTexture() {
  const surface = canvas(1024, 1), ctx = surface.getContext('2d');
  for (let x = 0; x < 1024; x++) { const t = x / 1024, gap = t > .57 && t < .61; const alpha = gap ? .04 : .32 + hash(x, 33) * .4 + Math.sin(t * 260) * .13; ctx.fillStyle = `rgba(${175 + Math.floor(hash(x, 9) * 50)},${154 + Math.floor(hash(x, 9) * 44)},${114 + Math.floor(hash(x, 9) * 36)},${alpha})`; ctx.fillRect(x, 0, 1, 1); }
  return texture(surface);
}
export function makeGlowTexture() {
  const surface = canvas(256, 256), ctx = surface.getContext('2d'), gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128); gradient.addColorStop(0, '#fff3d0'); gradient.addColorStop(.18, '#ffb76dbb'); gradient.addColorStop(.42, '#e8792a44'); gradient.addColorStop(.7, '#b44e0c10'); gradient.addColorStop(1, '#0000'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, 256, 256); return texture(surface);
}
