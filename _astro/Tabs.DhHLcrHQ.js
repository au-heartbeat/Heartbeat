import{p as T,_ as x,F as v,A as N}from"./hooks.module.BJvh2z1e.js";/* empty css                          */import{s as p}from"./Tabs_module.10b4e6eb.DqIA4t4U.js";import{u as m}from"./jsxRuntime.module.Dl9dozpx.js";import"./preact.module.DgCY89ob.js";let c=[],K=(t,e)=>{let o=[],n={get(){return n.lc||n.listen(()=>{})(),n.value},l:0,lc:0,listen(r,u){return n.lc=o.push(r,u||n.l)/2,()=>{let a=o.indexOf(r);~a&&(o.splice(a,2),--n.lc||n.off())}},notify(r,u){let a=!c.length;for(let i=0;i<o.length;i+=2)c.push(o[i],o[i+1],n.value,r,u);if(a){for(let i=0;i<c.length;i+=5){let d;for(let h=i+1;!d&&(h+=5)<c.length;)c[h]<c[i+1]&&(d=c.push(c[i],c[i+1],c[i+2],c[i+3],c[i+4]));d||c[i](c[i+2],c[i+3],c[i+4])}c.length=0}},off(){},set(r){let u=n.value;u!==r&&(n.value=r,n.notify(u))},subscribe(r,u){let a=n.listen(r,u);return r(n.value),a},value:t};return n};function j(t,e,o){let n=new Set([...e,void 0]);return t.listen((r,u,a)=>{n.has(a)&&o(r,u,a)})}let F=(t={})=>{let e=K(t);return e.setKey=function(o,n){let r=e.value;typeof n>"u"&&o in e.value?(e.value={...e.value},delete e.value[o],e.notify(r,o)):e.value[o]!==n&&(e.value={...e.value,[o]:n},e.notify(r,o))},e};const S=K(0),B=F({});function P(){const t=S.get();return S.set(t+1),t}function A(t,e={}){let[,o]=T({}),[n]=T(t.get());return x(()=>{n!==t.get()&&o({})},[]),x(()=>{let r,u,a,i=()=>{r||(r=1,u=setTimeout(()=>{r=void 0,o({})}))};return e.keys?a=j(t,e.keys,i):a=t.listen(i),()=>{a(),clearTimeout(u)}},[t,""+e.keys]),t.get()}function L(t,e){const o=A(B),n=T(t);if(!e)return n;const r=o[e]?.curr??t;function u(a){if(e)B.setKey(e,{curr:a});else throw new Error("[Tabs] Looks like a sharedStore key is no longer present on your tab view! If your store key is dynamic, consider using a static string value instead.")}return[r,u]}const w="tab.",I="panel.";function O(t){const[e]=t;return e.startsWith(w)}function Q(t){const[e]=t;return e.startsWith(I)}function g(t){return t.replace(new RegExp(`^${w}`),"")}function $(t){return t.replace(new RegExp(`^${I}`),"")}function M({sharedStore:t,...e}){const o=P(),n=Object.entries(e).filter(Q).filter(l=>!R(l)),r=Object.entries(e).filter(O).filter(([l])=>!R(n.find(([s])=>s===`${I}${g(l)}`))),u=v({}),a=v(null),i=v(null),d=v(null),h=n[0]?.[0]??"",[b,E]=L($(h),t);function y(l,s){t&&(a.current=s),E(g(l))}function R(l){return!l||(typeof l[1]!="object"?l[1]:l[1].props.value.toString())===""}x(()=>{a.current&&(a.current.scrollIntoView({behavior:"smooth"}),a.current=null)},[b]),N(()=>{const l=u?.current[`tab.${b}`];if(d.current&&i.current&&l){const s=l.getBoundingClientRect(),f=i.current.getBoundingClientRect();d.current.style.width||(d.current.style.width="1px"),d.current.style.transform=`translateX(${s.left-f.left}px) scaleX(${s.width})`}},[b]);function C(l){if(l.key==="ArrowLeft"){const s=r.findIndex(([f])=>g(f)===b);if(s>0){const[f]=r[s-1];y(f,u.current[f]),u.current[f]?.focus()}}if(l.key==="ArrowRight"){const s=r.findIndex(([f])=>g(f)===b);if(s<r.length-1){const[f]=r[s+1];y(f,u.current[f]),u.current[f]?.focus()}}}return m("div",{className:p.container,children:[m("div",{className:p["tab-scroll-overflow"],children:m("div",{ref:i,className:`${p.tablist} TabGroup no-flex`,role:"tablist",onKeyDown:C,children:[r.map(([l,s])=>m("button",{ref:f=>u.current[l]=f,onClick:()=>y(l,u.current[l]),"aria-selected":b===g(l),tabIndex:b===g(l)?0:-1,role:"tab",type:"button",className:p.tab,id:`${o}-${l}`,children:s},l)),m("span",{ref:d,className:p.selectedIndicator,"aria-hidden":"true"})]})}),n.map(([l,s])=>m("div",{hidden:b!==$(l),role:"tabpanel","aria-labelledby":`${o}-${w}${$(l)}`,className:p.tabpanel,children:s},l))]})}export{M as default};
