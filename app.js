const STORAGE_KEY = "light-calorie-diary-v2";
const OLD_STORAGE_KEY = "light-calorie-diary-v1";
const BG_KEY = "light-calorie-diary-bg";
const UI_THEME_KEY = "light-calorie-diary-theme";

const mealNames = {
  breakfast: "早餐",
  lunch: "午餐",
  dinner: "晚餐",
  snack: "加餐",
};

const defaultQuickFoods = [
  { id: "egg", name: "鸡蛋", calories: 70, meal: "breakfast" },
  { id: "milk", name: "牛奶", calories: 130, meal: "breakfast" },
  { id: "oats", name: "燕麦", calories: 220, meal: "breakfast" },
  { id: "rice", name: "米饭", calories: 260, meal: "lunch" },
  { id: "chicken", name: "鸡胸肉", calories: 180, meal: "lunch" },
  { id: "salad", name: "蔬菜沙拉", calories: 120, meal: "lunch" },
  { id: "noodle", name: "面条", calories: 430, meal: "dinner" },
  { id: "apple", name: "苹果", calories: 95, meal: "snack" },
  { id: "yogurt", name: "酸奶", calories: 110, meal: "snack" },
  { id: "latte", name: "拿铁", calories: 150, meal: "snack" },
];

const uiThemes = {
  dimoo: {
    name: "Dimoo 云朵蓝",
    vars: {
      "--ink": "#30435f", "--muted": "#6d7e93", "--line": "#d8e8f6", "--panel": "#ffffff",
      "--green": "#6aa6d9", "--green-soft": "#e6f3ff", "--coral": "#ee8d96", "--yellow": "#f4c96f",
      "--blue": "#7eb8e6", "--card-bg": "rgba(255, 255, 255, 0.88)", "--soft-panel": "#f5fbff",
      "--radius": "18px", "--button-radius": "999px", "--shadow": "0 18px 42px rgba(103, 144, 184, 0.18)",
      "--accent-pattern": "radial-gradient(circle at 12% 16%, rgba(255,255,255,.95) 0 18px, transparent 19px), radial-gradient(circle at 20% 13%, rgba(210,234,255,.9) 0 13px, transparent 14px)",
    },
    backgrounds: [ ["#edf8ff", "#fbfdff", "#e8f1fb"], ["#f4fbff", "#ffffff", "#eaf6ff"] ],
  },
  yoyo: {
    name: "Yoyo 酱元气粉",
    vars: {
      "--ink": "#563a4b", "--muted": "#856a78", "--line": "#f2d5df", "--panel": "#fffdfd",
      "--green": "#e986aa", "--green-soft": "#ffe8f1", "--coral": "#e46e6a", "--yellow": "#ffd36e",
      "--blue": "#8fc7df", "--card-bg": "rgba(255, 253, 253, 0.9)", "--soft-panel": "#fff5f8",
      "--radius": "16px", "--button-radius": "16px", "--shadow": "0 18px 42px rgba(216, 119, 154, 0.16)",
      "--accent-pattern": "radial-gradient(circle at 10% 16%, rgba(255,211,110,.38) 0 12px, transparent 13px), radial-gradient(circle at 21% 9%, rgba(233,134,170,.24) 0 16px, transparent 17px)",
    },
    backgrounds: [ ["#fff3f7", "#fffdf8", "#fdebf1"], ["#fff8ed", "#fffdfb", "#ffeef5"] ],
  },
  lineDog: {
    name: "线条小狗奶白",
    vars: {
      "--ink": "#403b35", "--muted": "#776f66", "--line": "#ded6ca", "--panel": "#fffefa",
      "--green": "#7c9f7a", "--green-soft": "#eef5e9", "--coral": "#d88975", "--yellow": "#eacb7a",
      "--blue": "#8fb4bf", "--card-bg": "rgba(255, 254, 250, 0.92)", "--soft-panel": "#fbf7ee",
      "--radius": "10px", "--button-radius": "10px", "--shadow": "0 16px 34px rgba(92, 82, 70, 0.12)",
      "--accent-pattern": "linear-gradient(135deg, rgba(64,59,53,.06) 0 1px, transparent 1px 16px)",
    },
    backgrounds: [ ["#fbf8ef", "#fffefa", "#f0eadf"], ["#f7f5ec", "#fffefa", "#ece8dc"] ],
  },
  lulu: {
    name: "水豚噜噜草地",
    vars: {
      "--ink": "#3f4630", "--muted": "#727a62", "--line": "#d9e2c3", "--panel": "#fffffb",
      "--green": "#82a45b", "--green-soft": "#eef6df", "--coral": "#d98367", "--yellow": "#ebc86c",
      "--blue": "#86b9b3", "--card-bg": "rgba(255, 255, 251, 0.9)", "--soft-panel": "#f7faed",
      "--radius": "20px", "--button-radius": "999px", "--shadow": "0 18px 38px rgba(101, 126, 72, 0.15)",
      "--accent-pattern": "radial-gradient(ellipse at 12% 14%, rgba(130,164,91,.18) 0 26px, transparent 27px), radial-gradient(ellipse at 28% 8%, rgba(235,200,108,.2) 0 18px, transparent 19px)",
    },
    backgrounds: [ ["#f4fae9", "#fffef8", "#eaf4dc"], ["#f8f7e9", "#fffffb", "#e9f1d5"] ],
  },
  melody: {
    name: "美乐蒂甜粉",
    vars: {
      "--ink": "#55364a", "--muted": "#876878", "--line": "#f3cfdd", "--panel": "#fffafd",
      "--green": "#e78aae", "--green-soft": "#ffe7f1", "--coral": "#df7284", "--yellow": "#f6cf75",
      "--blue": "#a7c9eb", "--card-bg": "rgba(255, 250, 253, 0.92)", "--soft-panel": "#fff2f7",
      "--radius": "22px", "--button-radius": "999px", "--shadow": "0 18px 42px rgba(222, 119, 158, 0.16)",
      "--accent-pattern": "radial-gradient(circle at 13% 13%, rgba(231,138,174,.18) 0 20px, transparent 21px), radial-gradient(circle at 24% 18%, rgba(255,255,255,.9) 0 12px, transparent 13px)",
    },
    backgrounds: [ ["#fff1f7", "#fffdfd", "#fde8f0"], ["#fff6fa", "#ffffff", "#f9e8f1"] ],
  },
  kuromi: {
    name: "库洛米淡紫",
    vars: {
      "--ink": "#42364f", "--muted": "#746984", "--line": "#ddd2ee", "--panel": "#fffaff",
      "--green": "#8d72c7", "--green-soft": "#f0e9ff", "--coral": "#d66d97", "--yellow": "#e8c56d",
      "--blue": "#8ea9d8", "--card-bg": "rgba(255, 250, 255, 0.9)", "--soft-panel": "#f8f3ff",
      "--radius": "12px", "--button-radius": "12px", "--shadow": "0 18px 42px rgba(126, 101, 177, 0.16)",
      "--accent-pattern": "linear-gradient(135deg, rgba(141,114,199,.12) 0 10px, transparent 10px 24px), radial-gradient(circle at 20% 12%, rgba(214,109,151,.18) 0 12px, transparent 13px)",
    },
    backgrounds: [ ["#f6f0ff", "#fffaff", "#ece6f8"], ["#faf3ff", "#ffffff", "#eee7fa"] ],
  },
  chiikawa: {
    name: "Chiikawa 软彩",
    vars: {
      "--ink": "#39455a", "--muted": "#6d7890", "--line": "#dbe4f4", "--panel": "#ffffff",
      "--green": "#76a9d8", "--green-soft": "#eaf4ff", "--coral": "#ee928d", "--yellow": "#f3d178",
      "--blue": "#9ac2e7", "--card-bg": "rgba(255, 255, 255, 0.9)", "--soft-panel": "#f7fbff",
      "--radius": "18px", "--button-radius": "18px", "--shadow": "0 18px 42px rgba(116, 148, 190, 0.15)",
      "--accent-pattern": "radial-gradient(circle at 11% 12%, rgba(243,209,120,.25) 0 14px, transparent 15px), radial-gradient(circle at 22% 18%, rgba(238,146,141,.2) 0 10px, transparent 11px), radial-gradient(circle at 30% 9%, rgba(154,194,231,.2) 0 12px, transparent 13px)",
    },
    backgrounds: [ ["#f1f8ff", "#fffdf9", "#edf4ff"], ["#fff7f3", "#ffffff", "#edf7ff"] ],
  },
};

