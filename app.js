const STORAGE_KEY="lidire-mvp-data";

const initialState={
  page:"inicio",
  user:{name:"Alice",email:"conta@lidire.com",phone:"",age:""},
  data:{
    tarefas:[],compromissos:[],compras:[],estudos:[],treinos:[],
    lembretes:[],agua:0,fin:{receitas:[],despesas:[]},objetivos:[],familia:[]
  }
};

const state=JSON.parse(JSON.stringify(initialState));

const icon={
  inicio:"⌂",agenda:"▣",assistente:"✦",explorar:"◈",perfil:"●",
  tarefa:"✓",compra:"🛒",estudo:"📚",treino:"🏋️",agua:"💧",fin:"💰",familia:"👨‍👩‍👧"
};

const modules={
  tarefas:["✓","Tarefas","Organize o que precisa ser feito."],
  compras:["🛒","Compras","Crie listas e marque os itens concluídos."],
  estudos:["📚","Estudos","Planeje atividades e acompanhe seu progresso."],
  treinos:["🏋️","Treinos","Registre exercícios, séries e repetições."],
  hidratacao:["💧","Hidratação","Acompanhe sua meta diária de água."],
  financas:["💰","Finanças","Registre receitas e despesas."],
  objetivos:["🎯","Objetivos","Transforme planos em metas acompanháveis."],
  familia:["👨‍👩‍👧","Família","Compartilhe informações da rotina."]
};

function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function uid(p="id"){return p+"-"+Date.now()+"-"+Math.random().toString(36).slice(2,8);}
function today(){return new Date().toISOString().slice(0,10);}
function formatDate(d){if(!d)return"";const p=String(d).split("-");return p.length===3?`${p[2]}/${p[1]}/${p[0]}`:d;}
function money(v){return Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});}
function num(v){const n=Number(String(v??"").replace(",","."));return Number.isFinite(n)?n:0;}

function toast(message){
  let e=document.querySelector(".toast");
  if(!e){e=document.createElement("div");e.className="toast";e.style.cssText="position:fixed;left:50%;bottom:90px;transform:translateX(-50%);z-index:9999;padding:12px 18px;border-radius:14px;background:#151b3d;color:#fff;border:1px solid rgba(255,255,255,.12);box-shadow:0 10px 30px rgba(0,0,0,.35);font-size:14px;max-width:90%;text-align:center";document.body.appendChild(e);}
  e.textContent=message;e.style.display="block";clearTimeout(window.__lidireToast);
  window.__lidireToast=setTimeout(()=>e.style.display="none",2200);
}

function persist(){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify({user:state.user,data:state.data}));}
  catch(e){console.error("Erro ao salvar dados:",e);}
}

function normalize(){
  ["tarefas","compromissos","compras","estudos","treinos","lembretes","objetivos","familia"].forEach(k=>{
    if(!Array.isArray(state.data[k]))state.data[k]=[];
  });
  if(!state.data.fin)state.data.fin={receitas:[],despesas:[]};
  if(!Array.isArray(state.data.fin.receitas))state.data.fin.receitas=[];
  if(!Array.isArray(state.data.fin.despesas))state.data.fin.despesas=[];
  state.data.agua=Number(state.data.agua)||0;
}

function loadLocal(){
  try{
    const s=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");
    if(s?.user)state.user={...state.user,...s.user};
    if(s?.data)state.data={...state.data,...s.data};
  }catch(e){console.error("Erro ao carregar dados:",e);}
  normalize();
}

function go(page){state.page=page;render();window.scrollTo({top:0,behavior:"smooth"});}

function stat(v,l){return`<div class="stat"><b>${v}</b><span>${l}</span></div>`;}
function quick(ic,title,text,target){return`<button class="item" data-page="${target}"><span class="ico">${icon[ic]||ic}</span><span style="text-align:left;flex:1"><b>${title}</b><br><small class="muted">${text}</small></span><span>›</span></button>`;}
function emptyState(msg,label,action){return`<div class="card" style="text-align:center;padding:28px 20px"><div style="font-size:34px">✦</div><p class="muted">${msg}</p><button class="primary" data-action="${action}">${label}</button></div>`;}

function layout(content){
  const nav=[["inicio","Início"],["agenda","Agenda"],["assistente","Assistente"],["explorar","Explorar"],["perfil","Perfil"]];
  return`<div class="app-shell">
    <header class="topbar"><div class="brand"><img src="/logo-lidire-oficial.png" alt="LiDire"><div><strong>LiDire</strong><small>Seu Copiloto para a Vida</small></div></div>
    <button class="icon-btn" data-action="notifications" aria-label="Notificações">♧</button></header>
    <main>${content}</main>
    <nav class="bottom-nav">${nav.map(([id,label])=>`<button class="nav-btn ${state.page===id?"active":""}" data-page="${id}"><span class="nav-ico">${icon[id]}</span>${label}</button>`).join("")}</nav>
  </div>`;
}

function render(){
  try{
    const app=document.getElementById("app");
    if(!app)throw new Error("Elemento #app não encontrado.");
    const pages={inicio:home,agenda,assistente:renderAssistant,explorar:explore,perfil:profile};
    app.innerHTML=layout(pages[state.page]?pages[state.page]():modulePage(state.page));
  }catch(e){console.error(e);showAppError(e);}
}

function showAppError(e){
  const app=document.getElementById("app");if(!app)return;
  app.innerHTML=`<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#070C22;color:#fff;font-family:Inter,Arial,sans-serif"><div style="max-width:520px;padding:28px;border-radius:20px;background:rgba(255,255,255,.06)"><div style="font-size:42px">⚠️</div><h1>A LiDire encontrou um erro</h1><p style="color:#b9bfd3">O aplicativo foi carregado, mas ocorreu um erro ao montar esta tela.</p><details><summary>Detalhes técnicos</summary><pre style="white-space:pre-wrap">${esc(e?.message||e)}</pre></details><button data-action="reload" style="margin-top:20px;padding:12px 18px;border:0;border-radius:12px">Recarregar LiDire</button></div></div>`;
}

function home(){
  const pt=state.data.tarefas.filter(x=>!x.done).length;
  const pc=state.data.compras.filter(x=>!x.done).length;
  const ca=state.data.compromissos.filter(x=>!x.date||x.date===today()).length;
  const ps=state.data.estudos.filter(x=>!x.done).length;
  return`<section class="hero-card card"><div class="eyebrow">Seu Copiloto para a Vida</div><h1>Olá,<br><span class="gradient-text">${esc(state.user.name)}!</span> ☀️</h1><p class="muted">Aqui está um resumo da sua rotina. Vamos organizar o que importa?</p><div class="stat-grid">${stat(pt,"Tarefas pendentes")}${stat(ca,"Compromissos hoje")}${stat(ps,"Estudos pendentes")}${stat(pc,"Itens para comprar")}</div></section>
  <div class="row"><h2>Meu dia</h2><button class="secondary" data-page="assistente">Falar com a LiDire</button></div>
  <div class="stack">${quick("tarefa","Tarefas","Crie, conclua e exclua tarefas.","tarefas")}${quick("agenda","Agenda","Adicione e gerencie compromissos.","agenda")}${quick("compra","Compras","Sua lista fica salva no dispositivo.","compras")}${quick("estudo","Estudos","Planeje o que precisa estudar.","estudos")}</div>
  <div class="card"><div class="row"><div><h3>Insight da LiDire</h3><p class="muted">${assistantInsight()}</p></div><span class="ico">✦</span></div></div>`;
}
function assistantInsight(){
  const t=state.data.tarefas.filter(x=>!x.done).length,c=state.data.compromissos.filter(x=>x.date===today()).length;
  if(!t&&!c)return"Sua rotina está tranquila. Aproveite para planejar o próximo passo.";
  if(t>5)return"Você tem várias tarefas pendentes. Que tal escolher as três mais importantes?";
  if(c)return`Você tem ${c} compromisso(s) hoje. Organize suas tarefas ao redor deles.`;
  return"Continue registrando sua rotina. A LiDire vai ficando mais útil conforme você usa.";
}

