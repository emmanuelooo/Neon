"use strict";
(()=>{
if(window.__NS)return;window.__NS=1
const $=id=>document.getElementById(id),W=450,H=800,PY=H-120
const cv=$("c"),ctx=cv.getContext("2d"),st=$("st"),ov=$("ov")
const ls={get:k=>{try{return JSON.parse(localStorage.getItem(k))}catch{return null}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}}}
const S=Object.assign({mv:.8,sv:.8,mu:.5,ctl:"mouse",q:"high",tr:0},ls.get("ns_set"))
const P=Object.assign({score:0,combo:0,bricks:0,bosses:0,wins:0,best:0,games:0,rush:0,streak:0,lastDay:0,ach:[]},ls.get("ns_prof"))
const save=()=>{ls.set("ns_set",S);ls.set("ns_prof",P);ls.set("ns_inv",{sp:startPower,db:dblNext,bl:bonusLives,jm:jumboNext,sh:shieldNext})}
const R=(a,b)=>a+Math.random()*(b-a)
const timed=()=>mode==="time"||mode==="surge"||mode==="jumbo"
const dayNum=()=>Math.floor(Date.now()/864e5)
const mulb=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}
const fmt=s=>String(s/60|0).padStart(2,"0")+":"+String(s%60|0).padStart(2,"0")
let scale=1,dpr=1,state="menu",mode="campaign",G={},name="Player",avatar=null,cur="home",ret="home",last=0
const INV=ls.get("ns_inv")||{}
let startPower=!!INV.sp,dblNext=!!INV.db,bonusLives=Math.min(Math.max(+INV.bl||0,0),20),jumboNext=!!INV.jm,shieldNext=!!INV.sh,tx=null,touch=false
const keys={},ms={pull:0,push:0},bt={pull:0,push:0}
const PU={F:["#ff6a00","F"],L:["#ff2bd6","L"],M:["#00e5ff","M"],G:["#ffe600","G"],W:["#52ff7a","W"],H:["#ff4466","♥"],S:["#9ad7ff","S"],X:["#d6c2ff","X"],B:["#ff9f1c","B"],J:["#39ff88","J"]},PK=Object.keys(PU)
const ACH=[["🏁","First Win",()=>P.wins>0],["🔥","Combo x20",()=>P.combo>=20],["🧱","500 Bricks",()=>P.bricks>=500],["👾","Boss Slayer",()=>P.bosses>0],["🏆","10K Score",()=>P.best>=10000],["⚡","Rush Clear",()=>P.rush>0],["🌃","Campaign Clear",()=>P.camp>0],["💎","25K Score",()=>P.best>=25000],["📅","3-Day Streak",()=>P.streak>=3]]
const STARS=Array.from({length:48},()=>({x:Math.random()*450,y:Math.random()*800,r:Math.random()*1.4+.3,p:Math.random()*6}))
const MAPS=[
["000000000","000000000","000000000","000000000"],
["111111111","0.0.0.0.0","222.222.2","000000000"],
["4.4.4.4.4",".1111111.","000050000","111111111"],
["330303033","122222221","4.4.4.4.4","000000000"],
["555555555","1.1.1.1.1","222222222","0.0.0.0.0"],
["333333333","140404041","222222222","000500000"],
["151515151","424242424","111111111","050505050","222.222.2"]
]
const fit=()=>{dpr=Math.min(devicePixelRatio||1,2.5);scale=Math.min(innerWidth/W,innerHeight/H);st.style.width=W*scale+"px";st.style.height=H*scale+"px";cv.width=Math.round(W*scale*dpr);cv.height=Math.round(H*scale*dpr)}
addEventListener("resize",fit);fit()

let ac,mg,sg,mug
const vol=()=>{if(!ac)return;mg.gain.value=S.mv;sg.gain.value=S.sv;mug.gain.value=S.mu*.5}
const initA=()=>{if(ac)return;try{ac=new(window.AudioContext||window.webkitAudioContext)();mg=ac.createGain();sg=ac.createGain();mug=ac.createGain();sg.connect(mg);mug.connect(mg);mg.connect(ac.destination);vol()}catch{}}
addEventListener("pointerdown",initA,{once:true});addEventListener("keydown",initA,{once:true})
const tone=(f,d=.08,ty="square",v=.15,dest)=>{
  if(!ac||state==="pause")return
  const o=ac.createOscillator(),g=ac.createGain(),t0=ac.currentTime
  o.type=ty;o.frequency.setValueAtTime(Math.max(40,f),t0)
  if(ty!=="sine")o.frequency.exponentialRampToValueAtTime(Math.max(36,f*(ty==="sawtooth"?.35:.62)),t0+d)
  g.gain.setValueAtTime(v,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+Math.max(.03,d))
  o.connect(g);g.connect(dest||sg);o.start(t0);o.stop(t0+d+.02)
}
const noise=(d=.12,v=.18,dest,fq=900,ft="bandpass")=>{
  if(!ac||state==="pause")return
  const n=Math.floor(ac.sampleRate*d),buf=ac.createBuffer(1,n,ac.sampleRate),data=buf.getChannelData(0)
  for(let i=0;i<n;i++)data[i]=(Math.random()*2-1)*(1-i/n)
  const src=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain()
  f.type=ft;f.frequency.value=fq;src.buffer=buf;g.gain.value=v
  src.connect(f);f.connect(g);g.connect(dest||sg);src.start()
}
const note=(f,d,ty,v)=>{const t0=ac.currentTime,o=ac.createOscillator(),g=ac.createGain();o.type=ty;o.frequency.value=f;g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(v,t0+.015);g.gain.exponentialRampToValueAtTime(.0001,t0+d);o.connect(g);g.connect(mug);o.start(t0);o.stop(t0+d+.02)}
const TR=[
 {n:"Afro Groove",b:104,r:55,w:"triangle",k:"x..x..x...x.x...",s:"....x.......x..x",h:"x.xxx.xxx.xxx.xx",bs:[0,-1,0,3,-1,5,3,-1,0,-1,0,3,-1,7,5,-1],ld:[12,-1,15,-1,17,-1,15,12,-1,10,-1,12,-1,-1,15,-1]},
 {n:"Amapiano Flow",b:112,r:49,w:"sine",k:"x...x...x...x...",s:"....x.......x...",h:".x.x.x.x.x.x.x.x",bs:[0,-1,-1,0,-1,3,-1,-1,5,-1,-1,3,-1,0,-1,-1],ld:[-1,-1,15,-1,-1,17,-1,15,-1,-1,12,-1,-1,10,-1,-1]},
 {n:"Synthwave Drive",b:120,r:55,w:"sawtooth",k:"x...x...x...x...",s:"....x.......x...",h:"x.x.x.x.x.x.x.x.",bs:[0,0,0,0,3,3,3,3,5,5,5,5,3,3,3,3],ld:[12,-1,15,-1,19,-1,15,-1,12,-1,15,-1,22,-1,19,-1]},
 {n:"Trap Pulse",b:140,r:41,w:"square",k:"x.....x...x.....",s:"........x.......",h:"xxxxxxxxxxxxxxxx",bs:[0,-1,-1,-1,-1,-1,0,-1,-1,-1,3,-1,-1,-1,-1,-1],ld:[-1,-1,-1,-1,15,-1,-1,-1,-1,-1,-1,-1,12,-1,-1,-1]},
 {n:"Lo-fi Chill",b:78,r:55,w:"sine",k:"x.....x...x.....",s:"....x.......x...",h:"x.x.x.x.x.x.x.x.",bs:[0,-1,-1,-1,5,-1,-1,-1,3,-1,-1,-1,7,-1,-1,-1],ld:[12,-1,-1,15,-1,-1,17,-1,-1,15,-1,-1,12,-1,-1,-1]}]
