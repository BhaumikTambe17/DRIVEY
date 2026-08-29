const problems = {
  "Tyre Puncture": { i:"🛞", c:"₹200–₹500", s:"Check tyre pressure. If the tyre has a small puncture, repair it or use the spare tyre until it reaches the workshop." },
  "Battery Problem": { i:"🔋", c:"₹800–₹2,500", s:"Check the battery terminals and charge level. The battery may need charging, testing or replacement." },
  "Brake Problem": { i:"🛑", c:"₹1,500–₹4,000", s:"Avoid high-speed driving. Have the brake pads, discs and brake fluid inspected before continued use." },
  "Engine Issue": { i:"⚙️", c:"₹1,000–₹10,000+", s:"Do not ignore unusual noise, smoke or warning lights. A diagnostic check and engine inspection are recommended." },
  "Oil Leakage": { i:"🛢️", c:"₹500–₹5,000", s:"Check the engine-oil level and avoid driving if it is very low. The leak source should be identified and repaired." },
  "Overheating": { i:"🌡️", c:"₹500–₹6,000", s:"Stop safely and let the engine cool. Check coolant only after it is safe, then have the cooling system inspected." },
  "AC Not Cooling": { i:"❄️", c:"₹700–₹4,000", s:"Check the AC settings and cabin filter. If cooling remains poor, refrigerant pressure and compressor operation should be inspected." },
  "Other": { i:"🔧", c:"Inspection required", s:"Describe the symptoms clearly. A technician should inspect the vehicle and provide a final diagnosis and quotation." }
};

const store = {
  get(k, fallback=[]) { try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; } },
  set(k,v) { localStorage.setItem(k, JSON.stringify(v)); }
};

