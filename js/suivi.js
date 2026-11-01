/* Conversation d’exemple de l’accueil : démarre quand elle devient visible, avec un bouton Pause (norme IS 5568). */
(function(){
if(!document.getElementById("chat"))return;
const I="/assets/img/ba/";
const A="/assets/img/suivi/",T1=A+"opt1.jpg",T2=A+"opt2.jpg",T3=A+"opt3.jpg";
const J=[
 {t:"Lundi",s:"Le chantier démarre",d:"Lundi 10 mars",m:[
  {w:"me",x:"Bonjour Elie, alors ça a commencé ?",h:"08:52"},
  {w:"them",x:"Bonjour ! Oui on est sur place depuis 8h",h:"09:14"},
  {w:"them",img:I+"ba-11-before-sm.jpg",x:"Voilà l’état avant travaux",h:"09:15"},
  {w:"them",x:"Il y a de l’humidité en bas du mur, on traite ça d’abord",h:"09:15"},
  {w:"me",x:"Ok merci 🙏",h:"09:31"},
  {w:"me",x:"Pour le carrelage je suis à Paris, je ne peux pas venir choisir… Vous pouvez y aller pour moi ?",h:"09:32"},
  {w:"them",x:"Pas de souci, je passe au magasin demain matin et je vous envoie des photos",h:"09:40"},
  {w:"me",x:"Génial, merci !",h:"09:41"}]},
 {t:"Mardi",s:"Elie choisit le carrelage pour vous",d:"Mardi 11 mars",m:[
  {w:"them",img:A+"magasin.jpg",x:"Je suis au magasin 👇",h:"10:22"},
  {w:"them",img:T1,x:"Option 1, gris pierre",h:"10:23"},
  {w:"them",img:T2,x:"Option 2, marbre blanc",h:"10:23"},
  {w:"them",img:T3,x:"Option 3, noir veiné",h:"10:24"},
  {w:"them",voice:"0:18",h:"10:25"},
  {w:"me",quote:["Elie Bitoun","Option 1, gris pierre",T1],x:"Celle-là ! Elle ne glisse pas trop ?",h:"10:41"},
  {w:"them",x:"Non, c’est un carreau antidérapant, c’est ce qu’il faut pour un sol de salle de bain",h:"10:43"},
  {w:"me",x:"Parfait, on valide 👍",h:"10:44",r:"❤️"},
  {w:"them",x:"C’est noté, je la commande",h:"10:45"}]},
 {t:"Jeudi",s:"La pose avance",d:"Jeudi 13 mars",m:[
  {w:"them",vid:I+"ig-wc-after.jpg",dur:"0:24",x:"La pose a commencé",h:"15:06"},
  {w:"me",x:"Trop beau 😍",h:"15:12"},
  {w:"me",x:"Le gris rend super bien",h:"15:12"},
  {w:"them",x:"Oui ! On fait les joints demain",h:"15:30"}]},
 {t:"Dimanche",s:"Remise du chantier",d:"Dimanche 16 mars",m:[
  {w:"them",img:I+"ba-11-after-sm.jpg",x:"C’est terminé et tout est nettoyé",h:"17:48"},
  {w:"them",x:"Je vous envoie une vidéo complète ce soir",h:"17:48"},
  {w:"me",x:"Magnifique, merci Elie !! 🙌",h:"18:02"},
  {w:"me",x:"Je n’ai même pas eu besoin de prendre l’avion",h:"18:02",r:"😂"}]}
];
const chat=document.getElementById("chat"),statut=document.getElementById("statut"),ctl=document.getElementById("suivi-ctl");
let run=0,pause=false;
const wait=async ms=>{for(let t=0;t<ms;t+=100){await new Promise(r=>setTimeout(r,100));while(pause)await new Promise(r=>setTimeout(r,150))}};
const bas=()=>{chat.scrollTop=chat.scrollHeight};
const voix=[6,11,16,9,18,13,7,15,20,10,14,8,17,12,6,10,15,9,13,7].map(h=>`<s style="height:${h}px"></s>`).join("");
function bulle(m,prev){
 const d=document.createElement("div"),first=!prev||prev.w!==m.w;
 const ok=m.w==="me"?'<span class="ok">✓✓</span>':"";
 const h=`<span class="h">${m.h}${ok}</span>`;
 d.className=`msg ${m.w}${first?" first":""}${m.img||m.vid?" ph":""}${m.r?" has-r":""}`;
 let c="";
 if(m.quote)c+=`<div class="quote"><div><b>${m.quote[0]}</b>${m.quote[1]}</div><img src="${m.quote[2]}" alt=""></div>`;
 if(m.img)c+=`<img src="${m.img}" alt=""><p>${m.x}${h}</p>`;
 else if(m.vid)c+=`<div class="vid"><img src="${m.vid}" alt=""><i></i><em>${m.dur}</em></div><p>${m.x}${h}</p>`;
 else if(m.voice)c+=`<div class="voice"><img src="/assets/brand/logo-mark-white.webp" alt=""><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg><span class="wave">${voix}</span></div><span class="h">${m.voice} · ${m.h}</span>`;
 else c+=m.x+h;
 if(m.r)c+=`<span class="react">${m.r}</span>`;
 d.innerHTML=c;chat.appendChild(d);
 d.querySelectorAll("img").forEach(i=>i.addEventListener("load",bas));
}
function date(t){const e=document.createElement("div");e.className="date";e.textContent=t;chat.appendChild(e)}
let fini=false;
async function play(start){
 const id=++run;chat.innerHTML="";fini=false;ctl.textContent="Pause";pause=false;
 for(let i=0;i<start;i++){date(J[i].d);let p=null;for(const m of J[i].m){bulle(m,p);p=m}}
 bas();
 for(let i=start;i<J.length;i++){
  date(J[i].d);bas();await wait(700);
  let p=null;
  for(const m of J[i].m){
   if(id!==run)return;
   if(m.w==="them"){statut.textContent="écrit...";const t=document.createElement("div");t.className="typing";t.innerHTML="<i></i><i></i><i></i>";chat.appendChild(t);bas();await wait(m.voice?1500:Math.min(1600,650+(m.x||"").length*14));if(id!==run)return;t.remove();statut.textContent="en ligne"}
   else await wait(Math.min(1500,600+(m.x||"").length*12));
   if(id!==run)return;
   bulle(m,p);p=m;bas();
  }
  await wait(1100);
 }
 ctl.textContent="Rejouer";fini=true;
}

ctl.addEventListener("click",function(){if(fini){play(0);return}pause=!pause;ctl.textContent=pause?"Reprendre":"Pause"});
function tout(){J.forEach(function(j){date(j.d);var p=null;j.m.forEach(function(m){bulle(m,p);p=m})});chat.scrollTop=0;ctl.hidden=true}
if(matchMedia("(prefers-reduced-motion: reduce)").matches){tout();return}
var io=new IntersectionObserver(function(e){if(e[0].isIntersecting){io.disconnect();play(0)}},{threshold:.35});
io.observe(chat);
})();