let mStep=0,mT=0
const music=()=>{
  const T=TR[S.tr],d=T?15/T.b:.3
  if(T&&ac&&(state==="play"||state==="menu")){
    const i=mStep++%16,hz=x=>T.r*2**(x/12)
    if(T.k[i]==="x"){const t0=ac.currentTime,o=ac.createOscillator(),g=ac.createGain();o.frequency.setValueAtTime(150,t0);o.frequency.exponentialRampToValueAtTime(45,t0+.14);g.gain.setValueAtTime(.9,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+.2);o.connect(g);g.connect(mug);o.start(t0);o.stop(t0+.22)}
    if(T.s[i]==="x"){noise(.13,.45,mug,1800);note(190,.08,"triangle",.3)}
    if(T.h[i]==="x")noise(.04,.2,mug,7000,"highpass")
    if(T.bs[i]>=0)note(hz(T.bs[i]),d*1.7,T.w==="sine"?"sine":"triangle",.7)
    if(T.ld[i]>=0)note(hz(T.ld[i])*2,.22,T.w,.2)
  }
  mT=setTimeout(music,d*1000*(mStep%2?1.12:.88))
}
music()

let tt;const toast=t=>{const e=$("toast");e.textContent=t;e.classList.add("on");clearTimeout(tt);tt=setTimeout(()=>e.classList.remove("on"),2400)}
const show=id=>{
  if(!id){ov.style.display="none";$("ctl").style.display="block";return}
  ov.style.display="flex";$("ctl").style.display="none";cur=id
  document.querySelectorAll(".p").forEach(p=>p.style.display=p.id===id?"flex":"none")
  if(id==="profile")refreshProfile();if(id==="store")refreshStore();if(id==="lb")loadLB()}
const go=id=>{ret=cur;show(id)}
function refreshProfile(){
  $("pn").textContent=name;const a=$("av");if(avatar){a.src=avatar;a.style.display="block"}
  const f=[["Lifetime score",P.score],["Best score",P.best],["Highest combo","×"+P.combo],["Bricks destroyed",P.bricks],["Bosses defeated",P.bosses],["Games played",P.games],["Daily streak","🔥"+(P.streak||0)]]
  $("pst").innerHTML=f.map(([a,b])=>`<div class="st"><b>${b.toLocaleString()}</b>${a}</div>`).join("")
  $("pb").innerHTML=ACH.map(([i,n])=>`<div class="st bd${P.ach.includes(n)?" on":""}"><span>${i}</span>${n}</div>`).join("")}
function refreshStore(){const q=n=>document.querySelector(`[data-p="${n}"]`),h=(n,f)=>q(n).style.display=f?"none":"";h("power_start",startPower);h("double_score",dblNext);h("jumbo_start",jumboNext);h("shield_start",shieldNext);h("neon_pack",startPower||dblNext||jumboNext||shieldNext)}
function loadLB(){const e=$("lbl");e.textContent="Loading…";if(!window.Vatar)return
  Vatar.leaderboard().then(({top,me})=>{e.textContent=(top.slice(0,10).map(t=>`#${t.rank} ${t.name} — ${t.score.toLocaleString()}`).join("\n")||"No scores yet")+(me?`\n\nYou: ${me.label} — ${me.score.toLocaleString()}`:"")}).catch(()=>e.textContent="Open from the Games app to see the leaderboard.")}
