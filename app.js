const STORAGE_KEY = "light-calorie-diary-v2";
const UI_THEME_KEY = "light-calorie-diary-theme";

const mealNames = { breakfast: "早餐", lunch: "午餐", dinner: "晚餐", snack: "加餐" };
const themes = {
  dimoo: "清新绿",
  lineDog: "线条小狗",
  kuromi: "酷洛米",
  lulu: "Lulu",
  cream: "奶油黄",
  mint: "薄荷绿",
  strawberry: "草莓粉",
  sakura: "樱花粉",
  lavender: "薰衣草",
  sky: "天空蓝",
  ocean: "海盐蓝",
  peach: "蜜桃橙",
  matcha: "抹茶",
  mocha: "摩卡棕",
  forest: "森林绿",
  panda: "熊猫黑白",
  grape: "葡萄紫",
  sunset: "日落橘"
};

const $ = (selector) => document.querySelector(selector);
const today = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

let state = loadState();
let activeDate = today();
let calendarMonth = activeDate.slice(0, 7);
let currentTheme = localStorage.getItem(UI_THEME_KEY) || "dimoo";
let cloudClient = null;
let currentUser = null;
let isRendering = false;

function safeText(selector, text) {
  const el = $(selector);
  if (el) el.textContent = text;
}

function safeValue(selector, value) {
  const el = $(selector);
  if (!el) return;

  // 正在输入时不要强行回填，避免小数点被浏览器/渲染流程吞掉
  if (document.activeElement === el) return;

  el.value = value ?? "";
}

function toNumber(value, fallback = 0) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeDecimalValue(value) {
  return String(value ?? "")
    .replace(/[，。]/g, ".")
    .replace(/[^\d.]/g, "")
    .replace(/\.{2,}/g, ".")
    .replace(".", "__DOT__")
    .replace(/\./g, "")
    .replace("__DOT__", ".");
}

function bindDecimalInput(selector) {
  const input = $(selector);
  if (!input) return;

  input.setAttribute("inputmode", "decimal");
  input.setAttribute("autocomplete", "off");

  input.addEventListener("input", (e) => {
    const original = e.target.value;
    const fixed = normalizeDecimalValue(original);

    if (original !== fixed) {
      const cursor = e.target.selectionStart ?? fixed.length;
      e.target.value = fixed;
      const nextCursor = Math.min(cursor, fixed.length);
      try {
        e.target.setSelectionRange(nextCursor, nextCursor);
      } catch {}
    }
  });
}

function setAuthStatus(message, type = "muted") {
  const el = $("#authStatus");
  if (!el) return;
  el.textContent = message;
  el.dataset.status = type;
}

function setCloudStatus(message, type = "muted") {
  const el = $("#cloudStatus");
  if (!el) return;
  el.textContent = message;
  el.dataset.status = type;
}

function formatAccountToEmail(input) {
  const val = String(input || "").trim();
  return val.includes("@") ? val : `${val}@diary.local`;
}

function initCloud() {
  const config = window.SUPABASE_CONFIG || {};
  if (!window.supabase || !config.url || !config.anonKey) {
    setCloudStatus("本地模式：未配置云端", "muted");
    setAuthStatus("本地模式可直接使用，云端同步未配置", "muted");
    setSignedIn({ email: "local@diary.local", id: "local" }, true);
    return false;
  }
  cloudClient = window.supabase.createClient(config.url, config.anonKey);
  return true;
}

async function signIn(account, password) {
  if (!cloudClient) {
    setSignedIn({ email: formatAccountToEmail(account || "local"), id: "local" }, true);
    return;
  }
  setAuthStatus("正在登录...", "muted");
  const { data, error } = await cloudClient.auth.signInWithPassword({ email: formatAccountToEmail(account), password });
  if (error) return setAuthStatus(`登录失败: ${error.message}`, "error");
  setSignedIn(data.user);
  await loadCloudState();
}

