import * as T from './vendor/three.module.js';
const R=Math.random,$=id=>document.getElementById(id);
let rn;try{rn=new T.WebGLRenderer({antialias:true});}catch(e){showErr('WebGL недоступен на этом устройстве');throw e}
rn.setPixelRatio(Math.min(devicePixelRatio,2));rn.shadowMap.enabled=true;rn.shadowMap.type=T.PCFSoftShadowMap;
rn.outputColorSpace=T.SRGBColorSpace;document.body.appendChild(rn.domElement);
const sc=new T.Scene();const FOG=0xffdcb0;sc.fog=new T.Fog(FOG,25,110);
const cam=new T.PerspectiveCamera(70,1,.1,600);
function rs(){rn.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.fov=cam.aspect<1?80:70;cam.updateProjectionMatrix()}rs();addEventListener('resize',rs);
// world group follows player in z; sky
const sunDir=new T.Vector3(0.25,0.22,-1).normalize();
const sky=new T.Mesh(new T.SphereGeometry(400,32,16),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,fog:false,uniforms:{s:{value:sunDir}},
 vertexShader:'varying vec3 p;void main(){p=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'uniform vec3 s;varying vec3 p;void main(){float d=max(dot(p,s),0.);vec3 c=mix(vec3(1.,.86,.66),vec3(.35,.62,.95),clamp(p.y*2.2,0.,1.));c+=vec3(1.,.75,.4)*pow(d,6.)*.5;gl_FragColor=vec4(c,1.);}'}));
sc.add(sky);
const sunM=new T.Mesh(new T.CircleGeometry(18,48),new T.MeshBasicMaterial({color:0xfff6d0,fog:false}));
const halo=new T.Mesh(new T.CircleGeometry(55,48),new T.ShaderMaterial({transparent:true,depthWrite:false,fog:false,blending:T.AdditiveBlending,vertexShader:'varying vec2 u;void main(){u=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 u;void main(){float d=length(u-.5)*2.;gl_FragColor=vec4(1.,.8,.45,pow(1.-clamp(d,0.,1.),2.)*.6);}'}));
sc.add(sunM,halo);
sc.add(new T.HemisphereLight(0xcfe6ff,0x5a8a30,.8));
const dl=new T.DirectionalLight(0xffe2b0,2.2);dl.castShadow=true;dl.shadow.mapSize.set(1024,1024);Object.assign(dl.shadow.camera,{left:-15,right:15,top:15,bottom:-15,near:1,far:120});dl.shadow.bias=-.0005;sc.add(dl,dl.target);
const L=x=>new T.MeshLambertMaterial({color:x});
// terrain: rolling ground strip, recycled
const SEG=160;
function hgt(x){const a=Math.abs(x);return a<5.5?0:Math.min(6,Math.pow((a-5.5)/14,2)*2)+Math.sin(x*.3)*.25*Math.min(1,(a-5.5)/4)}
const gGeo=new T.PlaneGeometry(140,SEG,70,40);gGeo.rotateX(-Math.PI/2);{const p=gGeo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,hgt(x)+Math.sin(z*Math.PI*2/40)*Math.max(0,Math.min(1,(Math.abs(x)-7)/10))*.8)}gGeo.computeVertexNormals()}
const grounds=[0,1].map(i=>{const g=new T.Mesh(gGeo,L(0x67b843));g.receiveShadow=true;g.position.z=-i*SEG;sc.add(g);return g});
const pathM=new T.MeshLambertMaterial({color:0xd8b97a});
const paths=[0,1].map(i=>{const p=new T.Mesh(new T.PlaneGeometry(9.5,SEG),pathM);p.rotation.x=-Math.PI/2;p.position.set(0,.02,-i*SEG);p.receiveShadow=true;sc.add(p);return p});
// lane lines of small stones
// hills (parallax, far)
const hills=[];const hcol=[0x8fc977,0x7fb86a,0x9fd38a];
for(let i=0;i<18;i++){const r=25+R()*30,h=new T.Mesh(new T.SphereGeometry(r,20,10),L(hcol[i%3]));h.scale.y=.45;h.position.set((i%2?1:-1)*(55+R()*60),-r*.15,-40-i*22);sc.add(h);hills.push(h)}
// trees few
const trunkG=new T.CylinderGeometry(.3,.4,3,6),crownG=new T.IcosahedronGeometry(2.2,1);const trees=[];
for(let i=0;i<14;i++){const t=new T.Group(),a=new T.Mesh(trunkG,L(0x7a5230)),b=new T.Mesh(crownG,L(0x3f8f3a));a.position.y=1.5;b.position.y=4;a.castShadow=b.castShadow=true;t.add(a,b);const x=(i%2?1:-1)*(16+R()*20);t.position.set(x,hgt(x),-i*12);sc.add(t);trees.push(t)}
// flowers: build merged-ish via instanced parts. Types: daisy (ring of petals), tulip (cup), rose (sphere cluster)
const N=1400,cols=[0xff4f7d,0xffd23f,0xffffff,0xb07cff,0xff8a3d,0x4fb6ff,0xff2e4d,0xff9bd0];
const tmp=new T.Object3D();
const stemI=new T.InstancedMesh(new T.CylinderGeometry(.03,.04,1,5).translate(0,.5,0),L(0x3b8a2a),N);
const leafI=new T.InstancedMesh(new T.SphereGeometry(.12,6,4).scale(1,.25,2.2),L(0x4a9e33),N);
const PET=6;const petalI=new T.InstancedMesh(new T.SphereGeometry(.13,7,5).scale(1.6,.35,.8).translate(.2,0,0),new T.MeshLambertMaterial(),N*PET);
const centerI=new T.InstancedMesh(new T.SphereGeometry(.11,8,6),L(0xffb000),N);
const tulipI=new T.InstancedMesh(new T.SphereGeometry(.2,8,6,0,6.3,0,2.1).scale(1,1.5,1),new T.MeshLambertMaterial({side:T.DoubleSide}),N);
const roseI=new T.InstancedMesh(new T.DodecahedronGeometry(.2,1),new T.MeshLambertMaterial(),N);
[stemI,leafI,petalI,centerI,tulipI,roseI].forEach(m=>{m.castShadow=false;m.frustumCulled=false;sc.add(m)});
const F=[];for(let i=0;i<N;i++){let x;const k=R();x=k<.6?(5+Math.pow(R(),1.5)*14):(5+R()*45);x*=R()<.5?-1:1;F.push({x,z:-R()*SEG,h:.5+R()*.6,s:.8+R()*.8+(Math.abs(x)<9?.4:0),type:R()*3|0,c:new T.Color(cols[i%cols.length]),r:R()*6})}
const hidden=new T.Matrix4().makeScale(0,0,0);
function setFlower(i){const f=F[i],y=hgt(f.x),s=f.s;
 tmp.position.set(f.x,y,f.z);tmp.rotation.set(0,f.r,0);tmp.scale.set(s,f.h*s,s);tmp.updateMatrix();stemI.setMatrixAt(i,tmp.matrix);
 tmp.position.set(f.x+.12*s,y+f.h*s*.35,f.z);tmp.scale.setScalar(s);tmp.rotation.set(.4,f.r,0);tmp.updateMatrix();leafI.setMatrixAt(i,tmp.matrix);
 const top=y+f.h*s;
 for(let p=0;p<PET;p++){const j=i*PET+p;if(f.type==0){tmp.position.set(f.x,top,f.z);tmp.rotation.set(0,f.r+p*Math.PI*2/PET,.25);tmp.scale.setScalar(s);tmp.updateMatrix();petalI.setMatrixAt(j,tmp.matrix)}else petalI.setMatrixAt(j,hidden);petalI.setColorAt(j,f.c)}
 tmp.rotation.set(0,0,0);tmp.position.set(f.x,top+.02*s,f.z);tmp.scale.setScalar(f.type==0?s:0);tmp.updateMatrix();centerI.setMatrixAt(i,tmp.matrix);
 tmp.position.set(f.x,top+.1*s,f.z);tmp.rotation.set(Math.PI,0,0);tmp.scale.setScalar(f.type==1?s*1.1:0);tmp.updateMatrix();tulipI.setMatrixAt(i,tmp.matrix);tulipI.setColorAt(i,f.c);
 tmp.rotation.set(f.r,f.r,0);tmp.position.set(f.x,top+.08*s,f.z);tmp.scale.setScalar(f.type==2?s*1.1:0);tmp.updateMatrix();roseI.setMatrixAt(i,tmp.matrix);roseI.setColorAt(i,f.c)}
