var app=function(){"use strict";function t(){}function M(t){return t()}function e(){return Object.create(null)}function n(t){t.forEach(M)}function o(t){return"function"==typeof t}function w(t,M){return t!=t?M==M:t!==M||t&&"object"==typeof t||"function"==typeof t}function l(M,...e){if(null==M)return t;const n=M.subscribe(...e);return n.unsubscribe?()=>n.unsubscribe():n}function r(t,M,e){t.$$.on_destroy.push(l(M,e))}function D(t){return null==t?"":t}function c(t,M,e){return t.set(e),M}const A="undefined"!=typeof window;let s=A?()=>window.performance.now():()=>Date.now(),i=A?t=>requestAnimationFrame(t):t;const u=new Set;function a(t){u.forEach((M=>{M.c(t)||(u.delete(M),M.f())})),0!==u.size&&i(a)}function f(t,M){t.appendChild(M)}function x(t,M,e){t.insertBefore(M,e||null)}function m(t){t.parentNode.removeChild(t)}function T(t){return document.createElement(t)}function d(t){return document.createTextNode(t)}function E(){return d(" ")}function h(){return d("")}function g(t,M,e,n){return t.addEventListener(M,e,n),()=>t.removeEventListener(M,e,n)}function Z(t){return function(M){return M.preventDefault(),t.call(this,M)}}function N(t,M,e){null==e?t.removeAttribute(M):t.getAttribute(M)!==e&&t.setAttribute(M,e)}function j(t,M){M=""+M,t.wholeText!==M&&(t.data=M)}function k(t,M){t.value=null==M?"":M}function p(t,M,e){t.classList[e?"add":"remove"](M)}let v;function $(t){v=t}function Y(t){(function(){if(!v)throw new Error("Function called outside component initialization");return v})().$$.on_mount.push(t)}function y(t,M){const e=t.$$.callbacks[M.type];e&&e.slice().forEach((t=>t.call(this,M)))}const b=[],I=[],z=[],S=[],C=Promise.resolve();let O=!1;function U(t){z.push(t)}function Q(t){S.push(t)}const R=new Set;let _=0;function B(){const t=v;do{for(;_<b.length;){const t=b[_];_++,$(t),H(t.$$)}for($(null),b.length=0,_=0;I.length;)I.pop()();for(let t=0;t<z.length;t+=1){const M=z[t];R.has(M)||(R.add(M),M())}z.length=0}while(b.length);for(;S.length;)S.pop()();O=!1,R.clear(),$(t)}function H(t){if(null!==t.fragment){t.update(),n(t.before_update);const M=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,M),t.after_update.forEach(U)}}const L=new Set;let G;function W(){G={r:0,c:[],p:G}}function J(){G.r||n(G.c),G=G.p}function P(t,M){t&&t.i&&(L.delete(t),t.i(M))}function V(t,M,e,n){if(t&&t.o){if(L.has(t))return;L.add(t),G.c.push((()=>{L.delete(t),n&&(e&&t.d(1),n())})),t.o(M)}}function X(t,M){t.d(1),M.delete(t.key)}function F(t,M){V(t,1,1,(()=>{M.delete(t.key)}))}function q(t,M,e,n,o,w,l,r,D,c,A,s){let i=t.length,u=w.length,a=i;const f={};for(;a--;)f[t[a].key]=a;const x=[],m=new Map,T=new Map;for(a=u;a--;){const t=s(o,w,a),r=e(t);let D=l.get(r);D?n&&D.p(t,M):(D=c(r,t),D.c()),m.set(r,x[a]=D),r in f&&T.set(r,Math.abs(a-f[r]))}const d=new Set,E=new Set;function h(t){P(t,1),t.m(r,A),l.set(t.key,t),A=t.first,u--}for(;i&&u;){const M=x[u-1],e=t[i-1],n=M.key,o=e.key;M===e?(A=M.first,i--,u--):m.has(o)?!l.has(n)||d.has(n)?h(M):E.has(o)?i--:T.get(n)>T.get(o)?(E.add(n),h(M)):(d.add(o),i--):(D(e,l),i--)}for(;i--;){const M=t[i];m.has(M.key)||D(M,l)}for(;u;)h(x[u-1]);return x}function K(t,M,e){const n=t.$$.props[M];void 0!==n&&(t.$$.bound[n]=e,e(t.$$.ctx[n]))}function tt(t){t&&t.c()}function Mt(t,e,w,l){const{fragment:r,on_mount:D,on_destroy:c,after_update:A}=t.$$;r&&r.m(e,w),l||U((()=>{const e=D.map(M).filter(o);c?c.push(...e):n(e),t.$$.on_mount=[]})),A.forEach(U)}function et(t,M){const e=t.$$;null!==e.fragment&&(n(e.on_destroy),e.fragment&&e.fragment.d(M),e.on_destroy=e.fragment=null,e.ctx=[])}function nt(t,M){-1===t.$$.dirty[0]&&(b.push(t),O||(O=!0,C.then(B)),t.$$.dirty.fill(0)),t.$$.dirty[M/31|0]|=1<<M%31}function ot(M,o,w,l,r,D,c,A=[-1]){const s=v;$(M);const i=M.$$={fragment:null,ctx:null,props:D,update:t,not_equal:r,bound:e(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(o.context||(s?s.$$.context:[])),callbacks:e(),dirty:A,skip_bound:!1,root:o.target||s.$$.root};c&&c(i.root);let u=!1;if(i.ctx=w?w(M,o.props||{},((t,e,...n)=>{const o=n.length?n[0]:e;return i.ctx&&r(i.ctx[t],i.ctx[t]=o)&&(!i.skip_bound&&i.bound[t]&&i.bound[t](o),u&&nt(M,t)),e})):[],i.update(),u=!0,n(i.before_update),i.fragment=!!l&&l(i.ctx),o.target){if(o.hydrate){const t=function(t){return Array.from(t.childNodes)}(o.target);i.fragment&&i.fragment.l(t),t.forEach(m)}else i.fragment&&i.fragment.c();o.intro&&P(M.$$.fragment),Mt(M,o.target,o.anchor,o.customElement),B()}$(s)}class wt{$destroy(){et(this,1),this.$destroy=t}$on(t,M){const e=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return e.push(M),()=>{const t=e.indexOf(M);-1!==t&&e.splice(t,1)}}$set(t){var M;this.$$set&&(M=t,0!==Object.keys(M).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}const lt=[];function rt(t,M){return{subscribe:Dt(t,M).subscribe}}function Dt(M,e=t){let n;const o=new Set;function l(t){if(w(M,t)&&(M=t,n)){const t=!lt.length;for(const t of o)t[1](),lt.push(t,M);if(t){for(let t=0;t<lt.length;t+=2)lt[t][0](lt[t+1]);lt.length=0}}}return{set:l,update:function(t){l(t(M))},subscribe:function(w,r=t){const D=[w,r];return o.add(D),1===o.size&&(n=e(l)||t),w(M),()=>{o.delete(D),0===o.size&&(n(),n=null)}}}}function ct(M,e,w){const r=!Array.isArray(M),D=r?[M]:M,c=e.length<2;return rt(w,(M=>{let w=!1;const A=[];let s=0,i=t;const u=()=>{if(s)return;i();const n=e(r?A[0]:A,M);c?M(n):i=o(n)?n:t},a=D.map(((t,M)=>l(t,(t=>{A[M]=t,s&=~(1<<M),w&&u()}),(()=>{s|=1<<M}))));return w=!0,u(),function(){n(a),i()}}))}const At=rt([{name:"Oseberg",hash:"MTA6MTk6MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDp8MSM4ZjU5MDIjOGY1OTAyIzhmNTkwMiM4ZjU5MDJ8MCNjMTdkMTEjYzE3ZDExI2MxN2QxMSNjMTdkMTF8MCNmZmZmYjcjZmZmZmI3I2ZmZmZiNyNmZmZmYjd8MSNjYzAwMDAjZmZmZmI3I2NjMDAwMCNjYzAwMDB8MSNmZmZmYjcjY2MwMDAwI2ZmZmZiNyNjYzAwMDB8MSNjYzAwMDAjZmZmZmI3I2NjMDAwMCNmZmZmYjd8MSNjYzAwMDAjY2MwMDAwI2ZmZmZiNyNjYzAwMDB8MCNmZmZmYjcjZmZmZmI3I2ZmZmZiNyNmZmZmYjd8MCNjMTdkMTEjYzE3ZDExI2MxN2QxMSNjMTdkMTF8MSM4ZjU5MDIjOGY1OTAyIzhmNTkwMiM4ZjU5MDI="},{name:"Widderhorn",hash:"MTQ6MTk6MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMTExMDAxMTEwMDAwMDAxMTEwMDExMTAwMDAwMDExMTAwMTExMDAwMDAwMTExMDAxMTEwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDExMTAwMTExMDAwMDAwMTExMDAxMTEwMDAwMDAxMTEwMDExMTAwMDAwMDExMTAwMTExMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDA6fDEjMmUzNDM2IzJlMzQzNiMyZTM0MzYjMmUzNDM2fDAjMmUzNDM2IzJlMzQzNiMyZTM0MzYjMmUzNDM2fDEjZTBmOGZmI2UwZjhmZiNlMGY4ZmYjZTBmOGZmfDAjZTBmOGZmI2UwZjhmZiNmMGZjZmYjMmUzNDM2fDAjZjBmY2ZmI2YwZmNmZiMyZTM0MzYjMzQ2NWE0fDAjZmZmZmZmIzJlMzQzNiMzNDY1YTQjMmUzNDM2fDAjMmUzNDM2IzM0NjVhNCMyZTM0MzYjZmZmZmZmfDAjMzQ2NWE0IzJlMzQzNiNmZmZmZmYjMmUzNDM2fDEjMzQ2NWE0IzJlMzQzNiNmZmZmZmYjMmUzNDM2fDEjMjA0YTg3IzM0NjVhNCMyZTM0MzYjZmZmZmZmfDEjMjMxZDYyIzIwNGE4NyMyMDRhODcjMmUzNDM2fDEjMjMxZDYyIzIzMWQ2MiMyMzFkNjIjMjMxZDYyfDEjMmUzNDM2IzJlMzQzNiMyZTM0MzYjMmUzNDM2fDAjMmUzNDM2IzJlMzQzNiMyZTM0MzYjMmUzNDM2"},{name:"Drachenköpfe",hash:"MjA6MjQ6MDAwMDAwMTEwMDAwMDAxMTAwMDAwMDAwMDAxMTAwMDAwMDExMDAwMDAwMDAxMTExMTEwMDAwMDAwMDAwMDAwMDExMTExMTAwMDAwMDAwMDAwMDAwMTEwMDExMTExMTAwMDAwMDAwMDAxMTAwMTExMTExMDAwMDAwMDAwMDAwMTExMTExMDAxMTAwMDAwMDAwMDAxMTExMTEwMDExMDAwMDAwMDAwMDAwMDAxMTExMTEwMDAwMDAwMDAwMDAwMDExMTExMTAwMDAwMDAwMTEwMDAwMDAxMTAwMDAwMDAwMDAxMTAwMDAwMDExMDAwMDAwMDAwMDAwMTEwMDAwMDAxMTAwMDAwMDAwMDAxMTAwMDAwMDExMDAwMDAwMDAxMTExMTEwMDAwMDAwMDAwMDAwMDExMTExMTAwMDAwMDAwMDAwMDAwMTEwMDExMTExMTAwMDAwMDAwMDAxMTAwMTExMTExMDAwMDAwMDAwMDAwMTExMTExMDAxMTAwMDAwMDAwMDAxMTExMTEwMDExMDAwMDAwMDAwMDAwMDAxMTExMTEwMDAwMDAwMDAwMDAwMDExMTExMTAwMDAwMDAwMTEwMDAwMDAxMTAwMDAwMDAwMDAxMTAwMDAwMDExMDAwMDAwOnwwI2E0MDAwMCNhNDAwMDAjYTQwMDAwI2E0MDAwMHwxI2VmMjkyOSNmNTc5MDAjZmNhZjNlI2ZmZDU5MXwwI2VmMjkyOSNmNTc5MDAjZmNhZjNlI2ZmZDU5MXwxI2E0MDAwMCNhNDAwMDAjYTQwMDAwI2E0MDAwMHwxI2NjMDAwMCNmY2U5NGYjY2MwMDAwI2ZjZTk0ZnwxI2ZjZTk0ZiNjYzAwMDAjZmNlOTRmI2VmMjkyOXwxI2NjMDAwMCNmY2U5NGYjY2MwMDAwI2ZjZTk0ZnwxI2ZjZTk0ZiNjYzAwMDAjZmNlOTRmI2NjMDAwMHwxI2NjMDAwMCNmY2U5NGYjY2MwMDAwI2ZjZTk0ZnwxI2ZjZTk0ZiNjYzAwMDAjZmNlOTRmI2NjMDAwMHwxI2NjMDAwMCNmY2U5NGYjY2MwMDAwI2ZjZTk0ZnwxI2ZjZTk0ZiNjYzAwMDAjZmNlOTRmI2NjMDAwMHwxI2NjMDAwMCNmY2U5NGYjY2MwMDAwI2ZjZTk0ZnwxI2ZjZTk0ZiNjYzAwMDAjZmNlOTRmI2NjMDAwMHwxI2NjMDAwMCNmY2U5NGYjZWYyOTI5I2ZjZTk0ZnwxI2ZjZTk0ZiNjYzAwMDAjZmNlOTRmI2NjMDAwMHwwI2E0MDAwMCNhNDAwMDAjYTQwMDAwI2E0MDAwMHwxI2VmMjkyOSNmNTc5MDAjZmNhZjNlI2ZmZDU5MXwwI2VmMjkyOSNmNTc5MDAjZmNhZjNlI2ZmZDU5MXwxI2E0MDAwMCNhNDAwMDAjYTQwMDAwI2E0MDAwMA=="},{name:"Sulawesi",hash:"MjA6Njg6MDAwMTEwMDAwMTEwMDAwMTEwMDAwMDEwMDExMTExMTExMTEwMDEwMDAwMDExMDAwMTExMTAwMDExMDAwMDAxMTExMTAxMTExMDExMTExMDAwMDExMTEwMTAwMDAxMDExMTEwMDAwMTExMTAxMDAwMDEwMTExMTAwMDAxMTAwMTAxMTExMDEwMDExMDAwMDExMDAxMDExMTEwMTAwMTEwMDAwMTEwMDEwMDAwMDAxMDAxMTAwMDAxMTAwMTAwMDAwMDEwMDExMDAwMDAwMDAxMDExMTEwMTAwMDAwMDAwMDAwMDEwMTExMTAxMDAwMDAwMDAwMDAwMTAxMTExMDEwMDAwMDAwMDAwMDAxMDExMTEwMTAwMDAwMDAwMDAwMDEwMTExMTAxMDAwMDAwMDAwMDAwMTAxMTExMDEwMDAwMDAwMDExMDAxMDExMTEwMTAwMTEwMDAwMTEwMDEwMTExMTAxMDAxMTAwMDAxMTAwMDEwMDAwMDEwMDExMDAwMDExMDAwMTAwMDAwMTAwMTEwMDAwMTEwMDAxMDAxMTEwMTEwMDAwMDAxMTAwMDEwMDExMTAxMTAwMDAwMDAwMTExMDAwMDAxMDExMDAwMDAwMDAxMTEwMDAwMDEwMTEwMDAwMDAwMDExMDExMTAwMTAxMTAwMDAwMDAwMTEwMTExMDAxMDExMDAwMDAwMDAxMTEwMTEwMDAxMDAxMTAwMDAwMDExMTAxMTAwMDEwMDExMDAwMDAwMTExMDExMDAwMTAwMTEwMDAwMDAxMTEwMTEwMDAxMDAxMTAwMDAxMTAwMTAxMTAwMDEwMDExMDAwMDExMDAxMDExMDAwMTAwMTEwMDAwMTEwMDEwMTExMTEwMDAxMTAwMDAxMTAwMTAxMTExMTAwMDExMDAwMDExMDAxMDAwMTEwMTExMDAwMDAwMTEwMDEwMDAxMTAxMTEwMDAwMDAwMDExMDExMTExMDExMTAwMDAwMDAwMTEwMTExMTEwMTExMDAwMDAwMDAxMTAxMDAwMDEwMTEwMDAwMDAwMDExMDEwMDAwMTAxMTAwMDAwMDAwMTEwMTAwMDAxMDExMDAwMDAwMDAxMTAxMDAwMDEwMTEwMDAwMDAxMTExMDEwMDAwMTAxMTExMDAwMDExMTEwMTAwMDAxMDExMTEwMDAwMTExMTAxMDAwMDEwMTExMTAwMDAxMTExMDEwMDAwMTAxMTExMDAwMDAwMTEwMTExMTExMDExMDAwMDAwMDAxMTAxMTExMTEwMTEwMDAwMDAwMDExMDEwMDAwMTAxMTAwMDAwMDAwMTEwMTAwMDAxMDExMDAwMDAwMDAwMDEwMTExMTAxMDAwMDAwMDAwMDAwMTAxMTExMDEwMDAwMDAwMDAwMDAwMTAwMDAxMDAwMDAwMDAwMTAwMTExMDAwMDExMTAwMTAwMDAwMTEwMDAwMDAwMDAwMTEwMDAwMDEwMDExMTEwMDExMTEwMDEwMDAwMDExMDAwMDExMDAwMDExMDAwMDAxMDAxMTExMTExMTExMDAxMDAwMDAxMTAwMDExMTEwMDAxMTAwMDAwMTExMTEwMTExMTAxMTExMTAwMDAxMTExMDEwMDAwMTAxMTExMDAwMDExMTEwMTAwMDAxMDExMTEwMDAwMTEwMDEwMTExMTAxMDAxMTAwMDAxMTAwMTAxMTExMDEwMDExMDAwMDExMDAxMDAwMDAwMTAwMTEwMDAwMTEwMDEwMDAwMDAxMDAxMTAwMDAwMDAwMTAxMTExMDEwMDAwMDAwMDAwMDAxMDExMTEwMTAwMDAwMDp8MSMwNjZhMDAjMDY2YTAwIzA2NmEwMCMwNjZhMDB8MCMwNjZhMDAjMDY2YTAwIzA2NmEwMCMwNjZhMDB8MSM3M2QyMTYjMDY2YTAwIzRlOWEwNiNjYmZmYzR8MSMwNjZhMDAjNGU5YTA2I2NiZmZjNCM3M2QyMTZ8MCMwNjZhMDAjNzNkMjE2I2NiZmZjNCM0ZTlhMDZ8MCM0ZTlhMDYjMDY2YTAwIzczZDIxNiNjYmZmYzR8MSM3M2QyMTYjMDY2YTAwIzRlOWEwNiNjYmZmYzR8MCM0ZTlhMDYjMDY2YTAwIzczZDIxNiNjYmZmYzR8MSM3M2QyMTYjMDY2YTAwIzRlOWEwNiNjYmZmYzR8MSMwNjZhMDAjNGU5YTA2I2NiZmZjNCM3M2QyMTZ8MCMwNjZhMDAjNzNkMjE2I2NiZmZjNCM0ZTlhMDZ8MCM0ZTlhMDYjMDY2YTAwIzczZDIxNiNjYmZmYzR8MSM3M2QyMTYjMDY2YTAwIzRlOWEwNiNjYmZmYzR8MCM0ZTlhMDYjMDY2YTAwIzczZDIxNiNjYmZmYzR8MSM3M2QyMTYjMDY2YTAwIzRlOWEwNiNjYmZmYzR8MSMwNjZhMDAjNGU5YTA2I2NiZmZjNCM3M2QyMTZ8MCMwNjZhMDAjNzNkMjE2I2NiZmZjNCM0ZTlhMDZ8MCM0ZTlhMDYjMDY2YTAwIzczZDIxNiNjYmZmYzR8MSMwNjZhMDAjMDY2YTAwIzA2NmEwMCMwNjZhMDB8MCMwNjZhMDAjMDY2YTAwIzA2NmEwMCMwNjZhMDA="}]),st=localStorage.weaveRows?parseInt(localStorage.weaveRows):19,it=localStorage.tablets?JSON.parse(localStorage.tablets):[{sDirection:!0,threads:[{color:"#204a87"},{color:"#204a87"},{color:"#204a87"},{color:"#204a87"}]},{sDirection:!0,threads:[{color:"#ffffff"},{color:"#d3d7cf"},{color:"#ffffff"},{color:"#ffffff"}]},{sDirection:!0,threads:[{color:"#ffffff"},{color:"#d3d7cf"},{color:"#ffffff"},{color:"#ffffff"}]},{sDirection:!0,threads:[{color:"#204a87"},{color:"#204a87"},{color:"#204a87"},{color:"#204a87"}]}],ut=localStorage.rotationDirections?JSON.parse(localStorage.rotationDirections):{},at=Dt(!1),ft=Dt(st),xt=Dt(it),mt=Dt(ut);function Tt(){const t=atob(window.location.hash.substring(1)).split(":");if(4!==t.length)return void at.set(!0);const M=parseInt(t[0]),e=parseInt(t[1]),n={};[...Array(e).keys()].forEach((e=>{[...Array(M).keys()].forEach((o=>{void 0===n[e]&&(n[e]={}),n[e][o]="1"===t[2][e*M+o]}))}));const o=t[3].substring(1).split("|").map((t=>({sDirection:"1"===t[0],threads:t.substring(2).split("#").map((t=>({color:`#${t}`})))})));ft.set(e),mt.set(n),xt.set(o),at.set(!0)}ft.subscribe((t=>localStorage.weaveRows=t)),xt.subscribe((t=>localStorage.tablets=JSON.stringify(t))),mt.subscribe((t=>localStorage.rotationDirections=JSON.stringify(t))),ct([at,ft,xt,mt],(([t,M,e,n])=>{if(!t)return null;const o=[...Array(M).keys()].reduce(((t,M,o)=>[...Array(e.length).keys()].reduce(((t,M,e)=>`${t}${void 0!==n[o]&&void 0!==n[o][e]&&!0===n[o][e]?"1":"0"}`),t)),""),w=e.reduce(((t,M)=>`${t}|${M.sDirection?"1":"0"}`+M.threads.reduce(((t,M)=>`${t}${M.color}`),"")),"");return`${e.length}:${M}:${o}:${w}`})).subscribe((t=>{t&&(window.location.hash="#"+btoa(t))}));const dt=ct([ft,xt,mt],(([t,M,e])=>M.map(((M,n)=>ht(t,e,M,n,0,M.sDirection))))),Et=ct([ft,xt,mt],(([t,M,e])=>M.map(((M,n)=>ht(t,e,M,n,2,!M.sDirection)))));function ht(t,M,e,n,o,w){const l=e.threads,r=l.length;let D=!1;return{weaves:[...Array(t).keys()].map((t=>{let e=1,c=w;const A=void 0!==M[t]&&void 0!==M[t][n]&&!0===M[t][n];A&&(c=!w,e=-1),D!=A&&(e=0),o=(o+e+l.length)%r;const s=l[o].color;return D=A,{color:s,sDirection:c}}))}}var gt={$:t=>"string"==typeof t?document.querySelector(t):t,extend:(...t)=>Object.assign(...t),cumulativeOffset(t){let M=0,e=0;do{M+=t.offsetTop||0,e+=t.offsetLeft||0,t=t.offsetParent}while(t);return{top:M,left:e}},directScroll:t=>t&&t!==document&&t!==document.body,scrollTop(t,M){let e=void 0!==M;return this.directScroll(t)?e?t.scrollTop=M:t.scrollTop:e?document.documentElement.scrollTop=document.body.scrollTop=M:window.pageYOffset||document.documentElement.scrollTop||document.body.scrollTop||0},scrollLeft(t,M){let e=void 0!==M;return this.directScroll(t)?e?t.scrollLeft=M:t.scrollLeft:e?document.documentElement.scrollLeft=document.body.scrollLeft=M:window.pageXOffset||document.documentElement.scrollLeft||document.body.scrollLeft||0}};const Zt={container:"body",duration:500,delay:0,offset:0,easing:function(t){return t<.5?4*t*t*t:.5*Math.pow(2*t-2,3)+1},onStart:t,onDone:t,onAborting:t,scrollX:!1,scrollY:!0},Nt=t=>{let{offset:M,duration:e,delay:n,easing:o,x:w=0,y:l=0,scrollX:r,scrollY:D,onStart:c,onDone:A,container:f,onAborting:x,element:m}=t;"function"==typeof M&&(M=M());var T=gt.cumulativeOffset(f),d=m?gt.cumulativeOffset(m):{top:l,left:w},E=gt.scrollLeft(f),h=gt.scrollTop(f),g=d.left-T.left+M,Z=d.top-T.top+M,N=g-E,j=Z-h;let k=!0,p=!1,v=s()+n,$=v+e;function Y(t){t||(p=!0,c(m,{x:w,y:l}))}function y(t){!function(t,M,e){r&&gt.scrollLeft(t,e),D&&gt.scrollTop(t,M)}(f,h+j*t,E+N*t)}function b(){k=!1}return function(t){let M;0===u.size&&i(a),new Promise((e=>{u.add(M={c:t,f:e})}))}((t=>{if(!p&&t>=v&&Y(!1),p&&t>=$&&(y(1),b(),A(m,{x:w,y:l})),!k)return x(m,{x:w,y:l}),!1;if(p){y(0+1*o((t-v)/e))}return!0})),Y(n),y(0),b},jt=t=>{if(t&&t!==document&&t!==document.body)return t.scrollHeight-t.offsetHeight;{let t=document.body,M=document.documentElement;return Math.max(t.scrollHeight,t.offsetHeight,M.clientHeight,M.scrollHeight,M.offsetHeight)}},kt=t=>(t=(t=>{let M=gt.extend({},Zt,t);return M.container=gt.$(M.container),M.element=gt.$(M.element),M})(t),Nt(gt.extend(t,{element:null,y:jt(t.container)})));function pt(M){let e,o,w,l,r;return{c(){e=T("div"),o=T("input"),N(o,"type","color"),N(o,"class","svelte-58hukb"),N(e,"class","thread svelte-58hukb"),N(e,"style",w=`background-color: ${M[0].color}`),N(e,"uk-tooltip","Farbe wählen")},m(t,n){x(t,e,n),f(e,o),k(o,M[0].color),l||(r=[g(o,"input",M[2]),g(o,"click",M[1])],l=!0)},p(t,[M]){1&M&&k(o,t[0].color),1&M&&w!==(w=`background-color: ${t[0].color}`)&&N(e,"style",w)},i:t,o:t,d(t){t&&m(e),l=!1,n(r)}}}function vt(t,M,e){let{config:n}=M;return t.$$set=t=>{"config"in t&&e(0,n=t.config)},[n,function(M){y.call(this,t,M)},function(){n.color=this.value,e(0,n)}]}class $t extends wt{constructor(t){super(),ot(this,t,vt,pt,w,{config:0})}}function Yt(t,M,e){const n=t.slice();return n[4]=M[e],n[5]=M,n[1]=e,n}function yt(t,M){let e,n,o,w;function l(t){M[3](t,M[4],M[5],M[1])}let r={};return void 0!==M[4]&&(r.config=M[4]),n=new $t({props:r}),I.push((()=>K(n,"config",l))),{key:t,first:null,c(){e=h(),tt(n.$$.fragment),this.first=e},m(t,M){x(t,e,M),Mt(n,t,M),w=!0},p(t,e){M=t;const w={};!o&&1&e&&(o=!0,w.config=M[4],Q((()=>o=!1))),n.$set(w)},i(t){w||(P(n.$$.fragment,t),w=!0)},o(t){V(n.$$.fragment,t),w=!1},d(t){t&&m(e),et(n,t)}}}function bt(t){let M;return{c(){M=d("Z")},m(t,e){x(t,M,e)},d(t){t&&m(M)}}}function It(t){let M;return{c(){M=d("S")},m(t,e){x(t,M,e)},d(t){t&&m(M)}}}function zt(t){let M,e,n,o,w,l,r,D,c,A,s,i=t[1]+1+"",u=[],a=new Map,h=t[0].threads;const Z=t=>t[1];for(let M=0;M<h.length;M+=1){let e=Yt(t,h,M),n=Z(e);a.set(n,u[M]=yt(n,e))}function k(t,M){return t[0].sDirection?It:bt}let p=k(t),v=p(t);return{c(){M=T("div"),e=T("div"),n=d(i),w=E();for(let t=0;t<u.length;t+=1)u[t].c();l=E(),r=T("div"),D=T("button"),v.c(),N(e,"class","tabletIndex uk-text-center svelte-cxbxxh"),N(e,"uk-tooltip",o="Brettchen #"+(t[1]+1)),N(D,"uk-tooltip","Schärung umkehren"),N(D,"class","svelte-cxbxxh"),N(r,"class","threadDirection svelte-cxbxxh"),N(M,"class","tablet svelte-cxbxxh")},m(o,i){x(o,M,i),f(M,e),f(e,n),f(M,w);for(let t=0;t<u.length;t+=1)u[t].m(M,null);f(M,l),f(M,r),f(r,D),v.m(D,null),c=!0,A||(s=g(D,"click",t[2]),A=!0)},p(t,[w]){(!c||2&w)&&i!==(i=t[1]+1+"")&&j(n,i),(!c||2&w&&o!==(o="Brettchen #"+(t[1]+1)))&&N(e,"uk-tooltip",o),1&w&&(h=t[0].threads,W(),u=q(u,w,Z,1,t,h,a,M,F,yt,l,Yt),J()),p!==(p=k(t))&&(v.d(1),v=p(t),v&&(v.c(),v.m(D,null)))},i(t){if(!c){for(let t=0;t<h.length;t+=1)P(u[t]);c=!0}},o(t){for(let t=0;t<u.length;t+=1)V(u[t]);c=!1},d(t){t&&m(M);for(let t=0;t<u.length;t+=1)u[t].d();v.d(),A=!1,s()}}}function St(t,M,e){let{index:n}=M,{config:o}=M;return t.$$set=t=>{"index"in t&&e(1,n=t.index),"config"in t&&e(0,o=t.config)},[o,n,function(){e(0,o.sDirection=!o.sDirection,o)},function(t,M,n,w){n[w]=t,e(0,o)}]}class Ct extends wt{constructor(t){super(),ot(this,t,St,zt,w,{index:1,config:0})}}function Ot(M){let e,n,o;return{c(){e=T("div"),N(e,"class",n="weave "+M[1]+" svelte-lumg3c"),N(e,"style",o=`background-color: ${M[0].color}`),p(e,"sDirection",M[0].sDirection)},m(t,M){x(t,e,M)},p(t,[M]){2&M&&n!==(n="weave "+t[1]+" svelte-lumg3c")&&N(e,"class",n),1&M&&o!==(o=`background-color: ${t[0].color}`)&&N(e,"style",o),3&M&&p(e,"sDirection",t[0].sDirection)},i:t,o:t,d(t){t&&m(e)}}}function Ut(t,M,e){let{weave:n}=M,{classNames:o=""}=M;return t.$$set=t=>{"weave"in t&&e(0,n=t.weave),"classNames"in t&&e(1,o=t.classNames)},[n,o]}class Qt extends wt{constructor(t){super(),ot(this,t,Ut,Ot,w,{weave:0,classNames:1})}}function Rt(t,M,e){const n=t.slice();return n[2]=M[e],n[4]=e,n}function _t(t,M){let e,n,o;return n=new Qt({props:{weave:M[2]}}),{key:t,first:null,c(){e=h(),tt(n.$$.fragment),this.first=e},m(t,M){x(t,e,M),Mt(n,t,M),o=!0},p(t,e){M=t;const o={};1&e&&(o.weave=M[2]),n.$set(o)},i(t){o||(P(n.$$.fragment,t),o=!0)},o(t){V(n.$$.fragment,t),o=!1},d(t){t&&m(e),et(n,t)}}}function Bt(t){let M,e,n,o,w=[],l=new Map,r=t[0].weaves;const D=t=>t[4];for(let M=0;M<r.length;M+=1){let e=Rt(t,r,M),n=D(e);l.set(n,w[M]=_t(n,e))}return n=new Qt({props:{weave:t[1],classNames:"final"}}),{c(){M=T("div");for(let t=0;t<w.length;t+=1)w[t].c();e=E(),tt(n.$$.fragment),N(M,"class","tablet svelte-2njjc7")},m(t,l){x(t,M,l);for(let t=0;t<w.length;t+=1)w[t].m(M,null);f(M,e),Mt(n,M,null),o=!0},p(t,[n]){1&n&&(r=t[0].weaves,W(),w=q(w,n,D,1,t,r,l,M,F,_t,e,Rt),J())},i(t){if(!o){for(let t=0;t<r.length;t+=1)P(w[t]);P(n.$$.fragment,t),o=!0}},o(t){for(let t=0;t<w.length;t+=1)V(w[t]);V(n.$$.fragment,t),o=!1},d(t){t&&m(M);for(let t=0;t<w.length;t+=1)w[t].d();et(n)}}}function Ht(t,M,e){let{config:n}=M;return t.$$set=t=>{"config"in t&&e(0,n=t.config)},[n,{color:"#ffffff",sDirection:!0}]}class Lt extends wt{constructor(t){super(),ot(this,t,Ht,Bt,w,{config:0})}}function Gt(t,M,e){const n=t.slice();return n[2]=M[e],n[4]=e,n}function Wt(t,M,e){const n=t.slice();return n[5]=M[e],n[4]=e,n}function Jt(t,M){let e,n,o,w=M[4]+1+"";return{key:t,first:null,c(){e=T("div"),n=d(w),o=E(),N(e,"class","tabletWeaveIndex svelte-8y67uc"),this.first=e},m(t,M){x(t,e,M),f(e,n),f(e,o)},p(t,e){M=t,2&e&&w!==(w=M[4]+1+"")&&j(n,w)},d(t){t&&m(e)}}}function Pt(t,M){let e,n,o;return n=new Lt({props:{config:M[2]}}),{key:t,first:null,c(){e=h(),tt(n.$$.fragment),this.first=e},m(t,M){x(t,e,M),Mt(n,t,M),o=!0},p(t,e){M=t;const o={};1&e&&(o.config=M[2]),n.$set(o)},i(t){o||(P(n.$$.fragment,t),o=!0)},o(t){V(n.$$.fragment,t),o=!1},d(t){t&&m(e),et(n,t)}}}function Vt(t){let M,e,n,o,w=[],l=new Map,r=[],D=new Map,c=[...Array(t[1]).keys()];const A=t=>t[4];for(let M=0;M<c.length;M+=1){let e=Wt(t,c,M),n=A(e);l.set(n,w[M]=Jt(n,e))}let s=t[0];const i=t=>t[4];for(let M=0;M<s.length;M+=1){let e=Gt(t,s,M),n=i(e);D.set(n,r[M]=Pt(n,e))}return{c(){M=T("div"),e=T("div");for(let t=0;t<w.length;t+=1)w[t].c();n=E();for(let t=0;t<r.length;t+=1)r[t].c();N(e,"class","tabletWeaveIndices uk-text-small svelte-8y67uc"),N(M,"class","uk-flex uk-flex-center")},m(t,l){x(t,M,l),f(M,e);for(let t=0;t<w.length;t+=1)w[t].m(e,null);f(M,n);for(let t=0;t<r.length;t+=1)r[t].m(M,null);o=!0},p(t,[n]){2&n&&(c=[...Array(t[1]).keys()],w=q(w,n,A,1,t,c,l,e,X,Jt,null,Wt)),1&n&&(s=t[0],W(),r=q(r,n,i,1,t,s,D,M,F,Pt,null,Gt),J())},i(t){if(!o){for(let t=0;t<s.length;t+=1)P(r[t]);o=!0}},o(t){for(let t=0;t<r.length;t+=1)V(r[t]);o=!1},d(t){t&&m(M);for(let t=0;t<w.length;t+=1)w[t].d();for(let t=0;t<r.length;t+=1)r[t].d()}}}function Xt(t,M,e){let n;r(t,ft,(t=>e(1,n=t)));let{weavePattern:o}=M;return t.$$set=t=>{"weavePattern"in t&&e(0,o=t.weavePattern)},[o,n]}class Ft extends wt{constructor(t){super(),ot(this,t,Xt,Vt,w,{weavePattern:0})}}function qt(t,M,e){const n=t.slice();return n[8]=M[e],n[10]=e,n}function Kt(t,M,e){const n=t.slice();return n[11]=M[e],n[13]=e,n}function tM(t,M,e){const n=t.slice();return n[11]=M[e],n[13]=e,n}function MM(t,M){let e,n,o=M[13]+1+"";return{key:t,first:null,c(){e=T("th"),n=d(o),N(e,"class","svelte-1rt9nva"),this.first=e},m(t,M){x(t,e,M),f(e,n)},p(t,e){M=t,2&e&&o!==(o=M[13]+1+"")&&j(n,o)},d(t){t&&m(e)}}}function eM(t,M){let e,n,o,w,l,r,c;function A(){return M[7](M[10],M[13])}return{key:t,first:null,c(){e=T("td"),n=T("a"),o=d("x"),N(n,"href","#"),N(n,"class","cellLink svelte-1rt9nva"),N(n,"uk-tooltip",w="Brettchen "+(M[13]+1)+","+(M[10]+1)),N(e,"class",l=D(M[0](M[10],M[13])?"active":"")+" svelte-1rt9nva"),this.first=e},m(t,M){x(t,e,M),f(e,n),f(n,o),r||(c=g(n,"click",A),r=!0)},p(t,o){M=t,6&o&&w!==(w="Brettchen "+(M[13]+1)+","+(M[10]+1))&&N(n,"uk-tooltip",w),7&o&&l!==(l=D(M[0](M[10],M[13])?"active":"")+" svelte-1rt9nva")&&N(e,"class",l)},d(t){t&&m(e),r=!1,c()}}}function nM(t,M){let e,n,o,w,l,r,D,c,A,s=M[10]+1+"",i=[],u=new Map;function a(){return M[6](M[10])}let h=M[1];const Z=t=>t[13];for(let t=0;t<h.length;t+=1){let e=Kt(M,h,t),n=Z(e);u.set(n,i[t]=eM(n,e))}return{key:t,first:null,c(){e=T("tr"),n=T("th"),o=T("a"),w=d(s),r=E();for(let t=0;t<i.length;t+=1)i[t].c();D=E(),N(o,"href",l="#"),N(o,"uk-tooltip","Drehrichtung für alle Brettchen umkehren"),N(n,"class","uk-text-right svelte-1rt9nva"),this.first=e},m(t,M){x(t,e,M),f(e,n),f(n,o),f(o,w),f(e,r);for(let t=0;t<i.length;t+=1)i[t].m(e,null);f(e,D),c||(A=g(o,"click",a),c=!0)},p(t,n){M=t,4&n&&s!==(s=M[10]+1+"")&&j(w,s),23&n&&(h=M[1],i=q(i,n,Z,1,M,h,u,e,X,eM,D,Kt))},d(t){t&&m(e);for(let t=0;t<i.length;t+=1)i[t].d();c=!1,A()}}}function oM(M){let e,n,o,w,l,r,D=[],c=new Map,A=[],s=new Map,i=M[1];const u=t=>t[13];for(let t=0;t<i.length;t+=1){let e=tM(M,i,t),n=u(e);c.set(n,D[t]=MM(n,e))}let a=[...Array(M[2]).keys()];const d=t=>t[10];for(let t=0;t<a.length;t+=1){let e=qt(M,a,t),n=d(e);s.set(n,A[t]=nM(n,e))}return{c(){e=T("div"),n=T("table"),o=T("tr"),w=T("th"),l=E();for(let t=0;t<D.length;t+=1)D[t].c();r=E();for(let t=0;t<A.length;t+=1)A[t].c();N(w,"class","svelte-1rt9nva"),N(n,"class","svelte-1rt9nva"),N(e,"class","uk-flex uk-flex-center")},m(t,M){x(t,e,M),f(e,n),f(n,o),f(o,w),f(o,l);for(let t=0;t<D.length;t+=1)D[t].m(o,null);f(n,r);for(let t=0;t<A.length;t+=1)A[t].m(n,null)},p(t,[M]){2&M&&(i=t[1],D=q(D,M,u,1,t,i,c,o,X,MM,null,tM)),31&M&&(a=[...Array(t[2]).keys()],A=q(A,M,d,1,t,a,s,n,X,nM,null,qt))},i:t,o:t,d(t){t&&m(e);for(let t=0;t<D.length;t+=1)D[t].d();for(let t=0;t<A.length;t+=1)A[t].d()}}}function wM(t,M,e){let n,o,w,l;function D(t){w.forEach(((M,e)=>{A(t,e)}))}function A(t,M){void 0===o[t]&&c(mt,o[t]={},o),o[t][M]?(delete o[t][M],mt.set(o)):c(mt,o[t][M]=!0,o)}r(t,mt,(t=>e(5,o=t))),r(t,xt,(t=>e(1,w=t))),r(t,ft,(t=>e(2,l=t)));return t.$$.update=()=>{32&t.$$.dirty&&e(0,n=(t,M)=>void 0!==o[t]&&void 0!==o[t][M]&&!0===o[t][M])},[n,w,l,D,A,o,t=>D(t),(t,M)=>A(t,M)]}class lM extends wt{constructor(t){super(),ot(this,t,wM,oM,w,{})}}function rM(t,M,e){const n=t.slice();return n[10]=M[e],n[11]=M,n[12]=e,n}function DM(t,M,e){const n=t.slice();return n[13]=M[e],n[12]=e,n}function cM(t,M,e){const n=t.slice();return n[15]=M[e],n[12]=e,n}function AM(t,M){let e,n,o,w,l=M[15].name+"";return{key:t,first:null,c(){e=T("li"),n=T("a"),o=d(l),N(n,"href",w="?"+(new Date).getTime()+"#"+M[15].hash),this.first=e},m(t,M){x(t,e,M),f(e,n),f(n,o)},p(t,e){M=t,2&e&&l!==(l=M[15].name+"")&&j(o,l),2&e&&w!==(w="?"+(new Date).getTime()+"#"+M[15].hash)&&N(n,"href",w)},d(t){t&&m(e)}}}function sM(t,M){let e,n,o,w=String.fromCharCode(65+M[12])+"";return{key:t,first:null,c(){e=T("div"),n=d(w),o=E(),N(e,"class","holeIndex svelte-7d31vl"),this.first=e},m(t,M){x(t,e,M),f(e,n),f(e,o)},p(t,e){M=t,1&e&&w!==(w=String.fromCharCode(65+M[12])+"")&&j(n,w)},d(t){t&&m(e)}}}function iM(t,M){let e,n,o,w;function l(t){M[8](t,M[10],M[11],M[12])}let r={index:M[12]};return void 0!==M[10]&&(r.config=M[10]),n=new Ct({props:r}),I.push((()=>K(n,"config",l))),{key:t,first:null,c(){e=h(),tt(n.$$.fragment),this.first=e},m(t,M){x(t,e,M),Mt(n,t,M),w=!0},p(t,e){M=t;const w={};1&e&&(w.index=M[12]),!o&&1&e&&(o=!0,w.config=M[10],Q((()=>o=!1))),n.$set(w)},i(t){w||(P(n.$$.fragment,t),w=!0)},o(t){V(n.$$.fragment,t),w=!1},d(t){t&&m(e),et(n,t)}}}function uM(t){let M,e,o,w,l,r,D,c,A,s,i,u,a,d,h,j,k,p,v,$,Y,y,b,I,z,S,C,O,U,Q,R,_,B,H,L,G,K,nt,ot,wt,lt,rt,Dt,ct,At,st,it,ut,at,ft,xt,mt,Tt,dt,Et,ht,gt,Zt,Nt,jt,kt,pt=[],vt=new Map,$t=[],Yt=new Map,yt=[],bt=new Map,It=t[1];const zt=t=>t[12];for(let M=0;M<It.length;M+=1){let e=cM(t,It,M),n=zt(e);vt.set(n,pt[M]=AM(n,e))}let St=t[0][0].threads;const Ct=t=>t[12];for(let M=0;M<St.length;M+=1){let e=DM(t,St,M),n=Ct(e);Yt.set(n,$t[M]=sM(n,e))}let Ot=t[0];const Ut=t=>t[12];for(let M=0;M<Ot.length;M+=1){let e=rM(t,Ot,M),n=Ut(e);bt.set(n,yt[M]=iM(n,e))}return Dt=new lM({}),st=new Ft({props:{weavePattern:t[2]}}),at=new Ft({props:{weavePattern:t[3]}}),{c(){M=T("main"),e=T("nav"),o=T("div"),o.textContent="Brettchenweben",w=E(),l=T("div"),r=T("ul"),D=T("li"),c=T("a"),c.textContent="Vorlagen",A=E(),s=T("div"),i=T("ul");for(let t=0;t<pt.length;t+=1)pt[t].c();u=E(),a=T("div"),d=T("div"),h=T("h2"),h.textContent="Schärbrief",j=E(),k=T("div"),p=T("div"),p.innerHTML='<img src="assets/tablet-4-holes.svg" alt="Tablet hole index description: A = top front; B - bottom front; C - bottom back; D - top back"/>',v=E(),$=T("div"),Y=T("div"),y=T("div"),b=T("div"),I=E();for(let t=0;t<$t.length;t+=1)$t[t].c();z=E();for(let t=0;t<yt.length;t+=1)yt[t].c();S=E(),C=T("div"),O=T("button"),U=T("br"),Q=E(),R=T("button"),_=E(),B=T("div"),H=T("div"),L=T("div"),G=T("div"),G.innerHTML="<h3>Webbrief</h3>",K=E(),nt=T("div"),nt.innerHTML="<h3>Vorderseite</h3>",ot=E(),wt=T("div"),wt.innerHTML="<h3>Rückseite</h3>",lt=E(),rt=T("div"),tt(Dt.$$.fragment),ct=E(),At=T("div"),tt(st.$$.fragment),it=E(),ut=T("div"),tt(at.$$.fragment),ft=E(),xt=T("div"),mt=E(),Tt=T("div"),dt=T("button"),Et=E(),ht=T("button"),gt=E(),Zt=T("div"),N(o,"class","uk-navbar-center"),N(c,"href","#"),N(c,"class","svelte-7d31vl"),N(i,"class","uk-nav uk-navbar-dropdown-nav"),N(s,"class","uk-navbar-dropdown"),N(D,"class","svelte-7d31vl"),N(r,"class","uk-navbar-nav svelte-7d31vl"),N(l,"class","uk-navbar-right"),N(e,"class","uk-navbar-container"),N(e,"uk-navbar",""),N(p,"class","uk-text-center"),N(b,"class","holeIndex svelte-7d31vl"),N(y,"class","holes svelte-7d31vl"),N(Y,"class","uk-flex uk-flex-center"),N($,"class","uk-width-2-3 uk-text-center"),N(O,"class","uk-icon-button uk-button-secondary uk-button-large uk-width-small uk-margin-small-bottom "),N(O,"uk-icon","plus"),N(O,"uk-tooltip","Brettchen hinzufügen"),N(R,"class","uk-icon-button uk-button-secondary uk-button-large uk-width-small"),N(R,"uk-icon","minus"),N(R,"uk-tooltip","Brettchen entfernen"),N(C,"class","uk-text-center"),N(k,"class","uk-grid-column-small uk-grid-row-large uk-child-width-1-6@m uk-flex-center uk-flex-middle"),N(k,"uk-grid",""),N(d,"class","uk-container uk-container-small uk-container-expand"),N(a,"class","uk-section uk-section-xsmall uk-section-muted"),N(G,"class","uk-first-column uk-text-center"),N(nt,"class","uk-text-center uk-margin-small-bottom"),N(wt,"class","uk-text-center"),N(rt,"class","uk-first-column uk-text-small"),N(At,"class","uk-margin-medium-top"),N(ut,"class","uk-margin-medium-top"),N(xt,"class","uk-first-column"),N(dt,"class","uk-icon-button uk-button-secondary uk-button-large uk-width-small uk-margin-small-bottom"),N(dt,"uk-icon","plus"),N(dt,"uk-tooltip","Webreihe hinzufügen"),N(ht,"class","uk-icon-button uk-button-secondary uk-button-large uk-width-small uk-margin-small-bottom"),N(ht,"uk-icon","minus"),N(ht,"uk-tooltip","Webreihe entfernen"),N(Tt,"class","uk-margin-large-top uk-text-center"),N(L,"class","uk-grid-column-small uk-grid-row-small uk-child-width-1-3@m uk-flex-center uk-flex-top"),N(L,"uk-grid",""),N(H,"class","uk-container uk-container-small uk-container-expand"),N(B,"class","uk-section uk-section-xsmall")},m(n,m){x(n,M,m),f(M,e),f(e,o),f(e,w),f(e,l),f(l,r),f(r,D),f(D,c),f(D,A),f(D,s),f(s,i);for(let t=0;t<pt.length;t+=1)pt[t].m(i,null);f(M,u),f(M,a),f(a,d),f(d,h),f(d,j),f(d,k),f(k,p),f(k,v),f(k,$),f($,Y),f(Y,y),f(y,b),f(y,I);for(let t=0;t<$t.length;t+=1)$t[t].m(y,null);f(Y,z);for(let t=0;t<yt.length;t+=1)yt[t].m(Y,null);f(k,S),f(k,C),f(C,O),f(C,U),f(C,Q),f(C,R),f(M,_),f(M,B),f(B,H),f(H,L),f(L,G),f(L,K),f(L,nt),f(L,ot),f(L,wt),f(L,lt),f(L,rt),Mt(Dt,rt,null),f(L,ct),f(L,At),Mt(st,At,null),f(L,it),f(L,ut),Mt(at,ut,null),f(L,ft),f(L,xt),f(L,mt),f(L,Tt),f(Tt,dt),f(Tt,Et),f(Tt,ht),f(L,gt),f(L,Zt),Nt=!0,jt||(kt=[g(O,"click",Z(t[4])),g(R,"click",Z(t[5])),g(dt,"click",Z(t[6])),g(ht,"click",Z(t[7]))],jt=!0)},p(t,[M]){2&M&&(It=t[1],pt=q(pt,M,zt,1,t,It,vt,i,X,AM,null,cM)),1&M&&(St=t[0][0].threads,$t=q($t,M,Ct,1,t,St,Yt,y,X,sM,null,DM)),1&M&&(Ot=t[0],W(),yt=q(yt,M,Ut,1,t,Ot,bt,Y,F,iM,null,rM),J());const e={};4&M&&(e.weavePattern=t[2]),st.$set(e);const n={};8&M&&(n.weavePattern=t[3]),at.$set(n)},i(t){if(!Nt){for(let t=0;t<Ot.length;t+=1)P(yt[t]);P(Dt.$$.fragment,t),P(st.$$.fragment,t),P(at.$$.fragment,t),Nt=!0}},o(t){for(let t=0;t<yt.length;t+=1)V(yt[t]);V(Dt.$$.fragment,t),V(st.$$.fragment,t),V(at.$$.fragment,t),Nt=!1},d(t){t&&m(M);for(let t=0;t<pt.length;t+=1)pt[t].d();for(let t=0;t<$t.length;t+=1)$t[t].d();for(let t=0;t<yt.length;t+=1)yt[t].d();et(Dt),et(st),et(at),jt=!1,n(kt)}}}function aM(t,M,e){let n,o,w,l,D;return r(t,ft,(t=>e(9,n=t))),r(t,xt,(t=>e(0,o=t))),r(t,At,(t=>e(1,w=t))),r(t,dt,(t=>e(2,l=t))),r(t,Et,(t=>e(3,D=t))),Y((()=>{Tt()})),window.location.search&&Tt(),[o,w,l,D,function(t){xt.update((t=>{const M=t[t.length-1],e={sDirection:M.sDirection,threads:M.threads.map((t=>({color:t.color})))};return t.push(e),t}))},function(t){o.length>1&&o.length<26&&xt.update((t=>(t.pop(),t)))},function(t){c(ft,n+=1,n),kt()},function(t){c(ft,n-=1,n)},function(t,M,e,n){e[n]=t,xt.set(o)}]}return new class extends wt{constructor(t){super(),ot(this,t,aM,uM,w,{})}}({target:document.body})}();
//# sourceMappingURL=bundle.js.map