function agenda(){
  const items=[...state.data.compromissos].sort((a,b)=>`${a.date||""} ${a.time||""}`.localeCompare(`${b.date||""} ${b.time||""}`));
  return`<div class="page-header"><div><div class="eyebrow">Minha rotina</div><h1>Agenda</h1><p class="muted">Seus compromissos em um só lugar.</p></div><button class="primary" data-action="add-commitment">+ Novo</button></div><div class="stack">${items.length?items.map(commitmentCard).join(""):emptyState("Você ainda não possui compromissos.","Adicionar compromisso","add-commitment")}</div>`;
}
function commitmentCard(x){return`<div class="card item-row"><div class="ico">📅</div><div style="flex:1"><b>${esc(x.title)}</b><div class="muted">${formatDate(x.date)}${x.time?" • "+esc(x.time):""}</div>${x.note?`<small class="muted">${esc(x.note)}</small>`:""}</div><button class="icon-btn" data-action="edit-commitment" data-id="${x.id}">✎</button><button class="icon-btn" data-action="delete-commitment" data-id="${x.id}">🗑</button></div>`;}
function addCommitment(){
  const title=prompt("Nome do compromisso:");if(!title?.trim())return;
  state.data.compromissos.push({id:uid("comp"),title:title.trim(),date:prompt("Data (AAAA-MM-DD):",today())||today(),time:prompt("Horário (opcional):","")||"",note:prompt("Observação (opcional):","")||""});
  persist();render();toast("Compromisso adicionado.");
}
function editCommitment(id){
  const x=state.data.compromissos.find(x=>x.id===id);if(!x)return;
  const title=prompt("Nome do compromisso:",x.title);if(!title?.trim())return;
  x.title=title.trim();x.date=prompt("Data (AAAA-MM-DD):",x.date||today())||x.date;x.time=prompt("Horário:",x.time||"")||"";x.note=prompt("Observação:",x.note||"")||"";
  persist();render();toast("Compromisso atualizado.");
}
function deleteCommitment(id){if(!confirm("Excluir este compromisso?"))return;state.data.compromissos=state.data.compromissos.filter(x=>x.id!==id);persist();render();toast("Compromisso excluído.");}

function tasksPage(){const a=state.data.tarefas;return`<div class="page-header"><div><div class="eyebrow">Organização</div><h1>Tarefas</h1><p class="muted">Tudo o que você precisa fazer.</p></div><button class="primary" data-action="add-task">+ Nova</button></div><div class="stack">${a.length?a.map(taskCard).join(""):emptyState("Nenhuma tarefa cadastrada.","Criar tarefa","add-task")}</div>`;}
function taskCard(x){return`<div class="card item-row"><button class="check-btn ${x.done?"done":""}" data-action="toggle-task" data-id="${x.id}">${x.done?"✓":""}</button><div style="flex:1"><b style="${x.done?"text-decoration:line-through;opacity:.55;":""}">${esc(x.title)}</b>${x.date?`<div class="muted">${formatDate(x.date)}</div>`:""}</div><button class="icon-btn" data-action="edit-task" data-id="${x.id}">✎</button><button class="icon-btn" data-action="delete-task" data-id="${x.id}">🗑</button></div>`;}
function addTask(){const title=prompt("Qual tarefa você precisa realizar?");if(!title?.trim())return;state.data.tarefas.push({id:uid("task"),title:title.trim(),date:prompt("Data (AAAA-MM-DD) ou deixe vazio:","")||"",done:false});persist();render();toast("Tarefa criada.");}
function toggleTask(id){const x=state.data.tarefas.find(x=>x.id===id);if(!x)return;x.done=!x.done;persist();render();toast(x.done?"Tarefa concluída.":"Tarefa reaberta.");}
function editTask(id){const x=state.data.tarefas.find(x=>x.id===id);if(!x)return;const t=prompt("Editar tarefa:",x.title);if(!t?.trim())return;x.title=t.trim();x.date=prompt("Data (AAAA-MM-DD):",x.date||"")||"";persist();render();toast("Tarefa atualizada.");}
function deleteTask(id){if(!confirm("Excluir esta tarefa?"))return;state.data.tarefas=state.data.tarefas.filter(x=>x.id!==id);persist();render();toast("Tarefa excluída.");}

function shoppingPage(){const a=state.data.compras;return`<div class="page-header"><div><div class="eyebrow">Lista</div><h1>Compras</h1><p class="muted">Não esqueça o que precisa comprar.</p></div><button class="primary" data-action="add-shopping">+ Item</button></div><div class="stack">${a.length?a.map(shoppingCard).join(""):emptyState("Sua lista de compras está vazia.","Adicionar item","add-shopping")}</div>`;}
function shoppingCard(x){return`<div class="card item-row"><button class="check-btn ${x.done?"done":""}" data-action="toggle-shopping" data-id="${x.id}">${x.done?"✓":""}</button><div style="flex:1"><b style="${x.done?"text-decoration:line-through;opacity:.55;":""}">${esc(x.title)}</b>${x.quantity?`<div class="muted">Quantidade: ${esc(x.quantity)}</div>`:""}</div><button class="icon-btn" data-action="delete-shopping" data-id="${x.id}">🗑</button></div>`;}
function addShopping(){const title=prompt("O que você precisa comprar?");if(!title?.trim())return;state.data.compras.push({id:uid("buy"),title:title.trim(),quantity:prompt("Quantidade (opcional):","")||"",done:false});persist();render();toast("Item adicionado à lista.");}
function toggleShopping(id){const x=state.data.compras.find(x=>x.id===id);if(!x)return;x.done=!x.done;persist();render();}
function deleteShopping(id){state.data.compras=state.data.compras.filter(x=>x.id!==id);persist();render();toast("Item removido.");}

function studiesPage(){const a=state.data.estudos;return`<div class="page-header"><div><div class="eyebrow">Aprendizado</div><h1>Estudos</h1><p class="muted">Organize seu plano de estudos.</p></div><button class="primary" data-action="add-study">+ Estudo</button></div><div class="stack">${a.length?a.map(studyCard).join(""):emptyState("Nenhuma atividade de estudo cadastrada.","Adicionar estudo","add-study")}</div>`;}
function studyCard(x){return`<div class="card item-row"><button class="check-btn ${x.done?"done":""}" data-action="toggle-study" data-id="${x.id}">${x.done?"✓":""}</button><div style="flex:1"><b>${esc(x.title)}</b>${x.subject?`<div class="muted">${esc(x.subject)}</div>`:""}${x.date?`<small class="muted">${formatDate(x.date)}</small>`:""}</div><button class="icon-btn" data-action="delete-study" data-id="${x.id}">🗑</button></div>`;}
function addStudy(){const title=prompt("O que você vai estudar?");if(!title?.trim())return;state.data.estudos.push({id:uid("study"),title:title.trim(),subject:prompt("Matéria ou área:","")||"",date:prompt("Data (AAAA-MM-DD):",today())||today(),done:false});persist();render();toast("Estudo adicionado.");}
function toggleStudy(id){const x=state.data.estudos.find(x=>x.id===id);if(!x)return;x.done=!x.done;persist();render();}
function deleteStudy(id){state.data.estudos=state.data.estudos.filter(x=>x.id!==id);persist();render();toast("Estudo removido.");}

