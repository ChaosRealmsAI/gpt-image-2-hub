---
# ═══════════════════════════════════════════════════════════════
# LAYER 1 · META  (机器可读 · 系统 / 开发者 / 搜索引擎)
# 终端用户看不到 · 只进 schema 不进 prompt
# ═══════════════════════════════════════════════════════════════

# —— 身份 ——
id:            "05-showa-tea-shop"
name:          "昭和茶饮店 · Showa Tea Shop Facade"
version:       "1.0"
created:       "2026-04-22"
updated:       "2026-04-22"

# —— 分类 ——
category:      "poster"
sub_category:  "retro-environment-poster"
intent:        "poster"

# —— 技术开关 ——
model:         "gpt-image-2"
thinking:      "on"
aspect:        "3:4"
quality:       "high"
has_ref_image: false
has_text:      true

# —— 搜索 / 筛选 ——
tags:          [showa, japanese, tea-shop, retro-poster, dusk, kimono, vintage, warm-tones, storefront, analog]
difficulty:    "medium"
rating:        "untested"
status:        "draft"

# —— 品牌 / 水印 ——
watermark:     "integrated"
watermark_text: "Prompt Atlas · 2026"

# —— 血缘 ——
derived_from:  null
variants:      []
---

# 昭和茶饮店 · Showa Tea Shop Facade

> **一句话定位**: 黄昏昭和风茶饮店门面复古海报 · 3:4 竖版

---

## 🎯 LAYER 2 · PROMPT  (终端用户 · 复制即跑)

### 原始需求(用户口语)

> "做一张日式昭和风茶饮店门面 · 黄昏时分 · 窗内有穿和服的店主 · 招牌写「和菓子」· 要复古海报感 · 3:4 竖版"

### 变量槽 (用户可改的)

| 槽位 | 默认 | 可选枚举 |
|---|---|---|
| `time_of_day` | 黄昏 / dusk | 正午 noon / 雨夜 rainy night / 初雪 first snow |
| `sign_text` | 「和菓子」 | 「甘味処」/「茶屋」/「珈琲」 |
| `owner_attire` | 深色染花和服 | 浅色棉麻浴衣 / 藏青掛羽織 |

> **Skill 化做法**: 更换 sign_text + time_of_day 两个 chip 即可生成昭和街道系列。

### 自然语言 Prompt · 点这里复制

```
A vertical retro poster illustration of a Japanese Showa-era tea and wagashi shop facade at dusk, rendered in a painterly hand-printed style with the warm grain of vintage mid-century Japanese travel posters. Aspect ratio 3:4 vertical.

The shop front is a narrow two-story wooden building with aged cedar planks and dark lacquered crossbeams. Sliding shoji screens glow from within, backlit by warm amber lantern light. A fabric noren curtain hangs at the entrance, dyed in deep indigo with a simple mon crest pattern, gently swaying. Wooden window frames with frosted glass panels frame the interior softly.

Through the central shop window, a middle-aged woman shopkeeper is visible from the waist up, wearing a dark floral-patterned kimono in deep plum and persimmon tones. She is arranging wagashi sweets on a lacquered tray with deliberate care, her face calm and softly lit by the interior lantern glow. Her posture is upright and unhurried.

The exterior signage is a vertical hanging wooden board above the entrance, bearing hand-brushed ink calligraphy reading「和菓子」in bold, slightly irregular brushwork strokes — the text must be clearly legible, centered on a weathered natural-wood background with soft ink bleeding at stroke edges.

Color palette anchored to: deep warm dark brown (#2c1810) for shadow and wooden architecture; amber lantern glow (#e8a048) as the dominant warmth flooding from the window; muted sage green (#7a9e7e) for wooden shutters and a small potted plant at the doorstep; warm parchment (#d4c4a0) for paper lantern surfaces and noren highlights; mid-brown (#5c4033) for structural beams and window trim. The overall palette is desaturated by approximately 15%, giving a faded, time-worn quality consistent with aged print lithography.

The sky above the roofline shows a dusk gradient from deep burnt sienna at the horizon to a dusty indigo above, with no stars yet visible. Soft golden god rays rake diagonally from the upper-right, catching dust motes and giving the scene a warm, hazy backlit quality. Street-level reflections of amber light appear faintly on the wet stone pavement below.

Texture must be visible on: the aged cedar planks of the facade (horizontal wood grain with subtle splits), the hand-printed noren fabric (visible warp and weft threads), the wooden signboard surface (weathering grain beneath the ink), and the stone pavement (irregular cobble joints with moss traces).

Composition: the shop facade occupies the full vertical frame from pavement to roofline, centered, with the signboard at upper third. The shopkeeper visible through the window sits at center mass. Negative space above the roofline carries the dusk sky. Foreground cobblestones recede toward the entrance. Aspect ratio 3:4 vertical.

Watermark in lower-right corner: "Prompt Atlas · 2026" in small roman type, 25% contrast against the dark cobblestone, never overlapping the shop facade or signboard.

Exclude: any modern signage, digital displays, or contemporary street furniture; any branded or commercial logos; any anachronistic vehicle or modern clothing; any character stereotypes or caricature expressions.

High quality, 4K, painterly vintage-print finish. Aspect ratio 3:4 vertical.
```

**操作步骤**:
1. 打开 ChatGPT (Plus / Team / Enterprise)
2. 手动点 **Thinking** toggle(frontmatter thinking: on)
3. 粘贴 Prompt · 发送
4. 等 30–120s

---

## 🔬 LAYER 3 · FEEDBACK  (内部 · 验证 · 迭代)

### Observation points (跑完自检 checklist)

- [ ] 店铺正面完整呈现 · 木建筑质感可见
- [ ] 店主和服可辨 · 表情自然非夸张
- [ ] 「和菓子」招牌汉字清晰可读 · 笔触有手书感
- [ ] 黄昏光感 · 室内琥珀暖光从窗透出
- [ ] 水印位置右下角 · 不压主体
- [ ] 整体色调偏暖褪色 · 无过度饱和
- [ ] 长宽比 3:4 竖版执行正确

### Known issues / 已知软肋

- Image 2 对中文手书风格「和菓子」字形可能出现笔画错误或简化 · 需验收
- 透过窗户的人物(半遮挡 · 逆光)是 Image 2 已知挑战场景 · 人物细节可能模糊
- 昭和木质建筑密集细节(木纹 / 格栅 / 暖帘)组合时模型可能过度平滑

### Iteration log

- **v1.0** (2026-04-22): 首发 · 按 image2-prompt-writer skill 7 步思维链生成

### Variants / 衍生

- 雨夜版: `time_of_day` 换 rainy night · 添湿石板反光 · 蓝灰色调
- 冬日版: `time_of_day` 换 first snow · 屋檐积雪 · 冷暖对比

### Record / 对产品的贡献

- 覆盖原子层: L1 内容(昭和店面) / L2 表达(复古海报手法) / L3 氛围(黄昏暖光) / L6 文字(汉字招牌) / L8 位置(构图布局) / L10 品牌(水印)
- Image 2 独家能力: Thinking 模式 / 引号精确文字渲染「和菓子」/ 高质量纹理细节
- 可作为: 昭和日式街景系列 skill 模板 · sign_text + season chip 化