const $ = (selector) => document.querySelector(selector);
const today = () => formatDate(new Date());

let state = loadState();
let activeDate = today();
let visibleMonth = new Date(activeDate + "T00:00:00");
let editingEntry = null;
let editingQuick = null;
let quickSearchText = "";
let currentTheme = localStorage.getItem(UI_THEME_KEY) || "dimoo";
let cloudClient = null;
let cloudSaveTimer = null;
let isLoadingCloud = false;
let currentUser = null;

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(OLD_STORAGE_KEY);
  const fallback = { settings: { startWeight: "", targetWeight: "", dailyGoal: 1600 }, quickFoods: defaultQuickFoods, days: {} };
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return normalizeState(parsed);
  } catch {
    return fallback;
  }
}

function normalizeState(parsed) {
  const quickFoods = Array.isArray(parsed.quickFoods) ? parsed.quickFoods : defaultQuickFoods;
  const days = parsed.days || {};
  Object.values(days).forEach((day) => {
    day.meals = { breakfast: [], lunch: [], dinner: [], snack: [], ...day.meals };
    Object.values(day.meals).forEach((entries) => {
      entries.forEach((entry) => { if (!entry.id) entry.id = makeId(); });
    });
  });
  return {
    settings: { startWeight: "", targetWeight: "", dailyGoal: 1600, ...parsed.settings },
    quickFoods: quickFoods.map((food) => ({ id: food.id || makeId(), ...food })),
    days,
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  scheduleCloudSave();
}

function getCloudConfig() {
  return window.SUPABASE_CONFIG || {};
}

function normalizeSupabaseUrl(url) {
  return String(url ||
