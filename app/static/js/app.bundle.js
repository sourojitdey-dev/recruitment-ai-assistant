(()=>{var Ke="/api/v1",X=class extends Error{constructor(i,a,o){super(i),this.name="ApiError",this.status=a,this.data=o}};async function V(e,i={}){let a=localStorage.getItem("token"),o=i.headers||{};a&&!o.Authorization&&(o.Authorization=`Bearer ${a}`),!(i.body instanceof FormData)&&!(i.body instanceof URLSearchParams)&&(o["Content-Type"]="application/json");let d=e.startsWith("http")?e:`${Ke}${e.startsWith("/")?"":"/"}${e}`,r=await fetch(d,{...i,headers:o});if(r.status===401){let n=window.location.hash;n!=="#/login"&&n!=="#/"&&!n.startsWith("#/register")&&n!=="#/forgot-password"&&(localStorage.removeItem("token"),localStorage.removeItem("user"),window.location.hash="#/login")}let l=null;if(r.status!==204&&r.status!==205){let n=r.headers.get("content-type");if(n&&n.includes("application/json"))try{l=await r.json()}catch{l=null}else try{l=await r.text()}catch{l=null}}if(!r.ok){let n="An unexpected error occurred";throw l&&typeof l=="object"?n=l.detail||l.message||JSON.stringify(l):typeof l=="string"&&l.length>0&&(n=l),new X(n,r.status,l)}return l}var m={get:(e,i=null)=>{let a=e;if(i){let o=new URLSearchParams(i).toString();a=`${e}${e.includes("?")?"&":"?"}${o}`}return V(a,{method:"GET"})},post:(e,i,a=!1)=>{let o=i;return a&&!(i instanceof FormData)&&!(i instanceof URLSearchParams)?o=new URLSearchParams(i):!a&&!(i instanceof FormData)&&(o=JSON.stringify(i)),V(e,{method:"POST",body:o})},put:(e,i)=>V(e,{method:"PUT",body:JSON.stringify(i)}),delete:e=>V(e,{method:"DELETE"})};var ee=class{constructor(){this.token=localStorage.getItem("token")||null,this.user=this.loadStoredUser(),this.listeners=[]}loadStoredUser(){try{let i=localStorage.getItem("user");return i?JSON.parse(i):null}catch{return null}}onChange(i){return this.listeners.push(i),()=>{this.listeners=this.listeners.filter(a=>a!==i)}}notify(){this.listeners.forEach(i=>i(this.user,this.token))}isAuthenticated(){return!!this.token&&!!this.user}getUser(){return this.user}getRole(){return this.user?(this.user.role||"candidate").toLowerCase():null}getToken(){return this.token}async verifySession(){if(!this.token)return this.user=null,this.notify(),null;try{let i=await m.get("/auth/me");return this.user=i,localStorage.setItem("user",JSON.stringify(i)),this.notify(),i}catch(i){return console.warn("Session verification failed, logging out:",i),this.logout(),null}}async login(i,a){let o=new URLSearchParams;o.append("username",i),o.append("password",a);let r=(await m.post("/auth/login",o,!0)).access_token;this.token=r,localStorage.setItem("token",r);let l=await m.get("/auth/me");return this.user=l,localStorage.setItem("user",JSON.stringify(l)),this.notify(),l}async registerCandidate(i){return await m.post("/auth/register",i)}async registerRecruiter(i){return await m.post("/auth/register/recruiter",i)}async registerInterviewer(i){return await m.post("/auth/register/interviewer",i)}async forgotPassword(i){return await m.post("/auth/forgot-password",i)}logout(){this.token=null,this.user=null,localStorage.removeItem("token"),localStorage.removeItem("user"),this.notify()}},x=new ee;var t={Sparkles:(e="w-5 h-5")=>`
    <svg class="${e}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
    </svg>`,Briefcase:(e="w-5 h-5")=>`
    <svg class="${e}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>`,FileText:(e="w-5 h-5")=>`
    <svg class="${e}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
      <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
      <path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>
    </svg>`,FileCheck:(e="w-5 h-5")=>`
    <svg class="${e}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
      <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
      <path d="m9 15 2 2 4-4"/>
    </svg>`,Send:(e="w-5 h-5")=>`
    <svg class="${e}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m22 2-7 20-4-9-9-4Z"/>
      <path d="M22 2 11 13"/>
    </svg>`,Calendar:(e="w-5 h-5")=>`
    <svg class="${e}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/>
      <path d="M3 10h18"/>
    </svg>`,Bot:(e="w-5 h-5")=>`
    <svg class="${e}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/>
      <path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>
    </svg>`,Shield:(e="w-5 h-5")=>`
    <svg class="${e}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
    </svg>`,ShieldCheck:(e="w-5 h-5")=>`
    <svg class="${e}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>`,Users:(e="w-5 h-5")=>`
    <svg class="${e}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>`,User:(e="w-5 h-5")=>`
    <svg class="${e}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>`,UserCheck:(e="w-5 h-5")=>`
    <svg class="${e}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <polyline points="16 11 18 13 22 9"/>
    </svg>`,FolderLock:(e="w-5 h-5")=>`
    <svg class="${e}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10 20H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v2.5"/>
      <rect width="8" height="5" x="14" y="17" rx="1"/>
      <path d="M18 17v-2a2 2 0 1 0-4 0v2"/>
    </svg>`,Lock:(e="w-5 h-5")=>`
    <svg class="${e}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>`,Mail:(e="w-5 h-5")=>`
    <svg class="${e}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>`,BookOpen:(e="w-5 h-5")=>`
    <svg class="${e}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>`,Heart:(e="w-5 h-5")=>`
    <svg class="${e}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    </svg>`,KeyRound:(e="w-5 h-5")=>`
    <svg class="${e}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z"/>
      <circle cx="16.5" cy="7.5" r=".5"/>
    </svg>`,Building2:(e="w-5 h-5")=>`
    <svg class="${e}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
      <path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
    </svg>`,Search:(e="w-5 h-5")=>`
    <svg class="${e}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>`,MapPin:(e="w-5 h-5")=>`
    <svg class="${e}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>`,CheckCircle2:(e="w-5 h-5")=>`
    <svg class="${e}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
    </svg>`,AlertCircle:(e="w-5 h-5")=>`
    <svg class="${e}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
    </svg>`,Edit2:(e="w-5 h-5")=>`
    <svg class="${e}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>
    </svg>`,Trash2:(e="w-5 h-5")=>`
    <svg class="${e}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>
    </svg>`,Plus:(e="w-5 h-5")=>`
    <svg class="${e}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 12h14"/><path d="M12 5v14"/>
    </svg>`,ArrowRight:(e="w-5 h-5")=>`
    <svg class="${e}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
    </svg>`,Check:(e="w-5 h-5")=>`
    <svg class="${e}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>`,Copy:(e="w-5 h-5")=>`
    <svg class="${e}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
    </svg>`,RefreshCw:(e="w-5 h-5")=>`
    <svg class="${e}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
      <path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
      <path d="M8 16H3v5"/>
    </svg>`,XCircle:(e="w-5 h-5")=>`
    <svg class="${e}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>
    </svg>`,Clock:(e="w-5 h-5")=>`
    <svg class="${e}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>`,Upload:(e="w-5 h-5")=>`
    <svg class="${e}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>
    </svg>`,LogOut:(e="w-5 h-5")=>`
    <svg class="${e}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
    </svg>`,TrendingUp:(e="w-5 h-5")=>`
    <svg class="${e}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
    </svg>`,Phone:(e="w-5 h-5")=>`
    <svg class="${e}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>`,LayoutDashboard:(e="w-5 h-5")=>`
    <svg class="${e}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/>
      <rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
    </svg>`,X:(e="w-5 h-5")=>`
    <svg class="${e}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>`};function u(e,i="success",a=3500){let o=document.getElementById("toast-container");o||(o=document.createElement("div"),o.id="toast-container",o.className="toast-container",document.body.appendChild(o));let d=document.createElement("div");d.className=`toast toast-${i}`;let r=i==="success"?t.CheckCircle2("w-5 h-5 shrink-0 text-emerald-400"):i==="error"?t.AlertCircle("w-5 h-5 shrink-0 text-rose-400"):t.Sparkles("w-5 h-5 shrink-0 text-indigo-400");d.innerHTML=`
    ${r}
    <span style="flex: 1;">${e}</span>
  `,o.appendChild(d),setTimeout(()=>{d.style.opacity="0",d.style.transform="translateY(10px) scale(0.95)",setTimeout(()=>d.remove(),300)},a)}var W=null;function R({title:e,contentHtml:i,maxWidth:a="600px",onClose:o=null}){E(),W=o;let d=document.createElement("div");d.id="active-modal-backdrop",d.className="modal-backdrop",d.innerHTML=`
    <div class="modal-container" style="max-width: ${a};" onclick="event.stopPropagation()">
      <div class="modal-header">
        <h3 class="modal-title">${e}</h3>
        <button class="modal-close-btn" id="modal-close-action" aria-label="Close">
          ${t.X("w-5 h-5")}
        </button>
      </div>
      <div class="modal-body">
        ${i}
      </div>
    </div>
  `,d.addEventListener("click",()=>E()),document.body.appendChild(d),requestAnimationFrame(()=>{d.classList.add("open")}),document.getElementById("modal-close-action")?.addEventListener("click",()=>E())}function E(){let e=document.getElementById("active-modal-backdrop");e&&(e.classList.remove("open"),typeof W=="function"&&(W(),W=null),setTimeout(()=>e.remove(),200))}function P(e){let i=(e||"unknown").toLowerCase(),a=i.charAt(0).toUpperCase()+i.slice(1);return`<span class="status-badge status-${i}">${a}</span>`}function T(e,i="sm"){let a=Math.round(e||0),o="match-medium";a>=80?o="match-high":a<50&&(o="match-low");let d=`match-badge-${i}`;return`
    <div class="match-score-badge ${o} ${d}">
      ${t.Sparkles(i==="lg"?"w-4 h-4":"w-3 h-3")}
      <span>${a}% Match</span>
    </div>
  `}function ge(){let e=x.getUser(),i=x.isAuthenticated(),a=window.location.hash||"#/";return`
    <header class="app-navbar">
      <div class="navbar-inner">
        <!-- Logo -->
        <a href="#/" class="brand-logo">
          <div class="brand-icon-box">
            ${t.Sparkles("w-5 h-5 text-white")}
          </div>
          <div>
            <span class="brand-title">Recruit<span class="text-gradient">AI</span></span>
            <span class="brand-subtitle">Career Intelligence</span>
          </div>
        </a>

        <!-- Right Side Actions -->
        <div style="display: flex; align-items: center; gap: 1rem;">
          ${i&&e?`
              <!-- Role Badge -->
              <div class="status-badge status-${e.role||"applied"} hidden-mobile">
                ${t.Shield("w-3 h-3")}
                <span>${e.role}</span>
              </div>

              <!-- Profile Link -->
              <a href="#/profile" style="display: flex; align-items: center; gap: 0.6rem; text-decoration: none; color: var(--text-primary);">
                <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #a855f7); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
                  ${(e.name||"U").charAt(0).toUpperCase()}
                </div>
                <span style="font-weight: 600; font-size: 0.875rem;">${e.name}</span>
              </a>

              <!-- AI Assistant Shortcut -->
              <a href="#/chat" class="glass-btn glass-btn-secondary glass-btn-sm hidden-mobile">
                ${t.Bot("w-4 h-4 text-accent")}
                <span>AI Assistant</span>
              </a>

              <!-- Logout -->
              <button id="nav-logout-btn" class="glass-btn glass-btn-outline glass-btn-sm" title="Sign Out" style="padding: 0.4rem 0.6rem;">
                ${t.LogOut("w-4 h-4 text-muted")}
              </button>
            `:`
              <a href="#/login" class="glass-btn glass-btn-outline glass-btn-sm">Sign In</a>
              <a href="#/register" class="glass-btn glass-btn-primary glass-btn-sm">Get Started</a>
            `}
        </div>
      </div>
    </header>
  `}function fe(){let e=x.getUser();if(!e)return"";let i=(e.role||"candidate").toLowerCase(),a=window.location.hash||"#/dashboard",o=[{to:"#/dashboard",label:"Dashboard",icon:t.LayoutDashboard},{to:"#/jobs",label:"Explore Jobs",icon:t.Briefcase},{to:"#/resume",label:"My Resume",icon:t.FileText},{to:"#/applications",label:"My Applications",icon:t.Send},{to:"#/interviews",label:"My Interviews",icon:t.Calendar},{to:"#/chat",label:"AI Career Assistant",icon:t.Bot,highlight:!0}],d=[{to:"#/dashboard",label:"Dashboard",icon:t.LayoutDashboard},{to:"#/recruiter/jobs",label:"Job Postings",icon:t.Briefcase},{to:"#/recruiter/applications",label:"Applications & Review",icon:t.Users},{to:"#/recruiter/interviews",label:"Interviews & Schedules",icon:t.Calendar},{to:"#/recruiter/matching",label:"AI Candidate Matcher",icon:t.Sparkles,highlight:!0},{to:"#/recruiter/documents",label:"Company Documents",icon:t.FolderLock},{to:"#/chat",label:"AI Recruiter Assistant",icon:t.Bot}],r=[{to:"#/dashboard",label:"Dashboard",icon:t.LayoutDashboard},{to:"#/interviewer/interviews",label:"Assigned Interviews",icon:t.Calendar},{to:"#/profile",label:"My Profile",icon:t.UserCheck}],l=o;return i==="recruiter"||i==="admin"?l=d:i==="interviewer"&&(l=r),`
    <aside class="app-sidebar">
      <div class="sidebar-sticky">
        <div class="sidebar-header">
          Navigation \u2022 ${i}
        </div>
        ${l.map(n=>{let s=a===n.to||n.to==="#/dashboard"&&a==="#/";return`
              <a href="${n.to}" class="sidebar-link ${s?"active":""} ${n.highlight&&!s?"highlight":""}">
                ${n.icon("w-4 h-4 shrink-0")}
                <span>${n.label}</span>
              </a>
            `}).join("")}
      </div>
    </aside>
  `}function ue(){return`
    <div style="display: flex; flex-direction: column; gap: 5rem; padding: 2.5rem 0 5rem 0;">
      <!-- Hero Section -->
      <section style="text-align: center; max-width: 850px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 1.5rem;">
        <div style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.4rem 1rem; border-radius: 9999px; background: rgba(79, 70, 229, 0.15); border: 1px solid rgba(139, 92, 246, 0.3); color: #c084fc; font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
          ${t.Sparkles("w-4 h-4 text-cyan-400")}
          Next-Gen AI Recruitment & Career Intelligence
        </div>

        <h1 style="font-size: clamp(2.2rem, 5vw, 3.8rem); font-weight: 800; line-height: 1.15; letter-spacing: -0.02em; color: #ffffff;">
          Smarter Recruitment. <br />
          <span class="text-gradient">Grounded Career Guidance.</span>
        </h1>

        <p style="font-size: 1.15rem; color: var(--text-secondary); max-width: 650px; line-height: 1.6;">
          An enterprise-grade platform connecting candidates, recruiters, and interviewers with 384-dimensional semantic matching, automated PDF resume parsing, and privacy-first RAG career assistance.
        </p>

        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem; padding-top: 1rem;">
          <a href="#/register" class="glass-btn glass-btn-primary glass-btn-lg">
            <span>Get Started Free</span>
            ${t.ArrowRight("w-5 h-5")}
          </a>
          <a href="#/jobs" class="glass-btn glass-btn-secondary glass-btn-lg">
            ${t.Briefcase("w-5 h-5 text-indigo-400")}
            <span>Explore Active Jobs</span>
          </a>
          <a href="#/chat" class="glass-btn glass-btn-outline glass-btn-lg">
            ${t.Bot("w-5 h-5 text-cyan-400")}
            <span>Try AI Career Assistant</span>
          </a>
        </div>
      </section>

      <!-- Feature Pillars -->
      <section style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
        <div class="glass-card glass-card-glow" style="display: flex; flex-direction: column; gap: 1rem;">
          <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(99, 102, 241, 0.18); border: 1px solid rgba(99, 102, 241, 0.3); display: flex; align-items: center; justify-content: center; color: #818cf8;">
            ${t.FileCheck("w-6 h-6")}
          </div>
          <h3 style="font-size: 1.25rem; font-weight: 700; color: #ffffff;">Semantic AI Matching</h3>
          <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6;">
            384-dimensional vector embeddings with pgvector compute deep semantic compatibility, extracting strong skills, partial matches, and potential gaps without hallucination.
          </p>
        </div>

        <div class="glass-card glass-card-glow" style="display: flex; flex-direction: column; gap: 1rem;">
          <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(168, 85, 247, 0.18); border: 1px solid rgba(168, 85, 247, 0.3); display: flex; align-items: center; justify-content: center; color: #c084fc;">
            ${t.Bot("w-6 h-6")}
          </div>
          <h3 style="font-size: 1.25rem; font-weight: 700; color: #ffffff;">RAG Career Advisory</h3>
          <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6;">
            Candidates receive actionable advice grounded only in verified company policies and their own uploaded resume, backed by Groq LLM and real-time WebSockets.
          </p>
        </div>

        <div class="glass-card glass-card-glow" style="display: flex; flex-direction: column; gap: 1rem;">
          <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(6, 182, 212, 0.18); border: 1px solid rgba(6, 182, 212, 0.3); display: flex; align-items: center; justify-content: center; color: #38bdf8;">
            ${t.ShieldCheck("w-6 h-6")}
          </div>
          <h3 style="font-size: 1.25rem; font-weight: 700; color: #ffffff;">Strict Company Isolation</h3>
          <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6;">
            Multi-tenant architecture guarantees recruiters cannot access other companies' candidates, documents, or interview pipelines. Zero cross-tenant leakage.
          </p>
        </div>
      </section>

      <!-- Roles Section -->
      <section style="display: flex; flex-direction: column; gap: 2rem;">
        <div style="text-align: center;">
          <h2 style="font-size: 1.85rem; font-weight: 800; color: #ffffff;">Tailored for Every Recruitment Role</h2>
          <p style="font-size: 0.9rem; color: var(--text-muted); margin-top: 0.4rem;">Unified workflows with strict permission scoping</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
          <!-- Candidate Role Card -->
          <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between; gap: 1.5rem; border-color: rgba(99, 102, 241, 0.25);">
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <span style="font-size: 0.75rem; font-weight: 800; color: #818cf8; text-transform: uppercase; letter-spacing: 0.05em;">For Candidates</span>
              <h4 style="font-size: 1.2rem; font-weight: 700; color: #ffffff;">Manage Career & Resumes</h4>
              <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem; font-size: 0.875rem; color: var(--text-secondary);">
                <li style="display: flex; align-items: center; gap: 0.5rem;">${t.CheckCircle2("w-4 h-4 text-emerald-400")} PDF Resume Parsing</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;">${t.CheckCircle2("w-4 h-4 text-emerald-400")} AI Match Percentage Breakdown</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;">${t.CheckCircle2("w-4 h-4 text-emerald-400")} Application Pipeline Tracker</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;">${t.CheckCircle2("w-4 h-4 text-emerald-400")} AI Interview Preparations</li>
              </ul>
            </div>
            <a href="#/register" class="glass-btn glass-btn-secondary" style="width: 100%;">Candidate Sign Up</a>
          </div>

          <!-- Recruiter Role Card -->
          <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between; gap: 1.5rem; border-color: rgba(168, 85, 247, 0.25);">
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <span style="font-size: 0.75rem; font-weight: 800; color: #c084fc; text-transform: uppercase; letter-spacing: 0.05em;">For Recruiters</span>
              <h4 style="font-size: 1.2rem; font-weight: 700; color: #ffffff;">Source, Match & Schedule</h4>
              <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem; font-size: 0.875rem; color: var(--text-secondary);">
                <li style="display: flex; align-items: center; gap: 0.5rem;">${t.CheckCircle2("w-4 h-4 text-emerald-400")} Company Job Posting Management</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;">${t.CheckCircle2("w-4 h-4 text-emerald-400")} Semantic AI Candidate Ranking</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;">${t.CheckCircle2("w-4 h-4 text-emerald-400")} Interviewer Dropdown Scheduling</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;">${t.CheckCircle2("w-4 h-4 text-emerald-400")} Company Knowledge Vector Store</li>
              </ul>
            </div>
            <a href="#/register-recruiter" class="glass-btn glass-btn-primary" style="width: 100%;">Recruiter Sign Up</a>
          </div>

          <!-- Interviewer Role Card -->
          <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between; gap: 1.5rem; border-color: rgba(6, 182, 212, 0.25);">
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <span style="font-size: 0.75rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em;">For Interviewers</span>
              <h4 style="font-size: 1.2rem; font-weight: 700; color: #ffffff;">Execute Evaluations</h4>
              <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem; font-size: 0.875rem; color: var(--text-secondary);">
                <li style="display: flex; align-items: center; gap: 0.5rem;">${t.CheckCircle2("w-4 h-4 text-emerald-400")} Assigned Interviews Exclusively</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;">${t.CheckCircle2("w-4 h-4 text-emerald-400")} Candidate & Job Context</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;">${t.CheckCircle2("w-4 h-4 text-emerald-400")} Mark Complete or Cancel</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;">${t.CheckCircle2("w-4 h-4 text-emerald-400")} Clean Focused Interface</li>
              </ul>
            </div>
            <a href="#/register-interviewer" class="glass-btn glass-btn-outline" style="width: 100%;">Interviewer Sign Up</a>
          </div>
        </div>
      </section>
    </div>
  `}function he(){return`
    <div style="max-width: 440px; margin: 3rem auto;">
      <div class="glass-card glass-card-glow" style="display: flex; flex-direction: column; gap: 1.5rem; border-color: rgba(168, 85, 247, 0.35);">
        <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
          <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(99, 102, 241, 0.2); color: #818cf8; display: flex; align-items: center; justify-content: center;">
            ${t.Sparkles("w-6 h-6")}
          </div>
          <h2 style="font-size: 1.6rem; font-weight: 800; color: #ffffff;">Welcome Back</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Sign in to your Recruitment AI account</p>
        </div>

        <div id="auth-error-box" style="display: none; padding: 0.85rem; border-radius: 12px; background: rgba(244, 63, 94, 0.15); border: 1px solid rgba(244, 63, 94, 0.3); color: #fda4af; font-size: 0.85rem; align-items: center; gap: 0.5rem;">
          ${t.AlertCircle("w-4 h-4 shrink-0")}
          <span id="auth-error-msg"></span>
        </div>

        <form id="login-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">
              Email Address
            </label>
            <div style="position: relative;">
              <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); display: flex;">
                ${t.Mail("w-4 h-4")}
              </span>
              <input type="email" id="login-email" required placeholder="name@example.com" class="glass-input" style="padding-left: 2.75rem;" />
            </div>
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
              <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">
                Password
              </label>
              <a href="#/forgot-password" style="font-size: 0.75rem; color: #c084fc; text-decoration: none; font-weight: 600;">
                Forgot password?
              </a>
            </div>
            <div style="position: relative;">
              <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); display: flex;">
                ${t.Lock("w-4 h-4")}
              </span>
              <input type="password" id="login-password" required placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" class="glass-input" style="padding-left: 2.75rem;" />
            </div>
          </div>

          <button type="submit" id="login-submit-btn" class="glass-btn glass-btn-primary" style="width: 100%; padding: 0.75rem;">
            Sign In
          </button>
        </form>

        <div style="text-align: center; border-top: 1px solid rgba(139, 92, 246, 0.15); padding-top: 1.25rem; font-size: 0.8rem; color: var(--text-muted);">
          <p style="margin-bottom: 0.6rem;">Don't have an account? Register as:</p>
          <div style="display: flex; justify-content: center; gap: 0.75rem; font-weight: 600;">
            <a href="#/register" style="color: #c084fc; text-decoration: underline;">Candidate</a>
            <span>\u2022</span>
            <a href="#/register-recruiter" style="color: #818cf8; text-decoration: underline;">Recruiter</a>
            <span>\u2022</span>
            <a href="#/register-interviewer" style="color: #38bdf8; text-decoration: underline;">Interviewer</a>
          </div>
        </div>
      </div>
    </div>
  `}function ye(){let e=document.getElementById("login-form");e&&e.addEventListener("submit",async i=>{i.preventDefault();let a=document.getElementById("login-email").value.trim(),o=document.getElementById("login-password").value,d=document.getElementById("login-submit-btn"),r=document.getElementById("auth-error-box"),l=document.getElementById("auth-error-msg");r.style.display="none",d.disabled=!0,d.innerHTML='<span class="animate-spin" style="display:inline-block;">\u26A1</span> Signing in...';try{let n=await x.login(a,o);u(`Welcome back, ${n.name}!`),n.role==="interviewer"?window.location.hash="#/interviewer/interviews":window.location.hash="#/dashboard"}catch(n){r.style.display="flex",l.textContent=n.message||"Invalid email or password. Please try again.",d.disabled=!1,d.textContent="Sign In"}})}function te(){return`
    <div style="max-width: 540px; margin: 2rem auto;">
      <div class="glass-card glass-card-glow" style="display: flex; flex-direction: column; gap: 1.5rem; border-color: rgba(168, 85, 247, 0.35);">
        <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
          <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(99, 102, 241, 0.2); color: #818cf8; display: flex; align-items: center; justify-content: center;">
            ${t.User("w-6 h-6")}
          </div>
          <h2 style="font-size: 1.6rem; font-weight: 800; color: #ffffff;">Candidate Registration</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Create your profile to explore AI-matched jobs & upload resumes</p>
        </div>

        <div id="register-error-box" style="display: none; padding: 0.85rem; border-radius: 12px; background: rgba(244, 63, 94, 0.15); border: 1px solid rgba(244, 63, 94, 0.3); color: #fda4af; font-size: 0.85rem; align-items: center; gap: 0.5rem;">
          ${t.AlertCircle("w-4 h-4 shrink-0")}
          <span id="register-error-msg"></span>
        </div>

        <form id="register-candidate-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">Full Name *</label>
              <input type="text" id="reg-name" required placeholder="e.g. Sagnik Saha" class="glass-input" />
            </div>

            <div>
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">Email Address *</label>
              <input type="email" id="reg-email" required placeholder="name@example.com" class="glass-input" />
            </div>
          </div>

          <!-- Profile Details Section -->
          <div style="padding: 1rem; border-radius: 14px; background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.25); display: flex; flex-direction: column; gap: 0.85rem;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #818cf8; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 0.4rem;">
              ${t.UserCheck("w-4 h-4 text-indigo-400")} Profile Details (For Job Matching & Resume)
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label style="display: block; font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.3rem;">Phone Number *</label>
                <div style="position: relative;">
                  <span style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); display: flex;">
                    ${t.Phone("w-3.5 h-3.5")}
                  </span>
                  <input type="tel" id="reg-phone" required placeholder="+91 9876543210" class="glass-input" style="padding-left: 2.25rem;" />
                </div>
              </div>

              <div>
                <label style="display: block; font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.3rem;">Location / City *</label>
                <div style="position: relative;">
                  <span style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); display: flex;">
                    ${t.MapPin("w-3.5 h-3.5")}
                  </span>
                  <input type="text" id="reg-location" required placeholder="e.g. Kolkata, India / Remote" class="glass-input" style="padding-left: 2.25rem;" />
                </div>
              </div>
            </div>

            <div>
              <label style="display: block; font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.3rem;">Professional Bio / Headline</label>
              <input type="text" id="reg-bio" placeholder="e.g. Full Stack Python & AI Developer with 2+ years experience" class="glass-input" />
            </div>
          </div>

          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">Password *</label>
            <input type="password" id="reg-password" required placeholder="Create strong password" class="glass-input" />
          </div>

          <div style="padding: 1rem; border-radius: 14px; background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.2); display: flex; flex-direction: column; gap: 0.85rem;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #c084fc; text-transform: uppercase; letter-spacing: 0.05em;">
              Security Questions (For Password Recovery)
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label style="display: block; font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.3rem;">Favorite Book *</label>
                <input type="text" id="reg-book" required placeholder="e.g. Clean Code" class="glass-input" />
              </div>
              <div>
                <label style="display: block; font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.3rem;">Favorite Person / Role Model *</label>
                <input type="text" id="reg-person" required placeholder="e.g. Alan Turing" class="glass-input" />
              </div>
            </div>
          </div>

          <button type="submit" id="reg-submit-btn" class="glass-btn glass-btn-primary" style="width: 100%; padding: 0.75rem;">
            Register & Open Dashboard
          </button>
        </form>

        <div style="text-align: center; font-size: 0.8rem; color: var(--text-muted);">
          Already have an account? <a href="#/login" style="color: #c084fc; font-weight: 600; text-decoration: underline;">Sign In</a>
        </div>
      </div>
    </div>
  `}function re(){let e=document.getElementById("register-candidate-form");e&&e.addEventListener("submit",async i=>{i.preventDefault();let a=document.getElementById("reg-submit-btn"),o=document.getElementById("register-error-box"),d=document.getElementById("register-error-msg"),r=document.getElementById("reg-email").value.trim(),l=document.getElementById("reg-password").value,n={name:document.getElementById("reg-name").value.trim(),email:r,password:l,phone:document.getElementById("reg-phone")?.value.trim()||null,location:document.getElementById("reg-location")?.value.trim()||null,bio:document.getElementById("reg-bio")?.value.trim()||null,favorite_book:document.getElementById("reg-book").value.trim(),favorite_person:document.getElementById("reg-person").value.trim()};o.style.display="none",a.disabled=!0,a.innerHTML='<span class="animate-spin" style="display:inline-block;">\u26A1</span> Creating profile & logging in...';try{await x.registerCandidate(n),u("Registration successful! Logging you in...");let s=await x.login(r,l);u(`Welcome to RecruitAI, ${s.name}!`),window.location.hash="#/dashboard"}catch(s){o.style.display="flex",d.textContent=s.message||"Registration failed. Please check your information.",a.disabled=!1,a.textContent="Register & Open Dashboard"}})}function ie(){return`
    <div style="max-width: 540px; margin: 2rem auto;">
      <div class="glass-card glass-card-glow" style="display: flex; flex-direction: column; gap: 1.5rem; border-color: rgba(99, 102, 241, 0.35);">
        <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
          <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(99, 102, 241, 0.2); color: #818cf8; display: flex; align-items: center; justify-content: center;">
            ${t.Briefcase("w-6 h-6")}
          </div>
          <h2 style="font-size: 1.6rem; font-weight: 800; color: #ffffff;">Recruiter Registration</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Join your organization to manage jobs and source candidates</p>
        </div>

        <div id="recruiter-error-box" style="display: none; padding: 0.85rem; border-radius: 12px; background: rgba(244, 63, 94, 0.15); border: 1px solid rgba(244, 63, 94, 0.3); color: #fda4af; font-size: 0.85rem; align-items: center; gap: 0.5rem;">
          ${t.AlertCircle("w-4 h-4 shrink-0")}
          <span id="recruiter-error-msg"></span>
        </div>

        <form id="register-recruiter-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">Full Name</label>
              <input type="text" id="rec-name" required placeholder="e.g. Alice Recruiter" class="glass-input" />
            </div>
            <div>
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">Work Email</label>
              <input type="email" id="rec-email" required placeholder="recruiter@company.com" class="glass-input" />
            </div>
          </div>

          <div style="padding: 1rem; border-radius: 14px; background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.25); display: flex; flex-direction: column; gap: 0.85rem;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #818cf8; text-transform: uppercase; letter-spacing: 0.05em;">Company Verification</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label style="display: block; font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.3rem;">Company Name</label>
                <input type="text" id="rec-company" required placeholder="e.g. NexusTech" class="glass-input" />
              </div>
              <div>
                <label style="display: block; font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.3rem;">Recruiter Code</label>
                <input type="password" id="rec-code" required placeholder="Company security code" class="glass-input" />
              </div>
            </div>
          </div>

          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">Password</label>
            <input type="password" id="rec-password" required placeholder="Create password" class="glass-input" />
          </div>

          <div style="padding: 1rem; border-radius: 14px; background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.2); display: flex; flex-direction: column; gap: 0.85rem;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #c084fc; text-transform: uppercase; letter-spacing: 0.05em;">Security Questions</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label style="display: block; font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.3rem;">Favorite Book</label>
                <input type="text" id="rec-book" required placeholder="e.g. Mythical Man-Month" class="glass-input" />
              </div>
              <div>
                <label style="display: block; font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.3rem;">Favorite Person</label>
                <input type="text" id="rec-person" required placeholder="e.g. Ada Lovelace" class="glass-input" />
              </div>
            </div>
          </div>

          <button type="submit" id="rec-submit-btn" class="glass-btn glass-btn-primary" style="width: 100%; padding: 0.75rem;">
            Register & Open Portal
          </button>
        </form>

        <div style="text-align: center; font-size: 0.8rem; color: var(--text-muted);">
          Already registered? <a href="#/login" style="color: #818cf8; font-weight: 600; text-decoration: underline;">Sign In</a>
        </div>
      </div>
    </div>
  `}function ne(){let e=document.getElementById("register-recruiter-form");e&&e.addEventListener("submit",async i=>{i.preventDefault();let a=document.getElementById("rec-submit-btn"),o=document.getElementById("recruiter-error-box"),d=document.getElementById("recruiter-error-msg"),r=document.getElementById("rec-email").value.trim(),l=document.getElementById("rec-password").value,n={name:document.getElementById("rec-name").value.trim(),email:r,password:l,company_name:document.getElementById("rec-company").value.trim(),recruiter_code:document.getElementById("rec-code").value.trim(),favorite_book:document.getElementById("rec-book").value.trim(),favorite_person:document.getElementById("rec-person").value.trim()};o.style.display="none",a.disabled=!0,a.innerHTML='<span class="animate-spin" style="display:inline-block;">\u26A1</span> Registering & logging in...';try{await x.registerRecruiter(n),u("Recruiter registered successfully! Logging you in...");let s=await x.login(r,l);u(`Welcome, ${s.name}!`),window.location.hash="#/recruiter"}catch(s){o.style.display="flex",d.textContent=s.message||"Recruiter registration failed. Check company code.",a.disabled=!1,a.textContent="Register & Open Portal"}})}function ae(){return`
    <div style="max-width: 500px; margin: 2rem auto;">
      <div class="glass-card glass-card-glow" style="display: flex; flex-direction: column; gap: 1.5rem; border-color: rgba(6, 182, 212, 0.35);">
        <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
          <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(6, 182, 212, 0.2); color: #38bdf8; display: flex; align-items: center; justify-content: center;">
            ${t.UserCheck("w-6 h-6")}
          </div>
          <h2 style="font-size: 1.6rem; font-weight: 800; color: #ffffff;">Interviewer Registration</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Join your company team to conduct technical interviews</p>
        </div>

        <div id="interviewer-error-box" style="display: none; padding: 0.85rem; border-radius: 12px; background: rgba(244, 63, 94, 0.15); border: 1px solid rgba(244, 63, 94, 0.3); color: #fda4af; font-size: 0.85rem; align-items: center; gap: 0.5rem;">
          ${t.AlertCircle("w-4 h-4 shrink-0")}
          <span id="interviewer-error-msg"></span>
        </div>

        <form id="register-interviewer-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">Full Name</label>
            <input type="text" id="int-name" required placeholder="e.g. Charlie Tech Lead" class="glass-input" />
          </div>

          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">Work Email</label>
            <input type="email" id="int-email" required placeholder="interviewer@company.com" class="glass-input" />
          </div>

          <div style="padding: 1rem; border-radius: 14px; background: rgba(6, 182, 212, 0.08); border: 1px solid rgba(6, 182, 212, 0.25); display: flex; flex-direction: column; gap: 0.85rem;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em;">Company Assignment</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label style="display: block; font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.3rem;">Company Name</label>
                <input type="text" id="int-company" required placeholder="e.g. NexusTech" class="glass-input" />
              </div>
              <div>
                <label style="display: block; font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.3rem;">Recruiter Code</label>
                <input type="password" id="int-code" required placeholder="Company code" class="glass-input" />
              </div>
            </div>
          </div>

          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">Password</label>
            <input type="password" id="int-password" required placeholder="Create password" class="glass-input" />
          </div>

          <button type="submit" id="int-submit-btn" class="glass-btn glass-btn-primary" style="width: 100%; padding: 0.75rem;">
            Register & Open Portal
          </button>
        </form>

        <div style="text-align: center; font-size: 0.8rem; color: var(--text-muted);">
          Already registered? <a href="#/login" style="color: #38bdf8; font-weight: 600; text-decoration: underline;">Sign In</a>
        </div>
      </div>
    </div>
  `}function se(){let e=document.getElementById("register-interviewer-form");e&&e.addEventListener("submit",async i=>{i.preventDefault();let a=document.getElementById("int-submit-btn"),o=document.getElementById("interviewer-error-box"),d=document.getElementById("interviewer-error-msg"),r=document.getElementById("int-email").value.trim(),l=document.getElementById("int-password").value,n={name:document.getElementById("int-name").value.trim(),email:r,password:l,company_name:document.getElementById("int-company").value.trim(),recruiter_code:document.getElementById("int-code").value.trim()};o.style.display="none",a.disabled=!0,a.innerHTML='<span class="animate-spin" style="display:inline-block;">\u26A1</span> Registering & logging in...';try{await x.registerInterviewer(n),u("Interviewer registered successfully! Logging you in...");let s=await x.login(r,l);u(`Welcome, ${s.name}!`),window.location.hash="#/interviewer/interviews"}catch(s){o.style.display="flex",d.textContent=s.message||"Interviewer registration failed.",a.disabled=!1,a.textContent="Register & Open Portal"}})}function ve(){return`
    <div style="max-width: 440px; margin: 3rem auto;">
      <div class="glass-card glass-card-glow" style="display: flex; flex-direction: column; gap: 1.5rem; border-color: rgba(168, 85, 247, 0.35);">
        <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
          <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(168, 85, 247, 0.2); color: #c084fc; display: flex; align-items: center; justify-content: center;">
            ${t.KeyRound("w-6 h-6")}
          </div>
          <h2 style="font-size: 1.6rem; font-weight: 800; color: #ffffff;">Reset Password</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Verify your security answers to set a new password</p>
        </div>

        <div id="reset-error-box" style="display: none; padding: 0.85rem; border-radius: 12px; background: rgba(244, 63, 94, 0.15); border: 1px solid rgba(244, 63, 94, 0.3); color: #fda4af; font-size: 0.85rem; align-items: center; gap: 0.5rem;">
          ${t.AlertCircle("w-4 h-4 shrink-0")}
          <span id="reset-error-msg"></span>
        </div>

        <div id="reset-success-box" style="display: none; padding: 1.25rem; text-align: center; flex-direction: column; align-items: center; gap: 1rem;">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(16, 185, 129, 0.2); color: #34d399; display: flex; align-items: center; justify-content: center;">
            ${t.CheckCircle2("w-8 h-8")}
          </div>
          <h3 style="font-size: 1.15rem; font-weight: 700; color: #ffffff;">Password Reset Successful!</h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">Your password has been updated. You can now log in with your new credentials.</p>
          <a href="#/login" class="glass-btn glass-btn-primary" style="width: 100%; margin-top: 0.5rem;">Proceed to Sign In</a>
        </div>

        <form id="forgot-password-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">Email Address</label>
            <input type="email" id="fp-email" required placeholder="name@example.com" class="glass-input" />
          </div>

          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">Favorite Book</label>
            <input type="text" id="fp-book" required placeholder="Your security answer" class="glass-input" />
          </div>

          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">Favorite Person / Role Model</label>
            <input type="text" id="fp-person" required placeholder="Your security answer" class="glass-input" />
          </div>

          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">New Password</label>
            <input type="password" id="fp-password" required placeholder="Enter new password" class="glass-input" />
          </div>

          <button type="submit" id="fp-submit-btn" class="glass-btn glass-btn-primary" style="width: 100%; padding: 0.75rem;">
            Reset Password
          </button>
        </form>

        <div style="text-align: center; border-top: 1px solid rgba(139, 92, 246, 0.15); padding-top: 1rem; font-size: 0.8rem;">
          <a href="#/login" style="color: #c084fc; font-weight: 600; text-decoration: underline;">Back to Sign In</a>
        </div>
      </div>
    </div>
  `}function be(){let e=document.getElementById("forgot-password-form");e&&e.addEventListener("submit",async i=>{i.preventDefault();let a=document.getElementById("fp-submit-btn"),o=document.getElementById("reset-error-box"),d=document.getElementById("reset-error-msg"),r=document.getElementById("reset-success-box"),l={email:document.getElementById("fp-email").value.trim(),favorite_book:document.getElementById("fp-book").value.trim(),favorite_person:document.getElementById("fp-person").value.trim(),new_password:document.getElementById("fp-password").value};o.style.display="none",a.disabled=!0,a.innerHTML="Verifying and updating...";try{await x.forgotPassword(l),e.style.display="none",r.style.display="flex",u("Password reset successfully!")}catch(n){o.style.display="flex",d.textContent=n.message||"Password reset failed. Please check your answers.",a.disabled=!1,a.textContent="Reset Password"}})}function xe(){let e=x.getUser();return`
    <div style="display: flex; flex-direction: column; gap: 2rem; padding-bottom: 3rem;">
      <!-- Welcome Banner -->
      <div class="glass-panel" style="padding: 2rem; position: relative; overflow: hidden; border-color: rgba(168, 85, 247, 0.25);">
        <div style="position: relative; z-index: 2; display: flex; flex-direction: column; gap: 0.75rem; max-width: 650px;">
          <div style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.3rem 0.8rem; border-radius: 9999px; background: rgba(99, 102, 241, 0.15); color: #a5b4fc; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">
            ${t.Sparkles("w-3.5 h-3.5 text-cyan-400")}
            Candidate Intelligence Portal
          </div>
          <h1 style="font-size: 2rem; font-weight: 800; color: #ffffff;">
            Welcome back, <span class="text-gradient">${e?.name||"Candidate"}</span>
          </h1>
          <p style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.6;">
            Your personalized recruitment dashboard provides 384-d semantic job matching, resume extraction insights, and real-time interview tracking.
          </p>
        </div>
      </div>

      <!-- Metrics Row -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem;">
        <div class="glass-card" style="display: flex; align-items: center; justify-content: space-between; border-color: rgba(99, 102, 241, 0.25);">
          <div>
            <p style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Applications</p>
            <h3 id="dash-apps-count" style="font-size: 2rem; font-weight: 800; color: #ffffff; margin: 0.25rem 0;">...</h3>
            <a href="#/applications" style="font-size: 0.75rem; color: #818cf8; font-weight: 600; text-decoration: none; display: flex; align-items: center; gap: 0.25rem;">
              View pipeline ${t.ArrowRight("w-3 h-3")}
            </a>
          </div>
          <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(99, 102, 241, 0.2); color: #818cf8; display: flex; align-items: center; justify-content: center;">
            ${t.Send("w-6 h-6")}
          </div>
        </div>

        <div class="glass-card" style="display: flex; align-items: center; justify-content: space-between; border-color: rgba(168, 85, 247, 0.25);">
          <div>
            <p style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Scheduled Interviews</p>
            <h3 id="dash-interviews-count" style="font-size: 2rem; font-weight: 800; color: #ffffff; margin: 0.25rem 0;">...</h3>
            <a href="#/interviews" style="font-size: 0.75rem; color: #c084fc; font-weight: 600; text-decoration: none; display: flex; align-items: center; gap: 0.25rem;">
              View schedule ${t.ArrowRight("w-3 h-3")}
            </a>
          </div>
          <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(168, 85, 247, 0.2); color: #c084fc; display: flex; align-items: center; justify-content: center;">
            ${t.Calendar("w-6 h-6")}
          </div>
        </div>

        <div class="glass-card" style="display: flex; align-items: center; justify-content: space-between; border-color: rgba(6, 182, 212, 0.25);">
          <div>
            <p style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Resume Status</p>
            <h3 id="dash-resume-status" style="font-size: 1.25rem; font-weight: 800; color: #ffffff; margin: 0.4rem 0; display: flex; align-items: center; gap: 0.4rem;">
              ...
            </h3>
            <a href="#/resume" id="dash-resume-link" style="font-size: 0.75rem; color: #38bdf8; font-weight: 600; text-decoration: none; display: flex; align-items: center; gap: 0.25rem;">
              Manage Resume ${t.ArrowRight("w-3 h-3")}
            </a>
          </div>
          <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(6, 182, 212, 0.2); color: #38bdf8; display: flex; align-items: center; justify-content: center;">
            ${t.FileText("w-6 h-6")}
          </div>
        </div>
      </div>

      <!-- Main Grid: Top AI Recommendations & Assistant Shortcut -->
      <div class="grid-split-2-1">
        <!-- Top Recommended Jobs -->
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2 style="font-size: 1.25rem; font-weight: 800; color: #ffffff; display: flex; align-items: center; gap: 0.5rem;">
              ${t.Sparkles("w-5 h-5 text-indigo-400")}
              AI Recommended Jobs
            </h2>
            <a href="#/jobs" style="font-size: 0.8rem; font-weight: 700; color: #c084fc; text-decoration: none; display: flex; align-items: center; gap: 0.25rem;">
              Browse all jobs ${t.ArrowRight("w-3 h-3")}
            </a>
          </div>

          <div id="dash-recommended-list" style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="padding: 2rem; text-align: center; color: var(--text-muted);">Loading recommendations...</div>
          </div>
        </div>

        <!-- AI Assistant Shortcut -->
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <h2 style="font-size: 1.25rem; font-weight: 800; color: #ffffff; display: flex; align-items: center; gap: 0.5rem;">
            ${t.Bot("w-5 h-5 text-purple-400")}
            AI Career Advisor
          </h2>
          <div class="glass-card glass-card-glow" style="display: flex; flex-direction: column; gap: 1rem; border-color: rgba(168, 85, 247, 0.3);">
            <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">
              Ask questions about resume improvements, skill gaps, company interview rounds, or mock technical questions.
            </p>
            <div style="display: flex; flex-direction: column; gap: 0.6rem;">
              <a href="#/chat?prompt=How+can+I+improve+my+resume+for+Senior+Backend+roles%3F" style="padding: 0.75rem; border-radius: 12px; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(168, 85, 247, 0.2); font-size: 0.8rem; color: var(--text-primary); text-decoration: none; transition: background 0.2s;">
                \u{1F4A1} "How can I improve my resume?"
              </a>
              <a href="#/chat?prompt=What+skills+are+missing+for+full+stack+engineer+jobs%3F" style="padding: 0.75rem; border-radius: 12px; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(168, 85, 247, 0.2); font-size: 0.8rem; color: var(--text-primary); text-decoration: none; transition: background 0.2s;">
                \u{1F3AF} "What skills are missing from my resume?"
              </a>
              <a href="#/chat?prompt=Help+me+prepare+for+a+Python+and+FastAPI+technical+interview." style="padding: 0.75rem; border-radius: 12px; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(168, 85, 247, 0.2); font-size: 0.8rem; color: var(--text-primary); text-decoration: none; transition: background 0.2s;">
                \u26A1 "Help me prepare for FastAPI interview"
              </a>
            </div>
            <a href="#/chat" class="glass-btn glass-btn-primary" style="width: 100%; margin-top: 0.5rem;">
              Open AI Career Chat ${t.ArrowRight("w-4 h-4")}
            </a>
          </div>
        </div>
      </div>
    </div>
  `}async function we(){try{let[e,i,a,o]=await Promise.allSettled([m.get("/applications/me"),m.get("/interviews/me"),m.get("/resumes/"),m.get("/match/candidate/jobs")]),d=e.status==="fulfilled"?e.value.length:0,r=document.getElementById("dash-apps-count");r&&(r.textContent=d);let l=i.status==="fulfilled"?i.value.length:0,n=document.getElementById("dash-interviews-count");n&&(n.textContent=l);let s=a.status==="fulfilled"&&a.value.length>0,g=document.getElementById("dash-resume-status"),p=document.getElementById("dash-resume-link");g&&(g.innerHTML=s?`${t.CheckCircle2("w-5 h-5 text-emerald-400")} Uploaded`:`${t.Clock("w-5 h-5 text-amber-400")} Pending`),p&&(p.innerHTML=s?`Manage Resume ${t.ArrowRight("w-3 h-3")}`:`Upload PDF ${t.ArrowRight("w-3 h-3")}`);let y=document.getElementById("dash-recommended-list");if(y)if(o.status==="fulfilled"&&o.value.length>0){let v=o.value.slice(0,3);y.innerHTML=v.map(c=>`
          <div class="glass-card" style="display: flex; flex-direction: column; gap: 0.75rem; justify-content: space-between;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
              <div>
                <h4 style="font-size: 1.1rem; font-weight: 700; color: #ffffff;">${c.job_title}</h4>
                <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.2rem;">
                  ${c.company_name} \u2022 <span style="color: var(--text-muted);">${c.location}</span>
                </p>
              </div>
              ${T(c.match_percentage,"sm")}
            </div>

            ${c.breakdown?.strong_matches&&c.breakdown.strong_matches.length>0?`
              <div style="display: flex; flex-wrap: wrap; gap: 0.35rem;">
                ${c.breakdown.strong_matches.slice(0,3).map($=>`
                  <span style="padding: 0.2rem 0.5rem; border-radius: 6px; background: rgba(16, 185, 129, 0.15); color: #6ee7b7; font-size: 0.7rem; font-weight: 600;">
                    \u2713 ${$}
                  </span>
                `).join("")}
              </div>
            `:""}

            <div style="display: flex; justify-content: flex-end; padding-top: 0.5rem; border-top: 1px solid rgba(139, 92, 246, 0.15);">
              <a href="#/jobs" class="glass-btn glass-btn-outline glass-btn-sm">View Position</a>
            </div>
          </div>
        `).join("")}else y.innerHTML=`
          <div class="glass-card" style="text-align: center; padding: 2.5rem; display: flex; flex-direction: column; align-items: center; gap: 1rem;">
            ${t.Briefcase("w-10 h-10 text-muted")}
            <p style="font-size: 0.9rem; color: var(--text-secondary);">Upload your PDF resume to unlock personalized AI semantic job recommendations.</p>
            <a href="#/resume" class="glass-btn glass-btn-primary glass-btn-sm">
              ${t.Upload("w-4 h-4")} Upload Resume
            </a>
          </div>
        `}catch(e){console.error("Failed to load candidate dashboard:",e)}}var oe=[],O={},G=new Set;function ke(){return`
    <div style="display: flex; flex-direction: column; gap: 1.5rem; padding-bottom: 3rem;">
      <div>
        <h1 style="font-size: 1.85rem; font-weight: 800; color: #ffffff;">Explore Job Opportunities</h1>
        <p style="font-size: 0.9rem; color: var(--text-muted);">Discover active positions with AI-powered candidate-job compatibility</p>
      </div>

      <!-- Search & Location Filters -->
      <div class="glass-card" style="padding: 1.25rem;">
        <div class="grid-split-search">
          <div style="position: relative;">
            <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); display: flex;">
              ${t.Search("w-4 h-4")}
            </span>
            <input type="text" id="job-search-input" placeholder="Search by title, skill keywords, or company..." class="glass-input" style="padding-left: 2.75rem;" />
          </div>
          <div style="position: relative;">
            <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); display: flex;">
              ${t.MapPin("w-4 h-4")}
            </span>
            <input type="text" id="job-location-input" placeholder="Filter by location (e.g. Remote)..." class="glass-input" style="padding-left: 2.75rem;" />
          </div>
        </div>
      </div>

      <!-- Jobs Grid -->
      <div id="jobs-grid-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1.5rem;">
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">Loading active opportunities...</div>
      </div>
    </div>
  `}async function $e(){let e=document.getElementById("jobs-grid-container"),i=document.getElementById("job-search-input"),a=document.getElementById("job-location-input");async function o(){try{let[n,s,g]=await Promise.allSettled([m.get("/jobs/"),m.get("/applications/me"),m.get("/match/candidate/jobs")]);oe=n.status==="fulfilled"?n.value:[],G=new Set(s.status==="fulfilled"?s.value.map(p=>p.job_id):[]),O={},g.status==="fulfilled"&&g.value.forEach(p=>{O[p.job_id]=p}),d()}catch{e.innerHTML='<div style="text-align: center; padding: 2rem; color: #fda4af;">Failed to load jobs.</div>'}}function d(){let n=(i?.value||"").toLowerCase().trim(),s=(a?.value||"").toLowerCase().trim(),g=oe.filter(p=>{let y=!n||(p.title||"").toLowerCase().includes(n)||(p.company_name||"").toLowerCase().includes(n)||(p.description||"").toLowerCase().includes(n),v=!s||(p.location||"").toLowerCase().includes(s);return y&&v});if(g.length===0){e.innerHTML=`
        <div class="glass-card" style="grid-column: 1 / -1; text-align: center; padding: 4rem; display: flex; flex-direction: column; align-items: center; gap: 1rem;">
          ${t.Briefcase("w-12 h-12 text-muted")}
          <h3 style="font-size: 1.25rem; font-weight: 700; color: #ffffff;">No Jobs Found</h3>
          <p style="font-size: 0.875rem; color: var(--text-muted);">Try adjusting your search keywords or location filters.</p>
        </div>
      `;return}e.innerHTML=g.map(p=>{let y=O[p.id],v=G.has(p.id);return`
        <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between; gap: 1.25rem;">
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem;">
              <div>
                <h3 style="font-size: 1.2rem; font-weight: 800; color: #ffffff;">${p.title}</h3>
                <p style="font-size: 0.85rem; color: #c084fc; font-weight: 600; display: flex; align-items: center; gap: 0.35rem; margin-top: 0.2rem;">
                  ${t.Building2("w-3.5 h-3.5")} ${p.company_name}
                </p>
              </div>
              ${y?T(y.match_percentage,"sm"):""}
            </div>

            <p style="font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.35rem;">
              ${t.MapPin("w-3.5 h-3.5")} ${p.location}
            </p>

            <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
              ${p.description}
            </p>

            ${y?.breakdown?.strong_matches&&y.breakdown.strong_matches.length>0?`
              <div style="display: flex; flex-wrap: wrap; gap: 0.35rem; padding-top: 0.25rem;">
                ${y.breakdown.strong_matches.slice(0,3).map(c=>`
                  <span style="padding: 0.2rem 0.5rem; border-radius: 6px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #6ee7b7; font-size: 0.7rem; font-weight: 600;">
                    \u2713 ${c}
                  </span>
                `).join("")}
              </div>
            `:""}
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 0.75rem; border-top: 1px solid rgba(139, 92, 246, 0.15);">
            <button class="glass-btn glass-btn-outline glass-btn-sm btn-job-details" data-id="${p.id}">
              View Details
            </button>

            ${v?`
              <span class="status-badge status-applied">
                ${t.CheckCircle2("w-3.5 h-3.5")} Applied
              </span>
            `:`
              <button class="glass-btn glass-btn-primary glass-btn-sm btn-job-apply" data-id="${p.id}">
                ${t.Send("w-3.5 h-3.5")} Apply Now
              </button>
            `}
          </div>
        </div>
      `}).join(""),e.querySelectorAll(".btn-job-details").forEach(p=>{p.addEventListener("click",()=>{let y=parseInt(p.dataset.id),v=oe.find(c=>c.id===y);v&&r(v)})}),e.querySelectorAll(".btn-job-apply").forEach(p=>{p.addEventListener("click",async()=>{let y=parseInt(p.dataset.id);await l(y)})})}function r(n){let s=O[n.id],g=G.has(n.id),p=`
      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 1rem; border-bottom: 1px solid rgba(139, 92, 246, 0.2);">
          <div>
            <p style="font-size: 1rem; font-weight: 700; color: #c084fc; display: flex; align-items: center; gap: 0.4rem;">
              ${t.Building2("w-4 h-4")} ${n.company_name}
            </p>
            <p style="font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.4rem; margin-top: 0.2rem;">
              ${t.MapPin("w-3.5 h-3.5")} ${n.location}
            </p>
          </div>
          ${s?T(s.match_percentage,"lg"):""}
        </div>

        ${s?`
          <div style="padding: 1.25rem; border-radius: 16px; background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.25); display: flex; flex-direction: column; gap: 0.75rem;">
            <div style="font-size: 0.85rem; font-weight: 800; color: #ffffff; display: flex; align-items: center; gap: 0.4rem;">
              ${t.Sparkles("w-4 h-4 text-cyan-400")} AI Grounded Compatibility Analysis
            </div>
            <p style="font-size: 0.825rem; color: var(--text-secondary); line-height: 1.5;">${s.explanation}</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.75rem; margin-top: 0.5rem;">
              <div style="padding: 0.75rem; border-radius: 10px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3);">
                <span style="font-size: 0.7rem; font-weight: 700; color: #6ee7b7; text-transform: uppercase;">Strong Matches</span>
                <div style="font-size: 0.78rem; color: var(--text-primary); margin-top: 0.25rem;">
                  ${s.breakdown?.strong_matches?.length>0?s.breakdown.strong_matches.join(", "):"None listed"}
                </div>
              </div>
              <div style="padding: 0.75rem; border-radius: 10px; background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.3);">
                <span style="font-size: 0.7rem; font-weight: 700; color: #38bdf8; text-transform: uppercase;">Partial Matches</span>
                <div style="font-size: 0.78rem; color: var(--text-primary); margin-top: 0.25rem;">
                  ${s.breakdown?.partial_matches?.length>0?s.breakdown.partial_matches.join(", "):"None"}
                </div>
              </div>
              <div style="padding: 0.75rem; border-radius: 10px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3);">
                <span style="font-size: 0.7rem; font-weight: 700; color: #fcd34d; text-transform: uppercase;">Potential Gaps</span>
                <div style="font-size: 0.78rem; color: var(--text-primary); margin-top: 0.25rem;">
                  ${s.breakdown?.potential_gaps?.length>0?s.breakdown.potential_gaps.join(", "):"Comprehensive coverage"}
                </div>
              </div>
            </div>
          </div>
        `:""}

        <div>
          <h4 style="font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Job Description</h4>
          <div style="padding: 1rem; border-radius: 12px; background: rgba(10, 11, 20, 0.6); border: 1px solid rgba(255,255,255,0.08); font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6; max-height: 250px; overflow-y: auto; white-space: pre-wrap;">${n.description}</div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid rgba(139, 92, 246, 0.2);">
          <button class="glass-btn glass-btn-outline" id="modal-close-secondary">Close</button>
          ${g?`<span class="status-badge status-applied" style="padding: 0.6rem 1rem;">${t.CheckCircle2("w-4 h-4")} Already Applied</span>`:`<button class="glass-btn glass-btn-primary" id="modal-apply-btn">${t.Send("w-4 h-4")} Submit Application</button>`}
        </div>
      </div>
    `;R({title:n.title,contentHtml:p,maxWidth:"680px"}),document.getElementById("modal-close-secondary")?.addEventListener("click",()=>E()),document.getElementById("modal-apply-btn")?.addEventListener("click",async()=>{E(),await l(n.id)})}async function l(n){try{await m.post("/applications/",{job_id:n}),G.add(n),u("Application submitted successfully!"),d()}catch(s){u(s.message||"Failed to apply.","error")}}i?.addEventListener("input",d),a?.addEventListener("input",d),o()}function Ce(){return`
    <div style="display: flex; flex-direction: column; gap: 2rem; padding-bottom: 3rem;">
      <div>
        <h1 style="font-size: 1.85rem; font-weight: 800; color: #ffffff;">Resume Management</h1>
        <p style="font-size: 0.9rem; color: var(--text-muted);">Upload your PDF resume for PyMuPDF text extraction and pgvector indexing</p>
      </div>

      <!-- Upload Box -->
      <div class="glass-card glass-card-glow" style="display: flex; flex-direction: column; gap: 1.25rem; border-color: rgba(99, 102, 241, 0.35);">
        <h3 style="font-size: 1.15rem; font-weight: 700; color: #ffffff; display: flex; align-items: center; gap: 0.5rem;">
          ${t.Upload("w-5 h-5 text-indigo-400")}
          Upload New PDF Resume
        </h3>

        <form id="resume-upload-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div style="border: 2px dashed rgba(168, 85, 247, 0.3); border-radius: 18px; padding: 2.5rem 1.5rem; text-align: center; background: rgba(168, 85, 247, 0.05); cursor: pointer; transition: all 0.2s;" id="dropzone-box">
            <input type="file" id="resume-file-input" accept="application/pdf" style="display: none;" />
            <div style="display: flex; flex-direction: column; align-items: center; gap: 0.75rem;">
              <div style="width: 56px; height: 56px; border-radius: 16px; background: rgba(99, 102, 241, 0.2); color: #818cf8; display: flex; align-items: center; justify-content: center;">
                ${t.FileText("w-8 h-8")}
              </div>
              <div>
                <span id="file-chosen-label" style="font-size: 0.95rem; font-weight: 600; color: #ffffff;">
                  Click to select or drag & drop your PDF resume here
                </span>
                <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">
                  Accepts .pdf files up to 10MB
                </p>
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end;">
            <button type="submit" id="resume-upload-btn" class="glass-btn glass-btn-primary" disabled>
              ${t.Upload("w-4 h-4")} Upload & Extract Text
            </button>
          </div>
        </form>
      </div>

      <!-- Active Resume Extracted Preview -->
      <div id="active-resume-container" style="display: flex; flex-direction: column; gap: 1rem;">
        <div style="text-align: center; padding: 2rem; color: var(--text-muted);">Loading resume records...</div>
      </div>
    </div>
  `}async function Ie(){let e=document.getElementById("resume-upload-form"),i=document.getElementById("resume-file-input"),a=document.getElementById("dropzone-box"),o=document.getElementById("file-chosen-label"),d=document.getElementById("resume-upload-btn"),r=document.getElementById("active-resume-container"),l=null;a?.addEventListener("click",()=>i?.click()),i?.addEventListener("change",s=>{let g=s.target.files[0];if(g){if(g.type!=="application/pdf"){u("Please select a valid .pdf resume file.","error");return}l=g,o.textContent=`Selected: ${g.name} (${(g.size/1024).toFixed(1)} KB)`,d.disabled=!1}}),e?.addEventListener("submit",async s=>{if(s.preventDefault(),!l)return;d.disabled=!0,d.innerHTML="Extracting text & vector embeddings...";let g=new FormData;g.append("file",l);try{await m.post("/resumes/",g),u("Resume uploaded and indexed successfully!"),l=null,o.textContent="Click to select or drag & drop your PDF resume here",d.disabled=!0,d.innerHTML=`${t.Upload("w-4 h-4")} Upload & Extract Text`,n()}catch(p){u(p.message||"Failed to upload resume.","error"),d.disabled=!1,d.innerHTML=`${t.Upload("w-4 h-4")} Upload & Extract Text`}});async function n(){try{let s=await m.get("/resumes/");if(s.length>0){let g=s[0];r.innerHTML=`
          <div class="glass-card" style="display: flex; flex-direction: column; gap: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.75rem; border-bottom: 1px solid rgba(139, 92, 246, 0.2);">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="width: 42px; height: 42px; border-radius: 12px; background: rgba(16, 185, 129, 0.15); color: #34d399; display: flex; align-items: center; justify-content: center;">
                  ${t.FileCheck("w-6 h-6")}
                </div>
                <div>
                  <h3 style="font-size: 1.15rem; font-weight: 700; color: #ffffff;">${g.filename}</h3>
                  <p style="font-size: 0.75rem; color: var(--text-muted);">Indexed in vector store with 384-d embeddings</p>
                </div>
              </div>
              <button id="copy-resume-btn" class="glass-btn glass-btn-outline glass-btn-sm">
                ${t.Copy("w-3.5 h-3.5")} Copy Extracted Text
              </button>
            </div>

            <div>
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">
                Extracted Text (PyMuPDF)
              </label>
              <div id="resume-text-viewer" style="padding: 1rem; border-radius: 12px; background: rgba(10, 11, 20, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-secondary); max-height: 380px; overflow-y: auto; white-space: pre-wrap; line-height: 1.6;">${g.extracted_text||"No text extracted."}</div>
            </div>
          </div>
        `,document.getElementById("copy-resume-btn")?.addEventListener("click",()=>{navigator.clipboard.writeText(g.extracted_text||""),u("Resume text copied to clipboard!")})}else r.innerHTML=`
          <div class="glass-card" style="text-align: center; padding: 3rem; color: var(--text-muted);">
            ${t.FileText("w-10 h-10 mx-auto")}
            <p style="margin-top: 0.5rem;">No resume uploaded yet. Upload a PDF above to get started.</p>
          </div>
        `}catch(s){console.error("Failed to load resumes:",s)}}n()}function ze(){return`
    <div style="display: flex; flex-direction: column; gap: 2rem; padding-bottom: 3rem;">
      <div>
        <h1 style="font-size: 1.85rem; font-weight: 800; color: #ffffff;">My Applications</h1>
        <p style="font-size: 0.9rem; color: var(--text-muted);">Track your submission stages and review pipeline progress</p>
      </div>

      <div id="applications-list-container" style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div style="text-align: center; padding: 3rem; color: var(--text-muted);">Loading your applications...</div>
      </div>
    </div>
  `}async function Ee(){let e=document.getElementById("applications-list-container"),i=["applied","screening","shortlisted","hired"];try{let[a,o]=await Promise.all([m.get("/applications/me"),m.get("/jobs/")]),d={};if(o.forEach(r=>d[r.id]=r),a.length===0){e.innerHTML=`
        <div class="glass-card" style="text-align: center; padding: 4rem; display: flex; flex-direction: column; align-items: center; gap: 1rem;">
          ${t.Send("w-12 h-12 text-muted")}
          <h3 style="font-size: 1.25rem; font-weight: 700; color: #ffffff;">No Applications Yet</h3>
          <p style="font-size: 0.875rem; color: var(--text-muted);">You haven't submitted any job applications yet.</p>
          <a href="#/jobs" class="glass-btn glass-btn-primary">
            ${t.Briefcase("w-4 h-4")} Explore Jobs
          </a>
        </div>
      `;return}e.innerHTML=a.map(r=>{let l=d[r.job_id]||{title:`Job #${r.job_id}`,company_name:"Company"},n=(r.status||"applied").toLowerCase(),s=n==="rejected"||n==="cancelled",g=s?-1:Math.max(0,i.indexOf(n));return`
        <div class="glass-card" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid rgba(139, 92, 246, 0.15);">
            <div>
              <h3 style="font-size: 1.2rem; font-weight: 800; color: #ffffff;">${l.title}</h3>
              <p style="font-size: 0.85rem; color: #c084fc; font-weight: 600; display: flex; align-items: center; gap: 0.35rem; margin-top: 0.2rem;">
                ${t.Building2("w-3.5 h-3.5")} ${l.company_name}
              </p>
            </div>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <span style="font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.3rem;">
                ${t.Clock("w-3.5 h-3.5")} Applied: ${new Date(r.applied_at).toLocaleDateString()}
              </span>
              ${P(r.status)}
            </div>
          </div>

          <!-- Pipeline Timeline -->
          ${s?`
            <div style="padding: 0.75rem 1rem; border-radius: 12px; background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.25); color: #fda4af; font-size: 0.8rem;">
              This application was not selected to proceed further. You can continue exploring other active positions.
            </div>
          `:`
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; padding: 0.5rem 0;">
              ${i.map((p,y)=>{let v=y<=g;return`
                  <div style="display: flex; flex-direction: column; gap: 0.4rem; text-align: center;">
                    <div style="height: 6px; border-radius: 9999px; background: ${v?"linear-gradient(90deg, #6366f1, #a855f7)":"rgba(255, 255, 255, 0.08)"}; box-shadow: ${v?"0 0 10px rgba(99, 102, 241, 0.5)":"none"};"></div>
                    <span style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: ${y===g?"#c084fc":v?"var(--text-primary)":"var(--text-muted)"};">${p}</span>
                  </div>
                `}).join("")}
            </div>
          `}
        </div>
      `}).join("")}catch{e.innerHTML='<div style="text-align: center; padding: 2rem; color: #fda4af;">Failed to load applications.</div>'}}function Be(){return`
    <div style="display: flex; flex-direction: column; gap: 2rem; padding-bottom: 3rem;">
      <div>
        <h1 style="font-size: 1.85rem; font-weight: 800; color: #ffffff;">My Interviews</h1>
        <p style="font-size: 0.9rem; color: var(--text-muted);">View upcoming and past technical interview appointments</p>
      </div>

      <div id="interviews-list-container" style="display: flex; flex-direction: column; gap: 1rem;">
        <div style="text-align: center; padding: 3rem; color: var(--text-muted);">Loading scheduled appointments...</div>
      </div>
    </div>
  `}async function je(){let e=document.getElementById("interviews-list-container");try{let i=await m.get("/interviews/me");if(i.length===0){e.innerHTML=`
        <div class="glass-card" style="text-align: center; padding: 4rem; display: flex; flex-direction: column; align-items: center; gap: 1rem;">
          ${t.Calendar("w-12 h-12 text-muted")}
          <h3 style="font-size: 1.25rem; font-weight: 700; color: #ffffff;">No Interviews Scheduled</h3>
          <p style="font-size: 0.875rem; color: var(--text-muted);">When recruiters schedule technical evaluations for your applications, they will appear here.</p>
        </div>
      `;return}e.innerHTML=i.map(a=>`
      <div class="glass-card" style="display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; flex-wrap: wrap;">
        <div style="display: flex; flex-direction: column; gap: 0.4rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <h3 style="font-size: 1.15rem; font-weight: 800; color: #ffffff;">
              ${a.job_title||`Interview #${a.id}`}
            </h3>
            ${a.company_name?`<span style="font-size: 0.85rem; color: #c084fc; font-weight: 600;">\u2022 ${a.company_name}</span>`:""}
          </div>

          <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 1.25rem; font-size: 0.825rem; color: var(--text-secondary);">
            <span style="display: flex; align-items: center; gap: 0.35rem; color: #38bdf8; font-weight: 600;">
              ${t.Calendar("w-4 h-4")}
              ${new Date(a.scheduled_at).toLocaleString([],{weekday:"short",year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}
            </span>
            ${a.interviewer_name?`
              <span style="display: flex; align-items: center; gap: 0.35rem;">
                ${t.UserCheck("w-4 h-4 text-purple-400")} Interviewer: <strong>${a.interviewer_name}</strong>
              </span>
            `:""}
          </div>
        </div>

        <div>
          ${P(a.status)}
        </div>
      </div>
    `).join("")}catch{e.innerHTML='<div style="text-align: center; padding: 2rem; color: #fda4af;">Failed to load interviews.</div>'}}function Se(){let e=x.getUser();return`
    <div style="display: flex; flex-direction: column; gap: 2rem; padding-bottom: 3rem;">
      <!-- Header Banner -->
      <div class="glass-panel" style="padding: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.5rem; border-color: rgba(99, 102, 241, 0.25);">
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <div style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.3rem 0.8rem; border-radius: 9999px; background: rgba(99, 102, 241, 0.15); color: #a5b4fc; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">
            ${t.Sparkles("w-3.5 h-3.5 text-cyan-400")}
            Recruiter Operations Hub
          </div>
          <h1 style="font-size: 1.85rem; font-weight: 800; color: #ffffff;">
            Talent Dashboard \u2022 <span class="text-gradient">${e?.name||"Recruiter"}</span>
          </h1>
          <p style="font-size: 0.9rem; color: var(--text-secondary);">
            Company Scope: <strong style="color: #c084fc;">Company ID #${e?.company_id||"N/A"}</strong>
          </p>
        </div>

        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <a href="#/recruiter/jobs" class="glass-btn glass-btn-primary">
            ${t.Plus("w-4 h-4")} Post New Job
          </a>
          <a href="#/recruiter/matching" class="glass-btn glass-btn-secondary">
            ${t.Sparkles("w-4 h-4")} AI Matcher
          </a>
        </div>
      </div>

      <!-- Metrics Row -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem;">
        <div class="glass-card" style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <p style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Active Jobs</p>
            <h3 id="rec-dash-jobs-count" style="font-size: 2rem; font-weight: 800; color: #ffffff; margin: 0.25rem 0;">...</h3>
            <a href="#/recruiter/jobs" style="font-size: 0.75rem; color: #818cf8; font-weight: 600; text-decoration: none;">Manage jobs \u2192</a>
          </div>
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(99, 102, 241, 0.2); color: #818cf8; display: flex; align-items: center; justify-content: center;">
            ${t.Briefcase("w-5 h-5")}
          </div>
        </div>

        <div class="glass-card" style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <p style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Applications</p>
            <h3 id="rec-dash-apps-count" style="font-size: 2rem; font-weight: 800; color: #ffffff; margin: 0.25rem 0;">...</h3>
            <a href="#/recruiter/applications" style="font-size: 0.75rem; color: #c084fc; font-weight: 600; text-decoration: none;">Review applicants \u2192</a>
          </div>
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(168, 85, 247, 0.2); color: #c084fc; display: flex; align-items: center; justify-content: center;">
            ${t.Users("w-5 h-5")}
          </div>
        </div>

        <div class="glass-card" style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <p style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Interviews</p>
            <h3 id="rec-dash-int-count" style="font-size: 2rem; font-weight: 800; color: #ffffff; margin: 0.25rem 0;">...</h3>
            <a href="#/recruiter/interviews" style="font-size: 0.75rem; color: #38bdf8; font-weight: 600; text-decoration: none;">View schedules \u2192</a>
          </div>
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(6, 182, 212, 0.2); color: #38bdf8; display: flex; align-items: center; justify-content: center;">
            ${t.Calendar("w-5 h-5")}
          </div>
        </div>

        <div class="glass-card" style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <p style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Documents</p>
            <h3 id="rec-dash-docs-count" style="font-size: 2rem; font-weight: 800; color: #ffffff; margin: 0.25rem 0;">...</h3>
            <a href="#/recruiter/documents" style="font-size: 0.75rem; color: #34d399; font-weight: 600; text-decoration: none;">Vector knowledge \u2192</a>
          </div>
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(16, 185, 129, 0.2); color: #34d399; display: flex; align-items: center; justify-content: center;">
            ${t.FolderLock("w-5 h-5")}
          </div>
        </div>
      </div>

      <!-- Recent Applications Table -->
      <div class="glass-card" style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="font-size: 1.15rem; font-weight: 800; color: #ffffff; display: flex; align-items: center; gap: 0.5rem;">
            ${t.TrendingUp("w-5 h-5 text-purple-400")}
            Recent Applications
          </h3>
          <a href="#/recruiter/applications" style="font-size: 0.8rem; font-weight: 700; color: #c084fc; text-decoration: none;">
            View All Applications \u2192
          </a>
        </div>

        <div id="rec-recent-apps-table-wrapper" style="overflow-x: auto;">
          <div style="text-align: center; padding: 2rem; color: var(--text-muted);">Loading pipeline...</div>
        </div>
      </div>
    </div>
  `}async function Me(){try{let[e,i,a,o]=await Promise.allSettled([m.get("/jobs/company/me"),m.get("/applications/"),m.get("/interviews/"),m.get("/documents/")]),d=e.status==="fulfilled"?e.value:[],r=i.status==="fulfilled"?i.value:[],l=a.status==="fulfilled"?a.value:[],n=o.status==="fulfilled"?o.value:[],s=d.filter(p=>p.is_active);document.getElementById("rec-dash-jobs-count").textContent=s.length,document.getElementById("rec-dash-apps-count").textContent=r.length,document.getElementById("rec-dash-int-count").textContent=l.length,document.getElementById("rec-dash-docs-count").textContent=n.length;let g=document.getElementById("rec-recent-apps-table-wrapper");g&&(r.length>0?g.innerHTML=`
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.875rem;">
            <thead>
              <tr style="border-bottom: 1px solid rgba(139, 92, 246, 0.2); color: var(--text-muted); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em;">
                <th style="padding: 0.75rem;">App ID</th>
                <th style="padding: 0.75rem;">Job ID</th>
                <th style="padding: 0.75rem;">Candidate ID</th>
                <th style="padding: 0.75rem;">Applied Date</th>
                <th style="padding: 0.75rem;">Status</th>
                <th style="padding: 0.75rem; text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${r.slice(0,5).map(p=>`
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.04); transition: background 0.2s;">
                  <td style="padding: 0.85rem; font-family: var(--font-mono); font-size: 0.8rem; color: #818cf8;">#${p.id}</td>
                  <td style="padding: 0.85rem; font-weight: 600; color: #ffffff;">Job #${p.job_id}</td>
                  <td style="padding: 0.85rem; color: var(--text-secondary);">Candidate #${p.candidate_id}</td>
                  <td style="padding: 0.85rem; font-size: 0.8rem; color: var(--text-muted);">${new Date(p.applied_at).toLocaleDateString()}</td>
                  <td style="padding: 0.85rem;">${P(p.status)}</td>
                  <td style="padding: 0.85rem; text-align: right;">
                    <a href="#/recruiter/applications" class="glass-btn glass-btn-outline glass-btn-sm">Review</a>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        `:g.innerHTML='<div style="text-align: center; padding: 2rem; color: var(--text-muted);">No applications received yet.</div>')}catch(e){console.error("Failed to load recruiter dashboard:",e)}}function Le(){return`
    <div style="display: flex; flex-direction: column; gap: 2rem; padding-bottom: 3rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h1 style="font-size: 1.85rem; font-weight: 800; color: #ffffff;">Company Job Postings</h1>
          <p style="font-size: 0.9rem; color: var(--text-muted);">Create, update, and manage vacancies for your organization</p>
        </div>
        <button id="btn-open-create-job" class="glass-btn glass-btn-primary">
          ${t.Plus("w-4 h-4")} Post New Vacancy
        </button>
      </div>

      <div id="recruiter-jobs-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1.5rem;">
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">Loading company jobs...</div>
      </div>
    </div>
  `}async function Re(){let e=document.getElementById("recruiter-jobs-grid"),i=document.getElementById("btn-open-create-job"),a=[];i?.addEventListener("click",()=>d(null));async function o(){try{if(a=await m.get("/jobs/company/me"),a.length===0){e.innerHTML=`
          <div class="glass-card" style="grid-column: 1 / -1; text-align: center; padding: 4rem; display: flex; flex-direction: column; align-items: center; gap: 1rem;">
            ${t.Briefcase("w-12 h-12 text-muted")}
            <h3 style="font-size: 1.25rem; font-weight: 700; color: #ffffff;">No Jobs Posted Yet</h3>
            <p style="font-size: 0.875rem; color: var(--text-muted);">Post your first company opening to receive candidate applications and AI matches.</p>
            <button class="glass-btn glass-btn-primary" id="btn-empty-create-job">
              ${t.Plus("w-4 h-4")} Post Job
            </button>
          </div>
        `,document.getElementById("btn-empty-create-job")?.addEventListener("click",()=>d(null));return}e.innerHTML=a.map(r=>`
        <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between; gap: 1.25rem;">
          <div style="display: flex; flex-direction: column; gap: 0.6rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem;">
              <h3 style="font-size: 1.2rem; font-weight: 800; color: #ffffff;">${r.title}</h3>
              <span class="status-badge ${r.is_active?"status-hired":"status-screening"}">
                ${r.is_active?"Active":"Archived"}
              </span>
            </div>

            <p style="font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.35rem;">
              ${t.MapPin("w-3.5 h-3.5")} ${r.location}
            </p>

            <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
              ${r.description}
            </p>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.6rem; padding-top: 0.75rem; border-top: 1px solid rgba(139, 92, 246, 0.15);">
            <button class="glass-btn glass-btn-outline glass-btn-sm btn-edit-job" data-id="${r.id}">
              ${t.Edit2("w-3.5 h-3.5")} Edit
            </button>
            <button class="glass-btn glass-btn-danger glass-btn-sm btn-delete-job" data-id="${r.id}">
              ${t.Trash2("w-3.5 h-3.5")} Delete
            </button>
          </div>
        </div>
      `).join(""),e.querySelectorAll(".btn-edit-job").forEach(r=>{r.addEventListener("click",()=>{let l=a.find(n=>n.id===parseInt(r.dataset.id));l&&d(l)})}),e.querySelectorAll(".btn-delete-job").forEach(r=>{r.addEventListener("click",async()=>{if(confirm("Are you sure you want to delete this job posting?"))try{await m.delete(`/jobs/${r.dataset.id}`),u("Job posting deleted."),o()}catch(l){u(l.message||"Failed to delete job.","error")}})})}catch{e.innerHTML='<div style="text-align: center; padding: 2rem; color: #fda4af;">Failed to load jobs.</div>'}}function d(r=null){let l=!!r,n=`
      <form id="job-modal-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div>
          <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">Job Title</label>
          <input type="text" id="jm-title" required value="${r?r.title:""}" placeholder="e.g. Senior Backend Engineer" class="glass-input" />
        </div>

        <div>
          <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">Location</label>
          <input type="text" id="jm-location" required value="${r?r.location:""}" placeholder="e.g. Remote / New York, NY" class="glass-input" />
        </div>

        <div>
          <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">
            Job Description & Requirements
          </label>
          <textarea id="jm-desc" required rows="6" placeholder="Describe roles, technical stack, required qualifications, and experience..." class="glass-input">${r?r.description:""}</textarea>
        </div>

        <div style="display: flex; align-items: center; gap: 0.6rem;">
          <input type="checkbox" id="jm-active" ${!r||r.is_active?"checked":""} style="width: 18px; height: 18px; accent-color: #6366f1;" />
          <label for="jm-active" style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary); cursor: pointer;">
            Active Vacancy (Visible for candidate applications & vector matching)
          </label>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid rgba(139, 92, 246, 0.2);">
          <button type="button" class="glass-btn glass-btn-outline" id="jm-cancel">Cancel</button>
          <button type="submit" class="glass-btn glass-btn-primary" id="jm-submit">
            ${l?"Save Changes":"Publish Job"}
          </button>
        </div>
      </form>
    `;R({title:l?"Edit Job Vacancy":"Create New Job Vacancy",contentHtml:n,maxWidth:"650px"}),document.getElementById("jm-cancel")?.addEventListener("click",()=>E()),document.getElementById("job-modal-form")?.addEventListener("submit",async s=>{s.preventDefault();let g=document.getElementById("jm-submit");g.disabled=!0;let p={title:document.getElementById("jm-title").value.trim(),location:document.getElementById("jm-location").value.trim(),description:document.getElementById("jm-desc").value.trim(),is_active:document.getElementById("jm-active").checked};try{l?(await m.put(`/jobs/${r.id}`,p),u("Job posting updated successfully!")):(await m.post("/jobs/",p),u("Job created & indexed in vector store!")),E(),o()}catch(y){u(y.message||"Failed to save job.","error"),g.disabled=!1}})}o()}function Ae(){return`
    <div style="display: flex; flex-direction: column; gap: 2rem; padding-bottom: 3rem;">
      <div>
        <h1 style="font-size: 1.85rem; font-weight: 800; color: #ffffff;">Candidate Applications</h1>
        <p style="font-size: 0.9rem; color: var(--text-muted);">Review applicants, evaluate AI match scores, and schedule technical interviews</p>
      </div>

      <!-- Filters -->
      <div class="glass-card" style="padding: 1.25rem;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">Filter by Job</label>
            <select id="filter-rec-job" class="glass-input">
              <option value="">All Company Jobs</option>
            </select>
          </div>

          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">Filter by Status</label>
            <select id="filter-rec-status" class="glass-input">
              <option value="">All Statuses</option>
              <option value="applied">Applied</option>
              <option value="screening">Screening</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div id="rec-apps-list-container" style="display: flex; flex-direction: column; gap: 1rem;">
        <div style="text-align: center; padding: 3rem; color: var(--text-muted);">Loading applications...</div>
      </div>
    </div>
  `}async function Pe(){let e=document.getElementById("rec-apps-list-container"),i=document.getElementById("filter-rec-job"),a=document.getElementById("filter-rec-status"),o=[],d={},r=[];async function l(){try{let[p,y,v]=await Promise.all([m.get("/applications/"),m.get("/jobs/company/me"),m.get("/interviews/interviewers")]);o=p,r=v,d={},y.forEach(c=>d[c.id]=c),i&&(i.innerHTML='<option value="">All Company Jobs</option>'+y.map(c=>`<option value="${c.id}">${c.title}</option>`).join("")),n()}catch{e.innerHTML='<div style="text-align: center; padding: 2rem; color: #fda4af;">Failed to load applications.</div>'}}function n(){let p=i?.value||"",y=(a?.value||"").toLowerCase(),v=o.filter(c=>{let $=!p||String(c.job_id)===String(p),C=!y||(c.status||"").toLowerCase()===y;return $&&C});if(v.length===0){e.innerHTML=`
        <div class="glass-card" style="text-align: center; padding: 4rem; display: flex; flex-direction: column; align-items: center; gap: 1rem;">
          ${t.Users("w-12 h-12 text-muted")}
          <h3 style="font-size: 1.25rem; font-weight: 700; color: #ffffff;">No Applications Found</h3>
          <p style="font-size: 0.875rem; color: var(--text-muted);">Applications for your company's vacancies will appear here.</p>
        </div>
      `;return}e.innerHTML=v.map(c=>{let $=d[c.job_id]||{title:`Job #${c.job_id}`};return`
        <div class="glass-card" style="display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; flex-wrap: wrap;">
          <div style="display: flex; flex-direction: column; gap: 0.4rem;">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span style="font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700; color: #818cf8;">App #${c.id}</span>
              <h3 style="font-size: 1.15rem; font-weight: 800; color: #ffffff;">Candidate #${c.candidate_id}</h3>
              ${P(c.status)}
            </div>

            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 1rem; font-size: 0.825rem; color: var(--text-secondary);">
              <span style="font-weight: 600; color: #c084fc;">Position: ${$.title}</span>
              <span style="color: var(--text-muted); display: flex; align-items: center; gap: 0.3rem;">
                ${t.Clock("w-3.5 h-3.5")} Applied: ${new Date(c.applied_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
            <!-- Status Dropdown -->
            <select class="glass-input select-app-status" data-id="${c.id}" style="width: auto; padding: 0.4rem 2rem 0.4rem 0.75rem; font-size: 0.75rem; font-weight: 700;">
              <option value="applied" ${c.status==="applied"?"selected":""}>Applied</option>
              <option value="screening" ${c.status==="screening"?"selected":""}>Screening</option>
              <option value="shortlisted" ${c.status==="shortlisted"?"selected":""}>Shortlisted</option>
              <option value="hired" ${c.status==="hired"?"selected":""}>Hired</option>
              <option value="rejected" ${c.status==="rejected"?"selected":""}>Rejected</option>
            </select>

            <button class="glass-btn glass-btn-secondary glass-btn-sm btn-match-review" data-appid="${c.id}" data-jobid="${c.job_id}" data-candid="${c.candidate_id}">
              ${t.Sparkles("w-3.5 h-3.5")} AI Match Review
            </button>

            <button class="glass-btn glass-btn-primary glass-btn-sm btn-schedule-int" data-appid="${c.id}" data-jobid="${c.job_id}" data-candid="${c.candidate_id}">
              ${t.Calendar("w-3.5 h-3.5")} Schedule Interview
            </button>
          </div>
        </div>
      `}).join(""),e.querySelectorAll(".select-app-status").forEach(c=>{c.addEventListener("change",async()=>{let $=c.dataset.id,C=c.value;try{await m.put(`/applications/${$}/status`,{status:C}),u(`Application #${$} status updated to ${C}`);let B=o.find(L=>L.id===parseInt($));B&&(B.status=C),n()}catch(B){u(B.message||"Failed to update status","error")}})}),e.querySelectorAll(".btn-match-review").forEach(c=>{c.addEventListener("click",async()=>{let $=c.dataset.jobid,C=c.dataset.candid,B=c.dataset.appid;await s($,C,B)})}),e.querySelectorAll(".btn-schedule-int").forEach(c=>{c.addEventListener("click",()=>{let $=parseInt(c.dataset.appid),C=c.dataset.candid,B=c.dataset.jobid;g($,C,B)})})}async function s(p,y,v){R({title:`Candidate Compatibility \u2022 Application #${v}`,contentHtml:'<div style="text-align: center; padding: 2rem; color: var(--text-muted);"><span class="animate-spin" style="display:inline-block;">\u26A1</span> Computing vector compatibility...</div>',maxWidth:"680px"});try{let c=await m.get(`/match/job/${p}/candidate/${y}`),$=`
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.75rem; border-bottom: 1px solid rgba(139, 92, 246, 0.2);">
            <div>
              <h4 style="font-size: 1.15rem; font-weight: 800; color: #ffffff;">${c.candidate_name}</h4>
              <p style="font-size: 0.8rem; color: #c084fc;">Applying for: ${c.job_title}</p>
            </div>
            ${T(c.match_percentage,"lg")}
          </div>

          <div style="padding: 1.25rem; border-radius: 14px; background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.25); display: flex; flex-direction: column; gap: 0.5rem;">
            <span style="font-size: 0.75rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; display: flex; align-items: center; gap: 0.35rem;">
              ${t.Sparkles("w-4 h-4")} Grounded AI Explanation
            </span>
            <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">${c.explanation}</p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 0.75rem;">
            <div style="padding: 0.75rem; border-radius: 10px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3);">
              <span style="font-size: 0.7rem; font-weight: 700; color: #6ee7b7; text-transform: uppercase;">Strong Matches</span>
              <div style="font-size: 0.78rem; color: var(--text-primary); margin-top: 0.25rem;">
                ${c.breakdown?.strong_matches?.length>0?c.breakdown.strong_matches.join(", "):"None"}
              </div>
            </div>
            <div style="padding: 0.75rem; border-radius: 10px; background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.3);">
              <span style="font-size: 0.7rem; font-weight: 700; color: #38bdf8; text-transform: uppercase;">Partial Matches</span>
              <div style="font-size: 0.78rem; color: var(--text-primary); margin-top: 0.25rem;">
                ${c.breakdown?.partial_matches?.length>0?c.breakdown.partial_matches.join(", "):"None"}
              </div>
            </div>
            <div style="padding: 0.75rem; border-radius: 10px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3);">
              <span style="font-size: 0.7rem; font-weight: 700; color: #fcd34d; text-transform: uppercase;">Potential Gaps</span>
              <div style="font-size: 0.78rem; color: var(--text-primary); margin-top: 0.25rem;">
                ${c.breakdown?.potential_gaps?.length>0?c.breakdown.potential_gaps.join(", "):"None detected"}
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid rgba(139, 92, 246, 0.2);">
            <button class="glass-btn glass-btn-outline" onclick="document.getElementById('active-modal-backdrop')?.remove()">Close</button>
            <button class="glass-btn glass-btn-primary" id="modal-sched-shortcut">${t.Calendar("w-4 h-4")} Schedule Interview</button>
          </div>
        </div>
      `;R({title:`Candidate Compatibility \u2022 Application #${v}`,contentHtml:$,maxWidth:"680px"}),document.getElementById("modal-sched-shortcut")?.addEventListener("click",()=>{E(),g(parseInt(v),y,p)})}catch(c){R({title:"Error",contentHtml:`<div style="color: #fda4af; padding: 1rem;">Failed to load match: ${c.message}</div>`})}}function g(p,y,v){let c=d[v]||{title:`Job #${v}`},$=`
      <form id="schedule-interview-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
        <p style="font-size: 0.85rem; color: var(--text-secondary);">
          Scheduling technical evaluation for <strong>Candidate #${y}</strong> applying for <strong>${c.title}</strong>.
        </p>

        <div>
          <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">
            Select Assigned Interviewer
          </label>
          ${r.length>0?`
            <select id="sch-interviewer-id" class="glass-input" required>
              ${r.map(C=>`<option value="${C.id}">${C.name} (${C.email})</option>`).join("")}
            </select>
          `:`
            <div style="padding: 0.75rem; border-radius: 10px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); color: #fcd34d; font-size: 0.8rem;">
              No interviewers found in your company. Please ask an interviewer to register with your company code first.
            </div>
          `}
        </div>

        <div>
          <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">
            Interview Date & Time
          </label>
          <input type="datetime-local" id="sch-datetime" required class="glass-input" />
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid rgba(139, 92, 246, 0.2);">
          <button type="button" class="glass-btn glass-btn-outline" id="sch-cancel-btn">Cancel</button>
          <button type="submit" class="glass-btn glass-btn-primary" id="sch-submit-btn" ${r.length===0?"disabled":""}>
            Confirm Interview Schedule
          </button>
        </div>
      </form>
    `;R({title:"Schedule Technical Interview",contentHtml:$,maxWidth:"560px"}),document.getElementById("sch-cancel-btn")?.addEventListener("click",()=>E()),document.getElementById("schedule-interview-form")?.addEventListener("submit",async C=>{C.preventDefault();let B=document.getElementById("sch-interviewer-id")?.value,L=document.getElementById("sch-datetime")?.value,U=document.getElementById("sch-submit-btn");if(!B||!L){u("Please select interviewer and datetime.","error");return}U.disabled=!0;try{await m.post("/interviews/",{application_id:p,interviewer_id:parseInt(B),scheduled_at:new Date(L).toISOString()}),await m.put(`/applications/${p}/status`,{status:"shortlisted"}),u("Technical interview scheduled successfully!"),E(),l()}catch(q){u(q.message||"Failed to schedule interview.","error"),U.disabled=!1}})}i?.addEventListener("change",n),a?.addEventListener("change",n),l()}function _e(){return`
    <div style="display: flex; flex-direction: column; gap: 2rem; padding-bottom: 3rem;">
      <div>
        <h1 style="font-size: 1.85rem; font-weight: 800; color: #ffffff;">Company Interviews & Schedules</h1>
        <p style="font-size: 0.9rem; color: var(--text-muted);">Manage upcoming technical evaluations across your organization</p>
      </div>

      <div id="recruiter-interviews-list" style="display: flex; flex-direction: column; gap: 1rem;">
        <div style="text-align: center; padding: 3rem; color: var(--text-muted);">Loading company interviews...</div>
      </div>
    </div>
  `}async function Te(){let e=document.getElementById("recruiter-interviews-list"),i=[],a=[];async function o(){try{let[r,l]=await Promise.all([m.get("/interviews/"),m.get("/interviews/interviewers")]);if(i=r,a=l,i.length===0){e.innerHTML=`
          <div class="glass-card" style="text-align: center; padding: 4rem; display: flex; flex-direction: column; align-items: center; gap: 1rem;">
            ${t.Calendar("w-12 h-12 text-muted")}
            <h3 style="font-size: 1.25rem; font-weight: 700; color: #ffffff;">No Interviews Scheduled</h3>
            <p style="font-size: 0.875rem; color: var(--text-muted);">Schedule interviews from the Applications page to manage them here.</p>
          </div>
        `;return}e.innerHTML=i.map(n=>`
        <div class="glass-card" style="display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; flex-wrap: wrap;">
          <div style="display: flex; flex-direction: column; gap: 0.4rem;">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span style="font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700; color: #818cf8;">#${n.id}</span>
              <h3 style="font-size: 1.15rem; font-weight: 800; color: #ffffff;">
                ${n.job_title||`Application #${n.application_id}`}
              </h3>
              ${n.candidate_name?`<span style="font-size: 0.85rem; color: var(--text-secondary);">\u2022 Candidate: <strong style="color: #fff;">${n.candidate_name}</strong></span>`:""}
              ${P(n.status)}
            </div>

            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 1.25rem; font-size: 0.825rem; color: var(--text-secondary);">
              <span style="display: flex; align-items: center; gap: 0.35rem; color: #38bdf8; font-weight: 600;">
                ${t.Clock("w-4 h-4")}
                ${new Date(n.scheduled_at).toLocaleString([],{weekday:"short",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}
              </span>
              ${n.interviewer_name?`<span style="display: flex; align-items: center; gap: 0.35rem; color: #c084fc;">
                      ${t.UserCheck("w-3.5 h-3.5")} Interviewer: ${n.interviewer_name}
                    </span>`:""}
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <button class="glass-btn glass-btn-outline glass-btn-sm btn-resched-int" data-id="${n.id}">
              ${t.Edit2("w-3.5 h-3.5")} Reschedule
            </button>
            <button class="glass-btn glass-btn-danger glass-btn-sm btn-del-int" data-id="${n.id}">
              ${t.Trash2("w-3.5 h-3.5")}
            </button>
          </div>
        </div>
      `).join(""),e.querySelectorAll(".btn-resched-int").forEach(n=>{n.addEventListener("click",()=>{let s=parseInt(n.dataset.id),g=i.find(p=>p.id===s);g&&d(g)})}),e.querySelectorAll(".btn-del-int").forEach(n=>{n.addEventListener("click",async()=>{if(confirm("Cancel and delete this interview appointment?"))try{await m.delete(`/interviews/${n.dataset.id}`),u("Interview cancelled & deleted."),o()}catch(s){u(s.message||"Failed to delete interview.","error")}})})}catch{e.innerHTML='<div style="text-align: center; padding: 2rem; color: #fda4af;">Failed to load interviews.</div>'}}function d(r){let l=r.scheduled_at?r.scheduled_at.substring(0,16):"",n=`
      <form id="resched-modal-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div>
          <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">
            Assigned Interviewer
          </label>
          <select id="resched-interviewer-id" class="glass-input">
            ${a.map(s=>`
              <option value="${s.id}" ${s.id===r.interviewer_id?"selected":""}>
                ${s.name} (${s.email})
              </option>
            `).join("")}
          </select>
        </div>

        <div>
          <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">
            New Date & Time
          </label>
          <input type="datetime-local" id="resched-datetime" required value="${l}" class="glass-input" />
        </div>

        <div>
          <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">
            Status
          </label>
          <select id="resched-status" class="glass-input">
            <option value="scheduled" ${r.status==="scheduled"?"selected":""}>Scheduled</option>
            <option value="completed" ${r.status==="completed"?"selected":""}>Completed</option>
            <option value="cancelled" ${r.status==="cancelled"?"selected":""}>Cancelled</option>
          </select>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid rgba(139, 92, 246, 0.2);">
          <button type="button" class="glass-btn glass-btn-outline" id="resched-cancel">Cancel</button>
          <button type="submit" class="glass-btn glass-btn-primary" id="resched-submit">Save Changes</button>
        </div>
      </form>
    `;R({title:`Update Interview #${r.id}`,contentHtml:n,maxWidth:"520px"}),document.getElementById("resched-cancel")?.addEventListener("click",()=>E()),document.getElementById("resched-modal-form")?.addEventListener("submit",async s=>{s.preventDefault();let g=document.getElementById("resched-interviewer-id").value,p=document.getElementById("resched-datetime").value,y=document.getElementById("resched-status").value,v=document.getElementById("resched-submit");v.disabled=!0;try{await m.put(`/interviews/${r.id}`,{interviewer_id:g?parseInt(g):void 0,scheduled_at:p?new Date(p).toISOString():void 0,status:y||void 0}),u("Interview updated successfully!"),E(),o()}catch(c){u(c.message||"Failed to update interview","error"),v.disabled=!1}})}o()}function He(){return`
    <div style="display: flex; flex-direction: column; gap: 2rem; padding-bottom: 3rem;">
      <div>
        <h1 style="font-size: 1.85rem; font-weight: 800; color: #ffffff;">Approved Company Documents</h1>
        <p style="font-size: 0.9rem; color: var(--text-muted);">Upload and index verified policy, FAQ, and process files for privacy-scoped RAG retrieval</p>
      </div>

      <!-- Upload Document Box -->
      <div class="glass-card glass-card-glow" style="display: flex; flex-direction: column; gap: 1.25rem; border-color: rgba(99, 102, 241, 0.35);">
        <h3 style="font-size: 1.15rem; font-weight: 700; color: #ffffff; display: flex; align-items: center; gap: 0.5rem;">
          ${t.Upload("w-5 h-5 text-indigo-400")} Upload Company Knowledge Document
        </h3>

        <form id="doc-upload-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div class="grid-split-search">
            <div>
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">
                Select File (.pdf, .docx, .txt, .md)
              </label>
              <input type="file" id="doc-file-input" accept=".pdf,.docx,.doc,.txt,.md" required class="glass-input" />
            </div>

            <div>
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">
                Document Category
              </label>
              <select id="doc-type-input" class="glass-input">
                <option value="company_policy">Company Policy</option>
                <option value="faq">Recruitment FAQ</option>
                <option value="process">Interview Process</option>
                <option value="general">General Knowledge</option>
              </select>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end;">
            <button type="submit" id="doc-upload-btn" class="glass-btn glass-btn-primary">
              ${t.Upload("w-4 h-4")} Upload & Index in PGVector
            </button>
          </div>
        </form>
      </div>

      <!-- Documents List -->
      <div class="glass-card" style="display: flex; flex-direction: column; gap: 1.25rem;">
        <h3 style="font-size: 1.15rem; font-weight: 800; color: #ffffff; display: flex; align-items: center; gap: 0.5rem;">
          ${t.FolderLock("w-5 h-5 text-purple-400")}
          Indexed Knowledge Files
        </h3>

        <div id="rec-docs-list-container" style="display: flex; flex-direction: column; gap: 0.75rem;">
          <div style="text-align: center; padding: 2rem; color: var(--text-muted);">Loading company documents...</div>
        </div>
      </div>
    </div>
  `}async function De(){let e=document.getElementById("doc-upload-form"),i=document.getElementById("doc-file-input"),a=document.getElementById("doc-type-input"),o=document.getElementById("doc-upload-btn"),d=document.getElementById("rec-docs-list-container"),r=[];e?.addEventListener("submit",async n=>{n.preventDefault();let s=i?.files[0];if(!s)return;o.disabled=!0,o.innerHTML="Chunking & generating vector embeddings...";let g=new FormData;g.append("file",s),g.append("document_type",a?.value||"company_policy");try{await m.post("/documents/",g),u("Document indexed into pgvector knowledge base!"),e.reset(),l()}catch(p){u(p.message||"Failed to upload document.","error")}finally{o.disabled=!1,o.innerHTML=`${t.Upload("w-4 h-4")} Upload & Index in PGVector`}});async function l(){try{if(r=await m.get("/documents/"),r.length===0){d.innerHTML=`
          <div style="text-align: center; padding: 3rem; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; gap: 0.75rem;">
            ${t.FolderLock("w-10 h-10 text-muted")}
            <p>No company documents uploaded yet. Upload a policy or FAQ above.</p>
          </div>
        `;return}d.innerHTML=r.map(n=>`
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: 0.85rem; border-radius: 12px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(139, 92, 246, 0.15); flex-wrap: wrap;">
          <div style="display: flex; flex-direction: column; gap: 0.35rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              ${t.FileText("w-4 h-4 text-indigo-400")}
              <span style="font-weight: 700; color: #ffffff;">${n.filename}</span>
              <span style="padding: 0.2rem 0.5rem; border-radius: 6px; background: rgba(168, 85, 247, 0.15); color: #c084fc; font-size: 0.7rem; font-weight: 700; text-transform: uppercase;">
                ${n.document_type}
              </span>
              ${P(n.indexing_status)}
            </div>
            ${n.extracted_text_preview?`<p style="font-size: 0.78rem; color: var(--text-muted); font-style: italic; max-width: 500px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    "${n.extracted_text_preview}"
                   </p>`:""}
          </div>

          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <button class="glass-btn glass-btn-outline glass-btn-sm btn-doc-preview" data-id="${n.id}">
              Preview
            </button>
            <button class="glass-btn glass-btn-secondary glass-btn-sm btn-doc-reindex" data-id="${n.id}">
              ${t.RefreshCw("w-3.5 h-3.5")} Re-index
            </button>
            <button class="glass-btn glass-btn-danger glass-btn-sm btn-doc-del" data-id="${n.id}">
              ${t.Trash2("w-3.5 h-3.5")}
            </button>
          </div>
        </div>
      `).join(""),d.querySelectorAll(".btn-doc-preview").forEach(n=>{n.addEventListener("click",()=>{let s=r.find(g=>g.id===parseInt(n.dataset.id));s&&R({title:`Preview: ${s.filename}`,contentHtml:`
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                  <div style="font-size: 0.8rem; color: var(--text-muted);">
                    Category: <strong style="color: #c084fc;">${s.document_type}</strong> \u2022 Status: <strong style="color: #34d399;">${s.indexing_status}</strong>
                  </div>
                  <div style="padding: 1rem; border-radius: 12px; background: rgba(10, 11, 20, 0.7); border: 1px solid rgba(255,255,255,0.08); font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-secondary); max-height: 350px; overflow-y: auto; white-space: pre-wrap; line-height: 1.6;">${s.extracted_text_preview||"No preview available."}</div>
                </div>
              `,maxWidth:"650px"})})}),d.querySelectorAll(".btn-doc-reindex").forEach(n=>{n.addEventListener("click",async()=>{try{let s=await m.post(`/documents/${n.dataset.id}/index`);u(s.message||"Document re-indexed into pgvector chunks!"),l()}catch(s){u(s.message||"Re-indexing failed.","error")}})}),d.querySelectorAll(".btn-doc-del").forEach(n=>{n.addEventListener("click",async()=>{if(confirm("Delete this document and all its pgvector chunks?"))try{await m.delete(`/documents/${n.dataset.id}`),u("Document removed."),l()}catch(s){u(s.message||"Failed to delete document.","error")}})})}catch{d.innerHTML='<div style="text-align: center; padding: 2rem; color: #fda4af;">Failed to load documents.</div>'}}l()}function Fe(){return`
    <div style="display: flex; flex-direction: column; gap: 2rem; padding-bottom: 3rem;">
      <div>
        <h1 style="font-size: 1.85rem; font-weight: 800; color: #ffffff;">AI Candidate Matcher</h1>
        <p style="font-size: 0.9rem; color: var(--text-muted);">
          Rank candidates using 384-dimensional vector similarity against company job descriptions
        </p>
      </div>

      <!-- Selector Box -->
      <div class="glass-card glass-card-glow" style="padding: 1.5rem; border-color: rgba(168, 85, 247, 0.35);">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; gap: 1.25rem; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 260px;">
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">
              Select Company Opening
            </label>
            <select id="matcher-job-select" class="glass-input">
              <option value="">Loading company positions...</option>
            </select>
          </div>

          <button id="btn-recompute-matches" class="glass-btn glass-btn-primary">
            ${t.Sparkles("w-4 h-4")} Calculate Matches
          </button>
        </div>
      </div>

      <!-- Ranked Candidates List -->
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <h3 style="font-size: 1.2rem; font-weight: 800; color: #ffffff; display: flex; align-items: center; gap: 0.5rem;">
          ${t.Sparkles("w-5 h-5 text-cyan-400")}
          Ranked Candidates
        </h3>

        <div id="matcher-results-container" style="display: flex; flex-direction: column; gap: 1rem;">
          <div style="text-align: center; padding: 3rem; color: var(--text-muted);">Select a company position above to compute AI rankings.</div>
        </div>
      </div>
    </div>
  `}async function Ue(){let e=document.getElementById("matcher-job-select"),i=document.getElementById("btn-recompute-matches"),a=document.getElementById("matcher-results-container"),o=[];try{let r=await m.get("/jobs/company/me");r.length>0?(e.innerHTML=r.map(l=>`<option value="${l.id}">${l.title} (${l.location})</option>`).join(""),d(r[0].id)):(e.innerHTML='<option value="">No company jobs available</option>',a.innerHTML='<div class="glass-card" style="text-align: center; padding: 3rem; color: var(--text-muted);">Please create a job posting first.</div>')}catch{e.innerHTML='<option value="">Error loading jobs</option>'}i?.addEventListener("click",()=>{let r=e?.value;r&&d(r)}),e?.addEventListener("change",()=>{let r=e?.value;r&&d(r)});async function d(r){a.innerHTML=`
      <div style="text-align: center; padding: 4rem; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; gap: 0.75rem;">
        <span class="animate-spin" style="font-size: 1.5rem;">\u26A1</span>
        <p>Computing 384-dimensional cosine similarity across all registered candidate resumes...</p>
      </div>
    `;try{if(o=await m.get(`/match/job/${r}/candidates`),o.length===0){a.innerHTML=`
          <div class="glass-card" style="text-align: center; padding: 4rem; display: flex; flex-direction: column; align-items: center; gap: 1rem;">
            ${t.User("w-12 h-12 text-muted")}
            <h3 style="font-size: 1.25rem; font-weight: 700; color: #ffffff;">No Candidate Matches</h3>
            <p style="font-size: 0.875rem; color: var(--text-muted);">Ensure candidates have registered and uploaded resumes to compute matches.</p>
          </div>
        `;return}a.innerHTML=o.map((l,n)=>`
          <div class="glass-card" style="display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; flex-wrap: wrap;">
            <div style="display: flex; flex-direction: column; gap: 0.5rem; flex: 1; min-width: 280px;">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #a855f7); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem; color: #fff;">
                  #${n+1}
                </div>
                <div>
                  <h4 style="font-size: 1.15rem; font-weight: 800; color: #ffffff; display: flex; align-items: center; gap: 0.5rem;">
                    ${l.candidate_name}
                    ${l.has_applied?'<span class="status-badge status-hired" style="font-size: 0.65rem;">Applied</span>':""}
                  </h4>
                  <p style="font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.3rem;">
                    ${t.Mail("w-3.5 h-3.5")} ${l.candidate_email}
                  </p>
                </div>
              </div>

              <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; padding-left: 2.75rem;">
                ${l.explanation}
              </p>

              <div style="display: flex; flex-wrap: wrap; gap: 0.35rem; padding-left: 2.75rem;">
                ${l.breakdown?.strong_matches?.slice(0,3).map(s=>`
                  <span style="padding: 0.2rem 0.5rem; border-radius: 6px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #6ee7b7; font-size: 0.7rem; font-weight: 600;">
                    \u2713 ${s}
                  </span>
                `).join("")}
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 1rem;">
              ${T(l.match_percentage,"md")}
              <button class="glass-btn glass-btn-outline glass-btn-sm btn-view-cand-breakdown" data-candid="${l.candidate_id}">
                View Breakdown
              </button>
            </div>
          </div>
        `).join(""),a.querySelectorAll(".btn-view-cand-breakdown").forEach(l=>{l.addEventListener("click",()=>{let n=parseInt(l.dataset.candid),s=o.find(g=>g.candidate_id===n);s&&R({title:`Match Analysis \u2022 ${s.candidate_name}`,contentHtml:`
                <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                  <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.75rem; border-bottom: 1px solid rgba(139, 92, 246, 0.2);">
                    <div>
                      <h4 style="font-size: 1.15rem; font-weight: 800; color: #ffffff;">${s.candidate_name}</h4>
                      <p style="font-size: 0.8rem; color: var(--text-muted);">${s.candidate_email}</p>
                    </div>
                    ${T(s.match_percentage,"lg")}
                  </div>

                  <div style="padding: 1rem; border-radius: 12px; background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.25); display: flex; flex-direction: column; gap: 0.5rem;">
                    <span style="font-size: 0.75rem; font-weight: 800; color: #38bdf8; text-transform: uppercase;">Grounded AI Explanation</span>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">${s.explanation}</p>
                  </div>

                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.75rem;">
                    <div style="padding: 0.75rem; border-radius: 10px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3);">
                      <span style="font-size: 0.7rem; font-weight: 700; color: #6ee7b7; text-transform: uppercase;">Strong Matches</span>
                      <div style="font-size: 0.78rem; color: var(--text-primary); margin-top: 0.25rem;">
                        ${s.breakdown?.strong_matches?.length>0?s.breakdown.strong_matches.join(", "):"None"}
                      </div>
                    </div>
                    <div style="padding: 0.75rem; border-radius: 10px; background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.3);">
                      <span style="font-size: 0.7rem; font-weight: 700; color: #38bdf8; text-transform: uppercase;">Partial Matches</span>
                      <div style="font-size: 0.78rem; color: var(--text-primary); margin-top: 0.25rem;">
                        ${s.breakdown?.partial_matches?.length>0?s.breakdown.partial_matches.join(", "):"None"}
                      </div>
                    </div>
                    <div style="padding: 0.75rem; border-radius: 10px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3);">
                      <span style="font-size: 0.7rem; font-weight: 700; color: #fcd34d; text-transform: uppercase;">Potential Gaps</span>
                      <div style="font-size: 0.78rem; color: var(--text-primary); margin-top: 0.25rem;">
                        ${s.breakdown?.potential_gaps?.length>0?s.breakdown.potential_gaps.join(", "):"None detected"}
                      </div>
                    </div>
                  </div>

                  <div style="font-size: 0.72rem; color: var(--text-muted); font-style: italic;">
                    * ${s.advisory_disclaimer||"AI match scores are advisory suggestions."}
                  </div>
                </div>
              `,maxWidth:"650px"})})})}catch(l){a.innerHTML=`<div style="text-align: center; padding: 2rem; color: #fda4af;">Failed to calculate matches: ${l.message}</div>`}}}function le(){let e=x.getUser();return`
    <div style="display: flex; flex-direction: column; gap: 2rem; padding-bottom: 3rem;">
      <!-- Header -->
      <div class="glass-panel" style="padding: 2rem; border-color: rgba(6, 182, 212, 0.25); display: flex; flex-direction: column; gap: 0.5rem;">
        <div style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.3rem 0.8rem; border-radius: 9999px; background: rgba(6, 182, 212, 0.15); color: #38bdf8; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">
          ${t.UserCheck("w-3.5 h-3.5")}
          Technical Interviewer Portal
        </div>
        <h1 style="font-size: 1.85rem; font-weight: 800; color: #ffffff;">
          Assigned Interviews \u2022 <span class="text-gradient">${e?.name||"Interviewer"}</span>
        </h1>
        <p style="font-size: 0.9rem; color: var(--text-secondary);">
          Company: <strong style="color: #c084fc;">Company ID #${e?.company_id||"N/A"}</strong> (Assigned interviews exclusively)
        </p>
      </div>

      <!-- Metrics -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem;">
        <div class="glass-card" style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <p style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Upcoming Scheduled</p>
            <h3 id="int-dash-sched-count" style="font-size: 2rem; font-weight: 800; color: #ffffff; margin: 0.25rem 0;">...</h3>
          </div>
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(6, 182, 212, 0.2); color: #38bdf8; display: flex; align-items: center; justify-content: center;">
            ${t.Clock("w-5 h-5")}
          </div>
        </div>

        <div class="glass-card" style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <p style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Completed Evaluations</p>
            <h3 id="int-dash-comp-count" style="font-size: 2rem; font-weight: 800; color: #ffffff; margin: 0.25rem 0;">...</h3>
          </div>
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(16, 185, 129, 0.2); color: #34d399; display: flex; align-items: center; justify-content: center;">
            ${t.CheckCircle2("w-5 h-5")}
          </div>
        </div>

        <div class="glass-card" style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <p style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Total Assigned</p>
            <h3 id="int-dash-total-count" style="font-size: 2rem; font-weight: 800; color: #ffffff; margin: 0.25rem 0;">...</h3>
          </div>
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(168, 85, 247, 0.2); color: #c084fc; display: flex; align-items: center; justify-content: center;">
            ${t.Calendar("w-5 h-5")}
          </div>
        </div>
      </div>

      <!-- Assigned Interviews List -->
      <div class="glass-card" style="display: flex; flex-direction: column; gap: 1.25rem;">
        <h3 style="font-size: 1.15rem; font-weight: 800; color: #ffffff; display: flex; align-items: center; gap: 0.5rem;">
          ${t.Calendar("w-5 h-5 text-purple-400")}
          My Assigned Evaluations
        </h3>

        <div id="interviewer-items-container" style="display: flex; flex-direction: column; gap: 1rem;">
          <div style="text-align: center; padding: 2rem; color: var(--text-muted);">Loading assigned interviews...</div>
        </div>
      </div>
    </div>
  `}async function de(){let e=document.getElementById("interviewer-items-container"),i=[];async function a(){try{i=await m.get("/interviews/");let o=i.filter(r=>r.status==="scheduled").length,d=i.filter(r=>r.status==="completed").length;if(document.getElementById("int-dash-sched-count").textContent=o,document.getElementById("int-dash-comp-count").textContent=d,document.getElementById("int-dash-total-count").textContent=i.length,i.length===0){e.innerHTML=`
          <div style="text-align: center; padding: 3rem; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; gap: 0.75rem;">
            ${t.Calendar("w-10 h-10 text-muted")}
            <p>You have no technical interviews assigned currently.</p>
          </div>
        `;return}e.innerHTML=i.map(r=>`
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 1.25rem; padding: 1rem; border-radius: 14px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(139, 92, 246, 0.15); flex-wrap: wrap;">
          <div style="display: flex; flex-direction: column; gap: 0.4rem;">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span style="font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700; color: #818cf8;">Interview #${r.id}</span>
              <h4 style="font-size: 1.1rem; font-weight: 800; color: #ffffff;">
                ${r.job_title||`Application #${r.application_id}`}
              </h4>
              ${P(r.status)}
            </div>

            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 1.25rem; font-size: 0.825rem; color: var(--text-secondary);">
              <span style="display: flex; align-items: center; gap: 0.35rem; color: #38bdf8; font-weight: 600;">
                ${t.Clock("w-4 h-4")}
                ${new Date(r.scheduled_at).toLocaleString([],{weekday:"short",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}
              </span>
              ${r.candidate_name?`<span style="color: var(--text-primary); font-weight: 600;">Candidate: ${r.candidate_name}</span>`:""}
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 0.5rem;">
            ${r.status==="scheduled"?`
              <button class="glass-btn glass-btn-success glass-btn-sm btn-int-status" data-id="${r.id}" data-status="completed">
                ${t.CheckCircle2("w-3.5 h-3.5")} Mark Complete
              </button>
              <button class="glass-btn glass-btn-danger glass-btn-sm btn-int-status" data-id="${r.id}" data-status="cancelled">
                ${t.XCircle("w-3.5 h-3.5")} Cancel
              </button>
            `:`
              <button class="glass-btn glass-btn-outline glass-btn-sm btn-int-status" data-id="${r.id}" data-status="scheduled">
                Re-open
              </button>
            `}
          </div>
        </div>
      `).join(""),e.querySelectorAll(".btn-int-status").forEach(r=>{r.addEventListener("click",async()=>{let l=r.dataset.id,n=r.dataset.status;try{await m.put(`/interviews/${l}/status`,{status:n}),u(`Interview marked as ${n}`),a()}catch(s){u(s.message||"Failed to update status","error")}})})}catch{e.innerHTML='<div style="text-align: center; padding: 2rem; color: #fda4af;">Failed to load interviews.</div>'}}a()}function qe(){return`
    <div class="chat-container">
      <!-- Sessions Sidebar -->
      <div class="glass-card chat-sessions-sidebar">
        <div style="display: flex; flex-direction: column; gap: 1rem; overflow: hidden; flex: 1;">
          <button id="chat-new-btn" class="glass-btn glass-btn-primary glass-btn-sm" style="width: 100%; justify-content: flex-start;">
            ${t.Plus("w-4 h-4")} New Conversation
          </button>

          <div style="font-size: 0.68rem; font-family: var(--font-mono); color: rgba(192, 132, 252, 0.7); text-transform: uppercase; letter-spacing: 0.08em; padding: 0 0.5rem;">
            Conversation History
          </div>

          <div id="chat-sessions-list" style="overflow-y: auto; display: flex; flex-direction: column; gap: 0.4rem; flex: 1; padding-right: 0.25rem;">
            <div style="font-size: 0.75rem; color: var(--text-muted); padding: 0.5rem;">Loading sessions...</div>
          </div>
        </div>

        <div style="padding-top: 0.75rem; border-top: 1px solid rgba(139, 92, 246, 0.15); display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem; color: var(--text-muted);">
          <span>Protocol:</span>
          <span id="chat-conn-status" style="display: flex; align-items: center; gap: 0.35rem; color: #34d399; font-weight: 700;">
            <span style="width: 7px; height: 7px; border-radius: 50%; background: #34d399; display: inline-block;"></span>
            Connecting...
          </span>
        </div>
      </div>

      <!-- Main Chat Area -->
      <div class="glass-card chat-main-area">
        <!-- Messages Feed -->
        <div id="chat-messages-container" class="chat-messages-scroll">
          <div id="chat-empty-state" style="margin: auto; max-width: 520px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 2rem;">
            <div style="width: 56px; height: 56px; border-radius: 18px; background: linear-gradient(135deg, #6366f1, #a855f7); color: #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 25px rgba(99, 102, 241, 0.4);">
              ${t.Bot("w-8 h-8")}
            </div>
            <h3 style="font-size: 1.35rem; font-weight: 800; color: #ffffff;">AI Career & Recruitment Assistant</h3>
            <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6;">
              Grounded career guidance, resume improvements, skill gap analysis, and mock interview preparations based strictly on authorized database documents.
            </p>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; width: 100%; margin-top: 0.5rem;">
              <button class="chat-prompt-chip glass-card" style="padding: 0.75rem; font-size: 0.75rem; text-align: left; cursor: pointer; color: var(--text-primary); border-color: rgba(168, 85, 247, 0.2);">
                \u{1F4A1} "How can I improve my resume for Senior Backend roles?"
              </button>
              <button class="chat-prompt-chip glass-card" style="padding: 0.75rem; font-size: 0.75rem; text-align: left; cursor: pointer; color: var(--text-primary); border-color: rgba(168, 85, 247, 0.2);">
                \u{1F3AF} "What jobs in the database fit my skills?"
              </button>
              <button class="chat-prompt-chip glass-card" style="padding: 0.75rem; font-size: 0.75rem; text-align: left; cursor: pointer; color: var(--text-primary); border-color: rgba(168, 85, 247, 0.2);">
                \u26A1 "Help me prepare for a Python & FastAPI interview."
              </button>
              <button class="chat-prompt-chip glass-card" style="padding: 0.75rem; font-size: 0.75rem; text-align: left; cursor: pointer; color: var(--text-primary); border-color: rgba(168, 85, 247, 0.2);">
                \u{1F50D} "What skills are missing from my resume for ML positions?"
              </button>
            </div>
          </div>
        </div>

        <!-- Input Bar -->
        <div style="padding: 1rem 1.5rem; background: rgba(10, 11, 20, 0.85); border-top: 1px solid rgba(139, 92, 246, 0.15); display: flex; flex-direction: column; gap: 0.5rem;">
          <form id="chat-input-form" style="display: flex; gap: 0.75rem;">
            <input
              type="text"
              id="chat-input-field"
              placeholder="Ask about resume improvements, skill gaps, or interview questions..."
              class="glass-input"
              style="padding: 0.85rem 1.25rem; font-size: 0.9rem;"
              autocomplete="off"
            />
            <button type="submit" id="chat-send-btn" class="glass-btn glass-btn-primary" style="padding: 0.85rem 1.5rem;">
              ${t.Send("w-5 h-5")}
            </button>
          </form>

          <div style="text-align: center; font-size: 0.7rem; color: var(--text-muted);">
            Advisory Notice: Responses are AI-assisted guidance based on verified company documents and do not represent automated hiring decisions.
          </div>
        </div>
      </div>
    </div>
  `}function Je(){let e=document.getElementById("chat-messages-container"),i=document.getElementById("chat-empty-state"),a=document.getElementById("chat-input-form"),o=document.getElementById("chat-input-field"),d=document.getElementById("chat-send-btn"),r=document.getElementById("chat-sessions-list"),l=document.getElementById("chat-new-btn"),n=document.getElementById("chat-conn-status"),s=null,g=[],p=[],y=!1,v=null,c=window.location.hash.split("?");if(c.length>1){let h=new URLSearchParams(c[1]).get("prompt");h&&o&&(o.value=h)}let $=x.getToken(),B=`${window.location.protocol==="https:"?"wss:":"ws:"}//${window.location.host}/ws/chat${$?`?token=${$}`:""}`;try{v=new WebSocket(B),v.onopen=()=>{n&&(n.innerHTML=`
          <span style="width: 7px; height: 7px; border-radius: 50%; background: #34d399; display: inline-block;"></span>
          Real-time WS
        `)},v.onmessage=f=>{try{let h=JSON.parse(f.data);h.type==="answer"?(Z(),J({role:"assistant",content:h.answer,sources:h.sources}),s=h.session_id,L()):h.type==="status"&&h.status==="thinking"&&ce()}catch(h){console.error("Error parsing WS message:",h)}},v.onerror=()=>{n&&(n.innerHTML=`
          <span style="width: 7px; height: 7px; border-radius: 50%; background: #fbbf24; display: inline-block;"></span>
          REST Mode
        `)},v.onclose=()=>{n&&(n.innerHTML=`
          <span style="width: 7px; height: 7px; border-radius: 50%; background: #fbbf24; display: inline-block;"></span>
          REST Mode
        `)}}catch{n&&(n.textContent="REST Mode")}async function L(){try{if(g=await m.get("/chat/sessions"),r){if(g.length===0){r.innerHTML='<div style="font-size: 0.75rem; color: var(--text-muted); padding: 0.5rem;">No conversations yet</div>';return}r.innerHTML=g.map(f=>`
          <div class="chat-session-item" data-id="${f.id}" style="display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0.75rem; border-radius: 10px; font-size: 0.78rem; cursor: pointer; transition: all 0.2s; background: ${s===f.id?"rgba(168, 85, 247, 0.25)":"transparent"}; color: ${s===f.id?"#ffffff":"var(--text-secondary)"}; border: 1px solid ${s===f.id?"rgba(168, 85, 247, 0.4)":"transparent"};">
            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500; max-width: 170px;">
              ${f.title}
            </span>
            <button class="btn-del-session" data-id="${f.id}" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 2px;" title="Delete">
              ${t.Trash2("w-3.5 h-3.5")}
            </button>
          </div>
        `).join(""),r.querySelectorAll(".chat-session-item").forEach(f=>{f.addEventListener("click",()=>{let h=f.dataset.id;h&&U(h)})}),r.querySelectorAll(".btn-del-session").forEach(f=>{f.addEventListener("click",async h=>{h.stopPropagation();let j=f.dataset.id;if(j)try{await m.delete(`/chat/sessions/${j}`),s===j&&q(),u("Conversation deleted"),L()}catch{u("Failed to delete session","error")}})})}}catch(f){console.error("Error loading chat sessions:",f)}}async function U(f){if(f){s=String(f),L();try{p=(await m.get(`/chat/sessions/${f}`)).messages||[],K()}catch(h){console.error("Failed to load session messages:",h),u("Failed to load conversation history","error")}}}function q(){s=null,p=[],K(),L()}l?.addEventListener("click",q);function K(){if(p.length===0){e.innerHTML="",i&&e.appendChild(i),me();return}e.innerHTML=p.map(f=>{let h=f.role==="user";return`
        <div style="display: flex; gap: 0.75rem; max-width: 900px; width: 100%; ${h?"margin-left: auto; flex-direction: row-reverse;":"margin-right: auto;"}">
          <div style="width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.75rem; ${h?"background: linear-gradient(135deg, #6366f1, #a855f7); color: #fff;":"background: rgba(168, 85, 247, 0.2); border: 1px solid rgba(168, 85, 247, 0.4); color: #c084fc;"}">
            ${h?t.User("w-4 h-4"):t.Bot("w-4 h-4")}
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.5rem; max-width: 85%;">
            <div class="${h?"chat-bubble-user":"chat-bubble-bot"}">
              ${h?`<div style="white-space: pre-wrap;">${D(f.content)}</div>`:Ge(f.content)}
            </div>

            ${h?"":Oe(f.sources)}
          </div>
        </div>
      `}).join(""),pe()}function J(f){p.push(f),K()}function ce(){if(y)return;y=!0;let f=document.createElement("div");f.id="chat-thinking-indicator",f.style.cssText="display: flex; gap: 0.75rem; margin-right: auto; max-width: 500px;",f.innerHTML=`
      <div style="width: 34px; height: 34px; border-radius: 10px; background: rgba(168, 85, 247, 0.2); border: 1px solid rgba(168, 85, 247, 0.4); color: #c084fc; display: flex; align-items: center; justify-content: center;">
        ${t.Bot("w-4 h-4")}
      </div>
      <div class="chat-bubble-bot animate-pulse" style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: #c084fc;">
        <span class="animate-spin" style="display:inline-block;">\u26A1</span>
        <span>Searching vector knowledge base & generating response...</span>
      </div>
    `,e.appendChild(f),pe()}function Z(){y=!1,document.getElementById("chat-thinking-indicator")?.remove()}function pe(){e.scrollTop=e.scrollHeight}function me(){document.querySelectorAll(".chat-prompt-chip").forEach(f=>{f.addEventListener("click",()=>{let h=f.textContent.replace(/^[\s💡🎯⚡🔍"']+|["'\s]+$/g,"").trim();o&&(o.value=h,a.dispatchEvent(new Event("submit")))})})}a?.addEventListener("submit",async f=>{f.preventDefault();let h=(o?.value||"").trim();if(h)if(o.value="",J({role:"user",content:h}),ce(),v&&v.readyState===WebSocket.OPEN)v.send(JSON.stringify({message:h,session_id:s}));else try{let j=await m.post("/chat/",{message:h,session_id:s});Z(),J({role:"assistant",content:j.answer,sources:j.sources}),s=j.session_id,L()}catch{Z(),J({role:"assistant",content:"Could not connect to AI service. Please verify server status."})}});function D(f){return f?f.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}function M(f){return f?D(f).replace(/`([^`]+)`/g,"<code>$1</code>").replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>").replace(/\*([^*]+)\*/g,"<em>$1</em>").replace(/~~([^~]+)~~/g,"<del>$1</del>"):""}function Oe(f){if(!f||f.length===0)return"";let h=new Set,j=[];for(let A of f){let H=`${A.title}_${A.source_type}`;h.has(H)||(h.add(H),j.push(A))}return j.length===0?"":`
      <div class="chat-sources-box">
        <div style="font-weight: 700; color: #c084fc; display: flex; align-items: center; gap: 0.35rem; margin-bottom: 0.45rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">
          ${t.BookOpen("w-3.5 h-3.5")} Verified Sources Grounded
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
          ${j.map(A=>`
            <span style="display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.25rem 0.6rem; border-radius: 8px; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); font-size: 0.72rem; color: #e0e7ff;">
              <strong style="color: #ffffff;">${D(A.title||"Document")}</strong>
              <span style="opacity: 0.7; font-size: 0.68rem; text-transform: capitalize;">(${D(A.source_type||"doc")})</span>
            </span>
          `).join("")}
        </div>
      </div>
    `}function Ge(f){if(!f)return"";let h=[],A=f.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g,(b,S,z)=>{let _=h.length;return h.push(`<pre><code class="language-${S}">${D(z.trim())}</code></pre>`),`__CODE_BLOCK_${_}__`}).split(`
`),H=[],F=!1,Q=[],N=[];for(let b=0;b<A.length;b++){let S=A[b].trim();if(S.startsWith("|")&&S.endsWith("|")){let z=S.slice(1,-1).split("|").map(_=>_.trim());if(z.every(_=>/^:?-+:?$/.test(_)))continue;F?N.push(z):(F=!0,Q=z,N=[])}else{if(F){let z='<div class="chat-table-wrapper"><table class="chat-markdown-table"><thead><tr>';Q.forEach(_=>{z+=`<th>${M(_)}</th>`}),z+="</tr></thead><tbody>",N.forEach(_=>{z+="<tr>",_.forEach(Ye=>{z+=`<td>${M(Ye)}</td>`}),z+="</tr>"}),z+="</tbody></table></div>",H.push(z),F=!1}H.push(S)}}if(F){let b='<div class="chat-table-wrapper"><table class="chat-markdown-table"><thead><tr>';Q.forEach(S=>{b+=`<th>${M(S)}</th>`}),b+="</tr></thead><tbody>",N.forEach(S=>{b+="<tr>",S.forEach(z=>{b+=`<td>${M(z)}</td>`}),b+="</tr>"}),b+="</tbody></table></div>",H.push(b)}let w=[],k=!1,I="ul";for(let b of H){if(b.startsWith("__CODE_BLOCK_")){k&&(w.push(`</${I}>`),k=!1);let S=b.match(/__CODE_BLOCK_(\d+)__/);S&&w.push(h[parseInt(S[1])]);continue}if(b.startsWith('<div class="chat-table-wrapper"')){k&&(w.push(`</${I}>`),k=!1),w.push(b);continue}b.startsWith("#### ")?(k&&(w.push(`</${I}>`),k=!1),w.push(`<h4>${M(b.slice(5))}</h4>`)):b.startsWith("### ")?(k&&(w.push(`</${I}>`),k=!1),w.push(`<h3>${M(b.slice(4))}</h3>`)):b.startsWith("## ")?(k&&(w.push(`</${I}>`),k=!1),w.push(`<h2>${M(b.slice(3))}</h2>`)):b.startsWith("# ")?(k&&(w.push(`</${I}>`),k=!1),w.push(`<h1>${M(b.slice(2))}</h1>`)):/^[-*•]\s+/.test(b)?((!k||I!=="ul")&&(k&&w.push(`</${I}>`),w.push("<ul>"),k=!0,I="ul"),w.push(`<li>${M(b.replace(/^[-*•]\s+/,""))}</li>`)):/^\d+\.\s+/.test(b)?((!k||I!=="ol")&&(k&&w.push(`</${I}>`),w.push("<ol>"),k=!0,I="ol"),w.push(`<li>${M(b.replace(/^\d+\.\s+/,""))}</li>`)):b.startsWith("> ")?(k&&(w.push(`</${I}>`),k=!1),w.push(`<blockquote>${M(b.slice(2))}</blockquote>`)):b.trim()===""?k&&(w.push(`</${I}>`),k=!1):(k&&(w.push(`</${I}>`),k=!1),w.push(`<p>${M(b)}</p>`))}return k&&w.push(`</${I}>`),`<div class="chat-markdown">${w.join("")}</div>`}L(),me()}function Ne(){let e=x.getUser(),i=e?.role==="candidate";return`
    <div style="max-width: 720px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem; padding-bottom: 3rem;">
      <div>
        <h1 style="font-size: 1.85rem; font-weight: 800; color: #ffffff;">Account Profile</h1>
        <p style="font-size: 0.9rem; color: var(--text-muted);">View your credentials and role configuration</p>
      </div>

      <!-- Account Summary Card -->
      <div class="glass-card" style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div style="display: flex; align-items: center; gap: 1.25rem; padding-bottom: 1.25rem; border-bottom: 1px solid rgba(139, 92, 246, 0.2);">
          <div style="width: 64px; height: 64px; border-radius: 18px; background: linear-gradient(135deg, #6366f1, #a855f7); color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; font-weight: 800; box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);">
            ${(e?.name||"U").charAt(0).toUpperCase()}
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.25rem;">
            <h3 style="font-size: 1.35rem; font-weight: 800; color: #ffffff;">${e?.name||"User"}</h3>
            <p style="font-size: 0.85rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.35rem;">
              ${t.Mail("w-3.5 h-3.5")} ${e?.email||"N/A"}
            </p>
            <div style="margin-top: 0.25rem;">
              <span class="status-badge status-${e?.role||"applied"}">
                ${t.Shield("w-3 h-3")} Role: ${e?.role||"candidate"}
              </span>
            </div>
          </div>
        </div>

        ${e?.company_id?`
          <div style="padding: 1rem; border-radius: 12px; background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.25); display: flex; align-items: center; gap: 0.75rem;">
            ${t.Building2("w-5 h-5 text-indigo-400")}
            <div>
              <p style="font-size: 0.75rem; color: var(--text-muted);">Associated Organization</p>
              <p style="font-size: 0.95rem; font-weight: 700; color: #ffffff;">Company ID #${e.company_id}</p>
            </div>
          </div>
        `:""}
      </div>

      <!-- Candidate Specific Details Form -->
      ${i?`
        <div class="glass-card glass-card-glow" style="display: flex; flex-direction: column; gap: 1.25rem; border-color: rgba(168, 85, 247, 0.35);">
          <h3 style="font-size: 1.15rem; font-weight: 800; color: #ffffff; display: flex; align-items: center; gap: 0.5rem;">
            ${t.User("w-5 h-5 text-purple-400")}
            Candidate Contact & Bio
          </h3>

          <form id="candidate-profile-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
            <div class="grid-split-form">
              <div>
                <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">
                  Phone Number
                </label>
                <div style="position: relative;">
                  <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); display: flex;">
                    ${t.Phone("w-4 h-4")}
                  </span>
                  <input type="text" id="prof-phone" placeholder="+1 (555) 000-0000" class="glass-input" style="padding-left: 2.75rem;" />
                </div>
              </div>

              <div>
                <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">
                  Location / City
                </label>
                <div style="position: relative;">
                  <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); display: flex;">
                    ${t.MapPin("w-4 h-4")}
                  </span>
                  <input type="text" id="prof-location" placeholder="e.g. San Francisco, CA / Remote" class="glass-input" style="padding-left: 2.75rem;" />
                </div>
              </div>
            </div>

            <div>
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">
                Professional Bio & Core Competencies
              </label>
              <textarea id="prof-bio" rows="4" placeholder="Summary of engineering experience, preferred tech stack, and goals..." class="glass-input"></textarea>
            </div>

            <div style="display: flex; justify-content: flex-end;">
              <button type="submit" id="prof-save-btn" class="glass-btn glass-btn-primary">
                Save Profile
              </button>
            </div>
          </form>
        </div>
      `:""}
    </div>
  `}async function Ve(){if(x.getUser()?.role!=="candidate")return;let i=document.getElementById("prof-phone"),a=document.getElementById("prof-location"),o=document.getElementById("prof-bio"),d=document.getElementById("candidate-profile-form"),r=document.getElementById("prof-save-btn"),l=!1;try{let n=await m.get("/candidates/me");n&&(l=!0,i&&(i.value=n.phone||""),a&&(a.value=n.location||""),o&&(o.value=n.bio||""))}catch{l=!1}d?.addEventListener("submit",async n=>{if(n.preventDefault(),!r)return;r.disabled=!0,r.innerHTML="Saving changes...";let s={phone:i?.value.trim()||"",location:a?.value.trim()||"",bio:o?.value.trim()||""};try{l?await m.put("/candidates/me",s):(await m.post("/candidates/",s),l=!0),u("Profile saved successfully!")}catch(g){u(g.message||"Failed to update profile","error")}finally{r.disabled=!1,r.innerHTML="Save Profile"}})}var Ze={"/":{render:ue,public:!0},"/login":{render:he,init:ye,public:!0,authOnly:!1},"/register":{render:te,init:re,public:!0},"/register/candidate":{render:te,init:re,public:!0},"/register-recruiter":{render:ie,init:ne,public:!0},"/register/recruiter":{render:ie,init:ne,public:!0},"/register-interviewer":{render:ae,init:se,public:!0},"/register/interviewer":{render:ae,init:se,public:!0},"/forgot-password":{render:ve,init:be,public:!0},"/jobs":{render:ke,init:$e,public:!0},"/dashboard":{dynamic:!0},"/recruiter":{dynamic:!0},"/interviewer":{dynamic:!0},"/chat":{render:qe,init:Je,roles:["candidate","recruiter","admin","interviewer"]},"/profile":{render:Ne,init:Ve,roles:["candidate","recruiter","admin","interviewer"]},"/resume":{render:Ce,init:Ie,roles:["candidate"]},"/applications":{render:ze,init:Ee,roles:["candidate"]},"/interviews":{render:Be,init:je,roles:["candidate"]},"/recruiter/jobs":{render:Le,init:Re,roles:["recruiter","admin"]},"/recruiter/applications":{render:Ae,init:Pe,roles:["recruiter","admin"]},"/recruiter/interviews":{render:_e,init:Te,roles:["recruiter","admin"]},"/recruiter/matching":{render:Fe,init:Ue,roles:["recruiter","admin"]},"/recruiter/documents":{render:He,init:De,roles:["recruiter","admin"]},"/interviewer/interviews":{render:le,init:de,roles:["interviewer"]}},Y=class{constructor(i="#app-root"){this.appRootSelector=i,this.appRoot=document.querySelector(i),window.addEventListener("hashchange",()=>this.handleRoute())}start(){if(!window.location.hash||window.location.hash==="#"||window.location.hash==="")try{window.history&&window.history.replaceState?window.history.replaceState(null,"","#/"):window.location.hash="#/"}catch{window.location.hash="#/"}this.handleRoute()}handleRoute(){try{this.appRoot||(this.appRoot=document.querySelector(this.appRootSelector)||document.getElementById("app-root"));let a=(window.location.hash||"#/").replace(/^#/,"").split("?")[0]||"/";a.startsWith("/")||(a="/"+a);let o=x.isAuthenticated(),d=x.getRole();if(a==="/dashboard"||a==="/recruiter"||a==="/interviewer"){if(!o){window.location.hash="#/login";return}d==="interviewer"?this.renderView({render:le,init:de},a):d==="recruiter"||d==="admin"?this.renderView({render:Se,init:Me},a):this.renderView({render:xe,init:we},a);return}let r=Ze[a];if(!r){window.location.hash=o?"#/dashboard":"#/";return}if(!r.public&&!o){window.location.hash="#/login";return}if(r.roles&&!r.roles.includes(d)){window.location.hash="#/dashboard";return}this.renderView(r,a)}catch(i){console.error("Routing resolution error:",i)}}renderView(i,a){try{if(this.appRoot||(this.appRoot=document.querySelector(this.appRootSelector)||document.getElementById("app-root")),!this.appRoot)return;window.scrollTo(0,0);let o=x.isAuthenticated(),d=a==="/"||a==="/login"||a.startsWith("/register")||a==="/forgot-password",r=o&&!d,l=ge(),n=r?fe():"",s=typeof i.render=="function"?i.render():"";if(this.appRoot.innerHTML=`
        ${l}
        <main class="app-container">
          ${r?`
            <div class="app-layout-grid">
              ${n}
              <div class="app-main-content">${s}</div>
            </div>
          `:`
            <div class="app-main-content">${s}</div>
          `}
        </main>
      `,document.getElementById("nav-logout-btn")?.addEventListener("click",()=>{x.logout(),window.location.hash="#/login"}),typeof i.init=="function")try{i.init()}catch(g){console.error("Error during route init:",g)}}catch(o){console.error("Fatal renderView error:",o),this.appRoot&&(this.appRoot.innerHTML=`
          <div style="min-height: 80vh; display: flex; align-items: center; justify-content: center; padding: 2rem;">
            <div class="glass-card" style="max-width: 500px; text-align: center; border-color: rgba(244,63,94,0.4);">
              <h3 style="color: #f43f5e; margin-bottom: 0.5rem;">View Render Error</h3>
              <p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 1.5rem;">${o.message||String(o)}</p>
              <a href="#/" class="glass-btn glass-btn-primary">Return to Home</a>
            </div>
          </div>
        `)}}};function We(){try{let e=new Y("#app-root");e.start(),x.onChange(()=>{e.handleRoute()}),x.verifySession().catch(i=>{console.warn("Session verification notice:",i)}),console.log("%c[RecruitAI]%c Frontend SPA initialized successfully","color: #a855f7; font-weight: bold;","color: #34d399;")}catch(e){console.error("Fatal bootstrap error:",e);let i=document.querySelector("#app-root");i&&(i.innerHTML=`
        <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1.5rem;">
          <div class="glass-card" style="max-width: 520px; text-align: center; border-color: rgba(244,63,94,0.4); padding: 2rem;">
            <h2 style="color: #f43f5e; margin-bottom: 0.75rem;">Bootstrap Error</h2>
            <p style="color: #cbd5e1; font-size: 0.875rem; margin-bottom: 1.25rem;">${e.message||String(e)}</p>
            <button onclick="window.location.reload(true)" class="glass-btn glass-btn-primary">Retry</button>
          </div>
        </div>
      `)}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",We):We();})();
