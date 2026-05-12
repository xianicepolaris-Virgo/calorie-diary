# 部署说明

## 1. 创建 Supabase 数据表

进入 Supabase 项目后台，打开 SQL Editor，运行 `supabase-setup.sql` 里的内容。

现在版本已经加入邮箱和密码登录。每个账号只会读取和保存自己的数据。

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

新版 Supabase 里 `anonKey` 可以填写 `Publishable key`。

## 3. 打开邮箱登录

进入 Supabase 后台：

1. 打开 Authentication
2. 打开 Providers
3. 确认 Email 已开启

如果你不想每次注册都收确认邮件，可以在 Authentication 的设置里关闭邮箱确认。个人小工具可以这样做，但公开网站建议保留确认邮件。

如果你保持邮箱确认开启，注册后页面不会直接进入系统。你需要先打开邮箱里的确认链接，然后回到网页登录。

## 4. 上传到 GitHub

在 GitHub 新建一个仓库，把这些文件上传进去：

- `index.html`
- `styles.css`
- `app.js`
- `supabase-config.js`
- `supabase-setup.sql`
- `README_DEPLOY.md`

## 5. 开启 GitHub Pages

进入仓库的 Settings -> Pages：

- Source 选择 `Deploy from a branch`
- Branch 选择 `main`
- Folder 选择 `/root`

保存后，GitHub 会给你一个网址，通常是：

`https://你的用户名.github.io/仓库名/`
