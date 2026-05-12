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
      "--ink": "#30435f",
      "--muted": "#6d7e93",
      "--line": "#d8e8f6",
      "--panel": "#ffffff",
      "--green": "#6aa6d9",
      "--green-soft": "#e6f3ff",
      "--coral": "#ee8d96",
      "--yellow": "#f4c96f",
      "--blue": "#7eb8e6",
      "--card-bg": "rgba(255, 255, 255, 0.88)",
      "--soft-panel": "#f5fbff",
      "--radius": "18px",
      "--button-radius": "999px",
      "--shadow": "0 18px 42px rgba(103, 144, 184, 0.18)",
      "--accent-pattern": "radial-gradient(circle at 12% 16%, rgba(255,255,255,.95) 0 18px, transparent 19px), radial-gradient(circle at 20% 13%, rgba(210,234,255,.9) 0 13px, transparent 14px)",
    },
    backgrounds: [
      ["#edf8ff", "#fbfdff", "#e8f1fb"],
      ["#f4fbff", "#ffffff", "#eaf6ff"],
    ],
  },
  yoyo: {
    name: "Yoyo 酱元气粉",
    vars: {
      "--ink": "#563a4b",
      "--muted": "#856a78",
      "--line": "#f2d5df",
      "--panel": "#fffdfd",
      "--green": "#e986aa",
      "--green-soft": "#ffe8f1",
      "--coral": "#e46e6a",
      "--yellow": "#ffd36e",
      "--blue": "#8fc7df",
      "--card-bg": "rgba(255, 253, 253, 0.9)",
      "--soft-panel": "#fff5f8",
      "--radius": "16px",
      "--button-radius": "16px",
      "--shadow": "0 18px 42px rgba(216, 119, 154, 0.16)",
      "--accent-pattern": "radial-gradient(circle at 10% 16%, rgba(255,211,110,.38) 0 12px, transparent 13px), radial-gradient(circle at 21% 9%, rgba(233,134,170,.24) 0 16px, transparent 17px)",
    },
    backgrounds: [
      ["#fff3f7", "#fffdf8", "#fdebf1"],
      ["#fff8ed", "#fffdfb", "#ffeef5"],
    ],
  },
  lineDog: {
    name: "线条小狗奶白",
    vars: {
      "--ink": "#403b35",
      "--muted": "#776f66",
      "--line": "#ded6ca",
      "--panel": "#fffefa",
      "--green": "#7c9f7a",
      "--green-soft": "#eef5e9",
      "--coral": "#d88975",
      "--yellow": "#eacb7a",
      "--blue": "#8fb4bf",
      "--card-bg": "rgba(255, 254, 250, 0.92)",
      "--soft-panel": "#fbf7ee",
      "--radius": "10px",
      "--button-radius": "10px",
      "--shadow": "0 16px 34px rgba(92, 82, 70, 0.12)",
      "--accent-pattern": "linear-gradient(135deg, rgba(64,59,53,.06) 0 1px, transparent 1px 16px)",
    },
    backgrounds: [
      ["#fbf8ef", "#fffefa", "#f0eadf"],
      ["#f7f5ec", "#fffefa", "#ece8dc"],
    ],
  },
  lulu: {
    name: "水豚噜噜草地",
    vars: {
      "--ink": "#3f4630",
      "--muted": "#727a62",
      "--line": "#d9e2c3",
      "--panel": "#fffffb",
      "--green": "#82a45b",
      "--green-soft": "#eef6df",
      "--coral": "#d98367",
      "--yellow": "#ebc86c",
      "--blue": "#86b9b3",
      "--card-bg": "rgba(255, 255, 251, 0.9)",
      "--soft-panel": "#f7faed",
      "--radius": "20px",
      "--button-radius": "999px",
      "--shadow": "0 18px 38px rgba(101, 126, 72, 0.15)",
      "--accent-pattern": "radial-gradient(ellipse at 12% 14%, rgba(130,164,91,.18) 0 26px, transparent 27px), radial-gradient(ellipse at 28% 8%, rgba(235,200,108,.2) 0 18px, transparent 19px)",
    },
    backgrounds: [
      ["#f4fae9", "#fffef8", "#eaf4dc"],
      ["#f8f7e9", "#fffffb", "#e9f1d5"],
    ],
  },
  melody: {
    name: "美乐蒂甜粉",
    vars: {
      "--ink": "#55364a",
      "--muted": "#876878",
      "--line": "#f3cfdd",
      "--panel": "#fffafd",
      "--green": "#e78aae",
      "--green-soft": "#ffe7f1",
      "--coral": "#df7284",
      "--yellow": "#f6cf75",
      "--blue": "#a7c9eb",
      "--card-bg": "rgba(255, 250, 253, 0.92)",
      "--soft-panel": "#fff2f7",
      "--radius": "22px",
      "--button-radius": "999px",
      "--shadow": "0 18px 42px rgba(222, 119, 158, 0.16)",
      "--accent-pattern": "radial-gradient(circle at 13% 13%, rgba(231,138,174,.18) 0 20px, transparent 21px), radial-gradient(circle at 24% 18%, rgba(255,255,255,.9) 0 12px, transparent 13px)",
    },
    backgrounds: [
      ["#fff1f7", "#fffdfd", "#fde8f0"],
      ["#fff6fa", "#ffffff", "#f9e8f1"],
    ],
  },
  kuromi: {
    name: "库洛米淡紫",
    vars: {
      "--ink": "#42364f",
      "--muted": "#746984",
      "--line": "#ddd2ee",
      "--panel": "#fffaff",
      "--green": "#8d72c7",
      "--green-soft": "#f0e9ff",
      "--coral": "#d66d97",
      "--yellow": "#e8c56d",
      "--blue": "#8ea9d8",
      "--card-bg": "rgba(255, 250, 255, 0.9)",
      "--soft-panel": "#f8f3ff",
      "--radius": "12px",
      "--button-radius": "12px",
      "--shadow": "0 18px 42px rgba(126, 101, 177, 0.16)",
      "--accent-pattern": "linear-gradient(135deg, rgba(141,114,199,.12) 0 10px, transparent 10px 24px), radial-gradient(circle at 20% 12%, rgba(214,109,151,.18) 0 12px, transparent 13px)",
    },
    backgrounds: [
      ["#f6f0ff", "#fffaff", "#ece6f8"],
      ["#faf3ff", "#ffffff", "#eee7fa"],
    ],
  },
  chiikawa: {
    name: "Chiikawa 软彩",
    vars: {
      "--ink": "#39455a",
      "--muted": "#6d7890",
      "--line": "#dbe4f4",
      "--panel": "#ffffff",
      "--green": "#76a9d8",
      "--green-soft": "#eaf4ff",
      "--coral": "#ee928d",
      "--yellow": "#f3d178",
      "--blue": "#9ac2e7",
      "--card-bg": "rgba(255, 255, 255, 0.9)",
      "--soft-panel": "#f7fbff",
      "--radius": "18px",
      "--button-radius": "18px",
      "--shadow": "0 18px 42px rgba(116, 148, 190, 0.15)",
      "--accent-pattern": "radial-gradient(circle at 11% 12%, rgba(243,209,120,.25) 0 14px, transparent 15px), radial-gradient(circle at 22% 18%, rgba(238,146,141,.2) 0 10px, transparent 11px), radial-gradient(circle at 30% 9%, rgba(154,194,231,.2) 0 12px, transparent 13px)",
    },
    backgrounds: [
      ["#f1f8ff", "#fffdf9", "#edf4ff"],
      ["#fff7f3", "#ffffff", "#edf7ff"],
    ],
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
  const fallback = {
    settings: { startWeight: "", targetWeight: "", dailyGoal: 1600 },
    quickFoods: defaultQuickFoods,
    days: {},
  };

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
      entries.forEach((entry) => {
        if (!entry.id) entry.id = makeId();
      });
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
  return String(url || "")
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/rest\/v1$/i, "")
    .replace(/\/auth\/v1$/i, "");
}

