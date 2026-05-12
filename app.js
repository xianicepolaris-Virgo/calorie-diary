/**
 * 极速免邮验证版 app.js
 * CodeMaster 优化
 */

const STORAGE_KEY = "light-calorie-diary-v2";
const mealNames = { breakfast: "早餐", lunch: "午餐", dinner: "晚餐", snack: "加餐" };
const $ = (selector) => document.querySelector(selector);
const today = () => new Date().toISOString().split('T')[0];

let state = loadState();
let activeDate = today();
let cloudClient = null;
let currentUser = null;

// --- 核心：转换函数 ---
function formatAccountToEmail(input) {
  const val = input.trim();
  return val.includes('@') ? val : `${val}@diary.local`;
}

// --- 初始化云端 ---
function initCloud() {
  const config = window.SUPABASE_CONFIG;
  if (!config || !config.url || !config.anonKey) {
    setCloudStatus("云端配置缺失，请检查 config 文件", "error");
    setAuthStatus("云端还没配置好，不能登录", "error");
    return false;
  }
  try {
    cloudClient = supabase.createClient(config.url, config.anonKey);
    setCloudStatus("云端已连接", "ok");
    return true;
  } catch (e) {
    setCloudStatus("初始化失败", "error");
    return false;
  }
}

async function signIn(account, password) {
  if (!cloudClient) {
    setAuthStatus("云端还没配置好，不能登录", "error");
    return;
  }
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
  if (!cloudClient) {
    setAuthStatus("云端还没配置好，不能登录", "error");
    return;
  }
  setAuthStatus("正在创建账号...", "muted");
  const email = formatAccountToEmail(account);
  
  const { data, error } = await cloudClient.auth.signUp({ email, password });
  
  if (error) {
    setAuthStatus(`注册失败: ${error.message}`, "error");
    return;
  }
  
  if (data.session) {
    setAuthStatus("注册成功并登录", "ok");
    setSignedIn(data.user);
    loadCloudState();
  } else {
    setAuthStatus("注册成功，请重新点击登录", "ok");
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
  const { data } = await cloudClient.from("health_diary").select("data").eq("user_id", currentUser.id).maybeSingle();
  if (data?.data) {
    state = data.data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    render();
  }
}

async function saveCloudState() {
  if (!cloudClient || !currentUser) return;
  await cloudClient.from("health_diary").upsert({
    user_id: currentUser.id,
    data: state,
    updated_at: new Date().toISOString()
  });
}

function setCloudStatus(t, tone) {
  const n = $("#cloudStatus");
  if (n) { n.textContent = t; n.dataset.tone = tone; }
}

function setAuthStatus(t, tone) {
  const n = $("#authStatus");
  if (n) { n.textContent = t; n.dataset.tone = tone; }
}

// --- 基础逻辑 ---
function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : { settings: { dailyGoal: 1600 }, days: {} };
}

function getDay() {
  if (!state.days[activeDate]) state.days[activeDate] = { weight: "", exercise: 0, meals: { breakfast: [], lunch: [], dinner: [], snack: [] } };
  return state.days[activeDate];
}

function render() {
  const day = getDay();
  $("#activeDate").value = activeDate;
  $("#dailyWeight").value = day.weight;
  $("#dailyGoal").value = state.settings.dailyGoal;
  const total = Object.values(day.meals).flat().reduce((s, e) => s + Number(e.calories), 0);
  $("#totalCalories").textContent = total;
  renderMeals(day);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  saveCloudState();
}

function renderMeals(day) {
  const list = $("#mealList"); list.innerHTML = "";
  Object.entries(mealNames).forEach(([key, label]) => {
    const node = $("#mealTemplate").content.firstElementChild.cloneNode(true);
    node.querySelector("h3").textContent = label;
    const entriesDiv = node.querySelector(".entries");
    day.meals[key].forEach(item => {
      const row = document.createElement("div");
      row.className = "entry";
      row.innerHTML = `<span>${item.name}</span> <b>${item.calories}</b>`;
      entriesDiv.appendChild(row);
    });
    list.appendChild(node);
  });
}

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
    getDay().meals[meal].push({ name: $("#foodName").value || "饮食", calories: $("#foodCalories").value });
    render();
    e.target.reset();
  });
  $("#activeDate").addEventListener("change", (e) => { activeDate = e.target.value; render(); });
}

// --- 启动流程 ---
(async () => {
  if (initCloud()) {
    const { data } = await cloudClient.auth.getSession();
    if (data.session) setSignedIn(data.session.user);
  }
  bindEvents();
  render();
})();
