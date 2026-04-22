---
name: image2-prompt-writer
description: 写 GPT Image 2 提示词(给 ChatGPT / apimart / 任何走 gpt-image-2 的入口)· 核心思路:发挥模型能力 + 从各维度描述不遗漏 + 引号锁文字 + 做完自检 + 3 条避坑。不填原子表 · 不走思维链。ALWAYS invoke when 用户说"写提示词 / 帮我做一张 X 图 / 画 X 海报 / 做人像 / 做漫画 / 做角色立绘 / 按 GPT Image 2 Hub 写 / 做 skill 配方"· 或需给 apimart `gpt-image-2` 批量 prompt · 或要往 `content/examples/` 加新示例。本 skill 只管 prompt 工艺 · 不管 CLI — 调用走 `apimart-image-gen` skill 或项目 `api/README.md`。
---

# Image 2 Prompt Writer · GPT Image 2 提示词工艺

**一句话**:发挥模型能力 · 从各维度描述不遗漏 · 引号锁文字 · 做完自检 · 避 3 个坑。

gpt-image-2 模型本身很强 · 不需要把它当小学生教。你只要**用自然语言把画面想清楚 · 各维度写清楚 · 别触发 moderation**。

---

## 🎯 何时触发

- "写个 X 的提示词" / "帮我做一张 X" / "画一个 X"
- 给 `apimart-image-gen` 批量 prompt
- 把口头 brief 变成可跑 prompt

---

## 📐 写法 · 3 档(按场景灵活选 · 不固定)

### 档 A · prose(< 800 字符)· 简单主题
一段段自然语言 · 不加 label。短 / 快 / 干净。

### 档 B · 5-slot label(800-1500 字符)· 中等复杂度

```
Scene:
[场景 · 时间 · 背景]

Subject:
[主体 · 特征]

Important details:
[光 · 色 · 质感 · 构图 · 引号文字]

Intended use:
[这是做啥用的 · aspect 重申]

Constraints:
[抽象约束 · 不具名 · 🔴 见避坑 1]
```

### 档 C · 9-slot 扩展(> 1500 字符)⭐ 复杂场景推荐

```
Scene:            场景 / 时间 / 背景
Subject:          主体 / 特征 / 核心动作
People:           人物独立(避免跟 Subject 混)
Environment:      环境细节堆这(不挤 Scene)
Screens and text: 引号文字集中
Camera and lighting: 镜头 + 光一起
Composition:      构图 / 画幅
Style:            风格总结一句
Intended use:     用途定基调
```

**所有 slot 都可加可减**:
- 没有人物 → 省 People
- 没有文字 → 省 Screens and text
- 需要新维度 → 加(比如 `Materials:` / `Mood:` / `Color palette:`)

---

## 🧩 维度清单(写之前扫一眼 · 别遗漏)

模型需要你告诉它以下维度(不用全写 · 按主题选):

- **场景**:在哪?啥时候?什么季节?
- **主体**:画啥?(人 / 物 / 动物 / 建筑 / 抽象)
- **特征**:主体长啥样?穿什么?什么姿态?
- **风格**:什么媒介?(摄影 / 油画 / 插画 / 3D / 水墨 ...)
- **光线**:什么光源?什么方向?什么氛围?
- **色调**:暖 / 冷 / 互补 / 单色?可给 hex 也可给形容词
- **构图**:景别(特写/广角)/ 角度(俯/仰)/ 主体位置
- **质感**:质感细节可见在哪?(纹理 / 颗粒 / 反射 ...)
- **文字**:有文字吗?引号精确锁字符
- **画幅**:16:9 / 3:4 / 9:16 / 1:1 ...(开头 + 收尾各 1 次)
- **用途**:海报 / UI / 杂志封面 / 人像 / ad(帮模型定基调)

---

## 📝 4 个核心工艺(必须做)

1. **主体用英文 prompt**(默认) · 模型指令跟随最稳 · 国际化 · SEO 友好
2. **引号内精确文字 = 目标地区语言**(用 gpt-image-2 独家非拉丁 99% 能力):
   - 中国市场 → `"图灵观察" / "和菓子" / "欢迎光临"`
   - 日本市场 → `"ようこそ" / "本日の特選"`
   - 韩国市场 → `"서울 · 2026"`
   - 中东市场 → `"مرحبا"`(阿拉伯 RTL 支持)
   - 印度市场 → `"स्वागत है"`(Hindi)或 `"স্বাগতম"`(Bengali)
   - 单图可混多语言(官方 demo 支持 9 种同屏)
