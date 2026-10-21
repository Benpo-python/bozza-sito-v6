/* La bottega del web, v8: barra e progresso, palco con cross-fade + pista trascinabile (la giostra), chip di attività,
   cosa vede chi ti cerca, calcolatore, filtro esempi, barra fissa che si ritira sulla chiusura. Nessuna dipendenza. */
(function(){
  var doc=document.documentElement,ridotto=matchMedia("(prefers-reduced-motion:reduce)").matches;
  doc.classList.add("js");
  /* barra e barra di progresso */
  var b=document.querySelector(".barra"),pr=document.querySelector(".progresso");
  function s(){if(b)b.classList.toggle("giu",scrollY>24);if(pr){var h=doc.scrollHeight-innerHeight;pr.style.setProperty("--p",h>0?Math.min(1,scrollY/h):0)}}
  s();addEventListener("scroll",s,{passive:true});

  /* palco + pista: un telefono grande mostra il sito attivo; le 7 miniature sono la giostra.
     Si gira trascinando il telefono (scorri a sinistra = il prossimo) o passando il dito sulla pista; le chip portano davanti il sito scelto. */
  var pista=document.querySelector(".giostra-pista"),palco=document.querySelector(".palco");
  if(pista&&palco){
    var tels=Array.prototype.slice.call(pista.querySelectorAll(".giostra-tel")),N=tels.length,
        link=palco.querySelector(".palco-link"),did=palco.querySelector(".palco-did"),tel=palco.querySelector(".tel"),
        fronte=palco.querySelector(".palco-a"),retro=palco.querySelector(".palco-b"),
        chips=Array.prototype.slice.call(document.querySelectorAll(".scegli-b")),attivo=0,gettone=0;
    function attiva(n,veri){
      n=((n%N)+N)%N;
      var t=tels[n],im=t.querySelector("img");
      if(n!==attivo){
        attivo=n;
        var mio=++gettone;
        retro.alt=im.alt;retro.srcset=im.srcset;retro.sizes=fronte.sizes;retro.src=im.src;
        var scambia=function(){
          if(mio!==gettone)return;
          retro.classList.add("vis");fronte.classList.remove("vis");
          var x=fronte;fronte=retro;retro=x;
          fronte.removeAttribute("aria-hidden");retro.setAttribute("aria-hidden","true");retro.alt="";
        };
        if(retro.decode){retro.decode().then(scambia,scambia)}else if(retro.complete){scambia()}else{retro.onload=scambia}
        did.innerHTML=t.querySelector(".giostra-did").innerHTML;
        link.href=t.href;
      }
      tels.forEach(function(x,i){x.classList.toggle("attivo",i===n);if(i===n)x.setAttribute("aria-current","true");else x.removeAttribute("aria-current")});
      /* chip coerente con il sito davanti: prima quella con lo stesso data-n, altrimenti "Siti realizzati" se il sito è reale */
      var diretta=chips.some(function(c){return !c.classList.contains("scegli-veri")&&+c.dataset.n===n});
      chips.forEach(function(c){var m=c.classList.contains("scegli-veri")?(!diretta&&t.dataset.t==="vero"):+c.dataset.n===n;c.classList.toggle("attivo",m);c.setAttribute("aria-pressed",m?"true":"false")});
      pista.classList.toggle("veri",!!veri);
      tels.forEach(function(x){x.classList.toggle("in-evidenza",!!veri&&x.dataset.t==="vero")});
      pista.dispatchEvent(new CustomEvent("vai",{detail:n}));
    }
    tels[0].classList.add("attivo");tels[0].setAttribute("aria-current","true");
    chips.forEach(function(c){c.setAttribute("aria-pressed",c.classList.contains("attivo")?"true":"false");c.addEventListener("click",function(){attiva(+c.dataset.n,c.classList.contains("scegli-veri"))})});
    /* pista: un clic sulla miniatura la porta davanti (il secondo clic apre il sito); trascinando si scorre tra i siti, con un passo in più se il gesto è veloce */
    var px=null,pxp=0,ptp=0,pvel=0,pmosso=false;
    function sotto(x){for(var i=0;i<N;i++){var r=tels[i].getBoundingClientRect();if(x>=r.left-4&&x<=r.right+4){if(i!==attivo)attiva(i);return}}}
    pista.addEventListener("pointerdown",function(e){if(e.button)return;px=pxp=e.clientX;ptp=e.timeStamp;pvel=0;pmosso=false});
    pista.addEventListener("pointermove",function(e){if(px===null)return;var d=e.clientX-pxp,dt=(e.timeStamp-ptp)/1000;if(dt>0)pvel=d/dt;pxp=e.clientX;ptp=e.timeStamp;
      if(!pmosso&&Math.abs(e.clientX-px)>6){pmosso=true;pista.classList.add("trascino");try{pista.setPointerCapture(e.pointerId)}catch(x){}}
      if(pmosso)sotto(e.clientX)});
    function pfine(){if(px===null)return;px=null;pista.classList.remove("trascino");if(pmosso&&Math.abs(pvel)>700){var k=attivo+(pvel>0?1:-1);if(k>=0&&k<N)attiva(k)}}
    pista.addEventListener("pointerup",pfine);pista.addEventListener("pointercancel",pfine);pista.addEventListener("lostpointercapture",pfine);
    pista.addEventListener("click",function(e){var t=e.target.closest(".giostra-tel");if(pmosso){e.preventDefault();pmosso=false;return}if(!t||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;var i=tels.indexOf(t);if(i!==attivo){e.preventDefault();attiva(i)}},true);
    pista.addEventListener("dragstart",function(e){e.preventDefault()});
    /* palco: si trascina il telefono; oltre 48 px (o con un gesto rapido) passa al sito successivo o precedente */
    var sx=null,sdx=0,sxp=0,stp=0,svx=0,smosso=false;
    link.addEventListener("pointerdown",function(e){if(e.button)return;sx=sxp=e.clientX;stp=e.timeStamp;sdx=0;svx=0;smosso=false});
    link.addEventListener("pointermove",function(e){if(sx===null)return;sdx=e.clientX-sx;var d=e.clientX-sxp,dt=(e.timeStamp-stp)/1000;if(dt>0)svx=d/dt;sxp=e.clientX;stp=e.timeStamp;
      if(!smosso&&Math.abs(sdx)>6){smosso=true;palco.classList.add("trascino");try{link.setPointerCapture(e.pointerId)}catch(x){}}
      if(smosso&&!ridotto)tel.style.transform="translateX("+(sdx*.35).toFixed(1)+"px) rotate("+(sdx*.008).toFixed(2)+"deg)"});
    function sfine(){if(sx===null)return;sx=null;palco.classList.remove("trascino");tel.style.transform="";if(smosso&&(Math.abs(sdx)>48||Math.abs(svx)>500))attiva(attivo+(sdx<0?1:-1))}
    link.addEventListener("pointerup",sfine);link.addEventListener("pointercancel",sfine);link.addEventListener("lostpointercapture",sfine);
    link.addEventListener("click",function(e){if(smosso){e.preventDefault();smosso=false}});
    link.addEventListener("dragstart",function(e){e.preventDefault()});
    /* tastiera: frecce sul palco o sulla pista */
    [palco,pista].forEach(function(el){el.addEventListener("keydown",function(e){if(e.key==="ArrowRight"){e.preventDefault();attiva(attivo+1)}else if(e.key==="ArrowLeft"){e.preventDefault();attiva(attivo-1)}})});
  }

  /* la barra fissa si ritira quando la chiusura è in vista (lì ci sono già gli stessi due pulsanti) */
  var fissa=document.getElementById("fissa"),scura=document.querySelector(".scura");
  if(fissa&&scura&&"IntersectionObserver" in window){new IntersectionObserver(function(l){fissa.classList.toggle("fine",l[0].isIntersecting)},{threshold:.2}).observe(scura)}
})();

/* ===== cosa vede chi ti cerca, calcolatore, filtro esempi ===== */
(function(){
  /* con o senza sito */
  var cb=document.querySelectorAll(".cerca-b");
  cb.forEach(function(b){b.addEventListener("click",function(){cb.forEach(function(x){x.classList.toggle("attivo",x===b)});var m=b.dataset.m;document.querySelector(".cerca-con").hidden=m!=="con";document.querySelector(".cerca-senza").hidden=m!=="senza"})});
  /* calcolatore */
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
  /* filtro esempi */
  var fb=document.querySelectorAll(".filtro-b");
  fb.forEach(function(b){b.addEventListener("click",function(){fb.forEach(function(x){x.classList.toggle("attivo",x===b)});var f=b.dataset.f,k=0;document.querySelectorAll(".pila .carta").forEach(function(c){var v=f==="tutti"||c.dataset.t===f;c.classList.toggle("nascosta",!v);if(v){c.style.setProperty("--k",k++)}})})});
})();