function workoutsPage(){const a=state.data.treinos;return`<div class="page-header"><div><div class="eyebrow">Bem-estar</div><h1>Treinos</h1><p class="muted">Registre seus exercícios.</p></div><button class="primary" data-action="add-workout">+ Treino</button></div><div class="stack">${a.length?a.map(workoutCard).join(""):emptyState("Nenhum treino registrado.","Adicionar treino","add-workout")}</div>`;}
function workoutCard(x){return`<div class="card item-row"><div class="ico">🏋️</div><div style="flex:1"><b>${esc(x.title)}</b><div class="muted">${formatDate(x.date)}${x.duration?" • "+esc(x.duration):""}</div>${x.notes?`<small class="muted">${esc(x.notes)}</small>`:""}</div><button class="icon-btn" data-action="delete-workout" data-id="${x.id}">🗑</button></div>`;}
function addWorkout(){const title=prompt("Qual treino você fez?");if(!title?.trim())return;state.data.treinos.push({id:uid("workout"),title:title.trim(),duration:prompt("Duração (ex.: 45 min):","")||"",notes:prompt("Observações:","")||"",date:today()});persist();render();toast("Treino registrado.");}
function deleteWorkout(id){state.data.treinos=state.data.treinos.filter(x=>x.id!==id);persist();render();toast("Treino removido.");}

function hydrationPage(){const g=Number(state.data.agua)||0,goal=8,p=Math.min(100,Math.round(g/goal*100));return`<div class="page-header"><div><div class="eyebrow">Bem-estar</div><h1>Hidratação</h1><p class="muted">Acompanhe sua água durante o dia.</p></div></div><div class="card" style="text-align:center"><div style="font-size:64px">💧</div><h2>${g} / ${goal} copos</h2><div style="height:12px;border-radius:99px;background:rgba(255,255,255,.08);overflow:hidden;margin:20px 0"><div style="width:${p}%;height:100%;border-radius:99px;background:linear-gradient(90deg,#6c5ce7,#27d7ff)"></div></div><p class="muted">${p}% da meta diária</p><div class="row" style="justify-content:center"><button class="secondary" data-action="remove-water">−</button><button class="primary" data-action="add-water">+ 1 copo</button><button class="secondary" data-action="reset-water">Zerar</button></div></div>`;}
function addWater(){state.data.agua=Math.max(0,Number(state.data.agua||0)+1);persist();render();toast("Copo de água registrado.");}
function removeWater(){state.data.agua=Math.max(0,Number(state.data.agua||0)-1);persist();render();}
function resetWater(){state.data.agua=0;persist();render();toast("Contador de água zerado.");}

function financePage(){
  const r=state.data.fin.receitas,d=state.data.fin.despesas;
  const tr=r.reduce((s,x)=>s+num(x.value),0),td=d.reduce((s,x)=>s+num(x.value),0),saldo=tr-td;
  const all=[...r.map(x=>({...x,type:"receita"})),...d.map(x=>({...x,type:"despesa"}))].sort((a,b)=>String(b.date||"").localeCompare(String(a.date||"")));
  return`<div class="page-header"><div><div class="eyebrow">Organização financeira</div><h1>Finanças</h1><p class="muted">Registre suas entradas e saídas.</p></div><div class="row"><button class="primary" data-action="add-income">+ Receita</button><button class="secondary" data-action="add-expense">+ Despesa</button></div></div><div class="stat-grid">${stat(money(tr),"Receitas")}${stat(money(td),"Despesas")}${stat(money(saldo),"Saldo")}</div><div class="stack">${all.length?all.map(financeCard).join(""):emptyState("Nenhuma movimentação registrada.","Adicionar receita","add-income")}</div>`;
}
function financeCard(x){const pos=x.type==="receita";return`<div class="card item-row"><div class="ico">${pos?"↗":"↘"}</div><div style="flex:1"><b>${esc(x.title)}</b><div class="muted">${formatDate(x.date)}</div></div><strong>${pos?"+":"-"}${money(x.value)}</strong><button class="icon-btn" data-action="delete-finance" data-type="${x.type}" data-id="${x.id}">🗑</button></div>`;}
function addIncome(){const t=prompt("Descrição da receita:");if(!t?.trim())return;const v=num(prompt("Valor da receita:"));if(v<=0){toast("Digite um valor válido.");return;}state.data.fin.receitas.push({id:uid("income"),title:t.trim(),value:v,date:today()});persist();render();toast("Receita adicionada.");}
function addExpense(){const t=prompt("Descrição da despesa:");if(!t?.trim())return;const v=num(prompt("Valor da despesa:"));if(v<=0){toast("Digite um valor válido.");return;}state.data.fin.despesas.push({id:uid("expense"),title:t.trim(),value:v,date:today()});persist();render();toast("Despesa adicionada.");}
function deleteFinance(type,id){const c=type==="receita"?"receitas":"despesas";state.data.fin[c]=state.data.fin[c].filter(x=>x.id!==id);persist();render();toast("Movimentação removida.");}

function goalsPage(){const a=state.data.objetivos;return`<div class="page-header"><div><div class="eyebrow">Planejamento</div><h1>Objetivos</h1><p class="muted">Transforme planos em metas acompanháveis.</p></div><button class="primary" data-action="add-goal">+ Objetivo</button></div><div class="stack">${a.length?a.map(goalCard).join(""):emptyState("Você ainda não cadastrou objetivos.","Criar objetivo","add-goal")}</div>`;}
function goalCard(x){const p=Math.max(0,Math.min(100,num(x.progress)));return`<div class="card"><div class="row"><div><h3>${esc(x.title)}</h3>${x.deadline?`<small class="muted">Prazo: ${formatDate(x.deadline)}</small>`:""}</div><strong>${p}%</strong></div><div style="height:10px;border-radius:99px;background:rgba(255,255,255,.08);overflow:hidden;margin:16px 0"><div style="width:${p}%;height:100%;background:linear-gradient(90deg,#6c5ce7,#27d7ff);border-radius:99px"></div></div><div class="row"><button class="secondary" data-action="update-goal" data-id="${x.id}">Atualizar</button><button class="icon-btn" data-action="delete-goal" data-id="${x.id}">🗑</button></div></div>`;}
function addGoal(){const t=prompt("Qual é o seu objetivo?");if(!t?.trim())return;state.data.objetivos.push({id:uid("goal"),title:t.trim(),deadline:prompt("Prazo (AAAA-MM-DD), opcional:","")||"",progress:0});persist();render();toast("Objetivo criado.");}
function updateGoal(id){const x=state.data.objetivos.find(x=>x.id===id);if(!x)return;x.progress=Math.max(0,Math.min(100,num(prompt("Progresso de 0 a 100:",String(x.progress||0)))));persist();render();toast("Objetivo atualizado.");}
function deleteGoal(id){state.data.objetivos=state.data.objetivos.filter(x=>x.id!==id);persist();render();toast("Objetivo removido.");}

function familyPage(){const a=state.data.familia;return`<div class="page-header"><div><div class="eyebrow">Compartilhamento</div><h1>Família</h1><p class="muted">Organize a rotina junto com quem importa.</p></div><button class="primary" data-action="add-family">+ Pessoa</button></div><div class="card"><p class="muted">Nesta versão do MVP, os membros são registrados localmente. O compartilhamento entre contas será conectado ao D1 na próxima etapa.</p></div><div class="stack">${a.length?a.map(familyCard).join(""):emptyState("Nenhum membro adicionado.","Adicionar pessoa","add-family")}</div>`;}
function familyCard(x){return`<div class="card item-row"><div class="ico">👤</div><div style="flex:1"><b>${esc(x.name)}</b><div class="muted">${esc(x.email)}</div></div><button class="icon-btn" data-action="delete-family" data-id="${x.id}">🗑</button></div>`;}
function addFamily(){const n=prompt("Nome da pessoa:");if(!n?.trim())return;state.data.familia.push({id:uid("family"),name:n.trim(),email:prompt("E-mail (opcional):","")||""});persist();render();toast("Pessoa adicionada.");}
function deleteFamily(id){state.data.familia=state.data.familia.filter(x=>x.id!==id);persist();render();toast("Pessoa removida.");}

