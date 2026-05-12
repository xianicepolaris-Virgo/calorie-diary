/**
 * 轻卡日记核心逻辑 - 修复同步卡死版
 */
const STORAGE_KEY = "light-calorie-diary-v2";
const $ = (selector) => document.querySelector(selector);
const mealNames = { breakfast: "早餐", lunch: "午餐", dinner: "晚餐", snack: "加餐" };

let state = { settings: { dailyGoal: 1600 }, days: {} };
let activeDate = new Date().toISOString().split('T')[0];
let cloudClient = null;
let currentUser = null;

// 格式化账号
const formatAccount = (val) => val.trim().includes('@') ? val.trim() : `${val.trim()}@diary.local`;

// 初始化云端
function initCloud() {
    const config = window.SUPABASE_CONFIG;
    if (!config || !config.url) {
        $("#authStatus").textContent = "配置加载失败，请检查 config 文件";
        return false;
    }
    cloudClient = supabase.createClient(config.url, config.anonKey);
    $("#authStatus").textContent = "云端连接成功，请登录";
    return true;
}

// 进入应用
function enterApp(user) {
    currentUser = user;
    document.body.classList.remove("not-logged-in");
    $("#authScreen").classList.add("hidden");
    $("#cloudStatus").textContent = `已同步: ${user.email.split('@')[0]}`;
    loadCloudState();
}

// 登录/注册
async function handleAuth(type, account, password) {
    $("#authStatus").textContent = "正在处理...";
    const email = formatAccount(account);
    const method = type === 'login' ? cloudClient.auth.signInWithPassword : cloudClient.auth.signUp;
    
    const { data, error } = await method.call(cloudClient.auth, { email, password });
    
    if (error) {
        $("#authStatus").textContent = "失败: " + error.message;
        $("#authStatus").style.color = "red";
    } else if (data.user) {
        if (type === 'signup' && !data.session) {
            $("#authStatus").textContent = "创建成功，请点击登录";
            $("#authStatus").style.color = "green";
        } else {
            enterApp(data.user);
        }
    }
}

// 加载云端数据
async function loadCloudState() {
    const { data } = await cloudClient.from("health_diary").select("data").eq("user_id", currentUser.id).maybeSingle();
    if (data?.data) {
        state = data.data;
        render();
    }
}

// 渲染
function render() {
    $("#activeDate").value = activeDate;
    if (!state.days[activeDate]) {
        state.days[activeDate] = { meals: { breakfast: [], lunch: [], dinner: [], snack: [] } };
    }
    const day = state.days[activeDate];
    const total = Object.values(day.meals).flat().reduce((s, e) => s + Number(e.calories || 0), 0);
    $("#totalCalories").textContent = total;
    
    // 渲染饮食列表
    const list = $("#mealList");
    list.innerHTML = "";
    Object.entries(mealNames).forEach(([key, name]) => {
        const node = $("#mealTemplate").content.firstElementChild.cloneNode(true);
        node.querySelector("h3").textContent = name;
        const entries = node.querySelector(".entries");
        day.meals[key].forEach(item => {
            const row = document.createElement("div");
            row.style.padding = "5px 0";
            row.innerHTML = `<span>${item.name}</span> <b style="float:right">${item.calories} kcal</b>`;
            entries.appendChild(row);
        });
        list.appendChild(node);
    });
    
    // 保存
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (cloudClient && currentUser) {
        cloudClient.from("health_diary").upsert({
            user_id: currentUser.id, 
            data: state, 
            updated_at: new Date().toISOString()
        });
    }
}

// 事件绑定
function bindEvents() {
    $("#loginButton").onclick = (e) => { e.preventDefault(); handleAuth('login', $("#authEmail").value, $("#authPassword").value); };
    $("#signupButton").onclick = () => handleAuth('signup', $("#authEmail").value, $("#authPassword").value);
    $("#logoutButton").onclick = async () => { await cloudClient.auth.signOut(); location.reload(); };
    $("#activeDate").onchange = (e) => { activeDate = e.target.value; render(); };
    $("#entryForm").onsubmit = (e) => {
        e.preventDefault();
        state.days[activeDate].meals[$("#mealType").value].push({
            name: $("#foodName").value || "饮食",
            calories: $("#foodCalories").value
        });
        render();
        e.target.reset();
    };
}

// 启动
window.onload = async () => {
    $("#activeDate").value = activeDate;
    if (initCloud()) {
        const { data } = await cloudClient.auth.getSession();
        if (data?.session) enterApp(data.session.user);
    }
    bindEvents();
};
