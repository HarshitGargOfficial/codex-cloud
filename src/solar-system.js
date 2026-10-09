import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { SolarFallback } from './solar-fallback.js';
import { PLANETS, planetByKey } from './planets.js';
import { makePlanetTexture, makeCloudTexture, makeRingTexture, makeGlowTexture } from './planet-textures.js';

const $ = id => document.getElementById(id);
const stage = $('solar-stage'), shell = stage.closest('.solar-shell');
const compact = matchMedia('(max-width: 700px)').matches || (navigator.hardwareConcurrency || 4) <= 4;
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
let reducedMotion = motionPreference.matches;
let renderer, composer, scene, camera, controls, sun, sunMaterial, bloom, labelLayer, fillLight, asteroidBelt;
let running = !reducedMotion, visible = true, failed = false, speed = 1, simTime = 0, elapsed = 0, selected = null;
let transition = null, intro = null, frameId = null, lastTime = 0, tourActive = false, tourIndex = 0, tourElapsed = 0;
let pendingSelection = null, ready = false, flatScene = null;
const planets = [], picks = [], planetButtons = [...shell.querySelectorAll('[data-focus]')];
const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2(), temp = new THREE.Vector3();
const overviewTarget = new THREE.Vector3(0, 0, 0);
const overviewPosition = new THREE.Vector3(0, 66, 91);
const sceneLabels = [];
const smoothstep = t => t * t * (3 - 2 * t);
const random = THREE.MathUtils.seededRandom;

function updatePlayback() {
  $('solar-play').setAttribute('aria-pressed', String(!running));
  $('solar-play').setAttribute('aria-label', running ? 'Pause orbital motion' : 'Resume orbital motion');
  $('solar-play-icon').className = running ? 'playback-icon paused-icon' : 'playback-icon play-icon';
  $('solar-play-text').textContent = running ? 'Pause' : 'Play';
  $('solar-motion-state').textContent = `${running ? 'Playing' : 'Paused'} · ${speed}×`;
}
function setStatus(text) { $('solar-status').textContent = text; }
function stopTour() {
  tourActive = false;
  $('solar-tour').setAttribute('aria-pressed', 'false');
  $('solar-tour').replaceChildren(document.createTextNode('Take the tour '), Object.assign(document.createElement('span'), { className: 'arrow-icon' }));
  if (ready) setStatus(selected ? `${planetByKey[selected].name.toUpperCase()} / PLANET ${planetByKey[selected].number}` : 'LIVE / EIGHT WORLDS IN MOTION');
}
function renderPlanetInfo(key) {
  const planet = planetByKey[key];
  shell.classList.remove('solar-overview');
  selected = key;
  $('solar-kicker').textContent = `PLANET ${planet.number} / ${planet.type.toUpperCase()}`;
  $('solar-name').textContent = planet.name;
  $('solar-subtitle').textContent = planet.subtitle;
  $('solar-description').textContent = planet.description;
  $('solar-facts').hidden = false;
  $('solar-distance').textContent = `${planet.distance} km`;
  $('solar-year').textContent = `${planet.year} Earth years`;
  $('solar-diameter').textContent = `${planet.diameter} km`;
  $('solar-learn').href = `https://science.nasa.gov/${key}/`;
  $('solar-learn').replaceChildren(document.createTextNode(`Discover ${planet.name} `), Object.assign(document.createElement('span'), { className: 'arrow-icon' }));
  planetButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.focus === key)));
  window.dispatchEvent(new CustomEvent('orbit:planet-focused', { detail: key }));
}
function overviewInfo() {
  shell.classList.add('solar-overview');
  selected = null;
  $('solar-kicker').textContent = 'A COSMIC NEIGHBORHOOD';
  $('solar-name').textContent = 'A bigger picture.';
  $('solar-subtitle').textContent = 'A small place in an extraordinary universe.';
  $('solar-description').textContent = 'Follow the light from Mercury to Neptune. Every world has a story. Where will you go first?';
  $('solar-facts').hidden = true;
  $('solar-learn').href = 'https://science.nasa.gov/solar-system/';
  $('solar-learn').replaceChildren(document.createTextNode('Explore with NASA '), Object.assign(document.createElement('span'), { className: 'arrow-icon' }));
  planetButtons.forEach(button => button.setAttribute('aria-pressed', 'false'));
}
function setTransition(key) {
  if (!ready) { pendingSelection = key; return; }
  if (flatScene) { if (!key) flatScene.reset(); return; }
  resize();
  intro = null;
  transition = { key, start: performance.now(), duration: reducedMotion ? 0 : 2000, from: camera.position.clone(), targetFrom: controls.target.clone(), offset: new THREE.Vector3() };
  if (key) {
    const entry = planets.find(item => item.data.key === key);
    const distance = entry.data.radius * (compact ? 6.8 : 5.2) + 2;
    const towardSun = entry.root.position.clone().normalize().multiplyScalar(-distance);
    transition.offset.copy(towardSun).add(new THREE.Vector3(-towardSun.z * .25, distance * .78, towardSun.x * .25));
  }
  controls.enablePan = !key;
  controls.minDistance = key ? planetByKey[key].radius * 2.7 : 12;
  controls.maxDistance = Math.max(240, overviewPosition.length() * 1.4);
}
function focusPlanet(key, fromTour = false) {
  if (!planetByKey[key]) return;
  if (!fromTour) stopTour();
  renderPlanetInfo(key);
  if (!failed) setTransition(key);
  if (!tourActive && ready) setStatus(`${planetByKey[key].name.toUpperCase()} / PLANET ${planetByKey[key].number}`);
}
function resetView() { stopTour(); overviewInfo(); if (!failed) setTransition(null); }

