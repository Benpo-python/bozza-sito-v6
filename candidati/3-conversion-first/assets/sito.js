/* La bottega del web, v8 (direzione C): barra e progresso, palco + pista dei siti (chip, miniature, trascinamento con inerzia, evento "vai"), cosa vede chi ti cerca, calcolatore, filtro esempi, barra fissa. Nessuna dipendenza. */
(function(){
  var doc=document.documentElement,ridotto=matchMedia("(prefers-reduced-motion:reduce)").matches;
  doc.classList.add("js");
  /* barra e barra di progresso */
  var b=document.querySelector(".barra"),pr=document.querySelector(".progresso");
  function s(){if(b)b.classList.toggle("giu",scrollY>24);if(pr){var h=doc.scrollHeight-innerHeight;pr.style.setProperty("--p",h>0?Math.min(1,scrollY/h):0)}}
  s();addEventListener("scroll",s,{passive:true});

  /* palco + pista: 7 miniature (.giostra-tel), un telefono grande (.palco), 5 chip (.scegli-b) */
  var pista=document.querySelector(".giostra"),an=pista&&pista.querySelector(".giostra-anello"),tels=an?Array.prototype.slice.call(an.querySelectorAll(".giostra-tel")):[],
      palco=document.querySelector(".palco"),cornice=palco&&palco.querySelector(".palco-cornice"),schermo=palco&&palco.querySelector(".tel-schermo"),did=palco&&palco.querySelector(".palco-did"),
      chips=Array.prototype.slice.call(document.querySelectorAll(".scegli-b")),attivo=0,mosso=false;
  if(an&&tels.length){
    var N=tels.length,imgs=schermo?Array.prototype.slice.call(schermo.querySelectorAll("img")):[];
    function vero(t){var d=t.querySelector(".giostra-did");return !!d&&/^sito realizzato/i.test(d.textContent.trim())}
    function grande(img){var ss=img.getAttribute("srcset");if(ss){var u=ss.split(",").pop().trim().split(/\s+/)[0];if(u)return u}return img.currentSrc||img.src}
    /* il palco copia schermata e didascalia dalla miniatura attiva: due <img> sovrapposte, dissolvenza incrociata di 200 ms */
    function mostra(n){
      if(!schermo)return;var t=tels[n],src=t&&t.querySelector("img");if(!src)return;
      var fronte=schermo.querySelector("img.vis")||imgs[0];
      if(did){var d=t.querySelector(".giostra-did");if(d)did.innerHTML=d.innerHTML}
      if(!fronte||fronte.dataset.n===String(n))return;
      var dietro=null;for(var i=0;i<imgs.length;i++)if(imgs[i]!==fronte){dietro=imgs[i];break}
      if(!dietro){dietro=document.createElement("img");dietro.width=780;dietro.height=1688;dietro.alt="";dietro.decoding="async";if(fronte.sizes)dietro.sizes=fronte.sizes;schermo.appendChild(dietro);imgs.push(dietro)}
      dietro.setAttribute("srcset",src.getAttribute("srcset")||"");dietro.src=grande(src);dietro.alt=src.alt;dietro.dataset.n=n;
      dietro.style.zIndex=2;fronte.style.zIndex=1;
      var fatto=false;function via(){if(fatto)return;fatto=true;dietro.classList.add("vis");fronte.classList.remove("vis");fronte.alt=""}
      if(dietro.decode)dietro.decode().then(via,via);else if(dietro.complete)via();else{dietro.onload=via;dietro.onerror=via}
      setTimeout(via,500);
    }
    function centra(n){var t=tels[n];if(!t||pista.scrollWidth<=pista.clientWidth)return;pista.scrollTo({left:t.offsetLeft-(pista.clientWidth-t.offsetWidth)/2,behavior:ridotto?"auto":"smooth"})}
    function attiva(n){
      n=((n%N)+N)%N;var cambia=n!==attivo;attivo=n;
      tels.forEach(function(t,i){t.classList.toggle("attivo",i===n);if(i===n)t.setAttribute("aria-current","true");else t.removeAttribute("aria-current")});
      chips.forEach(function(c){var on=+c.dataset.n===n;c.classList.toggle("attivo",on);c.setAttribute("aria-pressed",on?"true":"false")});
      if(!tels[n].classList.contains("in-evidenza")){pista.classList.remove("evidenzia");tels.forEach(function(t){t.classList.remove("in-evidenza")})}
      if(cambia||!schermo||!schermo.querySelector("img.vis"))an.dispatchEvent(new CustomEvent("vai",{detail:n}));
    }
    an.addEventListener("vai",function(e){mostra(e.detail);centra(e.detail)});
    /* chip: porta davanti il telefono data-n; "Siti realizzati" mette in evidenza i quattro siti veri */
    chips.forEach(function(c){c.addEventListener("click",function(){
      var veri=c.classList.contains("scegli-veri");
      tels.forEach(function(t){t.classList.toggle("in-evidenza",veri&&vero(t))});pista.classList.toggle("evidenzia",veri);
      attiva(+c.dataset.n);
    })});
    /* miniatura: il primo clic la rende attiva, il secondo apre il sito (tasto centrale, Ctrl e Cmd aprono subito) */
    tels.forEach(function(t,i){t.addEventListener("click",function(e){
      if(mosso){e.preventDefault();mosso=false;return}
      if(e.ctrlKey||e.metaKey||e.shiftKey||e.button===1)return;
      if(i!==attivo){e.preventDefault();attiva(i)}
    })});
    /* trascinamento (mouse, penna o dito) su pista e palco: ogni 70 px un telefono, al rilascio l'inerzia aggiunge fino a due passi */
    var x0=null,xp=0,tp=0,vel=0,acc=0,pid=null,el_=null,PASSO=70;
    function giu(e){if(e.button||x0!==null)return;x0=xp=e.clientX;tp=e.timeStamp;vel=0;acc=0;mosso=false;pid=e.pointerId;el_=this;this.classList.add("trascino");
      addEventListener("pointermove",muovi);addEventListener("pointerup",su);addEventListener("pointercancel",su)}
    function muovi(e){if(x0===null||e.pointerId!==pid)return;var d=e.clientX-xp,dt=(e.timeStamp-tp)/1000;if(Math.abs(e.clientX-x0)>4)mosso=true;acc+=d;if(dt>0)vel=d/dt;xp=e.clientX;tp=e.timeStamp;
      while(acc<=-PASSO){acc+=PASSO;attiva(attivo+1)}while(acc>=PASSO){acc-=PASSO;attiva(attivo-1)}}
    function su(e){if(x0===null||e.pointerId!==pid)return;x0=null;pid=null;if(el_)el_.classList.remove("trascino");el_=null;
      removeEventListener("pointermove",muovi);removeEventListener("pointerup",su);removeEventListener("pointercancel",su);
      var extra=e.type==="pointercancel"?0:Math.max(-2,Math.min(2,Math.round(-vel/900)));if(extra&&mosso)attiva(attivo+extra);setTimeout(function(){mosso=false},0)}
    [pista,cornice].forEach(function(el){if(!el)return;
      el.addEventListener("pointerdown",giu);
      el.addEventListener("dragstart",function(e){e.preventDefault()});
      el.addEventListener("click",function(e){if(mosso&&!e.target.closest(".giostra-tel")){e.preventDefault();mosso=false}},true)});
    /* tastiera sul palco: frecce */
    if(cornice){cornice.tabIndex=0;cornice.setAttribute("role","group");cornice.setAttribute("aria-label","Telefono con il sito scelto: usa le frecce per cambiare");
      cornice.addEventListener("keydown",function(e){if(e.key==="ArrowRight"){e.preventDefault();attiva(attivo+1)}else if(e.key==="ArrowLeft"){e.preventDefault();attiva(attivo-1)}})}
    attiva(0);
  }

  /* cosa vede chi ti cerca */
  var cb=document.querySelectorAll(".cerca-b"),con=document.querySelector(".cerca-con"),senza=document.querySelector(".cerca-senza");
  cb.forEach(function(b){b.addEventListener("click",function(){cb.forEach(function(x){x.classList.toggle("attivo",x===b);x.setAttribute("aria-pressed",x===b?"true":"false")});var m=b.dataset.m;if(con)con.hidden=m!=="con";if(senza)senza.hidden=m!=="senza"})});

  /* calcolatore */
  var mese=document.getElementById("calc-mese"),iniz=document.getElementById("calc-iniz");
  if(mese&&iniz){var pk="base",E=function(n){return Math.round(n).toLocaleString("it-IT")+" €"},$=function(id){return document.getElementById(id)};
    function calc(){var m=+mese.value,i=+iniz.value,dom=12.5,noi=pk==="base"?249+3*dom:449+2*dom,altro=i+m*36;
      $("calc-m").textContent=E(m);$("calc-i").textContent=E(i);
      $("calc-bn").textContent=pk==="base"?"249 € una volta più il dominio, circa 10-15 € l'anno":"449 € una volta, primo anno di dominio incluso, poi circa 10-15 € l'anno";
      $("calc-bt").textContent="circa "+E(noi);
      $("calc-an").textContent=(i?E(i)+" all'inizio più ":"")+m+" € al mese per 36 mesi";
      $("calc-at").textContent=E(altro);
      var mx=Math.max(noi,altro,1);$("calc-bb").style.setProperty("--l",(noi/mx*100).toFixed(1)+"%");var ca=document.querySelector(".calc-altro");if(ca)ca.style.setProperty("--l",(altro/mx*100).toFixed(1)+"%");
      var d=altro-noi,el=$("calc-d");el.textContent=d>=0?"circa "+E(d)+" in meno":"circa "+E(-d)+" in più";el.parentElement.classList.toggle("peggio",d<0)}
    mese.addEventListener("input",calc);iniz.addEventListener("input",calc);
    document.querySelectorAll(".calc-b").forEach(function(b){b.addEventListener("click",function(){pk=b.dataset.pk;document.querySelectorAll(".calc-b").forEach(function(x){x.classList.toggle("attivo",x===b);x.setAttribute("aria-pressed",x===b?"true":"false")});calc()})});calc()}

  /* filtro esempi */
  var fb=document.querySelectorAll(".filtro-b");
  fb.forEach(function(b){b.addEventListener("click",function(){fb.forEach(function(x){x.classList.toggle("attivo",x===b);x.setAttribute("aria-pressed",x===b?"true":"false")});var f=b.dataset.f,k=0;document.querySelectorAll(".pila .carta").forEach(function(c){var v=f==="tutti"||c.dataset.t===f;c.classList.toggle("nascosta",!v);if(v)c.style.setProperty("--k",k++)})})});

  /* barra fissa: si ritira quando la chiusura è in vista (lì ci sono già gli stessi due pulsanti) */
  var f=document.getElementById("fissa"),sc=document.querySelector(".scura");
  if(f&&sc&&"IntersectionObserver" in window)new IntersectionObserver(function(l){f.classList.toggle("fine",l[0].isIntersecting)},{threshold:.15}).observe(sc);
})();
