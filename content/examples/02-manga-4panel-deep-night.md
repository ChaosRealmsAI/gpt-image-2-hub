# 示例 02 · 4 格漫画 · 深夜代码战

**原始用户需求 (口头模糊版)**:
> "帮我做一个 4 格漫画 · 两个程序员深夜改 bug · 一个乐观一个悲观 · 日漫风格"

**分类标签**: `manga` · `4-panel` · `slice-of-life` · `black-humor` · `webtoon`

**Intent 激活**: `comic` → 自动解锁 **Narrative · Panels · Characters · Dialogue** 4 个专属扩展大类 · 加原有 10 大类 · 总共 14 大类字段填充.

**演示重点**: Intent 父字段如何驱动下游扩展 · 以及叙事类型需要的 **3 层氛围分离**(Style 视觉 / Mood 单帧 / Narrative.atmosphere 故事基调).

---

## 结构化字段视图 (YAML · 用户看)

```yaml
# ══════════════════════════════════════
#   通用 10 大类(所有 Intent 都有)
# ══════════════════════════════════════

intent:
  primary:        "comic · manga 4-panel · webtoon vertical"
  sub_type:       "slice-of-life / daily black-humor"
  use_case:       "社交分享 · 公众号配图 · 程序员社区 meme"

subject:
  main_characters: 2
  setting_brief:  "deep-night tech startup office"
  action_summary: "debugging together, two opposite coping styles"

scene:
  location:       "modern startup office cubicle at 02:00 AM"
  clutter:        "coffee cups · empty energy drinks · sticky notes scattered"
  light_sources:  "dim desk lamp + pale-blue monitor glow"
  window:         "rainy night city lights in far background"

style:
  medium_look:    "modern Japanese manga line art · crisp black ink · screentone shading"
  line_weight:    "variable · bold foreground · thin background"
  color_mode:     "grayscale with ONE selective accent"

medium:
  primary:        "manga ink · digital screentone"
  texture:        "subtle paper grain · slightly hand-drawn feel"

lighting:
  primary:        "cold pale-blue monitor glow on faces"
  secondary:      "warm dim desk lamp pool"
  contrast:       "high-contrast manga shadows"

color:
  palette:        "B&W grayscale · ONE accent: pale electric blue (#3b82f6)"
  accent_rule:    "accent applied to screen glow ONLY · never to clothing or skin"

composition:
  format:         "webtoon vertical scroll · 4 panels stacked top-to-bottom"
  gutter:         "thin white gutters between panels"
  reading_flow:   "top → bottom · phone scroll natural"

camera:
  panel_1:        "wide establishing · slight low angle"
  panel_2:        "medium shot · side angle on char_A"
  panel_3:        "tight close-up · char_B face"
  panel_4:        "medium-wide · dawn breaks through window"

mood:
  # 这是"单帧情绪" · 每格独立
  panel_1:        "weary · establishing calm"
  panel_2:        "naive optimism"
  panel_3:        "dry deadpan judgement"
  panel_4:        "cosmic absurd relief"

aspect_ratio:     "9:16 webtoon vertical"

quality:
  level:          "high"
  resolution:     "4K for phone-screen clarity"
  typography:     "sharp bubble text · zero typos · clear at small reading size"

watermark:
  # 🆕 独立原子 · 所有 Intent 通用 · 产品自身品牌签名
  # 核心诉求:风格协调 + 不影响观感 + 仍可看清
  text:             '"Prompt Atlas · 2026"'
  position:         "lower-right corner, within the frame (integrated, NOT overlay)"
  style_rule:       "matches the dominant visual language of the image — same medium · same line weight · same color family as the main artwork · rendered as if the artwork naturally contains this signature"
  integration:      "visually harmonious with main scene · legible on close inspection · never competes with main subject"
  opacity:          "subtle · ~25-35% of main content contrast · still clearly readable at 100% zoom"
  medium_matching:
    manga:          "small hand-drawn artist signature in final panel's corner · same B&W ink · same line weight as dialogue"
    oil_painting:   "faint painter's signature in matching brushwork · darkly integrated into rock / canvas corner"
    poster:         "embossed or etched lettering on glass / metal element · same metallic material family"
    photo:          "subtle engraved or stamped mark mimicking a real camera watermark · same color grade"
    3d_render:      "small 3D-rendered logo on a believable surface within the scene (plaque / base / sticker)"
    flat_design:    "minimalist line mark in a corner · same line weight as the design's keylines"
  fail_modes_to_avoid:
    - "stamping as post-process overlay that breaks the medium"
    - "bright saturated color that pops out of the palette"
    - "sharp crisp text on a painterly surface (medium mismatch)"
    - "too opaque · covers main subject · distracting"
    - "too faint · invisible at normal zoom"
    - "placed over a character's face or key dialogue"

constraints:
  preserve:
    - "same two characters consistent across ALL 4 panels (same face · same outfit)"
    - "B&W grayscale with pale-blue screen accent only"
    - "webtoon 9:16 vertical 4-panel layout"
    - "exact dialogue rendering · character-for-character"
    - "4 panels clearly separated by thin white gutters"
  exclude:
    - "colored clothing · colored skin"
    - "unspecified text on monitors or sticky notes (blur them)"
    - "any branded product logos (replace all with generic)"
    - "any watermarks / signatures OTHER than the one defined in the watermark section"
    - "extra characters in frame"
    - "recognizable real-world app UI on screens"

# ══════════════════════════════════════
#   漫画专属扩展(Intent=comic 激活的 4 大类)
# ══════════════════════════════════════

narrative:
  # "故事氛围"的正确家 · 不同于 Mood(逐帧)· 不同于 Style(视觉)
  genre:          "slice-of-life · 日常治愈 × 黑色幽默"
  atmosphere:     "疲惫自嘲中透着宇宙荒谬感"
  story_arc:      "起 · 承 · 转 · 合"
  pacing:         "静止缓慢 · 对白驱动 · 无激烈动作"
  central_tension: "盲目乐观 vs 冷静悲观 · 两种面对 bug 的态度"

panels:
  count:          4
  layout:         "webtoon 竖版堆叠"
  panel_specs:
    panel_1:
      purpose:    "起 · 建立环境与人物"
      shot:       "远景"
      key_beat:   "两人侧影对坐 · 深夜办公室乱境"
      mood:       "weary"
    panel_2:
      purpose:    "承 · 小沈乐观尝试"
      shot:       "中景"
      key_beat:   "char_A 按下 Enter 瞬间 · 自信微笑"
      mood:       "naive optimism"
    panel_3:
      purpose:    "转 · 阿麦 deadpan 反应"
      shot:       "特写"
      key_beat:   "char_B 面无表情 · 眼神死"
      mood:       "dry judgement"
    panel_4:
      purpose:    "合 · 天亮 · bug 自己好了"
      shot:       "中远景"
      key_beat:   "窗外天亮 · char_A 呆住 · 屏幕闪绿 ✓"
      mood:       "cosmic absurdity"

characters:
  - id:           "char_A"
    name:         "小沈 (Shen)"
    age_gender:   "25 男"
    appearance:   "宽松灰卫衣 · 乱糟糟黑短发 · 黑框眼镜滑到鼻尖"
    personality:  "盲目乐观 · 相信重启万能"
    consistency:  "across ALL 4 panels 保持同一人物 · 推荐上传 ref_image"
  - id:           "char_B"
    name:         "阿麦 (Mai)"
    age_gender:   "27 女"
    appearance:   "黑色帽衫戴帽 · 长直发垂下 · 无框眼镜"
    personality:  "悲观深思 · 直接判定架构问题"
    consistency:  "across ALL 4 panels 保持 · 推荐 ref_image"

dialogue:
  - panel:        1
    type:         "narration_box"
    position:     "top-left corner"
    text:         '"凌晨两点"'
    style:        "小号宋体 · 矩形旁白框"

  - panel:        2
    speaker:      "char_A"
    bubble_type:  "standard rounded · hopeful tone"
    position:     "upper-right of char_A"
    text:         '"再重启一次试试"'

  - panel:        3
    speaker:      "char_B"
    bubble_type:  "flat narrow · deadpan shape"
    position:     "upper-left of char_B"
    text:         '"你今晚重启第 17 次了"'

  - panel:        4
    composite:    # 本格两个文字元素
      sfx:
        text:     '"叮!"'
        position: "mid-frame near monitor"
        style:    "大拟声字 · 破碎笔画 · 带震动线"
      bubble:
        speaker:  "char_A"
        type:     "small trailing"
        text:     '"......"'

# ══════════════════════════════════════
#   技术开关(全局 · API / UI 层)
# ══════════════════════════════════════

technical_switches:
  thinking_mode:     "ON (必须 · 多角色一致 + 4 格连贯 + 多文字 · Instant 撑不住)"
  reference_images:
    - "char_A 人物参考图 (推荐上传 · 跨格一致关键)"
    - "char_B 人物参考图 (推荐上传)"
  sequence:          "ON · 一次出 4 格连贯(Image 2 多图一致性能力)"
  aspect_ratio_api:  "9:16"
  quality_api:       "high"

# ══════════════════════════════════════
#   元数据 · 本 prompt 覆盖的分类
# ══════════════════════════════════════

categories_covered:
  通用大类:   "10 个全激活"
  漫画扩展:   "Narrative + Panels + Characters + Dialogue · 4 个全激活"
  技术开关:   "Thinking + Sequence + RefImages + Aspect + Quality · 5 个"
  总原子数:   "≈ 19"
  3 层氛围分离:
    style:            "modern manga line art"
    mood_per_panel:   "weary / optimism / deadpan / absurdity"
    narrative_mood:   "疲惫自嘲 + 宇宙荒谬"
```

