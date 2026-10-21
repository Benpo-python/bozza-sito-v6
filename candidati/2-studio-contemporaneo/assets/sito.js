/* La bottega del web, v8: barra e progresso, ventaglio dei siti trascinabile con inerzia e scatto, selettore di attività,
   cosa vede chi ti cerca, calcolatore, filtro esempi, barra fissa. Nessuna dipendenza. */
(function(){
  var doc=document.documentElement,ridotto=matchMedia("(prefers-reduced-motion:reduce)").matches;
  doc.classList.add("js");
  /* barra e barra di progresso */
  var b=document.querySelector(".barra"),pr=document.querySelector(".progresso");
  function s(){if(b)b.classList.toggle("giu",scrollY>24);if(pr){var h=doc.scrollHeight-innerHeight;pr.style.setProperty("--p",h>0?Math.min(1,scrollY/h):0)}}
  s();addEventListener("scroll",s,{passive:true});

  /* reveal di riserva: se lo scorrimento salta una sezione, la rivela comunque */
  var rv=[].slice.call(document.querySelectorAll(".rv")),rvRaf=null;
  function rivela(){rvRaf=null;rv=rv.filter(function(e){if(e.classList.contains("in"))return false;if(e.getBoundingClientRect().top<innerHeight*.94){e.classList.add("in");return false}return true})}
  if(rv.length){addEventListener("scroll",function(){if(!rvRaf)rvRaf=requestAnimationFrame(rivela)},{passive:true});addEventListener("load",rivela)}

  /* giostra: su schermi larghi è una fila di sette telefoni sul banco, quello in fuoco è più grande e i vicini decrescono;
     su tablet e telefono è un mazzo: quello davanti al centro, i vicini sbirciano dietro. Si trascina, ha inerzia e scatta
     sul telefono più vicino. Nessun elemento esce mai dallo schermo. */
  var st=document.querySelector(".giostra"),an=st&&st.querySelector(".giostra-anello"),tels=an?[].slice.call(an.querySelectorAll(".giostra-tel")):[];
  if(an&&tels.length){
    var N=tels.length,PASSO=360/N,p=Math.floor(N/2),W=0,lt=0,riga=false,vel=0,x0=null,xp=0,tp=0,mosso=false,raf=null,t_=null,evid=false,attivo=-1;
    function misura(){W=st.clientWidth||innerWidth;riga=W>=1100;if(riga){lt=Math.max(150,Math.min(236,(W-6*16)/5.56));st.style.setProperty("--lt",lt.toFixed(1)+"px")}else{st.style.removeProperty("--lt");lt=tels[0].offsetWidth||220}}
    function disegna(){
      var best=-1,bi=0,i,t,e;
      if(riga){
        var sc=[],tot=16*(N-1),x;
        for(i=0;i<N;i++){var dd=Math.min(3,Math.abs(i-p));sc[i]=1-dd*.12;tot+=lt*sc[i]}
        x=(W-tot)/2;
        for(i=0;i<N;i++){t=tels[i];e=t.style;var c=x+lt*sc[i]/2,d=1-Math.min(1,Math.abs(i-p)),o=1;
          if(evid&&!t.classList.contains("in-evidenza"))o=.5;
          e.setProperty("--x",(c-W/2).toFixed(1)+"px");e.setProperty("--y","0px");e.setProperty("--s",sc[i].toFixed(3));e.setProperty("--o",o.toFixed(2));e.setProperty("--z",Math.round(10-Math.min(3,Math.abs(i-p))*2));e.setProperty("--d",d>.9?1:0);
          x+=lt*sc[i]+16;if(d>best){best=d;bi=i}}
      }else{
        var R=Math.min(lt*.62,(W-lt*.6)/2);
        for(i=0;i<N;i++){t=tels[i];e=t.style;var th=((i-p)*PASSO%360+540)%360-180,r=th*Math.PI/180,cs=Math.cos(r),dp=(cs+1)/2,s=.74+.26*dp,xx=Math.sin(r)*R,lim=(W-lt*s)/2-2;
          if(xx>lim)xx=lim;if(xx<-lim)xx=-lim;
          var y=(1-dp)*10,op=.4+.6*Math.pow(dp,1.5);
          if(evid&&!t.classList.contains("in-evidenza"))op*=.5;
          e.setProperty("--x",xx.toFixed(1)+"px");e.setProperty("--y",y.toFixed(1)+"px");e.setProperty("--s",s.toFixed(3));e.setProperty("--o",op.toFixed(3));e.setProperty("--z",Math.round(dp*100));e.setProperty("--d",dp>.96?1:0);
          if(dp>best){best=dp;bi=i}}
      }
      if(bi!==attivo){attivo=bi;tels.forEach(function(t,i){t.classList.toggle("attivo",i===bi)})}
    }
    function limita(v){if(riga)return Math.max(0,Math.min(N-1,v));return v}
    function vicino(){return limita(Math.round(p))}
    /* animazione verso un indice */
    function vai(a,ms){
      if(raf){cancelAnimationFrame(raf);raf=null}
      if(!riga){var d=((a-p)%N+N*1.5)%N-N/2;a=p+d}
      if(ridotto||!ms){p=a;disegna();return}
      var da=p,t0=null;function f(t){if(!t0)t0=t;var k=Math.min(1,(t-t0)/ms);k=1-Math.pow(1-k,3);p=da+(a-da)*k;disegna();if(k<1)raf=requestAnimationFrame(f);else raf=null}
      raf=requestAnimationFrame(f);
    }
    an.addEventListener("vai",function(e){vai(+e.detail,riga?520:640)});
    /* inerzia dopo il rilascio, poi scatto sul telefono più vicino */
    function inerzia(t){
      if(t_===null)t_=t;var dt=Math.min(.05,(t-t_)/1000);t_=t;
      p=limita(p+vel*dt);vel*=Math.pow(.003,dt);disegna();
      if(Math.abs(vel)>.25&&(!riga||(p>0&&p<N-1)))raf=requestAnimationFrame(inerzia);else{raf=null;vai(vicino(),380)}
    }
    an.addEventListener("pointerdown",function(e){if(e.button)return;if(raf){cancelAnimationFrame(raf);raf=null}x0=xp=e.clientX;tp=e.timeStamp;mosso=false;vel=0;an.classList.add("trascino");try{an.setPointerCapture(e.pointerId)}catch(_){}});
    an.addEventListener("pointermove",function(e){if(x0===null)return;var d=e.clientX-xp,dt=(e.timeStamp-tp)/1000,k=1/(lt*(riga?1.1:.9));if(Math.abs(e.clientX-x0)>4)mosso=true;p=limita(p-d*k);if(dt>0)vel=(-d*k)/dt;xp=e.clientX;tp=e.timeStamp;disegna()});
    function fine(){if(x0===null)return;x0=null;an.classList.remove("trascino");vel=Math.max(-4,Math.min(4,vel));if(ridotto||Math.abs(vel)<.25){vai(vicino(),ridotto?0:380)}else{t_=null;raf=requestAnimationFrame(inerzia)}}
    an.addEventListener("pointerup",fine);an.addEventListener("pointercancel",fine);an.addEventListener("lostpointercapture",fine);
    an.addEventListener("click",function(e){if(mosso){e.preventDefault();e.stopPropagation();mosso=false}},true);
    an.addEventListener("dragstart",function(e){e.preventDefault()});
    /* da tastiera: il telefono che riceve il fuoco viene messo in evidenza */
    tels.forEach(function(t,i){t.addEventListener("focus",function(){if(x0!==null||!t.matches(":focus-visible"))return;vai(i,420)})});
    /* chip "Qual è la tua attività?" */
    var sc=document.querySelectorAll(".scegli-b");
    sc.forEach(function(c){c.addEventListener("click",function(){var n=+c.dataset.n,veri=c.classList.contains("scegli-veri");sc.forEach(function(x){x.classList.toggle("attivo",x===c)});evid=veri;tels.forEach(function(t,i){t.classList.toggle("in-evidenza",veri&&(i%2===1))});an.dispatchEvent(new CustomEvent("vai",{detail:n}))})});
    misura();disegna();
    addEventListener("resize",function(){misura();disegna()});
    addEventListener("load",function(){misura();disegna()});
  }

  /* barra fissa: sparisce anche quando la chiusura scura o il piede sono in vista */
  var fissa=document.getElementById("fissa"),heroBtn=document.querySelector(".hero .azioni .btn"),coda=document.querySelectorAll(".scura,.piede");
  if(fissa&&heroBtn&&coda.length&&"IntersectionObserver" in window){
    var codaVis=0;
    var io=new IntersectionObserver(function(l){l.forEach(function(x){codaVis+=x.isIntersecting?1:-1});codaVis=Math.max(0,codaVis);
      var r=heroBtn.getBoundingClientRect(),heroVis=r.bottom>0&&r.top<innerHeight;fissa.classList.toggle("nascosta",codaVis>0||heroVis)},{threshold:0});
    coda.forEach(function(c){io.observe(c)});
  }
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