const setUI=()=>{["mv","sv","mu"].forEach(k=>$(k).value=S[k]);$("ctlb").textContent=S.ctl==="mouse"?"🖱️ Controls: Mouse / Touch":"⌨️ Controls: Keyboard";$("musb").textContent="🎵 Music: "+(TR[S.tr]?TR[S.tr].n:"Off");$("qb").textContent="✨ Graphics: "+(S.q==="high"?"High":"Medium")}
["mv","sv","mu"].forEach(k=>$(k).oninput=e=>{S[k]=+e.target.value;vol();save()})
$("ctlb").onclick=()=>{S.ctl=S.ctl==="mouse"?"keys":"mouse";setUI();save()}
$("musb").onclick=()=>{S.tr=S.tr>=TR.length-1?-1:S.tr+1;mStep=0;setUI();save()}
$("qb").onclick=()=>{S.q=S.q==="high"?"medium":"high";setUI();save()}
setUI()
document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>go(b.dataset.go))
document.querySelectorAll(".bk").forEach(b=>b.onclick=()=>show(ret))
document.querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>newGame(b.dataset.m))
document.querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>buy(b.dataset.p))
$("resume").onclick=()=>resume();$("restart").onclick=()=>newGame(mode);$("again").onclick=()=>newGame(mode)
$("quit").onclick=()=>{state="menu";G={};show("home")};$("tomenu").onclick=()=>{state="menu";G={};show("home")}
$("cont").onclick=()=>buy("extra_life")

const brick=(c,r,t)=>({x:13+c*47,bx:13+c*47,y:100+r*24,w:45,h:20,t,hp:t===1?3:t===5||t===6?2:t===3?99:1,r,sw:t===4})
const speed=()=>{let s=Math.min(360+G.lv*14+(G.boss?30:0)+(mode==="surge"?80:0),680);if(G.pu.s>0)s*=.62;if(mode==="zen")s*=.78;return s}
function newGame(m){
  mode=m;initA()
  G={score:0,lives:3+bonusLives+(mode==="zen"?2:0),lv:1,t:0,play:0,tl:mode==="surge"?75:mode==="jumbo"?90:180,rt:14,combo:0,maxc:0,bk:0,bossk:0,bricks:[],balls:[],caps:[],las:[],hz:[],pt:[],boss:null,
     pu:{f:0,l:0,w:0,m:0,s:0,j:0},px:W/2,w:90,shake:0,inv:0,ft:0,dbl:dblNext,msg:null,win:false,shield:0,flash:0}
  bonusLives=0;dblNext=false
  if(startPower){G.pu.f=G.pu.l=G.pu.w=40;startPower=false}
  if(mode==="daily")dailyStreak()
  if(jumboNext){G.pu.j=20;jumboNext=false}
  if(shieldNext){G.shield=2;shieldNext=false}
  build();serve();state="play";show(null);save()}
function dailyStreak(){const d=dayNum();if(P.lastDay===d)return;P.streak=P.lastDay===d-1?P.streak+1:1;P.lastDay=d;if(P.streak%3===0){jumboNext=true;toast("🔥 "+P.streak+"-day streak! Free Jumbo Start")}else toast("📅 Daily streak: day "+P.streak)}
function paint(rows){rows.forEach((row,r)=>[...row].forEach((ch,c)=>{if(ch===".")return;const t="0123456".indexOf(ch);G.bricks.push(brick(c,r,t<0?0:t))}))}
function build(){
  G.bricks=[];G.boss=null;G.hz=[];G.caps=[]
  if(mode==="boss"){mkBoss(G.lv-1,false);return}
  if(mode==="campaign"&&G.lv>=8){mkBoss(2,false);for(let c=0;c<9;c+=2)G.bricks.push(brick(c,6,1));return}
  if(mode==="campaign"){paint(MAPS[G.lv-1]||MAPS[0]);return}
  if(mode==="daily"){const rr=mulb(dayNum()*7+G.lv*131),rows=5+(G.lv>3?1:0);for(let r=0;r<rows;r++)for(let c=0;c<9;c++){if(rr()<.1)continue;const y=rr();G.bricks.push(brick(c,r,y<.12?2:y<.3?1:y<.38?4:y<.44?5:y<.5&&r===2?3:y<.54?6:0))}return}
  const L=timed()?1+(G.lv%5):mode==="endless"?2:G.lv,rows=mode==="endless"?5:mode==="zen"?4:Math.min(4+L,9)
  for(let r=0;r<rows;r++)for(let c=0;c<9;c++){
    if(L>1&&(r*5+c*3+L)%9===0)continue
    let t=0;if(L>1&&(r+c)%5===0)t=1;if(L>2&&(r*7+c*3)%13===0)t=2;if(L>3&&r===2&&c%3===1)t=3;if(L>2&&(r+c)%7===0)t=4;if(L>3&&(r*3+c)%11===0)t=5;if(mode==="jumbo"&&(r*3+c*5)%4===0)t=6
    G.bricks.push(brick(c,r,t))}}
function mkBoss(i,mini){const hp=mini?40:50+i*35;G.boss={x:W/2,y:150,w:130,h:46,hp,max:hp,t:0,a:2,s:5,i,cd:0}}
function serve(){G.balls=[{x:G.px,y:PY-12,vx:0,vy:0,st:1,ox:0,tr:[]}]}
function launch(){for(const b of G.balls)if(b.st){b.st=0;const a=R(-.35,.35)+b.ox/90,sp=speed();b.vx=Math.sin(a)*sp;b.vy=-Math.cos(a)*sp;tone(500,.08)}}
const col=k=>k.t===1?"#c8d0ff":k.t===2?"#ff5a1f":k.t===3?"#ffd700":k.t===4?"#b9f6ff":k.t===5?"#e7b6ff":k.t===6?"#39ff88":`hsl(${(k.r*38+170)%360} 100% 58%)`
function burst(x,y,c,n){for(let i=0;i<n&&G.pt.length<260;i++)G.pt.push({x,y,vx:R(-220,220),vy:R(-220,220),l:R(.3,.75),c})}