function setCloudStatus(text, tone = "") {
  const node = $("#cloudStatus");
  if (!node) return;
  node.textContent = text;
  node.dataset.tone = tone;
}

function setAuthStatus(text, tone = "") {
  const node = $("#authStatus");
  if (!node) return;
  node.textContent = text;
  node.dataset.tone = tone;
}

function readableCloudError(error) {
  if (!error) return "未知原因";
  return error.message || error.details || error.hint || String(error);
}

function initCloud() {
  const config = getCloudConfig();
  const supabaseUrl = normalizeSupabaseUrl(config.url);
  const ready = Boolean(supabaseUrl && config.anonKey && window.supabase);
  if (!ready) {
    setCloudStatus("云端未配置，当前保存在本机", "muted");
    return false;
  }

  cloudClient = window.supabase.createClient(supabaseUrl, config.anonKey.trim());
  setCloudStatus("请先登录账号", "muted");
  return true;
}

function setSignedIn(user) {
  currentUser = user;
  $("#authScreen").classList.toggle("hidden", Boolean(user));
  setCloudStatus(user ? `已登录：${user.email}` : "请先登录账号", user ? "ok" : "muted");
}

async function checkAuthSession() {
  if (!cloudClient) return;
  const { data } = await cloudClient.auth.getSession();
  const user = data?.session?.user || null;
  setSignedIn(user);
  if (user) loadCloudState();
}

