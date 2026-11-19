(() => {
const root=document.documentElement,key="theme";
try{const saved=localStorage.getItem(key);if(saved)root.dataset.theme=saved}catch(e){}
const themeButton=document.getElementById("theme");
if(themeButton)themeButton.addEventListener("click",()=>{
  const dark=root.dataset.theme?root.dataset.theme==="dark":matchMedia("(prefers-color-scheme: dark)").matches;
  root.dataset.theme=dark?"light":"dark";
  try{localStorage.setItem(key,root.dataset.theme)}catch(e){}
});

const loader=document.querySelector("[data-loader]");
const percent=document.querySelector("[data-percent]");
const bar=document.querySelector(".loader-bar i");
let value=0;
const loading=setInterval(()=>{
  value=Math.min(100,value+Math.random()*17+7);
  if(percent)percent.textContent=Math.round(value)+"%";
  if(bar)bar.style.width=value+"%";
  if(value>=100){
    clearInterval(loading);
    setTimeout(()=>{loader&&loader.classList.add("done");document.body.classList.add("loaded")},300);
  }
},115);

const head=document.querySelector(".site-head");
const progress=document.querySelector("[data-progress]");
const onScroll=()=>{
  head&&head.classList.toggle("scrolled",scrollY>18);
  if(progress){
    const max=document.documentElement.scrollHeight-innerHeight;
    progress.style.width=(max>0?scrollY/max*100:0)+"%";
  }
};
addEventListener("scroll",onScroll,{passive:true});
onScroll();

const revealObserver=new IntersectionObserver(entries=>{
  entries.forEach((entry,i)=>{
    if(entry.isIntersecting){
      setTimeout(()=>entry.target.classList.add("visible"),i*55);
      revealObserver.unobserve(entry.target);
    }
  });
},{threshold:.1,rootMargin:"0px 0px -7% 0px"});
document.querySelectorAll(".reveal").forEach(el=>revealObserver.observe(el));

const stages=document.querySelectorAll("[data-stage]");
if(stages.length){
  const stageObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      stages.forEach((stage,i)=>setTimeout(()=>stage.classList.add("ok"),i*520));
      stageObserver.disconnect();
    });
  },{threshold:.4});
  stageObserver.observe(stages[0]);
}

const fine=matchMedia("(hover:hover) and (pointer:fine)").matches;
const cursor=document.querySelector("[data-cursor]");
const ring=document.querySelector("[data-cursor-ring]");
let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my;

if(fine){
  addEventListener("mousemove",e=>{
    mx=e.clientX;my=e.clientY;
    if(cursor)cursor.style.transform=`translate(${mx}px,${my}px) translate(-50%,-50%)`;
  },{passive:true});
  const ringLoop=()=>{rx+=(mx-rx)*.16;ry+=(my-ry)*.16;if(ring)ring.style.transform=`translate(${rx}px,${ry}px) translate(-50%,-50%)`;requestAnimationFrame(ringLoop)};
  ringLoop();
  document.querySelectorAll("a,button,[data-tilt-card],[data-tilt-row]").forEach(el=>{
    el.addEventListener("mouseenter",()=>ring&&ring.classList.add("active"));
    el.addEventListener("mouseleave",()=>ring&&ring.classList.remove("active"));
  });
  document.querySelectorAll(".primary-button,.theme-button").forEach(el=>{
    el.addEventListener("mousemove",e=>{
      const r=el.getBoundingClientRect();
      el.style.transform=`translate3d(${(e.clientX-r.left-r.width/2)*.1}px,${(e.clientY-r.top-r.height/2)*.16}px,0)`;
    });
    el.addEventListener("mouseleave",()=>el.style.transform="");
  });
  document.querySelectorAll("[data-tilt-card]").forEach(card=>{
    card.addEventListener("mousemove",e=>{
      const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      card.style.transform=`perspective(900px) rotateY(${x*7}deg) rotateX(${-y*7}deg) translateZ(12px)`;
    });
    card.addEventListener("mouseleave",()=>card.style.transform="");
  });
  document.querySelectorAll("[data-tilt-row]").forEach(row=>{
    const visual=row.querySelector(".case-visual");
    if(!visual)return;
    row.addEventListener("mousemove",e=>{
      const r=row.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      visual.style.transform=`perspective(850px) rotateY(${x*6}deg) rotateX(${-y*6}deg) scale(1.045)`;
    });
    row.addEventListener("mouseleave",()=>visual.style.transform="");
  });
}

const canvas=document.querySelector("[data-field]");
if(canvas&&!matchMedia("(prefers-reduced-motion:reduce)").matches){
  const ctx=canvas.getContext("2d");
  let w,h,dpr,points=[],pointer={x:-999,y:-999},running=true;
  const build=()=>{
    dpr=Math.min(devicePixelRatio||1,1.5);
    w=canvas.width=innerWidth*dpr;
    h=canvas.height=innerHeight*dpr;
    canvas.style.width=innerWidth+"px";
    canvas.style.height=innerHeight+"px";
    const count=innerWidth<760?26:innerWidth<1200?44:62;
    points=Array.from({length:count},()=>({
      x:Math.random()*w,y:Math.random()*h,
      vx:(Math.random()-.5)*.18*dpr,vy:(Math.random()-.5)*.18*dpr,
      r:(Math.random()*1.1+.4)*dpr
    }));
  };
  build();
  addEventListener("resize",build,{passive:true});
  addEventListener("mousemove",e=>{pointer.x=e.clientX*dpr;pointer.y=e.clientY*dpr},{passive:true});
  document.addEventListener("visibilitychange",()=>running=!document.hidden);
  const draw=()=>{
    if(!running){requestAnimationFrame(draw);return}
    ctx.clearRect(0,0,w,h);
    for(const p of points){
      p.x+=p.vx;p.y+=p.vy;
      if(p.x<0||p.x>w)p.vx*=-1;
      if(p.y<0||p.y>h)p.vy*=-1;
      const dx=pointer.x-p.x,dy=pointer.y-p.y,d=Math.hypot(dx,dy);
      if(d<170*dpr){p.x-=dx*.006;p.y-=dy*.006}
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,6.283);ctx.fillStyle="rgba(211,251,92,.5)";ctx.fill();
    }
    for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++){
      const a=points[i],b=points[j],dist=Math.hypot(a.x-b.x,a.y-b.y),limit=125*dpr;
      if(dist<limit){
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
        ctx.strokeStyle=`rgba(211,251,92,${.09*(1-dist/limit)})`;ctx.lineWidth=.55*dpr;ctx.stroke();
      }
    }
    requestAnimationFrame(draw);
  };
  draw();
}

const parallax=document.querySelector("[data-parallax]");
if(parallax&&!matchMedia("(prefers-reduced-motion:reduce)").matches){
  let target=0,current=0;
  addEventListener("scroll",()=>{target=Math.min(scrollY*.14,85)},{passive:true});
  const move=()=>{current+=(target-current)*.08;parallax.style.transform=`translate3d(0,${current}px,0)`;requestAnimationFrame(move)};
  move();
}
})();
