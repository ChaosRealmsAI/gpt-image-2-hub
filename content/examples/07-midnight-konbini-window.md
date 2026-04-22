---
# ═══════════════════════════════════════════════════════════════
# LAYER 1 · META
# ═══════════════════════════════════════════════════════════════

# —— 身份 ——
id:            "07-midnight-konbini-window"
name:          "午夜东京便利店橱窗 · Midnight Konbini Window"
version:       "1.0"
created:       "2026-04-22"
updated:       "2026-04-22"

# —— 分类 ——
category:      "poster"
sub_category:  "cinematic-environment-poster"
intent:        "poster"

# —— 技术开关 ——
model:         "gpt-image-2"
thinking:      "on"
aspect:        "3:2"
quality:       "high"
has_ref_image: false
has_text:      false

# —— 搜索 / 筛选 ——
tags:          [konbini, tokyo, rainy-night, neon, cyberpunk-lite, environment, storefront, reflection, atmospheric, painterly]
difficulty:    "medium"
rating:        "untested"
status:        "draft"

# —— 品牌 / 水印 ——
watermark:     "integrated"
watermark_text: "Prompt Atlas 2026"

# —— 血缘 ——
derived_from:  null
variants:      []
---

# 午夜东京便利店橱窗 · Midnight Konbini Window

> **一句话定位**: 雨夜东京便利店橱窗外视 · 霓虹反光 + 雨水 · 3:2 横版电影感海报

---

## 🎯 LAYER 2 · PROMPT  (终端用户 · 复制即跑)

### 原始需求(用户口语)

> "做一张雨夜东京便利店的电影感海报 · 橱窗里灯火通明 · 外面湿漉漉的街道映着霓虹 · 不要真人 · 横版"

### 变量槽 (用户可改的)

| 槽位 | 默认 | 可选枚举 |
|---|---|---|
| `sign_color` | 电光品红 / magenta | 青绿 jade-green / 冰蓝 ice-blue / 暖橙 amber |
| `weather` | 雨夜 / rainy | 雪夜 snowy / 雾夜 foggy / 晴夜 clear |
| `time_hint` | 午夜 / midnight | 傍晚 dusk / 凌晨 predawn |

> **Skill 化做法**: 替换 sign_color + weather 两个 chip 生成"便利店系列"(雨夜 / 雪夜 / 雾夜 × 三色霓虹)。

### 自然语言 Prompt · 点这里复制

```
A cinematic horizontal environment poster of a rain-soaked Tokyo convenience store window at midnight, rendered in a moody painterly print style with rich atmosphere and saturated neon. Aspect ratio 3:2 horizontal.

The storefront fills the right two-thirds of the frame. A warm yellow-white LED flood illuminates the interior through a large plate-glass window streaked with descending rain. Inside, orderly rows of colorful plastic-wrapped onigiri, bento boxes, and glass bottles line the shelves, their labels abstract and unreadable. A tall refrigerated beverage case glows cold cyan on the far wall. A half-empty shelf of canned drinks catches a magenta spill from the neon sign above.

Through the glass, condensation forms patchy fog at the corners. Sheets of rain pour down the outside of the window, distorting the interior lights into soft vertical streaks of color. Above the entrance door, a hand-painted looking neon sign emits electric magenta glow, casting faint pink spill onto the wet concrete curb below.

In the left third of the frame, the dark rain-slick asphalt street stretches into receding depth. Its surface mirrors scattered neon reflections — magenta, jade-green, and amber puddles merging with motion-blurred streetlight bokeh near the horizon. A single folded newspaper on the sidewalk catches soft backlight from the store.

Palette anchored to: near-black street void #0d1b2a for the surrounding night; electric magenta neon #e84393 as the dominant accent above the entrance; jade-green refrigerated glow #00b894 cooling the interior depth; amber warm counter light #f39c12 hovering at shelf height; steel-gray wet asphalt #95a5a6 reflecting the scene. Saturation slightly pushed, contrast high, shadows inky.

Volumetric drizzle is visible suspended in the neon beams, catching the light as fine mist. Subtle CRT-like scanline shimmer appears on the interior LED panels. A distant traffic light's soft bokeh halo glows in the far-left background, out of focus.

Texture must be visible on: the wet asphalt surface with irregular seams and reflective puddles, the streaked glass window with vertical rain trails and refractive caustics, the aged concrete curb with weather-worn speckle, and the painted neon tubes with soft bloom and visible filament structure.

Composition: storefront occupies the right two-thirds with the neon sign at upper third, the street recedes into the left negative space, horizon line at lower third. Aspect ratio 3:2 horizontal.

Watermark in the lower-right corner: "Prompt Atlas 2026" in small serif type, 20% contrast against the dark street, never overlapping the storefront.

High quality, 4K, painterly cinematic print finish with saturated neon and crisp rain detail preserved. Aspect ratio 3:2 horizontal.
```

**操作步骤**:
1. 打开 ChatGPT (Plus) 或走 `apimart-image-gen` skill
2. frontmatter thinking:on → 手动开 Thinking
3. 粘贴 Prompt · 发送
4. 等 30–60s

---

## 🔬 LAYER 3 · FEEDBACK

### Observation points

- [ ] 橱窗内部清晰可辨:饭团 / 便当 / 饮料柜 · 不堆真实商标
- [ ] 雨水垂直条纹在玻璃上 · 光被扭曲成竖向色条
- [ ] 街面倒影色彩(品红 / 青绿 / 琥珀)层次分明
- [ ] 招牌品红光晕不过曝
- [ ] 水印右下角 · 不压橱窗 / 不压招牌
- [ ] 长宽比 3:2 横版
- [ ] 整体无真人入镜(按 brief)

### Known issues

- Image 2 渲染小物体(饭团 / 便当上的图案)可能出现不合理文字或图形拼贴
- 玻璃反射 + 雨水折射组合是强项 · 但偶有光线方向不一致
- 招牌若叠文字 · 字形可能乱(所以默认不加文字)

### Iteration log

- **v1.0** (2026-04-22): 首发 · 按 image2-prompt-writer skill 7 步思维链生成
- **密度**: T-30 紧凑档 (~2100 字符 · 含 cyber-ish signatures · 按新红线 6 避坑 · 纯环境无人)

### Variants

- 雪夜版: `weather` 换 snowy · 窗外飞雪 · 冷色调主导
- 青绿版: `sign_color` 换 jade-green · 换主色反转氛围

### Record

- 覆盖原子层: L1 内容(场景) / L2 表达(painterly cinematic) / L3 氛围(雨夜) / L8 位置(右 2/3 构图) / L9 技术(反射 + 折射) / L10 品牌(水印)
- Image 2 独家: Thinking 模式 / 高精度玻璃反射 / 霓虹光晕
- 可作为: 日系街景便利店系列模板 · sign_color + weather 两 chip