function hitBrick(k,d){
  if(k.dead||k.t===3){tone(160,.05,"square",.1);return}
  k.hp-=d;G.shake=Math.max(G.shake,2)
  if(k.hp>0){tone(300,.05);burst(k.x+22,k.y+10,"#9ff",4);return}
  k.dead=1;G.combo++;G.maxc=Math.max(G.maxc,G.combo);P.bricks++;G.bk++
  G.score+=10*(1+(G.combo/5|0))*(G.dbl?2:1)*(G.pu.j>0?5:1)
  tone(400+Math.min(G.combo,20)*30,.07)
  burst(k.x+22,k.y+10,col(k),S.q==="high"?14:6)
  if(k.t===4)G.pu.s=Math.max(G.pu.s,3.5)
  if(k.t===6){G.score+=200*(G.dbl?2:1)*(G.pu.j>0?5:1);G.caps.push({x:k.x+22,y:k.y+10,t:"J"});toast("💰 JUMBO +200")}
  if(k.t===5){G.score+=40*(G.dbl?2:1);const b=G.balls.find(x=>!x.st);if(b&&G.balls.length<6)G.balls.push({x:b.x,y:b.y,vx:-b.vx,vy:b.vy,st:0,ox:0,tr:[]})}
  if(k.t===2)boom(k);else if(Math.random()<(mode==="jumbo"?.3:.16))G.caps.push({x:k.x+22,y:k.y+10,t:PK[Math.random()*PK.length|0]})}
function boom(k){G.shake=10;tone(80,.3,"sawtooth",.3);noise(.22,.28);burst(k.x+22,k.y+10,"#ff8844",S.q==="high"?40:16)
  for(const o of G.bricks)if(!o.dead&&o!==k&&o.t!==3&&Math.hypot(o.x-k.x,o.y-k.y)<75)hitBrick(o,3)}
function hitBoss(d){const B=G.boss;if(!B||B.cd>0)return;B.cd=.12;B.hp-=d;G.shake=Math.max(G.shake,4);G.score+=25*(G.dbl?2:1);burst(B.x,B.y+20,"#ff2bd6",8);tone(200,.08,"sawtooth")}
function apply(t){tone(880,.08,"sine",.16);tone(1320,.14,"sine",.1);noise(.05,.08)
  if(t==="F")G.pu.f=12;if(t==="L")G.pu.l=12;if(t==="W")G.pu.w=15;if(t==="G")G.pu.m=15;if(t==="S")G.pu.s=10
  if(t==="J"){G.pu.j=12;toast("💰 JUMBO POINTS ×5")}
  if(t==="X"){G.shield=Math.min(3,G.shield+1);toast("🛡️ Shield up")}
  if(t==="B"){let n=0;G.shake=14;for(const k of G.bricks){if(k.dead||k.t===3)continue;hitBrick(k,9);if(++n>=8)break}}
  if(t==="H"&&G.lives<6){G.lives++;toast("❤️ Extra life!")}
  if(t==="M"){const b=G.balls.find(x=>!x.st);if(b)for(const a of[-.45,.45]){const c=Math.cos(a),s=Math.sin(a);G.balls.push({x:b.x,y:b.y,vx:b.vx*c-b.vy*s,vy:b.vx*s+b.vy*c,st:0,ox:0,tr:[]})}}}
function lose(){if(G.shield>0){G.shield--;G.shake=8;toast("🛡️ Shield broke");tone(520,.12,"sine",.16);tone(260,.2,"triangle",.12);serve();return}G.lives--;G.combo=0;G.shake=12;tone(90,.45,"sawtooth",.3);noise(.28,.22);burst(G.px,PY,"#ff4466",30);if(G.lives<=0)return end(false);serve()}
function hurt(){if(G.inv>0)return;G.inv=1.6;G.lives--;G.shake=12;tone(90,.4,"sawtooth",.3);burst(G.px,PY,"#ff4466",30);if(G.lives<=0)end(false)}
function stepBall(b,d,pull,push){
  if(b.st){b.x=G.px+b.ox;b.y=PY-12;return}
  const sp=speed()
  if(pull||push){const dx=G.px-b.x,dy=PY-b.y,l=Math.hypot(dx,dy)||1,f=(pull?1:-1)*1400*d;b.vx+=dx/l*f;b.vy+=dy/l*f}
  const v=Math.hypot(b.vx,b.vy)||1;b.vx*=sp/v;b.vy*=sp/v
  if(Math.abs(b.vy)<sp*.2)b.vy=(b.vy<0?-1:1)*sp*.2
  b.x+=b.vx*d;b.y+=b.vy*d
  if(b.x<8){b.x=8;b.vx=Math.abs(b.vx)}else if(b.x>W-8){b.x=W-8;b.vx=-Math.abs(b.vx)}
  if(b.y<8){b.y=8;b.vy=Math.abs(b.vy)}
  if(b.vy>0&&b.y+7>=PY&&b.y<PY+14&&Math.abs(b.x-G.px)<G.w/2+7){
    const a=(b.x-G.px)/(G.w/2)*1.05;b.vx=Math.sin(a)*sp;b.vy=-Math.cos(a)*sp;b.y=PY-8;G.combo=0;tone(220,.06)
    if(G.pu.m>0){b.st=1;b.ox=b.x-G.px}}
  const fire=G.pu.f>0
  for(const k of G.bricks){
    if(k.dead||b.x+7<k.x||b.x-7>k.x+k.w||b.y+7<k.y||b.y-7>k.y+k.h)continue
    const pierce=fire&&k.t!==3
    if(!pierce){const ox=Math.min(b.x+7-k.x,k.x+k.w-(b.x-7)),oy=Math.min(b.y+7-k.y,k.y+k.h-(b.y-7))
      if(ox<oy){b.vx=(b.x<k.x+k.w/2?-1:1)*Math.abs(b.vx);b.x+=b.vx>0?ox:-ox}else{b.vy=(b.y<k.y+k.h/2?-1:1)*Math.abs(b.vy);b.y+=b.vy>0?oy:-oy}}
    hitBrick(k,fire?3:1);if(!pierce)break}
  const B=G.boss
  if(B&&Math.abs(b.x-B.x)<B.w/2+7&&Math.abs(b.y-B.y)<B.h/2+7){b.vy=b.y<B.y?-Math.abs(b.vy):Math.abs(b.vy);b.y+=b.vy>0?4:-4;hitBoss(fire?3:1)}}
