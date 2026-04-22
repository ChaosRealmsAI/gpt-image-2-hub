# GPT Image 2 Hub

GPT Image 2 Hub 是一个面向创作者的 AI 生图灵感图鉴: 浏览风格样张, 一键复刻成自己的主题, 并把收藏与生成作品留在本地。

```
┌──────────────────────────────────────────────────────────────┐
│ GPT Image 2 Hub                                               │
│ Style Atlas · Remix Gallery · Personal Image Lab              │
│ 130+ styles / APIMART + gpt-image-2 / Rust + static frontend  │
└──────────────────────────────────────────────────────────────┘
```

## 5 大能力

- 瀑布流: 首页按推荐、人像、海报、漫画、环境、国风、复古、赛博等频道展示风格卡片。
- 一键复刻: 打开卡片后输入主题, 复用当前图片的风格原子生成新图。
- 推荐: 基于浏览、点击和收藏信号在本地调整排序, 不需要登录。
- 收藏: 喜欢的风格可一键收藏, 支持本地保留与导出 JSON。
- 我的作品: 生成过的图片进入个人作品流, 方便回看、下载和继续复刻。

## 一图速览

```
Browser
  |
  |  open /
  v
frontend/index.html --------------+
  |                                |
  | GET /api/images                | localStorage
  v                                | favorites / clicks / generations
Rust Axum server                   |
  |                                |
  | reads data/images.json         |
  v                                |
Gallery cards <-------------------+
  |
  | POST /api/remix
  v
APIMART gpt-image-2 task
  |
  | GET /api/remix/:task_id
  v
Generated image URL
```

## 本地运行 3 步

```bash
# 1. 配置生成服务 key
cp .env.example .env
# 编辑 .env, 填入 APIMART_KEY

# 2. 启动本地服务
cargo run

# 3. 打开图库
open http://127.0.0.1:3000
curl http://127.0.0.1:3000/api/health
```

如果只使用 Node CLI 生成图片, 继续查看 [api/README.md](api/README.md)。

## 部署到 Vercel

仓库根目录提供了 `vercel.json`, 默认按纯静态前端发布 `frontend/`, 适合先完成 Vercel Import 和公开预览。

完整的线上生成能力需要把 Rust 后端改成 Vercel Rust serverless 目录结构, 或把后端部署到 Railway/Fly.io/VPS 后在前端接入独立 API 域名。步骤见 [docs/deploy.md](docs/deploy.md)。

## 技术栈

- 前端: 原生 HTML/CSS/JavaScript, Web Components, localStorage。
- 后端: Rust 2021, Axum, Tokio, tower-http。
- 数据: `data/images.json` 驱动图库卡片, `content/examples/*.md` 作为内容源。
- 生成: APIMART `gpt-image-2`, submit + poll 任务流。
- CLI: Node.js 18+ ESM 脚本, 用于批量生成、下载和余额查询。
- 部署: Vercel 静态前端优先; Rust serverless / 独立后端作为生产 API 方案。

## 目录结构

- `frontend/`: 当前前端入口, Rust 服务和 Vercel 静态发布都读这里。
- `src/`: Rust Axum 服务, 提供静态文件和 `/api/*`。
- `api/`: APIMART 图像生成 Node CLI。
- `content/`: prompt 内容源、atlas todo、批量 prompt 样例。
- `assets/`: 前端 demo 图、参考样图和 atlas 作品沉淀。
- `docs/`: 部署、架构、规划 HTML、调研 brief；研究资料索引见 `docs/research/README.md`。
- `spec/`: 独立 git 仓, 不随主仓提交。

大体积历史材料已移出主仓: `/Users/Zhuanz/workspace/prompt-atlas-archive/`。

## 10 版演进

| 版本 | 主题 | 结果 |
| --- | --- | --- |
| v0.1 | Rust 静态服务骨架 | Axum 服务 `frontend/` 与 `/api/health` |
| v0.2 | 数据层 | `data/images.json` 驱动首页图卡 |
| v0.3 | 瀑布流体验 | 多频道、筛选和响应式图库 |
| v0.4 | 风格原子 | 从内容源抽取 prompt、标签和视觉属性 |
| v0.5 | 详情弹窗 | 卡片详情、prompt 展示和操作入口 |
| v0.6 | 收藏 | localStorage 收藏、收藏页和导出 |
| v0.7 | 推荐 | 点击、收藏和浏览信号参与排序 |
| v0.8 | 一键复刻 | `/api/remix` 调 APIMART 创建生成任务 |
| v0.9 | 我的作品 | 生成结果进入本地作品流并可下载 |
| v1.0 | 部署准备 | README、Vercel 配置和部署/架构文档齐备 |

## License

TBD. 建议发布前明确为 MIT 或项目所有者指定的许可证。
