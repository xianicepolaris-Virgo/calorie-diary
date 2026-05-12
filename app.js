/**
 * 极速版轻卡日记 - CodeMaster 修复版
 */
const STORAGE_KEY = "light-calorie-diary-v2";
const $ = (selector) => document.querySelector(selector);

let state = loadState();
let cloudClient = null;
let currentUser = null;

// 1. 账号转换逻辑
function formatAccountToEmail(input) {
  const val = input.trim();
  return val.includes('@') ? val : `${val}@diary.local`;
}

// 2. 初始化云端
function initCloud() {
  const config = window.SUPABASE_CONFIG;
  if (!config || !config.url) {
    updateAuthUI("配置缺失，请检查 config 文件", "error");
    return false;
  }
  cloudClient = supabase.createClient(config.url, config.anonKey);
  return true;
}

// 3. 登录逻辑
async function signIn(account, password) {
  updateAuthUI("正在登录...", "muted");
  const email = formatAccountToEmail(account);
  const { data, error } = await cloudClient.auth.signInWithPassword({ email, password });
  
  if (error) return updateAuthUI("登录失败: " + error.message, "error");
  enterApp(data.user);
}

// 4. 注册逻辑
async function signUp(account, password) {
  updateAuthUI("正在创建账号...", "muted");
  const email = formatAccountToEmail(account);
  const { data, error } = await cloudClient.auth.signUp({ email, password });
  
  if (error) return updateAuthUI("注册失败: " + error.message, "error");
  if (data.session) enterApp(data.user);
  else updateAuthUI("注册成功，请点击登录", "ok");
}

// 5. 进入程序界面
function enterApp(user) {
  currentUser = user;
  $("#authScreen").classList.add("hidden");
  $("#appRoot").classList.remove("locked");
  $("#cloudStatus").textContent = `用户: ${user.email.split('@')[0]}`;
  loadCloudData();
  render();
}

function updateAuthUI(msg, tone) {
  const el = $("#authStatus");
  el.textContent = msg;
  el.style.color = tone === "error" ? "red" : (tone === "ok" ? "green" : "#666");
}

// 6. 数据同步
async function loadCloudData() {
  if (!cloudClient || !currentUser) return;
  const { data } = await cloudClient.from("health_diary").select("data").eq("user_id", currentUser.id).maybeSingle();
  if (data?.data) {
    state = data.data;
    render();
  }
}

async function saveToCloud() {
  if (!cloudClient || !currentUser) return;
  await cloudClient.from("health_diary").upsert({
    user_id: currentUser.id,
    data: state,
    updated_at: new Date().toISOString()
  });
}

// 7. 基础功能
function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : { settings: { dailyGoal: 1600 }, days: {} };
}

function render() {
  const date = $("#activeDate").value || new Date().toISOString().split('T')[0];
  if (!state.days[date]) state.days[date] = { meals: { breakfast: [], lunch: [], dinner: [], snack: [] } };
  
  const day = state.days[date];
  const total = Object.values(day.meals).flat().reduce((s, e) => s + Number(e.calories || 0), 0);
  $("#totalCalories").textContent = total;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  saveToCloud();
}

function bindEvents() {
  $("#authForm").onsubmit = (e) => {
    e.preventDefault();
    signIn($("#authEmail").value, $("#authPassword").value);
  };
  $("#signupButton").onclick = () => signUp($("#authEmail").value, $("#authPassword").value);
  $("#logoutButton").onclick = async () => {
    await cloudClient.auth.signOut();
    location.reload();
  };
  $("#entryForm").onsubmit = (e) => {
    e.preventDefault();
    const date = $("#activeDate").value || new Date().toISOString().split('T')[0];
    state.days[date].meals[$("#mealType").value].push({
      name: $("#foodName").value || "食物",
      calories: $("#foodCalories").value
    });
    render();
    e.target.reset();
  };
}

// 启动
window.addEventListener("DOMContentLoaded", async () => {
  $("#activeDate").value = new Date().toISOString().split('T')[0];
  if (initCloud()) {
    const { data } = await cloudClient.auth.getSession();
    if (data?.session) enterApp(data.session.user);
    else updateAuthUI("请登录或注册", "muted");
  }
  bindEvents();
  render();
});
