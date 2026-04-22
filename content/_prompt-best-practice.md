# GPT Image 2 Hub · 提示词最终写法指南

**更新**:2026-04-22 晚
**来源**:OpenAI 官方规范 + devlog 今日实测(6 个旗帜 skill + 17 组对照测试)+ apimart 现场验证
**用途**:写 GPT Image 2 prompt 的"官方答案" · 跟 `_template.md` 配合使用

---

## 🎯 第一步 · 决策树(按"画啥"分派规则)

```
我要画啥?
  │
  ├── ① 人物 + 具体动作(写 / 读 / 画 / 舞 / 弹琴)
  │       🔴 最危险档 · 最容易挂 moderation
  │       👉 用中文(放开写 · 几乎免疫)
  │       👉 或英文压到 ≤ 500 字符
  │       👉 禁堆"sleeves rolled up / sits at desk / subsurface / pore"
  │
  ├── ② 人物 + 静态存在(全身肖像 / 坐着 / 站着)
  │       🟡 中档 · 可走完整方法论
  │       👉 中/英都行 · 55 行甜区
  │       👉 03 蝴蝶少女 2100 字符过 · 可参考
  │
  └── ③ 纯场景 / 静物 / 风景 / 建筑
          🟢 安全档 · 随便写
          👉 1500-2000 字符也过
          👉 可堆 hex + exclude + watermark 指令完整结构
```

**何时挂**:**只有**档 ① 在英文长 prompt(> 800 字符)+ 堆动作/身体/解剖细节时挂。**其他几乎不挂**。

---

## 📊 第二步 · 今日实测数据(17 组对照)

| 档 | 样本 | 内容 | 字符 | 结果 |
|---|---|---|---|---|
| ① 英文动作 | 06 v1 | young woman + writing letter + 堆细节 | 4772 | ❌ |
| ① 英文动作 | 06 v3 | 同上压缩 | 1791 | ❌ |
| ① 英文动作 | M | 纯叙事删结构组件 | 961 | ❌ |
| ① **英文动作** | **W** | **woman + sits writing + 身体 + 衣着** | **486** | **✅ 边界** |
| ① 英文动作 | U/V/E | 英文短人像 < 400 | 126-374 | ✅ |
| ① **中文动作** | **B** | **女子 + 读书 + Kodak** | **273** | **✅** |
| ① 中文动作 | G | 中文美女 + 写信 + hex + watermark 堆结构 | **665** | **✅**(中文宽容) |
| ① 中文动作 | X | 中文等价 W 内容 | 356 | ✅ |
| ② 英文静态 | 03 蝴蝶少女 | 全身肖像 + 装饰细节 + 完整方法论 | ~2100 | ✅(devlog S 级) |
| ③ 英文场景 | Test 4 | 金毛湖畔 | 1474 | ✅ |
| ③ 英文场景 | 07 v1 | 东京 neon rain(赛博 dark 密度) | 2778 | ❌ |
| ③ 中文场景 | 09 苏州园林 | 全结构 | 1190 | ✅ |

**精确规律**:
- 档 ① 英文临界 **~500 字符**
- 档 ① 中文 **无临界**(665 字符仍过)
- 档 ③ 赛博 dark 场景 · 临界 **~1800 字符**(`image2-prompt-writer` skill 已有 T-30 规则)

---

## 🏗️ 第三步 · 成功骨架模板(3 档直接抄)

### 档 ① · 英文人像 + 动作(**≤ 500 字符**)

```
A 35mm film portrait of a young woman [POSE · 静态化] in [SCENE], [LIGHTING 1 句].
[简短环境 · 1-2 句 · 不写 sits at / sleeves rolled / subsurface]
Warm amber / sage / parchment tones, Kodak Portra film grain, shallow depth of field.
Aspect ratio [X:Y] [orientation].
```

### 档 ① · 中文人像 + 动作(**放开写 · 55 行甜区**)

```
[简要定位 · 1 句 + aspect]

[主体段 · 人物 + 动作 + 衣着 + 表情 · 3-5 句]

[环境段 · 场景 + 光线 + 物件 · 3-5 句]

色调锚定:[5 个中文色名:暖褐 / 琥珀金 / 苔绿 / 米白 / 天青 · 可带 hex]

光线方向:[god ray / rim light / 漫射 · 1-2 句]

质感可见:[纹理列 3-5 处]

构图:[主体位置 · 画幅比例]

高质量 4K 风格收尾 · [aspect 重申]
```

### 档 ② · 人像静态存在(中/英都可 · 55 行)

参考 `content/examples/03-vintage-butterfly-portrait.md`(已 S 级)· OpenAI 官方骨架:
```
background/scene → subject → key details → constraints → intended use
```