planetButtons.forEach((button, index) => {
  button.addEventListener('click', () => focusPlanet(button.dataset.focus));
  button.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % planetButtons.length;
    if (event.key === 'ArrowLeft') next = (index + planetButtons.length - 1) % planetButtons.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = planetButtons.length - 1;
    if (next !== undefined) { event.preventDefault(); planetButtons[next].focus(); focusPlanet(planetButtons[next].dataset.focus); }
  });
});
window.addEventListener('orbit:select-planet', event => {
  focusPlanet(event.detail);
  $('solar-system').scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'start' });
});
$('solar-play').addEventListener('click', () => { running = !running; if (!running) { intro = null; transition = null; } updatePlayback(); startRendering(); });
document.querySelectorAll('[data-speed]').forEach(button => button.addEventListener('click', () => {
  speed = Number(button.dataset.speed);
  document.querySelectorAll('[data-speed]').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
  updatePlayback();
}));
$('solar-reset').addEventListener('click', resetView);
$('solar-tour').addEventListener('click', () => {
  if (tourActive) { stopTour(); return; }
  if (!ready) return;
  tourActive = true; tourIndex = 0; tourElapsed = 0;
  running = true; updatePlayback();
  $('solar-tour').setAttribute('aria-pressed', 'true');
  $('solar-tour').textContent = 'Stop the tour ×';
  focusPlanet(PLANETS[0].key, true);
  setStatus('GUIDED TOUR / 01 OF 08');
});
$('solar-gestures').addEventListener('click', () => {
  const active = stage.classList.toggle('solar-touch-active');
  $('solar-gestures').setAttribute('aria-pressed', String(active));
  $('solar-gestures').textContent = active ? 'Done exploring · restore scrolling' : 'Enable touch exploration';
  $('solar-hint').textContent = active ? 'DRAG TO ORBIT · PINCH TO ZOOM' : 'CHOOSE A PLANET TO TRAVEL CLOSER';
});
async function toggleFullscreen() {
  try { if (document.fullscreenElement === shell) await document.exitFullscreen(); else await shell.requestFullscreen(); }
  catch { setStatus('FULLSCREEN IS UNAVAILABLE IN THIS BROWSER'); }
}
$('solar-fullscreen').addEventListener('click', toggleFullscreen);
document.addEventListener('fullscreenchange', () => { $('solar-fullscreen').setAttribute('aria-label', document.fullscreenElement === shell ? 'Exit fullscreen' : 'Enter fullscreen'); resize(); });
function zoom(factor) {
  if (!ready || failed) return;
  stopTour(); intro = null; transition = null;
  if (flatScene) { flatScene.setZoom(factor); return; }
  const offset = camera.position.clone().sub(controls.target);
  offset.setLength(THREE.MathUtils.clamp(offset.length() * factor, controls.minDistance, controls.maxDistance));
  camera.position.copy(controls.target).add(offset);
  controls.update();
}
$('solar-zoom-in').addEventListener('click', () => zoom(.8));
$('solar-zoom-out').addEventListener('click', () => zoom(1.25));

