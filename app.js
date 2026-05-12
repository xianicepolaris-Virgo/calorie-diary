/**
 * 核心逻辑：极速版轻卡日记 (修复初始化错误)
 * CodeMaster 
 */
const STORAGE_KEY = "light-calorie-diary-v2";
const $ = (selector) => document.querySelector(selector);
const today = () => new Date().toISOString().split('T')[0];

let state = { settings: { dailyGoal: 1600 }, days: {} };
let activeDate = today();
let cloudClient = null;
let currentUser = null;

// 账号转邮箱逻辑
function formatAccountToEmail(input) {
  const val = input.trim();
  return val.includes('@') ? val : `${val}@diary.local`;
}

// 初始化连接
function initCloud() {
  const config = window.SUPABASE_CONFIG;
  if (!config || !config.url) {
    console.error("配置缺失");
    return false;
  }
  cloudClient = supabase.createClient(config.url, config.anonKey);
  return true;
}

async function signIn(account, password) {
  if (!cloudClient && !initCloud()) {
    alert("云端配置加载失败，请检查 supabase-config.js");
    return;
  }
  const email = formatAccountToEmail(account);
  const { data, error } = await cloudClient.auth.signInWithPassword({ email, password });
  if (error) return alert("登录失败: " + error.message);
  location.reload(); // 登录成功后刷新页面进入系统
}

async function signUp(account, password) {
  if (!cloudClient && !initCloud()) return;
  const email = formatAccountToEmail(account);
  const { data, error } = await cloudClient.auth.signUp({ email, password });
  if (error) return alert("注册失败: " + error.message);
  if (data.session) location.reload();
  else alert("注册成功，请点击登录");
}

// 绑定按钮事件
function bindEvents() {
  $("#authForm").onclick = (e) => {
    if (e.target.id === "loginButton") {
      e.preventDefault();
      signIn($("#authEmail").value, $("#authPassword").value);
    }
  };
  $("#signupButton").onclick = (e) => {
    e.preventDefault();
    signUp($("#authEmail").value, $("#authPassword").value);
  };
}

// 启动
window.onload = async () => {
  if (initCloud()) {
    const { data } = await cloudClient.auth.getSession();
    if (data?.session) {
      currentUser = data.session.user;
      $("#authScreen").style.display = "none";
      $("#appRoot").classList.remove("locked");
    }
  }
  bindEvents();
};
