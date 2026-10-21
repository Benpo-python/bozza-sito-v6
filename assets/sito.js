/* La bottega del web, v5: progresso, barra, titolo parola per parola, giostra 3D, pulsanti magnetici, parole che si accendono. Nessuna dipendenza. */
(function(){
  var doc=document.documentElement,ridotto=matchMedia("(prefers-reduced-motion:reduce)").matches,fine=matchMedia("(hover:hover) and (pointer:fine)").matches;
  doc.classList.add("js");
  /* barra e barra di progresso */
  var b=document.querySelector(".barra"),pr=document.querySelector(".progresso");
  function s(){if(b)b.classList.toggle("giu",scrollY>24);if(pr){var h=doc.scrollHeight-innerHeight;pr.style.setProperty("--p",h>0?Math.min(1,scrollY/h):0)}}
  s();addEventListener("scroll",s,{passive:true});
  /* titolo: ogni parola entra dal basso */
  function spezza(el,cls,conta){var i=0;function giro(n){Array.prototype.slice.call(n.childNodes).forEach(function(c){if(c.nodeType===3){var f=document.createDocumentFragment(),p=c.nodeValue.split(/(\s+)/);p.forEach(function(t){if(!t)return;if(/^\s+$/.test(t)){f.appendChild(document.createTextNode(t));return}var w=document.createElement("span");w.className=cls;if(conta)w.style.setProperty("--i",i++);var k=document.createElement("span");k.textContent=t;w.appendChild(k);f.appendChild(w)});n.replaceChild(f,c)}else if(c.nodeType===1&&c.tagName!=="SVG"&&!c.classList.contains(cls))giro(c)})}giro(el);return i}
  var h1=document.querySelector(".hero .h1");
  if(h1&&!ridotto){spezza(h1,"parola",true);var pr_=function(){doc.classList.add("pronto")};requestAnimationFrame(function(){requestAnimationFrame(pr_)});setTimeout(pr_,120)}else doc.classList.add("pronto");
  /* chi c'è dietro: parole che si accendono allo scorrimento */
  document.querySelectorAll(".accendi").forEach(function(p){Array.prototype.slice.call(p.childNodes).forEach(function(c){if(c.nodeType!==3)return;var f=document.createDocumentFragment();c.nodeValue.split(/(\s+)/).forEach(function(t){if(!t)return;if(/^\s+$/.test(t)){f.appendChild(document.createTextNode(t));return}var w=document.createElement("span");w.className="evid";w.textContent=t;f.appendChild(w)});p.replaceChild(f,c)})});
  /* giostra 3D: gira da sola, si trascina con mouse o dito, con inerzia al rilascio */
  var an=document.querySelector(".giostra-anello"),tel=an?an.querySelectorAll(".giostra-tel"):[],dOld=[],davanti=-1;
  function prof(g){var best=-2,bi=-1;for(var i=0;i<tel.length;i++){var d=(Math.cos((i*51.43+g)*Math.PI/180)+1)/2;if(dOld[i]===undefined||Math.abs(dOld[i]-d)>.015){tel[i].style.setProperty("--d",d.toFixed(3));dOld[i]=d}if(d>best){best=d;bi=i}}
    if(bi!==davanti){if(davanti>=0)tel[davanti].classList.remove("davanti");if(bi>=0)tel[bi].classList.add("davanti");davanti=bi}}
  if(an&&!ridotto){var g=0,vel=0,x0=null,xp=0,tp=0,mosso=false,tr=false,t_=null;
    function passo(t){if(t_===null)t_=t;var dt=Math.min(.05,(t-t_)/1000);t_=t;
      if(!tr){g+=8.2*dt+vel*dt;vel*=Math.pow(.02,dt)}
      an.style.setProperty("--g",g.toFixed(2)+"deg");prof(g);requestAnimationFrame(passo)}
    requestAnimationFrame(passo);
    an.addEventListener("vai",function(e){var da=g,a=e.detail,t0=null;tr=true;vel=0;function f(t){if(!t0)t0=t;var k=Math.min(1,(t-t0)/900);k=1-Math.pow(1-k,3);g=da+(a-da)*k;an.style.setProperty("--g",g.toFixed(2)+"deg");if(k<1)requestAnimationFrame(f);else setTimeout(function(){tr=false},2600)}requestAnimationFrame(f)});
    an.addEventListener("pointerdown",function(e){if(e.button)return;x0=xp=e.clientX;tp=e.timeStamp;mosso=false;tr=true;vel=0;an.classList.add("trascino");an.setPointerCapture(e.pointerId)});
    an.addEventListener("pointermove",function(e){if(x0===null)return;var d=e.clientX-xp,dt=(e.timeStamp-tp)/1000;if(Math.abs(e.clientX-x0)>4)mosso=true;g+=d*.35;if(dt>0)vel=(d*.35)/dt;xp=e.clientX;tp=e.timeStamp;an.style.setProperty("--g",g.toFixed(2)+"deg")});
    function fine_(){if(x0===null)return;x0=null;tr=false;vel=Math.max(-400,Math.min(400,vel));an.classList.remove("trascino")}
    an.addEventListener("pointerup",fine_);an.addEventListener("pointercancel",fine_);an.addEventListener("lostpointercapture",fine_);
    an.addEventListener("click",function(e){if(mosso){e.preventDefault();e.stopPropagation()}},true);
    an.addEventListener("dragstart",function(e){e.preventDefault()})}
  /* come funziona: le carte scorrono in orizzontale mentre la pagina scorre (da 1024 px); aggiornate a ogni frame con smorzamento; si possono anche trascinare */
  var oz=document.querySelector(".orizz"),pa=oz&&oz.querySelector(".passi"),fermo=oz&&oz.querySelector(".orizz-fermo"),prog=oz&&oz.querySelector(".orizz-prog");
  if(oz&&pa&&!ridotto){var mq=matchMedia("(min-width:1024px)"),maxO=0,corsa=1,txA=0,pA=0,ultimo=-1;
    function misura(){var w=pa.parentElement,cs=getComputedStyle(w),vis=w.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);maxO=Math.max(0,pa.scrollWidth-vis);corsa=Math.max(1,oz.offsetHeight-innerHeight)}
    function quadro(){if(!mq.matches){if(ultimo!==0){pa.style.setProperty("--tx","0px");ultimo=0}requestAnimationFrame(quadro);return}
      var r=oz.getBoundingClientRect(),p=Math.min(1,Math.max(0,(-r.top)/corsa)),txT=-maxO*p;
      if(r.bottom>-200&&r.top<innerHeight+200){txA+=(txT-txA)*.22;pA+=(p-pA)*.22;if(Math.abs(txT-txA)<.3)txA=txT;if(Math.abs(p-pA)<.002)pA=p}
      else{txA=txT;pA=p}
      if(txA!==ultimo){pa.style.setProperty("--tx",txA.toFixed(2)+"px");if(prog)prog.style.setProperty("--p",pA.toFixed(4));ultimo=txA}
      requestAnimationFrame(quadro)}
    misura();addEventListener("resize",misura);addEventListener("load",misura);requestAnimationFrame(quadro);
    if(fermo){var ox=null,oy=0,om=false;
      fermo.addEventListener("pointerdown",function(e){if(e.button||!mq.matches||e.target.closest("a,button"))return;ox=e.clientX;oy=scrollY;om=false;fermo.classList.add("trascino");fermo.setPointerCapture(e.pointerId)});
      fermo.addEventListener("pointermove",function(e){if(ox===null)return;var d=e.clientX-ox;if(Math.abs(d)>3)om=true;if(maxO>0){document.documentElement.style.scrollBehavior="auto";var t0=oz.offsetTop;scrollTo(0,Math.min(t0+corsa,Math.max(t0,oy-d*(corsa/maxO))))}});
      function fineO(){if(ox===null)return;ox=null;fermo.classList.remove("trascino");document.documentElement.style.scrollBehavior=""}
      fermo.addEventListener("pointerup",fineO);fermo.addEventListener("pointercancel",fineO);fermo.addEventListener("lostpointercapture",fineO);
      fermo.addEventListener("click",function(e){if(om){e.preventDefault();e.stopPropagation()}},true)}}
  /* pulsanti magnetici */
  if(fine&&!ridotto){document.querySelectorAll(".btn").forEach(function(el){el.addEventListener("pointermove",function(e){var r=el.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)/r.width,y=(e.clientY-r.top-r.height/2)/r.height;el.style.translate=(x*10)+"px "+(y*8)+"px"});el.addEventListener("pointerleave",function(){el.style.translate=""})})}
})();
/* ===== 5.1: selettore di attività, cosa vede chi ti cerca, calcolatore, filtro esempi ===== */
(function(){
  /* 1. selettore: porta davanti il telefono scelto */
  var sc=document.querySelectorAll(".scegli-b"),an=document.querySelector(".giostra-anello"),tels=document.querySelectorAll(".giostra-tel");
  if(sc.length&&an){sc.forEach(function(b){b.addEventListener("click",function(){var n=+b.dataset.n;sc.forEach(function(x){x.classList.toggle("attivo",x===b)});tels.forEach(function(t,i){t.classList.toggle("in-evidenza",b.classList.contains("scegli-veri")?(i%2===1):i===n)});
    /* angolo che porta l'elemento n davanti: -n*51.43 (mod 360), scegliendo il verso più corto */
    var g=parseFloat(an.style.getPropertyValue("--g"))||0,target=-n*51.43,d=((target-g)%360+540)%360-180;an.dispatchEvent(new CustomEvent("vai",{detail:g+d}))})})}
  /* 3. con o senza sito */
  var cb=document.querySelectorAll(".cerca-b");
  cb.forEach(function(b){b.addEventListener("click",function(){cb.forEach(function(x){x.classList.toggle("attivo",x===b)});var m=b.dataset.m;document.querySelector(".cerca-con").hidden=m!=="con";document.querySelector(".cerca-senza").hidden=m!=="senza"})});
  /* 2. calcolatore */
  var mese=document.getElementById("calc-mese"),iniz=document.getElementById("calc-iniz");
  if(mese&&iniz){var pk="base",E=function(n){return Math.round(n).toLocaleString("it-IT")+" €"};
    function calc(){var m=+mese.value,i=+iniz.value,dom=12.5,noi=pk==="base"?249+3*dom:449+2*dom,altro=i+m*36;
      document.getElementById("calc-m").textContent=E(m);document.getElementById("calc-i").textContent=E(i);
      document.getElementById("calc-bn").textContent=pk==="base"?"249 € una volta più il dominio, circa 10-15 € l'anno":"449 € una volta, primo anno di dominio incluso, poi circa 10-15 € l'anno";
      document.getElementById("calc-bt").textContent="circa "+E(noi);
      document.getElementById("calc-an").textContent=(i?E(i)+" all'inizio più ":"")+m+" € al mese per 36 mesi";
      document.getElementById("calc-at").textContent=E(altro);
      var mx=Math.max(noi,altro,1);document.getElementById("calc-bb").style.setProperty("--l",(noi/mx*100).toFixed(1)+"%");document.querySelector(".calc-altro").style.setProperty("--l",(altro/mx*100).toFixed(1)+"%");
      var d=altro-noi,el=document.getElementById("calc-d");el.textContent=d>=0?"circa "+E(d)+" in meno":"circa "+E(-d)+" in più";el.parentElement.classList.toggle("peggio",d<0)}
    mese.addEventListener("input",calc);iniz.addEventListener("input",calc);
    document.querySelectorAll(".calc-b").forEach(function(b){b.addEventListener("click",function(){pk=b.dataset.pk;document.querySelectorAll(".calc-b").forEach(function(x){x.classList.toggle("attivo",x===b)});calc()})});calc()}
  /* 4. filtro esempi: se le carte visibili sono dispari, la prima prende tutta la riga (così la griglia è sempre piena) */
  var fb=document.querySelectorAll(".filtro-b");
  fb.forEach(function(b){b.addEventListener("click",function(){fb.forEach(function(x){x.classList.toggle("attivo",x===b)});var f=b.dataset.f,k=0,prima=null;document.querySelectorAll(".pila .carta").forEach(function(c){var v=f==="tutti"||c.dataset.t===f;c.classList.toggle("nascosta",!v);c.classList.remove("larga");if(v){c.style.setProperty("--k",k++);if(!prima)prima=c}});if(prima&&k%2===1)prima.classList.add("larga")})});
})();
