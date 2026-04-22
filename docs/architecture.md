# Architecture

GPT Image 2 Hub 由静态前端、Rust Axum API、JSON 图库数据和 APIMART 生图服务组成。v1.0 的部署产物优先保证前端可被 Vercel 静态发布; 完整一键复刻能力依赖 Rust API 在线运行。

## 一页架构图

```
                         ┌───────────────────────────┐
                         │        Browser            │
                         │  masonry / modal / remix  │
                         └─────────────┬─────────────┘
                                       │
                         GET /         │ static files
                                       v
┌────────────────────────────────────────────────────────────────┐
│ frontend/index.html                                             │
│ - gallery UI                                                     │
│ - recommendation ranking                                         │
│ - favorites and generations in localStorage                      │
└─────────────┬───────────────────────┬──────────────────────────┘
              │                       │
              │ GET /api/images       │ POST /api/remix
              v                       v
┌───────────────────────────┐   ┌────────────────────────────────┐
│ data/images.json           │   │ Rust Axum API                  │
│ cards / prompts / atoms    │   │ health / images / remix / poll │
└───────────────────────────┘   └───────────────┬────────────────┘
                                                 │
                                                 │ submit + poll
                                                 v
                                  ┌───────────────────────────────┐
                                  │ APIMART gpt-image-2            │
                                  │ task_id -> image_url           │
                                  └───────────────────────────────┘
```

## 数据流

1. 用户打开首页, 浏览瀑布流卡片。
2. 前端请求 `/api/images`, Rust 服务读取 `data/images.json` 并返回图片、prompt、标签和风格原子。
3. 用户点击卡片, 前端打开详情 modal。
4. 用户点击“用这个风格做我的”, 输入主题。
5. 前端向 `/api/remix` 提交 `image_id`、`subject` 和可选画幅。
6. Rust API 从 `data/images.json` 找到参考卡片, 拼接复刻 prompt。
7. Rust API 调 APIMART `gpt-image-2` 创建任务, 返回 `task_id`。
8. 前端轮询 `/api/remix/:task_id`。
9. Rust API 轮询 APIMART task, 拿到 `image_url` 后返回前端。
10. 前端展示生成结果, 支持下载, 并把作品记录保存到 localStorage 的“我的作品”。

## 10 版演进表

| 版本 | 重点 | 架构变化 |
| --- | --- | --- |
| v0.1 | 本地服务 | Axum 启动 `127.0.0.1:3000`, 服务 `frontend/` 和 `/api/health` |
| v0.2 | 数据驱动 | 增加 `/api/images`, 前端从 `data/images.json` 渲染 |
| v0.3 | 瀑布流 | 前端增加频道、筛选、搜索和响应式布局 |
| v0.4 | 内容原子 | 内容源沉淀到 `content/examples/*.md`, 构建成 JSON |
| v0.5 | 详情 modal | 卡片点击进入详情, 展示 prompt、标签、风格信息 |
| v0.6 | 收藏体系 | localStorage 保存收藏, 增加收藏视图和导出 |
| v0.7 | 推荐排序 | 点击、收藏、停留等本地信号影响推荐流 |
| v0.8 | 一键复刻 | Rust 后端接 APIMART submit/poll, 前端发起生成 |
| v0.9 | 我的作品 | 生成结果进入本地作品流, 支持下载和继续复刻 |
| v1.0 | 部署准备 | 增加 `vercel.json`, README 用户化, 部署和架构文档成型 |

## 运行边界

- 本地完整体验: `cargo run` 后访问 `http://127.0.0.1:3000`。
- Vercel 当前配置: 发布 `frontend/` 静态站点, 用于公开预览。
- Vercel 完整体验: 需要把 Rust API 拆成 `api/**/*.rs` serverless functions。
- 独立后端体验: 可保持 Axum 长驻服务, 前端通过独立域名或 Vercel rewrite 调 API。
