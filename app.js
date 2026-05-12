/* 轻卡日记 - 修复版：主题、日期、日历、最近 7 天趋势 */
const STORAGE_KEY = "light-calorie-diary-v2";
const UI_THEME_KEY = "light-calorie-diary-theme";

const mealNames = { breakfast: "早餐", lunch: "午餐", dinner: "晚餐", snack: "加餐" };
const themes = [
  { id: "dimoo", name: "清新绿" },
  { id: "lineDog", name: "线条小狗" },
  { id: "kuromi", name: "酷洛米" },
  { id: "lulu", name: "露露猪" }
];

const $ = (selector) => document.querySelector(selector);
const pad = (n) => String(n).padStart(2, "0");
const toDateKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const today = () => toDateKey(new Date());

let state = loadState();
let activeDate = today();
let calendarMonth = activeDate.slice(0, 7);
let currentTheme = localStorage.getItem(UI_THEME_KEY) || "dimoo";
let cloudClient = null;
let currentUser = null;
let saveTimer = null;

function formatAccountToEmail(input) {
  const val = input.trim();
  return val.includes("@") ? val : `${val}@diary.local`;
}

function setStatus(selector, message, tone = "muted") {
  const el = $(selector);
  if (!el) return;
  el.textContent = message;
  el.dataset.tone = tone;
}

function setAuthStatus(message, tone) {
  setStatus("#authStatus", message, tone);
}

function setCloudStatus(message, tone) {
  setStatus("#cloudStatus", message, tone);
}

function initCloud() {
  const config = window.SUPABASE_CONFIG || {};
  if (!window.supabase || !config.url || !config.anonKey) {
    setCloudStatus("云端配置缺失，当前使用本地保存", "error");
    return false;
  }
  cloudClient = supabase.createClient(config.url, config.anonKey);
  return true;
}

async function signIn(account, password) {
  if (!cloudClient) return setAuthStatus("云端未配置，无法登录", "error");
  setAuthStatus("正在登录...", "muted");
  const { data, error } = await cloudClient.auth.signInWithPassword({
    email: formatAccountToEmail(account),
    password
  });
  if (error) return setAuthStatus(`登录失败: ${error.message}`, "error");
  setSignedIn(data.user);
  await loadCloudState();
}

async function signUp(account, password) {
  if (!cloudClient) return setAuthStatus("云端未配置，无法注册", "error");
  setAuthStatus("正在创建账号...", "muted");
  const { data, error } = await cloudClient.auth.signUp({
    email: formatAccountToEmail(account),
    password
  });
  if (error) return setAuthStatus(`注册失败: ${error.message}`, "error");
  if (data.session) {
    setAuthStatus("注册成功并已自动登录", "ok");
    setSignedIn(data.user);
    await loadCloudState();
  } else {
    setAuthStatus("账号创建成功，请点击登录", "ok");
  }
}

function setSignedIn(user) {
  currentUser = user;
  $("#authScreen")?.classList.toggle("hidden", Boolean(user));
  $("#appRoot")?.classList.toggle("locked", !user);
  setCloudStatus(user ? `同步中: ${user.email.split("@")[0]}` : "请先登录", user ? "ok" : "muted");
}

async function loadCloudState() {
  if (!cloudClient || !currentUser) return;
  const { data, error } = await cloudClient
    .from("health_diary")
    .select("data")
    .eq("user_id", currentUser.id)
    .maybeSingle();

  if (error) {
    setCloudStatus(`云端读取失败: ${error.message}`, "error");
    return;
  }
  if (data?.data) {
    state = normalizeState(data.data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  render();
  setCloudStatus("云端数据已同步", "ok");
}

function scheduleSaveCloudState() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveCloudState, 450);
}

async function saveCloudState() {
  if (!cloudClient || !currentUser) return;
  const { error } = await cloudClient.from("health_diary").upsert({
    user_id: currentUser.id,
    data: state,
    updated_at: new Date().toISOString()
  });
  setCloudStatus(error ? `保存失败: ${error.message}` : "已自动保存至云端", error ? "error" : "ok");
}

function normalizeState(input) {
  const next = input && typeof input === "object" ? input : {};
  next.settings = { dailyGoal: 1600, targetWeight: "", ...(next.settings || {}) };
  next.days = next.days || {};
  Object.values(next.days).forEach((day) => {
    day.weight ??= "";
    day.water ??= "";
    day.sleep ??= "";
    day.exercise ??= 0;
    day.meals = { breakfast: [], lunch: [], dinner: [], snack: [], ...(day.meals || {}) };
  });
  return next;
}

function loadState() {
  try {
    return normalizeState(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"));
  } catch {
    return normalizeState({});
  }
}

function saveLocal() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  scheduleSaveCloudState();
}