async function signIn(email, password) {
  setAuthStatus("正在登录...", "muted");
  const { data, error } = await cloudClient.auth.signInWithPassword({ email, password });
  if (error) {
    setAuthStatus(`登录失败：${readableCloudError(error)}`, "error");
    return;
  }
  setAuthStatus("登录成功", "ok");
  setSignedIn(data.user);
  loadCloudState();
}

async function signUp(email, password) {
  setAuthStatus("正在注册...", "muted");
  const { data, error } = await cloudClient.auth.signUp({ email, password });
  if (error) {
    setAuthStatus(`注册失败：${readableCloudError(error)}`, "error");
    return;
  }
  setAuthStatus(data.session ? "注册成功" : "注册成功，请检查邮箱确认邮件", "ok");
  if (data.user) {
    setSignedIn(data.user);
    loadCloudState();
  }
}

async function signOut() {
  if (!cloudClient) return;
  await cloudClient.auth.signOut();
  currentUser = null;
  setSignedIn(null);
}

async function loadCloudState() {
  if (!cloudClient || !currentUser || isLoadingCloud) return;
  isLoadingCloud = true;

  const config = getCloudConfig();
  const { data, error } = await cloudClient
    .from(config.table || "health_diary")
    .select("data")
    .eq("user_id", currentUser.id)
    .maybeSingle();

  isLoadingCloud = false;

  if (error) {
    setCloudStatus(`云端连接失败：${readableCloudError(error)}`, "error");
    return;
  }

  if (data?.data) {
    state = normalizeState(data.data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setCloudStatus("已从云端同步", "ok");
    render();
  } else {
    setCloudStatus("云端已连接，正在上传本机数据", "ok");
    saveCloudState();
  }
}

function scheduleCloudSave() {
  if (!cloudClient || !currentUser || isLoadingCloud) return;
  clearTimeout(cloudSaveTimer);
  cloudSaveTimer = setTimeout(saveCloudState, 700);
}

async function saveCloudState() {
  if (!cloudClient || !currentUser) return;
  const config = getCloudConfig();
  const { error } = await cloudClient
    .from(config.table || "health_diary")
    .upsert({
      user_id: currentUser.id,
      data: state,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

  setCloudStatus(error ? `云端保存失败：${readableCloudError(error)}` : "已保存到云端", error ? "error" : "ok");
}

function applyTheme(themeId = currentTheme, rotateBackground = true) {
  currentTheme = uiThemes[themeId] ? themeId : "dimoo";
  const theme = uiThemes[currentTheme];
  document.body.dataset.theme = currentTheme;
  Object.entries(theme.vars).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });

  if (rotateBackground) {
    applyThemeBackground(theme);
  }

  localStorage.setItem(UI_THEME_KEY, currentTheme);
}

function applyThemeBackground(theme) {
  const bgStorageKey = `${BG_KEY}-${currentTheme}`;
  const lastIndex = Number(localStorage.getItem(bgStorageKey));
  let nextIndex = Math.floor(Math.random() * theme.backgrounds.length);
  if (theme.backgrounds.length > 1 && nextIndex === lastIndex) {
    nextIndex = (nextIndex + 1) % theme.backgrounds.length;
  }

  const [top, middle, bottom] = theme.backgrounds[nextIndex];
  document.documentElement.style.setProperty("--bg-top", top);
  document.documentElement.style.setProperty("--bg-mid", middle);
  document.documentElement.style.setProperty("--bg-bottom", bottom);
  localStorage.setItem(bgStorageKey, String(nextIndex));
}

function renderThemeOptions() {
  const select = $("#themeSelect");
  select.innerHTML = Object.entries(uiThemes)
    .map(([id, theme]) => `<option value="${id}">${theme.name}</option>`)
    .join("");
  select.value = currentTheme;
}

function emptyDay() {
  return {
    weight: "",
    water: "",
    sleep: "",
    exercise: 0,
    meals: { breakfast: [], lunch: [], dinner: [], snack: [] },
  };
}

function getDay(date = activeDate) {
  if (!state.days[date]) state.days[date] = emptyDay();
  return state.days[date];
}

function makeId() {
  return crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function dayTotal(day) {
  return Object.values(day.meals).flat().reduce((sum, entry) => sum + toNumber(entry.calories), 0);
}

function mealTotal(day, meal) {
  return day.meals[meal].reduce((sum, entry) => sum + toNumber(entry.calories), 0);
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shiftDate(date, amount) {
  const next = new Date(date + "T00:00:00");
  next.setDate(next.getDate() + amount);
  return formatDate(next);
}

function render() {
  const day = getDay();
  $("#activeDate").value = activeDate;
  $("#dailyWeight").value = day.weight;
  $("#waterCups").value = day.water;
  $("#sleepHours").value = day.sleep;
  $("#exerciseCalories").value = day.exercise || "";
  $("#startWeight").value = state.settings.startWeight;
  $("#targetWeight").value = state.settings.targetWeight;
  $("#dailyGoal").value = state.settings.dailyGoal;

  renderSummary(day);
  renderQuickFoods();
  renderMeals(day);
  renderCalendar();
  renderWeekBars();
  renderTips(day);
  saveState();
}

function renderSummary(day) {
  const total = dayTotal(day);
  const goal = toNumber(state.settings.dailyGoal);
  const exercise = toNumber(day.exercise);
  const remaining = goal + exercise - total;
  const latestWeight = findLatestWeight();

  $("#totalCalories").textContent = total;
  $("#remainingCalories").textContent = remaining;
  $("#burnedCalories").textContent = exercise;
  $("#currentWeightText").textContent = latestWeight || "--";
  $("#calorieHint").textContent = goal ? `目标 ${goal} 千卡，${remaining >= 0 ? "还有余量" : "今天已超出"}` : "设置目标后会显示剩余热量";
  $("#calorieMeter").style.width = `${Math.min(100, goal ? (total / goal) * 100 : 0)}%`;
  $("#calorieMeter").style.background = remaining < 0 ? "var(--coral)" : "var(--green)";

  const start = toNumber(state.settings.startWeight);
  const target = toNumber(state.settings.targetWeight);
  if (start && target) {
    const current = toNumber(latestWeight || start);
    const planned = Math.abs(start - target);
    const done = Math.max(0, Math.abs(start - current));
    const percent = planned ? Math.min(100, Math.round((done / planned) * 100)) : 0;
    $("#goalProgress").textContent = `目标完成 ${percent}%`;
    $("#goalDetail").textContent = `从 ${start} kg 到 ${target} kg，当前约 ${current || start} kg。`;
  } else {
    $("#goalProgress").textContent = "先设置目标";
    $("#goalDetail").textContent = "建议温和减重，每周约 0.25-0.75 kg。";
  }
}

function renderMeals(day) {
  const list = $("#mealList");
  list.innerHTML = "";

  Object.entries(mealNames).forEach(([key, label]) => {
    const node = $("#mealTemplate").content.firstElementChild.cloneNode(true);
    node.querySelector("h3").textContent = label;
    node.querySelector("span").textContent = `${mealTotal(day, key)} 千卡`;
    const entries = node.querySelector(".entries");

    if (!day.meals[key].length) {
      entries.innerHTML = `<p class="empty">还没有记录</p>`;
    } else {
      day.meals[key].forEach((entry) => {
        const row = document.createElement("div");
        row.className = "entry";
        row.innerHTML = `
          <span>${escapeHtml(entry.name)}</span>
          <b>${entry.calories} 千卡</b>
          <div class="mini-actions">
            <button type="button" data-action="edit">改</button>
            <button type="button" data-action="delete">删</button>
          </div>
        `;
        row.querySelector('[data-action="edit"]').addEventListener("click", () => startEditEntry(key, entry.id));
        row.querySelector('[data-action="delete"]').addEventListener("click", () => deleteEntry(key, entry.id));
        entries.appendChild(row);
      });
    }
    list.appendChild(node);
  });
}

function renderQuickFoods() {
  const wrap = $("#quickFoods");
  wrap.innerHTML = "";

  const keyword = quickSearchText.trim().toLowerCase();
  if (!keyword) {
    wrap.innerHTML = `<p class="empty">输入食物名称后，会显示匹配的快捷项。</p>`;
    return;
  }

  const results = state.quickFoods
    .filter((food) => food.name.toLowerCase().includes(keyword))
    .slice(0, 8);

  if (!results.length) {
    wrap.innerHTML = `<p class="empty">没有找到匹配项。手动添加后，下次就能搜到。</p>`;
    return;
  }

  results.forEach((food) => {
    const item = document.createElement("div");
    item.className = "quick-food";
    item.innerHTML = `
      <button class="quick-add" type="button">
        <strong>${escapeHtml(food.name)}</strong>
        <span>${food.calories} 千卡 · ${mealNames[food.meal]}</span>
      </button>
      <div class="mini-actions">
        <button type="button" data-action="edit">改</button>
        <button type="button" data-action="delete">删</button>
      </div>
    `;
    item.querySelector(".quick-add").addEventListener("click", () => addFood(food.meal, food.name, food.calories, false));
    item.querySelector('[data-action="edit"]').addEventListener("click", () => startEditQuick(food.id));
    item.querySelector('[data-action="delete"]').addEventListener("click", () => deleteQuickFood(food.id));
    wrap.appendChild(item);
  });
}

function renderCalendar() {
  const calendar = $("#calendar");
  calendar.innerHTML = "";
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  $("#monthLabel").textContent = `${year} 年 ${month + 1} 月`;

  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - startOffset);

  for (let i = 0; i < 42; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const key = formatDate(date);
    const day = state.days[key];
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = `day${date.getMonth() !== month ? " other" : ""}${key === activeDate ? " active" : ""}`;
    const total = day ? dayTotal(day) : 0;
    const mealCount = day ? Object.values(day.meals).flat().length : 0;
    cell.innerHTML = `
      <strong>${date.getDate()}</strong>
      <small>${day?.weight ? `体重 ${day.weight}kg` : "未记体重"}</small>
      <small class="${total ? "ok" : ""}">${total ? `${total} 千卡` : "未记饮食"}</small>
      <small>${mealCount ? `${mealCount} 条记录` : ""}</small>
    `;
    cell.addEventListener("click", () => {
      activeDate = key;
      visibleMonth = new Date(key + "T00:00:00");
      render();
    });
    calendar.appendChild(cell);
  }
}

function renderWeekBars() {
  const bars = $("#weekBars");
  bars.innerHTML = "";
  const dates = Array.from({ length: 7 }, (_, index) => shiftDate(activeDate, index - 6));
  const max = Math.max(1, ...dates.map((date) => dayTotal(state.days[date] || emptyDay())));

  dates.forEach((date) => {
    const total = dayTotal(state.days[date] || emptyDay());
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.innerHTML = `<i style="height:${Math.max(8, (total / max) * 150)}px"></i><span>${date.slice(5)}</span><b>${total}</b>`;
    bars.appendChild(bar);
  });
}

function renderTips(day) {
  const tips = [];
  const total = dayTotal(day);
  const goal = toNumber(state.settings.dailyGoal);
  if (!day.weight) tips.push("今天还没有记录体重，早晨空腹记录会更稳定。");
  if (goal && total > goal) tips.push("今天摄入已经超过目标，可以用轻运动或减少夜宵来平衡。");
  if (goal && total < goal * 0.75) tips.push("摄入明显偏低时，优先保证蛋白质和蔬菜。");
  if (!day.meals.breakfast.length) tips.push("早餐还空着，补上后一天会更完整。");
  if (toNumber(day.water) < 6) tips.push("饮水记录偏少，可以给自己安排几次固定喝水时间。");
  if (!tips.length) tips.push("今天记录很完整，继续保持这种轻松节奏。");
  $("#tips").innerHTML = tips.map((tip) => `<li>${tip}</li>`).join("");
}

function addFood(meal, name, calories, remember = true) {
  const finalName = name || `${mealNames[meal]}记录`;
  if (calories <= 0) return;
  getDay().meals[meal].push({ id: makeId(), name: finalName, calories });
  if (remember && name) rememberQuickFood(name, calories, meal);
  render();
}

function rememberQuickFood(name, calories, meal) {
  const existing = state.quickFoods.find((food) => food.name === name);
  if (existing) {
    existing.calories = calories;
    existing.meal = meal;
    return;
  }
  state.quickFoods.unshift({ id: makeId(), name, calories, meal });
}

function startEditEntry(meal, id) {
  const entry = getDay().meals[meal].find((item) => item.id === id);
  if (!entry) return;
  editingEntry = { meal, id };
  editingQuick = null;
  $("#mealType").value = meal;
  $("#foodName").value = entry.name;
  $("#foodCalories").value = entry.calories;
  $("#entrySubmit").textContent = "保存";
  $("#entryCancel").classList.remove("hidden");
  $("#foodName").focus();
}

function deleteEntry(meal, id) {
  getDay().meals[meal] = getDay().meals[meal].filter((entry) => entry.id !== id);
  cancelEdit();
  render();
}

function startEditQuick(id) {
  const food = state.quickFoods.find((item) => item.id === id);
  if (!food) return;
  editingQuick = id;
  editingEntry = null;
  quickSearchText = food.name;
  $("#quickSearch").value = quickSearchText;
  $("#mealType").value = food.meal;
  $("#foodName").value = food.name;
  $("#foodCalories").value = food.calories;
  $("#entrySubmit").textContent = "保存快捷";
  $("#entryCancel").classList.remove("hidden");
  $("#foodName").focus();
}

function deleteQuickFood(id) {
  state.quickFoods = state.quickFoods.filter((food) => food.id !== id);
  cancelEdit();
  render();
}

function submitEntryForm(event) {
  event.preventDefault();
  const meal = $("#mealType").value;
  const typedName = $("#foodName").value.trim();
  const name = typedName || `${mealNames[meal]}记录`;
  const calories = toNumber($("#foodCalories").value);
  if (calories <= 0) return;

  if (editingEntry) {
    const oldMeal = editingEntry.meal;
    const entry = getDay().meals[oldMeal].find((item) => item.id === editingEntry.id);
    if (entry) {
      entry.name = name;
      entry.calories = calories;
      if (meal !== oldMeal) {
        getDay().meals[oldMeal] = getDay().meals[oldMeal].filter((item) => item.id !== editingEntry.id);
        getDay().meals[meal].push(entry);
      }
      if (typedName) rememberQuickFood(name, calories, meal);
    }
  } else if (editingQuick) {
    const food = state.quickFoods.find((item) => item.id === editingQuick);
    if (food) Object.assign(food, { name, calories, meal });
  } else {
    addFood(meal, typedName, calories, true);
  }

  cancelEdit();
  $("#entryForm").reset();
  render();
}

function cancelEdit() {
  editingEntry = null;
  editingQuick = null;
  $("#entrySubmit").textContent = "添加";
  $("#entryCancel").classList.add("hidden");
}

function findLatestWeight() {
  return Object.entries(state.days)
    .filter(([, day]) => day.weight)
    .sort(([a], [b]) => b.localeCompare(a))[0]?.[1].weight;
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[char]));
}