for(let i=0;i<N;i++)setFlower(i);
function flushF(){[stemI,leafI,petalI,centerI,tulipI,roseI].forEach(m=>{m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true})}flushF();
// grass tufts
const GN=3000;const grassI=new T.InstancedMesh(new T.ConeGeometry(.06,.7,3).translate(0,.35,0),L(0x4f9e35),GN);grassI.frustumCulled=false;sc.add(grassI);
const GR=[];for(let i=0;i<GN;i++){let x=(4.6+R()*25)*(R()<.5?-1:1);GR.push({x,z:-R()*SEG,h:.6+R()*.9,r:R()*.5-.25})}
function setG(i){const g=GR[i];tmp.position.set(g.x,hgt(g.x),g.z);tmp.rotation.set(g.r,0,g.r);tmp.scale.set(1,g.h,1);tmp.updateMatrix();grassI.setMatrixAt(i,tmp.matrix)}
for(let i=0;i<GN;i++)setG(i);grassI.instanceMatrix.needsUpdate=true;
// player
const P=new T.Group();sc.add(P);
const skin=L(0xffd2a8),dressM=L(0xff6f9f),shoe=L(0x6b3a22),hatM=L(0xf2c14e);
const body=new T.Mesh(new T.CylinderGeometry(.22,.48,.85,14),dressM);body.position.y=1.05;
const head=new T.Mesh(new T.SphereGeometry(.26,18,14),skin);head.position.y=1.72;
const hair=new T.Mesh(new T.SphereGeometry(.28,16,10,0,6.3,0,1.8),L(0x7a4420));hair.position.set(0,1.75,.03);
const brim=new T.Mesh(new T.CylinderGeometry(.5,.5,.04,24),hatM);brim.position.y=1.86;
const crown=new T.Mesh(new T.CylinderGeometry(.22,.26,.2,16),hatM);crown.position.y=1.97;
const band=new T.Mesh(new T.CylinderGeometry(.265,.265,.06,16),L(0xff3b6b));band.position.y=1.9;
P.add(body,head,hair,brim,crown,band);
function limb(len,r,m){const g=new T.Group(),u=new T.Mesh(new T.CapsuleGeometry(r,len,4,8),m);u.position.y=-len/2-r;g.add(u);const lo=new T.Group();lo.position.y=-len-r*2;g.add(lo);const d=new T.Mesh(new T.CapsuleGeometry(r*.9,len,4,8),m);d.position.y=-len/2-r;lo.add(d);g.lo=lo;return g}
const legL=limb(.28,.07,skin),legR=limb(.28,.07,skin);legL.position.set(-.14,.72,0);legR.position.set(.14,.72,0);
[legL,legR].forEach(l=>{const s=new T.Mesh(new T.SphereGeometry(.1,8,6).scale(1,.6,1.5),shoe);s.position.set(0,-.38,-.05);l.lo.add(s);P.add(l)});
const armL=limb(.22,.055,skin),armR=limb(.22,.055,skin);armL.position.set(-.3,1.38,0);armR.position.set(.3,1.38,0);P.add(armL,armR);
P.traverse(o=>{if(o.isMesh)o.castShadow=true});
// objects
const bushG=new T.IcosahedronGeometry(.75,1),bushM=L(0x2f7d32),bush2=L(0x3c9a3c),beeG=new T.SphereGeometry(.14,10,8).scale(1.3,1,1),beeM=L(0xffc400),wingM=new T.MeshLambertMaterial({color:0xffffff,transparent:true,opacity:.7}),wingG=new T.CircleGeometry(.12,8);
const pickPetal=new T.SphereGeometry(.14,8,6).scale(1.7,.4,.8).translate(.22,0,0),pickC=new T.SphereGeometry(.13,10,8);
let obs=[],picks=[];const lanes=[-3,0,3];
function addBush(z,lane){const g=new T.Group();[[0,.55,0,1.1],[-.5,.4,.2,.8],[.5,.4,.1,.85]].forEach(([x,y,zz,s],k)=>{const b=new T.Mesh(bushG,k?bush2:bushM);b.position.set(x,y,zz);b.scale.setScalar(s);b.castShadow=true;g.add(b)});
 const bee=new T.Group(),bb=new T.Mesh(beeG,beeM);bee.add(bb);[-1,1].forEach(s=>{const w=new T.Mesh(wingG,wingM);w.position.set(0,.12,s*.08);w.rotation.x=-Math.PI/2;bee.add(w)});g.add(bee);g.userData.bee=bee;
 g.position.set(lanes[lane],0,z);sc.add(g);obs.push(g)}
