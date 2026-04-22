---
# ═══════════════════════════════════════════════════════════════
# LAYER 1 · META  (机器可读 · 系统 / 开发者 / 搜索引擎)
# 终端用户看不到 · 只进 schema 不进 prompt
# ═══════════════════════════════════════════════════════════════

# —— 身份 ——
id:            "NN-slug"                          # 两位数编号 + 连字符短名 · 与文件名一致
name:          "中文名 · English Name"             # 显示名
version:       "1.0"
created:       "YYYY-MM-DD"
updated:       "YYYY-MM-DD"

# —— 分类 (驱动画廊筛选 + Intent 激活) ——
category:      "portrait | poster | comic | ecommerce | logo | infographic | character-splash | social-cover | other"
sub_category:  "..."                              # 例: dreamy-full-body / editorial-masthead
intent:        "..."                              # Intent 原子枚举值(父字段)

# —— 技术开关 (API / UI 层 · 不进 prompt 文本) ——
model:         "gpt-image-2"
thinking:      "on | off"                         # Thinking 模式 toggle
aspect:        "3:4 | 16:9 | 9:16 | 1:1 | 21:9 | 1:3 | 3:1"
quality:       "high | medium | low"
has_ref_image: false                              # 是否需要用户上传参考图
has_text:      true                               # 是否含精确文字渲染

# —— 搜索 / 筛选 (auto tags · 派生但落盘方便查) ——
tags:          [a, b, c, d, e]                    # 6-10 个 · 都从 prompt 派生
difficulty:    "easy | medium | hard"             # 用户上手难度
rating:        "S | A | B | C | untested"        # 内部实测评分
status:        "draft | ready | deprecated"

# —— 品牌 / 水印 ——
watermark:     "integrated | disabled"
watermark_text: "Prompt Atlas · 2026"

# —— 血缘 (可选 · 派生自哪个 · 派生出哪些) ——
derived_from:  null                               # 父 skill id · 如果是 variant
variants:      []                                 # 子 variant 的 id 列表
---

# {Name}

> **一句话定位**: ≤ 15 字 · 告诉用户这个 skill 做啥

---

## 🎯 LAYER 2 · PROMPT  (终端用户 · 复制即跑)

### 原始需求(用户口语)

> (用户 / 作者的口头 brief · 原话保留 · 不加工 · 这是"为什么这么做"的锚)

### 变量槽 (用户可改的)

| 槽位 | 默认 | 可选枚举 |
|---|---|---|
| `var_1` | 默认值 | v1 / v2 / v3 / 自定义 |
| `var_2` | ... | ... |
| `var_3` | ... | ... |

> **Skill 化做法**: 整条 prompt 85% 固定 · 用户只改这几个 chip · 即一个独立 skill.

### 自然语言 Prompt · 点这里复制

```
(完整自然段 MD prompt · 按官方骨架组织:
 intended use → scene/background → subject → key details → constraints → quality)

(必须是模型直接吃的自然语言 · 不是 YAML / JSON / 列表 ·
 所有 constraints / placement / watermark 都融入段落)
```

**操作步骤**:
1. 打开 ChatGPT (Plus / Team / Enterprise)
2. 手动点 **Thinking** toggle(若 frontmatter 里 thinking:on)
3. (可选)上传参考图
4. 粘贴 Prompt · 发送
5. 等 30–120s

---

## 🔬 LAYER 3 · FEEDBACK  (内部 · 验证 · 迭代)

### Observation points (跑完自检 checklist)

- [ ] 核心观察点 1
- [ ] 核心观察点 2
- [ ] 文字精准度(若 has_text)
- [ ] 水印位置 / 不压主体
- [ ] 长宽比执行
- [ ] 是否偷加未指定元素(Negative 生效?)

### Known issues / 已知软肋

- Image 2 在此类 prompt 上的已知弱点(如: 中文小字偶尔乱 / 双人一致性 60% / 4K 小字瑕疵)

### Iteration log (版本迭代记录)

- **v1.0** (YYYY-MM-DD): 首发 · 作者 X
- **v1.1** (YYYY-MM-DD): 改了 ... · 理由 ...

### Variants / 衍生

- 链接到由本 skill 派生出的其他示例(列表)

### Record / 对产品的贡献

- 本示例演示了哪些产品价值:
  - 覆盖的原子层(L1 内容 / L2 表达 / L3 氛围 / L4 叙事 / L5 序列 / L6 文字 / L7 参考 / L8 位置 / L9 技术 / L10 品牌)
  - 用了哪些 Image 2 独家能力(Thinking / 引号文字 / 参考图 / 多图 / 长宽比)
  - 能作为哪个 skill 的模板(skill 产品化方向)

---

## 📐 模板使用说明(写在模板文件里 · 实际示例删掉这段)

1. **复制本文件** 到 `content/examples/NN-slug.md`
2. 按 3 层顺序填:先 LAYER 1 frontmatter(系统会校验) · 再 LAYER 2(给用户)· 最后 LAYER 3(跑完写)
3. **每层边界清晰**:
   - Layer 1 只进 schema · 永远不进 prompt 文本
   - Layer 2 是用户唯一可见的 · 必须能独立读懂
   - Layer 3 是内部资产 · 用于 A/B · 版本管理 · 学习复盘
4. **Frontmatter 字段校验**(可选后续做 CI):必填字段齐 · tag 从 prompt 派生 · 不手填新词
5. **Prompt 段要能直接粘给模型跑** · 不含 frontmatter · 不含 Layer 3 · 不含变量标签