async function signUp(account, password) {
  if (!cloudClient) {
    setSignedIn({ email: formatAccountToEmail(account || "local"), id: "local" }, true);
    return;
  }
  setAuthStatus("正在创建账号...", "muted");
  const { data, error } = await cloudClient.auth.signUp({ email: formatAccountToEmail(account), password });
  if (error) return setAuthStatus(`注册失败: ${error.message}`, "error");
  if (data.session) {
    setAuthStatus("注册成功并已自动登录", "ok");
    setSignedIn(data.user);
    await loadCloudState();
  } else {
    setAuthStatus("账号创建成功，请点击登录", "ok");
  }
}

function setSignedIn(user, localMode = false) {
  currentUser = user;
  $("#authScreen")?.classList.toggle("hidden", Boolean(user));
  $("#appRoot")?.classList.toggle("locked", !user);
  const name = user?.email ? user.email.split("@")[0] : "";
  setCloudStatus(user ? (localMode ? "本地模式" : `同步中：${name}`) : "请先登录", user ? "ok" : "muted");
}

async function loadCloudState() {
  if (!cloudClient || !currentUser || currentUser.id === "local") return;
  const { data } = await cloudClient.from("health_diary").select("data").eq("user_id", currentUser.id).maybeSingle();
  if (data?.data) {
    state = normalizeState(data.data);
    saveLocal();
    render();
    setCloudStatus("云端数据已同步", "ok");
  }
}

async function saveCloudState() {
  if (!cloudClient || !currentUser || currentUser.id === "local" || isRendering) return;
  await cloudClient.from("health_diary").upsert({
    user_id: currentUser.id,
    data: state,
    updated_at: new Date().toISOString()
  });
  setCloudStatus("已自动保存至云端", "ok");
}

function normalizeState(input) {
  const defaults = { settings: { dailyGoal: 1600, targetWeight: "" }, days: {} };
  const next = { ...defaults, ...(input || {}) };
  next.settings = { ...defaults.settings, ...(input?.settings || {}) };
  next.days = input?.days || {};
  Object.values(next.days).forEach((day) => {
    day.weight ??= "";
    day.exercise ??= 0;
    day.water ??= "";
    day.sleep ??= "";
    day.meals ??= {};
    Object.keys(mealNames).forEach((key) => day.meals[key] ??= []);
  });
  return next;
}

function loadState() {
  try {
    return normalizeState(JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"));
  } catch {
    return normalizeState(null);
  }
}

function saveLocal() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getDay(date = activeDate) {
  if (!state.days[date]) {
    state.days[date] = { weight: "", exercise: 0, water: "", sleep: "", meals: { breakfast: [], lunch: [], dinner: [], snack: [] } };
  }
  return state.days[date];
}

function caloriesOf(day) {
  return Object.values(day?.meals || {}).flat().reduce((sum, item) => sum + toNumber(item.calories), 0);
}

function addDays(dateStr, amount) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + amount);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function applyTheme() {
  if (!themes[currentTheme]) currentTheme = "dimoo";
  document.body.dataset.theme = currentTheme;
  const select = $("#themeSelect");
  if (!select) return;
  select.innerHTML = Object.entries(themes)
    .map(([value, label]) => `<option value="${value}">${label}</option>`)
    .join("");
  select.value = currentTheme;
  select.title = `当前主题：${themes[currentTheme]}`;
}

