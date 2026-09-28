const STORAGE_KEY = "lidire-mvp-data";

const defaultState = {
  user: {
    name: "Alice",
    email: "conta@lidire.com",
    age: "",
    phone: "",
    photo: ""
  },

  data: {
    compromissos: [],
    tarefas: [],
    compras: [],
    estudos: [],
    treinos: [],
    hidratacao: [],
    alimentacao: [],
    financas: [],
    objetivos: [],
    familia: []
  },

  settings: {
    hydrationGoal: 2000,
    hydrationInterval: 2,
    hydrationPeriodAmount: 250,
    calorieGoal: 2000,
    financeLimits: {}
  }
};

let state = loadState();
let currentPage = "inicio";
let currentShoppingList = null;
let modal = null;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!saved) {
      return clone(defaultState);
    }

    return {
      ...clone(defaultState),
      ...saved,

      user: {
        ...defaultState.user,
        ...(saved.user || {})
      },

      data: {
        ...defaultState.data,
        ...(saved.data || {})
      },

      settings: {
        ...defaultState.settings,
        ...(saved.settings || {})
      }
    };
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    return clone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function uid(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function esc(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function money(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function dateBR(value) {
  if (!value) return "";

  const [y, m, d] = String(value).split("-");

  return y && m && d ? `${d}/${m}/${y}` : value;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function nowTime() {
  return new Date().toTimeString().slice(0, 5);
}

function toast(message, type = "success") {
  document.querySelectorAll(".lidire-toast").forEach((el) => el.remove());

  const el = document.createElement("div");

  el.className = `lidire-toast ${type}`;

  el.innerHTML = `
    <span>${type === "success" ? "✓" : "!"}</span>
    ${esc(message)}
  `;

  document.body.appendChild(el);

  setTimeout(() => el.remove(), 2600);
}

function icon(name) {
  const icons = {
    home: "⌂",
    calendar: "▣",
    check: "✓",
    cart: "🛒",
    book: "▤",
    dumbbell: "♢",
    drop: "◉",
    wallet: "R$",
    target: "◎",
    family: "♧",
    food: "🍽",
    spark: "✦",
    user: "◯",
    plus: "+",
    arrow: "→",
    trash: "⌫",
    edit: "✎",
    clock: "◷",
    search: "⌕",
    back: "‹",
    link: "🔗",
    note: "📝",
    fire: "🔥"
  };

  return icons[name] || "•";
}

/* =========================================================
   ESTILO EXTRA INSERIDO PELO PRÓPRIO JS
   ========================================================= */

function injectLiDireStyles() {
  if (document.getElementById("lidire-extra-styles")) return;

  const style = document.createElement("style");
  style.id = "lidire-extra-styles";

  style.textContent = `
    .task-priority {
      width: 7px;
      min-width: 7px;
      height: 46px;
      border-radius: 8px;
      margin-right: 10px;
    }

    .priority-baixa {
      background: #22c55e;
    }

    .priority-normal {
      background: #3b82f6;
    }

    .priority-média {
      background: #facc15;
    }

    .priority-alta {
      background: #ef4444;
    }

    .task-content {
      display: flex;
      align-items: center;
      width: 100%;
    }

    .finance-chart {
      padding: 20px;
      margin-bottom: 20px;
    }

    .chart-row {
      margin-bottom: 15px;
    }

    .chart-label {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      font-size: 13px;
    }

    .chart-bar {
      height: 12px;
      border-radius: 20px;
      background: rgba(255,255,255,.08);
      overflow: hidden;
    }

    .chart-bar span {
      display: block;
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg,#8b5cf6,#ec4899);
    }

    .limit-warning {
      font-size: 12px;
      margin-top: 5px;
    }

    .limit-ok {
      color: #22c55e;
    }

    .limit-danger {
      color: #ef4444;
    }

    .notes-box {
      min-height: 150px;
    }

    .exercise-animation {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 130px;
      font-size: 70px;
      animation: lidireExercise 1.4s ease-in-out infinite;
    }

    @keyframes lidireExercise {
      0%,100% {
        transform: translateY(0) rotate(0deg);
      }

      50% {
        transform: translateY(-12px) rotate(4deg);
      }
    }

    .exercise-card {
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 16px;
      padding: 15px;
      margin-bottom: 12px;
    }

    .exercise-grid {
      display: grid;
      grid-template-columns: repeat(2,1fr);
      gap: 10px;
      margin-top: 10px;
    }

    .diet-food-row {
      display: grid;
      grid-template-columns: 1fr 90px 40px;
      gap: 8px;
      align-items: center;
      margin-bottom: 8px;
    }

    .calorie-summary {
      padding: 18px;
      border-radius: 18px;
      margin-bottom: 18px;
      background: rgba(139,92,246,.12);
    }

    .calorie-summary strong {
      font-size: 30px;
    }

    .calorie-progress {
      height: 10px;
      border-radius: 20px;
      overflow: hidden;
      background: rgba(255,255,255,.1);
      margin-top: 12px;
    }

    .calorie-progress span {
      display: block;
      height: 100%;
      background: linear-gradient(90deg,#22c55e,#facc15,#ef4444);
    }

    .goal-subtasks {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(255,255,255,.08);
    }

    .goal-subtask {
      display: flex;
      gap: 10px;
      align-items: center;
      margin: 8px 0;
    }

    .period-badge {
      font-size: 11px;
      padding: 4px 8px;
      border-radius: 10px;
      background: rgba(139,92,246,.15);
    }

    .photo-preview {
      display: flex;
      justify-content: center;
      margin-bottom: 15px;
    }

    .profile-photo-preview {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid rgba(139,92,246,.5);
    }

    .profile-photo-placeholder {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 36px;
      background: rgba(139,92,246,.18);
    }

    .link-button {
      color: #8b5cf6;
      text-decoration: none;
    }

    .shopping-diet-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin: 15px 0;
    }

    .muted {
      opacity: .7;
    }
  `;

  document.head.appendChild(style);
}

injectLiDireStyles();

/* =========================================================
   MÓDULOS
   ========================================================= */

const modules = [
  ["agenda", "Agenda", "Compromissos e horários", "calendar", "agenda"],
  ["tarefas", "Tarefas", "Tudo o que precisa ser feito", "check", "tarefas"],
  ["compras", "Compras", "Listas para não esquecer", "cart", "compras"],
  ["estudos", "Estudos", "Organize seu aprendizado", "book", "estudos"],
  ["treinos", "Treinos", "Movimente-se e acompanhe", "dumbbell", "treinos"],
  ["hidratacao", "Hidratação", "Cuide da sua rotina", "drop", "hidratacao"],
  ["alimentacao", "Alimentação", "Refeições, dieta e calorias", "food", "alimentacao"],
  ["financas", "Finanças", "Entradas, gastos e limites", "wallet", "finanças"],
  ["objetivos", "Objetivos", "Transforme planos em passos", "target", "objetivos"],
  ["familia", "Família", "Compartilhe sua rotina", "family", "família"]
];

/* =========================================================
   SHELL
   ========================================================= */

function appShell(content) {
  const nav = [
    ["inicio", "⌂", "Início"],
    ["agenda", "▣", "Agenda"],
    ["tarefas", "✓", "Tarefas"],
    ["explorar", "✦", "Explorar"],
    ["perfil", "◯", "Perfil"]
  ];

  return `
    <div class="app-bg">

      <header class="topbar">

        <button class="brand" data-page="inicio">
          <img src="/logo-lidire-oficial.png" alt="LiDire">
          <span>LiDire</span>
        </button>

        <div class="topbar-actions">
          <button
            class="icon-button"
            data-action="quick-add"
            title="Adicionar"
          >
            ${icon("plus")}
          </button>

          <button class="avatar" data-page="perfil">
            ${
              state.user.photo
                ? `<img src="${esc(state.user.photo)}" alt="Perfil">`
                : esc((state.user.name || "A").charAt(0).toUpperCase())
            }
          </button>
        </div>

      </header>

      <main class="main-content">
        ${content}
      </main>

      <nav class="bottom-nav">
        ${nav.map(([id, ico, label]) => `
          <button
            class="nav-item ${currentPage === id ? "active" : ""}"
            data-page="${id}"
          >
            <span>${ico}</span>
            <small>${label}</small>
          </button>
        `).join("")}
      </nav>

    </div>
  `;
}

function pageHeader(eyebrow, title, subtitle = "", action = "") {
  return `
    <div class="page-header">

      <div>
        <div class="eyebrow">${esc(eyebrow)}</div>
        <h1>${esc(title)}</h1>

        ${
          subtitle
            ? `<p>${esc(subtitle)}</p>`
            : ""
        }
      </div>

      ${action}

    </div>
  `;
}

function statCard(value, label, tone = "") {
  return `
    <div class="stat-card ${tone}">
      <strong>${esc(value)}</strong>
      <span>${esc(label)}</span>
    </div>
  `;
}

function emptyState(title, text, actionLabel, action) {
  return `
    <div class="empty-state">
      <div class="empty-orb">✦</div>

      <h3>${esc(title)}</h3>

      <p>${esc(text)}</p>

      <button
        class="primary-button"
        data-action="${esc(action)}"
      >
        ${icon("plus")} ${esc(actionLabel)}
      </button>
    </div>
  `;
}

/* =========================================================
   INÍCIO
   ========================================================= */

function home() {
  const pending = state.data.tarefas.filter((x) => !x.done).length;

  const commitments = state.data.compromissos.filter(
    (x) => x.date === todayISO()
  ).length;

  const goals = state.data.objetivos.length;

  const firstName =
    (state.user.name || "você").split(" ")[0];

  return appShell(`

    <section class="hero-card">

      <div class="hero-copy">

        <span class="pill">
          <span class="pulse-dot"></span>
          Seu copiloto para a vida
        </span>

        <h1>
          Olá, ${esc(firstName)}.<br>
          <span>Vamos organizar seu dia?</span>
        </h1>

        <p>
          A LiDire reúne sua rotina em um só lugar
          para você saber o que importa agora.
        </p>

        <div class="hero-actions">

          <button
            class="primary-button"
            data-action="quick-add"
          >
            ${icon("plus")} Adicionar
          </button>

          <button
            class="ghost-button"
            data-page="explorar"
          >
            Explorar LiDire ${icon("arrow")}
          </button>

        </div>

      </div>

      <div class="hero-orbit">

        <div class="orbit-center">
          <img
            src="/logo-lidire-oficial.png"
            alt="LiDire"
          >
        </div>

        <span>Agenda</span>
        <span>Tarefas</span>
        <span>Metas</span>
        <span>Você</span>

      </div>

    </section>

    <section class="section">

      <div class="section-title">
        <div>
          <span class="eyebrow">RESUMO</span>
          <h2>Seu dia em números</h2>
        </div>
      </div>

      <div class="stats-grid">

        ${statCard(
          commitments,
          "Hoje na agenda",
          "purple"
        )}

        ${statCard(
          pending,
          "Tarefas pendentes",
          "cyan"
        )}

        ${statCard(
          goals,
          "Objetivos ativos",
          "pink"
        )}

      </div>

    </section>

    <section class="section">

      <div class="section-title">

        <div>
          <span class="eyebrow">CENTRAL</span>
          <h2>O que você quer organizar?</h2>
        </div>

        <button
          class="text-button"
          data-page="explorar"
        >
          Ver tudo ${icon("arrow")}
        </button>

      </div>

      <div class="module-grid">
        ${modules.slice(0, 6).map(moduleCard).join("")}
      </div>

    </section>

    <section class="assistant-banner">

      <div class="assistant-symbol">✦</div>

      <div>

        <span class="eyebrow">ASSISTENTE LIDIRE</span>

        <h3>
          Precisa de ajuda para decidir
          o próximo passo?
        </h3>

        <p>
          Converse com sua rotina e encontre
          o que precisa fazer agora.
        </p>

      </div>

      <button
        class="primary-button"
        data-page="assistente"
      >
        Conversar ${icon("arrow")}
      </button>

    </section>

  `);
}

function moduleCard([id, title, desc, ico, page]) {
  const count = countFor(id);

  return `
    <button
      class="module-card"
      data-page="${page}"
    >

      <span class="module-icon">
        ${icon(ico)}
      </span>

      <span class="module-content">

        <strong>${esc(title)}</strong>

        <small>${esc(desc)}</small>

      </span>

      <span class="module-count">
        ${count}
      </span>

      <span class="module-arrow">
        ${icon("arrow")}
      </span>

    </button>
  `;
}

function countFor(id) {
  if (id === "tarefas") {
    return state.data.tarefas.filter(
      (x) => !x.done
    ).length;
  }

  if (id === "agenda") {
    return state.data.compromissos.length;
  }

  if (id === "compras") {
    return state.data.compras.reduce(
      (total, lista) =>
        total +
        (lista.items || []).filter(
          (item) => !item.done
        ).length,
      0
    );
  }

  return state.data[id]?.length || 0;
}

/* =========================================================
   LISTA GENÉRICA
   ========================================================= */

function listPage(config) {
  const items = state.data[config.key] || [];

  return appShell(`

    ${pageHeader(
      config.eyebrow || "ORGANIZAÇÃO",
      config.title,
      config.subtitle,
      `
        <button
          class="primary-button compact"
          data-action="add-${config.key}"
        >
          ${icon("plus")} Adicionar
        </button>
      `
    )}

    ${
      config.stats
        ? `
          <div class="stats-grid mini">
            ${config.stats()}
          </div>
        `
        : ""
    }

    <div class="content-card">

      <div class="card-toolbar">

        <div class="toolbar-title">
          ${items.length}
          ${items.length === 1 ? "item" : "itens"}
        </div>

        <div class="toolbar-filter">
          ${config.filter || ""}
        </div>

      </div>

      ${
        items.length
          ? `
            <div class="item-list">
              ${items.map(config.render).join("")}
            </div>
          `
          : emptyState(
              config.emptyTitle || "Nada por aqui ainda",
              config.emptyText ||
                "Adicione seu primeiro item para começar.",
              "Adicionar",
              `add-${config.key}`
            )
      }

    </div>

  `);
}

/* =========================================================
   AGENDA
   ========================================================= */

function agenda() {
  const items = [...state.data.compromissos].sort(
    (a, b) => {
      const da = `${a.date || ""} ${a.time || ""}`;
      const db = `${b.date || ""} ${b.time || ""}`;
      return da.localeCompare(db);
    }
  );

  return listPage({
    key: "compromissos",

    title: "Agenda",

    subtitle:
      "Seus compromissos organizados em um só lugar.",

    eyebrow: "SUA ROTINA",

    emptyTitle: "Sua agenda está livre",

    emptyText:
      "Cadastre compromissos, consultas, reuniões e outros horários.",

    render: (x) => `
      <div class="list-item">

        <div class="date-badge">
          <strong>
            ${x.date ? x.date.slice(8, 10) : "--"}
          </strong>

          <small>
            ${
              x.date
                ? new Date(
                    `${x.date}T12:00:00`
                  )
                    .toLocaleDateString(
                      "pt-BR",
                      { month: "short" }
                    )
                    .replace(".", "")
                : ""
            }
          </small>
        </div>

        <div class="item-main">

          <strong>${esc(x.title)}</strong>

          <span>
            ${x.time ? `◷ ${esc(x.time)}` : "Sem horário"}

            ${
              x.location
                ? ` · ${esc(x.location)}`
                : ""
            }
          </span>

        </div>

        <div class="item-actions">

          <button
            data-action="edit-compromisso"
            data-id="${x.id}"
          >
            ${icon("edit")}
          </button>

          <button
            data-action="delete-compromisso"
            data-id="${x.id}"
          >
            ${icon("trash")}
          </button>

        </div>

      </div>
    `
  });
}

/* =========================================================
   TAREFAS
   ========================================================= */

const priorityOrder = {
  Alta: 1,
  "Média": 2,
  Normal: 3,
  Baixa: 4
};

function sortTasks(tasks) {
  return [...tasks].sort((a, b) => {

    if (a.done !== b.done) {
      return a.done ? 1 : -1;
    }

    const pa =
      priorityOrder[a.priority || "Normal"] || 3;

    const pb =
      priorityOrder[b.priority || "Normal"] || 3;

    if (pa !== pb) {
      return pa - pb;
    }

    const da = `${a.date || "9999-12-31"} ${a.time || "23:59"}`;
    const db = `${b.date || "9999-12-31"} ${b.time || "23:59"}`;

    return da.localeCompare(db);
  });
}

function priorityClass(priority) {
  const map = {
    Baixa: "priority-baixa",
    Normal: "priority-normal",
    "Média": "priority-média",
    Alta: "priority-alta"
  };

  return map[priority || "Normal"];
}

function tarefas() {
  const sorted = sortTasks(state.data.tarefas);

  return appShell(`

    ${pageHeader(
      "FAZER",
      "Tarefas",
      "Tire as coisas da cabeça e coloque em movimento.",
      `
        <button
          class="primary-button compact"
          data-action="add-tarefas"
        >
          ${icon("plus")} Adicionar
        </button>
      `
    )}

    <div class="stats-grid mini">

      ${statCard(
        state.data.tarefas.filter(x => x.done).length,
        "Concluídas",
        "cyan"
      )}

      ${statCard(
        state.data.tarefas.filter(x => !x.done).length,
        "Pendentes",
        "purple"
      )}

      ${statCard(
        state.data.tarefas.length
          ? Math.round(
              state.data.tarefas.filter(x => x.done).length /
              state.data.tarefas.length *
              100
            ) + "%"
          : "0%",
        "Progresso",
        "pink"
      )}

    </div>

    <div class="content-card">

      <div class="card-toolbar">
        <div class="toolbar-title">
          Ordenadas por prioridade, data e horário
        </div>
      </div>

      ${
        sorted.length
          ? `
            <div class="item-list">

              ${sorted.map((x) => `

                <div
                  class="list-item ${x.done ? "completed" : ""}"
                >

                  <div
                    class="task-priority ${priorityClass(
                      x.priority
                    )}"
                  ></div>

                  <button
                    class="check-button ${x.done ? "checked" : ""}"
                    data-action="toggle-tarefa"
                    data-id="${x.id}"
                  >
                    ${x.done ? "✓" : ""}
                  </button>

                  <div class="item-main">

                    <strong>
                      ${esc(x.title)}
                    </strong>

                    <span>

                      ${
                        x.priority
                          ? `Prioridade: ${esc(x.priority)}`
                          : "Prioridade: Normal"
                      }

                      ${
                        x.date
                          ? ` · ${dateBR(x.date)}`
                          : ""
                      }

                      ${
                        x.time
                          ? ` · ◷ ${esc(x.time)}`
                          : ""
                      }

                    </span>

                  </div>

                  <div class="item-actions">

                    <button
                      data-action="edit-tarefa"
                      data-id="${x.id}"
                    >
                      ${icon("edit")}
                    </button>

                    <button
                      data-action="delete-tarefa"
                      data-id="${x.id}"
                    >
                      ${icon("trash")}
                    </button>

                  </div>

                </div>

              `).join("")}

            </div>
          `
          : emptyState(
              "Nenhuma tarefa criada",
              "Crie uma tarefa para começar a organizar seu dia.",
              "Adicionar tarefa",
              "add-tarefas"
            )
      }

    </div>

  `);
}

/* =========================================================
   COMPRAS
   ========================================================= */

function compras() {
  const listas = state.data.compras || [];

  return appShell(`

    ${pageHeader(
      "LISTAS",
      "Compras",
      "Organize suas compras em listas diferentes.",
      `
        <button
          class="primary-button compact"
          data-action="add-compras"
        >
          ${icon("plus")} Nova lista
        </button>
      `
    )}

    <div class="shopping-lists">

      ${
        listas.length
          ? listas.map(lista => {

              const total =
                lista.items?.length || 0;

              const done =
                lista.items?.filter(
                  item => item.done
                ).length || 0;

              return `
                <div class="shopping-list-card">

                  <button
                    class="shopping-list-main"
                    data-action="open-lista-compras"
                    data-id="${lista.id}"
                  >

                    <div class="shopping-list-icon">
                      🛒
                    </div>

                    <div class="shopping-list-info">

                      <strong>
                        ${esc(lista.name)}
                      </strong>

                      <span>
                        ${total}
                        ${total === 1 ? "item" : "itens"}
                        ·
                        ${done}
                        concluído${done === 1 ? "" : "s"}
                      </span>

                    </div>

                    <span class="module-arrow">
                      ${icon("arrow")}
                    </span>

                  </button>

                  <button
                    class="shopping-list-delete"
                    data-action="delete-lista-compras"
                    data-id="${lista.id}"
                  >
                    ${icon("trash")}
                  </button>

                </div>
              `;
            }).join("")
          : `
            <div class="content-card">

              ${emptyState(
                "Nenhuma lista criada",
                "Crie sua primeira lista de compras para começar.",
                "Criar lista",
                "add-compras"
              )}

            </div>
          `
      }

    </div>

  `);
}

function listaCompras(id) {
  const lista =
    state.data.compras.find(
      x => x.id === id
    );

  if (!lista) {
    currentPage = "compras";
    currentShoppingList = null;
    render();
    return "";
  }

  const items = lista.items || [];

  const done =
    items.filter(x => x.done).length;

  return appShell(`

    <div class="shopping-back">

      <button
        class="text-button"
        data-action="back-compras"
      >
        ${icon("back")} Voltar para compras
      </button>

    </div>

    ${pageHeader(
      "LISTA DE COMPRAS",
      lista.name,
      `${items.length} ${
        items.length === 1 ? "item" : "itens"
      } · ${done} concluído${done === 1 ? "" : "s"}`,
      `
        <button
          class="primary-button compact"
          data-action="add-item-compra"
          data-id="${lista.id}"
        >
          ${icon("plus")} Adicionar item
        </button>
      `
    )}

    <div class="shopping-diet-actions">

      <button
        class="ghost-button"
        data-action="lista-dieta-para-compras"
        data-id="${lista.id}"
      >
        🍽 Importar alimentos da dieta
      </button>

    </div>

    <div class="content-card">

      <div class="card-toolbar">

        <div class="toolbar-title">
          ${done}/${items.length} concluídos
        </div>

      </div>

      ${
        items.length
          ? `
            <div class="item-list">

              ${items.map(item => `

                <div
                  class="list-item ${
                    item.done ? "completed" : ""
                  }"
                >

                  <button
                    class="check-button ${
                      item.done ? "checked" : ""
                    }"
                    data-action="toggle-item-compra"
                    data-list-id="${lista.id}"
                    data-id="${item.id}"
                  >
                    ${item.done ? "✓" : ""}
                  </button>

                  <div class="item-main">

                    <strong>
                      ${esc(item.name)}
                    </strong>

                    <span>

                      ${
                        item.quantity
                          ? esc(item.quantity)
                          : ""
                      }

                      ${
                        item.category
                          ? ` · ${esc(item.category)}`
                          : ""
                      }

                    </span>

                  </div>

                  <div class="item-actions">

                    <button
                      data-action="delete-item-compra"
                      data-list-id="${lista.id}"
                      data-id="${item.id}"
                    >
                      ${icon("trash")}
                    </button>

                  </div>

                </div>

              `).join("")}

            </div>
          `
          : `
            <div class="empty-state">

              <div class="empty-orb">
                🛒
              </div>

              <h3>Lista vazia</h3>

              <p>
                Adicione o primeiro item desta lista.
              </p>

              <button
                class="primary-button"
                data-action="add-item-compra"
                data-id="${lista.id}"
              >
                ${icon("plus")} Adicionar item
              </button>

            </div>
          `
      }

    </div>

  `);
}

/* =========================================================
   ESTUDOS
   ========================================================= */

function estudos() {
  const items = state.data.estudos || [];

  return appShell(`

    ${pageHeader(
      "APRENDIZADO",
      "Estudos",
      "Acompanhe matérias, assuntos, anotações e bibliografia.",
      `
        <button
          class="primary-button compact"
          data-action="add-estudos"
        >
          ${icon("plus")} Adicionar
        </button>
      `
    )}

    <div class="content-card">

      <div class="card-toolbar">

        <div class="toolbar-title">
          ${items.length}
          ${items.length === 1 ? "matéria" : "matérias"}
        </div>

      </div>

      ${
        items.length
          ? `
            <div class="item-list">

              ${items.map(x => `

                <div
                  class="list-item ${
                    x.done ? "completed" : ""
                  }"
                >

                  <button
                    class="check-button ${
                      x.done ? "checked" : ""
                    }"
                    data-action="toggle-estudo"
                    data-id="${x.id}"
                  >
                    ${x.done ? "✓" : ""}
                  </button>

                  <div class="item-main">

                    <strong>
                      ${esc(x.subject)}
                    </strong>

                    <span>
                      ${
                        x.topic
                          ? esc(x.topic)
                          : "Sessão de estudo"
                      }

                      ${
                        x.duration
                          ? ` · ${esc(x.duration)} min`
                          : ""
                      }
                    </span>

                    ${
                      x.notes
                        ? `
                          <small>
                            📝 ${esc(
                              x.notes.slice(0, 100)
                            )}
                          </small>
                        `
                        : ""
                    }

                    ${
                      x.link
                        ? `
                          <a
                            class="link-button"
                            href="${esc(x.link)}"
                            target="_blank"
                            rel="noopener"
                          >
                            🔗 Bibliografia
                          </a>
                        `
                        : ""
                    }

                  </div>

                  <div class="item-actions">

                    <button
                      data-action="edit-estudo"
                      data-id="${x.id}"
                    >
                      ${icon("edit")}
                    </button>

                    <button
                      data-action="delete-estudo"
                      data-id="${x.id}"
                    >
                      ${icon("trash")}
                    </button>

                  </div>

                </div>

              `).join("")}

            </div>
          `
          : emptyState(
              "Nenhum estudo registrado",
              "Cadastre uma matéria ou assunto para começar.",
              "Adicionar estudo",
              "add-estudos"
            )
      }

    </div>

  `);
}

/* =========================================================
   TREINOS
   ========================================================= */

function treinos() {
  const items = state.data.treinos || [];

  return appShell(`

    ${pageHeader(
      "BEM-ESTAR",
      "Treinos",
      "Registre exercícios, cargas, repetições e desempenho.",
      `
        <button
          class="primary-button compact"
          data-action="add-treinos"
        >
          ${icon("plus")} Novo treino
        </button>
      `
    )}

    <div class="content-card">

      ${
        items.length
          ? items.map(treino => `

              <div class="exercise-card">

                <div class="goal-top">

                  <div>
                    <strong>
                      ${esc(treino.name)}
                    </strong>

                    <span>
                      ${esc(treino.type || "Treino")}

                      ${
                        treino.duration
                          ? ` · ${esc(treino.duration)} min`
                          : ""
                      }

                      ${
                        treino.distance
                          ? ` · ${esc(treino.distance)} km`
                          : ""
                      }

                      ${
                        treino.pace
                          ? ` · Pace ${esc(treino.pace)}`
                          : ""
                      }
                    </span>
                  </div>

                  <div>
                    <button
                      class="text-button"
                      data-action="add-exercicio"
                      data-id="${treino.id}"
                    >
                      + Exercício
                    </button>
                  </div>

                </div>

                ${
                  treino.exercises?.length
                    ? treino.exercises.map(ex => `

                        <div class="list-item">

                          <div class="module-icon small">
                            ${icon("dumbbell")}
                          </div>

                          <div class="item-main">

                            <strong>
                              ${esc(ex.name)}
                            </strong>

                            <span>

                              Carga:
                              meta ${esc(ex.loadGoal || "—")}
                              /
                              realizada ${esc(ex.loadDone || "—")}

                              ·

                              Repetições:
                              meta ${esc(ex.repsGoal || "—")}
                              /
                              realizadas ${esc(ex.repsDone || "—")}

                            </span>

                          </div>

                          <div class="item-actions">

                            <button
                              data-action="animate-exercicio"
                              data-id="${ex.id}"
                            >
                              ▶
                            </button>

                            <button
                              data-action="edit-exercicio"
                              data-id="${ex.id}"
                              data-treino-id="${treino.id}"
                            >
                              ${icon("edit")}
                            </button>

                            <button
                              data-action="delete-exercicio"
                              data-id="${ex.id}"
                              data-treino-id="${treino.id}"
                            >
                              ${icon("trash")}
                            </button>

                          </div>

                        </div>

                      `).join("")
                    : `
                      <p class="muted">
                        Nenhum exercício cadastrado neste treino.
                      </p>
                    `
                }

                ${
                  treino.observations
                    ? `
                      <p class="muted">
                        ${esc(treino.observations)}
                      </p>
                    `
                    : ""
                }

              </div>

            `).join("")
          : emptyState(
              "Nenhum treino registrado",
              "Crie seu primeiro treino para acompanhar sua evolução.",
              "Novo treino",
              "add-treinos"
            )
      }

    </div>

  `);
}

/* =========================================================
   HIDRATAÇÃO
   ========================================================= */

function hidratacao() {
  const total = state.data.hidratacao
    .filter(x => x.date === todayISO())
    .reduce(
      (sum, x) => sum + Number(x.amount || 0),
      0
    );

  const goal =
    Number(state.settings.hydrationGoal) || 2000;

  const interval =
    Number(state.settings.hydrationInterval) || 2;

  const periodAmount =
    Number(state.settings.hydrationPeriodAmount) || 250;

  const pct = Math.min(
    100,
    Math.round((total / goal) * 100)
  );

  return appShell(`

    ${pageHeader(
      "BEM-ESTAR",
      "Hidratação",
      "Acompanhe sua meta diária e a quantidade indicada por período.",
      `
        <button
          class="primary-button compact"
          data-action="add-hidratacao"
        >
          ${icon("plus")} Registrar
        </button>
      `
    )}

    <div class="hydration-card">

      <div class="hydration-top">

        <div>

          <span class="eyebrow">
            HOJE
          </span>

          <h2>
            ${total} ml
          </h2>

          <p>
            de ${goal} ml
          </p>

          <p class="muted">
            ${periodAmount} ml a cada ${interval} hora(s)
          </p>

        </div>

        <div class="water-drop">
          ◉
        </div>

      </div>

      <div class="progress">
        <span style="width:${pct}%"></span>
      </div>

      <div class="progress-labels">

        <span>0 ml</span>

        <strong>${pct}%</strong>

        <span>${goal} ml</span>

      </div>

      <div class="quick-water">

        ${[200, 300, 500].map(v => `
          <button
            data-action="quick-water"
            data-value="${v}"
          >
            +${v} ml
          </button>
        `).join("")}

      </div>

      <button
        class="ghost-button"
        data-action="config-hidratacao"
      >
        ⚙ Definir meta e período
      </button>

    </div>

    <div class="content-card">

      <div class="card-toolbar">

        <div class="toolbar-title">
          Registros de hoje
        </div>

        <button
          class="text-button"
          data-action="reset-hidratacao"
        >
          Limpar
        </button>

      </div>

      ${
        state.data.hidratacao.filter(
          x => x.date === todayISO()
        ).length
          ? `
            <div class="item-list">

              ${state.data.hidratacao
                .filter(x => x.date === todayISO())
                .map(x => `

                  <div class="list-item">

                    <div class="module-icon small">
                      ◉
                    </div>

                    <div class="item-main">

                      <strong>
                        ${x.amount} ml
                      </strong>

                      <span>
                        ${new Date(
                          x.createdAt
                        ).toLocaleTimeString(
                          "pt-BR",
                          {
                            hour: "2-digit",
                            minute: "2-digit"
                          }
                        )}
                      </span>

                    </div>

                    <div class="item-actions">

                      <button
                        data-action="delete-hidratacao"
                        data-id="${x.id}"
                      >
                        ${icon("trash")}
                      </button>

                    </div>

                  </div>

                `).join("")}

            </div>
          `
          : `<p class="muted">
              Nenhum registro hoje.
            </p>`
      }

    </div>

  `);
}

/* =========================================================
   ALIMENTAÇÃO
   ========================================================= */

function alimentacao() {
  const today = todayISO();

  const meals = state.data.alimentacao
    .filter(x => x.date === today)
    .sort((a, b) =>
      (a.time || "").localeCompare(
        b.time || ""
      )
    );

  const consumed = meals.reduce(
    (sum, meal) =>
      sum +
      (meal.foods || []).reduce(
        (s, food) =>
          s + Number(food.calories || 0),
        0
      ),
    0
  );

  const goal =
    Number(state.settings.calorieGoal) || 2000;

  const remaining =
    Math.max(0, goal - consumed);

  const pct = Math.min(
    100,
    Math.round((consumed / goal) * 100)
  );

  return appShell(`

    ${pageHeader(
      "BEM-ESTAR",
      "Alimentação",
      "Organize refeições, alimentos da dieta e calorias.",
      `
        <button
          class="primary-button compact"
          data-action="add-alimentacao"
        >
          ${icon("plus")} Refeição
        </button>
      `
    )}

    <div class="calorie-summary">

      <span class="eyebrow">
        CALORIAS DE HOJE
      </span>

      <strong>
        ${consumed} kcal
      </strong>

      <p>
        Meta: ${goal} kcal · Restam ${remaining} kcal
      </p>

      <div class="calorie-progress">
        <span style="width:${pct}%"></span>
      </div>

      <button
        class="ghost-button"
        data-action="config-calorias"
      >
        ⚙ Definir meta diária
      </button>

    </div>

    <div class="shopping-diet-actions">

      <button
        class="ghost-button"
        data-action="add-dieta"
      >
        🍽 Inserir dieta
      </button>

      <button
        class="ghost-button"
        data-action="dieta-para-compras"
      >
        🛒 Criar compras da dieta
      </button>

    </div>

    <div class="content-card">

      <div class="card-toolbar">

        <div class="toolbar-title">
          Refeições de hoje
        </div>

      </div>

      ${
        meals.length
          ? `
            <div class="item-list">

              ${meals.map(meal => `

                <div class="list-item">

                  <div class="module-icon small">
                    🍽
                  </div>

                  <div class="item-main">

                    <strong>
                      ${esc(meal.name)}
                    </strong>

                    <span>
                      ${esc(meal.time || "--:--")}
                      ·
                      ${
                        (meal.foods || []).reduce(
                          (s, f) =>
                            s +
                            Number(
                              f.calories || 0
                            ),
                          0
                        )
                      } kcal
                    </span>

                    <small>

                      ${(meal.foods || [])
                        .map(
                          f =>
                            `${esc(f.name)} (${Number(
                              f.calories || 0
                            )} kcal)`
                        )
                        .join(", ")}

                    </small>

                  </div>

                  <div class="item-actions">

                    <button
                      data-action="edit-refeicao"
                      data-id="${meal.id}"
                    >
                      ${icon("edit")}
                    </button>

                    <button
                      data-action="delete-refeicao"
                      data-id="${meal.id}"
                    >
                      ${icon("trash")}
                    </button>

                  </div>

                </div>

              `).join("")}

            </div>
          `
          : emptyState(
              "Nenhuma refeição hoje",
              "Registre sua primeira refeição para acompanhar as calorias.",
              "Adicionar refeição",
              "add-alimentacao"
            )
      }

    </div>

  `);
                        }
/* =========================================================
   FINANÇAS
   ========================================================= */

function financeByCategory() {
  const result = {};

  state.data.financas
    .filter(x => x.type === "expense")
    .forEach(x => {

      const category =
        x.category?.trim() || "Geral";

      result[category] =
        (result[category] || 0) +
        Number(x.value || 0);

    });

  return result;
}

function financeChart() {
  const data = financeByCategory();

  const entries =
    Object.entries(data);

  if (!entries.length) {
    return `
      <p class="muted">
        Ainda não existem gastos por categoria.
      </p>
    `;
  }

  const max =
    Math.max(
      ...entries.map(([, value]) => value)
    );

  return entries
    .sort((a, b) => b[1] - a[1])
    .map(([category, value]) => {

      const pct =
        max
          ? Math.round((value / max) * 100)
          : 0;

      const limit =
        Number(
          state.settings.financeLimits?.[category] || 0
        );

      const warning =
        limit > 0
          ? `
            <div
              class="limit-warning ${
                value > limit
                  ? "limit-danger"
                  : "limit-ok"
              }"
            >
              Teto: ${money(limit)}
              ·
              ${value > limit
                ? "Teto ultrapassado"
                : `Restam ${money(limit - value)}`}
            </div>
          `
          : "";

      return `
        <div class="chart-row">

          <div class="chart-label">

            <span>
              ${esc(category)}
            </span>

            <strong>
              ${money(value)}
            </strong>

          </div>

          <div class="chart-bar">
            <span style="width:${pct}%"></span>
          </div>

          ${warning}

        </div>
      `;
    })
    .join("");
}

function financas() {
  const income =
    state.data.financas
      .filter(x => x.type === "income")
      .reduce(
        (s, x) => s + Number(x.value || 0),
        0
      );

  const expense =
    state.data.financas
      .filter(x => x.type === "expense")
      .reduce(
        (s, x) => s + Number(x.value || 0),
        0
      );

  return appShell(`

    ${pageHeader(
      "DINHEIRO",
      "Finanças",
      "Tenha uma visão simples do que entra e sai.",
      `
        <button
          class="primary-button compact"
          data-action="add-financas"
        >
          ${icon("plus")} Lançamento
        </button>
      `
    )}

    <div class="stats-grid mini">

      ${statCard(
        money(income),
        "Entradas",
        "cyan"
      )}

      ${statCard(
        money(expense),
        "Saídas",
        "pink"
      )}

      ${statCard(
        money(income - expense),
        "Saldo",
        "purple"
      )}

    </div>

    <div class="content-card finance-chart">

      <div class="card-toolbar">

        <div>
          <div class="toolbar-title">
            Gastos por categoria
          </div>

          <small>
            Visão dos gastos registrados
          </small>
        </div>

        <button
          class="text-button"
          data-action="config-tetos"
        >
          ⚙ Tetos
        </button>

      </div>

      ${financeChart()}

    </div>

    <div class="content-card">

      <div class="card-toolbar">

        <div class="toolbar-title">
          Lançamentos
        </div>

      </div>

      ${
        state.data.financas.length
          ? `
            <div class="item-list">

              ${state.data.financas
                .slice()
                .reverse()
                .map(x => `

                  <div class="list-item">

                    <div
                      class="finance-icon ${
                        x.type
                      }"
                    >
                      ${
                        x.type === "income"
                          ? "↑"
                          : "↓"
                      }
                    </div>

                    <div class="item-main">

                      <strong>
                        ${esc(x.title)}
                      </strong>

                      <span>
                        ${dateBR(
                          x.date || todayISO()
                        )}
                        ·
                        ${
                          x.category
                            ? esc(x.category)
                            : "Geral"
                        }
                      </span>

                    </div>

                    <strong
                      class="finance-value ${
                        x.type
                      }"
                    >
                      ${
                        x.type === "income"
                          ? "+"
                          : "-"
                      }
                      ${money(x.value)}
                    </strong>

                    <div class="item-actions">

                      <button
                        data-action="delete-financa"
                        data-id="${x.id}"
                      >
                        ${icon("trash")}
                      </button>

                    </div>

                  </div>

                `).join("")}

            </div>
          `
          : emptyState(
              "Nenhum lançamento",
              "Registre uma entrada ou saída.",
              "Adicionar lançamento",
              "add-financas"
            )
      }

    </div>

  `);
}

/* =========================================================
   OBJETIVOS
   ========================================================= */

function objetivos() {
  const items =
    state.data.objetivos || [];

  return appShell(`

    ${pageHeader(
      "DIREÇÃO",
      "Objetivos",
      "Dê forma aos planos que você quer realizar.",
      `
        <button
          class="primary-button compact"
          data-action="add-objetivos"
        >
          ${icon("plus")} Objetivo
        </button>
      `
    )}

    <div class="content-card">

      ${
        items.length
          ? items.map(x => `

              <div class="goal-item">

                <div class="goal-top">

                  <div>

                    <strong>
                      ${esc(x.title)}
                    </strong>

                    <span>

                      ${
                        x.deadline
                          ? `Até ${dateBR(
                              x.deadline
                            )}`
                          : "Sem prazo"
                      }

                      ${
                        Number(x.moneyGoal || 0) > 0
                          ? ` · Meta financeira ${money(
                              x.moneyGoal
                            )}`
                          : ""
                      }

                    </span>

                  </div>

                  <b>
                    ${Number(
                      x.progress || 0
                    )}%
                  </b>

                </div>

                <div class="progress">
                  <span
                    style="width:${Math.min(
                      100,
                      Number(x.progress || 0)
                    )}%"
                  ></span>
                </div>

                ${
                  x.observations
                    ? `
                      <p class="muted">
                        ${esc(
                          x.observations
                        )}
                      </p>
                    `
                    : ""
                }

                <div class="goal-subtasks">

                  ${
                    x.metas?.length
                      ? x.metas.map(meta => `

                          <div class="goal-subtask">

                            <button
                              class="check-button ${
                                meta.done
                                  ? "checked"
                                  : ""
                              }"
                              data-action="toggle-meta"
                              data-id="${meta.id}"
                              data-goal-id="${x.id}"
                            >
                              ${
                                meta.done
                                  ? "✓"
                                  : ""
                              }
                            </button>

                            <div class="item-main">

                              <strong>
                                ${esc(
                                  meta.title
                                )}
                              </strong>

                              <span>
                                ${esc(
                                  meta.period
                                )}
                              </span>

                            </div>

                          </div>

                        `).join("")
                      : `
                        <p class="muted">
                          Nenhuma meta interna cadastrada.
                        </p>
                      `
                  }

                </div>

                <div class="goal-actions">

                  <button
                    data-action="add-meta"
                    data-id="${x.id}"
                  >
                    + Meta
                  </button>

                  <button
                    data-action="progress-objetivo"
                    data-id="${x.id}"
                  >
                    Atualizar progresso
                  </button>

                  <button
                    data-action="edit-objetivo"
                    data-id="${x.id}"
                  >
                    Editar
                  </button>

                  <button
                    data-action="delete-objetivo"
                    data-id="${x.id}"
                  >
                    Excluir
                  </button>

                </div>

              </div>

            `).join("")
          : emptyState(
              "Nenhum objetivo",
              "Crie um objetivo e transforme-o em pequenas metas.",
              "Criar objetivo",
              "add-objetivos"
            )
      }

    </div>

  `);
}

/* =========================================================
   FAMÍLIA
   ========================================================= */

function familia() {
  return listPage({
    key: "familia",

    title: "Família",

    subtitle:
      "Uma visão compartilhada para organizar a vida juntos.",

    eyebrow: "COMPARTILHAMENTO",

    emptyTitle:
      "Ainda não há pessoas adicionadas",

    emptyText:
      "Cadastre pessoas para estruturar sua área familiar.",

    render: x => `

      <div class="list-item">

        <div class="avatar">
          ${esc(
            (x.name || "?")
              .charAt(0)
              .toUpperCase()
          )}
        </div>

        <div class="item-main">

          <strong>
            ${esc(x.name)}
          </strong>

          <span>
            ${esc(
              x.relation || "Membro"
            )}

            ${
              x.email
                ? ` · ${esc(x.email)}`
                : ""
            }
          </span>

        </div>

        <div class="item-actions">

          <button
            data-action="delete-familia"
            data-id="${x.id}"
          >
            ${icon("trash")}
          </button>

        </div>

      </div>
    `
  });
}

/* =========================================================
   ASSISTENTE
   ========================================================= */

function assistente() {
  const pending =
    state.data.tarefas.filter(
      x => !x.done
    );

  const today =
    state.data.compromissos.filter(
      x => x.date === todayISO()
    );

  return appShell(`

    ${pageHeader(
      "INTELIGÊNCIA",
      "Assistente LiDire",
      "Uma visão rápida da sua rotina para ajudar você a encontrar o próximo passo."
    )}

    <div class="assistant-screen">

      <div class="assistant-avatar">
        ✦
      </div>

      <h2>
        Como posso ajudar?
      </h2>

      <p>
        Experimente uma das sugestões abaixo.
      </p>

      <div class="suggestions">

        <button
          data-action="assistant-question"
          data-question="O que tenho para hoje?"
        >
          O que tenho para hoje?
        </button>

        <button
          data-action="assistant-question"
          data-question="Quais tarefas estão pendentes?"
        >
          Quais tarefas estão pendentes?
        </button>

        <button
          data-action="assistant-question"
          data-question="Como está minha rotina?"
        >
          Como está minha rotina?
        </button>

      </div>

      <div
        id="assistant-response"
        class="assistant-response"
      >

        <strong>
          Resumo atual
        </strong>

        <p>
          Você tem
          <b>${pending.length}</b>
          tarefa(s) pendente(s) e
          <b>${today.length}</b>
          compromisso(s) hoje.
        </p>

      </div>

    </div>

  `);
}

/* =========================================================
   EXPLORAR
   ========================================================= */

function explorar() {
  return appShell(`

    ${pageHeader(
      "LIDIRE",
      "Tudo em um só lugar",
      "Conheça os espaços que ajudam a transformar rotina em clareza."
    )}

    <div class="explore-grid">

      ${modules.map(moduleCard).join("")}

      <button
        class="module-card featured"
        data-page="assistente"
      >

        <span class="module-icon">
          ✦
        </span>

        <span class="module-content">

          <strong>
            Assistente LiDire
          </strong>

          <small>
            Seu copiloto para organizar a rotina.
          </small>

        </span>

        <span class="module-arrow">
          ${icon("arrow")}
        </span>

      </button>

    </div>

  `);
}

/* =========================================================
   PERFIL
   ========================================================= */

function perfil() {
  return appShell(`

    ${pageHeader(
      "MINHA CONTA",
      "Perfil",
      "Personalize sua experiência na LiDire."
    )}

    <div class="profile-card">

      <div class="profile-avatar">

        ${
          state.user.photo
            ? `
              <img
                class="profile-photo-preview"
                src="${esc(state.user.photo)}"
                alt="Foto de perfil"
              >
            `
            : esc(
                (state.user.name || "A")
                  .charAt(0)
                  .toUpperCase()
              )
        }

      </div>

      <h2>
        ${esc(
          state.user.name || "Seu nome"
        )}
      </h2>

      <p>
        ${esc(
          state.user.email ||
          "Adicione seu e-mail"
        )}
      </p>

      <button
        class="primary-button"
        data-action="edit-profile"
      >
        ${icon("edit")} Editar perfil
      </button>

    </div>

    <div class="settings-card">

      <button data-action="edit-profile">
        <span>✎</span>

        <div>
          <strong>
            Dados pessoais
          </strong>

          <small>
            Nome, e-mail, idade e telefone
          </small>
        </div>

        ${icon("arrow")}
      </button>

      <button data-action="photo-profile">
        <span>📷</span>

        <div>
          <strong>
            Foto de perfil
          </strong>

          <small>
            Adicionar, alterar ou excluir
          </small>
        </div>

        ${icon("arrow")}
      </button>

      <button data-action="clear-local">

        <span>↺</span>

        <div>

          <strong>
            Redefinir dados locais
          </strong>

          <small>
            Apaga os dados salvos neste dispositivo
          </small>

        </div>

        ${icon("arrow")}

      </button>

    </div>

  `);
}

const pages = {
  inicio: home,
  agenda,
  tarefas,
  compras,
  estudos,
  treinos,
  hidratacao,
  alimentacao,
  financas,
  objetivos,
  familia,
  assistente,
  explorar,
  perfil
};

function render() {
  const root =
    document.getElementById("app");

  if (!root) return;

  if (
    currentPage === "compras" &&
    currentShoppingList
  ) {
    root.innerHTML =
      listaCompras(
        currentShoppingList
      );
  } else {
    root.innerHTML =
      (
        pages[currentPage] ||
        home
      )();
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

/* =========================================================
   MODAIS
   ========================================================= */

function openModal(
  title,
  body,
  options = {}
) {
  closeModal();

  modal =
    document.createElement("div");

  modal.className =
    "modal-backdrop";

  modal.innerHTML = `

    <div
      class="modal"
      role="dialog"
      aria-modal="true"
    >

      <div class="modal-header">

        <div>

          <span class="eyebrow">
            ${esc(
              options.eyebrow ||
              "LIDIRE"
            )}
          </span>

          <h2>
            ${esc(title)}
          </h2>

        </div>

        <button
          class="modal-close"
          data-action="close-modal"
        >
          ×
        </button>

      </div>

      <form
        id="lidire-form"
        class="form-grid"
      >

        ${body}

        <div class="modal-footer">

          <button
            type="button"
            class="ghost-button"
            data-action="close-modal"
          >
            Cancelar
          </button>

          <button
            class="primary-button"
            type="submit"
          >
            ${esc(
              options.submit ||
              "Salvar"
            )}
          </button>

        </div>

      </form>

    </div>
  `;

  document.body.appendChild(modal);

  modal
    .querySelector(
      "input, select, textarea"
    )
    ?.focus();
}

function closeModal() {
  document
    .querySelector(
      ".modal-backdrop"
    )
    ?.remove();

  modal = null;
}

function field(
  label,
  name,
  type = "text",
  value = "",
  extra = ""
) {
  return `
    <label class="form-field">

      <span>
        ${esc(label)}
      </span>

      <input
        name="${esc(name)}"
        type="${type}"
        value="${esc(value)}"
        ${extra}
      >

    </label>
  `;
}

function textareaField(
  label,
  name,
  value = "",
  extra = ""
) {
  return `
    <label class="form-field">

      <span>
        ${esc(label)}
      </span>

      <textarea
        name="${esc(name)}"
        ${extra}
      >${esc(value)}</textarea>

    </label>
  `;
}

function selectField(
  label,
  name,
  options,
  selected = ""
) {
  return `
    <label class="form-field">

      <span>
        ${esc(label)}
      </span>

      <select name="${esc(name)}">

        ${options.map(option => `
          <option
            value="${esc(option)}"
            ${
              option === selected
                ? "selected"
                : ""
            }
          >
            ${esc(option)}
          </option>
        `).join("")}

      </select>

    </label>
  `;
          }