function addPick(z,lane,y){const g=new T.Group(),c=cols[R()*cols.length|0],m=new T.MeshLambertMaterial({color:c,emissive:c,emissiveIntensity:.35});
 for(let p=0;p<6;p++){const q=new T.Mesh(pickPetal,m);q.rotation.y=p*Math.PI/3;g.add(q)}const cc=new T.Mesh(pickC,new T.MeshLambertMaterial({color:0xffb000,emissive:0x664400}));g.add(cc);g.rotation.x=Math.PI/2.5;
 g.position.set(lanes[lane],y,z);g.traverse(o=>{if(o.isMesh)o.castShadow=true});sc.add(g);picks.push(g)}
// state
let st='menu',dist=0,score=0,spd=10,lane=1,px=0,vy=0,py=0,jumps=0,best=+localStorage.fr3_best||0,nextSpawn=25,t=0;
function reset(){[...obs,...picks].forEach(o=>sc.remove(o));obs=[];picks=[];dist=0;score=0;spd=10;lane=1;px=0;vy=0;py=0;jumps=0;nextSpawn=25}
// audio
let A=null,mg=null,muted=false;
function audio(){try{if(A){A.resume();return}A=new (window.AudioContext||window.webkitAudioContext)();mg=A.createGain();mg.gain.value=muted?0:.5;mg.connect(A.destination);
 const b=A.createBuffer(1,A.sampleRate*2,A.sampleRate),d=b.getChannelData(0);let l=0;for(let i=0;i<d.length;i++){l=(l+.02*(R()*2-1))/1.02;d[i]=l*3}
 const n=A.createBufferSource();n.buffer=b;n.loop=true;const f=A.createBiquadFilter();f.type='lowpass';f.frequency.value=400;const g=A.createGain();g.gain.value=.25;n.connect(f).connect(g).connect(mg);n.start();
 (function sing(){chirp();setTimeout(sing,600+R()*2200)})()}catch(e){}}