function bindEvents() {
  $("#authForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!cloudClient) {
      setAuthStatus("云端还没配置好，不能登录", "error");
      return;
    }
    signIn($("#authEmail").value.trim(), $("#authPassword").value);
  });

  $("#signupButton").addEventListener("click", () => {
    if (!cloudClient) {
      setAuthStatus("云端还没配置好，不能注册", "error");
      return;
    }
    signUp($("#authEmail").value.trim(), $("#authPassword").value);
  });

  $("#logoutButton").addEventListener("click", signOut);

  $("#themeSelect").addEventListener("change", (event) => {
    applyTheme(event.target.value, true);
  });

  $("#activeDate").addEventListener("change", (event) => {
    activeDate = event.target.value || today();
    visibleMonth = new Date(activeDate + "T00:00:00");
    render();
  });

  $("#prevDay").addEventListener("click", () => {
    activeDate = shiftDate(activeDate, -1);
    visibleMonth = new Date(activeDate + "T00:00:00");
    render();
  });

  $("#nextDay").addEventListener("click", () => {
    activeDate = shiftDate(activeDate, 1);
    visibleMonth = new Date(activeDate + "T00:00:00");
    render();
  });

  $("#prevMonth").addEventListener("click", () => {
    visibleMonth.setMonth(visibleMonth.getMonth() - 1);
    render();
  });

  $("#nextMonth").addEventListener("click", () => {
    visibleMonth.setMonth(visibleMonth.getMonth() + 1);
    render();
  });

  ["dailyWeight", "waterCups", "sleepHours", "exerciseCalories"].forEach((id) => {
    $("#" + id).addEventListener("input", (event) => {
      const day = getDay();
      const key = { dailyWeight: "weight", waterCups: "water", sleepHours: "sleep", exerciseCalories: "exercise" }[id];
      day[key] = event.target.value;
      render();
    });
  });

  ["startWeight", "targetWeight", "dailyGoal"].forEach((id) => {
    $("#" + id).addEventListener("input", (event) => {
      state.settings[id] = event.target.value;
      render();
    });
  });

  $("#entryForm").addEventListener("submit", submitEntryForm);
  $("#quickSearch").addEventListener("input", (event) => {
    quickSearchText = event.target.value;
    renderQuickFoods();
  });
  $("#entryCancel").addEventListener("click", () => {
    cancelEdit();
    $("#entryForm").reset();
  });

  $("#copyYesterday").addEventListener("click", () => {
    const yesterday = state.days[shiftDate(activeDate, -1)];
    if (!yesterday) return;
    const day = getDay();
    day.meals = JSON.parse(JSON.stringify(yesterday.meals));
    Object.keys(day.meals).forEach((meal) => {
      day.meals[meal] = day.meals[meal].map((entry) => ({ ...entry, id: makeId() }));
    });
    render();
  });

  $("#resetDemo").addEventListener("click", () => {
    if (confirm("确定清空所有记录吗？")) {
      state = {
        settings: { startWeight: "", targetWeight: "", dailyGoal: 1600 },
        quickFoods: defaultQuickFoods,
        days: {},
      };
      cancelEdit();
      $("#entryForm").reset();
      render();
    }
  });

  $("#exportData").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `轻卡日记-${today()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  });

  $("#importData").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    state = normalizeState(JSON.parse(await file.text()));
    cancelEdit();
    render();
    event.target.value = "";
  });
}

applyTheme(currentTheme, true);
renderThemeOptions();
bindEvents();
render();
if (initCloud()) {
  checkAuthSession();
}
