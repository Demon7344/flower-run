const c=document.getElementById('c'),x=c.getContext('2d');let W,H,G;
function rs(){W=c.width=innerWidth*devicePixelRatio;H=c.height=innerHeight*devicePixelRatio;G=H*0.78}rs();onresize=rs;
const R=Math.random,cols=['#ff5e8a','#ffd23f','#fff','#b388ff','#ff8a3d','#5ec8ff','#ff3b3b'];
let st='menu',t=0,spd,dist,score,best=+localStorage.fr_best||0,P,obs,pick,parts;
const fl=[[],[],[]];for(let l=0;l<3;l++)for(let i=0;i<120;i++)fl[l].push({x:R(),y:R(),c:cols[i%7],s:R()});
const birds=[];for(let i=0;i<4;i++)birds.push({x:R(),y:.1+R()*.2,p:R()*6});
function reset(){t=0;spd=1;dist=0;score=0;P={y:0,v:0,j:0};obs=[];pick=[];parts=[]}
reset();
// audio
let A,mg,muted=false;
function audio(){if(A)return;A=new (window.AudioContext||webkitAudioContext)();mg=A.createGain();mg.gain.value=.5;mg.connect(A.destination);
 const b=A.createBuffer(1,A.sampleRate*2,A.sampleRate),d=b.getChannelData(0);let l=0;for(let i=0;i<d.length;i++){l=(l+.02*(R()*2-1))/1.02;d[i]=l*3}
 const n=A.createBufferSource();n.buffer=b;n.loop=true;const f=A.createBiquadFilter();f.type='lowpass';f.frequency.value=400;const g=A.createGain();g.gain.value=.25;n.connect(f).connect(g).connect(mg);n.start();
 (function sing(){chirp();setTimeout(sing,600+R()*2200)})()}
function chirp(){if(!A||muted)return;const n=2+R()*5|0,base=2200+R()*2000,now=A.currentTime;
 for(let i=0;i<n;i++){const o=A.createOscillator(),g=A.createGain(),s=now+i*(.08+R()*.06),f=base*(.8+R()*.5);o.type='sine';
 o.frequency.setValueAtTime(f,s);o.frequency.exponentialRampToValueAtTime(f*(R()<.5?1.5:.65),s+.07);g.gain.setValueAtTime(0,s);g.gain.linearRampToValueAtTime(.08,s+.01);g.gain.exponentialRampToValueAtTime(.001,s+.1);
 const p=A.createStereoPanner?A.createStereoPanner():null;if(p){p.pan.value=R()*2-1;o.connect(g).connect(p).connect(mg)}else o.connect(g).connect(mg);o.start(s);o.stop(s+.12)}}
function blip(f){if(!A||muted)return;const o=A.createOscillator(),g=A.createGain(),s=A.currentTime;o.frequency.setValueAtTime(f,s);o.frequency.exponentialRampToValueAtTime(f*2,s+.12);g.gain.setValueAtTime(.12,s);g.gain.exponentialRampToValueAtTime(.001,s+.2);o.connect(g).connect(mg);o.start(s);o.stop(s+.2)}
snd.onclick=()=>{audio();muted=!muted;mg.gain.value=muted?0:.5;snd.textContent=muted?'🔇 Звук':'🔊 Звук'};
pause.onclick=()=>{if(st=='play'){st='pause';pause.textContent='Дальше'}else if(st=='pause'){st='play';pause.textContent='Пауза'}};
start.onclick=e=>{e.stopPropagation();audio();reset();st='play';menu.style.display='none'};
function jump(){if(st!='play')return;if(P.j<2){P.v=-H*.022;P.j++;blip(500)}}
addEventListener('keydown',e=>{if([' ','ArrowUp','w','W'].includes(e.key)){e.preventDefault();if(st=='menu'||st=='over')start.onclick(e);else jump()}if(e.key=='p'||e.key=='Escape')pause.onclick()});
c.addEventListener('pointerdown',jump);
function sun(){const sx=W*.78,sy=H*.2,r=H*.07;let g=x.createRadialGradient(sx,sy,0,sx,sy,r*6);g.addColorStop(0,'rgba(255,240,180,.9)');g.addColorStop(1,'rgba(255,220,120,0)');x.fillStyle=g;x.fillRect(0,0,W,H);
 x.save();x.translate(sx,sy);x.rotate(t*.0015);x.fillStyle='rgba(255,245,200,.18)';for(let i=0;i<12;i++){x.rotate(Math.PI/6);x.beginPath();x.moveTo(0,0);x.lineTo(r*5,-r*.35);x.lineTo(r*5,r*.35);x.fill()}x.restore();
 x.fillStyle='#fff6c8';x.beginPath();x.arc(sx,sy,r,0,7);x.fill();
 [[.4,.25,'#fff3a0'],[.75,.12,'#ffd0a0'],[1.1,.18,'#c8f0ff']].forEach(([k,s,cl])=>{x.globalAlpha=.25;x.fillStyle=cl;x.beginPath();x.arc(sx+(W/2-sx)*k*2,sy+(H/2-sy)*k*2,r*s*3,0,7);x.fill()});x.globalAlpha=1}