function addRows(n){G.bricks.forEach(k=>k.y+=24*n)
  for(let r=0;r<n;r++)for(let c=0;c<9;c++){if(Math.random()<.1)continue;const x=Math.random(),L=G.lv;G.bricks.push(brick(c,r,x>.95?6:L>2&&x<.08?2:L>1&&x<.25?1:L>4&&x<.3?3:0))}}
function nextStage(){
  if(mode==="endless"){addRows(3);return}
  if(timed()){G.score+=500*(G.dbl?2:1);G.lv++;build();serve();G.msg={t:1.6,txt:"CLEARED +500"};return}
  if(mode==="zen"&&G.lv>=6)return end(true)
  if(mode==="daily"&&G.lv>=6)return end(true)
  G.lv++;G.score+=300*(G.dbl?2:1);build();serve();G.msg={t:1.8,txt:"LEVEL "+G.lv+(G.lv===8?" · BOSS":"")};tone(700,.3,"sine",.2)}
function bossDown(){const B=G.boss;P.bosses++;G.bossk++;G.score+=1500*(G.dbl?2:1);G.shake=16
  burst(B.x,B.y,"#ff2bd6",60);burst(B.x,B.y,"#00e5ff",40);tone(60,.6,"sawtooth",.35);G.boss=null;G.hz=[]
  if(mode==="boss"&&G.lv<3){G.lv++;build();serve();G.msg={t:1.8,txt:"BOSS "+G.lv};return}
  if(mode==="boss")P.rush=1
  end(true)}
function checkAch(){for(const[i,n,f]of ACH)if(f()&&!P.ach.includes(n)){P.ach.push(n);toast("🏅 Unlocked: "+n)}}
function end(win){
  if(state==="over")return
  state="over";G.win=win;P.score+=G.score;P.combo=Math.max(P.combo,G.maxc);P.best=Math.max(P.best,G.score);P.games++;if(win){P.wins++;if(mode==="campaign")P.camp=1}
  checkAch();save()
  if(window.Vatar&&G.score>0&&G.score>=P.best&&G.score<=3000*G.play+1000)Vatar.submitScore(G.score).then(()=>Vatar.leaderboard()).then(({me})=>{if(me&&state==="over")$("ovsub").textContent+=" · "+me.label}).catch(()=>{})
  const timeUp=(timed())&&G.tl<=0
  $("ovt").textContent=win?"🏆 VICTORY":timeUp?"⏱️ TIME UP":"GAME OVER"
  $("ovsub").textContent=`${"⭐".repeat(G.score>=8000?3:G.score>=3000?2:G.score>=800?1:0)} Score ${G.score.toLocaleString()} · Best ${P.best.toLocaleString()}`
  $("ovst").innerHTML=[["Time",fmt(G.play)],["Bricks",G.bk],["Max combo","×"+G.maxc],["Bosses",G.bossk]].map(([a,b])=>`<div class="st"><b>${b}</b>${a}</div>`).join("")
  $("cont").style.display=win||timeUp?"none":"";$("omsg").textContent="";show("over")}
function revive(){G.lives=1;G.inv=2;G.hz=[];state="play";serve();show(null)}
function update(dt){
  G.t+=dt;G.play+=dt
  if(timed())if((G.tl-=dt)<=0)return end(false)
  const kx=(keys.ArrowRight||keys.d||keys.D?1:0)-(keys.ArrowLeft||keys.a||keys.A?1:0)
  if(kx)G.px+=kx*560*dt;else if(tx!=null&&(S.ctl==="mouse"||touch))G.px+=(tx-G.px)*Math.min(1,dt*24)
  G.w+=((G.pu.w>0?150:90)-G.w)*Math.min(1,dt*10);G.px=Math.max(G.w/2,Math.min(W-G.w/2,G.px))
  for(const k in G.pu)G.pu[k]=Math.max(0,G.pu[k]-dt)
  G.inv=Math.max(0,G.inv-dt);G.shake=Math.max(0,G.shake-dt*30)
  if(G.msg&&(G.msg.t-=dt)<=0)G.msg=null
  if(G.flash>0)G.flash-=dt
  for(const k of G.bricks)if(k.sw)k.x=k.bx+Math.sin(G.t*1.6+k.r)*16
  const pull=ms.pull||keys[" "]||bt.pull,push=ms.push||keys.Shift||bt.push,hi=S.q==="high"
  if(G.pu.l>0&&(G.ft-=dt)<=0){G.ft=.28;G.las.push({x:G.px-G.w/2+8,y:PY},{x:G.px+G.w/2-8,y:PY});tone(900,.05,"sawtooth",.07)}
  for(const l of G.las){l.y-=760*dt
    for(const k of G.bricks)if(!k.dead&&!l.d&&l.x>k.x&&l.x<k.x+k.w&&l.y<k.y+k.h&&l.y>k.y-8){hitBrick(k,1);l.d=1}
    const B=G.boss;if(B&&!l.d&&Math.abs(l.x-B.x)<B.w/2&&l.y<B.y+B.h/2&&l.y>B.y-B.h/2){hitBoss(1);l.d=1}}
  G.las=G.las.filter(l=>!l.d&&l.y>-20)
  for(let s=0;s<3;s++)for(const b of G.balls)stepBall(b,dt/3,pull,push)
  for(const b of G.balls){b.tr.unshift({x:b.x,y:b.y});const n=hi?14:6;if(b.tr.length>n)b.tr.length=n}
  G.balls=G.balls.filter(b=>b.y<H+12);if(!G.balls.length)lose()
  if(state!=="play")return
  for(const c of G.caps){c.y+=150*dt;if(c.y>PY-6&&c.y<PY+18&&Math.abs(c.x-G.px)<G.w/2+18){apply(c.t);c.d=1}}
  G.caps=G.caps.filter(c=>!c.d&&c.y<H+20)
  for(const z of G.hz){z.y+=z.vy*dt;if(z.y>PY-6&&z.y<PY+16&&Math.abs(z.x-G.px)<G.w/2+4){z.d=1;hurt()}}
  G.hz=G.hz.filter(z=>!z.d&&z.y<H+30)
  const B=G.boss
  if(B){B.t+=dt;B.cd=Math.max(0,B.cd-dt);B.x=W/2+Math.sin(B.t*(.7+B.i*.15))*(W/2-B.w/2-12)
    if((B.a-=dt)<=0){B.a=2.6-B.i*.3;const n=3+B.i;for(let i=0;i<n;i++)G.hz.push({x:B.x+(i-(n-1)/2)*34,y:B.y+26,vy:260+B.i*30});tone(120,.15,"sawtooth")}
    if((B.s-=dt)<=0){B.s=7;if(G.bricks.filter(k=>!k.dead).length<14)for(let i=0;i<3;i++)G.bricks.push(brick(Math.floor(R(0,9)),Math.floor(R(4,6)),0))}}
  if(mode==="endless"||mode==="surge")if((G.rt-=dt)<=0){G.rt=Math.max(mode==="surge"?4:6,14-G.lv*.4);G.lv++;addRows(1);if(G.bricks.some(k=>k.t!==3&&k.y+k.h>PY-34))return end(false)}
  for(const p of G.pt){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=300*dt;p.l-=dt}
  G.pt=G.pt.filter(p=>p.l>0)
  G.bricks=G.bricks.filter(k=>!k.dead&&k.y<H)
  if(G.boss){if(G.boss.hp<=0)bossDown()}else if(!G.bricks.some(k=>k.t!==3))nextStage()}

