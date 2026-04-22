# GPT Image 2 Hub · CLAUDE.md

> **品牌名**: GPT Image 2 Hub · **域名**: gptimage2hub.com · **目录名**: `prompt-atlas/`(不动 · 保 git 历史 / 外部引用)

AI 生图瀑布流真图库 + 一键复刻(Image 2 版 Lexica)· C 端小白 0 门槛生图。

**SEO 定位**:抢 gpt-image-2 发布后 6 个月 SEO 窗口期 · 双流量词 "GPT Image 2" + "Hub"。

## 🔑 核心做的是 · 提示词(prompt)

本项目**所有内容的核心 = 给 gpt-image-2 的提示词**。
前端瀑布流展示的是"真图 + 可复制 prompt" · skill 管 prompt 工艺 · batch CLI 跑 prompt → 出图 · 每个 `content/examples/NN.md` 都是一套 prompt 配方。

### 📝 Prompt 默认写法(硬规则)

1. **主体 prompt 写英文**(国际化 / SEO / 模型指令跟随更稳)
2. **引号内精确文字 = 按目标国家语言**(用 gpt-image-2 独家非拉丁文字 99% 能力):
   - 面向中国 → 引号里写中文: `"新店开业" / "图灵观察"`
   - 面向日本 → 引号里写日文: `"ようこそ" / "和菓子"`
   - 面向韩国 → 引号里写韩文: `"서울" / "환영합니다"`
   - 面向中东 → 引号里写阿拉伯文: `"مرحبا"`
   - 面向印度 → 引号里写印地 / 孟加拉文
3. **长 prompt 人像场景**若挂 moderation · 再退到中文全写
4. 详见 `.claude/skills/image2-prompt-writer/SKILL.md`

## 技术栈

- **后端**: Rust + axum(薄库 · 非框架)· tokio / tower-http / serde_json
- **前端**: HTML + CSS + TS 零框架 · 瀑布流图鉴
- **图像 API**: apimart.ai `gpt-image-2`(`api/*.js` 独立 Node CLI)
- **部署**: 本地 dev-only · v1.0 才上 Vercel(用户指令)

## 开发入口

```bash
# Rust dev server(v0.1+)· 前端静态 + /api/health
cargo run                                  # http://localhost:3000

# Node 图像 CLI(独立工具链)· 生图
node api/generate.js "一只橘猫 水彩"  --size 16:9

# spec 导航
open spec/read-for-human/roadmap-v1.0.html
```

## 项目结构

- `src/main.rs` · axum server
- `frontend/` · 所有前端 HTML(index.html = gallery · image-styles-atlas.html = 风格图鉴)
- `api/` · apimart Node CLI(不依赖 Rust 后端)
- `content/examples/*.md` · skill 配方 MD
- `planning/*.html` · 视觉 / 原子研究 HTML
- `spec/` · **独立 git 仓**(外部大脑 · roadmap / devlog / bdd / poc / 版本工作区)
- `.worktrees/` · 每版独立 worktree(按 `version-parallel-worktree` rule)

## AI 验证接口

新 session 拿到项目 · 按此清单能直接操作验证 · 零发现成本(按 `verify-cli-index` rule)。

```bash
# 服务进程
cargo run                                                             # 起 dev server (v0.1+)· 前台阻塞
cargo build 2>&1 | tail -5                                            # 编译检查 · 看 0 error/Finished
pkill -f "target/debug/prompt-atlas"                                  # kill server

# HTTP 端点验证
curl -sS http://127.0.0.1:3000/api/health                             # → {"status":"ok","version":"v0.1"}
curl -sS http://127.0.0.1:3000/ | grep -c "GPT Image 2 Hub"           # 首页 · 含品牌名 · 预期 > 0
curl -sS http://127.0.0.1:3000/api/images | jq '.images | length'     # 图鉴条数 · 预期 ≥ 7 (v0.2+)
curl -sS http://127.0.0.1:3000/api/images | jq '.images[0] | keys'    # 首条字段清单 (v0.2+)
curl -sS http://127.0.0.1:3000/ | grep -c "fetch"                     # 首页 · 预期 ≥ 1 (v0.2+ fetch 驱动)
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3000/image-styles-atlas.html  # → 200
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3000/assets/samples/cat-sunset-watercolor.png  # → 200 (v0.2+ /assets 路由)
curl -sS -o /dev/null -w 'status=%{http_code} size=%{size_download}\n' http://127.0.0.1:3000/

# v0.3+ 详情 modal / 复制 / 点击记录 · 静态 grep 验证
curl -sS http://127.0.0.1:3000/ | grep -cE 'detail-modal|class="modal'         # modal DOM · 预期 ≥ 1
curl -sS http://127.0.0.1:3000/ | grep -cE 'navigator\.clipboard'              # 复制 API · 预期 ≥ 1
curl -sS http://127.0.0.1:3000/ | grep -cE 'promptatlas\.click_history'        # 点击 localStorage key · 预期 ≥ 2
# 手测: 浏览器打开 localhost:3000 · 点卡弹 modal · 点复制 → 粘贴验 · Esc/遮罩/X 关 · DevTools 看 promptatlas.click_history

# 数据抽取(一次性 · 改 content/examples/*.md 后重跑)
node tools/build-images-json.js                                       # 扫 content/examples/ → 产 data/images.json

# 图像生成(独立 Node 工具 · 与 Rust 后端解耦)
node api/generate.js "prompt..." --size 16:9                          # 出图到 ./assets/generated/
node api/batch.js prompts.json                                        # 批量
node api/balance.js                                                   # 查余额
```

## 当前版本进展

- 路线图总览 → `spec/read-for-human/roadmap-v1.0.html`
- 版本登记簿 → `spec/versions/REGISTRY.json`(`jq` 查 in-progress)
- 最新动态 → `spec/devlog/` 最后一段

## 硬约束(autopilot 全程适用)

- 🔴 **不做用户系统**(全 localStorage · 无登录/账号/session/cookie auth)
- 🔴 **主力开发 = ally gpt**(方案 ally+opus 并行 / 代码只 ally / opus 调度 + 验证)
- 🔴 **全程自验证**(每 done 必贴 ai_tools 证据 · 按 `self-verification` rule)
- 🔴 **spec/代码两仓独立** · 分别 commit + push(按 `commit-format` rule)

## 禁

- ❌ 引入胖框架(React / Vue / Tauri v1 / Bevy / actix-web)
- ❌ 改 `gallery.html` / `image-styles-atlas.html` 原件(复制到 frontend/ 改 frontend 版)
- ❌ main 直接改版本代码(走 `.worktrees/autopilot-v{X}-...`)
- ❌ 加新"AI 验证 CLI"忘同步本章节(drift = 下 session 找不到)