function hill(y,a,col,sp,f){x.fillStyle=col;x.beginPath();x.moveTo(0,H);for(let i=0;i<=W;i+=W/60){const u=(i+t*sp*spd)/W;x.lineTo(i,y-a*(Math.sin(u*f)*.6+Math.sin(u*f*2.3+1)*.4))}x.lineTo(W,H);x.fill()}
function flower(px,py,s,cl){x.strokeStyle='#3a8a2a';x.lineWidth=s*.25;x.beginPath();x.moveTo(px,py+s*3);x.lineTo(px,py);x.stroke();x.fillStyle=cl;for(let i=0;i<5;i++){const a=i*1.2566;x.beginPath();x.arc(px+Math.cos(a)*s,py+Math.sin(a)*s,s*.75,0,7);x.fill()}x.fillStyle='#ffb300';x.beginPath();x.arc(px,py,s*.55,0,7);x.fill()}
function frame(){requestAnimationFrame(frame);const run=st=='play';if(st!='pause')t++;
 if(run){spd=1+dist/4000;dist+=spd*.6;
  P.v+=H*.0011;P.y+=P.v;if(P.y>0){P.y=0;P.v=0;P.j=0}
  if(R()<.012*spd&&(!obs.length||obs[obs.length-1].x<W*.6))obs.push({x:W*1.05,w:H*.06,h:H*(.05+R()*.04)});
  if(R()<.03)pick.push({x:W*1.05,y:G-H*(.08+R()*.25),c:cols[R()*7|0]});
  const v=W*.006*spd;obs.forEach(o=>o.x-=v);pick.forEach(o=>o.x-=v);obs=obs.filter(o=>o.x>-W*.1);
  const px=W*.18,py=G+P.y,ph=H*.11;
  pick=pick.filter(o=>{if(o.x<-50)return false;if(Math.abs(o.x-px)<H*.05&&Math.abs(o.y-(py-ph/2))<ph*.7){score++;blip(900+R()*400);for(let i=0;i<8;i++)parts.push({x:o.x,y:o.y,vx:R()*8-4,vy:R()*-8,l:30,c:o.c});return false}return true});
  for(const o of obs)if(Math.abs(o.x-px)<o.w*.7&&py>G-o.h*.8){st='over';const sc=Math.floor(dist/10)+score*5;if(sc>best){best=sc;localStorage.fr_best=sc}
   msg.innerHTML=`Пробежал ${Math.floor(dist/10)} м, собрал 🌼 ${score}<br>Очки: ${sc} · Рекорд: ${best}`;start.textContent='Ещё раз';menu.style.display='flex'}
  hud.textContent=`${Math.floor(dist/10)} м · 🌼 ${score}`}
 let g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#6ec6ff');g.addColorStop(.6,'#ffe3b0');g.addColorStop(1,'#ffd08a');x.fillStyle=g;x.fillRect(0,0,W,H);sun();
 x.fillStyle='rgba(255,255,255,.8)';for(let i=0;i<5;i++){const cx=((i*W*.31-t*.3)%(W*1.4)+W*1.4)%(W*1.4)-W*.2,cy=H*(.08+i%3*.07);for(let k=0;k<4;k++){x.beginPath();x.arc(cx+k*H*.04,cy+(k%2)*H*.01,H*.035,0,7);x.fill()}}
 x.strokeStyle='#4a4a5a';x.lineWidth=H*.003;birds.forEach(b=>{b.x-=.0008;if(b.x<-.1)b.x=1.1;const bx=b.x*W,by=b.y*H+Math.sin(t*.03+b.p)*H*.01,w=Math.sin(t*.2+b.p)*H*.01;x.beginPath();x.moveTo(bx-H*.02,by-w);x.quadraticCurveTo(bx-H*.01,by-H*.008,bx,by);x.quadraticCurveTo(bx+H*.01,by-H*.008,bx+H*.02,by-w);x.stroke()});
 hill(H*.6,H*.06,'#9fd6a0',.2,4);hill(H*.68,H*.05,'#7cc56f',.5,6);
 [[.6,.72,.008,.9],[1.2,.76,.012,.95]].forEach(([sp,y0,s,y1],l)=>fl[l].forEach(f=>{const px=((f.x*W-t*sp*spd*W*.003)%W+W)%W;flower(px,H*(y0+f.y*(y1-y0)*.4),H*s*(.7+f.s*.5),f.c)}));
 x.fillStyle='#5cb84a';x.fillRect(0,G,W,H-G);
 const ex=W*.18,ey=G+P.y;
 // obstacles: bushes with bees
 obs.forEach(o=>{x.fillStyle='#2f7d32';for(let k=0;k<3;k++){x.beginPath();x.arc(o.x+(k-1)*o.w*.35,G-o.h*.45,o.w*.4,0,7);x.fill()}x.font=`${H*.035}px sans-serif`;x.fillText('🐝',o.x-H*.02+Math.sin(t*.2)*5,G-o.h-H*.01)});
 pick.forEach(o=>flower(o.x,o.y+Math.sin(t*.1+o.x)*4,H*.014,o.c));
 parts=parts.filter(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.4;x.fillStyle=p.c;x.globalAlpha=p.l/30;x.beginPath();x.arc(p.x,p.y,H*.006,0,7);x.fill();x.globalAlpha=1;return --p.l>0});
 // player
 const s=H*.11,ph=run?t*.25:0;x.lineCap='round';x.strokeStyle='#5b3a29';x.lineWidth=s*.09;
 const leg=(a)=>{x.beginPath();x.moveTo(ex,ey-s*.4);x.lineTo(ex+Math.sin(a)*s*.25,ey);x.stroke()};leg(ph);leg(ph+Math.PI);
 x.fillStyle='#ff7aa8';x.beginPath();x.moveTo(ex-s*.2,ey-s*.38);x.lineTo(ex+s*.2,ey-s*.38);x.lineTo(ex+s*.1,ey-s*.8);x.lineTo(ex-s*.1,ey-s*.8);x.fill();
 x.beginPath();x.moveTo(ex,ey-s*.7);x.lineTo(ex+Math.sin(ph+Math.PI)*s*.25,ey-s*.5);x.stroke();
 x.fillStyle='#ffd9b3';x.beginPath();x.arc(ex,ey-s*.92,s*.15,0,7);x.fill();x.fillStyle='#f2c14e';x.beginPath();x.ellipse(ex,ey-s*1.03,s*.28,s*.06,0,0,7);x.fill();x.beginPath();x.arc(ex,ey-s*1.06,s*.13,Math.PI,0);x.fill();
 x.fillStyle='#ff5e8a';x.beginPath();x.arc(ex+s*.12,ey-s*1.07,s*.04,0,7);x.fill();
 // foreground grass
 x.strokeStyle='#3f9a35';x.lineWidth=H*.004;for(let i=0;i<W;i+=W/90){const gx=((i-t*W*.008*spd)%W+W)%W;x.beginPath();x.moveTo(gx,H);x.quadraticCurveTo(gx+5,H*.9,gx+Math.sin(t*.05+i)*8,H*.86+(i%7)*3);x.stroke()}
}
frame();