function renderAssistant(){
  return`<div class="page-header"><div><div class="eyebrow">Seu Copiloto</div><h1>Assistente LiDire</h1><p class="muted">Organize sua vida conversando com a LiDire.</p></div></div>
  <div class="card"><div class="assistant-message"><span class="ico">✦</span><div><b>LiDire</b><p class="muted">Olá! Ainda estou na versão inicial, mas já posso ajudar você a consultar sua rotina.</p></div></div>
  <div class="stack" style="margin-top:20px"><button class="item" data-action="assistant-suggestion" data-message="O que tenho para fazer hoje?">📅<span style="flex:1;text-align:left">O que tenho para fazer hoje?</span>›</button><button class="item" data-action="assistant-suggestion" data-message="Como está minha rotina?">✦<span style="flex:1;text-align:left">Como está minha rotina?</span>›</button><button class="item" data-action="assistant-suggestion" data-message="Tenho tarefas pendentes?">✓<span style="flex:1;text-align:left">Tenho tarefas pendentes?</span>›</button></div>
  <div style="display:flex;gap:10px;margin-top:20px"><input id="assistantInput" type="text" placeholder="Digite sua pergunta..." style="flex:1;min-width:0;padding:13px 14px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:white"><button class="primary" data-action="assistant-send">Enviar</button></div><div id="assistantResponse" style="margin-top:18px"></div></div>`;
}
function assistantAnswer(m){
  const t=String(m||"").toLowerCase(),tasks=state.data.tarefas.filter(x=>!x.done),comps=state.data.compromissos.filter(x=>!x.date||x.date===today()),studies=state.data.estudos.filter(x=>!x.done);
  if(t.includes("tarefa")||t.includes("fazer"))return tasks.length?`Você tem <b>${tasks.length}</b> tarefa(s) pendente(s):<br><br>${tasks.slice(0,5).map(x=>"• "+esc(x.title)).join("<br>")}`:"Você não tem tarefas pendentes no momento.";
  if(t.includes("hoje")||t.includes("compromisso")||t.includes("agenda"))return comps.length?`Você tem <b>${comps.length}</b> compromisso(s):<br><br>${comps.slice(0,5).map(x=>"• "+esc(x.title)+(x.time?" — "+esc(x.time):"")).join("<br>")}`:"Você não possui compromissos registrados para hoje.";
  if(t.includes("estudo")||t.includes("estudar"))return studies.length?`Você tem <b>${studies.length}</b> atividade(s) de estudo pendente(s).`:"Não há estudos pendentes registrados.";
  return`Posso ajudar você a consultar sua rotina. Experimente perguntar sobre <b>tarefas</b>, <b>compromissos</b> ou <b>estudos</b>.`;
}
function sendAssistant(message){
  const input=document.getElementById("assistantInput"),response=document.getElementById("assistantResponse"),value=String(message||input?.value||"").trim();
  if(!value)return;if(input)input.value="";
  if(response)response.innerHTML=`<div class="card"><div class="muted">Você</div><p>${esc(value)}</p><hr style="border:0;border-top:1px solid rgba(255,255,255,.08)"><div class="muted">LiDire</div><p>${assistantAnswer(value)}</p></div>`;
}

function explore(){
  return`<div class="page-header"><div><div class="eyebrow">Tudo em um só lugar</div><h1>Explorar</h1><p class="muted">Conheça os recursos da LiDire.</p></div></div><div class="stack">${Object.keys(modules).map(k=>{const x=modules[k];return`<button class="item" data-page="${k}"><span class="ico">${x[0]}</span><span style="flex:1;text-align:left"><b>${x[1]}</b><br><small class="muted">${x[2]}</small></span><span>›</span></button>`}).join("")}</div>`;
}

function profile(){
  return`<div class="page-header"><div><div class="eyebrow">Minha conta</div><h1>Perfil</h1><p class="muted">Seus dados pessoais.</p></div></div>
  <div class="card"><div class="profile-avatar">${esc(String(state.user.name||"A").charAt(0).toUpperCase())}</div><h2>${esc(state.user.name)}</h2><p class="muted">${esc(state.user.email)}</p>${state.user.phone?`<p class="muted">${esc(state.user.phone)}</p>`:""}<button class="primary" data-action="edit-profile">Editar perfil</button></div>
  <div class="stack"><button class="item" data-page="familia">👨‍👩‍👧<span style="flex:1;text-align:left"><b>Família</b><br><small class="muted">Pessoas e compartilhamento</small></span>›</button><button class="item" data-action="clear-local">🗑<span style="flex:1;text-align:left"><b>Limpar dados locais</b><br><small class="muted">Apaga os dados salvos neste dispositivo</small></span>›</button></div>`;
}
function editProfile(){
  const n=prompt("Seu nome:",state.user.name);if(!n?.trim())return;
  state.user.name=n.trim();state.user.email=(prompt("Seu e-mail:",state.user.email||"")||"").trim();state.user.phone=(prompt("Telefone:",state.user.phone||"")||"").trim();
  persist();render();toast("Perfil atualizado.");
}
function clearLocal(){
  if(!confirm("Isso apagará os dados salvos neste navegador. Continuar?"))return;
  localStorage.removeItem(STORAGE_KEY);Object.assign(state,JSON.parse(JSON.stringify(initialState)));render();toast("Dados locais apagados.");
}

function modulePage(page){
  switch(page){
    case"tarefas":return tasksPage();
    case"compras":return shoppingPage();
    case"estudos":return studiesPage();
    case"treinos":return workoutsPage();
    case"hidratacao":return hydrationPage();
    case"financas":return financePage();
    case"objetivos":return goalsPage();
    case"familia":return familyPage();
    default:return`<div class="card"><h1>Página não encontrada</h1><button class="primary" data-page="inicio">Voltar ao início</button></div>`;
  }
}

document.addEventListener("click",event=>{
  const pageEl=event.target.closest("[data-page]");
  if(pageEl?.dataset.page){event.preventDefault();go(pageEl.dataset.page);return;}
  const b=event.target.closest("[data-action]");
  if(!b)return;
  const a=b.dataset.action,id=b.dataset.id;
  switch(a){
    case"notifications":toast("As notificações serão conectadas na próxima etapa.");break;
    case"reload":location.reload();break;
    case"add-commitment":addCommitment();break;
    case"edit-commitment":editCommitment(id);break;
    case"delete-commitment":deleteCommitment(id);break;
    case"add-task":addTask();break;
    case"toggle-task":toggleTask(id);break;
    case"edit-task":editTask(id);break;
    case"delete-task":deleteTask(id);break;
    case"add-shopping":addShopping();break;
    case"toggle-shopping":toggleShopping(id);break;
    case"delete-shopping":deleteShopping(id);break;
    case"add-study":addStudy();break;
    case"toggle-study":toggleStudy(id);break;
    case"delete-study":deleteStudy(id);break;
    case"add-workout":addWorkout();break;
    case"delete-workout":deleteWorkout(id);break;
    case"add-water":addWater();break;
    case"remove-water":removeWater();break;
    case"reset-water":resetWater();break;
    case"add-income":addIncome();break;
    case"add-expense":addExpense();break;
    case"delete-finance":deleteFinance(b.dataset.type,id);break;
    case"add-goal":addGoal();break;
    case"update-goal":updateGoal(id);break;
    case"delete-goal":deleteGoal(id);break;
    case"add-family":addFamily();break;
    case"delete-family":deleteFamily(id);break;
    case"edit-profile":editProfile();break;
    case"clear-local":clearLocal();break;
    case"assistant-suggestion":sendAssistant(b.dataset.message);break;
    case"assistant-send":sendAssistant();break;
  }
});