function chirp(){if(!A||muted)return;const n=2+R()*5|0,base=2200+R()*2000,now=A.currentTime;
 for(let i=0;i<n;i++){const o=A.createOscillator(),g=A.createGain(),s=now+i*(.08+R()*.06),f=base*(.8+R()*.5);
 o.frequency.setValueAtTime(f,s);o.frequency.exponentialRampToValueAtTime(f*(R()<.5?1.5:.65),s+.07);g.gain.setValueAtTime(0,s);g.gain.linearRampToValueAtTime(.08,s+.01);g.gain.exponentialRampToValueAtTime(.001,s+.1);
 const p=A.createStereoPanner?A.createStereoPanner():null;if(p){p.pan.value=R()*2-1;o.connect(g).connect(p).connect(mg)}else o.connect(g).connect(mg);o.start(s);o.stop(s+.12)}}
function blip(f){if(!A||muted)return;const o=A.createOscillator(),g=A.createGain(),s=A.currentTime;o.frequency.setValueAtTime(f,s);o.frequency.exponentialRampToValueAtTime(f*2,s+.12);g.gain.setValueAtTime(.12,s);g.gain.exponentialRampToValueAtTime(.001,s+.2);o.connect(g).connect(mg);o.start(s);o.stop(s+.2)}
$('snd').onclick=()=>{muted=!muted;audio();if(mg)mg.gain.value=muted?0:.5;$('snd').textContent=muted?'🔇 Звук':'🔊 Звук'};
$('pause').onclick=()=>{if(st=='play'){st='pause';$('pause').textContent='Дальше'}else if(st=='pause'){st='play';$('pause').textContent='Пауза'}};
$('start').onclick=e=>{e&&e.stopPropagation();audio();reset();st='play';$('menu').style.display='none'};
const jump=()=>{if(st=='play'&&jumps<2){vy=9.5;jumps++;blip(500)}},mv=d=>{if(st=='play')lane=Math.max(0,Math.min(2,lane+d))};
addEventListener('keydown',e=>{const k=e.key;if(k==' '||k=='ArrowUp'||k=='w'||k=='W'||k=='ц'){e.preventDefault();if(st=='menu'||st=='over')$('start').onclick();else jump()}
 if(k=='ArrowLeft'||k=='a'||k=='A'||k=='ф')mv(-1);if(k=='ArrowRight'||k=='d'||k=='D'||k=='в')mv(1);if(k=='p'||k=='Escape')$('pause').onclick()});
let sx=0,sy=0;rn.domElement.addEventListener('pointerdown',e=>{sx=e.clientX;sy=e.clientY});
rn.domElement.addEventListener('pointerup',e=>{const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.abs(dx)>30&&Math.abs(dx)>Math.abs(dy))mv(dx>0?1:-1);else jump()});
const clk=new T.Clock();
function over(){st='over';const s=Math.floor(dist)+score*5;if(s>best){best=s;localStorage.fr3_best=s}
 $('msg').innerHTML=`Пробежал ${Math.floor(dist)} м, собрал 🌼 ${score}<br>Очки: ${s} · Рекорд: ${best}`;$('start').textContent='Ещё раз';$('menu').style.display='flex'}