function render() {
  isRendering = true;
  const day = getDay();
  const total = caloriesOf(day);
  const goal = toNumber(state.settings.dailyGoal);
  const exercise = toNumber(day.exercise);
  const remaining = goal - total + exercise;

  safeValue("#activeDate", activeDate);
  safeValue("#dailyWeight", day.weight);
  safeValue("#waterCups", day.water);
  safeValue("#sleepHours", day.sleep);
  safeValue("#dailyGoal", state.settings.dailyGoal);
  safeValue("#targetWeight", state.settings.targetWeight);
  safeValue("#exerciseCalories", day.exercise);

  safeText("#totalCalories", total);
  safeText("#remainingCalories", remaining);
  safeText("#burnedCalories", exercise);
  safeText("#currentWeightText", day.weight || "--");
  safeText("#calorieHint", goal ? `${Math.round((total / goal) * 100)}% / ${goal} 千卡` : "请先设置每日目标");
  safeText("#goalProgress", goal ? `${remaining >= 0 ? "剩余" : "超出"} ${Math.abs(remaining)} 千卡` : "--");
  safeText("#goalDetail", day.weight ? `当前 ${day.weight}kg，目标 ${state.settings.targetWeight || "--"}kg` : "记录体重后可查看趋势");

  const meter = $("#calorieMeter");
  if (meter) meter.style.width = `${Math.min(100, goal ? (total / goal) * 100 : 0)}%`;

  renderMeals(day);
  renderCalendar();
  renderTrend();
  renderTips(total, goal, exercise, day);
  saveLocal();
  isRendering = false;
  saveCloudState();
}

function renderMeals(day) {
  const list = $("#mealList");
  const template = $("#mealTemplate");
  if (!list || !template) return;
  list.innerHTML = "";
  Object.entries(mealNames).forEach(([key, label]) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.querySelector("h3").textContent = label;
    node.querySelector(".meal-title span").textContent = `${day.meals[key].length} 项`;
    const entriesDiv = node.querySelector(".entries");
    if (!day.meals[key].length) {
      entriesDiv.innerHTML = `<p class="empty">暂无记录</p>`;
    } else {
      day.meals[key].forEach((item, index) => {
        const row = document.createElement("div");
        row.className = "entry-row";
        row.innerHTML = `<span>${item.name}</span><b>${toNumber(item.calories)} 千卡</b><button type="button" aria-label="删除">×</button>`;
        row.querySelector("button").addEventListener("click", () => {
          day.meals[key].splice(index, 1);
          render();
        });
        entriesDiv.appendChild(row);
      });
    }
    list.appendChild(node);
  });
}

