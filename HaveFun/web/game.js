(() => {
  "use strict";

  // Design prototype: compact, deliberately readable systems for the creator to study and rewrite.
  const canvas = document.querySelector("#game");
  const ctx = canvas.getContext("2d");
  const oilDayArtwork = new Image();
  oilDayArtwork.src = "assets/oil-day.png";
  const oilMorningArtwork = new Image(); oilMorningArtwork.src = "assets/oil-morning.png";
  const oilEveningArtwork = new Image(); oilEveningArtwork.src = "assets/oil-evening.png";
  const oilNightArtwork = new Image(); oilNightArtwork.src = "assets/oil-night.png";
  const oilArtwork = [oilMorningArtwork,oilDayArtwork,oilEveningArtwork,oilNightArtwork];
  const watercolorMorningArtwork = new Image(); watercolorMorningArtwork.src = "assets/watercolor-morning.png";
  const watercolorDayArtwork = new Image(); watercolorDayArtwork.src = "assets/watercolor-day.png";
  const watercolorEveningArtwork = new Image(); watercolorEveningArtwork.src = "assets/watercolor-evening.png";
  const watercolorNightArtwork = new Image(); watercolorNightArtwork.src = "assets/watercolor-night.png";
  const watercolorArtwork = [watercolorMorningArtwork,watercolorDayArtwork,watercolorEveningArtwork,watercolorNightArtwork];
  const UI = {
    intro: document.querySelector("#intro"), ending: document.querySelector("#ending"), gameOver: document.querySelector("#gameOver"),
    start: document.querySelector("#startButton"), replay: document.querySelector("#replayButton"),
    retry: document.querySelector("#retryButton"), input: document.querySelector("#kindMessage"), inputCount: document.querySelector("#messageCount"),
    message: document.querySelector("#messageText"), words: document.querySelector("#wordCount"),
    distance: document.querySelector("#distanceFill"), finalMessage: document.querySelector("#finalMessage"),
    endingNote: document.querySelector("#endingNote"), score: document.querySelector("#finalScore"),
    sound: document.querySelector("#soundButton"), time: document.querySelector("#timeButton"), messageButton: document.querySelector("#messageButton"),
    timeIcon: document.querySelector("#timeIcon"), timeLabel: document.querySelector("#timeLabel"),
    gameOverTitle: document.querySelector("#gameOverTitle"), gameOverNote: document.querySelector("#gameOverNote"), toast: document.querySelector("#gameToast")
  };

  const C = { ink:"#302d34", paper:"#f7f4f2", mist:"#d8d4d8", red:"#d88f8f", peach:"#dcaa8d", yellow:"#deda8f", green:"#90d48e", blue:"#8db2d7", indigo:"#4a64a4", deep:"#3f5f9d", lavender:"#aa83d3", pink:"#cf84cb", teal:"#009e92", shadow:"#54504d" };
  let words = ["YOU", "ARE", "DOING", "BETTER", "THAN", "YOU", "THINK"];
  const WORLD_END = 3180;
  const keys = { left:false, right:false, jump:false, recall:false };
  let playing = false, finished = false, camera = 0, last = 0, elapsed = 0, shake = 0, muted = false, toastTimer;
  let fiveTheme = 0;
  let audio, musicStep = 0, musicNextTime = 0, musicTheme = -1;
  const TIMES = [
    {name:"MORNING",icon:"☀",top:"#dcaa8d",mid:"#deda8f",low:"#8db2d7",sun:"#f7f4f2",far:"#90d48e",near:"#6fa170",spark:"#f7f4f2"},
    {name:"DAY",icon:"●",top:"#8db2d7",mid:"#8db2d7",low:"#90d48e",sun:"#deda8f",far:"#627b9f",near:"#6fa170",spark:"#f7f4f2"},
    {name:"EVENING",icon:"◒",top:"#925271",mid:"#d88f8f",low:"#dcaa8d",sun:"#deda8f",far:"#705eb0",near:"#4a64a4",spark:"#deda8f"},
    {name:"NIGHT",icon:"☾",top:"#3f5f9d",mid:"#627b9f",low:"#aa83d3",sun:"#f7f4f2",far:"#4a64a4",near:"#705eb0",spark:"#f7f4f2"}
  ];
  const hour=new Date().getHours();
  let timeIndex=1;

  const player = { x:120, y:485, vx:0, vy:0, w:42, h:58, grounded:false, hitTimer:0, carried:[], facing:1 };
  const dropped = [];
  const particles = [];
  const platforms = [
    {x:0,y:565,w:680,h:155}, {x:745,y:590,w:420,h:130}, {x:1220,y:550,w:330,h:170},
    {x:1615,y:605,w:390,h:115}, {x:2070,y:540,w:360,h:180}, {x:2500,y:590,w:680,h:130},
    {x:410,y:425,w:155,h:24}, {x:870,y:438,w:180,h:24}, {x:1320,y:385,w:150,h:24},
    {x:1770,y:450,w:145,h:24}, {x:2180,y:390,w:145,h:24}, {x:2660,y:430,w:170,h:24}
  ];
  const hazards = [
    {type:"oilSpike",oilKind:"spike",x:315,y:523,w:62,h:42},
    {type:"pencil",oilKind:"tile",x:530,y:526,w:95,h:25,vx:0,min:530,max:530},
    {type:"fan",oilKind:"fan",x:930,y:520,w:68,h:70,phase:0},
    {type:"cloud",x:1420,y:480,w:76,h:48,vx:-55,min:1245,max:1510},
    {type:"pencil",x:1810,y:566,w:95,h:25,vx:-80,min:1660,max:1960},
    {type:"fan",x:2210,y:470,w:68,h:70,phase:2},
    {type:"cloud",x:2720,y:512,w:76,h:48,vx:70,min:2520,max:2910}
  ];
  const gardenBouncers=[{x:1285,y:523,w:82,power:650,type:"leaf"},{x:1510,y:515,w:88,power:720,type:"flower"},{x:1740,y:575,w:92,power:680,type:"leaf"},{x:1940,y:575,w:84,power:740,type:"flower"}];
  const doubtCreatures=[{x:2290,y:485,min:2180,max:2400,vx:34,phase:0},{x:2580,y:535,min:2470,max:2710,vx:-42,phase:2.4},{x:2860,y:530,min:2770,max:2980,vx:38,phase:4.2}];
  const pigeons=[{x:355,y:530,phase:0},{x:1010,y:555,phase:2},{x:1135,y:515,phase:4}];

  function readMessage() {
    const clean=UI.input.value.toUpperCase().replace(/[^A-Z0-9' ]/g," ").trim().split(/\s+/).filter(Boolean).slice(0,10);
    words=clean.length>=2?clean:["YOU","MATTER"];
    UI.input.value=words.join(" ");
  }

  function reset() {
    Object.assign(player,{x:120,y:485,vx:0,vy:0,w:42,h:58,grounded:false,hitTimer:0,carried:words.map((text,index)=>({text,index})),facing:1});
    dropped.length = particles.length = 0; camera = elapsed = shake = 0; finished = false;
    doubtCreatures.forEach((d,i)=>{d.x=[2290,2580,2860][i];d.cooldown=0;});
    updateUI();
  }

  function start(animatePacking=false) {
    readMessage(); reset(); UI.ending.classList.remove("visible"); UI.gameOver.classList.remove("visible");
    if(animatePacking){packWords();return;}
    playing=true;UI.intro.classList.remove("visible");showToast(`${words.length} WORDS PACKED — HANDLE WITH KINDNESS`);
    tone(330,.07,"sine",.018);tone(494,.11,"sine",.016,.07);tone(659,.16,"sine",.012,.14);
  }

  function packWords(){
    playing=false;UI.intro.classList.add("packing");const frame=document.querySelector(".game-frame"),box=frame.getBoundingClientRect(),from=UI.input.getBoundingClientRect(),target=UI.words.getBoundingClientRect();
    words.forEach((word,i)=>{const token=document.createElement("span");token.className="packing-token";token.textContent=word;frame.appendChild(token);const sx=from.left-box.left+from.width*(i+.5)/words.length,sy=from.top-box.top+from.height/2,tx=target.left-box.left+target.width/2,ty=target.top-box.top+target.height/2;token.style.left=`${sx}px`;token.style.top=`${sy}px`;token.animate([{transform:"translate(-50%,-50%) scale(1) rotate(0deg)",opacity:1},{transform:`translate(${(tx-sx)*.45}px,-90px) scale(1.18) rotate(${i%2?12:-12}deg)`,opacity:1,offset:.45},{transform:`translate(${tx-sx}px,${ty-sy}px) scale(.18) rotate(${i%2?190:-190}deg)`,opacity:.15}],{duration:720,delay:i*95,easing:"cubic-bezier(.22,.9,.28,1)",fill:"forwards"});setTimeout(()=>token.remove(),850+i*95);tone(330+i*42,.1,"triangle",.014,i*.095);});
    setTimeout(()=>{UI.intro.classList.remove("packing","visible");playing=true;showToast(`${words.length} WORDS PACKED — ENTERING THE OIL-PAINTED CITY`);tone(659,.2,"sine",.02);},850+words.length*95);
  }

  function updateUI() {
    UI.words.textContent = player.carried.length;
    UI.distance.style.width = `${Math.min(100, player.x/(WORLD_END-180)*100)}%`;
    UI.message.innerHTML = words.map((w,i) => `<span class="${player.carried.some(v=>v.index===i)?"":"lost"}">${w}</span>`).join(" ");
    UI.timeIcon.textContent=TIMES[timeIndex].icon; UI.timeLabel.textContent=TIMES[timeIndex].name;
  }

  function tone(freq,duration=.08,type="sine",volume=.03,delay=0) {
    if (muted) return;
    ensureAudio();
    const o=audio.createOscillator(), g=audio.createGain(), t=audio.currentTime+delay;
    o.type=type; o.frequency.setValueAtTime(freq,t); g.gain.setValueAtTime(volume,t); g.gain.exponentialRampToValueAtTime(.0001,t+duration);
    o.connect(g).connect(audio.destination); o.start(t); o.stop(t+duration);
  }

  function ensureAudio(){
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    if(audio.state==="suspended")audio.resume();
    return audio;
  }

  function musicNote(freq,start,duration,type="sine",volume=.008){
    if(muted||!audio)return;
    const o=audio.createOscillator(),g=audio.createGain(),filter=audio.createBiquadFilter();
    o.type=type;o.frequency.setValueAtTime(freq,start);filter.type="lowpass";filter.frequency.setValueAtTime(type==="square"?1250:2100,start);
    g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(volume,start+.035);g.gain.exponentialRampToValueAtTime(.0001,start+duration);
    o.connect(filter).connect(g).connect(audio.destination);o.start(start);o.stop(start+duration+.03);
  }

  function scheduleMusic(){
    if(!playing||finished||muted||!audio)return;
    if(musicTheme!==fiveTheme){musicTheme=fiveTheme;musicStep=0;musicNextTime=audio.currentTime+.08;}
    const scores=[
      {notes:[261.63,329.63,392,523.25,392,329.63,293.66,392],bass:[130.81,146.83],type:"triangle",beat:.42,vol:.0085},
      {notes:[293.66,369.99,440,587.33,440,392,329.63,440],bass:[146.83,164.81],type:"sine",beat:.46,vol:.0075},
      {notes:[220,277.18,329.63,440,329.63,277.18,246.94,369.99],bass:[110,123.47],type:"square",beat:.34,vol:.0045}
    ];
    const score=scores[Math.min(fiveTheme,scores.length-1)];
    while(musicNextTime<audio.currentTime+.32){
      const i=musicStep%score.notes.length;
      musicNote(score.notes[i],musicNextTime,score.beat*.78,score.type,score.vol);
      if(i%4===0)musicNote(score.bass[(musicStep/4|0)%2],musicNextTime,score.beat*3.45,"sine",.0035);
      if(i===3||i===7)musicNote(score.notes[i]*2,musicNextTime,score.beat*.36,"sine",.0028);
      musicNextTime+=score.beat;musicStep++;
    }
  }

  function showToast(message){clearTimeout(toastTimer);UI.toast.textContent=message;UI.toast.classList.add("visible");toastTimer=setTimeout(()=>UI.toast.classList.remove("visible"),1800);}

  function loseWord() {
    if (player.hitTimer > 0 || !player.carried.length) return;
    const word = player.carried.pop();
    dropped.push({ ...word, x:player.x+21, y:player.y+10, vx:-player.facing*(220+Math.random()*90), vy:-280-Math.random()*110, bob:Math.random()*6.28, pickupDelay:1.05 });
    player.hitTimer=1.25; player.vx=-player.facing*180; player.vy=-230; shake=10;
    burst(player.x+21,player.y+20,C.pink,12); tone(145,.18,"sawtooth",.035); updateUI();
    if(!player.carried.length) setTimeout(()=>{if(!player.carried.length)gameOver("No words left!","Every word tumbled away. Take a breath, repack the message, and try once more.");},280);
  }

  function recoverWord(word,index) {
    player.carried.push({text:word.text,index:word.index}); player.carried.sort((a,b)=>a.index-b.index); dropped.splice(index,1);
    burst(word.x,word.y,C.yellow,14); tone(440+word.index*45,.1,"sine",.025);tone(660+word.index*24,.15,"triangle",.012,.06);showToast(`${word.text} CAME HOME!`);updateUI();
  }

  function burst(x,y,color,count) {
    for(let i=0;i<count;i++) particles.push({x,y,vx:(Math.random()-.5)*230,vy:(Math.random()-.8)*220,life:.5+Math.random()*.4,color});
  }

  function overlaps(a,b) { return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y; }

  function update(dt) {
    if (!playing || finished) return;
    fiveTheme=player.x<1080?0:player.x<2160?1:2;
    elapsed += dt; player.hitTimer=Math.max(0,player.hitTimer-dt); shake=Math.max(0,shake-28*dt);
    const dir=(keys.right?1:0)-(keys.left?1:0), oldX=player.x;
    player.vx += dir*1250*dt; player.vx *= Math.pow(player.grounded?.0004:.06,dt); player.vx=Math.max(-260,Math.min(260,player.vx));
    if(dir) player.facing=dir;
    if(keys.jump && player.grounded){player.vy=-520;player.grounded=false;tone(260,.08,"square",.018);}
    keys.jump=false; player.vy += 1300*dt;
    const oldY=player.y; player.x+=player.vx*dt; player.y+=player.vy*dt; player.x=Math.max(15,Math.min(WORLD_END-30,player.x)); player.grounded=false;
    for(const p of platforms){
      if(player.x+player.w>p.x && player.x<p.x+p.w && oldY+player.h<=p.y+7 && player.y+player.h>=p.y && player.vy>=0){player.y=p.y-player.h;player.vy=0;player.grounded=true;}
    }
    if(player.y>760){gameOver("The little guy fell!","Mind the gaps between the rooftops. Your message is packed and ready for another attempt.");return;}

    hazards.forEach(h=>{
      if(h.vx){h.x+=h.vx*dt;if(h.x<h.min||h.x>h.max)h.vx*=-1;}
      if(h.type==="fan"){if(fiveTheme!==0){h.phase+=dt*8;if(Math.abs(player.x-h.x)<190&&player.y>h.y-80)player.vx+=(player.x<h.x?-1:1)*460*dt;}}
      const top=h.type==="fan"?h.y+45:h.y;
      const landed=player.x+player.w>h.x-4&&player.x<h.x+h.w+4&&oldY+player.h<=top+14&&player.y+player.h>=top&&player.vy>=0;
      if(landed){player.y=top-player.h;player.vy=h.type==="cloud"?-390:0;player.grounded=h.type!=="cloud";if(h.type==="cloud")tone(310,.09,"sine",.018);return;}
      if(h.type==="fan")return;
      const nearX=Math.abs((player.x+player.w/2)-(h.x+h.w/2))<h.w/2+player.w/2+12;
      const nearY=Math.abs((player.y+player.h/2)-(h.y+h.h/2))<h.h/2+player.h/2+10;
      if(nearX&&nearY){player.x=oldX;player.vx=-Math.sign(player.vx||player.facing)*150;if(h.type==="cloud"||h.type==="oilSpike"||(h.type==="pencil"&&player.x>h.x+h.w-4))loseWord();else tone(210,.06,"square",.012);}
    });

    gardenBouncers.forEach(b=>{const landed=player.x+player.w>b.x&&player.x<b.x+b.w&&oldY+player.h<=b.y+10&&player.y+player.h>=b.y&&player.vy>=0;if(landed){player.y=b.y-player.h;player.vy=-b.power;player.grounded=false;burst(player.x+21,b.y,C.green,8);tone(b.type==="flower"?390:330,.12,"sine",.02);}});

    doubtCreatures.forEach(d=>{d.phase+=dt*3;d.cooldown=Math.max(0,(d.cooldown||0)-dt);d.x+=d.vx*dt;if(d.x<d.min||d.x>d.max)d.vx*=-1;const near=Math.hypot(player.x+21-d.x,player.y+28-(d.y+Math.sin(d.phase)*8))<54;if(near&&!d.cooldown){d.cooldown=1.4;loseWord();d.vx*=-1;}});

    dropped.forEach((w,i)=>{
      w.pickupDelay=Math.max(0,w.pickupDelay-dt);w.vy+=900*dt;w.x+=w.vx*dt;w.y+=w.vy*dt;w.vx*=Math.pow(.08,dt);w.bob+=dt*4;
      for(const p of platforms){if(w.x>p.x&&w.x<p.x+p.w&&w.y>=p.y-8&&w.y<p.y+20&&w.vy>0){w.y=p.y-9;w.vy*=-.28;}}
      if(w.y>720){w.y=350;w.vy=0;}
      const wordTop=w.y-15;
      if(player.x+player.w>w.x-33&&player.x<w.x+33&&oldY+player.h<=wordTop+7&&player.y+player.h>=wordTop&&player.vy>=0){player.y=wordTop-player.h;player.vy=0;player.grounded=true;}
    });
    if(keys.recall&&dropped.length){let best=-1,dist=150;dropped.forEach((w,i)=>{const d=Math.hypot(player.x+21-w.x,player.y+25-w.y);if(!w.pickupDelay&&d<dist){best=i;dist=d;}});if(best>=0)recoverWord(dropped[best],best);}keys.recall=false;
    particles.forEach((p,i)=>{p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=420*dt;if(p.life<=0)particles.splice(i,1);});
    camera += ((Math.max(0,Math.min(WORLD_END-canvas.width,player.x-canvas.width*.35)))-camera)*Math.min(1,dt*5);
    if(player.x>3050) finish();
    updateUI();
  }

  function finish() {
    finished=true; playing=false;
    const found=[...player.carried].sort((a,b)=>a.index-b.index).map(w=>w.text);
    UI.finalMessage.textContent=found.length?found.join(" "):"...";
    UI.endingNote.textContent=found.length===words.length?"Every word made it home. Your friend will remember this.":found.length>=Math.ceil(words.length/2)?"It wasn't the whole sentence—but the kindness still arrived.":"Even the smallest bit of kindness can cross a very long distance.";
    UI.score.textContent=Math.max(10,player.carried.length*12+Math.max(0,20-Math.floor(elapsed/8)));
    UI.ending.classList.add("visible"); [392,494,587,784].forEach((f,i)=>tone(f,.35,"sine",.028,i*.11));
  }

  function gameOver(title,note){if(finished)return;finished=true;playing=false;UI.gameOverTitle.textContent=title;UI.gameOverNote.textContent=note;UI.gameOver.classList.add("visible");tone(196,.25,"sine",.018);}

  function roundRect(x,y,w,h,r,fill,stroke=C.ink,lw=3){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.lineWidth=lw;ctx.strokeStyle=stroke;ctx.stroke();}}
  function text(t,x,y,size=20,color=C.ink,align="center"){ctx.font=`900 ${size}px ui-rounded, system-ui, sans-serif`;ctx.textAlign=align;ctx.textBaseline="middle";ctx.fillStyle=color;ctx.fillText(t,x,y);}
  function ease(a,b,v){const n=Math.max(0,Math.min(1,(v-a)/(b-a)));return n*n*(3-2*n);}
  function rgb(color){if(color.startsWith("rgb"))return color.match(/[\d.]+/g).slice(0,3).map(Number);const n=parseInt(color.slice(1),16);return[(n>>16)&255,(n>>8)&255,n&255];}
  function blend(a,b,t){const A=rgb(a),B=rgb(b);return`rgb(${A.map((v,i)=>Math.round(v+(B[i]-v)*t)).join(",")})`;}
  function oilStroke(x,y,len,angle,color,width=7,alpha=.72){ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.lineCap="round";ctx.globalAlpha=alpha*.28;ctx.strokeStyle=C.shadow;ctx.lineWidth=width+5;ctx.beginPath();ctx.moveTo(-len/2,3);ctx.quadraticCurveTo(0,-3,len/2,2);ctx.stroke();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(-len/2,0);ctx.quadraticCurveTo(0,-5,len/2,0);ctx.stroke();ctx.globalAlpha=alpha*.58;ctx.strokeStyle=blend(color,C.paper,.58);ctx.lineWidth=Math.max(2,width*.28);ctx.beginPath();ctx.moveTo(-len*.38,-width*.18);ctx.lineTo(len*.35,-width*.34);ctx.stroke();ctx.restore();ctx.globalAlpha=1;}
  function watercolorBloom(x,y,rx,ry,color,seed=0){ctx.save();for(let i=0;i<7;i++){const pulse=1+Math.sin(elapsed*.32+seed+i)*.018;ctx.globalAlpha=.035+i*.018;ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x+Math.sin(seed+i*2.1)*rx*.08,y+Math.cos(seed+i*1.7)*ry*.09,rx*pulse*(1-i*.035),ry*pulse*(1-i*.025),seed*.17,0,6.3);ctx.fill();}ctx.globalAlpha=.2;ctx.strokeStyle=blend(color,C.shadow,.24);ctx.lineWidth=2;ctx.setLineDash([2,5,9,4]);ctx.beginPath();ctx.ellipse(x,y,rx*.92,ry*.9,seed*.17,0,6.3);ctx.stroke();ctx.setLineDash([]);ctx.restore();ctx.globalAlpha=1;}
  function drawWatercolorPlatform(p,i){const washes=[[C.blue,C.lavender],[C.green,C.blue],[C.peach,C.red]],pair=washes[i%3];ctx.save();ctx.shadowColor="rgba(63,95,157,.2)";ctx.shadowBlur=12;ctx.shadowOffsetY=7;ctx.beginPath();ctx.moveTo(p.x+4,p.y+4);for(let x=p.x+18;x<p.x+p.w-8;x+=18)ctx.lineTo(x,p.y+3+Math.sin(x*.21+i)*2);ctx.lineTo(p.x+p.w-4,p.y+7);ctx.lineTo(p.x+p.w-7,p.y+p.h-7);for(let x=p.x+p.w-18;x>p.x+8;x-=20)ctx.lineTo(x,p.y+p.h-5+Math.sin(x*.17+i)*4);ctx.lineTo(p.x+5,p.y+p.h-9);ctx.closePath();ctx.fillStyle=blend(pair[0],C.paper,.38);ctx.fill();ctx.shadowColor="transparent";ctx.save();ctx.clip();for(let n=0;n<Math.ceil(p.w/52);n++)watercolorBloom(p.x+24+n*52,p.y+24+(n%3)*28,52,34,[pair[0],pair[1],C.paper][n%3],i*9+n);ctx.globalAlpha=.16;ctx.fillStyle=C.paper;for(let n=0;n<90;n++)ctx.fillRect(p.x+(n*47)%p.w,p.y+(n*73)%Math.max(18,p.h),1,1);ctx.restore();ctx.strokeStyle=blend(C.deep,C.paper,.16);ctx.lineWidth=4;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(p.x+7,p.y+5);for(let x=p.x+20;x<p.x+p.w-6;x+=16)ctx.lineTo(x,p.y+4+Math.sin(x*.19+i)*1.8);ctx.stroke();ctx.globalAlpha=.42;ctx.strokeStyle=pair[1];ctx.lineWidth=2;for(let n=0;n<Math.min(8,Math.floor(p.w/48));n++){const x=p.x+28+n*48+(i%3)*7,len=8+(n%4)*6;ctx.beginPath();ctx.moveTo(x,p.y+8);ctx.quadraticCurveTo(x+3,p.y+len,x-2,p.y+len+8);ctx.stroke();}ctx.restore();ctx.globalAlpha=1;}
  function drawMediumPlatform(p,medium,i){if(medium===1){drawWatercolorPlatform(p,i);return;}const palettes=[[C.indigo,C.deep,C.indigo],[C.blue,C.peach,C.lavender],[C.deep,C.teal,C.indigo]],base=palettes[medium][i%3];ctx.save();ctx.shadowColor="rgba(48,45,52,.32)";ctx.shadowBlur=10;ctx.shadowOffsetY=7;roundRect(p.x,p.y,p.w,p.h,12,medium===2?C.ink:blend(base,C.paper,.05),blend(C.shadow,C.ink,.62),5);ctx.shadowColor="transparent";ctx.beginPath();ctx.roundRect(p.x+3,p.y+3,p.w-6,p.h-6,9);ctx.clip();if(medium===0){for(let n=0;n<Math.ceil(p.w/22);n++)oilStroke(p.x+12+n*23,p.y+18+(n%4)*16,34+(n%3)*12,-.18+(n%5)*.08,[C.deep,C.indigo,C.blue,C.paper][n%4],6,.42);ctx.globalAlpha=.9;ctx.strokeStyle=C.blue;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(p.x+8,p.y+8);ctx.quadraticCurveTo(p.x+p.w*.5,p.y+3,p.x+p.w-8,p.y+8);ctx.stroke();}else{ctx.font="800 12px ui-monospace,monospace";ctx.textAlign="left";for(let y=p.y+16;y<p.y+p.h;y+=16){ctx.fillStyle=(y/16|0)%2?C.teal:C.green;ctx.globalAlpha=.68;for(let x=p.x+8;x<p.x+p.w;x+=72)ctx.fillText("[]{}<>/\\_+=",x,y);}}ctx.restore();ctx.globalAlpha=1;}
  function drawMediumBackground(){
    const oilScene=oilArtwork[timeIndex];if(fiveTheme===0&&oilScene.complete&&oilScene.naturalWidth){ctx.drawImage(oilScene,0,0,1280,720);const haze=ctx.createLinearGradient(0,260,0,720);haze.addColorStop(0,"rgba(247,244,242,0)");haze.addColorStop(1,timeIndex===3?"rgba(20,28,58,.09)":"rgba(48,45,52,.06)");ctx.fillStyle=haze;ctx.fillRect(0,0,1280,720);return;}
    const watercolorScene=watercolorArtwork[timeIndex];if(fiveTheme===1&&watercolorScene.complete&&watercolorScene.naturalWidth){ctx.drawImage(watercolorScene,0,0,1280,720);ctx.globalAlpha=.055;ctx.fillStyle=C.paper;for(let i=0;i<240;i++){const x=(i*83)%1280,y=(i*137)%720;ctx.fillRect(x,y,1+(i%2),1);}ctx.globalAlpha=1;return;}
    const g=ctx.createLinearGradient(0,0,0,720);
    if(fiveTheme===0){g.addColorStop(0,C.blue);g.addColorStop(.48,C.paper);g.addColorStop(1,C.green);ctx.fillStyle=g;ctx.fillRect(0,0,1280,720);for(let i=0;i<150;i++){const x=(i*97-camera*.035)%1450-80,y=25+(i*53)%510+Math.sin(elapsed*1.4+i)*3,len=18+(i%6)*9;ctx.globalAlpha=.25+(i%4)*.08;ctx.strokeStyle=[C.paper,C.blue,C.green,C.yellow,C.indigo][i%5];ctx.lineWidth=4+(i%3)*2;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+len,y-8+(i%3)*8);ctx.stroke();}ctx.globalAlpha=1;for(let i=0;i<6;i++){const x=i*280-camera*.08,y=470-(i%3)*55;ctx.fillStyle=i%2?C.green:C.indigo;ctx.beginPath();ctx.moveTo(x-190,650);ctx.quadraticCurveTo(x-70,y-180,x,y);ctx.quadraticCurveTo(x+105,y-95,x+190,650);ctx.fill();}}
    if(fiveTheme===1){g.addColorStop(0,C.paper);g.addColorStop(.55,C.blue);g.addColorStop(1,C.peach);ctx.fillStyle=g;ctx.fillRect(0,0,1280,720);for(let i=0;i<34;i++){const x=(i*163-camera*.04)%1500-100+Math.sin(elapsed*.6+i)*5,y=40+(i*79)%500;ctx.globalAlpha=.08+(i%4)*.05;ctx.fillStyle=[C.blue,C.lavender,C.red,C.teal][i%4];ctx.beginPath();ctx.ellipse(x,y,90+(i%5)*22+Math.sin(elapsed+i)*5,28+(i%3)*15,i*.17,0,6.3);ctx.fill();}ctx.globalAlpha=1;for(let i=0;i<7;i++){const x=i*230-camera*.07,w=55+(i%3)*20,y=455-(i%2)*45;ctx.globalAlpha=.5;ctx.fillStyle=i%2?C.paper:C.blue;ctx.fillRect(x,y-190,w,250);ctx.fillStyle=C.peach;ctx.fillRect(x-14,y-205,w+28,22);}ctx.globalAlpha=1;}
    if(fiveTheme===2){ctx.fillStyle=C.ink;ctx.fillRect(0,0,1280,720);ctx.font="700 16px ui-monospace, monospace";ctx.textAlign="left";for(let y=24;y<620;y+=20)for(let x=0;x<1320;x+=13){const wave=Math.sin(x*.018+y*.025+camera*.002+elapsed*.8);ctx.globalAlpha=.22+Math.abs(wave)*.48;ctx.fillStyle=wave>.35?C.teal:wave<-.35?C.lavender:C.green;ctx.fillText(" .:+*#@"[(x/13+y/20)%7|0],x,y);}ctx.globalAlpha=1;}
    if(fiveTheme===3){ctx.fillStyle=C.paper;ctx.fillRect(0,0,1280,720);for(let i=0;i<25;i++){const x=(i*139-camera*.05)%1450-80,y=40+(i*61)%520;ctx.globalAlpha=.32;ctx.strokeStyle=[C.red,C.yellow,C.green,C.blue,C.pink,C.teal][i%6];ctx.lineWidth=14+(i%3)*7;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+80,y-60+(i%4)*35,x+170,y+15);ctx.stroke();for(let n=0;n<4;n++){ctx.globalAlpha=.12;ctx.beginPath();ctx.moveTo(x,y+n*4);ctx.lineTo(x+170,y+15+n*3);ctx.stroke();}}ctx.globalAlpha=1;}
    if(fiveTheme===0){for(let i=0;i<82;i++){const x=((i*157-camera*.045)%1500+1500)%1500-100,y=28+(i*83)%500;oilStroke(x,y,28+(i%5)*13,-.35+(i%7)*.11,[C.paper,C.blue,C.green,C.yellow,C.peach,C.lavender][i%6],5+(i%4),.26+(i%3)*.08);}for(let i=0;i<9;i++){const x=i*175-camera*.08,w=105+(i%3)*28,h=110+(i*47)%170,y=495-h;ctx.fillStyle=blend([C.indigo,C.green,C.red,C.peach][i%4],C.paper,.34);ctx.beginPath();ctx.moveTo(x,y+20);ctx.lineTo(x+w*.45,y-12-(i%2)*24);ctx.lineTo(x+w,y+18);ctx.lineTo(x+w,520);ctx.lineTo(x,520);ctx.closePath();ctx.fill();ctx.strokeStyle=blend(C.shadow,C.indigo,.42);ctx.lineWidth=4;ctx.stroke();for(let r=0;r<5;r++)oilStroke(x+w*.48,y+28+r*23,w*.75,.02,[C.paper,C.yellow,C.blue][r%3],5,.42);}}
    if(fiveTheme===1){for(let i=0;i<28;i++){const x=((i*199-camera*.045)%1550+1550)%1550-120,y=30+(i*91)%510;watercolorBloom(x,y,75+(i%4)*26,30+(i%3)*14,[C.blue,C.lavender,C.peach,C.green,C.red][i%5],i);}ctx.globalAlpha=.14;ctx.fillStyle=C.shadow;for(let i=0;i<360;i++){const x=(i*83)%1280,y=(i*137)%720;ctx.fillRect(x,y,1+(i%2),1);}ctx.globalAlpha=1;}
    if(fiveTheme===2){ctx.save();ctx.globalAlpha=.18;ctx.strokeStyle=C.mist;ctx.setLineDash([2,9]);for(let i=0;i<14;i++){ctx.beginPath();ctx.moveTo(0,80+i*34);ctx.lineTo(1280,80+i*34);ctx.stroke();}ctx.setLineDash([]);ctx.restore();}
    const tint=TIMES[timeIndex];ctx.globalAlpha=timeIndex===3?.46:timeIndex===2?.14:.035;ctx.fillStyle=tint.top;ctx.fillRect(0,0,1280,720);if(timeIndex===3){const night=ctx.createLinearGradient(0,0,0,720);night.addColorStop(0,"rgba(48,45,52,.58)");night.addColorStop(.7,"rgba(63,95,157,.25)");night.addColorStop(1,"rgba(170,131,211,.12)");ctx.fillStyle=night;ctx.fillRect(0,0,1280,720);for(let i=0;i<36;i++){ctx.globalAlpha=.35+.35*Math.sin(elapsed*1.5+i);ctx.fillStyle=i%4?C.paper:C.yellow;ctx.beginPath();ctx.arc((i*173)%1280,28+(i*71)%270,1+(i%4===0?2:0),0,6.3);ctx.fill();}}ctx.globalAlpha=1;
  }
  function drawFiveWorldBackground(){
    const palettes=[["#fb806c","#f4ba78","#55558e"],["#46bce9","#bde986","#52a46a"],["#e9ad65","#8dc6d7","#6f4335"],["#f4edda","#c8c0ae","#514d4b"],["#55bfe4","#c8e878","#4c9870"]],p=palettes[fiveTheme],g=ctx.createLinearGradient(0,0,0,720);g.addColorStop(0,p[0]);g.addColorStop(.58,p[1]);g.addColorStop(1,p[2]);ctx.fillStyle=g;ctx.fillRect(0,0,1280,720);
    if(fiveTheme===0){
      // Layered studio-city silhouettes: varied roofs, terraces and warm windows instead of repeated boxes.
      for(let layer=0;layer<3;layer++)for(let i=0;i<9;i++){const x=i*185-camera*(.045+layer*.035)-90+layer*48,w=105+(i%3)*31,h=105+((i*61+layer*47)%185),y=470-h,c=[[C.lavender,C.blue],[C.indigo,C.deep],[C.deep,C.ink]][layer][i%2];ctx.globalAlpha=.28+layer*.2;ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(x,y+28);ctx.quadraticCurveTo(x+w*.18,y,x+w*.42,y+14);ctx.lineTo(x+w*.58,y-28-(i%2)*25);ctx.lineTo(x+w*.72,y+14);ctx.quadraticCurveTo(x+w*.9,y-4,x+w,y+25);ctx.lineTo(x+w,520);ctx.lineTo(x,520);ctx.closePath();ctx.fill();if(layer===2){ctx.globalAlpha=.72;ctx.fillStyle=C.yellow;for(let wy=y+52;wy<455;wy+=34)for(let wx=x+18;wx<x+w-16;wx+=30){ctx.beginPath();ctx.roundRect(wx,wy,11,17,5);ctx.fill();}}}ctx.globalAlpha=1;
      const haze=ctx.createLinearGradient(0,210,0,520);haze.addColorStop(0,"rgba(247,244,242,0)");haze.addColorStop(1,"rgba(220,170,141,.36)");ctx.fillStyle=haze;ctx.fillRect(0,190,1280,350);
    }
    if(fiveTheme===1){for(let i=0;i<5;i++){ctx.fillStyle=["#64b36d","#7dc77c","#9bd783"][i%3];ctx.beginPath();ctx.ellipse(170+i*300-camera*.08,510-i%2*45,290,125,0,0,6.3);ctx.fill();}ctx.strokeStyle=C.paper;ctx.lineWidth=6;ctx.beginPath();for(let x=0;x<1280;x+=14){const y=265+Math.sin(x*.026+elapsed*2)*22+Math.sin(x*.071)*9;x?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();ctx.fillStyle="#d7a93d";ctx.beginPath();ctx.arc(1020,190,78,0,6.3);ctx.fill();ctx.fillStyle="#795734";ctx.beginPath();ctx.arc(1020,190,48,0,6.3);ctx.fill();text("THE MEADOW OF MUSIC",560,100,30,C.paper);text("EVERY KIND WORD ADDS ANOTHER INSTRUMENT",560,137,11,C.paper);}
    if(fiveTheme===2){ctx.fillStyle="#75442f";ctx.fillRect(0,0,1280,720);ctx.fillStyle="#9f6847";for(let y=0;y<720;y+=70)ctx.fillRect(0,y,1280,5);roundRect(95,70,500,255,14,"#8ed5ea",C.yellow,10);ctx.fillStyle="#302d34";for(let i=0;i<12;i++){const x=670+(i%4)*135,y=90+Math.floor(i/4)*105;roundRect(x,y,110,75,9,"#263b53",C.teal,4);text(["{ }","</>","01","AI"][i%4],x+55,y+38,20,C.green);}text("THE CODE COTTAGE",345,370,30,C.paper);text("DEBUG THE DOUBT · SHIP THE KINDNESS",345,405,11,C.yellow);}
    if(fiveTheme===3){ctx.fillStyle="#f5efdf";ctx.fillRect(0,0,1280,720);for(let i=0;i<7;i++){const x=i*220-camera*.07,y=500-(i%3)*55;ctx.globalAlpha=.16+i%2*.12;ctx.fillStyle=C.ink;ctx.beginPath();ctx.moveTo(x-180,700);ctx.quadraticCurveTo(x-80,y-220,x,y);ctx.quadraticCurveTo(x+95,y-150,x+170,700);ctx.fill();}ctx.globalAlpha=.92;ctx.strokeStyle=C.ink;ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(930,520);ctx.lineTo(930,200);ctx.moveTo(800,260);ctx.lineTo(1060,260);ctx.moveTo(825,255);ctx.lineTo(930,175);ctx.lineTo(1035,255);ctx.stroke();text("THE INKBOUND TEMPLE",420,95,30,C.ink);text("EVEN DARK THOUGHTS CAN LEARN TO DANCE",420,132,11,C.shadow);ctx.globalAlpha=1;}
    if(fiveTheme===4){for(let i=0;i<8;i++){const x=i*190-camera*.1,y=520-(i%3)*80;ctx.fillStyle=i%2?"#4b8d69":"#77b66d";ctx.beginPath();ctx.moveTo(x-170,680);ctx.quadraticCurveTo(x-65,y-220,x,y);ctx.quadraticCurveTo(x+85,y-155,x+170,680);ctx.fill();ctx.fillStyle="#c9dc8b";for(let n=0;n<8;n++){ctx.beginPath();ctx.arc(x-60+n*17,y-30+(n%3)*17,13,0,6.3);ctx.fill();}}ctx.fillStyle="#d9f4ef";ctx.fillRect(895-camera*.05,155,24,380);ctx.globalAlpha=.45;ctx.beginPath();ctx.ellipse(907-camera*.05,535,115,20,0,0,6.3);ctx.fill();ctx.globalAlpha=1;text("THE MOUNTAIN ARCHIVE",400,90,30,C.paper);text("EVERY SUMMIT KEEPS A MEMORY",400,128,11,C.paper);}
    if(fiveTheme===0)drawCinemaBackdrop();
    const tint=TIMES[timeIndex];ctx.globalAlpha=timeIndex===3?.28:timeIndex===2?.12:.04;ctx.fillStyle=tint.top;ctx.fillRect(0,0,1280,720);ctx.globalAlpha=1;
  }
  function drawCinemaBackdrop(){
    // Sparse cinematic landscape; the interactive props carry the story.
    ctx.save();ctx.translate(-camera*.07,0);
    for(let i=0;i<6;i++){const x=160+i*390,y=405-(i%2)*35;ctx.globalAlpha=.18;ctx.fillStyle=i%2?C.paper:C.yellow;ctx.beginPath();ctx.ellipse(x,y,220,42,0,0,6.3);ctx.fill();}ctx.globalAlpha=1;
    ctx.restore();
  }
  function drawBackground() {
    if(fiveTheme>=0&&fiveTheme<3){drawMediumBackground();const edge=Math.min(Math.abs(player.x-1080),Math.abs(player.x-2160));if(edge<90){ctx.globalAlpha=(1-edge/90)*.22;ctx.fillStyle=C.paper;ctx.fillRect(0,0,1280,720);ctx.globalAlpha=1;}return;}
    if(fiveTheme>=0){drawFiveWorldBackground();return;}
    const t=TIMES[timeIndex],city=ease(720,1400,player.x),mind=ease(1840,2500,player.x);
    const chapterTop=blend(blend("#58c7ee","#49b8ea",city),"#73cddd",mind),chapterMid=blend(blend("#a9e3f1","#8ed9e8",city),"#cce9c0",mind),chapterLow=blend(blend("#f6cf86","#f39d8c",city),"#f3ddb0",mind);
    const isNight=timeIndex===3;
    const top=isNight?blend("#111b46","#283f78",mind*.3):blend(chapterTop,t.top,.55),mid=isNight?blend("#293f78","#565b9d",city*.35):blend(chapterMid,t.mid,.42),low=isNight?blend("#695889","#426f8e",mind*.45):blend(chapterLow,t.low,.32);
    const g=ctx.createLinearGradient(0,0,0,720);g.addColorStop(0,top);g.addColorStop(.58,mid);g.addColorStop(1,low);ctx.fillStyle=g;ctx.fillRect(0,0,1280,720);
    const orbX=1030-camera*.025,orb=ctx.createRadialGradient(orbX,112,5,orbX,112,isNight?105:72);orb.addColorStop(0,isNight?"rgba(247,244,242,1)":"rgba(255,243,166,1)");orb.addColorStop(.45,isNight?"rgba(141,178,215,.5)":"rgba(255,243,166,.45)");orb.addColorStop(1,"rgba(255,255,255,0)");ctx.fillStyle=orb;ctx.beginPath();ctx.arc(orbX,112,isNight?105:72,0,6.3);ctx.fill();ctx.fillStyle=isNight?C.paper:"#fff3a6";ctx.beginPath();ctx.arc(orbX,112,isNight?38:52,0,6.3);ctx.fill();
    // Fine sky grain, high wisps and animated color currents prevent flat empty gradients.
    for(let i=0;i<32;i++){const x=((i*149-camera*.035)%1450+1450)%1450-80,y=28+(i*67)%315;ctx.globalAlpha=isNight?.22:.1;ctx.fillStyle=i%3?C.paper:C.yellow;ctx.beginPath();ctx.ellipse(x,y,18+(i%4)*9,1.4+(i%2),-.22,0,6.3);ctx.fill();}ctx.globalAlpha=1;
    // Soft volumetric clouds: overlapping light and shadow with no cartoon outline.
    for(let i=0;i<6;i++){const x=((i*330+elapsed*(9+i%2*5)-camera*.05)%1950+1950)%1950-240,y=105+(i%3)*86;ctx.save();ctx.translate(x,y);ctx.globalAlpha=isNight?.72:.88;const shadow=ctx.createLinearGradient(0,-58,0,58);shadow.addColorStop(0,isNight?"rgba(139,151,196,.96)":"rgba(255,255,255,.98)");shadow.addColorStop(.55,isNight?"rgba(91,105,163,.94)":"rgba(247,244,242,.94)");shadow.addColorStop(1,isNight?"rgba(32,45,92,.7)":"rgba(103,151,195,.52)");ctx.fillStyle=shadow;ctx.beginPath();ctx.ellipse(-72,20,48,30,0,0,6.3);ctx.ellipse(-32,-2,58,48,0,0,6.3);ctx.ellipse(24,-25,70,61,0,0,6.3);ctx.ellipse(82,10,52,38,0,0,6.3);ctx.ellipse(15,26,105,28,0,0,6.3);ctx.fill();const glow=ctx.createRadialGradient(-2,-39,3,-2,-39,76);glow.addColorStop(0,isNight?"rgba(202,207,235,.65)":"rgba(255,255,255,.95)");glow.addColorStop(1,"rgba(255,255,255,0)");ctx.fillStyle=glow;ctx.beginPath();ctx.ellipse(5,-12,95,58,0,0,6.3);ctx.fill();ctx.restore();}
    if(isNight){const stars=[[120,92],[210,56],[295,126],[390,73],[505,105],[620,48],[740,116],[855,62],[960,145]];ctx.strokeStyle="rgba(222,218,143,.42)";ctx.lineWidth=2;ctx.setLineDash([3,7]);ctx.beginPath();stars.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.setLineDash([]);stars.forEach(([x,y],i)=>{ctx.globalAlpha=.65+.3*Math.sin(elapsed*2+i);ctx.fillStyle=i%3?C.paper:C.yellow;ctx.beginPath();ctx.arc(x,y,2.5+(i%3),0,6.3);ctx.fill();});ctx.globalAlpha=1;}
    // Fully opaque, layered city architecture with roofs, balconies and planted terraces.
    ctx.save();ctx.globalAlpha=city*(1-mind);for(let i=0;i<12;i++){const w=120+(i%3)*28,h=150+(i*53)%190,x=((i*158-camera*.18)%2300+2300)%2300-180,y=475-h,c=isNight?["#55639a","#805b88","#766f8d","#467b77"][i%4]:["#f7f4f2","#d88f8f","#deda8f","#90d48e"][i%4];roundRect(x,y,w,h+260,12,c,"#4a64a4",5);ctx.fillStyle=isNight?"#302d54":"#4a64a4";ctx.beginPath();ctx.moveTo(x-8,y+12);ctx.lineTo(x+w/2,y-38-(i%2)*24);ctx.lineTo(x+w+8,y+12);ctx.closePath();ctx.fill();for(let wy=y+34;wy<445;wy+=42)for(let wx=x+18;wx<x+w-22;wx+=38){const lit=!isNight||(Math.floor(wx+wy+i)/3)%2>.5;roundRect(wx,wy,20,25,4,lit?(isNight?"#f5d981":"#8db2d7"):"#35446f",C.paper,3);}ctx.fillStyle=isNight?"#4fa99c":"#009e92";ctx.beginPath();ctx.ellipse(x+w*.35,y+12,34,13,-.2,0,6.3);ctx.ellipse(x+w*.65,y+8,39,15,.2,0,6.3);ctx.fill();if(isNight&&i%3===0){ctx.globalAlpha=city*(1-mind)*.8;roundRect(x+18,y+70,w-36,24,6,i%2?C.pink:C.teal);text(i%2?"OPEN":"POST",x+w/2,y+82,8,C.paper);ctx.globalAlpha=city*(1-mind);}}ctx.restore();
    // The Friend's Mind is a luminous ink garden, not a dark void.
    ctx.save();ctx.globalAlpha=mind*.58;ctx.fillStyle=blend("#f7f0dc",t.low,.2);ctx.fillRect(0,0,1280,720);for(let i=0;i<8;i++){const x=i*190-camera*.08,y=455-(i%3)*45;ctx.fillStyle=i%2?"#627b9f":"#4a64a4";ctx.globalAlpha=mind*(.16+i%3*.07);ctx.beginPath();ctx.moveTo(x-120,650);ctx.quadraticCurveTo(x-65,y-100,x,y);ctx.quadraticCurveTo(x+80,y-80,x+135,650);ctx.closePath();ctx.fill();ctx.strokeStyle="#302d34";ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(x,y+30);ctx.quadraticCurveTo(x-35,y-70,x+12,y-125);ctx.stroke();for(let n=0;n<5;n++){ctx.fillStyle=n%2?C.green:C.teal;ctx.beginPath();ctx.ellipse(x-32+n*18,y-103+(n%2)*15,28,12,n*.35,0,6.3);ctx.fill();}}ctx.restore();ctx.globalAlpha=1;
    for(let i=0;i<24;i++){const x=((i*193-camera*.09)%1500+1500)%1500-70,y=42+(i*79)%300;ctx.fillStyle=i%4?C.paper:C.yellow;ctx.globalAlpha=.22+.25*Math.sin(elapsed*2+i);ctx.beginPath();ctx.arc(x,y,2+(i%5===0?2:0),0,6.3);ctx.fill();}ctx.globalAlpha=1;
  }

  function drawWorld() {
    ctx.save();ctx.translate(-camera+(Math.random()-.5)*shake,(Math.random()-.5)*shake);
    platforms.forEach((p,i)=>drawMediumPlatform(p,p.x<1080?0:p.x<2160?1:2,i));
    drawMediumDetails();
    // Tiny scenery makes the oversized journey feel inhabited.
    // Waiting friend and mailbox.
    roundRect(3060,455,75,110,10,C.peach);roundRect(3038,445,110,52,20,C.red);text("♥",3093,471,23,C.paper);drawGuy(2995,503,C.peach,1,false);
    hazards.forEach(drawHazard); gardenBouncers.forEach(drawBouncer); doubtCreatures.forEach(drawDoubtCreature); dropped.forEach(drawWord); particles.forEach(p=>{ctx.globalAlpha=Math.max(0,p.life*1.6);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,4,0,6.3);ctx.fill();ctx.globalAlpha=1;});
    // The sentence sits in two neat rows behind the backpack, leaving the hero readable.
    player.carried.forEach((w,i)=>{const col=i%4,row=Math.floor(i/4),x=player.x-13-col*31-player.facing*3,y=player.y-24-row*22+Math.sin(elapsed*3+i)*2;roundRect(x-14,y-8,28,16,5,C.paper,C.ink,2);text(w.text,x,y,6,C.deep);});
    drawGuy(player.x,player.y,player.hitTimer>0&&Math.floor(player.hitTimer*10)%2?C.paper:C.lavender,player.facing,true);
    // Foreground leaves occasionally sweep past the camera for extra depth.
    ctx.restore();
  }

  function drawFiveWorldDetails(){
    const names=["CINEMA COSMOS","MUSIC MEADOW","CODE COTTAGE","INKBOUND TEMPLE","MOUNTAIN ARCHIVE"];
    if(fiveTheme!==0)text(names[fiveTheme],170,330,13,fiveTheme===3?C.ink:C.paper,"left");
    for(let i=0;i<7;i++){const x=165+i*430,y=515-(i%2)*55;
      if(fiveTheme===0){
        if(i%3===0){ctx.save();ctx.translate(x,y);const marquee=ctx.createLinearGradient(0,-78,0,4);marquee.addColorStop(0,C.pink);marquee.addColorStop(1,C.red);roundRect(-4,-78,150,82,10,marquee,null);ctx.fillStyle=C.yellow;ctx.beginPath();ctx.moveTo(4,-68);ctx.lineTo(138,-68);ctx.lineTo(122,-50);ctx.lineTo(20,-50);ctx.closePath();ctx.fill();ctx.strokeStyle=C.paper;ctx.lineWidth=5;for(let n=0;n<5;n++){ctx.beginPath();ctx.moveTo(18+n*27,-63);ctx.lineTo(8+n*27,-53);ctx.stroke();}for(let n=0;n<6;n++){ctx.fillStyle=n%2?C.yellow:C.paper;ctx.beginPath();ctx.arc(17+n*23,-22,4,0,6.3);ctx.fill();}ctx.restore();}
        if(i%3===1){ctx.save();ctx.translate(x+60,y-12);ctx.fillStyle=C.peach;ctx.strokeStyle=C.ink;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-65,28);ctx.quadraticCurveTo(-10,-88,65,28);ctx.quadraticCurveTo(16,-2,-8,23);ctx.quadraticCurveTo(-30,-2,-65,28);ctx.fill();ctx.stroke();ctx.fillStyle=C.red;for(let n=0;n<9;n++){ctx.beginPath();ctx.ellipse(-45+n*12,23-Math.sin(n*.7)*18,8,20,n*.18,0,6.3);ctx.fill();}ctx.restore();}
        if(i%3===2){roundRect(x,y-75,116,80,14,C.deep,C.yellow,5);ctx.fillStyle=C.paper;ctx.beginPath();ctx.arc(x+38,y-40,23,0,6.3);ctx.arc(x+82,y-40,23,0,6.3);ctx.fill();ctx.fillStyle=C.blue;for(const ox of [38,82])for(let n=0;n<5;n++){const a=n*1.256;ctx.beginPath();ctx.arc(x+ox+Math.cos(a)*11,y-40+Math.sin(a)*11,4,0,6.3);ctx.fill();}ctx.fillStyle=C.yellow;ctx.beginPath();ctx.moveTo(x+115,y-58);ctx.lineTo(x+162,y-80);ctx.lineTo(x+162,y-4);ctx.lineTo(x+115,y-25);ctx.closePath();ctx.fill();}
      }
      if(fiveTheme===1){ctx.save();ctx.translate(x+52,y);ctx.strokeStyle=C.deep;ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-65,0);ctx.quadraticCurveTo(-48,-85,-6,-48);ctx.quadraticCurveTo(28,-95,65,0);ctx.stroke();for(let n=0;n<6;n++){const a=n*Math.PI/3+elapsed*.15;ctx.fillStyle=[C.pink,C.yellow,C.teal][n%3];ctx.beginPath();ctx.arc(Math.cos(a)*48,-38+Math.sin(a)*25,13,0,6.3);ctx.fill();}roundRect(-34,-28,68,44,12,C.paper,C.ink,4);text("LIVE",0,-6,11,C.red);ctx.restore();}
      if(fiveTheme===2){roundRect(x,y-73,150,78,12,"#263b53",C.teal,5);ctx.fillStyle="#151d2d";ctx.fillRect(x+10,y-60,130,50);text(["const hope = true","git push kindness","while (try) grow()"][i%3],x+75,y-35,8,C.green);ctx.fillStyle=C.yellow;ctx.beginPath();ctx.arc(x+18,y-66,4,0,6.3);ctx.fill();}
      if(fiveTheme===3){for(let n=0;n<4;n++){const yy=y-n*18;roundRect(x+n*7,yy-22,142-n*14,25,5,[C.red,C.blue,C.green,C.yellow][(i+n)%4],C.ink,3);ctx.fillStyle=C.paper;ctx.fillRect(x+18+n*7,yy-15,85-n*8,4);}ctx.strokeStyle=C.ink;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x+115,y-94);ctx.quadraticCurveTo(x+150,y-125,x+175,y-75);ctx.stroke();ctx.fillStyle=C.ink;ctx.beginPath();ctx.arc(x+176,y-70,10,0,6.3);ctx.fill();}
      if(fiveTheme===4){ctx.save();ctx.translate(x+55,y);ctx.fillStyle=i%2?C.green:C.blue;ctx.strokeStyle=C.ink;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-70,0);ctx.lineTo(-20,-92);ctx.lineTo(8,-55);ctx.lineTo(34,-118);ctx.lineTo(78,0);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle=C.paper;ctx.beginPath();ctx.moveTo(17,-78);ctx.lineTo(34,-118);ctx.lineTo(50,-76);ctx.closePath();ctx.fill();ctx.restore();}
    }
  }

  function drawMediumDetails(){
    if(fiveTheme===0)return;
    for(let i=0;i<7;i++){const x=180+i*430,y=500-(i%2)*48;if(fiveTheme===0){ctx.fillStyle=i%2?C.indigo:C.green;ctx.beginPath();ctx.moveTo(x-70,y+20);ctx.quadraticCurveTo(x-25,y-100,x+10,y-35);ctx.quadraticCurveTo(x+45,y-115,x+95,y+20);ctx.fill();for(let n=0;n<9;n++){ctx.strokeStyle=n%2?C.yellow:C.paper;ctx.globalAlpha=.42;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x-45+n*12,y);ctx.lineTo(x-20+n*13,y-38-(n%3)*12);ctx.stroke();}ctx.globalAlpha=1;}if(fiveTheme===1){ctx.globalAlpha=.55;ctx.fillStyle=i%2?C.blue:C.peach;ctx.beginPath();ctx.arc(x,y-32,42,0,6.3);ctx.arc(x+38,y-10,31,0,6.3);ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle=C.deep;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-25,y);ctx.lineTo(x-25,y-95);ctx.moveTo(x+15,y);ctx.lineTo(x+15,y-120);ctx.stroke();}if(fiveTheme===2){ctx.font="900 15px ui-monospace,monospace";ctx.textAlign="left";ctx.fillStyle=i%2?C.green:C.teal;for(let n=0;n<7;n++)ctx.fillText("/\\  @@@  /\\",x,y-n*15);}if(fiveTheme===3){ctx.strokeStyle=[C.red,C.teal,C.pink,C.indigo][i%4];ctx.lineWidth=18;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(x-45,y);ctx.lineTo(x-10,y-85);ctx.lineTo(x+22,y-25);ctx.lineTo(x+68,y-108);ctx.stroke();ctx.strokeStyle=C.paper;ctx.globalAlpha=.45;ctx.lineWidth=4;ctx.stroke();ctx.globalAlpha=1;}}
  }

  function drawChapterDetails(){
    // Chapter one: the message is born on an enormous writing desk.
    [[155,525,150],[560,540,125],[820,525,150]].forEach(([x,y,w],i)=>{roundRect(x,y,w,24,6,[C.red,C.green,C.blue][i],C.ink,3);roundRect(x+12,y-25,w-22,25,6,[C.yellow,C.peach,C.pink][i],C.ink,3);ctx.fillStyle=C.paper;ctx.fillRect(x+24,y-18,w-55,5);});
    text("CHAPTER I · THE WRITING DESK",170,330,12,C.paper,"left");
    // Ink puddles, books, erasers and a fountain pen establish the giant scale.
    [[385,535,92,20],[710,545,76,18]].forEach(([x,y,w,h],i)=>{roundRect(x,y,w,h,5,i?C.blue:C.pink);ctx.fillStyle=C.paper;ctx.fillRect(x+w*.55,y+3,w*.36,h-6);});
    ctx.save();ctx.translate(765,450);ctx.rotate(-.17);roundRect(0,0,220,24,8,C.deep);ctx.fillStyle=C.yellow;ctx.beginPath();ctx.moveTo(220,0);ctx.lineTo(250,12);ctx.lineTo(220,24);ctx.fill();ctx.restore();
    [[460,548,74,13],[890,565,105,15]].forEach(([x,y,w,h])=>{ctx.globalAlpha=.55;ctx.fillStyle=C.teal;ctx.beginPath();ctx.ellipse(x,y,w,h,0,0,6.3);ctx.fill();});ctx.globalAlpha=1;
    // At the desk edge, a curling page becomes the bridge into the city.
    ctx.fillStyle=C.paper;ctx.strokeStyle=C.ink;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(1010,520);ctx.quadraticCurveTo(1100,420,1225,535);ctx.lineTo(1190,566);ctx.quadraticCurveTo(1095,478,1010,550);ctx.closePath();ctx.fill();ctx.stroke();
    // Pencil doodles peel off the notebook and cheer as the message passes.
    pigeons.forEach((p,i)=>{const awake=Math.abs(player.x-p.x)<150;ctx.save();ctx.translate(p.x,p.y-18-Math.sin(elapsed*2+i)*4);ctx.strokeStyle=C.deep;ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,15,0,6.3);ctx.moveTo(-8,16);ctx.lineTo(-13,31);ctx.moveTo(8,16);ctx.lineTo(13,31);ctx.moveTo(-13,8);ctx.lineTo(-25,awake?-2:16);ctx.moveTo(13,8);ctx.lineTo(25,awake?-2:16);ctx.stroke();ctx.fillStyle=C.deep;ctx.beginPath();ctx.arc(-5,-3,2,0,6.3);ctx.arc(5,-3,2,0,6.3);ctx.fill();ctx.restore();});
    [[148,530],[660,550],[830,555]].forEach(([x,y],i)=>{const wave=Math.abs(player.x-x)<120;roundRect(x,y,25,27,5,C.deep);ctx.fillStyle=C.yellow;ctx.beginPath();ctx.arc(x+9,y+11,2,0,6.3);ctx.arc(x+17,y+11,2,0,6.3);ctx.fill();if(wave){ctx.strokeStyle=C.yellow;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+22,y+17);ctx.lineTo(x+31,y+10+Math.sin(elapsed*8)*4);ctx.stroke();}});

    // Chapter two: an animated city built from undelivered mail.
    text("CHAPTER II · THE UNSENT CITY",1245,305,12,C.paper,"left");
    [[1260,430,150,130,C.paper],[1450,390,125,170,C.yellow],[1650,420,170,155,C.paper],[1900,365,120,210,C.pink]].forEach(([x,y,w,h,c],i)=>{roundRect(x,y,w,h,12,c);ctx.strokeStyle=C.red;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x+8,y+8);ctx.lineTo(x+w/2,y+58);ctx.lineTo(x+w-8,y+8);ctx.stroke();for(let n=0;n<3;n++){roundRect(x+20+n*34,y+h-50,22,25,4,C.deep);ctx.fillStyle=C.yellow;ctx.beginPath();ctx.arc(x+27+n*34,y+h-40,2,0,6.3);ctx.arc(x+35+n*34,y+h-40,2,0,6.3);ctx.fill();}});
    // Stamps bounce, conveyors carry letters, and mailboxes watch the courier.
    [[1300,520],[1550,565],[1800,560]].forEach(([x,y],i)=>{ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(elapsed*2+i)*.04);roundRect(0,0,74,45,5,[C.green,C.yellow,C.blue][i]);text(["3¢","AIR","♥"][i],37,23,12,C.deep);ctx.restore();});
    roundRect(1375,570,430,24,8,C.shadow);for(let i=0;i<8;i++){ctx.fillStyle=i%2?C.mist:C.paper;ctx.beginPath();ctx.arc(1400+i*52,582,8,0,6.3);ctx.fill();}for(let i=0;i<4;i++){const x=1420+((i*150+elapsed*45)%610),y=545+Math.sin(elapsed*2+i)*6;roundRect(x,y,58,34,5,C.paper);ctx.strokeStyle=C.red;ctx.beginPath();ctx.moveTo(x+3,y+3);ctx.lineTo(x+29,y+20);ctx.lineTo(x+55,y+3);ctx.stroke();}
    [[1350,500],[1850,535]].forEach(([x,y],i)=>{roundRect(x,y,58,65,12,i?C.red:C.teal);ctx.fillStyle=C.ink;ctx.beginPath();ctx.arc(x+18,y+26,4,0,6.3);ctx.arc(x+39,y+26,4,0,6.3);ctx.fill();ctx.strokeStyle=C.ink;ctx.beginPath();ctx.arc(x+29,y+43,10,0,Math.PI);ctx.stroke();});
    // Flying envelopes form a living current above the street.
    for(let i=0;i<7;i++){const x=1210+((i*170+elapsed*36)%900),y=340+(i%3)*48+Math.sin(elapsed*2+i)*10;roundRect(x,y,58,34,5,C.paper);ctx.strokeStyle=C.red;ctx.beginPath();ctx.moveTo(x+3,y+3);ctx.lineTo(x+29,y+20);ctx.lineTo(x+55,y+3);ctx.stroke();ctx.strokeStyle=C.paper;ctx.beginPath();ctx.moveTo(x,y+15);ctx.lineTo(x-18,y+6);ctx.moveTo(x+58,y+15);ctx.lineTo(x+76,y+6);ctx.stroke();}

    // Chapter three: the city stretches into the friend's uncertain inner landscape.
    text("CHAPTER III · THE FRIEND'S MIND",2160,305,12,C.paper,"left");
    [[2150,540,130],[2350,540,165],[2490,590,120],[2810,590,170]].forEach(([x,y,h],i)=>{
      ctx.strokeStyle=i%2?C.teal:C.deep;ctx.lineWidth=18;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x-34,y-h*.45,x+5,y-h);ctx.stroke();ctx.fillStyle=C.blue;ctx.strokeStyle=C.deep;ctx.lineWidth=4;ctx.beginPath();ctx.arc(x+4,y-h-17,34,Math.PI*.3,Math.PI*1.72);ctx.stroke();ctx.beginPath();ctx.arc(x+4,y-h+25,4,0,6.3);ctx.fill();
    });
    for(let i=0;i<22;i++){const x=2110+(i*97)%960,y=320+(i*53)%210;ctx.globalAlpha=.45+.35*Math.sin(elapsed*3+i);ctx.fillStyle=i%2?C.yellow:C.green;ctx.beginPath();ctx.arc(x,y,3+(i%3),0,6.3);ctx.fill();}ctx.globalAlpha=1;
    // The safer the message, the more light the forest receives.
    if(player.x>2050){const glow=80+player.carried.length*14,g=ctx.createRadialGradient(player.x+21,player.y+25,8,player.x+21,player.y+25,glow);g.addColorStop(0,"rgba(222,218,143,.32)");g.addColorStop(1,"rgba(222,218,143,0)");ctx.fillStyle=g;ctx.fillRect(player.x-glow,player.y-glow,glow*2,glow*2);}
  }

  function drawBouncer(b){ctx.save();ctx.translate(b.x,b.y);ctx.rotate(Math.sin(elapsed*2+b.x)*.035);if(fiveTheme===0){roundRect(0,-16,b.w,32,5,C.red,C.ink,4);ctx.fillStyle=C.yellow;for(let i=0;i<5;i++)ctx.fillRect(7+i*(b.w-14)/5,-10,10,20);text("PREMIERE",b.w/2,0,7,C.paper);}else{roundRect(0,-16,b.w,32,5,b.type==="flower"?C.pink:C.green,C.ink,4);ctx.strokeStyle=C.paper;ctx.setLineDash([4,4]);ctx.strokeRect(7,-10,b.w-14,20);ctx.setLineDash([]);if(fiveTheme!==1)text(b.type==="flower"?"EXPRESS":"POST",b.w/2,0,8,C.deep);}ctx.restore();}

  function drawDoubtCreature(d){const y=d.y+Math.sin(d.phase)*8;ctx.save();ctx.translate(d.x,y);if(fiveTheme===0){ctx.fillStyle=C.deep;ctx.strokeStyle=C.yellow;ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,25,0,6.3);ctx.fill();ctx.stroke();for(let i=0;i<5;i++){const a=i*1.256+elapsed*.7;ctx.fillStyle=i%2?C.red:C.paper;ctx.beginPath();ctx.arc(Math.cos(a)*13,Math.sin(a)*13,5,0,6.3);ctx.fill();}ctx.strokeStyle=C.ink;ctx.beginPath();ctx.moveTo(-18,22);ctx.lineTo(-30,40);ctx.moveTo(18,22);ctx.lineTo(30,40);ctx.stroke();text("CUT!",0,-38,8,C.paper);}else{ctx.fillStyle=C.shadow;ctx.strokeStyle=C.ink;ctx.lineWidth=4;ctx.beginPath();ctx.roundRect(-24,-25,48,50,20);ctx.fill();ctx.stroke();ctx.fillStyle=C.paper;ctx.beginPath();ctx.arc(-8,-7,4,0,6.3);ctx.arc(8,-7,4,0,6.3);ctx.fill();text("?",0,11,18,C.paper);ctx.globalAlpha=.6;text(["NOT ENOUGH","TOO LATE","WHAT IF?"][Math.floor(d.phase)%3],0,-38,8,C.mist);}ctx.restore();}

  function drawMediumHazard(h){const n=hazards.indexOf(h),x=h.x+h.w/2,y=h.y+h.h/2;ctx.save();ctx.translate(x,y);if(fiveTheme===0){if(h.oilKind==="spike"){ctx.shadowColor="rgba(48,45,52,.28)";ctx.shadowBlur=7;ctx.shadowOffsetY=4;ctx.fillStyle=C.green;ctx.strokeStyle=C.ink;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-30,18);ctx.quadraticCurveTo(-28,-7,-14,-13);ctx.lineTo(-7,-30);ctx.lineTo(1,-15);ctx.lineTo(14,-28);ctx.lineTo(20,-10);ctx.quadraticCurveTo(31,-2,30,18);ctx.closePath();ctx.fill();ctx.stroke();ctx.shadowColor="transparent";for(let i=0;i<6;i++)oilStroke(-20+i*8,5-(i%3)*7,17,-.75+(i%2)*.35,[C.yellow,C.deep,C.paper][i%3],4,.62);ctx.restore();return;}if(h.oilKind==="fan"){ctx.strokeStyle=C.shadow;ctx.fillStyle=C.mist;ctx.lineWidth=4;for(let i=0;i<7;i++){ctx.save();ctx.rotate(i*Math.PI*2/7);ctx.beginPath();ctx.moveTo(-4,-2);ctx.quadraticCurveTo(10,-33,17,-36);ctx.quadraticCurveTo(26,-13,5,4);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}ctx.fillStyle=C.deep;ctx.beginPath();ctx.arc(0,0,10,0,6.3);ctx.fill();ctx.stroke();roundRect(-24,28,48,14,5,C.deep,C.ink,3);ctx.restore();return;}const tileH=Math.max(22,Math.min(30,h.h));ctx.shadowColor="rgba(48,45,52,.32)";ctx.shadowBlur=8;ctx.shadowOffsetY=5;roundRect(-h.w/2,-tileH/2,h.w,tileH,9,C.deep,C.ink,4);ctx.shadowColor="transparent";ctx.strokeStyle=C.blue;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-h.w/2+9,-tileH/2+6);ctx.quadraticCurveTo(0,-tileH/2+2,h.w/2-9,-tileH/2+6);ctx.stroke();ctx.restore();return;}if(fiveTheme===1){ctx.globalAlpha=.65;ctx.fillStyle=[C.blue,C.lavender,C.red,C.teal][n%4];ctx.beginPath();ctx.moveTo(0,-35);ctx.bezierCurveTo(28,-5,32,18,0,30);ctx.bezierCurveTo(-32,18,-28,-5,0,30);ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle=C.paper;ctx.lineWidth=3;ctx.beginPath();ctx.arc(-5,8,12,0,4.7);ctx.stroke();}if(fiveTheme===2){ctx.font="900 15px ui-monospace,monospace";ctx.textAlign="center";ctx.fillStyle=n%2?C.teal:C.green;const rows=[" /\\ ","<##>","[!!]"," \\_/ "];rows.forEach((r,i)=>ctx.fillText(r,0,-23+i*15));}if(fiveTheme===3){ctx.strokeStyle=[C.red,C.teal,C.pink,C.indigo][n%4];ctx.lineWidth=14;ctx.lineCap="round";ctx.beginPath();for(let i=0;i<6;i++){const a=i*1.1;i?ctx.lineTo(Math.cos(a)*28,Math.sin(a)*24):ctx.moveTo(Math.cos(a)*28,Math.sin(a)*24);}ctx.stroke();ctx.strokeStyle=C.paper;ctx.globalAlpha=.55;ctx.lineWidth=4;ctx.stroke();ctx.globalAlpha=1;}ctx.restore();}

  function drawGuy(x,y,color,facing,walking){
    ctx.save();ctx.translate(x+21,y+58);ctx.scale(1.24,1.24);ctx.translate(-21,-58);if(facing<0){ctx.translate(42,0);ctx.scale(-1,1);}ctx.strokeStyle=C.ink;ctx.lineWidth=4;ctx.lineCap="round";
    // A scarf and backpack make the courier silhouette readable at a glance.
    ctx.fillStyle=C.red;ctx.strokeStyle=C.ink;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(8,19);ctx.quadraticCurveTo(-12,17-Math.sin(elapsed*7)*5,-22,29+Math.sin(elapsed*5)*4);ctx.lineTo(-5,32);ctx.lineTo(13,27);ctx.closePath();ctx.fill();ctx.stroke();
    roundRect(-2,23,15,25,6,C.peach,C.ink,3);
    ctx.beginPath();ctx.moveTo(12,48);ctx.lineTo(8+(walking?Math.sin(elapsed*13)*5:0),58);ctx.moveTo(29,48);ctx.lineTo(34-(walking?Math.sin(elapsed*13)*5:0),58);ctx.stroke();
    roundRect(4,7,34,44,15,color,C.ink,4);ctx.fillStyle=C.ink;ctx.beginPath();ctx.arc(15,23,3.2,0,6.3);ctx.arc(28,23,3.2,0,6.3);ctx.fill();ctx.beginPath();ctx.arc(23,34,5,0,Math.PI);ctx.stroke();
    ctx.beginPath();ctx.moveTo(38,33);ctx.lineTo(48,27+Math.sin(elapsed*6)*2);ctx.stroke();ctx.restore();
  }

  function drawHazard(h){
    if(fiveTheme>=0&&fiveTheme<3){drawMediumHazard(h);return;}
    if(fiveTheme===0){
      const n=hazards.indexOf(h);ctx.save();
      if(n===0){ctx.translate(h.x,h.y);ctx.rotate(h.vx*.00045);roundRect(0,0,h.w,h.h,5,C.ink,C.paper,3);for(let i=0;i<5;i++){ctx.fillStyle=i%2?C.paper:C.indigo;ctx.fillRect(7+i*18,4,11,h.h-8);}ctx.fillStyle=C.yellow;ctx.beginPath();ctx.moveTo(h.w,2);ctx.lineTo(h.w+25,h.h/2);ctx.lineTo(h.w,h.h-2);ctx.closePath();ctx.fill();ctx.stroke();}
      if(n===1){const bob=Math.sin(elapsed*3)*5;ctx.translate(h.x+36,h.y+62+bob);ctx.fillStyle=C.yellow;ctx.strokeStyle=C.ink;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-27,0);ctx.quadraticCurveTo(-17,-15,-15,-37);ctx.lineTo(-8,-58);ctx.lineTo(-15,-68);ctx.lineTo(0,-77);ctx.lineTo(15,-68);ctx.lineTo(8,-58);ctx.lineTo(15,-37);ctx.quadraticCurveTo(17,-15,27,0);ctx.closePath();ctx.fill();ctx.stroke();roundRect(-31,0,62,13,5,C.deep,C.ink,3);}
      if(n===2){ctx.translate(h.x+38,h.y+47);ctx.rotate(Math.sin(elapsed*2)*.035);const heel=ctx.createLinearGradient(-35,-58,34,10);heel.addColorStop(0,C.pink);heel.addColorStop(.48,C.red);heel.addColorStop(1,C.deep);ctx.fillStyle=heel;ctx.beginPath();ctx.moveTo(-39,3);ctx.bezierCurveTo(-31,-15,-29,-42,-11,-55);ctx.bezierCurveTo(3,-64,24,-55,32,-45);ctx.bezierCurveTo(20,-35,7,-27,5,-13);ctx.bezierCurveTo(13,-5,27,-1,40,1);ctx.quadraticCurveTo(42,8,33,10);ctx.lineTo(4,10);ctx.quadraticCurveTo(-4,3,-11,-7);ctx.lineTo(-24,8);ctx.lineTo(-38,8);ctx.closePath();ctx.fill();ctx.fillStyle=C.deep;ctx.beginPath();ctx.moveTo(5,-13);ctx.lineTo(13,8);ctx.lineTo(20,8);ctx.lineTo(25,-35);ctx.closePath();ctx.fill();ctx.fillStyle=C.paper;ctx.globalAlpha=.55;ctx.beginPath();ctx.moveTo(-25,-35);ctx.quadraticCurveTo(-5,-58,17,-48);ctx.quadraticCurveTo(-2,-43,-17,-21);ctx.closePath();ctx.fill();ctx.globalAlpha=1;}
      if(n===3){ctx.translate(h.x+45,h.y+19);ctx.rotate(Math.sin(elapsed*2.2)*.08);ctx.fillStyle=C.peach;ctx.strokeStyle=C.ink;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-49,7);ctx.quadraticCurveTo(0,30,50,7);ctx.lineTo(36,24);ctx.lineTo(-34,24);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle=C.red;ctx.beginPath();ctx.moveTo(-30,5);ctx.lineTo(-10,-35);ctx.lineTo(12,5);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(-7,5);ctx.lineTo(18,-45);ctx.lineTo(41,5);ctx.closePath();ctx.fill();}
      if(n===4){ctx.translate(h.x+36,h.y+25);ctx.rotate(h.phase);ctx.fillStyle=C.deep;ctx.strokeStyle=C.yellow;ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,30,0,6.3);ctx.fill();ctx.stroke();for(let i=0;i<5;i++){const a=i*1.256;ctx.fillStyle=C.paper;ctx.beginPath();ctx.ellipse(Math.cos(a)*15,Math.sin(a)*15,6,9,a,0,6.3);ctx.fill();}roundRect(-39,27,78,18,6,C.pink,C.ink,3);}
      if(n===5){ctx.translate(h.x+38,h.y+30);ctx.rotate(Math.sin(elapsed*4)*.04);roundRect(-38,-25,76,50,7,C.ink,C.paper,4);ctx.fillStyle=C.paper;ctx.beginPath();ctx.moveTo(-35,-22);ctx.lineTo(30,-22);ctx.lineTo(38,-39);ctx.lineTo(-27,-39);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle=C.deep;ctx.lineWidth=5;for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(-26+i*17,-36);ctx.lineTo(-15+i*17,-24);ctx.stroke();}text("ACTION",0,5,8,C.yellow);}
      ctx.restore();return;
    }
    if(h.type==="pencil"&&h.x<1200){ctx.save();ctx.translate(h.x,h.y);ctx.rotate(h.vx*.0007);roundRect(0,0,h.w,h.h,7,C.yellow);ctx.fillStyle=C.red;ctx.fillRect(10,2,18,h.h-4);ctx.fillStyle=C.paper;ctx.beginPath();ctx.moveTo(h.w,0);ctx.lineTo(h.w+24,h.h/2);ctx.lineTo(h.w,h.h);ctx.fill();ctx.strokeStyle=C.ink;ctx.lineWidth=3;ctx.stroke();ctx.restore();}
    if(h.type==="pencil"&&h.x>=1200){ctx.save();ctx.translate(h.x+h.w/2,h.y+h.h/2);ctx.rotate(elapsed*2);ctx.strokeStyle=C.red;ctx.lineWidth=9;ctx.beginPath();ctx.arc(0,0,35,0,6.3);ctx.stroke();text("AIR MAIL",0,0,7,C.deep);ctx.restore();}
    if(h.type==="fan"){roundRect(h.x,h.y+43,72,27,8,h.x<1500?C.peach:C.teal);ctx.save();ctx.translate(h.x+36,h.y+22);ctx.rotate(h.phase);ctx.strokeStyle=C.ink;ctx.lineWidth=4;for(let i=0;i<4;i++){ctx.rotate(Math.PI/2);ctx.fillStyle=h.x<1500?C.paper:C.yellow;ctx.beginPath();ctx.roundRect(-8,-30,16,30,6);ctx.fill();ctx.stroke();}ctx.restore();text(h.x<1500?"PAGE TURNER":"POSTMARK",h.x+36,h.y+61,6,C.deep);}
    if(h.type==="cloud"&&h.x<2200){roundRect(h.x,h.y+8,76,42,7,C.paper,C.deep,4);ctx.strokeStyle=C.red;ctx.beginPath();ctx.moveTo(h.x+4,h.y+12);ctx.lineTo(h.x+38,h.y+35);ctx.lineTo(h.x+72,h.y+12);ctx.stroke();ctx.strokeStyle=C.paper;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(h.x,h.y+26);ctx.lineTo(h.x-20,h.y+14);ctx.moveTo(h.x+76,h.y+26);ctx.lineTo(h.x+96,h.y+14);ctx.stroke();}
    if(h.type==="cloud"&&h.x>=2200){ctx.fillStyle=C.blue;ctx.strokeStyle=C.deep;ctx.lineWidth=4;ctx.beginPath();ctx.arc(h.x+22,h.y+26,22,0,6.3);ctx.arc(h.x+43,h.y+18,25,0,6.3);ctx.arc(h.x+62,h.y+28,19,0,6.3);ctx.fill();ctx.stroke();text("WHAT IF?",h.x+42,h.y+25,8,C.paper);}
  }

  function drawWord(w){ctx.save();ctx.translate(w.x,w.y+Math.sin(w.bob)*2);roundRect(-33,-15,66,30,8,C.paper,C.ink,3);text(w.text,0,1,11,C.deep);if(!w.pickupDelay&&Math.hypot(player.x+21-w.x,player.y+25-w.y)<150)text("R · RECALL",0,-27,8,C.yellow);ctx.restore();}
  function render(){drawBackground();drawWorld();}
  function loop(now){const dt=Math.min(.033,(now-last)/1000||0);last=now;update(dt);scheduleMusic();render();requestAnimationFrame(loop);}

  addEventListener("keydown",e=>{if(e.target.matches("input, textarea, button, [contenteditable='true']"))return;if(["ArrowLeft","b","B"].includes(e.key))keys.left=true;if(["ArrowRight","f","F"].includes(e.key))keys.right=true;if(["ArrowUp"," "].includes(e.key)){keys.jump=true;e.preventDefault();}if(["r","R"].includes(e.key))keys.recall=true;});
  addEventListener("keyup",e=>{if(e.target.matches("input, textarea, button, [contenteditable='true']"))return;if(["ArrowLeft","b","B"].includes(e.key))keys.left=false;if(["ArrowRight","f","F"].includes(e.key))keys.right=false;});
  document.querySelectorAll("[data-control]").forEach(btn=>{const c=btn.dataset.control;const on=e=>{e.preventDefault();keys[c]=true;};const off=e=>{e.preventDefault();if(c!=="jump")keys[c]=false;};btn.addEventListener("pointerdown",on);btn.addEventListener("pointerup",off);btn.addEventListener("pointercancel",off);});
  UI.input.addEventListener("input",()=>{const n=UI.input.value.trim().split(/\s+/).filter(Boolean).length;UI.inputCount.textContent=`${Math.min(n,10)}/10 WORDS`;UI.inputCount.style.color=n>10?C.red:C.deep;});
  UI.input.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();start(true);}});
  UI.messageButton.addEventListener("click",()=>{playing=false;finished=false;keys.left=keys.right=keys.jump=keys.recall=false;UI.ending.classList.remove("visible");UI.gameOver.classList.remove("visible");UI.intro.classList.add("visible");tone(523,.1,"sine",.012);tone(659,.14,"triangle",.009,.08);setTimeout(()=>{UI.input.focus();UI.input.select();},80);});
  UI.start.addEventListener("click",()=>{ensureAudio();start(true);});UI.replay.addEventListener("click",()=>{ensureAudio();start(false);});UI.retry.addEventListener("click",()=>{ensureAudio();start(false);});UI.sound.addEventListener("click",()=>{muted=!muted;if(!muted){ensureAudio();musicNextTime=audio.currentTime+.06;}UI.sound.textContent=muted?"OFF":"AUDIO";UI.sound.setAttribute("aria-pressed",String(muted));});
  UI.time.addEventListener("click",()=>{timeIndex=(timeIndex+1)%TIMES.length;updateUI();tone(330+timeIndex*90,.12,"sine",.025);});
  reset();requestAnimationFrame(loop);
})();