const vertexShader = `varying vec3 vPosition; void main(){vPosition=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const noiseShader = `
float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float v=0.;float a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.03+vec3(1.7);a*=.5;}return v;}`;
function buildSun() {
  sunMaterial = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 } }, vertexShader, fragmentShader: `uniform float uTime; varying vec3 vPosition; ${noiseShader}
void main(){vec3 p=normalize(vPosition);float n=fbm(p*18.+vec3(uTime*.04));float veins=fbm(p*55.+n*4.+uTime*.025);float fire=smoothstep(.2,.75,n*.6+veins*.4);vec3 color=mix(vec3(1.2,.18,.012),vec3(4.,2.2,.45),fire);gl_FragColor=vec4(color,1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}` });
  sun = new THREE.Mesh(new THREE.SphereGeometry(3.4, compact ? 48 : 80, compact ? 32 : 64), sunMaterial);
  scene.add(sun);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeGlowTexture(), blending: THREE.AdditiveBlending, transparent: true, opacity: .65, depthWrite: false }));
  glow.scale.set(28, 28, 1); sun.add(glow);
  const sunlight = new THREE.PointLight('#fff0d2', 230, 0, 1.7); scene.add(sunlight);
  scene.add(new THREE.AmbientLight('#a7bddb', .82));
  fillLight = new THREE.DirectionalLight('#d5e1ef', .7);
  scene.add(fillLight, fillLight.target);
}
function atmosphere(radius, color, strength = .5) {
  return new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 32), new THREE.ShaderMaterial({ uniforms: { color: { value: new THREE.Color(color) }, strength: { value: strength } }, vertexShader: `varying vec3 vNormal;varying vec3 vView;void main(){vec4 p=modelViewMatrix*vec4(position,1.);vNormal=normalize(normalMatrix*normal);vView=normalize(-p.xyz);gl_Position=projectionMatrix*p;}`, fragmentShader: `varying vec3 vNormal;varying vec3 vView;uniform vec3 color;uniform float strength;void main(){float edge=pow(1.-abs(dot(normalize(vNormal),normalize(vView))),3.5);gl_FragColor=vec4(color,edge*strength);}`, transparent: true, blending: THREE.AdditiveBlending, side: THREE.FrontSide, depthWrite: false }));
}
function makeRings(radius, color, subtle = false) {
  const inner = radius * (subtle ? 1.5 : 1.3), outer = radius * (subtle ? 1.95 : 2.4);
  const geometry = new THREE.RingGeometry(inner, outer, compact ? 96 : 160);
  const positions = geometry.attributes.position, uv = geometry.attributes.uv;
  for (let i = 0; i < positions.count; i++) { temp.fromBufferAttribute(positions, i); uv.setXY(i, (temp.length() - inner) / (outer - inner), .5); }
  const material = new THREE.MeshBasicMaterial({ map: makeRingTexture(), color, transparent: true, opacity: subtle ? .45 : .95, side: THREE.DoubleSide, depthWrite: false });
  const mesh = new THREE.Mesh(geometry, material); mesh.rotation.x = -Math.PI / 2; return mesh;
}
function buildPlanets() {
  labelLayer = document.createElement('div'); labelLayer.className = 'solar-label-layer'; $('solar-canvas').append(labelLayer);
  for (const data of PLANETS) {
    const root = new THREE.Group(); scene.add(root);
    const axis = new THREE.Group(); axis.rotation.z = THREE.MathUtils.degToRad(data.tilt); root.add(axis);
    const texture = makePlanetTexture(data, compact); texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(data.radius, compact ? 40 : 64, compact ? 24 : 48), new THREE.MeshStandardMaterial({ map: texture, roughness: data.key === 'earth' ? .7 : 1, metalness: 0 }));
    mesh.userData.key = data.key; axis.add(mesh); picks.push(mesh);
    // Invisible enlarged targets keep the smallest worlds easy to select.
    const hit = new THREE.Mesh(new THREE.SphereGeometry(Math.max(data.radius * 1.4, 1.7), 16, 12), new THREE.MeshBasicMaterial({ visible: false })); hit.userData.key = data.key; root.add(hit); picks.push(hit);
    let clouds;
    if (data.key === 'earth') { clouds = new THREE.Mesh(new THREE.SphereGeometry(data.radius * 1.014, 48, 32), new THREE.MeshStandardMaterial({ map: makeCloudTexture(compact), transparent: true, opacity: .7, roughness: 1, depthWrite: false })); axis.add(clouds); axis.add(atmosphere(data.radius * 1.035, '#56a8ff', .65)); }
    if (['venus', 'uranus', 'neptune'].includes(data.key)) axis.add(atmosphere(data.radius * 1.04, data.color, .26));
    if (data.key === 'saturn') axis.add(makeRings(data.radius, '#e0d6b8'));
    if (data.key === 'uranus') axis.add(makeRings(data.radius, '#9cb5bb', true));
    if (data.key === 'earth') { const moon = new THREE.Mesh(new THREE.SphereGeometry(.16, 24, 16), new THREE.MeshStandardMaterial({ color: '#a6a296', roughness: 1 })); moon.position.set(1.6, .1, .4); root.add(moon); }
    const orbitPoints = []; for (let i = 0; i <= 180; i++) { const angle = i / 180 * Math.PI * 2; orbitPoints.push(new THREE.Vector3(Math.cos(angle) * data.orbit, 0, Math.sin(angle) * data.orbit)); }
    const orbit = new THREE.Line(new THREE.BufferGeometry().setFromPoints(orbitPoints), new THREE.LineBasicMaterial({ color: '#8babc9', transparent: true, opacity: .15 })); scene.add(orbit);
    const label = document.createElement('button'); label.type = 'button'; label.className = 'solar-world-label'; label.textContent = data.name; label.setAttribute('aria-label', `Explore ${data.name}`); label.addEventListener('click', () => focusPlanet(data.key)); labelLayer.append(label);
    sceneLabels.push({ root, label, data });
    planets.push({ data, root, mesh, clouds, orbit });
  }
}
function buildStars() {
  const geometry = new THREE.BufferGeometry(), positions = [], colors = [];
  for (let i = 0; i < (compact ? 1400 : 3400); i++) { const theta = random() * Math.PI * 2, cosPhi = random() * 2 - 1, sinPhi = Math.sqrt(1 - cosPhi * cosPhi), radius = 220 + random() * 260; positions.push(radius * sinPhi * Math.cos(theta), radius * cosPhi, radius * sinPhi * Math.sin(theta)); const tint = new THREE.Color().setHSL(.55 + random() * .15, random() * .25, .45 + random() * .45); colors.push(tint.r, tint.g, tint.b); }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const stars = new THREE.Points(geometry, new THREE.PointsMaterial({ size: .45, vertexColors: true, sizeAttenuation: true, transparent: true, opacity: .85 })); scene.add(stars);
  // A diffuse dust cloud adds depth without obscuring the planets.
  const dustGeometry = new THREE.BufferGeometry(), dust = [];
  for (let i = 0; i < 700; i++) { const angle = random() * Math.PI * 2, radius = 145 + random() * 120; dust.push(Math.cos(angle) * radius, (random() - .5) * 36 + 45, Math.sin(angle) * radius); }
  dustGeometry.setAttribute('position', new THREE.Float32BufferAttribute(dust, 3)); scene.add(new THREE.Points(dustGeometry, new THREE.PointsMaterial({ size: 1.5, color: '#698ab5', transparent: true, opacity: .13, depthWrite: false })));
}
function buildAsteroids() {
  const count = compact ? 450 : 1100;
  const belt = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.045, 0), new THREE.MeshStandardMaterial({ color: '#8e8378', roughness: 1 }), count);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < count; i++) { const angle = random() * Math.PI * 2, radius = 22 + random() * 3.2; dummy.position.set(Math.cos(angle) * radius, (random() - .5) * .5, Math.sin(angle) * radius); dummy.rotation.set(random() * Math.PI, random() * Math.PI, random() * Math.PI); dummy.scale.setScalar(.5 + random() * 1.8); dummy.updateMatrix(); belt.setMatrixAt(i, dummy.matrix); }
  asteroidBelt = belt; belt.material.transparent = true; scene.add(belt);
}
function resize() {
  if (failed) return;
  const width = stage.clientWidth, height = stage.clientHeight;
  if (!width || !height) return;
  if (flatScene) { flatScene.resize(width, height); return; }
  if (!renderer) return;
  camera.aspect = width / height;
  const mobile = width <= 700;
  const bounds = { left: mobile ? 25 : 290, right: width - (mobile ? 25 : 70), top: mobile ? 225 : 70, bottom: height - 75 };
  const centerX = (bounds.left + bounds.right) / 2;
  const centerY = selected ? (mobile ? height * .69 : height * .5) : (bounds.top + bounds.bottom) / 2;
  camera.setViewOffset(width, height, width / 2 - centerX, height / 2 - centerY, width, height);
  camera.updateProjectionMatrix(); renderer.setSize(width, height);
  if (composer) composer.setSize(width, height);
  // Fit the entire outer orbit, including planet geometry, in the usable area.
  const fitCamera = camera.clone();
  const direction = new THREE.Vector3(0, 1.25, 1).normalize();
  let distance = 90;
  for (let attempt = 0; attempt < 100; attempt++) {
    fitCamera.position.copy(direction).multiplyScalar(distance); fitCamera.lookAt(overviewTarget); fitCamera.updateMatrixWorld();
    let fits = true;
    for (let i = 0; i < 72; i++) {
      const angle = i / 72 * Math.PI * 2;
      temp.set(Math.cos(angle) * 66, 0, Math.sin(angle) * 66).project(fitCamera);
      const x = (temp.x + 1) / 2 * width, y = (1 - temp.y) / 2 * height;
      if (x < bounds.left || x > bounds.right || y < bounds.top || y > bounds.bottom) { fits = false; break; }
    }
    if (fits) break;
    distance *= 1.045;
  }
  overviewPosition.copy(direction).multiplyScalar(distance);
  controls.maxDistance = Math.max(240, distance * 1.4);
  if (ready && !selected && !transition && !intro) { camera.position.copy(overviewPosition); controls.target.copy(overviewTarget); }

}
function updateOrbits() {
  for (const planet of planets) {
    const angle = planet.data.phase + simTime * .26 / Math.sqrt(planet.data.period);
    planet.root.position.set(Math.cos(angle) * planet.data.orbit, 0, Math.sin(angle) * planet.data.orbit);
    planet.mesh.rotation.y = elapsed * .08 * (planet.data.key === 'venus' ? -1 : 1);
    if (planet.clouds) planet.clouds.rotation.y = elapsed * .1;
    planet.mesh.parent.scale.setScalar(selected ? 1 : Math.max(1, 1.05 / planet.data.radius));
    planet.orbit.material.opacity = selected ? (selected === planet.data.key ? .32 : .06) : .15;
    planet.orbit.material.color.set(selected === planet.data.key ? '#e79656' : '#8babc9');
  }
}
function updateCamera(now, previousSelectedPosition) {
  if (transition) {
    const focus = transition.key ? planets.find(item => item.data.key === transition.key).root.position : overviewTarget;
    const destination = transition.key ? focus.clone().add(transition.offset) : overviewPosition;
    const progress = transition.duration === 0 ? 1 : Math.min(1, (now - transition.start) / transition.duration);
    const eased = smoothstep(progress);
    camera.position.lerpVectors(transition.from, destination, eased);
    controls.target.lerpVectors(transition.targetFrom, focus, eased);
    if (progress === 1) transition = null;
  } else if (intro) {
    const progress = Math.min(1, (now - intro.start) / 4500);
    camera.position.lerpVectors(intro.from, overviewPosition, smoothstep(progress));
    if (progress === 1) intro = null;
  } else if (selected && previousSelectedPosition) {
    const current = planets.find(item => item.data.key === selected).root.position;
    const delta = current.clone().sub(previousSelectedPosition); camera.position.add(delta); controls.target.add(delta);
  }
  controls.update();
}
function updateLabels() {
  const width = stage.clientWidth, height = stage.clientHeight;
  for (const { root, label, data } of sceneLabels) {
    temp.copy(root.position); temp.y += Math.max(data.radius, 1.05) + .8; temp.project(camera);
    const x = (temp.x + 1) / 2 * width, y = (1 - temp.y) / 2 * height;
    const hidden = selected || temp.z > 1 || temp.z < -1 || x < 20 || x > width - 40 || y < 60 || y > height - 60 || (width > 700 && x < 282 && y < 420) || (width <= 700 && y < 205);
    label.hidden = Boolean(hidden); label.style.transform = `translate(${x}px,${y}px) translate(-50%,0)`;
  }
}
let averageFrame = 16, sampleCount = 0;
function animate(now) {
  frameId = null;
  if (!visible || document.hidden || failed) { lastTime = 0; return; }
  const wallDt = lastTime ? (now - lastTime) / 1000 : 0;
  const dt = Math.min(wallDt, .06);
  if (!flatScene && lastTime && sampleCount < 180) { averageFrame = averageFrame * .95 + (now - lastTime) * .05; sampleCount++; if (sampleCount === 180 && averageFrame > 34 && composer) { composer.dispose(); composer = null; renderer.setPixelRatio(1); resize(); } }
  lastTime = now;
  const oldPosition = !flatScene && selected ? planets.find(item => item.data.key === selected).root.position.clone() : null;
  if (running) { simTime += dt * speed; elapsed += dt; }
  if (!flatScene) {
  updateOrbits(); updateCamera(now, oldPosition); updateLabels();
  fillLight.position.copy(camera.position); fillLight.position.y += 15; fillLight.target.position.copy(controls.target);
  fillLight.intensity = selected ? .9 : .45;
  asteroidBelt.material.opacity = selected ? .15 : 1;
  sunMaterial.uniforms.uTime.value = elapsed;
  if (running) sun.rotation.y += dt * .015;
  }
  if (tourActive && running) { tourElapsed += wallDt; if (tourElapsed >= (reducedMotion ? 10 : 8)) { tourElapsed = 0; tourIndex++; if (tourIndex >= PLANETS.length) stopTour(); else { focusPlanet(PLANETS[tourIndex].key, true); setStatus(`GUIDED TOUR / ${String(tourIndex + 1).padStart(2, '0')} OF 08`); } } }
  if (flatScene) flatScene.render(simTime, selected);
  else if (composer) composer.render(); else renderer.render(scene, camera);
  frameId = requestAnimationFrame(animate);
}
function startRendering() { if (ready && !failed && visible && !document.hidden && frameId === null) { lastTime = 0; frameId = requestAnimationFrame(animate); } }
function stopRendering() { if (frameId !== null) cancelAnimationFrame(frameId); frameId = null; lastTime = 0; }
function attachPicking() {
  let down = null;
  function hitTest(event) { const rect = renderer.domElement.getBoundingClientRect(); pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1); raycaster.setFromCamera(pointer, camera); return raycaster.intersectObjects(picks, false)[0]; }
  renderer.domElement.addEventListener('pointerdown', event => { down = { x: event.clientX, y: event.clientY }; });
  renderer.domElement.addEventListener('pointerup', event => { if (!down) return; const distance = Math.hypot(event.clientX - down.x, event.clientY - down.y); down = null; if (distance < 6) { const hit = hitTest(event); if (hit) focusPlanet(hit.object.userData.key); } });
  renderer.domElement.addEventListener('pointercancel', () => { down = null; });
  renderer.domElement.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || down) return;
    const hit = hitTest(event); $('solar-hover').hidden = !hit; renderer.domElement.style.cursor = hit ? 'pointer' : 'grab';
    if (hit) { const rect = stage.getBoundingClientRect(); $('solar-hover').textContent = planetByKey[hit.object.userData.key].name; $('solar-hover').style.left = `${Math.min(stage.clientWidth - 95, event.clientX - rect.left + 14)}px`; $('solar-hover').style.top = `${Math.min(stage.clientHeight - 35, event.clientY - rect.top + 14)}px`; }
  });
  renderer.domElement.addEventListener('pointerleave', () => { $('solar-hover').hidden = true; });
  controls.addEventListener('start', () => { stopTour(); transition = null; intro = null; });
}
function observeVisibility() {
  new ResizeObserver(resize).observe(stage);
  const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) startRendering(); else stopRendering(); }, { threshold: .01 }); observer.observe(shell);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopRendering(); else startRendering(); });
}
function fallback() {
  stopRendering(); stopTour();
  if (labelLayer) labelLayer.remove();
  if (controls) controls.dispose();
  if (renderer) { renderer.dispose(); renderer.domElement.remove(); renderer = null; }
  if (composer) { composer.dispose(); composer = null; }
  flatScene = new SolarFallback($('solar-canvas'), key => focusPlanet(key));
  failed = false; ready = true; shell.classList.add('solar-ready', 'solar-flat-mode'); shell.dataset.ready = 'true'; shell.dataset.renderer = 'svg';
  $('solar-hint').textContent = 'SELECT A PLANET · PAUSE OR CHANGE ORBIT SPEED';
  $('solar-gestures').hidden = true;
  resize(); observeVisibility(); updatePlayback();
  setStatus('LIVE / EIGHT WORLDS IN MOTION');
  if (pendingSelection) focusPlanet(pendingSelection);
  startRendering();
}
async function initialize() {
  shell.classList.add('solar-overview');
  updatePlayback();
  if (!shell.requestFullscreen) $('solar-fullscreen').hidden = true;
  if (compact) $('solar-hint').textContent = 'CHOOSE A PLANET TO TRAVEL CLOSER';
  try {
    renderer = new THREE.WebGLRenderer({ antialias: !compact, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, compact ? 1.4 : 1.75)); renderer.setClearColor('#000000', 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .9; renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute('aria-label', 'Interactive 3D solar system. Use the planet buttons to select a world, or drag to rotate the view.');
    renderer.domElement.setAttribute('role', 'img');
    $('solar-canvas').append(renderer.domElement);
    renderer.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); fallback('3D PAUSED / GRAPHICS CONNECTION LOST'); });
    scene = new THREE.Scene(); camera = new THREE.PerspectiveCamera(46, 1, .05, 1200); camera.position.copy(overviewPosition);
    controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.dampingFactor = .055; controls.minDistance = 12; controls.maxDistance = 240; controls.maxPolarAngle = Math.PI * .89; controls.zoomSpeed = .6; controls.rotateSpeed = .45; controls.panSpeed = .6;
    buildSun();
    // Give the loading message a frame before generating the surface maps.
    await new Promise(resolve => requestAnimationFrame(resolve));
    if (flatScene) return;
    buildPlanets(); buildStars(); buildAsteroids(); updateOrbits();
    if (!compact) { composer = new EffectComposer(renderer); composer.addPass(new RenderPass(scene, camera)); bloom = new UnrealBloomPass(new THREE.Vector2(stage.clientWidth, stage.clientHeight), .65, .55, 1.5); composer.addPass(bloom); composer.addPass(new OutputPass()); }
    resize(); controls.target.copy(overviewTarget); camera.position.copy(overviewPosition);
    if (!reducedMotion && running) { const from = overviewPosition.clone().multiplyScalar(1.18); from.x = 16; intro = { start: performance.now(), from }; camera.position.copy(from); }
    attachPicking();
    ready = true; shell.classList.add('solar-ready'); shell.dataset.ready = 'true'; shell.dataset.renderer = 'webgl';
    setStatus('LIVE / EIGHT WORLDS IN MOTION');
    observeVisibility();

    if (pendingSelection) focusPlanet(pendingSelection);
    startRendering();
  } catch (error) { console.warn('Solar explorer fallback:', error.message); fallback('STATIC EXPLORER / 3D IS UNAVAILABLE'); }
}
motionPreference.addEventListener('change', event => { reducedMotion = event.matches; if (reducedMotion) { running = false; intro = null; if (transition) transition.duration = 0; updatePlayback(); } });
initialize();
