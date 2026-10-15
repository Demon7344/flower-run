import * as T from 'three';
const R=Math.random,$=id=>document.getElementById(id);
const rn=new T.WebGLRenderer({antialias:true});rn.setPixelRatio(Math.min(devicePixelRatio,2));rn.shadowMap.enabled=true;document.body.appendChild(rn.domElement);
const sc=new T.Scene();sc.background=new T.Color(0x9fd8ff);sc.fog=new T.Fog(0xffe2b8,30,120);
const cam=new T.PerspectiveCamera(65,1,.1,500);
function rs(){rn.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}rs();onresize=rs;
// sky gradient dome
const sky=new T.Mesh(new T.SphereGeometry(300,32,16),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,fog:false,uniforms:{},vertexShader:'varying vec3 p;void main(){p=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 p;void main(){vec3 s=normalize(vec3(.5,.35,-1.));float d=max(dot(p,s),0.);vec3 c=mix(vec3(1.,.88,.7),vec3(.4,.7,1.),clamp(p.y*2.,0.,1.));c+=vec3(1.,.8,.4)*pow(d,8.)*.6+vec3(1.,.95,.8)*pow(d,600.)*3.;gl_FragColor=vec4(c,1.);}'}));sc.add(sky);
const sunDir=new T.Vector3(.5,.35,-1).normalize();
const sun=new T.Mesh(new T.CircleGeometry(14,32),new T.MeshBasicMaterial({color:0xfff4c0,fog:false}));sun.position.copy(sunDir).multiplyScalar(250);sun.lookAt(0,0,0);sc.add(sun);
const halo=new T.Mesh(new T.CircleGeometry(40,32),new T.MeshBasicMaterial({color:0xffe08a,transparent:true,opacity:.25,fog:false,depthWrite:false}));halo.position.copy(sun.position).multiplyScalar(.99);halo.lookAt(0,0,0);sc.add(halo);
sc.add(new T.HemisphereLight(0xcfe8ff,0x6a9a3a,.9));
const dl=new T.DirectionalLight(0xfff0d0,1.6);dl.position.copy(sunDir).multiplyScalar(-1).setY(40);dl.position.set(-20,40,30);dl.castShadow=true;dl.shadow.mapSize.set(1024,1024);Object.assign(dl.shadow.camera,{left:-20,right:20,top:20,bottom:-20});sc.add(dl,dl.target);
// ground
const SEG=120;const ground=new T.Mesh(new T.PlaneGeometry(200,SEG*2,1,1),new T.MeshLambertMaterial({color:0x6cc04a}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;sc.add(ground);
// hills
const hm=new T.MeshLambertMaterial({color:0x8fcf7a});for(let i=0;i<14;i++){const h=new T.Mesh(new T.SphereGeometry(20+R()*25,16,8),hm);h.position.set((i%2?1:-1)*(45+R()*40),-12,-60-i*15);h.scale.y=.5;sc.add(h)}
// instanced flowers (wrap around player)
const N=2500,cols=[0xff5e8a,0xffd23f,0xffffff,0xb388ff,0xff8a3d,0x5ec8ff,0xff3b3b];
const petG=new T.CylinderGeometry(.28,.18,.06,6);petG.translate(0,.55,0);
const stemG=new T.CylinderGeometry(.025,.025,.55,4);stemG.translate(0,.27,0);
const pet=new T.InstancedMesh(petG,new T.MeshLambertMaterial(),N),stem=new T.InstancedMesh(stemG,new T.MeshLambertMaterial({color:0x3a8a2a}),N);
const gG=new T.ConeGeometry(.07,.6,3);gG.translate(0,.3,0);const grass=new T.InstancedMesh(gG,new T.MeshLambertMaterial({color:0x4fa83a}),4000);
sc.add(pet,stem,grass);const FP=[],GP=[];const m=new T.Matrix4(),q=new T.Quaternion(),v=new T.Vector3(),s=new T.Vector3();
for(let i=0;i<N;i++){FP.push([(R()-.5)*60,(R())*SEG,.7+R()*.7]);pet.setColorAt(i,new T.Color(cols[i%7]))}
for(let i=0;i<4000;i++)GP.push([(R()-.5)*40,R()*SEG,.6+R()]);
function placeField(z0){for(let i=0;i<N;i++){const f=FP[i];let z=-(((f[1]-z0)%SEG+SEG)%SEG)+10;if(Math.abs(f[0])<1.3*4&&Math.abs(f[0])<4.6)f[0]=f[0]<0?f[0]-5:f[0]+5;v.set(f[0],0,z+z0*0);s.setScalar(f[2]);m.compose(v,q,s);pet.setMatrixAt(i,m);stem.setMatrixAt(i,m)}pet.instanceMatrix.needsUpdate=stem.instanceMatrix.needsUpdate=true;
 for(let i=0;i<4000;i++){const g=GP[i];v.set(g[0],0,-(((g[1]-z0)%SEG+SEG)%SEG)+10);s.set(1,g[2],1);m.compose(v,q,s);grass.setMatrixAt(i,m)}grass.instanceMatrix.needsUpdate=true}
// path stripe
const path=new T.Mesh(new T.PlaneGeometry(9,SEG*2),new T.MeshLambertMaterial({color:0x8ccf5a}));path.rotation.x=-Math.PI/2;path.position.y=.01;path.receiveShadow=true;sc.add(path);
// player
const P=new T.Group();const mat=c=>new T.MeshLambertMaterial({color:c});
const dress=new T.Mesh(new T.ConeGeometry(.45,.9,12),mat(0xff7aa8));dress.position.y=.95;
const head=new T.Mesh(new T.SphereGeometry(.25,16,12),mat(0xffd9b3));head.position.y=1.6;
const brim=new T.Mesh(new T.CylinderGeometry(.48,.48,.04,20),mat(0xf2c14e));brim.position.y=1.75;
const top=new T.Mesh(new T.SphereGeometry(.24,16,8,0,6.3,0,1.6),mat(0xf2c14e));top.position.y=1.75;
const bow=new T.Mesh(new T.SphereGeometry(.08),mat(0xff3b6b));bow.position.set(.2,1.82,0);
const legs=[-.15,.15].map(x=>{const l=new T.Mesh(new T.CylinderGeometry(.06,.06,.55),mat(0x5b3a29));l.geometry.translate(0,-.27,0);l.position.set(x,.55,0);P.add(l);return l});
P.add(dress,head,brim,top,bow);P.traverse(o=>o.castShadow=true);sc.add(P);
// objects
const bushG=new T.IcosahedronGeometry(.9,1),bushM=mat(0x2f7d32),beeG=new T.SphereGeometry(.15,8,6),beeM=mat(0xffc400);
const pickG=new T.IcosahedronGeometry(.35,0);
let obs=[],picks=[],lanes=[-3,0,3];
function addBush(z){const g=new T.Group();const b=new T.Mesh(bushG,bushM);b.position.y=.6;b.scale.set(1.1,.8,1);b.castShadow=true;g.add(b);
 const bee=new T.Mesh(beeG,beeM);g.add(bee);g.userData.bee=bee;g.position.set(lanes[R()*3|0],0,z);sc.add(g);obs.push(g)}
function addPick(z){const p=new T.Mesh(pickG,new T.MeshLambertMaterial({color:cols[R()*7|0],emissive:0x553300}));p.position.set(lanes[R()*3|0],1+R()*1.2,z);sc.add(p);picks.push(p)}
// state
let st='menu',dist,score,spd,lane,px,vy,py,jumps,best=+localStorage.fr3_best||0,nextSpawn,t=0;
function reset(){[...obs,...picks].forEach(o=>sc.remove(o));obs=[];picks=[];dist=0;score=0;spd=10;lane=1;px=0;vy=0;py=0;jumps=0;nextSpawn=20}
reset();placeField(0);
// audio
let A,mg,muted=false;
function audio(){if(A)return;A=new (window.AudioContext||webkitAudioContext)();mg=A.createGain();mg.gain.value=.5;mg.connect(A.destination);
 const b=A.createBuffer(1,A.sampleRate*2,A.sampleRate),d=b.getChannelData(0);let l=0;for(let i=0;i<d.length;i++){l=(l+.02*(R()*2-1))/1.02;d[i]=l*3}
 const n=A.createBufferSource();n.buffer=b;n.loop=true;const f=A.createBiquadFilter();f.type='lowpass';f.frequency.value=400;const g=A.createGain();g.gain.value=.25;n.connect(f).connect(g).connect(mg);n.start();
 (function sing(){chirp();setTimeout(sing,600+R()*2200)})()}
function chirp(){if(!A||muted)return;const n=2+R()*5|0,base=2200+R()*2000,now=A.currentTime;
 for(let i=0;i<n;i++){const o=A.createOscillator(),g=A.createGain(),s=now+i*(.08+R()*.06),f=base*(.8+R()*.5);
 o.frequency.setValueAtTime(f,s);o.frequency.exponentialRampToValueAtTime(f*(R()<.5?1.5:.65),s+.07);g.gain.setValueAtTime(0,s);g.gain.linearRampToValueAtTime(.08,s+.01);g.gain.exponentialRampToValueAtTime(.001,s+.1);
 const p=A.createStereoPanner?A.createStereoPanner():null;if(p){p.pan.value=R()*2-1;o.connect(g).connect(p).connect(mg)}else o.connect(g).connect(mg);o.start(s);o.stop(s+.12)}}
function blip(f){if(!A||muted)return;const o=A.createOscillator(),g=A.createGain(),s=A.currentTime;o.frequency.setValueAtTime(f,s);o.frequency.exponentialRampToValueAtTime(f*2,s+.12);g.gain.setValueAtTime(.12,s);g.gain.exponentialRampToValueAtTime(.001,s+.2);o.connect(g).connect(mg);o.start(s);o.stop(s+.2)}
$('snd').onclick=()=>{audio();muted=!muted;mg.gain.value=muted?0:.5;$('snd').textContent=muted?'🔇 Звук':'🔊 Звук'};
$('pause').onclick=()=>{if(st=='play'){st='pause';$('pause').textContent='Дальше'}else if(st=='pause'){st='play';$('pause').textContent='Пауза'}};
$('start').onclick=e=>{e&&e.stopPropagation();audio();reset();st='play';$('menu').style.display='none'};
const jump=()=>{if(st=='play'&&jumps<2){vy=9;jumps++;blip(500)}},mv=d=>{if(st=='play')lane=Math.max(0,Math.min(2,lane+d))};
addEventListener('keydown',e=>{const k=e.key;if(k==' '||k=='ArrowUp'||k=='w'||k=='W'){e.preventDefault();if(st=='menu'||st=='over')$('start').onclick();else jump()}
 if(k=='ArrowLeft'||k=='a'||k=='A'||k=='ф')mv(-1);if(k=='ArrowRight'||k=='d'||k=='D'||k=='в')mv(1);if(k=='p'||k=='Escape')$('pause').onclick()});
let sx,sy;rn.domElement.addEventListener('pointerdown',e=>{sx=e.clientX;sy=e.clientY});
rn.domElement.addEventListener('pointerup',e=>{const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.abs(dx)>30&&Math.abs(dx)>Math.abs(dy))mv(dx>0?1:-1);else jump()});
const clk=new T.Clock();
function loop(){requestAnimationFrame(loop);const dt=Math.min(clk.getDelta(),.05);t+=dt;
 if(st=='play'){spd=10+dist/60;dist+=spd*dt;px+=(lanes[lane]-px)*Math.min(1,dt*12);vy-=25*dt;py+=vy*dt;if(py<0){py=0;vy=0;jumps=0}
  if(dist>nextSpawn){addBush(-dist-60);for(let i=0;i<3;i++)if(R()<.6)addPick(-dist-60-8-i*4);nextSpawn=dist+10+R()*12-Math.min(5,dist/300)}
  for(const o of obs){const b=o.userData.bee;b.position.set(Math.sin(t*4+o.position.z)*.7,1.6+Math.sin(t*7)*.15,Math.cos(t*4)*.5);
   if(Math.abs(o.position.z+dist)<.9&&Math.abs(o.position.x-px)<1.2&&py<1.1){st='over';const s=Math.floor(dist)+score*5;if(s>best){best=s;localStorage.fr3_best=s}
    $('msg').innerHTML=`Пробежал ${Math.floor(dist)} м, собрал 🌼 ${score}<br>Очки: ${s} · Рекорд: ${best}`;$('start').textContent='Ещё раз';$('menu').style.display='flex'}}
  picks=picks.filter(p=>{p.rotation.y+=dt*3;if(Math.abs(p.position.z+dist)<.8&&Math.abs(p.position.x-px)<.9&&Math.abs(p.position.y-(py+1))<1){score++;blip(900+R()*400);sc.remove(p);return false}if(p.position.z+dist>10){sc.remove(p);return false}return true});
  obs=obs.filter(o=>{if(o.position.z+dist>10){sc.remove(o);return false}return true});
  $('hud').textContent=`${Math.floor(dist)} м · 🌼 ${score}`}
 const z=-dist;P.position.set(px,py,z);const ph=st=='play'?t*spd*1.2:0;legs[0].rotation.x=Math.sin(ph)*.8;legs[1].rotation.x=-Math.sin(ph)*.8;P.rotation.z=(px-lanes[lane])*.08;head.position.y=1.6+Math.abs(Math.sin(ph))*.04;
 cam.position.set(px*.6,3.2+py*.3,z+6.5);cam.lookAt(px*.8,1.2,z-8);
 ground.position.z=path.position.z=z-SEG/2;pet.position.z=stem.position.z=grass.position.z=0;
 const zw=Math.floor(dist/4)*4;if(zw!==loop.l){loop.l=zw;placeFieldAt(zw)}
 sky.position.set(0,0,z);sun.position.copy(sunDir).multiplyScalar(250).add(sky.position);halo.position.copy(sunDir).multiplyScalar(248).add(sky.position);
 dl.position.set(px-20,40,z+30);dl.target.position.set(px,0,z);
 sc.children.forEach(o=>{if(o.geometry===hm)0});
 rn.render(sc,cam)}
function placeFieldAt(d){for(let i=0;i<N;i++){const f=FP[i];if(Math.abs(f[0])<5)f[0]+=f[0]<0?-5:5;const z=-d-((( f[1]-d)%SEG+SEG)%SEG)+10;v.set(f[0],0,z);s.setScalar(f[2]);m.compose(v,q,s);pet.setMatrixAt(i,m);stem.setMatrixAt(i,m)}
 pet.instanceMatrix.needsUpdate=stem.instanceMatrix.needsUpdate=true;
 for(let i=0;i<4000;i++){const g=GP[i];v.set(g[0],0,-d-(((g[1]-d)%SEG+SEG)%SEG)+10);s.set(1,g[2],1);m.compose(v,q,s);grass.setMatrixAt(i,m)}grass.instanceMatrix.needsUpdate=true}
// hills follow
const hills=sc.children.filter(o=>o.material===hm);const _l=loop;
setInterval(()=>hills.forEach(h=>{if(h.position.z>-dist+20)h.position.z-=220}),500);
loop();
