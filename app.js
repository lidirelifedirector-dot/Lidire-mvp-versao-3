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
    hidratacaoConfig: {
      dailyGoal: 2000,
      intervalMinutes: 120,
      intervalAmount: 250
    },

    alimentacao: [],
    alimentacaoConfig: {
      dailyCalories: 2000,
      dietFoods: []
    },

    financas: [],
    financeBudgets: {},

    objetivos: [],
    familia: []
  }
};

let state = loadState();
let currentPage = "inicio";
let currentShoppingList = null;
let currentStudyId = null;
let currentTrainingId = null;
let currentGoalId = null;
let modal = null;

function cloneDefault() {
  return JSON.parse(JSON.stringify(defaultState));
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!saved) {
      return cloneDefault();
    }

    return {
      ...cloneDefault(),
      ...saved,

      user: {
        ...defaultState.user,
        ...(saved.user || {})
      },

      data: {
        ...defaultState.data,
        ...(saved.data || {}),

        hidratacaoConfig: {
          ...defaultState.data.hidratacaoConfig,
          ...((saved.data || {}).hidratacaoConfig || {})
        },

        alimentacaoConfig: {
          ...defaultState.data.alimentacaoConfig,
          ...((saved.data || {}).alimentacaoConfig || {})
        },

        financeBudgets: {
          ...((saved.data || {}).financeBudgets || {})
        }
      }
    };
  } catch (error) {
    console.error("Erro ao carregar LiDire:", error);
    return cloneDefault();
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

  const parts = String(value).split("-");

  if (parts.length !== 3) {
    return value;
  }

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function todayISO() {
  const date = new Date();
  const offset = date.getTimezoneOffset();

  return new Date(date.getTime() - offset * 60000)
    .toISOString()
    .slice(0, 10);
}

function timeNow() {
  return new Date().toTimeString().slice(0, 5);
}

function toast(message, type = "success") {
  document.querySelectorAll(".lidire-toast").forEach(el => el.remove());

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
    spark: "✦",
    user: "◯",
    plus: "+",
    arrow: "→",
    trash: "⌫",
    edit: "✎",
    clock: "◷",
    search: "⌕",
    back: "‹",
    food: "🍽",
    link: "🔗",
    note: "📝",
    photo: "📷"
  };

  return icons[name] || "•";
}

const modules = [
  ["agenda", "Agenda", "Compromissos e horários", "calendar", "agenda"],
  ["tarefas", "Tarefas", "Tudo o que precisa ser feito", "check", "tarefas"],
  ["compras", "Compras", "Listas para não esquecer", "cart", "compras"],
  ["estudos", "Estudos", "Organize seu aprendizado", "book", "estudos"],
  ["treinos", "Treinos", "Movimente-se e acompanhe", "dumbbell", "treinos"],
  ["hidratacao", "Hidratação", "Cuide da sua rotina", "drop", "hidratacao"],
  ["alimentacao", "Alimentação", "Refeições e calorias", "food", "alimentacao"],
  ["financas", "Finanças", "Entradas e gastos", "wallet", "financas"],
  ["objetivos