---

## 底层 Prompt (MD 版自然语言 · 复制粘贴给 Image 2)

> 点击产品里"📋 复制 Prompt (MD)" 实际复制的是下面这段 · 按官方骨架组织 · 模型吃着顺滑.

```
Create a 4-panel slice-of-life manga in webtoon vertical (9:16) format, rendered in crisp black-and-white manga ink style with screentone shading and ONE selective accent color — pale electric blue reserved exclusively for screen glow. Grayscale otherwise. No colored clothing. No colored skin. Line art with variable weight — bold foreground, thin background. Subtle paper grain texture.

Setting: a modern tech startup office at 2:00 AM, cluttered cubicle with coffee cups, empty energy drink cans, scattered sticky notes, a dim desk lamp, monitors emitting pale-blue glow, rainy city night visible through a window in the background.

Two characters appear consistently across ALL 4 panels with identical faces and outfits:

- Character A ("小沈 · Shen"): 25-year-old man, oversized gray hoodie, messy short black hair, black-frame glasses slipping down his nose, naive hopeful expression.

- Character B ("阿麦 · Mai"): 27-year-old woman, black hood pulled up, long straight hair falling forward, frameless glasses, deadpan pessimistic expression.

Panel 1 — establishing wide shot at slight low angle. Both characters seated across from each other at messy desks, side silhouettes visible, weary atmosphere. In the top-left corner, a small rectangular narration box renders exactly this text: "凌晨两点".

Panel 2 — medium shot, side angle on Character A. He reaches toward the keyboard with a hopeful naive smile. A rounded speech bubble upper-right of him renders exactly: "再重启一次试试".

Panel 3 — tight close-up on Character B's face only. Deadpan flat expression, dead eyes, zero emotion. A narrow flat speech bubble upper-left of her renders exactly: "你今晚重启第 17 次了".

Panel 4 — medium-wide shot. Dawn light breaks through the window behind Character A. He sits frozen in shock. A small green checkmark glows on the monitor screen. Large cracked SFX lettering with motion lines near the screen renders exactly: "叮!". A small trailing speech bubble from Character A renders exactly: "......".

Narrative genre: slice-of-life with deadpan black humor. Story atmosphere: weary self-deprecation warmed by cosmic absurdity. Story arc follows setup → naive attempt → dry reaction → collapse-resolution rhythm.

Layout: webtoon vertical scroll, 4 panels stacked top to bottom, thin white gutters between each panel, aspect ratio 9:16.

Hard constraints — preserve: the same two characters with identical features and outfits across all 4 panels; black-and-white grayscale everywhere except pale-blue screen-glow accent; exact dialogue rendered character-for-character; webtoon vertical 4-panel layout with clean gutters.

Exclude: colored clothing or skin tones, any unspecified text on sticky notes or monitors (blur them out), branded product logos from real companies (replace with generic unbranded equivalents), extra background characters, recognizable real-world app user interfaces on the screens, and any watermarks or signatures OTHER than the one specified in the watermark section below.

Watermark: In the lower-right corner of the final (fourth) panel, integrate a small watermark that renders exactly this text: "Prompt Atlas · 2026". Style-match the watermark to the artwork's dominant visual language — since this is B&W manga ink, render the watermark as a small hand-drawn artist-signature in the same B&W ink style, same line weight as the dialogue lettering, sitting naturally in the corner as if the manga artist signed their own page. The watermark must be subtle (around 25–35% of the main ink contrast) yet clearly legible at 100% zoom. It must not overlap any character's face, key action, or main speech bubble. It should feel integrated into the artwork — NOT stamped on top as an overlay.

Quality: high resolution 4K, sharp bubble typography, zero typos, readable at phone-screen size. Aspect ratio 9:16.
```

