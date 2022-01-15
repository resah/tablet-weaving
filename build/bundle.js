var app=function(){"use strict";function t(){}function e(t){return t()}function n(){return Object.create(null)}function o(t){t.forEach(e)}function r(t){return"function"==typeof t}function l(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function c(e,...n){if(null==e)return t;const o=e.subscribe(...n);return o.unsubscribe?()=>o.unsubscribe():o}function s(t,e,n){t.$$.on_destroy.push(c(e,n))}function i(t){return null==t?"":t}function u(t,e,n){return t.set(n),e}const f="undefined"!=typeof window;let a=f?()=>window.performance.now():()=>Date.now(),d=f?t=>requestAnimationFrame(t):t;const h=new Set;function g(t){h.forEach((e=>{e.c(t)||(h.delete(e),e.f())})),0!==h.size&&d(g)}function m(t,e){t.appendChild(e)}function p(t,e,n){t.insertBefore(e,n||null)}function k(t){t.parentNode.removeChild(t)}function $(t){return document.createElement(t)}function b(t){return document.createTextNode(t)}function v(){return b(" ")}function y(){return b("")}function w(t,e,n,o){return t.addEventListener(e,n,o),()=>t.removeEventListener(e,n,o)}function x(t){return function(e){return e.preventDefault(),t.call(this,e)}}function S(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function D(t,e){e=""+e,t.wholeText!==e&&(t.data=e)}function _(t,e){t.value=null==e?"":e}function A(t,e,n){t.classList[n?"add":"remove"](e)}let E;function M(t){E=t}function L(t){(function(){if(!E)throw new Error("Function called outside component initialization");return E})().$$.on_mount.push(t)}function T(t,e){const n=t.$$.callbacks[e.type];n&&n.slice().forEach((t=>t.call(this,e)))}const O=[],H=[],P=[],z=[],B=Promise.resolve();let C=!1;function I(t){P.push(t)}function j(t){z.push(t)}const N=new Set;let W=0;function J(){const t=E;do{for(;W<O.length;){const t=O[W];W++,M(t),R(t.$$)}for(M(null),O.length=0,W=0;H.length;)H.pop()();for(let t=0;t<P.length;t+=1){const e=P[t];N.has(e)||(N.add(e),e())}P.length=0}while(O.length);for(;z.length;)z.pop()();C=!1,N.clear(),M(t)}function R(t){if(null!==t.fragment){t.update(),o(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(I)}}const q=new Set;let F;function X(){F={r:0,c:[],p:F}}function Y(){F.r||o(F.c),F=F.p}function V(t,e){t&&t.i&&(q.delete(t),t.i(e))}function Z(t,e,n,o){if(t&&t.o){if(q.has(t))return;q.add(t),F.c.push((()=>{q.delete(t),o&&(n&&t.d(1),o())})),t.o(e)}}function G(t,e){t.d(1),e.delete(t.key)}function K(t,e){Z(t,1,1,(()=>{e.delete(t.key)}))}function Q(t,e,n,o,r,l,c,s,i,u,f,a){let d=t.length,h=l.length,g=d;const m={};for(;g--;)m[t[g].key]=g;const p=[],k=new Map,$=new Map;for(g=h;g--;){const t=a(r,l,g),s=n(t);let i=c.get(s);i?o&&i.p(t,e):(i=u(s,t),i.c()),k.set(s,p[g]=i),s in m&&$.set(s,Math.abs(g-m[s]))}const b=new Set,v=new Set;function y(t){V(t,1),t.m(s,f),c.set(t.key,t),f=t.first,h--}for(;d&&h;){const e=p[h-1],n=t[d-1],o=e.key,r=n.key;e===n?(f=e.first,d--,h--):k.has(r)?!c.has(o)||b.has(o)?y(e):v.has(r)?d--:$.get(o)>$.get(r)?(v.add(o),y(e)):(b.add(r),d--):(i(n,c),d--)}for(;d--;){const e=t[d];k.has(e.key)||i(e,c)}for(;h;)y(p[h-1]);return p}function U(t,e,n){const o=t.$$.props[e];void 0!==o&&(t.$$.bound[o]=n,n(t.$$.ctx[o]))}function tt(t){t&&t.c()}function et(t,n,l,c){const{fragment:s,on_mount:i,on_destroy:u,after_update:f}=t.$$;s&&s.m(n,l),c||I((()=>{const n=i.map(e).filter(r);u?u.push(...n):o(n),t.$$.on_mount=[]})),f.forEach(I)}function nt(t,e){const n=t.$$;null!==n.fragment&&(o(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function ot(t,e){-1===t.$$.dirty[0]&&(O.push(t),C||(C=!0,B.then(J)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function rt(e,r,l,c,s,i,u,f=[-1]){const a=E;M(e);const d=e.$$={fragment:null,ctx:null,props:i,update:t,not_equal:s,bound:n(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(r.context||(a?a.$$.context:[])),callbacks:n(),dirty:f,skip_bound:!1,root:r.target||a.$$.root};u&&u(d.root);let h=!1;if(d.ctx=l?l(e,r.props||{},((t,n,...o)=>{const r=o.length?o[0]:n;return d.ctx&&s(d.ctx[t],d.ctx[t]=r)&&(!d.skip_bound&&d.bound[t]&&d.bound[t](r),h&&ot(e,t)),n})):[],d.update(),h=!0,o(d.before_update),d.fragment=!!c&&c(d.ctx),r.target){if(r.hydrate){const t=function(t){return Array.from(t.childNodes)}(r.target);d.fragment&&d.fragment.l(t),t.forEach(k)}else d.fragment&&d.fragment.c();r.intro&&V(e.$$.fragment),et(e,r.target,r.anchor,r.customElement),J()}M(a)}class lt{$destroy(){nt(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}const ct=[];function st(e,n=t){let o;const r=new Set;function c(t){if(l(e,t)&&(e=t,o)){const t=!ct.length;for(const t of r)t[1](),ct.push(t,e);if(t){for(let t=0;t<ct.length;t+=2)ct[t][0](ct[t+1]);ct.length=0}}}return{set:c,update:function(t){c(t(e))},subscribe:function(l,s=t){const i=[l,s];return r.add(i),1===r.size&&(o=n(c)||t),l(e),()=>{r.delete(i),0===r.size&&(o(),o=null)}}}}function it(e,n,l){const s=!Array.isArray(e),i=s?[e]:e,u=n.length<2;return f=e=>{let l=!1;const f=[];let a=0,d=t;const h=()=>{if(a)return;d();const o=n(s?f[0]:f,e);u?e(o):d=r(o)?o:t},g=i.map(((t,e)=>c(t,(t=>{f[e]=t,a&=~(1<<e),l&&h()}),(()=>{a|=1<<e}))));return l=!0,h(),function(){o(g),d()}},{subscribe:st(l,f).subscribe};var f}const ut=localStorage.weaveRows?parseInt(localStorage.weaveRows):19,ft=localStorage.tablets?JSON.parse(localStorage.tablets):[{sDirection:!0,threads:[{color:"#204a87"},{color:"#204a87"},{color:"#204a87"},{color:"#204a87"}]},{sDirection:!0,threads:[{color:"#ffffff"},{color:"#d3d7cf"},{color:"#ffffff"},{color:"#ffffff"}]},{sDirection:!0,threads:[{color:"#ffffff"},{color:"#d3d7cf"},{color:"#ffffff"},{color:"#ffffff"}]},{sDirection:!0,threads:[{color:"#204a87"},{color:"#204a87"},{color:"#204a87"},{color:"#204a87"}]}],at=localStorage.rotationDirections?JSON.parse(localStorage.rotationDirections):{},dt=st(!1),ht=st(ut),gt=st(ft),mt=st(at);ht.subscribe((t=>localStorage.weaveRows=t)),gt.subscribe((t=>localStorage.tablets=JSON.stringify(t))),mt.subscribe((t=>localStorage.rotationDirections=JSON.stringify(t))),it([dt,ht,gt,mt],(([t,e,n,o])=>{if(!t)return null;const r=[...Array(e).keys()].reduce(((t,e,r)=>[...Array(n.length).keys()].reduce(((t,e,n)=>`${t}${void 0!==o[r]&&void 0!==o[r][n]&&!0===o[r][n]?"1":"0"}`),t)),""),l=n.reduce(((t,e)=>`${t}|${e.sDirection?"1":"0"}`+e.threads.reduce(((t,e)=>`${t}${e.color}`),"")),"");return`${n.length}:${e}:${r}:${l}`})).subscribe((t=>{t&&(window.location.hash="#"+btoa(t))}));const pt=it([ht,gt,mt],(([t,e,n])=>e.map(((e,o)=>$t(t,n,e,o,0,e.sDirection))))),kt=it([ht,gt,mt],(([t,e,n])=>e.map(((e,o)=>$t(t,n,e,o,2,!e.sDirection)))));function $t(t,e,n,o,r,l){const c=n.threads,s=c.length;let i=!1;return{weaves:[...Array(t).keys()].map((t=>{let n=1,u=l;const f=void 0!==e[t]&&void 0!==e[t][o]&&!0===e[t][o];f&&(u=!l,n=-1),i!=f&&(n=0),r=(r+n+c.length)%s;const a=c[r].color;return i=f,{color:a,sDirection:u}}))}}var bt={$:t=>"string"==typeof t?document.querySelector(t):t,extend:(...t)=>Object.assign(...t),cumulativeOffset(t){let e=0,n=0;do{e+=t.offsetTop||0,n+=t.offsetLeft||0,t=t.offsetParent}while(t);return{top:e,left:n}},directScroll:t=>t&&t!==document&&t!==document.body,scrollTop(t,e){let n=void 0!==e;return this.directScroll(t)?n?t.scrollTop=e:t.scrollTop:n?document.documentElement.scrollTop=document.body.scrollTop=e:window.pageYOffset||document.documentElement.scrollTop||document.body.scrollTop||0},scrollLeft(t,e){let n=void 0!==e;return this.directScroll(t)?n?t.scrollLeft=e:t.scrollLeft:n?document.documentElement.scrollLeft=document.body.scrollLeft=e:window.pageXOffset||document.documentElement.scrollLeft||document.body.scrollLeft||0}};const vt={container:"body",duration:500,delay:0,offset:0,easing:function(t){return t<.5?4*t*t*t:.5*Math.pow(2*t-2,3)+1},onStart:t,onDone:t,onAborting:t,scrollX:!1,scrollY:!0},yt=t=>{let{offset:e,duration:n,delay:o,easing:r,x:l=0,y:c=0,scrollX:s,scrollY:i,onStart:u,onDone:f,container:m,onAborting:p,element:k}=t;"function"==typeof e&&(e=e());var $=bt.cumulativeOffset(m),b=k?bt.cumulativeOffset(k):{top:c,left:l},v=bt.scrollLeft(m),y=bt.scrollTop(m),w=b.left-$.left+e,x=b.top-$.top+e,S=w-v,D=x-y;let _=!0,A=!1,E=a()+o,M=E+n;function L(t){t||(A=!0,u(k,{x:l,y:c}))}function T(t){!function(t,e,n){s&&bt.scrollLeft(t,n),i&&bt.scrollTop(t,e)}(m,y+D*t,v+S*t)}function O(){_=!1}return function(t){let e;0===h.size&&d(g),new Promise((n=>{h.add(e={c:t,f:n})}))}((t=>{if(!A&&t>=E&&L(!1),A&&t>=M&&(T(1),O(),f(k,{x:l,y:c})),!_)return p(k,{x:l,y:c}),!1;if(A){T(0+1*r((t-E)/n))}return!0})),L(o),T(0),O},wt=t=>{if(t&&t!==document&&t!==document.body)return t.scrollHeight-t.offsetHeight;{let t=document.body,e=document.documentElement;return Math.max(t.scrollHeight,t.offsetHeight,e.clientHeight,e.scrollHeight,e.offsetHeight)}},xt=t=>(t=(t=>{let e=bt.extend({},vt,t);return e.container=bt.$(e.container),e.element=bt.$(e.element),e})(t),yt(bt.extend(t,{element:null,y:wt(t.container)})));function St(e){let n,r,l,c,s;return{c(){n=$("div"),r=$("input"),S(r,"type","color"),S(r,"class","svelte-58hukb"),S(n,"class","thread svelte-58hukb"),S(n,"style",l=`background-color: ${e[0].color}`),S(n,"uk-tooltip","Farbe wählen")},m(t,o){p(t,n,o),m(n,r),_(r,e[0].color),c||(s=[w(r,"input",e[2]),w(r,"click",e[1])],c=!0)},p(t,[e]){1&e&&_(r,t[0].color),1&e&&l!==(l=`background-color: ${t[0].color}`)&&S(n,"style",l)},i:t,o:t,d(t){t&&k(n),c=!1,o(s)}}}function Dt(t,e,n){let{config:o}=e;return t.$$set=t=>{"config"in t&&n(0,o=t.config)},[o,function(e){T.call(this,t,e)},function(){o.color=this.value,n(0,o)}]}class _t extends lt{constructor(t){super(),rt(this,t,Dt,St,l,{config:0})}}function At(t,e,n){const o=t.slice();return o[4]=e[n],o[5]=e,o[1]=n,o}function Et(t,e){let n,o,r,l;function c(t){e[3](t,e[4],e[5],e[1])}let s={};return void 0!==e[4]&&(s.config=e[4]),o=new _t({props:s}),H.push((()=>U(o,"config",c))),{key:t,first:null,c(){n=y(),tt(o.$$.fragment),this.first=n},m(t,e){p(t,n,e),et(o,t,e),l=!0},p(t,n){e=t;const l={};!r&&1&n&&(r=!0,l.config=e[4],j((()=>r=!1))),o.$set(l)},i(t){l||(V(o.$$.fragment,t),l=!0)},o(t){Z(o.$$.fragment,t),l=!1},d(t){t&&k(n),nt(o,t)}}}function Mt(t){let e;return{c(){e=b("Z")},m(t,n){p(t,e,n)},d(t){t&&k(e)}}}function Lt(t){let e;return{c(){e=b("S")},m(t,n){p(t,e,n)},d(t){t&&k(e)}}}function Tt(t){let e,n,o,r,l,c,s,i,u,f,a,d=t[1]+1+"",h=[],g=new Map,y=t[0].threads;const x=t=>t[1];for(let e=0;e<y.length;e+=1){let n=At(t,y,e),o=x(n);g.set(o,h[e]=Et(o,n))}function _(t,e){return t[0].sDirection?Lt:Mt}let A=_(t),E=A(t);return{c(){e=$("div"),n=$("div"),o=b(d),l=v();for(let t=0;t<h.length;t+=1)h[t].c();c=v(),s=$("div"),i=$("button"),E.c(),S(n,"class","tabletIndex uk-text-center svelte-cxbxxh"),S(n,"uk-tooltip",r="Brettchen #"+(t[1]+1)),S(i,"uk-tooltip","Schärung umkehren"),S(i,"class","svelte-cxbxxh"),S(s,"class","threadDirection svelte-cxbxxh"),S(e,"class","tablet svelte-cxbxxh")},m(r,d){p(r,e,d),m(e,n),m(n,o),m(e,l);for(let t=0;t<h.length;t+=1)h[t].m(e,null);m(e,c),m(e,s),m(s,i),E.m(i,null),u=!0,f||(a=w(i,"click",t[2]),f=!0)},p(t,[l]){(!u||2&l)&&d!==(d=t[1]+1+"")&&D(o,d),(!u||2&l&&r!==(r="Brettchen #"+(t[1]+1)))&&S(n,"uk-tooltip",r),1&l&&(y=t[0].threads,X(),h=Q(h,l,x,1,t,y,g,e,K,Et,c,At),Y()),A!==(A=_(t))&&(E.d(1),E=A(t),E&&(E.c(),E.m(i,null)))},i(t){if(!u){for(let t=0;t<y.length;t+=1)V(h[t]);u=!0}},o(t){for(let t=0;t<h.length;t+=1)Z(h[t]);u=!1},d(t){t&&k(e);for(let t=0;t<h.length;t+=1)h[t].d();E.d(),f=!1,a()}}}function Ot(t,e,n){let{index:o}=e,{config:r}=e;return t.$$set=t=>{"index"in t&&n(1,o=t.index),"config"in t&&n(0,r=t.config)},[r,o,function(){n(0,r.sDirection=!r.sDirection,r)},function(t,e,o,l){o[l]=t,n(0,r)}]}class Ht extends lt{constructor(t){super(),rt(this,t,Ot,Tt,l,{index:1,config:0})}}function Pt(e){let n,o;return{c(){n=$("div"),S(n,"class","weave svelte-1wgfpnj"),S(n,"style",o=`background-color: ${e[0].color}`),A(n,"sDirection",e[0].sDirection)},m(t,e){p(t,n,e)},p(t,[e]){1&e&&o!==(o=`background-color: ${t[0].color}`)&&S(n,"style",o),1&e&&A(n,"sDirection",t[0].sDirection)},i:t,o:t,d(t){t&&k(n)}}}function zt(t,e,n){let{weave:o}=e;return t.$$set=t=>{"weave"in t&&n(0,o=t.weave)},[o]}class Bt extends lt{constructor(t){super(),rt(this,t,zt,Pt,l,{weave:0})}}function Ct(t,e,n){const o=t.slice();return o[1]=e[n],o[3]=n,o}function It(t,e){let n,o,r;return o=new Bt({props:{weave:e[1]}}),{key:t,first:null,c(){n=y(),tt(o.$$.fragment),this.first=n},m(t,e){p(t,n,e),et(o,t,e),r=!0},p(t,n){e=t;const r={};1&n&&(r.weave=e[1]),o.$set(r)},i(t){r||(V(o.$$.fragment,t),r=!0)},o(t){Z(o.$$.fragment,t),r=!1},d(t){t&&k(n),nt(o,t)}}}function jt(t){let e,n,o=[],r=new Map,l=t[0].weaves;const c=t=>t[3];for(let e=0;e<l.length;e+=1){let n=Ct(t,l,e),s=c(n);r.set(s,o[e]=It(s,n))}return{c(){e=$("div");for(let t=0;t<o.length;t+=1)o[t].c();S(e,"class","tablet svelte-2njjc7")},m(t,r){p(t,e,r);for(let t=0;t<o.length;t+=1)o[t].m(e,null);n=!0},p(t,[n]){1&n&&(l=t[0].weaves,X(),o=Q(o,n,c,1,t,l,r,e,K,It,null,Ct),Y())},i(t){if(!n){for(let t=0;t<l.length;t+=1)V(o[t]);n=!0}},o(t){for(let t=0;t<o.length;t+=1)Z(o[t]);n=!1},d(t){t&&k(e);for(let t=0;t<o.length;t+=1)o[t].d()}}}function Nt(t,e,n){let{config:o}=e;return t.$$set=t=>{"config"in t&&n(0,o=t.config)},[o]}class Wt extends lt{constructor(t){super(),rt(this,t,Nt,jt,l,{config:0})}}function Jt(t,e,n){const o=t.slice();return o[2]=e[n],o[4]=n,o}function Rt(t,e,n){const o=t.slice();return o[5]=e[n],o[4]=n,o}function qt(t,e){let n,o,r,l=e[4]+1+"";return{key:t,first:null,c(){n=$("div"),o=b(l),r=v(),S(n,"class","tabletWeaveIndex svelte-8y67uc"),this.first=n},m(t,e){p(t,n,e),m(n,o),m(n,r)},p(t,n){e=t,2&n&&l!==(l=e[4]+1+"")&&D(o,l)},d(t){t&&k(n)}}}function Ft(t,e){let n,o,r;return o=new Wt({props:{config:e[2]}}),{key:t,first:null,c(){n=y(),tt(o.$$.fragment),this.first=n},m(t,e){p(t,n,e),et(o,t,e),r=!0},p(t,n){e=t;const r={};1&n&&(r.config=e[2]),o.$set(r)},i(t){r||(V(o.$$.fragment,t),r=!0)},o(t){Z(o.$$.fragment,t),r=!1},d(t){t&&k(n),nt(o,t)}}}function Xt(t){let e,n,o,r,l=[],c=new Map,s=[],i=new Map,u=[...Array(t[1]).keys()];const f=t=>t[4];for(let e=0;e<u.length;e+=1){let n=Rt(t,u,e),o=f(n);c.set(o,l[e]=qt(o,n))}let a=t[0];const d=t=>t[4];for(let e=0;e<a.length;e+=1){let n=Jt(t,a,e),o=d(n);i.set(o,s[e]=Ft(o,n))}return{c(){e=$("div"),n=$("div");for(let t=0;t<l.length;t+=1)l[t].c();o=v();for(let t=0;t<s.length;t+=1)s[t].c();S(n,"class","tabletWeaveIndices uk-text-small svelte-8y67uc"),S(e,"class","uk-flex uk-flex-center")},m(t,c){p(t,e,c),m(e,n);for(let t=0;t<l.length;t+=1)l[t].m(n,null);m(e,o);for(let t=0;t<s.length;t+=1)s[t].m(e,null);r=!0},p(t,[o]){2&o&&(u=[...Array(t[1]).keys()],l=Q(l,o,f,1,t,u,c,n,G,qt,null,Rt)),1&o&&(a=t[0],X(),s=Q(s,o,d,1,t,a,i,e,K,Ft,null,Jt),Y())},i(t){if(!r){for(let t=0;t<a.length;t+=1)V(s[t]);r=!0}},o(t){for(let t=0;t<s.length;t+=1)Z(s[t]);r=!1},d(t){t&&k(e);for(let t=0;t<l.length;t+=1)l[t].d();for(let t=0;t<s.length;t+=1)s[t].d()}}}function Yt(t,e,n){let o;s(t,ht,(t=>n(1,o=t)));let{weavePattern:r}=e;return t.$$set=t=>{"weavePattern"in t&&n(0,r=t.weavePattern)},[r,o]}class Vt extends lt{constructor(t){super(),rt(this,t,Yt,Xt,l,{weavePattern:0})}}function Zt(t,e,n){const o=t.slice();return o[8]=e[n],o[10]=n,o}function Gt(t,e,n){const o=t.slice();return o[11]=e[n],o[13]=n,o}function Kt(t,e,n){const o=t.slice();return o[11]=e[n],o[13]=n,o}function Qt(t,e){let n,o,r=e[13]+1+"";return{key:t,first:null,c(){n=$("th"),o=b(r),S(n,"class","svelte-1li4wus"),this.first=n},m(t,e){p(t,n,e),m(n,o)},p(t,n){e=t,2&n&&r!==(r=e[13]+1+"")&&D(o,r)},d(t){t&&k(n)}}}function Ut(t,e){let n,o,r,l,c;function s(){return e[7](e[10],e[13])}return{key:t,first:null,c(){n=$("td"),o=$("a"),S(o,"class","cellLink svelte-1li4wus"),S(o,"uk-tooltip","Drehrichtung für Brettchen umkehren"),S(n,"class",r=i(e[0](e[10],e[13])?"active":"")+" svelte-1li4wus"),this.first=n},m(t,e){p(t,n,e),m(n,o),l||(c=w(o,"click",s),l=!0)},p(t,o){e=t,7&o&&r!==(r=i(e[0](e[10],e[13])?"active":"")+" svelte-1li4wus")&&S(n,"class",r)},d(t){t&&k(n),l=!1,c()}}}function te(t,e){let n,o,r,l,c,s,i,u,f=e[10]+1+"",a=[],d=new Map;function h(){return e[6](e[10])}let g=e[1];const y=t=>t[13];for(let t=0;t<g.length;t+=1){let n=Gt(e,g,t),o=y(n);d.set(o,a[t]=Ut(o,n))}return{key:t,first:null,c(){n=$("tr"),o=$("th"),r=$("a"),l=b(f),c=v();for(let t=0;t<a.length;t+=1)a[t].c();s=v(),S(r,"uk-tooltip","Drehrichtung für alle Brettchen umkehren"),S(o,"class","uk-text-right svelte-1li4wus"),this.first=n},m(t,e){p(t,n,e),m(n,o),m(o,r),m(r,l),m(n,c);for(let t=0;t<a.length;t+=1)a[t].m(n,null);m(n,s),i||(u=w(r,"click",h),i=!0)},p(t,o){e=t,4&o&&f!==(f=e[10]+1+"")&&D(l,f),23&o&&(g=e[1],a=Q(a,o,y,1,e,g,d,n,G,Ut,s,Gt))},d(t){t&&k(n);for(let t=0;t<a.length;t+=1)a[t].d();i=!1,u()}}}function ee(e){let n,o,r,l,c,s,i=[],u=new Map,f=[],a=new Map,d=e[1];const h=t=>t[13];for(let t=0;t<d.length;t+=1){let n=Kt(e,d,t),o=h(n);u.set(o,i[t]=Qt(o,n))}let g=[...Array(e[2]).keys()];const b=t=>t[10];for(let t=0;t<g.length;t+=1){let n=Zt(e,g,t),o=b(n);a.set(o,f[t]=te(o,n))}return{c(){n=$("div"),o=$("table"),r=$("tr"),l=$("th"),c=v();for(let t=0;t<i.length;t+=1)i[t].c();s=v();for(let t=0;t<f.length;t+=1)f[t].c();S(l,"class","svelte-1li4wus"),S(o,"class","svelte-1li4wus"),S(n,"class","uk-flex uk-flex-center")},m(t,e){p(t,n,e),m(n,o),m(o,r),m(r,l),m(r,c);for(let t=0;t<i.length;t+=1)i[t].m(r,null);m(o,s);for(let t=0;t<f.length;t+=1)f[t].m(o,null)},p(t,[e]){2&e&&(d=t[1],i=Q(i,e,h,1,t,d,u,r,G,Qt,null,Kt)),31&e&&(g=[...Array(t[2]).keys()],f=Q(f,e,b,1,t,g,a,o,G,te,null,Zt))},i:t,o:t,d(t){t&&k(n);for(let t=0;t<i.length;t+=1)i[t].d();for(let t=0;t<f.length;t+=1)f[t].d()}}}function ne(t,e,n){let o,r,l,c;function i(t){l.forEach(((e,n)=>{f(t,n)}))}function f(t,e){void 0===r[t]&&u(mt,r[t]={},r),r[t][e]?(delete r[t][e],mt.set(r)):u(mt,r[t][e]=!0,r)}s(t,mt,(t=>n(5,r=t))),s(t,gt,(t=>n(1,l=t))),s(t,ht,(t=>n(2,c=t)));return t.$$.update=()=>{32&t.$$.dirty&&n(0,o=(t,e)=>void 0!==r[t]&&void 0!==r[t][e]&&!0===r[t][e])},[o,l,c,i,f,r,t=>i(t),(t,e)=>f(t,e)]}class oe extends lt{constructor(t){super(),rt(this,t,ne,ee,l,{})}}function re(t,e,n){const o=t.slice();return o[9]=e[n],o[10]=e,o[11]=n,o}function le(t,e,n){const o=t.slice();return o[12]=e[n],o[11]=n,o}function ce(t,e){let n,o,r,l=String.fromCharCode(65+e[11])+"";return{key:t,first:null,c(){n=$("div"),o=b(l),r=v(),S(n,"class","holeIndex svelte-14wzfy"),this.first=n},m(t,e){p(t,n,e),m(n,o),m(n,r)},p(t,n){e=t,1&n&&l!==(l=String.fromCharCode(65+e[11])+"")&&D(o,l)},d(t){t&&k(n)}}}function se(t,e){let n,o,r,l;function c(t){e[7](t,e[9],e[10],e[11])}let s={index:e[11]};return void 0!==e[9]&&(s.config=e[9]),o=new Ht({props:s}),H.push((()=>U(o,"config",c))),{key:t,first:null,c(){n=y(),tt(o.$$.fragment),this.first=n},m(t,e){p(t,n,e),et(o,t,e),l=!0},p(t,n){e=t;const l={};1&n&&(l.index=e[11]),!r&&1&n&&(r=!0,l.config=e[9],j((()=>r=!1))),o.$set(l)},i(t){l||(V(o.$$.fragment,t),l=!0)},o(t){Z(o.$$.fragment,t),l=!1},d(t){t&&k(n),nt(o,t)}}}function ie(t){let e,n,r,l,c,s,i,u,f,a,d,h,g,b,y,D,_,A,E,M,L,T,O,H,P,z,B,C,I,j,N,W,J,R,q,F,U,ot,rt,lt,ct,st,it,ut,ft,at,dt,ht,gt,mt,pt=[],kt=new Map,$t=[],bt=new Map,vt=t[0][0].threads;const yt=t=>t[11];for(let e=0;e<vt.length;e+=1){let n=le(t,vt,e),o=yt(n);kt.set(o,pt[e]=ce(o,n))}let wt=t[0];const xt=t=>t[11];for(let e=0;e<wt.length;e+=1){let n=re(t,wt,e),o=xt(n);bt.set(o,$t[e]=se(o,n))}return W=new oe({}),q=new Vt({props:{weavePattern:t[1]}}),ot=new Vt({props:{weavePattern:t[2]}}),{c(){e=$("main"),n=$("div"),r=$("div"),l=$("h2"),l.textContent="Schärbrief",c=v(),s=$("div"),i=$("div"),i.innerHTML='<img src="assets/tablet-4-holes.svg" alt="Tablet hole index description: A = top front; B - bottom front; C - bottom back; D - top back"/>',u=v(),f=$("div"),a=$("div"),d=$("div"),h=$("div"),g=v();for(let t=0;t<pt.length;t+=1)pt[t].c();b=v();for(let t=0;t<$t.length;t+=1)$t[t].c();y=v(),D=$("div"),_=$("button"),A=$("br"),E=v(),M=$("button"),L=v(),T=$("div"),O=$("div"),H=$("div"),P=$("div"),P.innerHTML="<h3>Webbrief</h3>",z=v(),B=$("div"),B.innerHTML="<h3>Vorderseite</h3>",C=v(),I=$("div"),I.innerHTML="<h3>Rückseite</h3>",j=v(),N=$("div"),tt(W.$$.fragment),J=v(),R=$("div"),tt(q.$$.fragment),F=v(),U=$("div"),tt(ot.$$.fragment),rt=v(),lt=$("div"),ct=v(),st=$("div"),it=$("button"),ut=v(),ft=$("button"),at=v(),dt=$("div"),S(i,"class","uk-text-center"),S(h,"class","holeIndex svelte-14wzfy"),S(d,"class","holes svelte-14wzfy"),S(a,"class","uk-flex uk-flex-center"),S(f,"class","uk-width-2-3 uk-text-center"),S(_,"class","uk-icon-button uk-button-secondary uk-button-large uk-width-small uk-margin-small-bottom "),S(_,"uk-icon","plus"),S(_,"uk-tooltip","Brettchen hinzufügen"),S(M,"class","uk-icon-button uk-button-secondary uk-button-large uk-width-small"),S(M,"uk-icon","minus"),S(M,"uk-tooltip","Brettchen entfernen"),S(D,"class","uk-text-center"),S(s,"class","uk-grid-column-small uk-grid-row-large uk-child-width-1-6 uk-flex-center uk-flex-middle"),S(s,"uk-grid",""),S(r,"class","uk-container uk-container-small uk-container-expand"),S(n,"class","uk-section uk-section-xsmall uk-section-muted"),S(P,"class","uk-first-column uk-text-center"),S(B,"class","uk-text-center uk-margin-small-bottom"),S(I,"class","uk-text-center"),S(N,"class","uk-first-column uk-text-small"),S(R,"class","uk-margin-medium-top"),S(U,"class","uk-margin-medium-top"),S(lt,"class","uk-first-column"),S(it,"class","uk-icon-button uk-button-secondary uk-button-large uk-width-small uk-margin-small-bottom"),S(it,"uk-icon","plus"),S(it,"uk-tooltip","Webreihe hinzufügen"),S(ft,"class","uk-icon-button uk-button-secondary uk-button-large uk-width-small uk-margin-small-bottom"),S(ft,"uk-icon","minus"),S(ft,"uk-tooltip","Webreihe entfernen"),S(st,"class","uk-margin-medium-top uk-text-center"),S(H,"class","uk-grid-column-small uk-grid-row-small uk-child-width-1-3 uk-flex-center uk-flex-top"),S(H,"uk-grid",""),S(O,"class","uk-container uk-container-small uk-container-expand"),S(T,"class","uk-section uk-section-xsmall")},m(o,k){p(o,e,k),m(e,n),m(n,r),m(r,l),m(r,c),m(r,s),m(s,i),m(s,u),m(s,f),m(f,a),m(a,d),m(d,h),m(d,g);for(let t=0;t<pt.length;t+=1)pt[t].m(d,null);m(a,b);for(let t=0;t<$t.length;t+=1)$t[t].m(a,null);m(s,y),m(s,D),m(D,_),m(D,A),m(D,E),m(D,M),m(e,L),m(e,T),m(T,O),m(O,H),m(H,P),m(H,z),m(H,B),m(H,C),m(H,I),m(H,j),m(H,N),et(W,N,null),m(H,J),m(H,R),et(q,R,null),m(H,F),m(H,U),et(ot,U,null),m(H,rt),m(H,lt),m(H,ct),m(H,st),m(st,it),m(st,ut),m(st,ft),m(H,at),m(H,dt),ht=!0,gt||(mt=[w(_,"click",x(t[3])),w(M,"click",x(t[4])),w(it,"click",x(t[5])),w(ft,"click",x(t[6]))],gt=!0)},p(t,[e]){1&e&&(vt=t[0][0].threads,pt=Q(pt,e,yt,1,t,vt,kt,d,G,ce,null,le)),1&e&&(wt=t[0],X(),$t=Q($t,e,xt,1,t,wt,bt,a,K,se,null,re),Y());const n={};2&e&&(n.weavePattern=t[1]),q.$set(n);const o={};4&e&&(o.weavePattern=t[2]),ot.$set(o)},i(t){if(!ht){for(let t=0;t<wt.length;t+=1)V($t[t]);V(W.$$.fragment,t),V(q.$$.fragment,t),V(ot.$$.fragment,t),ht=!0}},o(t){for(let t=0;t<$t.length;t+=1)Z($t[t]);Z(W.$$.fragment,t),Z(q.$$.fragment,t),Z(ot.$$.fragment,t),ht=!1},d(t){t&&k(e);for(let t=0;t<pt.length;t+=1)pt[t].d();for(let t=0;t<$t.length;t+=1)$t[t].d();nt(W),nt(q),nt(ot),gt=!1,o(mt)}}}function ue(t,e,n){let o,r,l,c;return s(t,ht,(t=>n(8,o=t))),s(t,gt,(t=>n(0,r=t))),s(t,pt,(t=>n(1,l=t))),s(t,kt,(t=>n(2,c=t))),L((()=>{!function(){const t=atob(window.location.hash.substring(1)).split(":");if(4!==t.length)return void dt.set(!0);const e=parseInt(t[0]),n=parseInt(t[1]),o={};[...Array(n).keys()].forEach((n=>{[...Array(e).keys()].forEach((r=>{void 0===o[n]&&(o[n]={}),o[n][r]="1"===t[2][n*e+r]}))}));const r=t[3].substring(1).split("|").map((t=>({sDirection:"1"===t[0],threads:t.substring(2).split("#").map((t=>({color:`#${t}`})))})));ht.set(n),mt.set(o),gt.set(r),dt.set(!0)}()})),[r,l,c,function(t){gt.update((t=>{const e=t[t.length-1],n={sDirection:e.sDirection,threads:e.threads.map((t=>({color:t.color})))};return t.push(n),t}))},function(t){r.length>1&&r.length<26&&gt.update((t=>(t.pop(),t)))},function(t){u(ht,o+=1,o),xt()},function(t){u(ht,o-=1,o)},function(t,e,n,o){n[o]=t,gt.set(r)}]}return new class extends lt{constructor(t){super(),rt(this,t,ue,ie,l,{})}}({target:document.body})}();
//# sourceMappingURL=bundle.js.map