3. **画幅说 2 次** · 开头 + 收尾各 1 次(`Aspect ratio 2:3 vertical`)
4. **用途要写** · 一句 intended use 让模型定基调(editorial poster / UI mockup / product shot)

hex 色值 vs 形容词 color:**都行**(实测都能出彩) · 按需。

---

## 🚨 3 条避坑(实测挂过)

### 坑 1 🔴 · Constraints 段别写 "No X / No Y" 列表
```
❌ No distorted hands. No extra fingers. No real logos. No flags. ...
```
这种枚举"不要什么"**最高挂 moderation 概率**。官方 cookbook 也不推荐。

✅ 改法:**整段删**。实在要写 · 抽象 1 句:`Avoid any branded or commercial elements.`

### 坑 2 · 英文 + 人像 + 动作 > 800 字符 易挂
**默认英文 prompt**(规则 1)· 但遇**人像 + 具体动作**场景:
- 优先压到 ≤ 500 字符英文 · 姿态极简化(不写 "sleeves rolled up / sits at desk / subsurface")
- 还挂 → **退到中文全写**(中文 moderation 几乎免疫)
- 再挂 → 去掉人物 · 改纯场景

### 坑 3 · 别用方括号原子标注 `[01 Subject = ...]`
实测模型被方括号干扰 · 文字渲染漏处最多。原子清单是**脑里的思考** · 不是 prompt 里的语法。

---

## ✅ Self-check(写完过一遍 · 4 条)

- [ ] **想象落图**:读一遍 prompt · 脑里能"看到"图吗?看不到就补维度
- [ ] **维度齐**:场景 / 主体 / 光 / 色 / 构图 / 风格 / 文字 / 用途 · 相关的都写了吗
- [ ] **英文主体 + 引号本地化**:prompt 主体英文 · 要渲染文字按目标地区写(中 / 日 / 韩 / 阿 / 印)
- [ ] **引号精准**:字符对吗 · 字体描述 + 位置 + 颜色齐吗
- [ ] **触发词扫**:Constraints 没写 "No X" 列表吗?英文人像有没超 800 字符

任一 ❌ → 回改再跑。

---

## 📏 挂了怎么办(3 步定位)

1. **先删 Constraints 段全部 "No X / No Y"** · 80% 的挂是这
2. **改中文**(如果原本英文 · 中文几乎免疫)
3. **还挂就极简** · 压到 < 600 字符 · 删人物 → 纯场景

二分定位 · 切 prompt 两半分别 submit · 看哪半挂。

---

## 🛠️ 输出流程

```
用户 brief
    ↓
估长度 / 选档(A/B/C)· 脑里扫维度
    ↓
写 prompt(prose 或 label · 看档)
    ↓
Self-check 4 条过一遍
    ↓
跑 `apimart-image-gen` skill · open
    ↓
用户要留档 → 再写进 `content/examples/NN-slug.md`(三层 MD)· 不要求就别硬走
```

---

## 📚 参考

- **`content/_prompt-best-practice.md`** · 最终决策树 + 3 档模板 + 实测数据
- **`content/examples/01-09`** · 已跑过的样例 · 复读学其 prose 风
- **`content/_template.md`** · 想长期留档时的三层 MD 模板
- **`api/README.md`** · apimart CLI 用法
- **姊妹 skill**:`apimart-image-gen`(全局)· 跑图 · 批量 · 重试
- **实测历史**:`spec/devlog/01.md` · 方法论验证时间线

---

## 🔐 Skill 边界

本 skill **只管**:
- 怎么写 prompt(工艺 + 结构 + 避坑)
- Self-check

本 skill **不管**:
- CLI 调用 → `apimart-image-gen`
- 视觉设计系统 → `design-system`
- BDD 场景 → `bdd-scaffold`
- 讲解 HTML → `explain-to-pm`

---

## 💡 心态 · 发挥模型能力

- **模型很强** · 别把它当小学生教 · 别堆方法论词
- **自然语言就够** · YAML / JSON / 方括号标注都是画蛇添足
- **先写再精** · 一段写出来 · 自检改 · 跑了再迭代
- **默认英文 prompt + 引号里写目标地区语言** · 这是 gpt-image-2 独家强项的最优搭配(详见工艺 2)
- **人像挂了才退到中文**(非必要不用中文全写 · 中文 prompt 虽稳但国际化 / SEO 弱)