document.addEventListener("keydown",event=>{
  if(event.key==="Enter"&&event.target?.id==="assistantInput"){event.preventDefault();sendAssistant();}
});

window.LiDire={state,go,render,persist,addTask,addCommitment,addShopping,addStudy,addWorkout,addWater,addIncome,addExpense,addGoal,addFamily,sendAssistant};

function initLiDire(){loadLocal();render();console.log("LiDire MVP inicializado.");}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initLiDire);else initLiDire();


/* =========================================================
   LiDire MVP V3
   Mantém o armazenamento local da V2 e amplia os módulos.
   O Worker/D1 não é alterado por este arquivo.
   ========================================================= */

const LIDIRE_V3 = "lidore-mvp-versao-3";

function v3FinanceTransactions() {
  const fin = state.data.fin || {receitas:[], despesas:[]};
  return [
    ...(fin.receitas || []).map(x => ({...x, type:"receita"})),
    ...(fin.despesas || []).map(x => ({...x, type:"despesa"}))
  ];
}

function v3Normalize() {
  if (!state.settings) state.settings = {};
  state.settings.financeLimit = Number(state.settings.financeLimit || 0);
  state.settings.financeWarning = Number(state.settings.financeWarning || 80);
  state.settings.hydrationReminder = !!state.settings.hydrationReminder;
  state.settings.hydrationInterval = Number(state.settings.hydrationInterval || 60);

  if (!Array.isArray(state.data.comprasListas)) {
    const old = Array.isArray(state.data.compras) ? state.data.compras : [];
    state.data.comprasListas = [{
      id: uid("lista"), name: "Lista principal",
      items: old.map(x => ({id:x.id || uid("item"), name:x.title || x.name || "", quantity:x.quantity || "", done:!!x.done}))
    }];
  }
  if (!Array.isArray(state.data.estudos)) state.data.estudos = [];
  state.data.estudos.forEach(x => {
    if (!x.subject) x.subject = x.title || "Matéria";
    if (!Array.isArray(x.references)) x.references = [];
    if (!("notes" in x)) x.notes = "";
  });
  if (!Array.isArray(state.data.treinos)) state.data.treinos = [];
  state.data.treinos.forEach(x => {
    if (!Array.isArray(x.exercises)) x.exercises = [];
    if (!("time" in x)) x.time = "";
    if (!("video" in x)) x.video = "";
  });
  if (!Array.isArray(state.data.hidratacao)) {
    const cups = Number(state.data.agua || 0);
    state.data.hidratacao = Array.from({length:cups}, (_,i)=>({
      id:uid("agua"), amount:250, date:today(), time:""
    }));
  }
  if (!Array.isArray(state.data.financas)) {
    state.data.financas = v3FinanceTransactions();
  }
}
v3Normalize();
persist();

function v3Home() {
  const name = String(state.user?.name || "Alice").split(" ")[0];
  const tasks = state.data.tarefas.filter(x=>!x.done).length;
  const commitments = state.data.compromissos.filter(x=>x.date===today()).length;
  const studies = state.data.estudos.filter(x=>!x.done).length;
  const shopping = state.data.comprasListas.reduce((n,l)=>n+(l.items||[]).filter(x=>!x.done).length,0);
  const events = state.data.compromissos.filter(x=>x.date===today()).sort((a,b)=>String(a.time||"").localeCompare(String(b.time||"")));
  const conflicts = v3AgendaConflicts();
  const fs = v3FinanceStatus();

  return layout(`
    <section class="v3-home-hero">
      <div class="v3-eyebrow">SEU COPILOTO PARA A VIDA</div>
      <h1>Olá,<br><span>${esc(name)}!</span> ☀️</h1>
      <p>Aqui está um resumo da sua rotina.<br>Vamos organizar o que importa?</p>
      <div class="stat-grid">
        ${stat(tasks,"Tarefas pendentes")}
        ${stat(commitments,"Compromissos hoje")}
        ${stat(studies,"Estudos pendentes")}
        ${stat(shopping,"Itens para comprar")}
      </div>
    </section>

    <section class="v3-my-day">
      <div class="v3-day-head">
        <h2>Meu dia</h2>
        <button class="secondary v3-talk" data-page="assistente">Falar com a LiDire</button>
      </div>
      ${events.length ? `<div class="v3-day-list">${events.map(x=>`
        <button class="v3-day-row" data-page="agenda">
          <time>${esc(x.time || "--:--")}</time>
          <span><b>${esc(x.title)}</b><small>${esc(x.location || x.note || "Compromisso")}</small></span>
        </button>`).join("")}</div>` :
        `<div class="v3-empty-day">Sua agenda está livre hoje. <button data-action="add-commitment">Adicionar compromisso</button></div>`}
    </section>

    ${conflicts.length ? `<div class="v3-alert warning"><b>⚠ Atenção à agenda</b><span>${esc(conflicts[0])}</span><button data-page="agenda">Ver agenda →</button></div>` : ""}
    ${fs.warning ? `<div class="v3-alert ${fs.level}"><b>💰 Atenção às finanças</b><span>${esc(fs.message)}</span><button data-page="financas">Ver finanças →</button></div>` : ""}
  `);
}

function v3AgendaConflicts() {
  const a=state.data.compromissos.filter(x=>x.date&&x.time), out=[];
  for(let i=0;i<a.length;i++) for(let j=i+1;j<a.length;j++) {
    if(a[i].date!==a[j].date) continue;
    const p=a[i].time.split(":").map(Number), q=a[j].time.split(":").map(Number);
    const d=Math.abs((p[0]*60+p[1])-(q[0]*60+q[1]));
    if(d===0) out.push(`"${a[i].title}" e "${a[j].title}" estão no mesmo horário (${a[i].time}).`);
    else if(d<=30) out.push(`"${a[i].title}" e "${a[j].title}" estão separados por apenas ${d} minutos.`);
  }
  return out;
}

function v3FinanceStatus() {
  const expenses=state.data.financas.filter(x=>x.type==="despesa");
  const total=expenses.reduce((s,x)=>s+num(x.value),0);
  const limit=num(state.settings?.financeLimit);
  if(!limit) return {warning:false,total,limit,pct:0};
  const pct=total/limit*100;
  if(pct>=100) return {warning:true,level:"danger",total,limit,pct,message:`Você atingiu ou ultrapassou o teto de ${money(limit)}.`};
  if(pct>=num(state.settings.financeWarning||80)) return {warning:true,level:"warning",total,limit,pct,message:`Você já utilizou ${Math.round(pct)}% do teto de ${money(limit)}.`};
  return {warning:false,total,limit,pct};
}

function v3AddCommitment(existing=null) {
  const x=existing||{title:"",date:today(),time:"",location:"",note:""};
  v3Modal(existing?"Editar compromisso":"Novo compromisso",
    `${v3Field("Título","title",x.title,"text","required")}${v3Field("Data","date",x.date,"date","required")}${v3Field("Horário","time",x.time,"time")}${v3Field("Local","location",x.location)}${v3Textarea("Observação","note",x.note)}`,
    existing?"Salvar":"Adicionar",
    fd=>{
      const val={title:fd.get("title"),date:fd.get("date"),time:fd.get("time"),location:fd.get("location"),note:fd.get("note")};
      if(existing) Object.assign(existing,val); else state.data.compromissos.push({id:uid("comp"),...val});
      persist();v3CloseModal();render();toast(existing?"Compromisso atualizado.":"Compromisso adicionado.");
    });
}

function v3AddShoppingList(existing=null) {
  const x=existing||{name:""};
  v3Modal(existing?"Editar lista":"Nova lista de compras",v3Field("Nome da lista","name",x.name,"text","required"),
    existing?"Salvar":"Criar",fd=>{
      if(existing)x.name=fd.get("name");
      else state.data.comprasListas.push({id:uid("lista"),name:fd.get("name"),items:[]});
      persist();v3CloseModal();render();toast(existing?"Lista atualizada.":"Lista criada.");
    });
}

