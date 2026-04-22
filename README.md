# GPT Image 2 Hub

AI 生图风格原子库 + 一键 CLI(调 apimart.ai / gpt-image-2)。

---

## 快速开始

> ⚠️ **所有命令必须在项目根目录运行** · 即 `cd /path/to/prompt-atlas` 之后再跑(CLI 会从当前目录读 `.env`)。

```bash
# 1. 配 key
cp .env.example .env
# 编辑 .env 填你的 APIMART_KEY(从 https://apimart.ai/keys 拿)

# 2. 生一张图(自动下载到 ./assets/generated/)
npm run gen -- "一只橘猫看夕阳 水彩画" --size 16:9
#            ^^
#            两个横线必须写 · 告诉 npm "后面是传给脚本的参数"
#            不想写 -- ? 直接用 node 调更干脆:
#   node api/generate.js "一只橘猫看夕阳 水彩画" --size 16:9

# 3. 批量
npm run batch -- prompts.json

# 4. 一键自测
npm test
```

---

## 目录

```
prompt-atlas/
├── api/                       # apimart 图像生成 CLI + 封装
│   ├── apimart.js             #   核心函数库(submit + poll + download + generate)
│   ├── generate.js            #   CLI 入口 · node api/generate.js "prompt"
│   ├── batch.js               #   批量 CLI · node api/batch.js prompts.json
│   └── README.md              #   接口完整使用指南(必读)
├── assets/
│   ├── generated/             # CLI 自动下载产物(.gitignore)
│   └── samples/               # 范例图
├── content/                   # prompt 原子库内容模板
├── planning/                  # 视觉规范 / 风格研究
├── spec/                      # spec / devlog
├── .env                       # API key(已 .gitignore · 不提交)
├── .env.example               # 环境变量模板
├── package.json               # 零依赖 · Node 18+
└── image-styles-atlas.html    # 130+ 种图像风格图鉴(可视化)
```

---

## 全链路示意

```
你的 prompt
    ↓
[submit] POST /v1/images/generations    ← 1.3 秒
    ↓ task_id
[poll]   GET /v1/tasks/{task_id}         ← 30-60 秒(内置 12s 首延 + 4s 间隔)
    ↓ status=completed · 拿 URL
[download] fetch(URL) → 写本地           ← 1-3 秒 · 图 24h 过期
    ↓
./assets/generated/<name>.png            ✅ 本地可用
```

---

## 详细 API 使用 → `api/README.md`

里面有:
- 13 种 size 比例对照表
- CLI 完整参数
- 代码里调用(generate / submit / pollUntilDone / downloadImage)
- 错误码对照
- 轮询策略调优
- 图生图 / 批量 / 自定义输出目录

---

## 技术栈

**零依赖 Node.js 18+**(自带 fetch · 自带 ESM)· 无 npm install 需求 · clone 完配好 key 直接跑。

---

## 本地 Rust 后端(v0.1+)

```bash
# 一次性: 装 Rust(已装跳过)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 跑 dev server
cargo run

# 另一窗口验证
curl http://localhost:3000/api/health
# → {"status":"ok","version":"v0.1"}

open http://localhost:3000
# → gallery 页加载

open http://localhost:3000/image-styles-atlas.html
# → 130+ 风格图鉴
```

架构:
- `src/main.rs` · axum 静态服务 + /api/health
- `frontend/` · 所有前端 HTML(v0.1 直接 serve gallery.html + image-styles-atlas.html)
- `api/*.js` · apimart 图像生成 CLI(独立 Node 工具链 · 与 Rust 后端无耦合)
