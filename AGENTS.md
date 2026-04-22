# AGENTS.md · GPT Image 2 Hub 生图工作流(最终版)

> **受众**:未来任何 AI(主 agent Claude · subagent ally gpt · autopilot loop)接手这个项目做图时 · 读这一份就会用。
> **项目主业**:给 `content/atlas-todo.json` 的 148 条 item 做 gpt-image-2 prompt + 跑图 + 沉淀到 `assets/`。

---

## 🎯 4 步工作流(硬)

```
1. 查 todo  →  2. claim  →  3. 做图  →  4. 写回
```

每一步都靠 **`atlas-todo.json`** 这一个文件串起来。

### Step 1 · 查 todo(AI 开工第一件事)

```bash
# 随便挑一个没 claim 的
jq '.tiers[].items[] | select(.status == "todo")' content/atlas-todo.json | head -20

# 按难度 · 挑 4-5(硬货)
jq '.tiers[].items[] | select(.status == "todo" and .difficulty >= 4)' content/atlas-todo.json

# 按 tier · 只做 A 类(高概念创意)
jq '.tiers[] | select(.tier | startswith("A ")) | .items[] | select(.status == "todo")' content/atlas-todo.json

# 全局统计 · 看剩多少
jq '[.tiers[].items[] | .status] | group_by(.) | map({status: .[0], count: length})' content/atlas-todo.json
# → [{"status":"todo","count":147},{"status":"done","count":1}]
```

### Step 2 · claim(防并发抢)

选中一条 · 马上更新 `atlas-todo.json`:
- `status: "todo"` → `"claimed"`
- 写 `owner_session`(你的 `$CLAUDE_SESSION_ID`)
- 写 `claimed_at`(ISO 时间)
- 判断 `type`(`single` 或 `series`)+ 写 `total_shots`
- 写 `output_dir`(**固定公式** = `assets/{tier}/{id}-{slug}/` · 下面讲)
- 🔴 **立即 commit atlas-todo.json**(git 是锁 · 别抢同一条)

```bash
# 示例:claim A-07(单图)
SESSION=$CLAUDE_SESSION_ID
jq --arg s "$SESSION" --arg now "$(date -u +%Y-%m-%dT%H:%M:%SZ)" '
  .tiers |= map(
    .items |= map(
      if .id == "A-07" then
        . + {status: "claimed", owner_session: $s, claimed_at: $now,
             type: "single", total_shots: 1,
             output_dir: "assets/A/A-07-geological-diorama/"}
      else . end
    )
  )
' content/atlas-todo.json > /tmp/ne.json && mv /tmp/ne.json content/atlas-todo.json

# commit(git 是并发锁)
git -C content add atlas-todo.json && git -C content commit -m "claim A-07"
```

**`output_dir` 公式**:`assets/{tier_letter}/{id}-{slug}/`

- `tier_letter` = id 前缀字母(`A-07` → `A`)
- `slug` = 英文短横线(你给 · 参考 name 翻译)
- 例:`A-07-geological-diorama` / `B-03-luxury-watch` / `S-02-8-shot-comic`

### Step 3 · 做图(AI 自编排 · 见 skill)

调用 `image2-prompt-writer` skill 的工艺指引:
- 判断单图 or 系列(同一个 X 多视角 = 系列)
- 写 **完整 prompt 到 `{output_dir}/prompt.md`** 或多条(系列)· **落盘优先**
- 调 `generate.mjs` 跑(系列用 `--ref` 串 URL · 自己管链)
- 看图 · 不过关改 prompt 重跑

**2 个 API 脚本**(绝对路径):
| 脚本 | 用途 |
|---|---|
| `image2balance` | 查余额(开跑前) |
| `image2gen` | 🔴 **主力** · 单图 / 系列逐张(支持多 `--ref` 最多 16 张) |

### Step 4 · 写回(交付闭环)

1. 在 `{output_dir}/` 下写 **`metadata.json`**(硬 schema · 下面)
2. 更新 `atlas-todo.json`:
   - `status: "claimed"` → `"done"`
   - 写 `done_at`(ISO)
   - 写 `metadata_path` = `{output_dir}/metadata.json`
3. commit atlas-todo.json + 新加的 assets/ 目录

---

## 📁 目录结构(最终 · 不再变)

```
prompt-atlas/
├── AGENTS.md                       ← 本文(工作流权威)
├── CLAUDE.md                       ← 项目总览
├── content/
│   ├── atlas-todo.json             ← 🔴 真相源 · 148 条 item · 认领机制
│   ├── atlas-todo.md               ← 人类可读视图
│   ├── examples/                   ← 早期 md 示例 · 参考勿改
│   └── prompts/                    ← 批量 prompt 样例 / 专项 prompt 草稿
├── assets/
│   ├── A/                          ← Tier A(按 atlas-todo 15 tier 字母)
│   │   ├── A-07-geological-diorama/
│   │   │   ├── prompt.md           ← 完整 prompt(5-slot labeled · 或多条系列)
│   │   │   ├── main.png            ← 单图 · 或 01-hero.png / 02-xxx.png(系列)
│   │   │   └── metadata.json       ← 🔴 每作品必有 · 前端消费源
│   │   ├── A-01-silhouette-universe/
│   │   └── ...
│   ├── B/ B-03-luxury-watch/ ...
│   ├── S/ S-02-8-shot-comic/ ...
│   ├── demo/                       ← 前端静态 demo 图片
│   ├── generated/                  ← CLI 默认输出 · gitignore
│   ├── reference-examples/         ← 参考样图 PNG
│   └── {tier}/{id}-{slug}/ ...
├── docs/
│   ├── planning/                   ← 视觉 / 原子研究 HTML
│   └── research/                   ← 72h brief 等调研材料
├── .claude/skills/image2-prompt-writer/   ← 项目本地 skill
└── spec/tmp/ally-*.md              ← ally 任务派遣文件
```