const app = {
  st: { screen:"home", mode:"login", user:null, owner:false, problem:"", vehicle:null, last:null },

  init() {
    this.st.user = store.get("df_user", null);
    this.render();
  },

  show(screen) {
    if (["register","problem","summary","customer"].includes(screen) && !this.st.user) screen = "auth";
    this.st.screen = screen;
    this.render();
    window.scrollTo({top:0, behavior:"smooth"});
  },

  render() {
    this.nav();
    const r = document.getElementById("app");
    const x = this.st.screen;
    let content;
    if (x === "home") content = this.home();
    else if (x === "auth") content = this.authPage();
    else if (x === "register") content = this.register();
    else if (x === "problem") content = this.problem();
    else if (x === "summary") content = this.summary();
    else if (x === "customer") content = this.customer();
    else content = this.owner();
    r.innerHTML = content;
  },

  nav() {
    const n = document.getElementById("nav");
    if (this.st.owner) n.innerHTML = `<button onclick="app.show('owner')">Owner Dashboard</button><button onclick="app.logout()">Logout</button>`;
    else if (this.st.user) n.innerHTML = `<button onclick="app.show('customer')">Dashboard</button><button onclick="app.show('register')">Register Vehicle</button><button onclick="app.logout()">Logout</button>`;
    else n.innerHTML = `<button onclick="app.show('auth')">Login</button><button onclick="app.signup()">Sign Up</button>`;
  },

  toast(message) {
    const t = document.getElementById("toast");
    t.textContent = message;
    t.classList.add("show");
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => t.classList.remove("show"), 2400);
  },

  home() { return `<section class="screen hero"><div class="hero-copy"><div class="eyebrow">Vehicle repair made simple</div><h1>Your vehicle.<br><span>Our workshop.</span></h1><p class="muted hero-text">Register your vehicle, report a problem, get a basic repair suggestion and send the complete request to the workshop owner.</p><div class="actions"><button class="btn primary" onclick="app.st.user?app.show('register'):app.signup()">Register Vehicle</button><button class="btn ghost" onclick="app.show('auth')">Customer Login</button><button class="btn ghost" onclick="app.ownerLogin()">Owner Login</button></div><div class="notice"><b>Local demo</b><br>This version works directly in your browser with no server, database or paid service required.</div></div><div class="art"><div class="orbit"></div><div class="car">🚗</div><div class="floating f1">🛞 Tyre</div><div class="floating f2">🔧 Repair</div><div class="floating f3">⚡ Quick request</div><div class="artlabel"><span>DRIVEFIX</span><span>WORKSHOP</span></div></div></section>`; },

  signup() { this.st.mode="signup"; this.show("auth"); },

  authPage() { return `<section class="screen authwrap"><div class="auth"><div class="eyebrow">${this.st.mode==="login"?"Customer login":"Create customer account"}</div><h2>${this.st.mode==="login"?"Welcome back":"Start with DriveFix"}</h2><p class="muted">Create a simple account, then register your vehicle.</p><div class="tabs"><button class="${this.st.mode==="login"?"active":""}" onclick="app.st.mode='login';app.render()">Login</button><button class="${this.st.mode==="signup"?"active":""}" onclick="app.st.mode='signup';app.render()">Sign Up</button></div><form class="form" onsubmit="app.authSubmit(event)">${this.st.mode==="signup"?`<div class="field"><label>Full name</label><input id="name" required placeholder="Rahul Sharma"></div><div class="field"><label>Phone</label><input id="phone" required inputmode="numeric" placeholder="9876543210"></div>`:""}<div class="field"><label>Email</label><input id="email" type="email" required placeholder="you@example.com"></div><div class="field"><label>Password</label><input id="pass" type="password" required placeholder="••••••••"></div><button class="btn primary" type="submit">${this.st.mode==="login"?"Login":"Create Account"} →</button></form><button class="link" onclick="app.ownerLogin()">Workshop owner login</button></div></section>`; },

  authSubmit(e) {
    e.preventDefault();
    const email=document.getElementById("email").value.trim().toLowerCase();
    const password=document.getElementById("pass").value;
    const users=store.get("df_users",[]);
    if(this.st.mode==="signup") {
      if(users.some(u=>u.email===email)) { this.toast("Account already exists"); return; }
      const u={id:"USR-"+Date.now(),name:document.getElementById("name").value.trim(),phone:document.getElementById("phone").value.trim(),email,password};
      users.push(u); store.set("df_users",users); this.st.user=u;
    } else {
      const u=users.find(x=>x.email===email && x.password===password);
      if(!u) { this.toast("Invalid login. Create an account first."); return; }
      this.st.user=u;
    }
    store.set("df_user",this.st.user);
    this.show("register");
  },

  ownerLogin() {
    const email=prompt("Owner email", "owner@drivefix.demo");
    const pass=prompt("Owner password", "admin123");
    if(email==="owner@drivefix.demo" && pass==="admin123") { this.st.owner=true; this.show("owner"); }
    else this.toast("Demo owner login: owner@drivefix.demo / admin123");
  },

  logout() { this.st.user=null; this.st.owner=false; store.set("df_user",null); this.show("home"); },

  register() { return `<section class="screen"><div class="stepbar"><span class="step active">1</span><span></span><span class="step">2</span><span></span><span class="step">3</span></div><div class="title"><div><div class="eyebrow">STEP 1 OF 3</div><h1>Register your vehicle</h1><p class="muted">First, tell us which vehicle needs repair.</p></div></div><div class="card registration-card"><div class="notice"><b>Vehicle registration</b><br>Your vehicle details will be attached to the repair request shown to the workshop owner.</div><form class="form" onsubmit="app.vehicleSubmit(event)"><div class="grid"><div class="field"><label>Vehicle type</label><select id="type"><option>Car</option><option>Bike</option><option>Scooter</option><option>SUV</option><option>Van</option></select></div><div class="field"><label>Registration number</label><input id="reg" required placeholder="MH12AB1234"></div><div class="field"><label>Brand</label><input id="brand" required placeholder="Hyundai"></div><div class="field"><label>Model</label><input id="model" required placeholder="i20"></div><div class="field"><label>Year</label><input id="year" type="number" min="1980" max="2035" placeholder="2024"></div><div class="field"><label>Vehicle location</label><input id="loc" placeholder="Pune, Maharashtra"></div></div><button class="btn primary full" type="submit">Continue to Problem →</button></form></div></section>`; },

  vehicleSubmit(e) {
    e.preventDefault();
    this.st.vehicle={type:document.getElementById("type").value,reg:document.getElementById("reg").value.trim().toUpperCase(),brand:document.getElementById("brand").value.trim(),model:document.getElementById("model").value.trim(),year:document.getElementById("year").value,location:document.getElementById("loc").value.trim()};
    this.st.problem="";
    this.show("problem");
  },

  problem() { return `<section class="screen"><div class="stepbar"><span class="step done">✓</span><span></span><span class="step active">2</span><span></span><span class="step">3</span></div><div class="title"><div><div class="eyebrow">STEP 2 OF 3</div><h1>What is the problem?</h1><p class="muted">Select the closest issue and add a short description.</p></div></div><div class="problems">${Object.entries(problems).map(([k,v])=>`<button class="problem ${this.st.problem===k?"selected":""}" onclick="app.selectProblem('${k}')"><i>${v.i}</i><strong>${k}</strong><small>${v.c}</small></button>`).join("")}</div><div class="card" style="margin-top:20px"><div class="field"><label>Describe the problem</label><textarea id="desc" placeholder="Example: Front-left tyre loses air every morning."></textarea></div><div class="actions"><button class="btn ghost" onclick="app.show('register')">← Back</button><button class="btn primary" onclick="app.send()">Get Solution & Submit →</button></div></div></section>`; },

  selectProblem(p) { this.st.problem=p; this.render(); },

  send() {
    if(!this.st.problem) { this.toast("Please select a problem"); return; }
    const r={id:"REQ-"+Date.now().toString().slice(-6),user_id:this.st.user.id,user_name:this.st.user.name,user_email:this.st.user.email,user_phone:this.st.user.phone,vehicle:this.st.vehicle,problem:this.st.problem,description:(document.getElementById("desc")?.value||"").trim(),status:"New",created_at:new Date().toISOString()};
    const requests=store.get("df_requests",[]); requests.unshift(r); store.set("df_requests",requests); this.st.last=r; this.show("summary"); this.toast("Repair request submitted");
  },

  summary() { const r=this.st.last,p=problems[r.problem]; return `<section class="screen"><div class="stepbar"><span class="step done">✓</span><span></span><span class="step done">✓</span><span></span><span class="step active">3</span></div><div class="title"><div><div class="eyebrow">STEP 3 OF 3 · SUBMITTED</div><h1>Request received.</h1><p class="muted">Your workshop owner can now view the registration.</p></div><span class="tag">${r.id}</span></div><div class="grid"><div class="card"><div class="eyebrow">VEHICLE</div><h3>${r.vehicle.brand} ${r.vehicle.model}</h3><p class="muted">${r.vehicle.type} · ${r.vehicle.reg} · ${r.vehicle.location||"Location not added"}</p><hr><p><b>Problem</b><br>${p.i} ${r.problem}</p><p class="muted">${r.description||"No extra description."}</p></div><div class="solution"><div class="eyebrow">SUGGESTED SOLUTION</div><p>${p.s}</p><div class="muted">Estimated repair cost</div><div class="cost">${p.c}</div><p class="muted">Final cost is confirmed after workshop inspection.</p></div></div><div class="actions"><button class="btn primary" onclick="app.show('customer')">My Dashboard</button><button class="btn ghost" onclick="app.show('register')">Register Another Vehicle</button></div></section>`; },

  customer() { const a=store.get("df_requests",[]).filter(r=>r.user_id===this.st.user?.id); return `<section class="screen"><div class="title"><div><div class="eyebrow">CUSTOMER DASHBOARD</div><h1>Hi, ${this.st.user?.name||"there"}.</h1><p class="muted">Your vehicle requests are saved on this browser.</p></div><button class="btn primary" onclick="app.show('register')">+ Register Vehicle</button></div><div class="card callout"><div><div class="eyebrow">NEW REPAIR REQUEST</div><h2>Register a vehicle</h2><p class="muted">Enter vehicle details, select the problem and send the request to the workshop owner.</p></div><button class="btn primary" onclick="app.show('register')">Start Registration →</button></div><div class="stats"><div class="stat"><span>Total requests</span><b>${a.length}</b></div><div class="stat"><span>New</span><b>${a.filter(x=>x.status==="New").length}</b></div><div class="stat"><span>Accepted</span><b>${a.filter(x=>x.status==="Accepted").length}</b></div><div class="stat"><span>Completed</span><b>${a.filter(x=>x.status==="Completed").length}</b></div></div><div class="card"><h3>My repair requests</h3>${a.length?a.map(r=>`<div class="request"><div><h4>${r.vehicle.brand} ${r.vehicle.model} · ${r.vehicle.reg}</h4><p>${r.problem} · ${new Date(r.created_at).toLocaleString()}</p></div><span class="tag">${r.status}</span></div>`).join(""):`<div class="empty"><div class="empty-icon">🚗</div><b>No repair requests yet</b><p class="muted">Register your vehicle to create your first request.</p></div>`}</div></section>`; },

  owner() { const a=store.get("df_requests",[]); return `<section class="screen"><div class="title"><div><div class="eyebrow">WORKSHOP OWNER</div><h1>Repair dashboard</h1><p class="muted">See customer vehicle registrations and repair problems.</p></div><span class="tag">OWNER MODE</span></div><div class="stats"><div class="stat"><span>Total</span><b>${a.length}</b></div><div class="stat"><span>New</span><b>${a.filter(x=>x.status==="New").length}</b></div><div class="stat"><span>Accepted</span><b>${a.filter(x=>x.status==="Accepted").length}</b></div><div class="stat"><span>Completed</span><b>${a.filter(x=>x.status==="Completed").length}</b></div></div><div class="card"><div class="owner-head"><div><h3>Customer registrations</h3><p class="muted">Requests submitted from this browser.</p></div><button class="btn ghost" onclick="app.clearRequests()">Clear Demo Requests</button></div>${a.length?a.map(r=>`<div class="request owner-request"><div><h4>${r.user_name} · ${r.user_phone||r.user_email}</h4><p><b>${r.vehicle.brand} ${r.vehicle.model}</b> · ${r.vehicle.reg} · ${r.vehicle.type}</p><p>${r.problem} · ${r.description||"No description"}</p><small>${r.vehicle.location||"No location"} · ${new Date(r.created_at).toLocaleString()}</small></div><div class="request-actions"><span class="tag">${r.status}</span><div class="actions"><button class="btn ghost" onclick="app.status('${r.id}','Accepted')">Accept</button><button class="btn primary" onclick="app.status('${r.id}','Completed')">Complete</button></div></div></div>`).join(""):`<div class="empty"><div class="empty-icon">📋</div><b>No customer requests yet</b><p class="muted">When a customer submits a repair request on this browser, it will appear here.</p></div>`}</div></section>`; },

  status(id,s) { const a=store.get("df_requests",[]).map(r=>r.id===id?{...r,status:s}:r); store.set("df_requests",a); this.toast("Status updated"); this.render(); },
  clearRequests() { if(confirm("Delete all demo repair requests?")){store.set("df_requests",[]);this.render();} }
};

window.app=app;
app.init();
