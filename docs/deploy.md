# Deploy Guide

本项目 v1.0 的部署目标是: 不在本地真实部署, 但把仓库准备到用户可以在 Vercel 点击 Import 后上线静态前端。线上生成能力需要额外接入 Rust 后端方案。

## 当前推荐路径

推荐先按 Option A 用 Vercel Import 发布 `frontend/` 静态站点, 确认页面、资源、路由都能公开访问。随后把 Rust 后端改造成 Vercel Rust serverless, 让前端和 API 统一在一个 Vercel 项目内运行。

当前 `vercel.json` 是纯静态配置:

```json
{
  "version": 2,
  "buildCommand": null,
  "outputDirectory": "frontend",
  "rewrites": [
    { "source": "/(.*)", "destination": "/$1" }
  ]
}
```

这能让 `frontend/index.html` 作为静态产物发布。当前 Rust 后端仍是长驻 Axum 服务, 不能在不改目录结构的前提下直接作为 Vercel Function 运行。

## Option A: Vercel 网页 Import GitHub Repo

1. 打开 https://vercel.com/new。
2. 选择 GitHub 里的 `prompt-atlas` 仓库。
3. Framework Preset 选择 `Other`。
4. Build Command 保持空或填 `None`。
5. Output Directory 填 `frontend`。
6. Environment Variables 添加:

```text
APIMART_KEY=<your_apimart_key>
```

7. 点击 Deploy。

说明:

- 纯静态发布时 `APIMART_KEY` 暂不会被前端直接读取, 但可以提前填好, 方便后续接入 Rust serverless。
- 如果只按当前结构发布, `/api/images`、`/api/remix` 等后端接口不会在 Vercel 自动可用。
- 要让一键复刻在线可用, 继续看下面的 Rust 后端 3 种方案。

## Option B: Vercel CLI 本地跑

不要执行登录或部署时, 只保留以下命令作为用户手动操作参考:

```bash
npm i -g vercel
vercel login
vercel dev
vercel --prod
```

本项目当前没有前端构建步骤。CLI 路径适合用户在自己的终端里验证 `vercel.json` 与静态目录配置。

## Rust 后端方案

### A. Vercel Rust Serverless

推荐用于统一部署: 前端和 API 都在 Vercel 项目里, 环境变量也统一放在 Vercel。

需要做目录结构调整, 因为当前 `src/main.rs` 是长驻服务入口:

```text
prompt-atlas/
├── api/
│   ├── health.rs
│   ├── images.rs
│   └── remix.rs
├── frontend/
│   └── index.html
├── data/
│   └── images.json
├── Cargo.toml
└── vercel.json
```

调整后的 `vercel.json` 可改为:

```json
{
  "version": 2,
  "buildCommand": null,
  "outputDirectory": "frontend",
  "functions": {
    "api/**/*.rs": { "runtime": "vercel-rust@4.0.0" }
  },
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/$1" }
  ]
}
```

迁移指南:

1. 把 `/api/health`、`/api/images`、`/api/remix`、`/api/remix/:task_id` 拆成 Vercel Function 入口。
2. 把当前 `src/main.rs` 中的纯业务函数保留为共享模块, 避免复制 APIMART submit/poll 逻辑。
3. 保持 `data/images.json` 可被函数读取。若 Vercel 函数读取相对路径不稳定, 将 JSON 嵌入编译产物或改为对象存储/CDN。
4. 在 Vercel Project Settings 里配置 `APIMART_KEY`。
5. 本地用 `vercel dev` 验证 `/api/health`、`/api/images`、`/api/remix`。

优点: 一个域名, 无跨域问题, Vercel 环境变量统一管理。

风险: Rust serverless 目录结构和运行时约束需要单独适配; 长轮询和冷启动要实测。

### B. Railway/Fly.io 独立后端

适合最少改 Rust 代码的生产路径。保持当前 Axum 服务结构, 把 Rust 后端作为独立 Web 服务部署:

```text
Vercel frontend  --->  https://api.example.com
                         |
                         v
                      Axum backend
                         |
                         v
                     APIMART gpt-image-2
```

需要做:

1. 后端监听地址从 `127.0.0.1:3000` 改为平台提供的 `0.0.0.0:$PORT`。
2. 平台环境变量配置 `APIMART_KEY`。
3. 前端把 `/api/...` 改为 `https://api.example.com/api/...`, 或在 Vercel rewrites 里代理到独立后端。
4. 给后端设置 CORS 或只允许 Vercel 域名访问。

优点: 改动小, 适合当前 Axum 长驻服务。

风险: 多一个平台和域名, 需要处理 CORS、日志、监控和平台账单。

### C. VPS 服务端

适合已经有服务器且愿意维护进程的人:

```bash
cargo build --release
APIMART_KEY=... ./target/release/prompt-atlas
```

建议配套:

- systemd 或 supervisor 管理进程。
- Nginx/Caddy 做 HTTPS、反向代理和静态缓存。
- 日志轮转、自动重启和系统安全更新。

优点: 控制力最高。

风险: 维护成本最高, 需要自己处理安全、证书、扩容和故障恢复。

## 推荐结论

- v1.0 Ship: 使用当前 `vercel.json` 发布纯静态前端, 让用户能点击 Import 看到页面。
- v1.x Production: 选择 Rust 后端方案 A, 把 API 改成 Vercel Rust serverless, 达成一个 Vercel 项目内的完整体验。
- 若时间紧但必须上线生成能力: 先选方案 B, 把当前 Axum 服务部署到 Railway/Fly.io, Vercel 只负责前端。