**`assets/demo/` / `assets/reference-examples/`** 是前端或调研引用资产 · 勿删。临时生成物默认进 `assets/generated/`，不提交。

早期独立 HTML / 参考仓 / 大体积生成输出已移出主仓到 `/Users/Zhuanz/workspace/prompt-atlas-archive/`。

---

## 📄 metadata.json 硬 schema(每作品必有)

```json
{
  "id": "A-07",
  "tier": "A",
  "title": "Hyperreal Diorama Cube · 地质剖面立方",
  "type": "single",
  "total_shots": 1,
  "created_at": "2026-04-22T23:15:00Z",
  "done_at": "2026-04-22T23:17:30Z",
  "tags": ["diorama", "geology", "editorial", "hyperreal"],
  "source_todo_ref": "atlas-todo.json#A-07",
  "shots": [
    {
      "prompt": "Scene:\n...\nSubject:\n...\nImportant details:\n...\nUse case:\n...\nConstraints:\n... Aspect ratio 1:1.",
      "name": "main",
      "size": "1:1",
      "refs_used": [],
      "task_id": "task_01KPT...",
      "url": "https://upload.apimart.ai/...",
      "expires_at": 1776940215,
      "local_filename": "main.png",
      "local_path": "/abs/.../A-07-geological-diorama/main.png",
      "size_bytes": 1992850,
      "actual_time_sec": 62,
      "status": "done"
    }
  ]
}
```

**系列版**:`type: "series"` · `total_shots: 6` · `shots: [6 个 · 每个带自己的 prompt + refs_used + url + local_path]`

**shots[].字段顺序硬**:`prompt` **首位**(提示词最重要 · 不能丢)· 然后 name / size / refs_used / task_id / url / local_path / status。

---

## 🔍 常用查询(grep / jq)

```bash
# 所有 done 作品
jq '.tiers[].items[] | select(.status == "done") | {id, output_dir}' content/atlas-todo.json

# 所有 claimed 但没 done 的(超时需清理 · 看 claimed_at)
jq '.tiers[].items[] | select(.status == "claimed") | {id, owner_session, claimed_at}' content/atlas-todo.json

# 前端扫 metadata · 构建瀑布流
find assets -name metadata.json -exec jq '{id, title, tier, tags, shots: (.shots | map(.local_path))}' {} \;

# 某 tier 进度
jq '.tiers[] | select(.tier | startswith("A ")) | .items | {total: length, done: [.[] | select(.status == "done")] | length}' content/atlas-todo.json
```

---

## ⚖️ 判断规则

### 单图 vs 系列

**"同一个 X 多视角?"**
- ✅ 是 → 系列(`type: "series"`)· 同一只手表 6 视角 / 同一人 8 姿态
- ❌ 否 → 单图(`type: "single"`)· S-07 米粒刻字 / A-07 地质立方

### 难易安排

- `difficulty: 5` 大招(S-02 / S-04 / A-07 / L-xx) — 单独做
- `difficulty: 4` 硬货 — 并发做 3-5 条
- `difficulty: 1-3` 基础 — 批量清(可派 ally 并发)

---

## 🚫 禁忌

- ❌ **不 claim 就开工**(多 session 撞同一 todo · 浪费钱)
- ❌ **prompt 不落盘直接 API 调用**(挂了 prompt 丢光)
- ❌ **交付时不写 metadata.json**(前端扫不到)
- ❌ **没看图就标 done**(视觉没验 = 没完成)
- ❌ **改历史 · 删已 done 的 metadata**(只追加 · 不删除)
- ❌ **找"series.mjs 自动跑整套"**(删了 · 用 generate.mjs 自编排)
- ❌ **目录位置自创**(固定公式 · 别偏离)

---

## 🤖 未来场景

**场景 A · 单人手工做**:用户让 AI 做 X → AI 读本文 → claim → 做 → commit。
**场景 B · 并发 ally 清 todo**:主 agent 并发派 N 个 ally · 每个 claim 一条(git 防撞)· 并行做 · 做完 merge。
**场景 C · autopilot 夜跑**:/loop 每小时查 todo 没 done 的 · claim → 做 → done · 一晚清 20-50 条。

本文件是三个场景的**共用契约**。

---

## 📚 详细工艺

- **提示词工艺** → `.claude/skills/image2-prompt-writer/SKILL.md`(5-slot label · multi-ref · 避坑 · 看图迭代)
- **API 接口** → `/Users/Zhuanz/workspace/apimart-image-gen/README.md`(`image2gen --help` / `image2balance --help`)
- **官方文档**:
  - [OpenAI Cookbook · gpt-image-2 prompting guide](https://developers.openai.com/cookbook/examples/multimodal/image-gen-models-prompting-guide)
  - [fal.ai · GPT Image 2 prompting](https://fal.ai/learn/tools/prompting-gpt-image-2)