function drawBoss(B,hi){
  ctx.save();ctx.translate(B.x,B.y);ctx.shadowColor="#ff2bd6";ctx.shadowBlur=hi?20:0
  ctx.fillStyle=B.cd>0?"#fff":"#2a1040";ctx.strokeStyle="#ff2bd6";ctx.lineWidth=3
  ctx.beginPath();ctx.roundRect(-B.w/2,-B.h/2,B.w,B.h,12);ctx.fill();ctx.stroke()
  ctx.fillStyle="#ff3355";ctx.fillRect(-30,-6,60,10)
  ctx.fillStyle="#00e5ff";ctx.fillRect(-B.w/2-10,-8,10,24);ctx.fillRect(B.w/2,-8,10,24)
  ctx.fillStyle="#ff2bd6"
  for(const s of[-40,0,40]){ctx.beginPath();ctx.moveTo(s-8,B.h/2);ctx.lineTo(s+8,B.h/2);ctx.lineTo(s,B.h/2+14+Math.sin(B.t*20)*3);ctx.fill()}
  ctx.beginPath();ctx.moveTo(0,-B.h/2);ctx.lineTo(0,-B.h/2-16);ctx.stroke();ctx.restore()}
function draw(t){
  ctx.setTransform(dpr*scale,0,0,dpr*scale,0,0)
  const bg=ctx.createLinearGradient(0,0,W*.2,H)
  bg.addColorStop(0,"#10183a");bg.addColorStop(.5,"#05060f");bg.addColorStop(1,"#1a0620")
  ctx.fillStyle=bg;ctx.fillRect(0,0,W,H)
  ctx.strokeStyle="rgba(0,229,255,.07)";ctx.lineWidth=1;ctx.beginPath()
  for(let y=(t/50)%40-40;y<H;y+=40){ctx.moveTo(0,y);ctx.lineTo(W,y)}
  for(let x=0;x<=W;x+=50){ctx.moveTo(x,0);ctx.lineTo(x,H)}
  ctx.stroke()
  for(const s of STARS){ctx.globalAlpha=.2+.55*Math.abs(Math.sin(t/650+s.p));ctx.fillStyle=s.p>4?"#ffd6ff":"#dff";ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,7);ctx.fill()}
  ctx.globalAlpha=1
  const vg=ctx.createRadialGradient(W/2,H*.42,80,W/2,H/2,540);vg.addColorStop(0,"rgba(80,0,90,.18)");vg.addColorStop(1,"rgba(0,0,0,.72)");ctx.fillStyle=vg;ctx.fillRect(0,0,W,H)
  if(!G.bricks)return
  const hi=S.q==="high"
  ctx.save();if(G.shake>0)ctx.translate(R(-1,1)*G.shake,R(-1,1)*G.shake)
  for(const k of G.bricks){
    const c=col(k);ctx.shadowColor=c;ctx.shadowBlur=hi?16:4;ctx.globalAlpha=k.t===1?.55+k.hp*.15:.95
    if(hi){const g=ctx.createLinearGradient(k.x,k.y,k.x,k.y+k.h);g.addColorStop(0,"#fff");g.addColorStop(.22,c);g.addColorStop(1,"#120818");ctx.fillStyle=g}else ctx.fillStyle=c
    ctx.beginPath();ctx.roundRect(k.x,k.y,k.w,k.h,5);ctx.fill();ctx.globalAlpha=1;ctx.shadowBlur=0
    ctx.fillStyle="rgba(255,255,255,.45)";ctx.fillRect(k.x+4,k.y+2,k.w-10,2)
    if(k.t===2){ctx.fillStyle="#300";ctx.font="bold 14px system-ui";ctx.textAlign="center";ctx.fillText("✸",k.x+k.w/2,k.y+15)}
    if(k.t===4){ctx.fillStyle="#036";ctx.font="bold 12px system-ui";ctx.textAlign="center";ctx.fillText("❄",k.x+k.w/2,k.y+15)}
    if(k.t===5){ctx.fillStyle="#402050";ctx.font="bold 12px system-ui";ctx.textAlign="center";ctx.fillText("◆",k.x+k.w/2,k.y+15)}
    if(k.t===6){ctx.fillStyle="#053";ctx.font="bold 13px system-ui";ctx.textAlign="center";ctx.fillText("$",k.x+k.w/2,k.y+15)}
    if(k.t===1){ctx.fillStyle="#9cf";for(let i=0;i<k.hp;i++)ctx.fillRect(k.x+8+i*10,k.y+12,6,4)}}
  ctx.shadowBlur=0
  if(G.boss)drawBoss(G.boss,hi)
  ctx.fillStyle="#ff3355";ctx.shadowColor="#ff3355";ctx.shadowBlur=hi?12:0
  for(const z of G.hz){ctx.beginPath();ctx.moveTo(z.x,z.y-14);ctx.lineTo(z.x+5,z.y+12);ctx.lineTo(z.x-5,z.y+12);ctx.fill()}
  ctx.fillStyle="#ff2bd6";ctx.shadowColor="#ff2bd6";for(const l of G.las){ctx.shadowBlur=hi?12:0;ctx.fillRect(l.x-2,l.y-10,4,18)}
  ctx.textAlign="center";ctx.font="bold 12px system-ui"
  for(const c of G.caps){const[cl,lb]=PU[c.t];ctx.shadowColor=cl;ctx.shadowBlur=hi?14:0;ctx.fillStyle=cl;ctx.beginPath();ctx.arc(c.x,c.y,11,0,7);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle="#041018";ctx.fillText(lb,c.x,c.y+4)}
  const pw=G.w,px=G.px-pw/2,pc=G.pu.m>0?"#ffe600":G.pu.s>0?"#9ad7ff":"#00e5ff"
  ctx.globalAlpha=G.inv>0&&(t/90|0)%2?.35:1;ctx.shadowColor=pc;ctx.shadowBlur=hi?22:6
  const pg=ctx.createLinearGradient(px,PY-2,px,PY+14);pg.addColorStop(0,"#fff");pg.addColorStop(.35,pc);pg.addColorStop(1,"#041820")
  ctx.fillStyle=pg;ctx.beginPath();ctx.roundRect(px,PY,pw,13,7);ctx.fill()
  ctx.fillStyle="rgba(255,255,255,.55)";ctx.fillRect(px+8,PY+2,pw-16,2)
  if(G.shield>0){ctx.shadowBlur=0;ctx.strokeStyle="#d6c2ff";ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(G.px,PY+6,pw/2+8,16,0,Math.PI,0);ctx.stroke()}
  if(G.pu.l>0){ctx.fillStyle="#ff2bd6";ctx.fillRect(px+4,PY-8,6,8);ctx.fillRect(px+pw-10,PY-8,6,8)}
  ctx.globalAlpha=1
  ctx.globalCompositeOperation="lighter"
  for(const b of G.balls){const fc=G.pu.f>0?"#ff7a00":G.pu.s>0?"#bfefff":"#7ff"
    b.tr.forEach((p,i)=>{ctx.globalAlpha=.45*(1-i/b.tr.length);ctx.fillStyle=fc;ctx.beginPath();ctx.arc(p.x,p.y,8*(1-i/b.tr.length*.65),0,7);ctx.fill()})
    ctx.globalAlpha=1;ctx.shadowColor=fc;ctx.shadowBlur=hi?22:6;ctx.fillStyle=fc;ctx.beginPath();ctx.arc(b.x,b.y,8,0,7);ctx.fill()
    ctx.shadowBlur=0;ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(b.x-2,b.y-2,3,0,7);ctx.fill()}
  ctx.shadowBlur=0
  for(const p of G.pt){ctx.globalAlpha=Math.min(1,p.l*1.6);ctx.fillStyle=p.c;ctx.fillRect(p.x,p.y,hi?3.5:2.5,hi?3.5:2.5)}
  ctx.globalAlpha=1;ctx.globalCompositeOperation="source-over";ctx.restore()
  ctx.font="bold 15px ui-monospace,Menlo,Consolas,monospace"
  ctx.textAlign="left";ctx.fillStyle="#cff";ctx.fillText("SCORE "+G.score.toLocaleString(),14,26)
  ctx.textAlign="center";ctx.fillStyle="#8af";ctx.fillText("BEST "+Math.max(P.best,G.score).toLocaleString(),W/2+10,26)
  ctx.textAlign="right";ctx.fillStyle="#f8f";ctx.fillText(mode==="boss"?"BOSS "+G.lv:mode==="endless"?"WAVE "+G.lv:"LV "+G.lv,W-58,26)
  for(let i=0;i<Math.min(G.lives,6);i++){ctx.fillStyle="#00e5ff";ctx.beginPath();ctx.roundRect(14+i*30,42,24,7,3);ctx.fill()}
  ctx.textAlign="center";ctx.fillStyle="#fff";ctx.fillText(fmt(timed()?Math.max(0,G.tl):G.play),W/2,52)
  if(G.combo>=5){ctx.textAlign="right";ctx.fillStyle="#ffe600";ctx.fillText("×"+(1+(G.combo/5|0))+" COMBO",W-14,52)}
  let bx=14;ctx.textAlign="left";ctx.font="bold 11px system-ui"
  for(const[k,l]of[["f","F"],["l","L"],["w","W"],["m","G"],["s","S"],["j","J"]])if(G.pu[k]>0){ctx.fillStyle=PU[l][0];ctx.fillText(PU[l][1],bx,72);ctx.fillRect(bx+12,65,50*Math.min(1,G.pu[k]/15),6);bx+=76}
  if(G.shield>0){ctx.fillStyle="#d6c2ff";ctx.fillText("SH"+G.shield,bx,72)}
  if(G.boss){ctx.fillStyle="#222";ctx.fillRect(14,80,W-28,7);ctx.fillStyle="#ff2bd6";ctx.fillRect(14,80,(W-28)*Math.max(0,G.boss.hp/G.boss.max),7)}
  ctx.textAlign="center"
  if(state==="play"&&G.balls.some(b=>b.st)){ctx.font="bold 15px system-ui";ctx.fillStyle="#fff";ctx.globalAlpha=.6+.4*Math.sin(t/200);ctx.fillText("TAP / CLICK / SPACE TO LAUNCH",W/2,PY-60);ctx.globalAlpha=1}
  if(G.msg){ctx.globalAlpha=Math.min(1,G.msg.t*2);ctx.font="900 34px system-ui";ctx.fillStyle="#fff";ctx.shadowColor="#ff2bd6";ctx.shadowBlur=20;ctx.fillText(G.msg.txt,W/2,H*.45);ctx.shadowBlur=0;ctx.globalAlpha=1}}