function renderCalendar() {
  const grid = $("#calendarGrid");
  if (!grid) return;
  grid.innerHTML = "";
  const [year, month] = calendarMonth.split("-").map(Number);
  const first = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const offset = (first.getDay() + 6) % 7;

  for (let i = 0; i < offset; i++) grid.appendChild(document.createElement("span"));

  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${calendarMonth}-${String(d).padStart(2, "0")}`;
    const day = state.days[date];
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = `calendar-day${date === activeDate ? " active" : ""}`;
    const cals = day ? caloriesOf(day) : 0;
    cell.innerHTML = `<strong>${d}</strong><small>${day?.weight ? day.weight + "kg" : ""}</small><em>${cals ? cals + "kcal" : ""}</em>`;
    cell.addEventListener("click", () => {
      activeDate = date;
      calendarMonth = date.slice(0, 7);
      render();
    });
    grid.appendChild(cell);
  }
}

function renderTrend() {
  const chart = $("#trendChart");
  if (!chart) return;
  const dates = Array.from({ length: 7 }, (_, i) => addDays(activeDate, i - 6));
  const values = dates.map((date) => caloriesOf(state.days[date] || { meals: {} }));
  const max = Math.max(1600, ...values);
  chart.innerHTML = dates.map((date, i) => {
    const height = Math.max(4, Math.round((values[i] / max) * 150));
    return `<div class="trend-bar-wrap"><div class="trend-value">${values[i] || ""}</div><div class="trend-bar" style="height:${height}px"></div><span>${date.slice(5).replace("-", "/")}</span></div>`;
  }).join("");
}

function renderTips(total, goal, exercise, day) {
  const tips = $("#tipsList");
  if (!tips) return;
  const list = [];
  if (!total) list.push("今天还没有饮食记录，先添加一餐吧。");
  if (goal && total > goal) list.push("今天摄入已超过目标，可以增加一点轻运动。");
  if (goal && total <= goal) list.push("今日热量还在目标范围内，继续保持。");
  if (!day.weight) list.push("记录体重后，趋势会更准确。");
  if (!toNumber(day.water)) list.push("别忘了记录饮水。");
  if (exercise > 0) list.push(`运动已消耗 ${exercise} 千卡，很棒。`);
  tips.innerHTML = list.map((tip) => `<p>${tip}</p>`).join("");
}

function bindEvents() {
  [
    "#dailyWeight",
    "#waterCups",
    "#sleepHours",
    "#foodCalories",
    "#targetWeight",
    "#dailyGoal",
    "#exerciseCalories"
  ].forEach(bindDecimalInput);

  $("#authForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    signIn($("#authEmail")?.value, $("#authPassword")?.value);
  });

  $("#signupButton")?.addEventListener("click", () => signUp($("#authEmail")?.value, $("#authPassword")?.value));

  $("#logoutButton")?.addEventListener("click", async () => {
    if (cloudClient) await cloudClient.auth.signOut();
    setSignedIn(null);
  });

  $("#entryForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const meal = $("#mealType").value;
    const name = $("#foodName").value.trim() || "未命名食物";
    const calories = toNumber($("#foodCalories").value);
    if (!calories) return;
    getDay().meals[meal].push({ name, calories });
    e.target.reset();
    render();
  });

  $("#activeDate")?.addEventListener("change", (e) => {
    activeDate = e.target.value || today();
    calendarMonth = activeDate.slice(0, 7);
    render();
  });

  $("#prevDay")?.addEventListener("click", () => {
    activeDate = addDays(activeDate, -1);
    calendarMonth = activeDate.slice(0, 7);
    render();
  });

  $("#nextDay")?.addEventListener("click", () => {
    activeDate = addDays(activeDate, 1);
    calendarMonth = activeDate.slice(0, 7);
    render();
  });

  $("#prevMonth")?.addEventListener("click", () => {
    const [y, m] = calendarMonth.split("-").map(Number);
    const d = new Date(y, m - 2, 1);
    calendarMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    render();
  });

  $("#nextMonth")?.addEventListener("click", () => {
    const [y, m] = calendarMonth.split("-").map(Number);
    const d = new Date(y, m, 1);
    calendarMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    render();
  });

  $("#themeSelect")?.addEventListener("change", (e) => {
    currentTheme = e.target.value;
    localStorage.setItem(UI_THEME_KEY, currentTheme);
    applyTheme();
    render();
  });

  ["dailyWeight", "waterCups", "sleepHours", "exerciseCalories"].forEach((id) => {
    $(`#${id}`)?.addEventListener("input", (e) => {
      const day = getDay();
      if (id === "dailyWeight") day.weight = e.target.value;
      if (id === "waterCups") day.water = e.target.value;
      if (id === "sleepHours") day.sleep = e.target.value;
      if (id === "exerciseCalories") day.exercise = e.target.value;
      render();
    });
  });

  $("#dailyGoal")?.addEventListener("input", (e) => {
    state.settings.dailyGoal = e.target.value;
    render();
  });

  $("#targetWeight")?.addEventListener("input", (e) => {
    state.settings.targetWeight = e.target.value;
    render();
  });

  $("#copyYesterday")?.addEventListener("click", () => {
    const source = state.days[addDays(activeDate, -1)];
    if (!source) return;
    const target = getDay();
    target.meals = JSON.parse(JSON.stringify(source.meals));
    render();
  });
}

applyTheme();
bindEvents();
if (initCloud()) {
  cloudClient.auth.getSession().then(({ data }) => {
    if (data.session) {
      setSignedIn(data.session.user);
      loadCloudState();
    } else {
      setSignedIn(null);
    }
  });
}
render();