function getDay(dateKey = activeDate) {
  if (!state.days[dateKey]) {
    state.days[dateKey] = {
      weight: "",
      water: "",
      sleep: "",
      exercise: 0,
      meals: { breakfast: [], lunch: [], dinner: [], snack: [] }
    };
  }
  return state.days[dateKey];
}

function dayTotal(day) {
  return Object.values(day.meals || {}).flat().reduce((sum, item) => sum + Number(item.calories || 0), 0);
}

function addDays(dateKey, delta) {
  const d = new Date(`${dateKey}T00:00:00`);
  d.setDate(d.getDate() + delta);
  return toDateKey(d);
}

function applyTheme(themeId) {
  currentTheme = themeId;
  document.body.dataset.theme = themeId;
  localStorage.setItem(UI_THEME_KEY, themeId);
}

function initThemePicker() {
  const select = $("#themeSelect");
  if (!select) return;
  select.innerHTML = themes.map((theme) => `<option value="${theme.id}">${theme.name}</option>`).join("");
  select.value = themes.some((theme) => theme.id === currentTheme) ? currentTheme : "dimoo";
  applyTheme(select.value);
}

function render() {
  const day = getDay();

  $("#activeDate").value = activeDate;
  $("#dailyWeight").value = day.weight ?? "";
  $("#waterCups").value = day.water ?? "";
  $("#sleepHours").value = day.sleep ?? "";
  $("#exerciseCalories").value = day.exercise ?? 0;
  $("#dailyGoal").value = state.settings.dailyGoal ?? "";
  $("#targetWeight").value = state.settings.targetWeight ?? "";

  const total = dayTotal(day);
  const goal = Number(state.settings.dailyGoal) || 0;
  const exercise = Number(day.exercise) || 0;
  const remaining = goal - total + exercise;
  const percent = goal ? Math.min(100, Math.round((total / goal) * 100)) : 0;

  $("#totalCalories").textContent = total;
  $("#remainingCalories").textContent = remaining;
  $("#burnedCalories").textContent = exercise;
  $("#currentWeightText").textContent = day.weight || "--";
  $("#calorieMeter").style.width = `${percent}%`;
  $("#calorieHint").textContent = goal ? `已使用 ${percent}% 的每日目标` : "请先设置每日目标";

  renderGoal(day);
  renderMeals(day);
  renderCalendar();
  renderTrend();
  renderTips(day, total, remaining);
  saveLocal();
}

function renderGoal(day) {
  const target = Number(state.settings.targetWeight);
  const weight = Number(day.weight);
  if (!target || !weight) {
    $("#goalProgress").textContent = "--";
    $("#goalDetail").textContent = "填写目标体重和当前体重后显示进度";
    $("#weightHint").textContent = "记录体重以查看趋势";
    return;
  }
  const diff = (weight - target).toFixed(1);
  $("#goalProgress").textContent = diff > 0 ? `距目标 ${diff} kg` : "已达到目标";
  $("#goalDetail").textContent = `目标 ${target} kg，当前 ${weight} kg`;
  $("#weightHint").textContent = diff > 0 ? `还差 ${diff} kg` : "继续保持";
}

function renderMeals(day) {
  const list = $("#mealList");
  list.innerHTML = "";
  Object.entries(mealNames).forEach(([key, label]) => {
    const node = $("#mealTemplate").content.firstElementChild.cloneNode(true);
    const entries = day.meals[key] || [];
    node.querySelector("h3").textContent = label;
    node.querySelector(".meal-title span").textContent = `${entries.reduce((s, e) => s + Number(e.calories || 0), 0)} 千卡`;
    const entriesDiv = node.querySelector(".entries");

    if (!entries.length) {
      entriesDiv.innerHTML = `<p class="empty">暂无记录</p>`;
    } else {
      entries.forEach((item, index) => {
        const row = document.createElement("div");
        row.className = "entry";
        row.innerHTML = `
          <span>${item.name || "未命名食物"}</span>
          <b>${Number(item.calories || 0)} 千卡</b>
          <span class="mini-actions">
            <button type="button" data-action="edit" data-meal="${key}" data-index="${index}">改</button>
            <button type="button" data-action="delete" data-meal="${key}" data-index="${index}">删</button>
          </span>`;
        entriesDiv.appendChild(row);
      });
    }
    list.appendChild(node);
  });
}

function renderCalendar() {
  const root = $("#calendar");
  if (!root) return;
  const [year, month] = calendarMonth.split("-").map(Number);
  const first = new Date(year, month - 1, 1);
  const start = new Date(first);
  start.setDate(first.getDate() - ((first.getDay() + 6) % 7));

  root.innerHTML = "";
  for (let i = 0; i < 42; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const key = toDateKey(date);
    const day = getDay(key);
    const total = dayTotal(day);

    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = `day${date.getMonth() !== month - 1 ? " other" : ""}${key === activeDate ? " active" : ""}`;
    cell.dataset.date = key;
    cell.innerHTML = `
      <strong>${date.getDate()}</strong>
      ${day.weight ? `<small>体重 ${day.weight}kg</small>` : ""}
      ${total ? `<small class="ok">${total} 千卡</small>` : "<small>未记录</small>"}`;
    root.appendChild(cell);
  }
}