function v3AddShoppingItem(listId) {
  const list=state.data.comprasListas.find(x=>x.id===listId); if(!list)return;
  v3Modal("Adicionar item",`${v3Field("Item","name","","text","required")}${v3Field("Quantidade","quantity")}`,"Adicionar",fd=>{
    list.items.push({id:uid("item"),name:fd.get("name"),quantity:fd.get("quantity"),done:false});
    persist();v3CloseModal();render();toast("Item adicionado.");
  });
}

function v3AddStudy(existing=null) {
  const x=existing||{subject:"",topic:"",date:today(),duration:"",notes:"",references:[]};
  v3Modal(existing?"Editar matéria":"Nova matéria",
    `${v3Field("Matéria","subject",x.subject,"text","required")}${v3Field("Tema / conteúdo","topic",x.topic)}${v3Field("Data","date",x.date,"date")}${v3Field("Duração (min)","duration",x.duration,"number",'min="0"')}${v3Textarea("Anotações","notes",x.notes)}${v3Textarea("Referências bibliográficas — um link por linha","references",(x.references||[]).join("\n"))}`,
    existing?"Salvar":"Cadastrar",fd=>{
      const refs=String(fd.get("references")||"").split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
      const val={subject:fd.get("subject"),title:fd.get("subject"),topic:fd.get("topic"),date:fd.get("date"),duration:fd.get("duration"),notes:fd.get("notes"),references:refs};
      if(existing)Object.assign(existing,val); else state.data.estudos.push({id:uid("study"),...val,done:false});
      persist();v3CloseModal();render();toast(existing?"Matéria atualizada.":"Matéria cadastrada.");
    });
}

function v3AddWorkout(existing=null) {
  const x=existing||{title:"",date:today(),time:"",video:"",notes:"",exercises:[]};
  const rows=(x.exercises||[]).map((e,i)=>v3ExerciseRow(i,e)).join("");
  v3Modal(existing?"Editar treino":"Novo treino",
    `${v3Field("Nome do treino","title",x.title,"text","required")}${v3Field("Data","date",x.date,"date")}${v3Field("Horário","time",x.time,"time")}${v3Field("Vídeo de execução — link","video",x.video,"url",'placeholder="https://..."')}${v3Textarea("Observações","notes",x.notes)}
    <div class="form-field full"><span>Exercícios</span><div id="v3ExerciseRows" class="v3-exercise-form">${rows||v3ExerciseRow(0,{})}</div><button type="button" class="secondary" data-action="v3-add-exercise-row">+ Adicionar exercício</button></div>`,
    existing?"Salvar":"Criar treino",fd=>{
      const exercises=[];
      const idx=[...fd.keys()].filter(k=>k.startsWith("v3_name_")).map(k=>k.split("_").pop());
      [...new Set(idx)].forEach(i=>{
        const name=String(fd.get(`v3_name_${i}`)||"").trim();
        if(name) exercises.push({name,planned:fd.get(`v3_planned_${i}`)||"",executed:fd.get(`v3_executed_${i}`)||""});
      });
      const val={title:fd.get("title"),date:fd.get("date"),time:fd.get("time"),video:fd.get("video"),notes:fd.get("notes"),exercises};
      if(existing)Object.assign(existing,val); else state.data.treinos.push({id:uid("workout"),...val});
      persist();v3CloseModal();render();toast(existing?"Treino atualizado.":"Treino criado.");
    });
}

function v3ExerciseRow(i,e={}) {
  return `<div class="v3-exercise-row"><input name="v3_name_${i}" value="${esc(e.name||"")}" placeholder="Exercício"><input name="v3_planned_${i}" value="${esc(e.planned||"")}" placeholder="Carga planejada"><input name="v3_executed_${i}" value="${esc(e.executed||"")}" placeholder="Carga executada"></div>`;
}

function v3AddWater() {
  v3Modal("Registrar água",v3Field("Quantidade (ml)","amount","300","number","min=\"1\" required"),"Registrar",fd=>{
    state.data.hidratacao.push({id:uid("agua"),amount:num(fd.get("amount")),date:today(),time:new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})});
    persist();v3CloseModal();render();toast("Água registrada.");
  });
}

function v3FinanceLimit() {
  v3Modal("Teto de gastos",`${v3Field("Teto mensal (R$)","limit",state.settings.financeLimit||"","number",'step="0.01" min="0"')}${v3Field("Avisar a partir de (%)","warning",state.settings.financeWarning||80,"number",'min="1" max="100"')}`,"Salvar",fd=>{
    state.settings.financeLimit=num(fd.get("limit"));state.settings.financeWarning=num(fd.get("warning"))||80;
    persist();v3CloseModal();render();toast("Teto de gastos atualizado.");
  });
}

function v3Modal(title,body,submit,onSubmit) {
  v3CloseModal();
  const b=document.createElement("div");b.className="modal-backdrop";
  b.innerHTML=`<div class="modal"><div class="modal-header"><div><span class="eyebrow">LIDIRE V3</span><h2>${esc(title)}</h2></div><button class="modal-close" data-action="v3-close-modal">×</button></div><form id="v3Form" class="form-grid">${body}<div class="modal-footer"><button type="button" class="secondary" data-action="v3-close-modal">Cancelar</button><button type="submit" class="primary">${esc(submit)}</button></div></form></div>`;
  document.body.appendChild(b);
  b.querySelector("form").addEventListener("submit",e=>{e.preventDefault();onSubmit(new FormData(e.currentTarget));});
  b.querySelector("input,textarea,select")?.focus();
}

function v3CloseModal(){document.querySelector(".modal-backdrop")?.remove();}

function v3Field(label,name,value="",type="text",attrs="") {
  return `<label class="form-field"><span>${esc(label)}</span><input name="${esc(name)}" type="${type}" value="${esc(value)}" ${attrs}></label>`;
}
function v3Textarea(label,name,value="") {
  return `<label class="form-field full"><span>${esc(label)}</span><textarea name="${esc(name)}">${esc(value)}</textarea></label>`;
}

function v3AgendaPage() {
  const items=[...state.data.compromissos].sort((a,b)=>`${a.date||""} ${a.time||""}`.localeCompare(`${b.date||""} ${b.time||""}`));
  const conflicts=v3AgendaConflicts();
  return layout(`<div class="page-header"><div><div class="eyebrow">MINHA ROTINA</div><h1>Agenda</h1><p class="muted">Compromissos, horários e alertas de proximidade.</p></div><button class="primary" data-action="add-commitment">+ Novo</button></div>
    ${conflicts.length?`<div class="conflict-box">${conflicts.map(x=>`<span>⚠ ${esc(x)}</span>`).join("")}</div>`:""}
    <div class="stack">${items.length?items.map(x=>`<div class="card item-row"><div class="date-box"><b>${x.date?x.date.slice(8,10):"--"}</b><small>${x.date?new Date(x.date+"T12:00:00").toLocaleDateString("pt-BR",{month:"short"}):""}</small></div><div class="item-main"><b>${esc(x.title)}</b><span>${x.time?esc(x.time):"Sem horário"}${x.location?" · "+esc(x.location):""}</span></div><div class="row-actions"><button class="icon-btn" data-action="edit-commitment" data-id="${x.id}">✎</button><button class="icon-btn" data-action="delete-commitment" data-id="${x.id}">🗑</button></div></div>`).join(""):emptyState("Você ainda não possui compromissos.","Adicionar compromisso","add-commitment")}</div>`);
}

