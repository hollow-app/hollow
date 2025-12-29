import{c as h,m as D,I as Q,t as f,W as L,R as A,J as $,i as p,k as y,b as B,x as J,G as V,f as N,q as E,F as U,s as S,l as ee,Q as te,Z as ne,p as O,$ as oe}from"./index-CNe0vCeo.js";var re=[["path",{d:"m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z",key:"irua1i"}],["path",{d:"m5 2 5 5",key:"1lls2c"}],["path",{d:"M2 13h15",key:"1hkzvu"}],["path",{d:"M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z",key:"xk76lq"}]],le=e=>h(Q,D(e,{iconNode:re,name:"paint-bucket"})),ae=le,ce=f('<svg xmlns=http://www.w3.org/2000/svg width=800 height=800 fill=currentColor viewBox="0 0 56 56"><path d="m19.316 22.738 15.657 15.657c1.758 1.757 3.586 1.476 5.226-.165l11.625-11.578c1.64-1.64 1.899-3.468.14-5.226l-2.367-2.344c-2.788 2.484-10.617 8.063-11.835 6.844-.399-.399-.07-.75.164-.985 2.578-2.648 6.023-6.867 6.469-11.109L32.043 1.48C30.59.4 28.433.8 27.262 1.738c-2.367 3.352-2.32 8.953-7.946 15.657-1.546 1.875-1.804 3.539 0 5.343M5.488 52.832c3.094 3.047 6.985 3.14 9.75.375 2.18-2.156 4.453-7.945 6.024-10.64l6.562 6.538c1.875 1.876 3.961 1.922 5.719.165l1.477-1.5c1.757-1.758 1.71-3.844-.141-5.72L16.293 23.466c-1.875-1.899-3.937-1.945-5.719-.14L9.098 24.8c-1.805 1.781-1.758 3.82.14 5.719l6.516 6.539c-2.672 1.57-8.484 3.867-10.64 6.023-2.837 2.813-2.696 6.727.374 9.75m3.188-3.305c-.774-.797-.797-2.062 0-2.859.82-.797 2.086-.797 2.883 0 .797.82.797 2.039 0 2.86s-2.063.843-2.883 0">');const se=(e={})=>(()=>{var t=ce();return L(t,e,!0,!0),t})();function H(e=null){return{current:e}}const w=(e,t=0,n=1)=>e>n?n:e<t?t:e,ie=f('<div class="react-colorful__interactive" tabindex="0" role="slider"></div>',2),C=e=>"touches"in e,ue=(e,t)=>{for(let n=0;n<e.length;n++)if(e[n].identifier===t)return e[n];return e[0]},I=e=>e&&e.ownerDocument.defaultView||self,q=(e,t,n)=>{const o=e.getBoundingClientRect(),r=C(t)?ue(t.touches,n):t;return{left:w((r.pageX-(o.left+I(e).pageXOffset))/o.width),top:w((r.pageY-(o.top+I(e).pageYOffset))/o.height)}},z=e=>{!C(e)&&e.preventDefault()},de=(e,t)=>t&&!C(e),W=e=>{const t=H(null),n=H(null);let o=!1;const r=J(()=>{const a=i=>{const u=t.current;if(u&&(z(i),!(de(i,o)||!u))){if(C(i)){o=!0;const _=i.changedTouches||[];_.length&&(n.current=_[0].identifier)}u.focus(),e.onMove(q(u,i,n.current)),m(!0)}},s=i=>{z(i),(C(i)?i.touches.length>0:i.buttons>0)&&t.current?e.onMove(q(t.current,i,n.current)):m(!1)},b=()=>m(!1),x=i=>{const u=i.which||i.keyCode;u<37||u>40||(i.preventDefault(),e.onKey({left:u===39?.05:u===37?-.05:0,top:u===40?.05:u===38?-.05:0}))};function m(i){const u=t.current,_=I(u),k=i?_.addEventListener:_.removeEventListener;k(o?"touchmove":"mousemove",s),k(o?"touchend":"mouseup",b)}return{handleMoveStart:a,handleKeyDown:x,toggleDocumentEvents:m}});V(()=>{r().toggleDocumentEvents});const[l,c]=A(e,["onMove","onKey"]);return(()=>{const a=ie.cloneNode(!0);return N(a,"keydown",r().handleKeyDown,!0),(s=>t.current=s)(a),N(a,"mousedown",r().handleMoveStart,!0),N(a,"touchstart",r().handleMoveStart,!0),L(a,c,!1,!1),a})()};E(["touchstart","mousedown","keydown"]);const R=e=>e.filter(Boolean).join(" "),he=f('<div><div class="react-colorful__pointer-fill"></div></div>',4),F=e=>($(()=>{console.log(e.color)}),(()=>{const t=he.cloneNode(!0),n=t.firstChild;return y(o=>{const r=R(["react-colorful__pointer",e.className]),l=`${e.top*100}%`,c=`${e.left*100}%`,a=e.color;return r!==o._v$&&(t.className=o._v$=r),l!==o._v$2&&t.style.setProperty("top",o._v$2=l),c!==o._v$3&&t.style.setProperty("left",o._v$3=c),a!==o._v$4&&n.style.setProperty("background-color",o._v$4=a),o},{_v$:void 0,_v$2:void 0,_v$3:void 0,_v$4:void 0}),t})()),d=(e,t=0,n=Math.pow(10,t))=>Math.round(n*e)/n,fe=e=>be(T(e)),T=e=>(e[0]==="#"&&(e=e.substr(1)),e.length<6?{r:parseInt(e[0]+e[0],16),g:parseInt(e[1]+e[1],16),b:parseInt(e[2]+e[2],16),a:1}:{r:parseInt(e.substr(0,2),16),g:parseInt(e.substr(2,2),16),b:parseInt(e.substr(4,2),16),a:1}),ve=e=>pe(X(e)),ge=({h:e,s:t,v:n,a:o})=>{const r=(200-t)*n/100;return{h:d(e),s:d(r>0&&r<200?t*n/100/(r<=100?r:200-r)*100:0),l:d(r/2),a:d(o,2)}},Z=e=>{const{h:t,s:n,l:o}=ge(e);return`hsl(${t}, ${n}%, ${o}%)`},X=({h:e,s:t,v:n,a:o})=>{e=e/360*6,t=t/100,n=n/100;const r=Math.floor(e),l=n*(1-t),c=n*(1-(e-r)*t),a=n*(1-(1-e+r)*t),s=r%6;return{r:d([n,c,l,l,a,n][s]*255),g:d([a,n,n,c,l,l][s]*255),b:d([l,l,a,n,n,c][s]*255),a:d(o,2)}},_e=e=>{const{r:t,g:n,b:o}=X(e);return`rgb(${t}, ${n}, ${o})`},P=e=>{const t=e.toString(16);return t.length<2?"0"+t:t},pe=({r:e,g:t,b:n})=>"#"+P(e)+P(t)+P(n),be=({r:e,g:t,b:n,a:o})=>{const r=Math.max(e,t,n),l=r-Math.min(e,t,n),c=l?r===e?(t-n)/l:r===t?2+(n-e)/l:4+(e-t)/l:0;return{h:d(60*(c<0?c+6:c)),s:d(r?l/r*100:0),v:d(r/255*100),a:o}},me=f("<div></div>",2),ye=e=>{const t=o=>{e.onChange({h:360*o.left})},n=o=>{e.onChange({h:w(e.hue+o.left*360,0,360)})};return(()=>{const o=me.cloneNode(!0);return p(o,h(W,{onMove:t,onKey:n,"aria-label":"Hue",get"aria-valuetext"(){return d(e.hue)},get children(){return h(F,{className:"react-colorful__hue-pointer",get left(){return e.hue/360},top:0,get color(){return Z({h:e.hue,s:100,v:100,a:1})}})}})),y(()=>o.className=R(["react-colorful__hue",e.className])),o})()},xe=f('<div class="react-colorful__saturation"></div>',2),$e=e=>{const t=o=>{e.onChange({s:o.left*100,v:100-o.top*100})},n=o=>{e.onChange({s:w(e.hsva.s+o.left*100,0,100),v:w(e.hsva.v-o.top*100,0,100)})};return(()=>{const o=xe.cloneNode(!0);return p(o,h(W,{onMove:t,onKey:n,"aria-label":"Color",get"aria-valuetext"(){return`Saturation ${d(e.hsva.s)}%, Brightness ${d(e.hsva.v)}%`},get children(){return h(F,{className:"react-colorful__saturation-pointer",get top(){return 1-e.hsva.v/100},get left(){return e.hsva.s/100},get color(){return Z(e.hsva)}})}})),y(()=>o.style.setProperty("background-color",_e({h:e.hsva.h,s:100,v:100,a:1}))),o})()},Y=(e,t)=>{if(e===t)return!0;for(const n in e)if(e[n]!==t[n])return!1;return!0},we=(e,t)=>e.toLowerCase()===t.toLowerCase()?!0:Y(T(e),T(t));function Ce(e){const[t,n]=B(e.colorModel.toHsva(e.color)),o=H({color:e.color,hsva:t()});return $(()=>{if(!e.colorModel.equal(e.color,o.current.color)){const l=e.colorModel.toHsva(e.color);o.current={hsva:l,color:e.color},n(l)}}),$(()=>{var l;let c;!Y(t(),o.current.hsva)&&!e.colorModel.equal(c=e.colorModel.fromHsva(t()),o.current.color)&&(o.current={hsva:t(),color:c},(l=e.onChange)==null||l.call(e,c))}),[t,l=>{n(c=>Object.assign({},c,l))}]}const ke=()=>{if(typeof __webpack_nonce__<"u")return __webpack_nonce__};var Me=`.react-colorful {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 200px;
  height: 200px;
  user-select: none;
  cursor: default;
}

.react-colorful__saturation {
  position: relative;
  flex-grow: 1;
  border-color: transparent; /* Fixes https://github.com/omgovich/react-colorful/issues/139 */
  border-bottom: 12px solid #000;
  border-radius: 8px 8px 0 0;
  background-image: linear-gradient(to top, #000, rgba(0, 0, 0, 0)),
    linear-gradient(to right, #fff, rgba(255, 255, 255, 0));
}

.react-colorful__pointer-fill,
.react-colorful__alpha-gradient {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  border-radius: inherit;
}

/* Improve elements rendering on light backgrounds */
.react-colorful__alpha-gradient,
.react-colorful__saturation {
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.05);
}

.react-colorful__hue,
.react-colorful__alpha {
  position: relative;
  height: 24px;
}

.react-colorful__hue {
  background: linear-gradient(
    to right,
    #f00 0%,
    #ff0 17%,
    #0f0 33%,
    #0ff 50%,
    #00f 67%,
    #f0f 83%,
    #f00 100%
  );
}

/* Round bottom corners of the last element: \`Hue\` for \`ColorPicker\` or \`Alpha\` for \`AlphaColorPicker\` */
.react-colorful__last-control {
  border-radius: 0 0 8px 8px;
}

.react-colorful__interactive {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  outline: none;
  /* Don't trigger the default scrolling behavior when the event is originating from this element */
  touch-action: none;
}

.react-colorful__pointer {
  position: absolute;
  z-index: 1;
  box-sizing: border-box;
  width: 28px;
  height: 28px;
  transform: translate(-50%, -50%);
  background-color: #fff;
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.react-colorful__interactive:focus .react-colorful__pointer {
  transform: translate(-50%, -50%) scale(1.1);
}

/* Chessboard-like pattern for alpha related elements */
.react-colorful__alpha,
.react-colorful__alpha-pointer {
  background-color: #fff;
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill-opacity=".05"><rect x="8" width="8" height="8"/><rect y="8" width="8" height="8"/></svg>');
}

/* Display the saturation pointer over the hue one */
.react-colorful__saturation-pointer {
  z-index: 3;
}

/* Display the hue pointer over the alpha one */
.react-colorful__hue-pointer {
  z-index: 2;
}
`;const j=new Map,Se=e=>{$(()=>{const t=e.current?e.current.ownerDocument:document;if(typeof t<"u"&&!j.has(t)){const n=t.createElement("style");n.innerHTML=Me,j.set(t,n);const o=ke();o&&n.setAttribute("nonce",o),t.head.appendChild(n)}})},He=f("<div></div>",2),Ne=e=>{const t=D({color:e.colorModel.defaultColor},e);let n=H();Se({current:n.current});const[o,r]=Ce(t),[l,c]=A(t,["color","colorModel","onChange","className"]);return $(()=>{console.log(o())}),(()=>{const a=He.cloneNode(!0);return(s=>n.current=s)(a),L(a,c,!1,!0),p(a,h($e,{get hsva(){return o()},onChange:r}),null),p(a,h(ye,{get hue(){return o().h},onChange:r,className:"react-colorful__last-control"}),null),y(()=>a.className=R(["react-colorful",t.className])),a})()},Pe={defaultColor:"000",toHsva:fe,fromHsva:ve,equal:we},Ie=e=>h(Ne,D(e,{colorModel:Pe}));f('<div><div class="react-colorful__alpha-gradient"></div></div>',4);f("<div></div>",2);f("<input>",1);E(["input"]);var Te=f('<div class="flex flex-col gap-3 px-5 pb-5"><div class="flex h-fit w-100 items-center gap-2"><div class="border-secondary-10 relative size-12 shrink-0 rounded-xl border-[6px] transition-transform hover:scale-105"></div><div class="relative flex-1"><input class="input bg-secondary-10/70 peer focus:bg-secondary-10 h-fit w-full text-sm transition-all duration-200"style="--border-w:0px;--padding-y:calc(var(--spacing) * 3.5);--padding-x:calc(var(--spacing) * 10) calc(var(--spacing) * 3);--bg-color:var(--color-secondary-10)"></div></div><div class="relative h-[280px] w-full rounded-xl hover:cursor-pointer"></div><div class="mx-auto flex w-full justify-center gap-2 rounded-xl"></div><div class="border-secondary-15 flex w-full justify-end gap-3 border-t border-dashed pt-5"><button type=button class="button primary"style=--w:100%>Save</button><button type=button class="button secondary"style=--w:100%>Cancel'),De=f('<div class="border-secondary-15 group relative size-9 shrink-0 cursor-pointer overflow-hidden rounded-lg border-[3px] transition-all hover:-translate-y-0.5 hover:scale-110"><div class="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"style="background:linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.15) 100%)">'),Le=f('<div class="absolute inset-0 rounded-[4px] border-2 border-white/20">');function Re({p:e}){const[t,n]=B(e.color),o=J(()=>JSON.parse(localStorage.getItem("color-picker-history")??JSON.stringify(Array(5).fill("#fff")))),r=()=>{e.setColor(t()),O.events.emit("color-picker",null);let s=o();const b=s.indexOf(t());b!==-1&&s.splice(b,1),s.unshift(t()),o().length>5&&s.pop(),localStorage.setItem("color-picker-history",JSON.stringify(s))},l=()=>{e.setColor(e.color),O.events.emit("color-picker",null)},c=s=>{n(s)},a=s=>{oe(s.currentTarget.value)&&n(s.currentTarget.value)};return h(ne,{Icon:se,title:"Color Picker",get children(){var s=Te(),b=s.firstChild,x=b.firstChild,m=x.nextSibling,i=m.firstChild,u=b.nextSibling,_=u.nextSibling,k=_.nextSibling,K=k.firstChild,G=K.nextSibling;return i.addEventListener("change",a),p(m,h(ae,{class:"text-secondary-30 peer-focus:text-secondary-90 absolute top-1/2 left-3 w-5 -translate-y-1/2 transition-colors"}),null),p(u,h(Ie,{get color(){return t()},onChange:c})),p(_,h(U,{get each(){return o()},children:v=>(()=>{var g=De();return g.firstChild,g.$$click=()=>c(v),S(g,"background",v),S(g,"box-shadow",`0 2px 8px ${v}30`),ee(g,"title",v),p(g,(()=>{var M=te(()=>t()===v);return()=>M()&&Le()})(),null),g})()})),K.$$click=r,G.$$click=l,y(v=>{var g=t(),M=`0 0 12px ${t()}40`;return g!==v.e&&S(x,"background",v.e=g),M!==v.t&&S(x,"box-shadow",v.t=M),v},{e:void 0,t:void 0}),y(()=>i.value=t()),s}})}E(["click"]);export{Re as default};