---

## 产品含义 · 这个例子教会了什么

### 1 · 3 层氛围正交分离(关键认知)

很多人把"氛围"当一个维度 · 其实有 **3 个独立原子** · 叙事作品必须全填:

| 原子 | 层级 | 本例 value |
|---|---|---|
| `style` | 视觉画面语言 | modern manga line art · B&W ink |
| `mood`(逐帧) | 每一格的瞬时情绪 | weary → optimism → deadpan → absurdity |
| `narrative.atmosphere` | 整个故事的弥漫调性 | 疲惫自嘲 + 宇宙荒谬感 |

**三者正交** · 可以: 吉卜力风(style) + 紧张(mood) + 治愈(narrative.atmosphere) · 三个层面各说各话 · 都能成立.

### 2 · Intent 父字段 → 下游扩展动态激活

选 `comic` 前: UI 只显示通用 10 大类.
选 `comic` 后: UI **自动展开** Narrative / Panels / Characters / Dialogue 4 个新抽屉.

这就是产品"字段有限枚举 · 但丰富到够用"的 UX 关键: **用户永远只看到当前 Intent 相关的那几十个 chip** · 不眩晕.

### 3 · 必须自由输入的 3 类(逃逸舱)

| 必自由的内容 | 理由 |
|---|---|
| `dialogue.text` 引号内容 | 每格对白无法穷举 |
| `characters.name / appearance` | 角色设定因人而异 |
| `subject` 主体细节 | 场景千变万化 |