function update(dt){t+=dt;const z=-dist;
 if(st=='play'){spd=10+dist/60;dist+=spd*dt;px+=(lanes[lane]-px)*Math.min(1,dt*12);vy-=24*dt;py+=vy*dt;if(py<0){py=0;vy=0;jumps=0}
  if(dist>nextSpawn){const bl=R()*3|0;addBush(-dist-70,bl);const pl=(bl+1+(R()*2|0))%3;for(let i=0;i<4;i++)addPick(-dist-62-i*2.2,pl,1+(R()<.3?1.6:0));nextSpawn=dist+12+R()*12-Math.min(5,dist/300)}
  for(const o of obs){if(Math.abs(o.position.z+dist)<.95&&Math.abs(o.position.x-px)<1.3&&py<1.2){over();break}}
  picks=picks.filter(p=>{if(Math.abs(p.position.z+dist)<.9&&Math.abs(p.position.x-px)<1&&Math.abs(p.position.y-(py+1))<1.1){score++;blip(900+R()*400);sc.remove(p);return false}if(p.position.z+dist>8){sc.remove(p);return false}return true});
  obs=obs.filter(o=>{if(o.position.z+dist>8){sc.remove(o);return false}return true});
  $('hud').textContent=`${Math.floor(dist)} м · 🌼 ${score}`}
 obs.forEach(o=>{const b=o.userData.bee;b.position.set(Math.sin(t*3+o.position.z)*.9,1.7+Math.sin(t*6)*.15,Math.cos(t*3)*.6);b.children[1].rotation.y=b.children[2].rotation.y=Math.sin(t*60)*.6});
 picks.forEach(p=>{p.rotation.z+=dt*2});
 // recycle world
 const zz=-dist;grounds.forEach((g,i)=>{while(g.position.z-SEG/2>zz+10)g.position.z-=SEG*2});paths.forEach(p=>{while(p.position.z-SEG/2>zz+10)p.position.z-=SEG*2});
 let ch=false;for(let i=0;i<N;i++)if(F[i].z>zz+8){F[i].z-=SEG;setFlower(i);ch=true}if(ch)flushF();
 let cg=false;for(let i=0;i<GN;i++)if(GR[i].z>zz+8){GR[i].z-=SEG;setG(i);cg=true}if(cg)grassI.instanceMatrix.needsUpdate=true;
 hills.forEach(h=>{if(h.position.z>zz+30)h.position.z-=18*22});trees.forEach(tr=>{if(tr.position.z>zz+10)tr.position.z-=14*12});
 // player anim
 const run=st=='play',ph=run?t*spd*1.1:t*2,a=run?.9:.08;
 P.position.set(px,py,zz);P.rotation.y=Math.PI+(lanes[lane]-px)*-.12;P.rotation.z=(px-lanes[lane])*.06;
 legL.rotation.x=Math.sin(ph)*a;legR.rotation.x=-Math.sin(ph)*a;legL.lo.rotation.x=-Math.max(0,Math.sin(ph+1))*a*1.2;legR.lo.rotation.x=-Math.max(0,-Math.sin(ph+1))*a*1.2;
 armL.rotation.x=-Math.sin(ph)*a*.9;armR.rotation.x=Math.sin(ph)*a*.9;armL.lo.rotation.x=armR.lo.rotation.x=-.6*(run?1:.2);
 if(py>0){legL.rotation.x=-.6;legR.rotation.x=.3;legL.lo.rotation.x=legR.lo.rotation.x=-1}
 body.position.y=1.05+(run?Math.abs(Math.sin(ph))*.06:0);
 // camera over shoulder, low
 cam.position.set(px*.7+.6,2.1+py*.4,zz+4.2);cam.lookAt(px*.8,1.3+py*.3,zz-12);
 sky.position.set(0,0,zz);sunM.position.copy(sunDir).multiplyScalar(300).add(sky.position);sunM.lookAt(cam.position);halo.position.copy(sunDir).multiplyScalar(295).add(sky.position);halo.lookAt(cam.position);
 dl.position.set(px+sunDir.x*-0+12,30,zz-40);dl.position.set(px+10,18,zz-25);dl.target.position.set(px,0,zz-4);
}
function loop(){requestAnimationFrame(loop);try{update(Math.min(clk.getDelta(),.05));rn.render(sc,cam);window.__ok=1}catch(e){console.error(e);showErr(e.message)}}
loop();