const pos=e=>{const r=cv.getBoundingClientRect();tx=(e.clientX-r.left)/scale}
cv.addEventListener("pointermove",e=>{if(e.pointerType==="touch")touch=true;pos(e)})
cv.addEventListener("pointerdown",e=>{e.preventDefault();pos(e);if(e.pointerType==="touch")touch=true;if(state!=="play")return;launch();if(e.pointerType!=="touch"){if(e.button===2)ms.push=1;else ms.pull=1}})
addEventListener("pointerup",()=>{ms.pull=0;ms.push=0})
cv.addEventListener("contextmenu",e=>e.preventDefault())
const hold=(id,k)=>{const b=$(id);b.addEventListener("pointerdown",e=>{e.preventDefault();bt[k]=1;launch()});for(const t of["pointerup","pointercancel","pointerleave"])b.addEventListener(t,()=>{bt[k]=0})}
hold("pull","pull");hold("push","push")
function pause(){if(state==="play"){state="pause";save();show("pause");try{ac&&ac.suspend()}catch{}}}
function resume(){if(state==="pause"){state="play";show(null);last=performance.now();try{ac&&ac.resume()}catch{}}}
$("pz").onclick=()=>pause()
{const mn=$("mn");if(mn)mn.onclick=()=>pause()}
addEventListener("keydown",e=>{keys[e.key]=1
  if(state==="play"&&[" ","ArrowLeft","ArrowRight"].includes(e.key))e.preventDefault()
  if(e.key==="Escape"){if(state==="play")pause();else if(state==="pause")resume()}
  if(e.key===" "&&state==="play")launch()})