### 档 ③ · 场景 / 静物(**可全 attack · 无忧**)

参考 `content/examples/09-suzhou-garden-morning`(中文)或 `04-cyberpunk-teahouse`(英文 T-30 赛博)。

---

## 📐 第四步 · 30 原子 · 3 层矩阵(devlog 锁定)

### 🔴 Tier 1 必填 5(缺 1 图塌)

| 原子 | 写法 | 反例 |
|---|---|---|
| **Subject** | 具象名词 + 特征 | "a young woman with long chestnut hair" | ❌ "a girl" |
| **Style + Signatures** | 3-5 视觉锚 | "thick ink outlines + flat color + washi grain" | ❌ "ukiyo-e style" |
| **Scene** | 环境具体 | "a narrow Showa-era shop front at dusk" | ❌ "a shop" |
| **Color (hex)** | 3-5 hex + 角色 | "#2c1810 warm brown / #e8a048 amber" | ❌ "warm palette" |
| **Aspect** | 13 种比例之一 + 方向 | "Aspect ratio 3:4 vertical" | ❌ "1024x1024" |

### 🟡 Tier 2 建议 4(加满升 S 级)

| 原子 | 写法 |
|---|---|
| **Lighting** | god ray / rim / flood / golden hour · 方向显式 |
| **Exclude** | 3-5 条 **abstract**(不具名)· "no branded logos / no celebrity likeness" |
| **Composition** | 主体位置 + 占比 + 负空间 |
| **Preserve** | 迭代时才用 · 首次可省 |

### 🟢 Tier 3 可选 7(加料)

Mood · Medium · Camera · Details · Placement · Effects · Watermark

---

## 📏 第五步 · 3 档密度模板(devlog · 按题材选)

| 档 | 行数 | 字符 | 用场 |
|---|---|---|---|
| **极简** | 30-40 | 1800-2400 | 快速原型 / **档 ③ 赛博 dark** / **档 ① 英文人像动作(必 ≤ 500)** |
| **标准** | 50-60 | 2800-3800 | **默认 · S 级甜区** · 档 ② 静态人像 / 档 ③ 场景风光 |
| **豪华** | 80-120 | 6500-8000 | 多主体史诗 · 非必要别上 |

---

## 🧠 第六步 · 6 条硬法则(devlog + 官方 + 今日实测)

1. **Style signatures > 流派名词**(不写"ukiyo-e"· 写"thick ink outlines + flat color + washi grain")
2. **hex 色值 > 形容词**(`#c9a66b` > "warm autumn")
3. **Exclude 抽象 > 具名**(`no branded logos` > `no Coca-Cola/Nike`)
4. **官方骨架顺序**:background/scene → subject → key details → constraints → intended use
5. **中英选择**:**人像动作场景 · 优先用中文**(apimart moderation 对中文宽容)
6. **动作极简**:英文人像 prompt 避免"sits at desk writing letter + sleeves rolled up + 解剖细节" 组合

---

## 🚨 第七步 · Moderation 红线(7 条 · 按 skill 规则)

见 `.claude/skills/image2-prompt-writer/SKILL.md` 第 "Moderation Safety" 段:

1. Exclude 禁具名敏感实体
2. Exclude 最好不提"敏感主题排除"(提一次就输)
3. Chinese quoted text 禁歧义语义
4. Dark aesthetic content 控长度(T-30)
5. 流派堆叠红线(1-2 主流派封顶)
6. **结构化组件堆叠红线**(今日新增)
7. **人像 + 动作堆叠红线**(今日新增)

---

## ✅ 第八步 · Lint 自检(写完走一遍)

- [ ] Tier 1 五件齐?(subject / signatures / scene / hex / aspect)
- [ ] 是否按"档"选密度?(① 英文动作 ≤ 500 / ② 静态 55 行 / ③ 场景放开)
- [ ] 英文人像是否避免"writing letter + sleeves rolled + subsurface"组合?
- [ ] Exclude 全 abstract 无具名?
- [ ] aspect 出现 ≥ 2 次?
- [ ] 中文?(**首选** · 除非目标用户非中文)

---

## 📂 配合材料

- `_template.md` · 三层 MD 模板
- `content/examples/01-09` · 已实测样例(标了 rating)
- `.claude/skills/image2-prompt-writer/SKILL.md` · 完整方法论 skill
- `api/README.md` · apimart CLI 使用
- `spec/devlog/01.md` · 方法论历史(17 个 entries 全天调研)

---

## 🎓 一句话总结

> **人像动作用中文 · 静态人像用 55 行 · 场景放开写 · 首选中文 · 3 个 Tier 1 五件必齐(Subject + Signatures + Scene + hex + Aspect)**。

其他都是微调 · 但这一句是 90% 的成功公式。
