const eras = [
  { short: 'Frontier', name: 'The earliest frontier', title: 'Before the\nfirst light.', detail: 'The edge of what we know.', time: '< 10⁻⁴³ seconds', temp: 'Beyond tested physics', color: [255, 222, 181], description: 'Trace our expanding universe backward and it becomes hotter and denser. At the earliest frontier, our current theories cannot reliably describe what happened. We do not yet know whether time had an absolute beginning, or what a theory of quantum gravity will reveal.', insight: 'The familiar “singularity” is a limit of an extrapolated theory, not a photographed point or a confirmed physical object.', state: 'An extreme regime beyond established models', process: 'Gravity and quantum physics need a common description', evidenceLabel: 'AN OPEN QUESTION', evidence: 'The hot Big Bang is well supported. The very first instant is not yet described by a tested theory.' },
  { short: 'Inflation', name: 'Cosmic inflation', title: 'Space.\nAt extraordinary speed.', detail: 'A breathtaking stretch of space.', time: '~10⁻³⁶ – 10⁻³² seconds', temp: 'Model dependent', color: [255, 187, 123], description: 'In inflationary models, space briefly expands at an extraordinary rate. Tiny quantum fluctuations are stretched to cosmic scales, potentially providing the seeds of future galaxies. When inflation ends, energy is converted into a hot bath of particles in a process called reheating.', insight: 'Distances can grow faster than light because space expands. Nothing locally has to travel through space faster than light.', state: 'A rapidly expanding, nearly uniform universe', process: 'Quantum fluctuations become seeds of structure', evidenceLabel: 'A LEADING HYPOTHESIS', evidence: 'The near-flat geometry and patterns in the cosmic microwave background agree with many inflationary models. The mechanism and exact timing remain uncertain.' },
  { short: 'Particles', name: 'The particle era', title: 'Energy becomes\na cosmic soup.', detail: 'The ingredients of everything.', time: '~10⁻⁶ seconds – 1 second', temp: '~10¹³ → 10¹⁰ K', color: [255, 133, 99], description: 'The universe cools enough for quarks to become bound into protons and neutrons. Particles and antiparticles collide and annihilate, leaving a tiny excess of matter. Photons, electrons, neutrinos, and other particles fill a dense, energetic cosmos.', insight: 'Why matter won over antimatter is still a major unsolved question. Without that small imbalance, there would be no ordinary matter to make us.', state: 'Hot particles, radiation, protons, and neutrons', process: 'Cooling allows stable building blocks to emerge', evidenceLabel: 'PARTICLE PHYSICS MEETS COSMOLOGY', evidence: 'Accelerators probe the physics of hot matter. Relic radiation and light-element abundances constrain this early thermal history.' },
  { short: 'Nuclei', name: 'Primordial nucleosynthesis', title: 'The first\natomic hearts.', detail: 'Three minutes that shaped the cosmos.', time: '~3 – 20 minutes', temp: '~10⁹ → 10⁸ K', color: [249, 164, 101], description: 'Protons and neutrons fuse into the nuclei of light elements, especially helium. By mass, ordinary matter emerges as roughly three-quarters hydrogen and one-quarter helium, with traces of deuterium and lithium. The universe then becomes too cool and diffuse for this early fusion to continue.', insight: 'These are nuclei, not neutral atoms. Carbon, oxygen, and most heavier elements will arrive much later through stars and stellar explosions.', state: 'Hydrogen and helium nuclei in a radiation bath', process: 'Nuclear fusion builds the first light elements', evidenceLabel: 'A KEY PIECE OF EVIDENCE', evidence: 'Observed primordial deuterium and helium broadly match predictions of Big Bang nucleosynthesis. The amount of lithium remains a puzzle.' },
  { short: 'First light', name: 'Recombination', title: 'The universe\nturns transparent.', detail: 'A light that still reaches us.', time: '~380,000 years', temp: '~3,000 K', color: [237, 178, 107], description: 'Electrons join nuclei to form neutral atoms. With fewer free electrons scattering photons, light can finally travel freely across vast distances. That ancient light is still here: stretched by expansion into the cosmic microwave background, a faint glow across the entire sky.', insight: 'The cosmic microwave background is not light from the first instant. It shows the universe when it became transparent, hundreds of thousands of years later.', state: 'Neutral gas; photons begin traveling freely', process: 'Recombination releases the oldest light we can directly see', evidenceLabel: 'THE UNIVERSE’S BABY PORTRAIT', evidence: 'COBE, WMAP, and Planck measured this near-perfect thermal glow and its tiny temperature variations. Today its temperature is about 2.725 K.' },
  { short: 'Dark ages', name: 'The cosmic dark ages', title: 'A long quiet.\nThen gravity.', detail: 'Darkness with a future inside it.', time: '~380,000 – 100 million years', temp: 'Gas cools as space expands', color: [130, 153, 240], description: 'There are no stars yet. Mostly neutral hydrogen and helium drift through a darkening universe as the background glow fades. Gravity amplifies small density differences, drawing gas into halos shaped largely by dark matter. The foundations of the cosmic web slowly take form.', insight: 'Dark matter does not glow, but its gravity helps organize the gas that will eventually light up as stars and galaxies.', state: 'Neutral gas falling into growing dark matter halos', process: 'Gravitational collapse turns tiny differences into structure', evidenceLabel: 'AN ACTIVE RESEARCH FRONTIER', evidence: 'Simulations connect early fluctuations to later structure. Astronomers seek the faint 21-centimeter signal of hydrogen to explore this era directly.' },
  { short: 'First stars', name: 'Cosmic dawn', title: 'Darkness meets\nits first stars.', detail: 'The first lights change everything.', time: '~100 million – 1 billion years', temp: 'Cold gas; extremely hot stellar cores', color: [160, 185, 255], description: 'Dense clouds collapse and ignite the first stars. Galaxies grow as gas collects and halos merge. Ultraviolet light from early sources gradually ionizes intergalactic hydrogen again, ending the cosmic dark ages through reionization. Stars begin forging heavier elements.', insight: 'The exact birth date and properties of the very first stars remain uncertain. They are expected to have formed from almost entirely hydrogen and helium.', state: 'Young stars and galaxies in a changing gas environment', process: 'Fusion ignites; ultraviolet light reionizes hydrogen', evidenceLabel: 'LOOKING BACK WITH TELESCOPES', evidence: 'Distant galaxies observed by Hubble and Webb reveal early structure. Absorption in quasar spectra and the microwave background constrain reionization.' },
  { short: 'Today', name: 'The evolving universe', title: 'Galaxies. Worlds.\nAnd us.', detail: 'The story is still expanding.', time: '~13.8 billion years', temp: 'Background radiation: 2.725 K', color: [179, 178, 255], description: 'Billions of galaxies trace a vast web of filaments around enormous voids. Generations of stars enrich gas with elements that become planets and living things. Our solar system forms about 4.6 billion years ago. Today, the expansion of the universe is accelerating, an effect attributed to dark energy.', insight: 'The observable universe is about 93 billion light-years across. Its radius exceeds 13.8 billion light-years because space expanded while the light was traveling.', state: 'A cosmic web of galaxies, gas, dark matter, and vast voids', process: 'Stars recycle matter while expansion accelerates', evidenceLabel: 'A STORY BUILT FROM MANY OBSERVATIONS', evidence: 'Galaxy redshifts, the cosmic microwave background, light elements, and supernova measurements together support modern cosmology. Dark matter and dark energy remain poorly understood.' }
];
const shell = document.querySelector('.bang-shell');
if (shell) {
  const canvas = document.getElementById('bang-canvas'), ctx = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const range = document.getElementById('bang-scrub'), play = document.getElementById('bang-play');
  const rail = shell.querySelector('.bang-epochs');
  let progress = 0, playing = false, visible = false, frame = 0, last = 0, chapter = -1, width = 1, height = 1, clock = 0;
  let seed = 73;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const particles = Array.from({length: 800}, () => ({ x: random(), y: random(), z: random(), angle: random()*Math.PI*2, r: random(), size: random()*1.5+.35, phase: random()*6.28, cluster: Math.floor(random()*14) }));
  const clusters = Array.from({length:14}, () => ({x:random()*.86+.07,y:random()*.76+.12}));
  const buttons = eras.map((era, index) => {
    const b = document.createElement('button'); b.type = 'button'; b.innerHTML = `<small>${String(index+1).padStart(2,'0')}</small><span>${era.short}</span>`;
    b.addEventListener('click', () => { setPlaying(false); setProgress(index / 8 + .045); });
    b.addEventListener('keydown', e => { let n; if(e.key==='ArrowRight') n=(index+1)%8; if(e.key==='ArrowLeft')n=(index+7)%8; if(e.key==='Home')n=0;if(e.key==='End')n=7;if(n!==undefined){e.preventDefault();buttons[n].click();buttons[n].focus();} });
    rail.append(b); return b;
  });
  function setProgress(value) {
    progress = Math.max(0,Math.min(1,value)); range.value = Math.round(progress*1000);
    document.getElementById('bang-progress').textContent = `${Math.round(progress*100)}%`;
    range.style.setProperty('--progress', `${progress*100}%`);
    const next = Math.min(7, Math.floor(progress*8));
    if (next !== chapter) {
      chapter=next;const era=eras[chapter];
      const fields = {'bang-scene-era':era.name.toUpperCase(),'bang-scene-title':era.title,'bang-scene-caption':era.detail,'bang-time':era.time,'bang-temperature':era.temp,'bang-chapter':`${String(chapter+1).padStart(2,'0')} / 08`,'bang-dossier-kicker':`CHAPTER ${String(chapter+1).padStart(2,'0')} / ${era.name.toUpperCase()}`,'bang-detail-title':era.detail,'bang-description':era.description,'bang-insight':era.insight,'bang-state':era.state,'bang-process':era.process,'bang-evidence-label':era.evidenceLabel,'bang-evidence':era.evidence};
      for(const [id,text] of Object.entries(fields))document.getElementById(id).textContent=text;
      buttons.forEach((b,i)=>{b.setAttribute('aria-pressed',String(i===chapter));b.classList.toggle('is-past',i<chapter);});
      range.setAttribute('aria-valuetext', `${era.name}, ${era.time}`);
      shell.style.setProperty('--bang-accent', `rgb(${era.color.join(',')})`);
    }
    if (!playing) document.getElementById('bang-play-label').textContent = progress >= 1 ? 'Journey again' : progress === 0 ? 'Begin the journey' : 'Continue journey';
    if (!playing || reduced.matches) draw();
  }
  function setPlaying(value) {
    playing=value;play.setAttribute('aria-pressed',String(value));
    document.getElementById('bang-play-symbol').classList.toggle('is-playing',value);
    document.getElementById('bang-play-label').textContent=value?'Pause the journey':progress>=1?'Journey again':progress===0?'Begin the journey':'Continue journey';
    schedule();
  }
  play.addEventListener('click',()=>{if(progress>=1)setProgress(0);setPlaying(!playing);});
  document.getElementById('bang-replay').addEventListener('click',()=>{setPlaying(false);setProgress(0);setPlaying(false);});
  range.addEventListener('input',()=>{setPlaying(false);setProgress(Number(range.value)/1000);setPlaying(false);});
  function glow(x,y,r,color,alpha=1) {
    const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${color},${alpha})`);g.addColorStop(.12,`rgba(${color},${alpha*.55})`);g.addColorStop(.5,`rgba(${color},${alpha*.09})`);g.addColorStop(1,`rgba(${color},0)`);ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
  }
  function draw() {
    if(!ctx)return;
    ctx.clearRect(0,0,width,height);ctx.fillStyle='#060913';ctx.fillRect(0,0,width,height);
    const t=progress*8, color=eras[Math.min(7,Math.floor(t))].color.join(',');
    const cx=width*.60,cy=height*.46, extent=Math.min(width,height)*.62;
    glow(cx,cy,Math.max(width,height)*.8,t<5?'103,48,51':'37,48,110',.28);
    if(t<5){
      const heat=Math.max(.035,1-t/5);glow(cx,cy,extent*(.3+Math.min(t,3)*.5),color,heat*.75);
      const core=extent*(.05+Math.min(t,2)*.2);glow(cx,cy,core,'255,238,211',heat);
      ctx.save();ctx.translate(cx,cy);ctx.scale(1,.025);glow(0,0,extent*.95,'255,211,170',heat*.6);ctx.restore();
      for(let k=0;k<5;k++){const r=extent*(.2+((clock*.04+k*.19+t*.15)%1));ctx.beginPath();ctx.ellipse(cx,cy,r,r*.63,-.22,0,Math.PI*2);ctx.strokeStyle=`rgba(${color},${(.1-k*.014)*heat})`;ctx.lineWidth=1;ctx.stroke();}
    }
    // This centered composition illustrates expansion, not a physical center of the universe.
    const spread=.1+Math.min(t/2,1)*1.15;
    if(t>5.2){ctx.strokeStyle=`rgba(125,153,240,${Math.min(.13,(t-5.2)*.055)})`;ctx.lineWidth=.7;for(let i=0;i<clusters.length;i++)for(let j=i+1;j<clusters.length;j++){const a=clusters[i],b=clusters[j];if(Math.hypot(a.x-b.x,a.y-b.y)<.38){ctx.beginPath();ctx.moveTo(a.x*width,a.y*height);ctx.lineTo(b.x*width,b.y*height);ctx.stroke();}}}
    ctx.globalCompositeOperation='lighter';
    for(const p of particles){
      const drift=reduced.matches?0:clock*.012;
      let x=cx+Math.cos(p.angle+drift*(.2+p.z))*p.r*width*.65*spread;
      let y=cy+Math.sin(p.angle+drift*(.2+p.z))*p.r*height*.7*spread;
      const formation=Math.max(0,Math.min(1,(t-5)/2));
      const c=clusters[p.cluster],spiral=p.angle+p.r*9+drift;
      const gx=c.x*width+Math.cos(spiral)*p.r*width*.048,gy=c.y*height+Math.sin(spiral)*p.r*height*.045;
      x=x*(1-formation)+gx*formation;y=y*(1-formation)+gy*formation;
      const alpha=(.25+p.z*.65)*(t>=5&&t<6?.35:1), size=p.size*(t<3?1.4:1);
      ctx.fillStyle=`rgba(${t>5?(p.z>.6?'192,204,255':'121,155,231'):color},${alpha})`;
      ctx.beginPath();ctx.arc(x,y,size,0,Math.PI*2);ctx.fill();
      if(p.z>.96)glow(x,y,size*7,t>5?'151,177,255':color,.35);
      if(t>1&&t<3&&p.z>.7){ctx.strokeStyle=`rgba(${color},.14)`;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(x-cx)*.035,y+(y-cy)*.035);ctx.stroke();}
    }
    if(t>6){for(const c of clusters){const x=c.x*width,y=c.y*height;glow(x,y,width*.07,'96,117,244',.10*(t-6));glow(x,y,12,'255,223,188',.5*Math.min(1,t-6));
      for(let arm=0;arm<2;arm++){ctx.beginPath();for(let step=0;step<44;step++){const a=step*.13+arm*Math.PI+c.x*5+clock*.012,r=step*width*.001;const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r*.48;step?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.strokeStyle=`rgba(157,177,255,${Math.min(.22,(t-6)*.12)})`;ctx.lineWidth=1.2;ctx.stroke();}}}
    ctx.globalCompositeOperation='source-over';
    // Keep editorial copy legible over the light field.
    const shade=ctx.createLinearGradient(0,0,width,0);shade.addColorStop(0,'rgba(6,9,19,.85)');shade.addColorStop(.45,'rgba(6,9,19,.08)');shade.addColorStop(1,'rgba(6,9,19,0)');ctx.fillStyle=shade;ctx.fillRect(0,0,width,height);
  }
  function loop(now){const dt=last?Math.min((now-last)/1000,.06):0;last=now;if(!reduced.matches)clock+=dt;if(playing){setProgress(progress+dt/64);if(progress>=1)setPlaying(false);}draw();frame=0;if(visible&&!document.hidden&&(!reduced.matches||playing))frame=requestAnimationFrame(loop);}
  function schedule(){if(visible&&!document.hidden&&(!reduced.matches||playing)&&!frame){last=0;frame=requestAnimationFrame(loop);}}
  function stop(){cancelAnimationFrame(frame);frame=0;last=0;}
  new ResizeObserver(()=>{const b=canvas.getBoundingClientRect();width=b.width;height=b.height;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx?.setTransform(dpr,0,0,dpr,0,0);draw();}).observe(canvas);
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;visible?schedule():stop();},{threshold:.05}).observe(canvas);
  document.addEventListener('visibilitychange',()=>document.hidden?stop():schedule());
  reduced.addEventListener('change',()=>{stop();draw();schedule();});
  setProgress(0);
}
