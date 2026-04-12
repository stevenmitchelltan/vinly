import{r as l,j as t,a as O}from"./index-DHaGBkbi.js";let ie={data:""},oe=e=>{if(typeof window=="object"){let s=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return s.nonce=window.__nonce__,s.parentNode||(e||document.head).appendChild(s),s.firstChild}return e||ie},ne=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,le=/\/\*[^]*?\*\/|  +/g,G=/\n+/g,A=(e,s)=>{let r="",i="",o="";for(let n in e){let a=e[n];n[0]=="@"?n[1]=="i"?r=n+" "+a+";":i+=n[1]=="f"?A(a,n):n+"{"+A(a,n[1]=="k"?"":s)+"}":typeof a=="object"?i+=A(a,s?s.replace(/([^,])+/g,d=>n.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,c=>/&/.test(c)?c.replace(/&/g,d):d?d+" "+c:c)):n):a!=null&&(n=/^--/.test(n)?n:n.replace(/[A-Z]/g,"-$&").toLowerCase(),o+=A.p?A.p(n,a):n+":"+a+";")}return r+(s&&o?s+"{"+o+"}":o)+i},D={},K=e=>{if(typeof e=="object"){let s="";for(let r in e)s+=r+K(e[r]);return s}return e},de=(e,s,r,i,o)=>{let n=K(e),a=D[n]||(D[n]=(c=>{let p=0,g=11;for(;p<c.length;)g=101*g+c.charCodeAt(p++)>>>0;return"go"+g})(n));if(!D[a]){let c=n!==e?e:(p=>{let g,m,x=[{}];for(;g=ne.exec(p.replace(le,""));)g[4]?x.shift():g[3]?(m=g[3].replace(G," ").trim(),x.unshift(x[0][m]=x[0][m]||{})):x[0][g[1]]=g[2].replace(G," ").trim();return x[0]})(e);D[a]=A(o?{["@keyframes "+a]:c}:c,r?"":"."+a)}let d=r&&D.g?D.g:null;return r&&(D.g=D[a]),((c,p,g,m)=>{m?p.data=p.data.replace(m,c):p.data.indexOf(c)===-1&&(p.data=g?c+p.data:p.data+c)})(D[a],s,i,d),a},ce=(e,s,r)=>e.reduce((i,o,n)=>{let a=s[n];if(a&&a.call){let d=a(r),c=d&&d.props&&d.props.className||/^go/.test(d)&&d;a=c?"."+c:d&&typeof d=="object"?d.props?"":A(d,""):d===!1?"":d}return i+o+(a??"")},"");function Q(e){let s=this||{},r=e.call?e(s.p):e;return de(r.unshift?r.raw?ce(r,[].slice.call(arguments,1),s.p):r.reduce((i,o)=>Object.assign(i,o&&o.call?o(s.p):o),{}):r,oe(s.target),s.g,s.o,s.k)}let X,V,Y;Q.bind({g:1});let I=Q.bind({k:1});function ue(e,s,r,i){A.p=s,X=e,V=r,Y=i}function $(e,s){let r=this||{};return function(){let i=arguments;function o(n,a){let d=Object.assign({},n),c=d.className||o.className;r.p=Object.assign({theme:V&&V()},d),r.o=/ *go\d+/.test(c),d.className=Q.apply(r,i)+(c?" "+c:"");let p=e;return e[0]&&(p=d.as||e,delete d.as),Y&&p[0]&&Y(d),X(p,d)}return s?s(o):o}}var me=e=>typeof e=="function",q=(e,s)=>me(e)?e(s):e,pe=(()=>{let e=0;return()=>(++e).toString()})(),ee=(()=>{let e;return()=>{if(e===void 0&&typeof window<"u"){let s=matchMedia("(prefers-reduced-motion: reduce)");e=!s||s.matches}return e}})(),ge=20,Z="default",te=(e,s)=>{let{toastLimit:r}=e.settings;switch(s.type){case 0:return{...e,toasts:[s.toast,...e.toasts].slice(0,r)};case 1:return{...e,toasts:e.toasts.map(a=>a.id===s.toast.id?{...a,...s.toast}:a)};case 2:let{toast:i}=s;return te(e,{type:e.toasts.find(a=>a.id===i.id)?1:0,toast:i});case 3:let{toastId:o}=s;return{...e,toasts:e.toasts.map(a=>a.id===o||o===void 0?{...a,dismissed:!0,visible:!1}:a)};case 4:return s.toastId===void 0?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(a=>a.id!==s.toastId)};case 5:return{...e,pausedAt:s.time};case 6:let n=s.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(a=>({...a,pauseDuration:a.pauseDuration+n}))}}},U=[],se={toasts:[],pausedAt:void 0,settings:{toastLimit:ge}},_={},re=(e,s=Z)=>{_[s]=te(_[s]||se,e),U.forEach(([r,i])=>{r===s&&i(_[s])})},ae=e=>Object.keys(_).forEach(s=>re(e,s)),xe=e=>Object.keys(_).find(s=>_[s].toasts.some(r=>r.id===e)),B=(e=Z)=>s=>{re(s,e)},fe={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},be=(e={},s=Z)=>{let[r,i]=l.useState(_[s]||se),o=l.useRef(_[s]);l.useEffect(()=>(o.current!==_[s]&&i(_[s]),U.push([s,i]),()=>{let a=U.findIndex(([d])=>d===s);a>-1&&U.splice(a,1)}),[s]);let n=r.toasts.map(a=>{var d,c,p;return{...e,...e[a.type],...a,removeDelay:a.removeDelay||((d=e[a.type])==null?void 0:d.removeDelay)||(e==null?void 0:e.removeDelay),duration:a.duration||((c=e[a.type])==null?void 0:c.duration)||(e==null?void 0:e.duration)||fe[a.type],style:{...e.style,...(p=e[a.type])==null?void 0:p.style,...a.style}}});return{...r,toasts:n}},ye=(e,s="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:s,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(r==null?void 0:r.id)||pe()}),z=e=>(s,r)=>{let i=ye(s,e,r);return B(i.toasterId||xe(i.id))({type:2,toast:i}),i.id},h=(e,s)=>z("blank")(e,s);h.error=z("error");h.success=z("success");h.loading=z("loading");h.custom=z("custom");h.dismiss=(e,s)=>{let r={type:3,toastId:e};s?B(s)(r):ae(r)};h.dismissAll=e=>h.dismiss(void 0,e);h.remove=(e,s)=>{let r={type:4,toastId:e};s?B(s)(r):ae(r)};h.removeAll=e=>h.remove(void 0,e);h.promise=(e,s,r)=>{let i=h.loading(s.loading,{...r,...r==null?void 0:r.loading});return typeof e=="function"&&(e=e()),e.then(o=>{let n=s.success?q(s.success,o):void 0;return n?h.success(n,{id:i,...r,...r==null?void 0:r.success}):h.dismiss(i),o}).catch(o=>{let n=s.error?q(s.error,o):void 0;n?h.error(n,{id:i,...r,...r==null?void 0:r.error}):h.dismiss(i)}),e};var he=1e3,ve=(e,s="default")=>{let{toasts:r,pausedAt:i}=be(e,s),o=l.useRef(new Map).current,n=l.useCallback((m,x=he)=>{if(o.has(m))return;let y=setTimeout(()=>{o.delete(m),a({type:4,toastId:m})},x);o.set(m,y)},[]);l.useEffect(()=>{if(i)return;let m=Date.now(),x=r.map(y=>{if(y.duration===1/0)return;let S=(y.duration||0)+y.pauseDuration-(m-y.createdAt);if(S<0){y.visible&&h.dismiss(y.id);return}return setTimeout(()=>h.dismiss(y.id,s),S)});return()=>{x.forEach(y=>y&&clearTimeout(y))}},[r,i,s]);let a=l.useCallback(B(s),[s]),d=l.useCallback(()=>{a({type:5,time:Date.now()})},[a]),c=l.useCallback((m,x)=>{a({type:1,toast:{id:m,height:x}})},[a]),p=l.useCallback(()=>{i&&a({type:6,time:Date.now()})},[i,a]),g=l.useCallback((m,x)=>{let{reverseOrder:y=!1,gutter:S=8,defaultPosition:T}=x||{},C=r.filter(v=>(v.position||T)===(m.position||T)&&v.height),W=C.findIndex(v=>v.id===m.id),L=C.filter((v,P)=>P<W&&v.visible).length;return C.filter(v=>v.visible).slice(...y?[L+1]:[0,L]).reduce((v,P)=>v+(P.height||0)+S,0)},[r]);return l.useEffect(()=>{r.forEach(m=>{if(m.dismissed)n(m.id,m.removeDelay);else{let x=o.get(m.id);x&&(clearTimeout(x),o.delete(m.id))}})},[r,n]),{toasts:r,handlers:{updateHeight:c,startPause:d,endPause:p,calculateOffset:g}}},je=I`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,we=I`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,Ne=I`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,ke=$("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${je} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${we} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${Ne} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,Se=I`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,Ce=$("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${Se} 1s linear infinite;
`,Ee=I`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,_e=I`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,De=$("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${Ee} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${_e} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,Ie=$("div")`
  position: absolute;
`,Ae=$("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,$e=I`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,Te=$("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${$e} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,Le=({toast:e})=>{let{icon:s,type:r,iconTheme:i}=e;return s!==void 0?typeof s=="string"?l.createElement(Te,null,s):s:r==="blank"?null:l.createElement(Ae,null,l.createElement(Ce,{...i}),r!=="loading"&&l.createElement(Ie,null,r==="error"?l.createElement(ke,{...i}):l.createElement(De,{...i})))},Pe=e=>`
0% {transform: translate3d(0,${e*-200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,We=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${e*-150}%,-1px) scale(.6); opacity:0;}
`,Oe="0%{opacity:0;} 100%{opacity:1;}",Re="0%{opacity:1;} 100%{opacity:0;}",Fe=$("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,ze=$("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,Me=(e,s)=>{let r=e.includes("top")?1:-1,[i,o]=ee()?[Oe,Re]:[Pe(r),We(r)];return{animation:s?`${I(i)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${I(o)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}},He=l.memo(({toast:e,position:s,style:r,children:i})=>{let o=e.height?Me(e.position||s||"top-center",e.visible):{opacity:0},n=l.createElement(Le,{toast:e}),a=l.createElement(ze,{...e.ariaProps},q(e.message,e));return l.createElement(Fe,{className:e.className,style:{...o,...r,...e.style}},typeof i=="function"?i({icon:n,message:a}):l.createElement(l.Fragment,null,n,a))});ue(l.createElement);var Ue=({id:e,className:s,style:r,onHeightUpdate:i,children:o})=>{let n=l.useCallback(a=>{if(a){let d=()=>{let c=a.getBoundingClientRect().height;i(e,c)};d(),new MutationObserver(d).observe(a,{subtree:!0,childList:!0,characterData:!0})}},[e,i]);return l.createElement("div",{ref:n,className:s,style:r},o)},qe=(e,s)=>{let r=e.includes("top"),i=r?{top:0}:{bottom:0},o=e.includes("center")?{justifyContent:"center"}:e.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:ee()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${s*(r?1:-1)}px)`,...i,...o}},Qe=Q`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,H=16,Be=({reverseOrder:e,position:s="top-center",toastOptions:r,gutter:i,children:o,toasterId:n,containerStyle:a,containerClassName:d})=>{let{toasts:c,handlers:p}=ve(r,n);return l.createElement("div",{"data-rht-toaster":n||"",style:{position:"fixed",zIndex:9999,top:H,left:H,right:H,bottom:H,pointerEvents:"none",...a},className:d,onMouseEnter:p.startPause,onMouseLeave:p.endPause},c.map(g=>{let m=g.position||s,x=p.calculateOffset(g,{reverseOrder:e,gutter:i,defaultPosition:s}),y=qe(m,x);return l.createElement(Ue,{id:g.id,key:g.id,onHeightUpdate:p.updateHeight,className:g.visible?Qe:"",style:y},g.type==="custom"?q(g.message,g):o?o(g):l.createElement(He,{toast:g,position:m}))}))},k=h;const Je=({wine:e,onSave:s,onClose:r,onDelete:i})=>{const[o,n]=l.useState({name:"",supermarket:"",wine_type:"",rating:"",description:"",image_urls:[],post_url:"",influencer_source:""}),[a,d]=l.useState(""),[c,p]=l.useState(null),[g,m]=l.useState(!1);l.useEffect(()=>{e&&n({name:e.name||"",supermarket:e.supermarket||"",wine_type:e.wine_type||"",rating:e.rating||"",description:e.description||"",image_urls:e.image_urls||[],post_url:e.post_url||"",influencer_source:e.influencer_source||""})},[e]);const x=f=>{const{name:b,value:j}=f.target;n(E=>({...E,[b]:j}))},y=()=>{a.trim()&&(n(f=>({...f,image_urls:[...f.image_urls,a.trim()]})),d(""))},S=f=>{n(b=>({...b,image_urls:b.image_urls.filter((j,E)=>E!==f)}))},T=(f,b)=>{p(b),f.dataTransfer.effectAllowed="move"},C=(f,b)=>{if(f.preventDefault(),c===null||c===b)return;const j=[...o.image_urls],E=j[c];j.splice(c,1),j.splice(b,0,E),n(u=>({...u,image_urls:j})),p(b)},W=()=>{p(null)},L=async f=>{f.preventDefault(),m(!0);try{await s(e.id,o),r()}catch(b){console.error("Error saving wine:",b),k.error("Failed to save wine: "+b.message,{duration:1/0})}finally{m(!1)}},v=async()=>{if(window.confirm(`Are you sure you want to delete "${e.name}"? This cannot be undone.`))try{await i(e.id),r()}catch(f){console.error("Error deleting wine:",f),k.error("Failed to delete wine: "+f.message,{duration:1/0})}},P=async()=>{var j,E;const f="2",b=window.prompt("Suffix for duplicate (e.g., 2)",f);if(b!==null)try{await O.duplicateWine(e.id,b||f),k.success("Wine duplicated successfully",{duration:3e3}),r()}catch(u){k.error("Failed to duplicate wine: "+(((E=(j=u.response)==null?void 0:j.data)==null?void 0:E.detail)||u.message),{duration:5e3})}};return e?t.jsx("div",{className:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4",children:t.jsxs("div",{className:"bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto",children:[t.jsxs("div",{className:"sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center",children:[t.jsx("h2",{className:"text-2xl font-bold text-gray-900",children:"Edit Wine"}),t.jsxs("div",{className:"flex items-center gap-3",children:[t.jsx("button",{type:"button",onClick:P,className:"px-3 py-1.5 text-sm bg-amber-100 text-amber-800 rounded hover:bg-amber-200 transition-colors",children:"Duplicate as new"}),t.jsx("button",{onClick:r,className:"text-gray-400 hover:text-gray-600 text-2xl","aria-label":"Close",children:"×"})]})]}),t.jsxs("form",{onSubmit:L,className:"p-6 space-y-6",children:[t.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[t.jsxs("div",{children:[t.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Wine Name *"}),t.jsx("input",{type:"text",name:"name",value:o.name,onChange:x,required:!0,className:"w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500"})]}),t.jsxs("div",{children:[t.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Supermarket *"}),t.jsxs("select",{name:"supermarket",value:o.supermarket,onChange:x,required:!0,className:"w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500",children:[t.jsx("option",{value:"",children:"Select..."}),t.jsx("option",{value:"Albert Heijn",children:"Albert Heijn"}),t.jsx("option",{value:"Dirk",children:"Dirk"}),t.jsx("option",{value:"HEMA",children:"HEMA"}),t.jsx("option",{value:"LIDL",children:"LIDL"}),t.jsx("option",{value:"Jumbo",children:"Jumbo"}),t.jsx("option",{value:"ALDI",children:"ALDI"}),t.jsx("option",{value:"Plus",children:"Plus"}),t.jsx("option",{value:"Sligro",children:"Sligro"})]})]}),t.jsxs("div",{children:[t.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Wine Type *"}),t.jsxs("select",{name:"wine_type",value:o.wine_type,onChange:x,required:!0,className:"w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500",children:[t.jsx("option",{value:"",children:"Select..."}),t.jsx("option",{value:"red",children:"Red"}),t.jsx("option",{value:"white",children:"White"}),t.jsx("option",{value:"rose",children:"Rosé"}),t.jsx("option",{value:"sparkling",children:"Sparkling"})]})]}),t.jsxs("div",{children:[t.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Influencer Source"}),t.jsx("input",{type:"text",name:"influencer_source",value:o.influencer_source,onChange:x,className:"w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500"})]})]}),t.jsxs("div",{children:[t.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Rating / Quote"}),t.jsx("input",{type:"text",name:"rating",value:o.rating,onChange:x,placeholder:"e.g., Voor deze val ik wel te paaien",className:"w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500"})]}),t.jsxs("div",{children:[t.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Description"}),t.jsx("textarea",{name:"description",value:o.description,onChange:x,rows:3,className:"w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500"})]}),t.jsxs("div",{children:[t.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Post URL"}),t.jsx("input",{type:"url",name:"post_url",value:o.post_url,onChange:x,className:"w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500"})]}),t.jsxs("div",{children:[t.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Images (drag to reorder)"}),t.jsx("div",{className:"grid grid-cols-2 md:grid-cols-3 gap-3 mb-3",children:o.image_urls.map((f,b)=>t.jsxs("div",{draggable:!0,onDragStart:j=>T(j,b),onDragOver:j=>C(j,b),onDragEnd:W,className:"relative group cursor-move border-2 border-gray-200 rounded-lg overflow-hidden hover:border-burgundy-400 transition-colors",style:{aspectRatio:"4/5"},children:[t.jsx("img",{src:f,alt:`Wine ${b+1}`,className:"w-full h-full object-cover"}),t.jsx("button",{type:"button",onClick:()=>S(b),className:"absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity","aria-label":"Remove image",children:"×"}),t.jsx("div",{className:"absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1.5 py-0.5 rounded",children:b+1})]},b))}),t.jsxs("div",{className:"flex gap-2",children:[t.jsx("input",{type:"url",value:a,onChange:f=>d(f.target.value),placeholder:"Paste Cloudinary image URL...",className:"flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500"}),t.jsx("button",{type:"button",onClick:y,className:"px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors",children:"Add"})]}),t.jsx("p",{className:"mt-1 text-xs text-gray-500",children:"Cloudinary URLs look like: https://res.cloudinary.com/.../image.jpg"})]}),t.jsxs("div",{className:"flex justify-between items-center pt-4 border-t",children:[t.jsx("button",{type:"button",onClick:v,className:"px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors",children:"Delete Wine"}),t.jsxs("div",{className:"flex gap-3",children:[t.jsx("button",{type:"button",onClick:r,className:"px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors",children:"Cancel"}),t.jsx("button",{type:"submit",disabled:g,className:"px-6 py-2 bg-burgundy-600 text-white rounded-md hover:bg-burgundy-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",children:g?"Saving...":"Save Changes"})]})]})]})]})}):null},Ze=()=>{const[e,s]=l.useState([]),[r,i]=l.useState([]),[o,n]=l.useState(!0),[a,d]=l.useState(""),[c,p]=l.useState(null),[g,m]=l.useState(!1),[x,y]=l.useState(""),[S,T]=l.useState(""),[C,W]=l.useState(!1),[L,v]=l.useState("");l.useEffect(()=>{localStorage.getItem("admin_token")&&(m(!0),f())},[]),l.useEffect(()=>{if(a.trim()){const u=a.toLowerCase();i(e.filter(w=>w.name.toLowerCase().includes(u)||w.supermarket.toLowerCase().includes(u)||w.influencer_source.toLowerCase().includes(u)))}else i(e)},[a,e]);const P=u=>{u.preventDefault(),O.setToken(x),m(!0),f()},f=async()=>{var u,w;try{n(!0);const N=await O.getAllWines();s(N),i(N)}catch(N){console.error("Failed to load wines:",N),((u=N.response)==null?void 0:u.status)===401||((w=N.response)==null?void 0:w.status)===403?(m(!1),k.error("Invalid credentials. Please log in again.")):k.error("Failed to load wines: "+N.message)}finally{n(!1)}},b=async(u,w)=>{try{await O.updateWine(u,w),await f(),k.success("Wine updated successfully!",{duration:3e3})}catch(N){throw N}},j=async u=>{try{await O.deleteWine(u),await f(),k.success("Wine deleted successfully!",{duration:3e3})}catch(w){throw w}},E=async u=>{var w,N;if(u.preventDefault(),!!S.trim())try{W(!0),v("📥 Downloading video...");const R=O.addTikTokPost(S);[{delay:3e3,message:"🎤 Transcribing audio with Whisper..."},{delay:8e3,message:"🤖 Extracting wine data with AI..."},{delay:12e3,message:"🔍 Finding optimal frame times..."},{delay:15e3,message:"📸 Extracting frames from video..."},{delay:2e4,message:"☁️ Uploading images to Cloudinary..."},{delay:25e3,message:"💾 Saving to database..."}].forEach(({delay:J,message:M})=>{setTimeout(()=>{C&&v(M)},J)});const F=await R;if(v(""),T(""),await f(),F.wines_added>0){const J=F.wines.map(M=>`${M.name} (${M.supermarket})`).join(", ");k.success(`Added ${F.wines_added} wine${F.wines_added>1?"s":""}: ${J}`,{duration:5e3})}else F.status==="no_wines"?k.error("No wines found in this video. Check backend logs for LLM reasoning.",{duration:1/0}):k("Wine already exists in database",{icon:"ℹ️",duration:4e3})}catch(R){console.error("Failed to add TikTok post:",R),k.error(`Failed: ${((N=(w=R.response)==null?void 0:w.data)==null?void 0:N.detail)||R.message}`,{duration:1/0})}finally{W(!1),v("")}};return g?t.jsxs("div",{className:"min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-burgundy-50 p-4",children:[t.jsxs("div",{className:"max-w-7xl mx-auto",children:[t.jsxs("div",{className:"bg-white rounded-lg shadow-md p-6 mb-6",children:[t.jsxs("div",{className:"flex justify-between items-center mb-4",children:[t.jsx("h1",{className:"text-3xl font-fraunces font-bold text-gray-900",children:"Wine Admin Panel"}),t.jsx("button",{onClick:()=>{localStorage.removeItem("admin_token"),m(!1)},className:"text-sm text-gray-600 hover:text-gray-900",children:"Logout"})]}),t.jsxs("div",{className:"bg-amber-50 border border-amber-200 rounded-md p-4",children:[t.jsxs("p",{className:"text-sm text-amber-800",children:[t.jsx("strong",{children:"📝 Remember:"})," After making changes, run ",t.jsx("code",{className:"bg-amber-100 px-2 py-1 rounded",children:".\\scripts\\deploy.ps1"})," to deploy to GitHub Pages."]}),t.jsx("p",{className:"text-xs text-amber-700 mt-2",children:"The deploy script will export wines, build, verify, and push automatically."})]})]}),t.jsxs("div",{className:"bg-white rounded-lg shadow-md p-6 mb-6",children:[t.jsx("h2",{className:"text-xl font-bold text-gray-900 mb-4",children:"Add TikTok Post"}),t.jsxs("form",{onSubmit:E,className:"space-y-3",children:[t.jsxs("div",{className:"flex gap-3",children:[t.jsx("input",{type:"url",value:S,onChange:u=>T(u.target.value),placeholder:"https://www.tiktok.com/@user/video/...",disabled:C,required:!0,className:"flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500 disabled:bg-gray-100"}),t.jsx("button",{type:"submit",disabled:C,className:"px-6 py-2 bg-burgundy-600 text-white rounded-md hover:bg-burgundy-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap",children:C?"Processing...":"Add Post"})]}),L&&t.jsxs("div",{className:"bg-blue-50 border border-blue-200 rounded-md p-4",children:[t.jsxs("div",{className:"flex items-center gap-3",children:[t.jsx("div",{className:"animate-spin rounded-full h-5 w-5 border-2 border-burgundy-600 border-t-transparent"}),t.jsx("p",{className:"text-sm text-blue-800 font-medium",children:L})]}),t.jsx("p",{className:"text-xs text-blue-600 mt-2",children:"This typically takes 30-90 seconds..."})]})]})]}),t.jsxs("div",{className:"bg-white rounded-lg shadow-md p-6",children:[t.jsxs("div",{className:"flex justify-between items-center mb-4",children:[t.jsxs("h2",{className:"text-xl font-bold text-gray-900",children:["Wines (",r.length,")"]}),t.jsx("button",{onClick:f,className:"text-sm text-burgundy-600 hover:text-burgundy-800",children:"Refresh"})]}),t.jsx("div",{className:"mb-4",children:t.jsx("input",{type:"text",value:a,onChange:u=>d(u.target.value),placeholder:"Search wines by name, supermarket, or influencer...",className:"w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500"})}),o?t.jsx("div",{className:"text-center py-8 text-gray-500",children:"Loading wines..."}):r.length===0?t.jsx("div",{className:"text-center py-8 text-gray-500",children:"No wines found"}):t.jsx("div",{className:"overflow-x-auto",children:t.jsxs("table",{className:"w-full",children:[t.jsx("thead",{className:"bg-gray-50 border-b",children:t.jsxs("tr",{children:[t.jsx("th",{className:"px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase",children:"Image"}),t.jsx("th",{className:"px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase",children:"Name"}),t.jsx("th",{className:"px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase",children:"Supermarket"}),t.jsx("th",{className:"px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase",children:"Type"}),t.jsx("th",{className:"px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase",children:"Influencer"}),t.jsx("th",{className:"px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase",children:"Actions"})]})}),t.jsx("tbody",{className:"divide-y divide-gray-200",children:r.map(u=>{var w;return t.jsxs("tr",{className:"hover:bg-gray-50",children:[t.jsx("td",{className:"px-4 py-3",children:((w=u.image_urls)==null?void 0:w[0])&&t.jsx("img",{src:u.image_urls[0],alt:u.name,className:"w-12 h-12 object-cover rounded"})}),t.jsx("td",{className:"px-4 py-3 text-sm text-gray-900",children:u.name}),t.jsx("td",{className:"px-4 py-3 text-sm text-gray-600",children:u.supermarket}),t.jsx("td",{className:"px-4 py-3 text-sm text-gray-600 capitalize",children:u.wine_type}),t.jsx("td",{className:"px-4 py-3 text-sm text-gray-600",children:u.influencer_source}),t.jsx("td",{className:"px-4 py-3",children:t.jsx("button",{onClick:()=>p(u),className:"text-sm text-burgundy-600 hover:text-burgundy-800 font-medium",children:"Edit"})})]},u.id)})})]})})]})]}),c&&t.jsx(Je,{wine:c,onSave:b,onDelete:j,onClose:()=>p(null)}),t.jsx(Be,{position:"top-right",toastOptions:{duration:4e3,style:{background:"#fff",color:"#1f2937",padding:"12px 16px",borderRadius:"8px",boxShadow:"0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"},success:{iconTheme:{primary:"#7c2d12",secondary:"#fff"},style:{border:"1px solid #86efac",background:"#f0fdf4"}},error:{iconTheme:{primary:"#dc2626",secondary:"#fff"},style:{border:"1px solid #fca5a5",background:"#fef2f2"}},loading:{iconTheme:{primary:"#7c2d12",secondary:"#fff"}}}})]}):t.jsx("div",{className:"min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-burgundy-50 flex items-center justify-center p-4",children:t.jsxs("div",{className:"bg-white rounded-lg shadow-xl p-8 max-w-md w-full",children:[t.jsx("h1",{className:"text-3xl font-fraunces font-bold text-gray-900 mb-6",children:"Admin Login"}),t.jsxs("form",{onSubmit:P,className:"space-y-4",children:[t.jsxs("div",{children:[t.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Password"}),t.jsx("input",{type:"password",value:x,onChange:u=>y(u.target.value),required:!0,className:"w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500",placeholder:"Enter admin password"})]}),t.jsx("button",{type:"submit",className:"w-full px-4 py-2 bg-burgundy-600 text-white rounded-md hover:bg-burgundy-700 transition-colors",children:"Login"})]}),t.jsxs("p",{className:"mt-4 text-sm text-gray-500",children:["Default password: ",t.jsx("code",{className:"bg-gray-100 px-2 py-1 rounded",children:"admin"})]})]})})};export{Ze as default};