function v3ShoppingPage() {
  return layout(`<div class="page-header"><div><div class="eyebrow">LISTAS</div><h1>Compras</h1><p class="muted">Crie listas e confirme cada item comprado.</p></div><button class="primary" data-action="v3-add-list">+ Nova lista</button></div>
    <div class="stack">${state.data.comprasListas.length?state.data.comprasListas.map(list=>{
      const done=list.items.filter(x=>x.done).length,p=list.items.length?Math.round(done/list.items.length*100):0;
      return `<section class="card"><div class="list-head"><div><h3>${esc(list.name)}</h3><small class="muted">${done}/${list.items.length} comprados</small></div><div class="row-actions"><button class="icon-btn" data-action="v3-edit-list" data-id="${list.id}">✎</button><button class="icon-btn" data-action="v3-delete-list" data-id="${list.id}">🗑</button></div></div><div class="progress"><span style="width:${p}%"></span></div><div class="v3-shopping-items">${list.items.length?list.items.map(i=>`<label class="shopping-item ${i.done?"checked":""}"><input type="checkbox" ${i.done?"checked":""} data-action="v3-toggle-item" data-list="${list.id}" data-id="${i.id}"><span>${esc(i.name)}${i.quantity?`<small>${esc(i.quantity)}</small>`:""}</span></label>`).join(""):`<p class="muted">Nenhum item.</p>`}</div><button class="text-btn" data-action="v3-add-item" data-id="${list.id}">+ Adicionar item</button></section>`;
    }).join(""):emptyState("Você ainda não criou uma lista.","Criar lista","v3-add-list")}</div>`);
}

function v3StudiesPage() {
  return layout(`<div class="page-header"><div><div class="eyebrow">APRENDIZADO</div><h1>Estudos</h1><p class="muted">Matérias, anotações e referências.</p></div><button class="primary" data-action="add-study">+ Matéria</button></div><div class="stack">${state.data.estudos.length?state.data.estudos.map(x=>`<article class="card"><div class="item-row"><button class="check-btn ${x.done?"done":""}" data-action="v3-toggle-study" data-id="${x.id}">${x.done?"✓":""}</button><div class="item-main"><b>${esc(x.subject||x.title)}</b><span>${x.topic?esc(x.topic)+" · ":""}${x.date?formatDate(x.date):"Sem data"}</span></div><div class="row-actions"><button class="icon-btn" data-action="edit-study" data-id="${x.id}">✎</button><button class="icon-btn" data-action="delete-study" data-id="${x.id}">🗑</button></div></div>${x.notes?`<div class="notes-box"><b>Anotações</b><p>${esc(x.notes)}</p></div>`:""}${x.references?.length?`<div class="references"><b>Referências</b>${x.references.map(u=>`<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">🔗 ${esc(u)}</a>`).join("")}</div>`:""}</article>`).join(""):emptyState("Nenhuma matéria cadastrada.","Adicionar matéria","add-study")}</div>`);
}

function v3WorkoutPage() {
  return layout(`<div class="page-header"><div><div class="eyebrow">BEM-ESTAR</div><h1>Treinos</h1><p class="muted">Exercícios, cargas e execução.</p></div><button class="primary" data-action="add-workout">+ Treino</button></div><div class="stack">${state.data.treinos.length?state.data.treinos.map(x=>`<article class="card"><div class="item-row"><div class="workout-icon">🏋️</div><div class="item-main"><b>${esc(x.title)}</b><span>${x.date?formatDate(x.date):""}${x.time?" · "+esc(x.time):""}</span></div><div class="row-actions"><button class="icon-btn" data-action="edit-workout" data-id="${x.id}">✎</button><button class="icon-btn" data-action="delete-workout" data-id="${x.id}">🗑</button></div></div>${x.exercises?.length?`<div class="exercise-table"><div class="exercise-row header"><span>Exercício</span><span>Planejada</span><span>Executada</span></div>${x.exercises.map(e=>`<div class="exercise-row"><span>${esc(e.name)}</span><span>${esc(e.planned||"-")}</span><span>${esc(e.executed||"-")}</span></div>`).join("")}</div>`:""}${x.video?`<a class="video-link" href="${esc(x.video)}" target="_blank" rel="noopener noreferrer">▶ Ver vídeo de execução</a>`:""}${x.notes?`<p class="muted">${esc(x.notes)}</p>`:""}</article>`).join(""):emptyState("Nenhum treino registrado.","Adicionar treino","add-workout")}</div>`);
}

function v3HydrationPage() {
  const total=state.data.hidratacao.filter(x=>x.date===today()).reduce((s,x)=>s+num(x.amount),0),goal=2000,p=Math.min(100,Math.round(total/goal*100));
  return layout(`<div class="page-header"><div><div class="eyebrow">BEM-ESTAR</div><h1>Hidratação</h1><p class="muted">Meta, registros e lembretes.</p></div><button class="primary" data-action="add-water">+ Registrar</button></div>
    <section class="card hydration-v3"><div class="row"><div><span class="eyebrow">HOJE</span><h2>${total} ml</h2><p class="muted">${p}% da meta de ${goal} ml</p></div><div class="water-icon">💧</div></div><div class="progress"><span style="width:${p}%"></span></div><div class="water-buttons">${[200,300,500].map(v=>`<button class="secondary" data-action="quick-water" data-value="${v}">+${v} ml</button>`).join("")}</div></section>
    <section class="card"><div class="row"><div><h3>Lembrete de hidratação</h3><p class="muted">Enquanto a LiDire estiver aberta.</p></div><label class="switch"><input type="checkbox" data-action="v3-hydration-toggle" ${state.settings.hydrationReminder?"checked":""}><span></span></label></div><label class="interval-label">Repetir a cada<select data-action="v3-hydration-interval"><option value="30" ${state.settings.hydrationInterval==30?"selected":""}>30 minutos</option><option value="60" ${state.settings.hydrationInterval==60?"selected":""}>1 hora</option><option value="90" ${state.settings.hydrationInterval==90?"selected":""}>1h30</option><option value="120" ${state.settings.hydrationInterval==120?"selected":""}>2 horas</option></select></label></section>
  `);
}

function v3FinancePage() {
  const data=state.data.financas, income=data.filter(x=>x.type==="receita").reduce((s,x)=>s+num(x.value),0),expense=data.filter(x=>x.type==="despesa").reduce((s,x)=>s+num(x.value),0),balance=income-expense,status=v3FinanceStatus(),cats={};
  data.filter(x=>x.type==="despesa").forEach(x=>cats[x.category||"Outros"]=(cats[x.category||"Outros"]||0)+num(x.value));
  const rows=Object.entries(cats).sort((a,b)=>b[1]-a[1]),max=Math.max(1,...rows.map(x=>x[1]));
  return layout(`<div class="page-header"><div><div class="eyebrow">ORGANIZAÇÃO FINANCEIRA</div><h1>Finanças</h1><p class="muted">Gastos por categoria e teto de gastos.</p></div><div class="header-actions"><button class="primary" data-action="add-income">+ Receita</button><button class="secondary" data-action="add-expense">+ Despesa</button></div></div>
    <div class="stat-grid mini">${stat(money(income),"Receitas")}${stat(money(expense),"Despesas")}${stat(money(balance),"Saldo")}</div>
    <section class="card"><div class="section-title"><div><span class="eyebrow">CONTROLE</span><h3>Teto de gastos</h3></div><button class="text-btn" data-action="v3-finance-limit">Configurar</button></div>${status.limit?`<strong class="limit-number">${money(status.total)}</strong><span class="muted"> de ${money(status.limit)}</span><div class="progress ${status.pct>=100?"danger-progress":""}"><span style="width:${Math.min(100,status.pct)}%"></span></div><div class="limit-foot"><span>${Math.round(status.pct)}% utilizado</span><span>aviso em ${state.settings.financeWarning}%</span></div>${status.warning?`<div class="inline-alert ${status.level}">⚠ ${esc(status.message)}</div>`:""}`:`<div class="empty-inline">Defina um teto mensal para receber alertas. <button data-action="v3-finance-limit">Configurar teto</button></div>`}</section>
    <section class="card"><div class="section-title"><div><span class="eyebrow">VISÃO DOS GASTOS</span><h3>Gastos por categoria</h3></div></div>${rows.length?`<div class="bars">${rows.map(([c,v])=>`<div class="bar-row"><div><span>${esc(c)}</span><b>${money(v)}</b></div><div class="bar"><span style="width:${Math.round(v/max*100)}%"></span></div></div>`).join("")}</div>`:`<p class="muted">Cadastre despesas com categorias para visualizar o gráfico.</p>`}</section>
    <section class="card"><div class="section-title"><h3>Movimentações</h3></div><div class="stack">${data.length?data.slice().reverse().map(x=>`<div class="item-row"><div class="finance-icon ${x.type}">${x.type==="receita"?"↗":"↘"}</div><div class="item-main"><b>${esc(x.title)}</b><span>${formatDate(x.date)} · ${esc(x.category||"Outros")}</span></div><strong class="${x.type}">${x.type==="receita"?"+":"-"} ${money(x.value)}</strong><button class="icon-btn" data-action="delete-finance" data-id="${x.id}">🗑</button></div>`).join(""):emptyState("Nenhuma movimentação registrada.","Adicionar despesa","add-expense")}</div></section>
  `);
}

const v3OriginalRender = render;
render = function() {
  v3Normalize();
  const pages={inicio:v3Home,agenda:v3AgendaPage,assistente:renderAssistant,explorar:explore,perfil:profile,tarefas:tasksPage,compras:v3ShoppingPage,estudos:v3StudiesPage,treinos:v3WorkoutPage,hidratacao:v3HydrationPage,financas:v3FinancePage,objetivos:goalsPage,familia:familyPage};
  const app=document.getElementById("app");
  if(app) app.innerHTML=pages[state.page]?pages[state.page]():v3Home();
};

const v3OldActionHandler = handleAction;
handleAction = function(action,el) {
  const id=el?.dataset?.id;
  if(action==="v3-close-modal"){v3CloseModal();return;}
  if(action==="add-commitment"){v3AddCommitment();return;}
  if(action==="edit-commitment"){const x=state.data.compromissos.find(v=>v.id===id);if(x)v3AddCommitment(x);return;}
  if(action==="delete-commitment"){if(confirm("Excluir este compromisso?")){state.data.compromissos=state.data.compromissos.filter(x=>x.id!==id);persist();render();toast("Compromisso excluído.");}return;}
  if(action==="v3-add-list"){v3AddShoppingList();return;}
  if(action==="v3-edit-list"){const x=state.data.comprasListas.find(v=>v.id===id);if(x)v3AddShoppingList(x);return;}
  if(action==="v3-delete-list"){if(confirm("Excluir esta lista e seus itens?")){state.data.comprasListas=state.data.comprasListas.filter(x=>x.id!==id);persist();render();toast("Lista excluída.");}return;}
  if(action==="v3-add-item"){v3AddShoppingItem(id);return;}
  if(action==="v3-toggle-item"){const l=state.data.comprasListas.find(x=>x.id===el.dataset.list),i=l?.items.find(x=>x.id===id);if(i){i.done=el.checked;persist();render();}return;}
  if(action==="add-study"){v3AddStudy();return;}
  if(action==="edit-study"){const x=state.data.estudos.find(v=>v.id===id);if(x)v3AddStudy(x);return;}
  if(action==="v3-toggle-study"){const x=state.data.estudos.find(v=>v.id===id);if(x){x.done=!x.done;persist();render();}return;}
  if(action==="delete-study"){if(confirm("Excluir esta matéria?")){state.data.estudos=state.data.estudos.filter(x=>x.id!==id);persist();render();toast("Matéria excluída.");}return;}
  if(action==="add-workout"){v3AddWorkout();return;}
  if(action==="edit-workout"){const x=state.data.treinos.find(v=>v.id===id);if(x)v3AddWorkout(x);return;}
  if(action==="delete-workout"){if(confirm("Excluir este treino?")){state.data.treinos=state.data.treinos.filter(x=>x.id!==id);persist();render();toast("Treino excluído.");}return;}
  if(action==="v3-add-exercise-row"){const box=document.getElementById("v3ExerciseRows");if(box){const i=box.querySelectorAll(".v3-exercise-row").length;box.insertAdjacentHTML("beforeend",v3ExerciseRow(i,{}));}return;}
  if(action==="add-water"){v3AddWater();return;}
  if(action==="quick-water"){state.data.hidratacao.push({id:uid("agua"),amount:num(el.dataset.value),date:today(),time:new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})});persist();render();toast(`+${el.dataset.value} ml registrados.`);return;}
  if(action==="delete-water"){state.data.hidratacao=state.data.hidratacao.filter(x=>x.id!==id);persist();render();return;}
  if(action==="reset-water"){state.data.hidratacao=state.data.hidratacao.filter(x=>x.date!==today());persist();render();toast("Registros de hoje limpos.");return;}
  if(action==="v3-hydration-toggle"){if(el.checked){state.settings.hydrationReminder=true;persist();v3StartReminder();render();toast("Lembrete de hidratação ativado.");}else{state.settings.hydrationReminder=false;persist();v3StartReminder();render();toast("Lembrete desativado.");}return;}
  if(action==="v3-hydration-interval"){return;}
  if(action==="add-income"){v3AddFinance("receita");return;}
  if(action==="add-expense"){v3AddFinance("despesa");return;}
  if(action==="v3-finance-limit"){v3FinanceLimit();return;}
  if(action==="delete-finance"){if(confirm("Excluir esta movimentação?")){state.data.financas=state.data.financas.filter(x=>x.id!==id);state.data.fin.receitas=state.data.financas.filter(x=>x.type==="receita");state.data.fin.despesas=state.data.financas.filter(x=>x.type==="despesa");persist();render();toast("Movimentação removida.");}return;}
  return v3OldActionHandler(action,el);
};