其他全部走 **chip 枚举**. 自由输入只在这 3 处.

### 4 · 技术开关独立于 14 类字段

`Thinking · Sequence · RefImages · Aspect · Quality` 这 5 个是 **API / UI 层参数** · 不是 prompt 文本能触发的. 产品设计要把它们放**全局设置区** · 跟字段表单分开.

---

## 使用说明 · 去跑这条 prompt

1. **打开 ChatGPT** (Plus / Team / Enterprise 账号 · 否则没 Thinking)
2. **手动点 "Thinking" toggle 开启** · 这条 prompt 靠 Instant 模式撑不住
3. (可选但强烈推荐) **上传 2 张角色参考图**(char_A · char_B)· 保持跨格一致
4. **粘贴底层 MD prompt** (上面代码块)
5. **等 60-120 秒**(Thinking + Sequence 一起很慢)
6. 下方若显示 `Thought for X seconds` 则真用了 Thinking

## 观察点 · 跑完检查

| 看 Image 2 能否 |
|---|
| ✅ 4 格按指定布局 · 竖版 9:16 · 不合成单张 |
| ✅ 同一角色跨 4 格保持一致(脸 / 衣 / 发) |
| ✅ 3 条对白 + 1 处 SFX 引号文字精准 |
| ✅ 中文"凌晨两点 / 再重启一次试试 / 你今晚重启第 17 次了 / 叮! / ......" 全部字符无缺笔 |
| ✅ 每格 mood 不同但 narrative.atmosphere 一致 |
| ✅ 4K 可在手机上读清对白 |
| ⚠️ 是否守住 "B&W + 蓝色只给屏幕" 的 color 规则 |
| ⚠️ 是否混入乱序西文或装饰小字(Negative 测试) |

---

## 记录 · 本示例的产品价值

1. **演示了 Intent 父字段的条件扩展**(漫画解锁 4 个专属抽屉)
2. **示范了 3 层氛围的正交使用**(style / mood / narrative.atmosphere)
3. **展示了 dialogue 数组字段如何按 panel 组织**(产品 UI 按格一条 mini 卡)
4. **覆盖 19 原子**(10 通用 + 4 漫画扩展 + 5 技术开关 · 单例大覆盖)
5. **原创内容**(虚构角色与场景 · 无 IP 碰撞 · 可作模板持续复用)
