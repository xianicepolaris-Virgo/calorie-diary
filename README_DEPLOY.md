# 部署说明

## 1. 创建 Supabase 数据表

进入 Supabase 项目后台，打开 SQL Editor，运行 `supabase-setup.sql` 里的内容。

注意：这个简单版本适合个人使用。只要别人知道你的网页地址，理论上也可能写入同一份数据。后续如果要做账号登录和个人隐私隔离，需要再接 Supabase Auth。

## 2. 填写云端配置

打开 `supabase-config.js`，填入 Supabase 项目里的：

- Project URL
- anon public key

示例：

```js
window.SUPABASE_CONFIG = {
  url: "https://你的项目.supabase.co",
  anonKey: "你的 anon public key",
  table: "health_diary",
  rowId: "default",
};
```

## 3. 上传到 GitHub

在 GitHub 新建一个仓库，把这些文件上传进去：

- `index.html`
- `styles.css`
- `app.js`
- `supabase-config.js`
- `supabase-setup.sql`
- `README_DEPLOY.md`

## 4. 开启 GitHub Pages

进入仓库的 Settings -> Pages：

- Source 选择 `Deploy from a branch`
- Branch 选择 `main`
- Folder 选择 `/root`

保存后，GitHub 会给你一个网址，通常是：

`https://你的用户名.github.io/仓库名/`