function v3AddFinance(type) {
  v3Modal(type==="receita"?"Nova receita":"Nova despesa",`${v3Field("Descrição","title","","text","required")}${v3Field("Valor","value","","number",'step="0.01" min="0.01" required')}${v3Field("Categoria","category",type==="despesa"?"Alimentação":"Renda")}${v3Field("Data","date",today(),"date","required")}`,"Salvar",fd=>{
    const x={id:uid(type),type,title:fd.get("title"),value:num(fd.get("value")),category:fd.get("category")||"Outros",date:fd.get("date")};
    state.data.financas.push(x);
    if(!state.data.fin)state.data.fin={receitas:[],despesas:[]};
    state.data.fin[type==="receita"?"receitas":"despesas"].push(x);
    persist();v3CloseModal();render();toast(type==="receita"?"Receita adicionada.":"Despesa adicionada.");
  });
}

let v3ReminderTimer=null;
function v3StartReminder(){
  clearInterval(v3ReminderTimer);
  if(!state.settings.hydrationReminder)return;
  const ms=Math.max(15,num(state.settings.hydrationInterval)||60)*60000;
  v3ReminderTimer=setInterval(()=>{
    toast("💧 Hora de beber água!","reminder");
    if("Notification" in window && Notification.permission==="granted") new Notification("LiDire — Hidratação",{body:"Hora de beber água!"});
  },ms);
}
document.addEventListener("change",async e=>{
  if(e.target.dataset.action==="v3-hydration-interval"){state.settings.hydrationInterval=num(e.target.value)||60;persist();v3StartReminder();toast("Intervalo atualizado.");}
  if(e.target.dataset.action==="v3-hydration-toggle" && e.target.checked && "Notification" in window && Notification.permission==="default"){try{await Notification.requestPermission();}catch{}}
});
v3StartReminder();
window.LiDireV3={version:LIDIRE_V3,render,persist};
render();
