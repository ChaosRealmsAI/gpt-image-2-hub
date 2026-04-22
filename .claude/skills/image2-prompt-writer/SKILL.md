---
name: image2-prompt-writer
description: GPT Image 2 Hub 项目生图入口 · 做 atlas-todo 任意条 item · 单图 / 系列都走这里。ALWAYS invoke when 用户说"写提示词 / 画一张 X / 做一组 X / 做系列 / 做 atlas-todo 某条 / 按 GPT Image 2 Hub 写 / 给我做张图 / 生图"。本 skill 只是入口 · 全部工艺 / 流程 / schema 在项目根 AGENTS.md。
---

# GPT Image 2 Hub · 生图入口

## 🔴 必读(开工前) · 一份文件讲清全流程

**`/Users/Zhuanz/workspace/prompt-atlas/AGENTS.md`**

里面讲了:
- 4 步工作流(查 todo → claim → 做 → 写回)
- CLI 接口(4 个脚本 · `generate.mjs --help` 自解释)
- 目录 / metadata 硬 schema
- 5-slot prompt 工艺 · multi-ref · 避坑 · 看图迭代
- atlas-todo.json 认领 / 并发 / 统计

**两条命令就够用**:

```bash
# 看会什么 API
node ~/.claude/skills/apimart-image-gen/scripts/generate.mjs --help

# 查项目 todo
jq '.tiers[].items[] | select(.status == "todo") | {id, name, difficulty}' \
  /Users/Zhuanz/workspace/prompt-atlas/content/atlas-todo.json | head
```

## 落盘铁律(挂了不丢)

- prompt **先写 `prompt.md`** · **再调 API** · 顺序硬
- 跑完写 `metadata.json`(AGENTS.md 有硬 schema)
- 改 atlas-todo.json · status: `todo` → `claimed` → `done`

其他所有细节 · 见 AGENTS.md · 别来找这里。