function renderTrend() {
  const root = $("#trendBars");
  if (!root) return;
  const keys = Array.from({ length: 7 }, (_, i) => addDays(activeDate, i - 6));
  const values = keys.map((key) => dayTotal(getDay(key)));
  const max = Math.max(100, ...values);

  root.innerHTML = keys.map((key, index) => {
    const height = Math.max(8, Math.round((values[index] / max) * 160));
    return `
      <div class="bar">
        <i style="height:${height}px"></i>
        <span>${key.slice(5).replace("-", "/")}</span>
        <b>${values[index]}</b>
      </div>`;
  }).join("");
}

function renderTips(day, total, remaining) {
  const tips = [];
  if (!Number(state.settings.dailyGoal)) tips.push("先设置每日热量目标，统计会更准确。");
  if (!day.weight) tips.push("今天还没记录体重。");
  if (!Number(day.water)) tips.push("今天还没记录饮水。");
  if (remaining < 0) tips.push(`今日已超出 ${Math.abs(remaining)} 千卡，晚餐可以清淡一些。`);
  if (total === 0) tips.push("今天还没有饮食记录。");
  if (!tips.length) tips.push("记录很完整，继续保持。");

  $("#tips").innerHTML = tips.map((tip) => `<li>${tip}</li>`).join("");
}

function bindEvents() {
  $("#authForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    signIn($("#authEmail").value, $("#authPassword").value);
  });

  $("#signupButton")?.addEventListener("click", () => {
    signUp($("#authEmail").value, $("#authPassword").value);
  });

  $("#logoutButton")?.addEventListener("click", async () => {
    if (cloudClient) await cloudClient.auth.signOut();
    setSignedIn(null);
  });

  $("#themeSelect")?.addEventListener("change", (e) => {
    applyTheme(e.target.value);
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

  $("#activeDate")?.addEventListener("change", (e) => {
    if (!e.target.value) return;
    activeDate = e.target.value;
    calendarMonth = activeDate.slice(0, 7);
    render();
  });

  $("#prevMonth")?.addEventListener("click", () => {
    const date = new Date(`${calendarMonth}-01T00:00:00`);
    date.setMonth(date.getMonth() - 1);
    calendarMonth = toDateKey(date).slice(0, 7);
    render();
  });

  $("#nextMonth")?.addEventListener("click", () => {
    const date = new Date(`${calendarMonth}-01T00:00:00`);
    date.setMonth(date.getMonth() + 1);
    calendarMonth = toDateKey(date).slice(0, 7);
    render();
  });

  $("#calendar")?.addEventListener("click", (e) => {
    const cell = e.target.closest(".day");
    if (!cell) return;
    activeDate = cell.dataset.date;
    calendarMonth = activeDate.slice(0, 7);
    render();
  });

  $("#entryForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const meal = $("#mealType").value;
    const calories = Number($("#foodCalories").value);
    if (!calories) return;
    getDay().meals[meal].push({
      name: $("#foodName").value.trim() || "未命名食物",
      calories
    });
    e.target.reset();
    render();
  });

  $("#mealList")?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const meal = btn.dataset.meal;
    const index = Number(btn.dataset.index);
    const items = getDay().meals[meal];

    if (btn.dataset.action === "delete") {
      items.splice(index, 1);
    } else {
      const item = items[index];
      $("#mealType").value = meal;
      $("#foodName").value = item.name;
      $("#foodCalories").value = item.calories;
      items.splice(index, 1);
      $("#foodName").focus();
    }
    render();
  });

  $("#copyYesterday")?.addEventListener("click", () => {
    const yesterday = state.days[addDays(activeDate, -1)];
    if (!yesterday) return;
    getDay().meals = JSON.parse(JSON.stringify(yesterday.meals));
    render();
  });

  ["dailyWeight", "waterCups", "sleepHours", "exerciseCalories"].forEach((id) => {
    $(`#${id}`)?.addEventListener("input", (e) => {
      const day = getDay();
      const map = { dailyWeight: "weight", waterCups: "water", sleepHours: "sleep", exerciseCalories: "exercise" };
      day[map[id]] = e.target.value;
      render();
    });
  });

  ["dailyGoal", "targetWeight"].forEach((id) => {
    $(`#${id}`)?.addEventListener("input", (e) => {
      state.settings[id] = e.target.value;
      render();
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  initThemePicker();
  bindEvents();

  if (initCloud()) {
    const { data } = await cloudClient.auth.getSession();
    if (data.session) {
      setSignedIn(data.session.user);
      await loadCloudState();
    }
  }

  render();
});