addEventListener("keyup",e=>{keys[e.key]=0})
document.addEventListener("visibilitychange",()=>{if(document.hidden)pause()})
let fa=0,fn=0
function loop(t){
  const dt=Math.min(.033,(t-last)/1000);last=t
  if(state==="play")update(dt)
  draw(t)
  fa+=dt;if(++fn===120){if(fa/fn>.026&&S.q==="high"){S.q="medium";setUI();save()}fa=fn=0}
  requestAnimationFrame(loop)}
requestAnimationFrame(loop)
show("home")

const msg=t=>{$("msg").textContent=t;$("omsg").textContent=t}
const claiming=new Set()
const claim=async p=>{
  if(!p||claiming.has(p.purchaseId))return
  claiming.add(p.purchaseId)
  try{const{session}=await Vatar.session()
    const r=await fetch("/claim",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({session,purchaseId:p.purchaseId})})
    if(!r.ok){claiming.delete(p.purchaseId);return msg(r.status===409?"That purchase was already used or refunded.":"Could not confirm that purchase. Try again.")}
    const{productId:id}=await r.json()
    if(id==="power_start"){startPower=true;msg("⚡ Power Start ready for your next run!")}
    if(id==="double_score"){dblNext=true;msg("✨ 2× Score ready for your next run!")}
    if(id==="neon_pack"){startPower=true;dblNext=true;jumboNext=true;shieldNext=true;bonusLives+=3;msg("💎 Neon Pack ready for your next run!")}
    if(id==="jumbo_start"){jumboNext=true;msg("💰 Jumbo Start ready for your next run!")}
    if(id==="shield_start"){shieldNext=true;msg("🛡️ Shield Pack ready for your next run!")}
    if(id==="extra_life"){if(state==="over"&&!G.win&&!(timed()&&G.tl<=0))revive();else{bonusLives++;msg("❤️ Bonus life saved for your next run!")}}
    save();refreshStore()}catch{claiming.delete(p.purchaseId);msg("Something went wrong. Try again.")}}
const buy=id=>{if(!window.Vatar)return msg("Open from the Games app to buy.");Vatar.purchase(id).then(claim).catch(e=>{if(e.code==="cancelled")return;const M={payment_failed:"Payment did not go through.",rate_limited:"Slow down a little, then try again.",busy:"A pay sheet is already open.",owned:"You already own this.",not_for_sale:"This item is not available right now.",off:"Purchases are paused for this game.",timeout:"No answer, try again.",not_framed:"Open from the Games app to buy."};msg(M[e.code]||"Payment: "+e.code)})}
if(window.Vatar){
  Vatar.init().then(({player})=>{name=player.name;avatar=player.avatar;$("sub").textContent=`Hi ${name} 👋🏾 Ready to break some bricks?`;Vatar.purchases().then(l=>l.forEach(claim))})
    .catch(e=>{$("sub").textContent=e.code==="not_framed"?"Preview mode: open from the Games app for scores & store":"Error: "+e.code})
  Vatar.onPurchase(claim);Vatar.onPause(pause);Vatar.onResume(()=>{last=performance.now()})
}else $("sub").textContent="Preview mode"
})()
