var app=function(){"use strict";function t(){}function n(t){return t()}function e(){return Object.create(null)}function o(t){t.forEach(n)}function r(t){return"function"==typeof t}function l(t,n){return t!=t?n==n:t!==n||t&&"object"==typeof t||"function"==typeof t}function c(n,...e){if(null==n)return t;const o=n.subscribe(...e);return o.unsubscribe?()=>o.unsubscribe():o}function s(t,n,e){t.$$.on_destroy.push(c(n,e))}function i(t,n,e){return t.set(e),n}function u(t,n){t.appendChild(n)}function f(t,n,e){t.insertBefore(n,e||null)}function a(t){t.parentNode.removeChild(t)}function d(t){return document.createElement(t)}function h(t){return document.createTextNode(t)}function g(){return h(" ")}function p(){return h("")}function m(t,n,e,o){return t.addEventListener(n,e,o),()=>t.removeEventListener(n,e,o)}function k(t){return function(n){return n.preventDefault(),t.call(this,n)}}function $(t,n,e){null==e?t.removeAttribute(n):t.getAttribute(n)!==e&&t.setAttribute(n,e)}function b(t,n){n=""+n,t.wholeText!==n&&(t.data=n)}function v(t,n){t.value=null==n?"":n}function w(t,n,e,o){t.style.setProperty(n,e,o?"important":"")}function y(t,n,e){t.classList[e?"add":"remove"](n)}let x;function S(t){x=t}function D(t,n){const e=t.$$.callbacks[n.type];e&&e.slice().forEach((t=>t.call(this,n)))}const _=[],M=[],A=[],E=[],j=Promise.resolve();let C=!1;function N(t){A.push(t)}function O(t){E.push(t)}const L=new Set;let T=0;function I(){const t=x;do{for(;T<_.length;){const t=_[T];T++,S(t),J(t.$$)}for(S(null),_.length=0,T=0;M.length;)M.pop()();for(let t=0;t<A.length;t+=1){const n=A[t];L.has(n)||(L.add(n),n())}A.length=0}while(_.length);for(;E.length;)E.pop()();C=!1,L.clear(),S(t)}function J(t){if(null!==t.fragment){t.update(),o(t.before_update);const n=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,n),t.after_update.forEach(N)}}const R=new Set;let H;function z(){H={r:0,c:[],p:H}}function B(){H.r||o(H.c),H=H.p}function P(t,n){t&&t.i&&(R.delete(t),t.i(n))}function V(t,n,e,o){if(t&&t.o){if(R.has(t))return;R.add(t),H.c.push((()=>{R.delete(t),o&&(e&&t.d(1),o())})),t.o(n)}}function q(t,n){t.d(1),n.delete(t.key)}function W(t,n){V(t,1,1,(()=>{n.delete(t.key)}))}function Z(t,n,e,o,r,l,c,s,i,u,f,a){let d=t.length,h=l.length,g=d;const p={};for(;g--;)p[t[g].key]=g;const m=[],k=new Map,$=new Map;for(g=h;g--;){const t=a(r,l,g),s=e(t);let i=c.get(s);i?o&&i.p(t,n):(i=u(s,t),i.c()),k.set(s,m[g]=i),s in p&&$.set(s,Math.abs(g-p[s]))}const b=new Set,v=new Set;function w(t){P(t,1),t.m(s,f),c.set(t.key,t),f=t.first,h--}for(;d&&h;){const n=m[h-1],e=t[d-1],o=n.key,r=e.key;n===e?(f=n.first,d--,h--):k.has(r)?!c.has(o)||b.has(o)?w(n):v.has(r)?d--:$.get(o)>$.get(r)?(v.add(o),w(n)):(b.add(r),d--):(i(e,c),d--)}for(;d--;){const n=t[d];k.has(n.key)||i(n,c)}for(;h;)w(m[h-1]);return m}function F(t,n,e){const o=t.$$.props[n];void 0!==o&&(t.$$.bound[o]=e,e(t.$$.ctx[o]))}function G(t){t&&t.c()}function K(t,e,l,c){const{fragment:s,on_mount:i,on_destroy:u,after_update:f}=t.$$;s&&s.m(e,l),c||N((()=>{const e=i.map(n).filter(r);u?u.push(...e):o(e),t.$$.on_mount=[]})),f.forEach(N)}function Q(t,n){const e=t.$$;null!==e.fragment&&(o(e.on_destroy),e.fragment&&e.fragment.d(n),e.on_destroy=e.fragment=null,e.ctx=[])}function U(t,n){-1===t.$$.dirty[0]&&(_.push(t),C||(C=!0,j.then(I)),t.$$.dirty.fill(0)),t.$$.dirty[n/31|0]|=1<<n%31}function X(n,r,l,c,s,i,u,f=[-1]){const d=x;S(n);const h=n.$$={fragment:null,ctx:null,props:i,update:t,not_equal:s,bound:e(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(r.context||(d?d.$$.context:[])),callbacks:e(),dirty:f,skip_bound:!1,root:r.target||d.$$.root};u&&u(h.root);let g=!1;if(h.ctx=l?l(n,r.props||{},((t,e,...o)=>{const r=o.length?o[0]:e;return h.ctx&&s(h.ctx[t],h.ctx[t]=r)&&(!h.skip_bound&&h.bound[t]&&h.bound[t](r),g&&U(n,t)),e})):[],h.update(),g=!0,o(h.before_update),h.fragment=!!c&&c(h.ctx),r.target){if(r.hydrate){const t=function(t){return Array.from(t.childNodes)}(r.target);h.fragment&&h.fragment.l(t),t.forEach(a)}else h.fragment&&h.fragment.c();r.intro&&P(n.$$.fragment),K(n,r.target,r.anchor,r.customElement),I()}S(d)}class Y{$destroy(){Q(this,1),this.$destroy=t}$on(t,n){const e=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return e.push(n),()=>{const t=e.indexOf(n);-1!==t&&e.splice(t,1)}}$set(t){var n;this.$$set&&(n=t,0!==Object.keys(n).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}const tt=[];function nt(n,e=t){let o;const r=new Set;function c(t){if(l(n,t)&&(n=t,o)){const t=!tt.length;for(const t of r)t[1](),tt.push(t,n);if(t){for(let t=0;t<tt.length;t+=2)tt[t][0](tt[t+1]);tt.length=0}}}return{set:c,update:function(t){c(t(n))},subscribe:function(l,s=t){const i=[l,s];return r.add(i),1===r.size&&(o=e(c)||t),l(n),()=>{r.delete(i),0===r.size&&(o(),o=null)}}}}function et(n,e,l){const s=!Array.isArray(n),i=s?[n]:n,u=e.length<2;return f=n=>{let l=!1;const f=[];let a=0,d=t;const h=()=>{if(a)return;d();const o=e(s?f[0]:f,n);u?n(o):d=r(o)?o:t},g=i.map(((t,n)=>c(t,(t=>{f[n]=t,a&=~(1<<n),l&&h()}),(()=>{a|=1<<n}))));return l=!0,h(),function(){o(g),d()}},{subscribe:nt(l,f).subscribe};var f}const ot=localStorage.weaveRows?parseInt(localStorage.weaveRows):19,rt=localStorage.tablets?JSON.parse(localStorage.tablets):[{sDirection:!0,threads:[{color:"#204a87"},{color:"#204a87"},{color:"#204a87"},{color:"#204a87"}]},{sDirection:!0,threads:[{color:"#ffffff"},{color:"#d3d7cf"},{color:"#ffffff"},{color:"#ffffff"}]},{sDirection:!0,threads:[{color:"#ffffff"},{color:"#d3d7cf"},{color:"#ffffff"},{color:"#ffffff"}]},{sDirection:!0,threads:[{color:"#204a87"},{color:"#204a87"},{color:"#204a87"},{color:"#204a87"}]}],lt=localStorage.rotationDirections?JSON.parse(localStorage.rotationDirections):[],ct=nt(ot),st=nt(rt),it=nt(lt);ct.subscribe((t=>localStorage.weaveRows=t)),st.subscribe((t=>localStorage.tablets=JSON.stringify(t))),it.subscribe((t=>localStorage.rotationDirections=JSON.stringify(t)));const ut=et([ct,it],(([t,n])=>{let e=!0;return[...Array(t).keys()].map((t=>(n.includes(t)&&(e=!e),e)))})),ft=et([ct,st,it],(([t,n,e])=>n.map((n=>{const o=n.threads,r=o.length;let l=n.sDirection,c=-1;return{weaves:[...Array(t).keys()].map((t=>{e.includes(t)&&(l=!l),c+=l?-1:1;return{color:o[Math.abs(c)%r].color,sDirection:l}}))}}))));function at(n){let e,r,l,c,s;return{c(){e=d("div"),r=d("input"),$(r,"type","color"),$(r,"class","svelte-h11bn9"),$(e,"class","thread svelte-h11bn9"),$(e,"style",l=`background-color: ${n[0].color}`)},m(t,o){f(t,e,o),u(e,r),v(r,n[0].color),c||(s=[m(r,"input",n[2]),m(r,"click",n[1])],c=!0)},p(t,[n]){1&n&&v(r,t[0].color),1&n&&l!==(l=`background-color: ${t[0].color}`)&&$(e,"style",l)},i:t,o:t,d(t){t&&a(e),c=!1,o(s)}}}function dt(t,n,e){let{config:o}=n;return t.$$set=t=>{"config"in t&&e(0,o=t.config)},[o,function(n){D.call(this,t,n)},function(){o.color=this.value,e(0,o)}]}class ht extends Y{constructor(t){super(),X(this,t,dt,at,l,{config:0})}}function gt(t,n,e){const o=t.slice();return o[4]=n[e],o[5]=n,o[1]=e,o}function pt(t,n){let e,o,r,l;function c(t){n[3](t,n[4],n[5],n[1])}let s={};return void 0!==n[4]&&(s.config=n[4]),o=new ht({props:s}),M.push((()=>F(o,"config",c))),{key:t,first:null,c(){e=p(),G(o.$$.fragment),this.first=e},m(t,n){f(t,e,n),K(o,t,n),l=!0},p(t,e){n=t;const l={};!r&&1&e&&(r=!0,l.config=n[4],O((()=>r=!1))),o.$set(l)},i(t){l||(P(o.$$.fragment,t),l=!0)},o(t){V(o.$$.fragment,t),l=!1},d(t){t&&a(e),Q(o,t)}}}function mt(t){let n;return{c(){n=h("Z")},m(t,e){f(t,n,e)},d(t){t&&a(n)}}}function kt(t){let n;return{c(){n=h("S")},m(t,e){f(t,n,e)},d(t){t&&a(n)}}}function $t(t){let n,e,o,r,l,c,s,i,p,k,v=t[1]+1+"",w=[],y=new Map,x=t[0].threads;const S=t=>t[1];for(let n=0;n<x.length;n+=1){let e=gt(t,x,n),o=S(e);y.set(o,w[n]=pt(o,e))}function D(t,n){return t[0].sDirection?kt:mt}let _=D(t),M=_(t);return{c(){n=d("div"),e=d("div"),o=h(v),r=g();for(let t=0;t<w.length;t+=1)w[t].c();l=g(),c=d("div"),s=d("button"),M.c(),$(e,"class","tabletIndex uk-text-center svelte-1bwpjk1"),$(s,"class","uk-button uk-button-default svelte-1bwpjk1"),$(c,"class","threadDirection svelte-1bwpjk1"),$(n,"class","tablet svelte-1bwpjk1")},m(a,d){f(a,n,d),u(n,e),u(e,o),u(n,r);for(let t=0;t<w.length;t+=1)w[t].m(n,null);u(n,l),u(n,c),u(c,s),M.m(s,null),i=!0,p||(k=m(s,"click",t[2]),p=!0)},p(t,[e]){(!i||2&e)&&v!==(v=t[1]+1+"")&&b(o,v),1&e&&(x=t[0].threads,z(),w=Z(w,e,S,1,t,x,y,n,W,pt,l,gt),B()),_!==(_=D(t))&&(M.d(1),M=_(t),M&&(M.c(),M.m(s,null)))},i(t){if(!i){for(let t=0;t<x.length;t+=1)P(w[t]);i=!0}},o(t){for(let t=0;t<w.length;t+=1)V(w[t]);i=!1},d(t){t&&a(n);for(let t=0;t<w.length;t+=1)w[t].d();M.d(),p=!1,k()}}}function bt(t,n,e){let{index:o}=n,{config:r}=n;return t.$$set=t=>{"index"in t&&e(1,o=t.index),"config"in t&&e(0,r=t.config)},[r,o,function(){e(0,r.sDirection=!r.sDirection,r)},function(t,n,o,l){o[l]=t,e(0,r)}]}class vt extends Y{constructor(t){super(),X(this,t,bt,$t,l,{index:1,config:0})}}function wt(n){let e,o;return{c(){e=d("div"),$(e,"class","weave svelte-1269drx"),$(e,"style",o=`background-color: ${n[0].color}`),y(e,"sDirection",n[0].sDirection)},m(t,n){f(t,e,n)},p(t,[n]){1&n&&o!==(o=`background-color: ${t[0].color}`)&&$(e,"style",o),1&n&&y(e,"sDirection",t[0].sDirection)},i:t,o:t,d(t){t&&a(e)}}}function yt(t,n,e){let{weave:o}=n;return t.$$set=t=>{"weave"in t&&e(0,o=t.weave)},[o]}class xt extends Y{constructor(t){super(),X(this,t,yt,wt,l,{weave:0})}}function St(t,n,e){const o=t.slice();return o[1]=n[e],o[3]=e,o}function Dt(t,n){let e,o,r;return o=new xt({props:{weave:n[1]}}),{key:t,first:null,c(){e=p(),G(o.$$.fragment),this.first=e},m(t,n){f(t,e,n),K(o,t,n),r=!0},p(t,e){n=t;const r={};1&e&&(r.weave=n[1]),o.$set(r)},i(t){r||(P(o.$$.fragment,t),r=!0)},o(t){V(o.$$.fragment,t),r=!1},d(t){t&&a(e),Q(o,t)}}}function _t(t){let n,e,o=[],r=new Map,l=t[0].weaves;const c=t=>t[3];for(let n=0;n<l.length;n+=1){let e=St(t,l,n),s=c(e);r.set(s,o[n]=Dt(s,e))}return{c(){n=d("div");for(let t=0;t<o.length;t+=1)o[t].c();$(n,"class","tablet svelte-a4lk3j")},m(t,r){f(t,n,r);for(let t=0;t<o.length;t+=1)o[t].m(n,null);e=!0},p(t,[e]){1&e&&(l=t[0].weaves,z(),o=Z(o,e,c,1,t,l,r,n,W,Dt,null,St),B())},i(t){if(!e){for(let t=0;t<l.length;t+=1)P(o[t]);e=!0}},o(t){for(let t=0;t<o.length;t+=1)V(o[t]);e=!1},d(t){t&&a(n);for(let t=0;t<o.length;t+=1)o[t].d()}}}function Mt(t,n,e){let{config:o}=n;return t.$$set=t=>{"config"in t&&e(0,o=t.config)},[o]}class At extends Y{constructor(t){super(),X(this,t,Mt,_t,l,{config:0})}}function Et(t,n,e){const o=t.slice();return o[13]=n[e],o[15]=e,o}function jt(t,n,e){const o=t.slice();return o[16]=n[e],o[15]=e,o}function Ct(t,n,e){const o=t.slice();return o[18]=n[e],o[15]=e,o}function Nt(t,n,e){const o=t.slice();return o[13]=n[e],o[20]=n,o[15]=e,o}function Ot(t,n,e){const o=t.slice();return o[21]=n[e],o[15]=e,o}function Lt(t,n){let e,o,r,l=String.fromCharCode(65+n[15])+"";return{key:t,first:null,c(){e=d("div"),o=h(l),r=g(),$(e,"class","holeIndex svelte-33okvt"),this.first=e},m(t,n){f(t,e,n),u(e,o),u(e,r)},p(t,e){n=t,2&e&&l!==(l=String.fromCharCode(65+n[15])+"")&&b(o,l)},d(t){t&&a(e)}}}function Tt(t,n){let e,o,r,l;function c(t){n[9](t,n[13],n[20],n[15])}let s={index:n[15]};return void 0!==n[13]&&(s.config=n[13]),o=new vt({props:s}),M.push((()=>F(o,"config",c))),{key:t,first:null,c(){e=p(),G(o.$$.fragment),this.first=e},m(t,n){f(t,e,n),K(o,t,n),l=!0},p(t,e){n=t;const l={};2&e&&(l.index=n[15]),!r&&2&e&&(r=!0,l.config=n[13],O((()=>r=!1))),o.$set(l)},i(t){l||(P(o.$$.fragment,t),l=!0)},o(t){V(o.$$.fragment,t),l=!1},d(t){t&&a(e),Q(o,t)}}}function It(t,n){let e,o,r,l,c,s,i,g,p=n[1].length+"",k=n[18]?"vorwärts":"rückwärts";function $(){return n[10](n[15])}return{key:t,first:null,c(){e=d("li"),o=h("Brettchen 1 bis "),r=h(p),l=h(": "),c=d("a"),s=h(k),this.first=e},m(t,n){f(t,e,n),u(e,o),u(e,r),u(e,l),u(e,c),u(c,s),i||(g=m(c,"click",$),i=!0)},p(t,e){n=t,2&e&&p!==(p=n[1].length+"")&&b(r,p),4&e&&k!==(k=n[18]?"vorwärts":"rückwärts")&&b(s,k)},d(t){t&&a(e),i=!1,g()}}}function Jt(t,n){let e,o,r,l,c=n[15]+1+"";function s(){return n[11](n[15])}return{key:t,first:null,c(){e=d("a"),o=h(c),$(e,"class","b"),w(e,"height","17px"),w(e,"padding-top","3.6px"),w(e,"display","block"),this.first=e},m(t,n){f(t,e,n),u(e,o),r||(l=m(e,"click",s),r=!0)},p(t,e){n=t,1&e&&c!==(c=n[15]+1+"")&&b(o,c)},d(t){t&&a(e),r=!1,l()}}}function Rt(t,n){let e,o,r;return o=new At({props:{config:n[13]}}),{key:t,first:null,c(){e=p(),G(o.$$.fragment),this.first=e},m(t,n){f(t,e,n),K(o,t,n),r=!0},p(t,e){n=t;const r={};8&e&&(r.config=n[13]),o.$set(r)},i(t){r||(P(o.$$.fragment,t),r=!0)},o(t){V(o.$$.fragment,t),r=!1},d(t){t&&a(e),Q(o,t)}}}function Ht(t){let n,e,r,l,c,s,i,h,p,b,v,y,x,S,D,_,M,A,E,j,C,N,O,L,T,I,J,R,H,F,G,K,Q,U,X,Y,tt,nt,et,ot,rt,lt,ct,st,it,ut,ft,at,dt,ht,gt,pt=[],mt=new Map,kt=[],$t=new Map,bt=[],vt=new Map,wt=[],yt=new Map,xt=[],St=new Map,Dt=t[1][0].threads;const _t=t=>t[15];for(let n=0;n<Dt.length;n+=1){let e=Ot(t,Dt,n),o=_t(e);mt.set(o,pt[n]=Lt(o,e))}let Mt=t[1];const At=t=>t[15];for(let n=0;n<Mt.length;n+=1){let e=Nt(t,Mt,n),o=At(e);$t.set(o,kt[n]=Tt(o,e))}let Ht=t[2];const zt=t=>t[15];for(let n=0;n<Ht.length;n+=1){let e=Ct(t,Ht,n),o=zt(e);vt.set(o,bt[n]=It(o,e))}let Bt=[...Array(t[0]).keys()];const Pt=t=>t[15];for(let n=0;n<Bt.length;n+=1){let e=jt(t,Bt,n),o=Pt(e);yt.set(o,wt[n]=Jt(o,e))}let Vt=t[3];const qt=t=>t[15];for(let n=0;n<Vt.length;n+=1){let e=Et(t,Vt,n),o=qt(e);St.set(o,xt[n]=Rt(o,e))}return{c(){n=d("main"),e=d("div"),r=d("div"),l=d("h2"),l.textContent="Webbrief",c=g(),s=d("div"),i=d("div"),h=g(),p=d("div"),b=d("div"),v=d("div"),y=g();for(let t=0;t<pt.length;t+=1)pt[t].c();x=g();for(let t=0;t<kt.length;t+=1)kt[t].c();S=g(),D=d("div"),_=d("button"),M=d("br"),A=g(),E=d("button"),j=g(),C=d("div"),N=d("div"),O=d("h2"),O.textContent="Vorschau",L=g(),T=d("div"),I=d("div"),I.innerHTML="<h3>Anleitung</h3>",J=g(),R=d("div"),R.innerHTML="<h3>Vorderseite</h3>",H=g(),F=d("div"),F.innerHTML="<h3>Rückseite</h3>",G=g(),K=d("div"),Q=d("ol");for(let t=0;t<bt.length;t+=1)bt[t].c();U=g(),X=d("div"),Y=d("div");for(let t=0;t<wt.length;t+=1)wt[t].c();tt=g();for(let t=0;t<xt.length;t+=1)xt[t].c();nt=g(),et=d("div"),ot=g(),rt=d("div"),lt=g(),ct=d("div"),st=d("button"),it=g(),ut=d("button"),ft=g(),at=d("div"),$(v,"class","holeIndex svelte-33okvt"),$(b,"class","holes svelte-33okvt"),$(p,"class","uk-width-auto"),$(_,"class","uk-icon-button uk-button-secondary uk-button-large uk-width-small uk-margin-small-bottom "),$(_,"uk-icon","plus"),$(E,"class","uk-icon-button uk-button-secondary uk-button-large uk-width-small"),$(E,"uk-icon","minus"),$(s,"class","uk-grid-column-small uk-grid-row-large uk-child-width-1-3 uk-grid-match uk-flex-center uk-flex-middle"),$(s,"uk-grid",""),$(r,"class","uk-container uk-container-small uk-container-expand"),$(e,"class","uk-section uk-section-xsmall uk-section-muted"),$(I,"class","uk-text-center"),$(R,"class","uk-width-auto uk-margin-medium-bottom"),$(F,"class","uk-text-center"),$(K,"class","uk-text-small"),$(Y,"class","uk-text-small"),w(Y,"width","25px"),w(Y,"float","left"),w(Y,"text-align","right"),w(Y,"padding-right","5px"),w(Y,"margin-top","-25px"),$(X,"class","uk-width-auto uk-margin-medium-top"),$(st,"class","uk-icon-button uk-button-secondary uk-button-large uk-width-small uk-margin-small-bottom "),$(st,"uk-icon","plus"),$(ut,"class","uk-icon-button uk-button-secondary uk-button-large uk-width-small"),$(ut,"uk-icon","minus"),$(ct,"class","uk-width-auto uk-margin-medium-top"),$(T,"class","uk-grid-column-small uk-grid-row-small uk-child-width-1-3 uk-grid-match uk-flex-center uk-flex-top"),$(T,"uk-grid",""),$(N,"class","uk-container uk-container-small uk-container-expand"),$(C,"class","uk-section uk-section-xsmall")},m(o,a){f(o,n,a),u(n,e),u(e,r),u(r,l),u(r,c),u(r,s),u(s,i),u(s,h),u(s,p),u(p,b),u(b,v),u(b,y);for(let t=0;t<pt.length;t+=1)pt[t].m(b,null);u(p,x);for(let t=0;t<kt.length;t+=1)kt[t].m(p,null);u(s,S),u(s,D),u(D,_),u(D,M),u(D,A),u(D,E),u(n,j),u(n,C),u(C,N),u(N,O),u(N,L),u(N,T),u(T,I),u(T,J),u(T,R),u(T,H),u(T,F),u(T,G),u(T,K),u(K,Q);for(let t=0;t<bt.length;t+=1)bt[t].m(Q,null);u(T,U),u(T,X),u(X,Y);for(let t=0;t<wt.length;t+=1)wt[t].m(Y,null);u(X,tt);for(let t=0;t<xt.length;t+=1)xt[t].m(X,null);u(T,nt),u(T,et),u(T,ot),u(T,rt),u(T,lt),u(T,ct),u(ct,st),u(ct,it),u(ct,ut),u(T,ft),u(T,at),dt=!0,ht||(gt=[m(_,"click",k(t[4])),m(E,"click",k(t[5])),m(st,"click",k(t[6])),m(ut,"click",k(t[7]))],ht=!0)},p(t,[n]){2&n&&(Dt=t[1][0].threads,pt=Z(pt,n,_t,1,t,Dt,mt,b,q,Lt,null,Ot)),2&n&&(Mt=t[1],z(),kt=Z(kt,n,At,1,t,Mt,$t,p,W,Tt,null,Nt),B()),262&n&&(Ht=t[2],bt=Z(bt,n,zt,1,t,Ht,vt,Q,q,It,null,Ct)),257&n&&(Bt=[...Array(t[0]).keys()],wt=Z(wt,n,Pt,1,t,Bt,yt,Y,q,Jt,null,jt)),8&n&&(Vt=t[3],z(),xt=Z(xt,n,qt,1,t,Vt,St,X,W,Rt,null,Et),B())},i(t){if(!dt){for(let t=0;t<Mt.length;t+=1)P(kt[t]);for(let t=0;t<Vt.length;t+=1)P(xt[t]);dt=!0}},o(t){for(let t=0;t<kt.length;t+=1)V(kt[t]);for(let t=0;t<xt.length;t+=1)V(xt[t]);dt=!1},d(t){t&&a(n);for(let t=0;t<pt.length;t+=1)pt[t].d();for(let t=0;t<kt.length;t+=1)kt[t].d();for(let t=0;t<bt.length;t+=1)bt[t].d();for(let t=0;t<wt.length;t+=1)wt[t].d();for(let t=0;t<xt.length;t+=1)xt[t].d();ht=!1,o(gt)}}}function zt(t,n,e){let o,r,l,c,u;function f(t){o.includes(t)?i(it,o=o.filter((n=>n!==t)),o):(o.push(t),it.set(o)),console.log(o)}s(t,it,(t=>e(12,o=t))),s(t,ct,(t=>e(0,r=t))),s(t,st,(t=>e(1,l=t))),s(t,ut,(t=>e(2,c=t))),s(t,ft,(t=>e(3,u=t)));return[r,l,c,u,function(t){st.update((t=>{const n=t[t.length-1],e={sDirection:n.sDirection,threads:n.threads.map((t=>({color:t.color})))};return t.push(e),t}))},function(t){l.length>1&&l.length<26&&st.update((t=>(t.pop(),t)))},function(t){i(ct,r+=1,r)},function(t){i(ct,r-=1,r)},f,function(t,n,e,o){e[o]=t,st.set(l)},t=>f(t),t=>f(t)]}return new class extends Y{constructor(t){super(),X(this,t,zt,Ht,l,{})}}({target:document.body})}();
//# sourceMappingURL=bundle.js.map
