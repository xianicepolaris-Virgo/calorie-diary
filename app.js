/* * 核心逻辑：拦截账号输入，绕过邮箱验证系统
 * 开发作者：CodeMaster
 */

const STORAGE_KEY = "light-calorie-diary-v2";
const UI_THEME_KEY = "light-calorie-diary-theme";

// --- 基础配置与数据初始化 ---
const mealNames = { breakfast: "早餐", lunch: "午餐", dinner: "晚餐", snack: "加餐" };
const $ = (selector) => document.querySelector(selector);
const today = () => new Date().toISOString().split('T')[0];

let state = loadState();
let activeDate = today();
let currentTheme = localStorage.getItem(UI_THEME_KEY) || "dimoo";
let cloudClient = null;
let currentUser = null;

// --- 核心：账号转换逻辑 ---
function formatAccountToEmail(input) {
  const val = input.trim();
  // 如果输入已经是邮箱格式，直接返回；否则拼接伪后缀
  return val.includes('@') ? val : `${val}@diary.local`;
}

// --- 认证与云端逻辑 ---
function initCloud() {
  const config = window.SUPABASE_CONFIG || {};
  if (!config.url || !config.anonKey) {
    setCloudStatus("云端配置缺失", "error");
    return false;
  }
  cloudClient = supabase.createClient(config.url, config.anonKey);
  return true;
}

async function signIn(account, password) {
  setAuthStatus("正在登录...", "muted");
  const email = formatAccountToEmail(account);
  
  const { data, error } = await cloudClient.auth.signInWithPassword({ email, password });
  
  if (error) {
    setAuthStatus(`登录失败: ${error.message}`, "error");
    return;
  }
  setSignedIn(data.user);
  loadCloudState();
}

async function signUp(account, password) {
  setAuthStatus("正在快速创建账号...", "muted");
  const email = formatAccountToEmail(account);
  
  const { data, error } = await cloudClient.auth.signUp({ email, password });
  
  if (error) {
    setAuthStatus(`注册失败: ${error.message}`, "error");
    return;
  }
  
  // 关键：由于关闭了邮箱确认，data.session 此时应有值
  if (data.session) {
    setAuthStatus("注册成功并已自动登录", "ok");
    setSignedIn(data.user);
    loadCloudState();
  } else {
    // 降级处理：若仍未自动登录，引导用户点一下登录
    setAuthStatus("账号创建成功，请点击登录", "ok");
  }
}

function setSignedIn(user) {
  currentUser = user;
  $("#authScreen").classList.toggle("hidden", Boolean(user));
  $("#appRoot").classList.toggle("locked", !user);
  setCloudStatus(user ? `同步中: ${user.email.split('@')[0]}` : "请先登录", user ? "ok" : "muted");
}

async function loadCloudState() {
  if (!cloudClient || !currentUser) return;
  const { data, error } = await cloudClient
    .from("health_diary")
    .select("data")
    .eq("user_id", currentUser.id)
    .maybeSingle();

  if (data?.data) {
    state = data.data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    render();
    setCloudStatus("云端数据已同步", "ok");
  }
}

async function saveCloudState() {
  if (!cloudClient || !currentUser) return;
  await cloudClient.from("health_diary").upsert({
    user_id: currentUser.id,
    data: state,
    updated_at: new Date().toISOString()
  });
  setCloudStatus("已自动保存至云端", "ok");
}

// --- 数据持久化与渲染 (精简版) ---
function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : { settings: { dailyGoal: 1600 }, days: {} };
}

function getDay() {
  if (!state.days[activeDate]) {
    state.days[activeDate] = { weight: "", exercise: 0, meals: { breakfast: [], lunch: [], dinner: [], snack: [] } };
  }
  return state.days[activeDate];
}

function render() {
  const day = getDay();
  $("#activeDate").value = activeDate;
  $("#dailyWeight").value = day.weight;
  $("#dailyGoal").value = state.settings.dailyGoal;
  
  // 计算热量
  const total = Object.values(day.meals).flat().reduce((s, e) => s + Number(e.calories), 0);
  $("#totalCalories").textContent = total;
  
  const goal = Number(state.settings.dailyGoal) || 0;
  const remaining = goal - total + Number(day.exercise || 0);
  $("#remainingCalories").textContent = remaining;
  
  renderMeals(day);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  saveCloudState();
}

function renderMeals(day) {
  const list = $("#mealList");
  list.innerHTML = "";
  Object.entries(mealNames).forEach(([key, label]) => {
    const node = $("#mealTemplate").content.firstElementChild.cloneNode(true);
    node.querySelector("h3").textContent = label;
    const entriesDiv = node.querySelector(".entries");
    day.meals[key].forEach(item => {
      const row = document.createElement("div");
      row.innerHTML = `<span>${item.name}</span> <b>${item.calories}</b>`;
      entriesDiv.appendChild(row);
    });
    list.appendChild(node);
  });
}

// --- 事件绑定 ---
function bindEvents() {
  $("#authForm").addEventListener("submit", (e) => {
    e.preventDefault();
    signIn($("#authEmail").value, $("#authPassword").value);
  });

  $("#signupButton").addEventListener("click", () => {
    signUp($("#authEmail").value, $("#authPassword").value);
  });

  $("#logoutButton").addEventListener("click", async () => {
    await cloudClient.auth.signOut();
    setSignedIn(null);
  });

  $("#entryForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const meal = $("#mealType").value;
    const name = $("#foodName").value || "未命名食物";
    const calories = $("#foodCalories").value;
    getDay().meals[meal].push({ name, calories });
    render();
    e.target.reset();
  });

  $("#activeDate").addEventListener("change", (e) => {
    activeDate = e.target.value;
    render();
  });
  
  $("#dailyGoal").addEventListener("input", (e) => {
    state.settings.dailyGoal = e.target.value;
    render();
  });
}

// --- 初始化启动 ---
if (initCloud()) {
  cloudClient.auth.getSession().then(({ data }) => {
    if (data.session) setSignedIn(data.session.user);
  });
}
bindEvents();
render();
