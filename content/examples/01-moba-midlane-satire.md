# 示例 01 · MOBA 中路讽刺梗图

**原始需求**:
> Help me generate a screenshot of Trump versus Khamenei in the mid lane in League of Legends.

**分类标签**: `politics-satire` · `meme` · `gaming-screenshot` · `caricature`

**用途**: 演示"一句模糊口头需求 → 结构化分类 prompt"的完整拆解链路 · 用户口头一句 · 产品翻译成 20 个字段的结构化 prompt · 跑出图.

---

## 结构化 Prompt (YAML 风格 · 自然语言内容)

把这段 YAML 直接粘到 ChatGPT · 切 Thinking 开关 · 16:9 · 等 30-90s.

```yaml
# ══ 意图与技术参数 ══
intent:          "comedic political satire meme · MOBA-style mid-lane screenshot parody"
aspect_ratio:    "16:9"
output_count:    1

# ══ 质量 · Quality ══
quality:
  level:         "high"
  resolution:    "4K game-screenshot feel"
  sharpness:     "sharp mid-ground, slight bokeh on distant jungle"
  film_grain:    "none (this is a clean game render)"

# ══ 媒介 · Medium ══
medium:
  primary:       "stylized game screenshot · cartoon 3D render with subtle HUD overlay"
  render_style:  "painterly 3D like high-quality MOBA splash art"
  sharpness:     "clean digital render, no photographic grain"

# ══ 风格锚 · Style ══
style:
  anchors:
    - "MOBA splash-art aesthetic (generic · NOT specific to any existing game)"
    - "political editorial caricature tradition"
    - "internet meme screenshot culture"
  era_feel:      "2020s internet parody culture"
  keywords:      ["cartoon 3D", "exaggerated caricature", "vibrant saturated", "epic confrontation"]

# ══ 主体 · Subject (双人对决) ══
subject:

  character_A:
    who:         "caricatured portrayal of former US President Donald Trump"
    style_note:  "clearly cartoon parody · NOT photorealistic portrait · big-head-small-body comedic proportions"
    pose:        "mid-lane champion combat stance, arms raised, one hand gripping an oversized golden microphone as a weapon"
    outfit:      "exaggerated red power suit with oversized flying tie, golden armor plating on shoulders mimicking fantasy armor"
    hair:        "iconic golden bouffant, exaggerated larger than normal, blowing back dramatically"
    expression:  "shouting battle cry, pursed lips, furrowed brow"

  character_B:
    who:         "caricatured portrayal of Iranian Supreme Leader Ayatollah Khamenei"
    style_note:  "matching cartoon parody style, same exaggerated proportions"
    pose:        "opposite combat stance, staff raised overhead"
    outfit:      "layered dark robes with ornate gold embroidery, black turban, rimless round glasses"
    weapon:      "tall wooden staff topped with a softly glowing crescent-moon gem"
    beard:       "long flowing white beard stylized"
    expression:  "stern confident glare, calm and commanding"

  positioning:   "two characters face each other across the mid-lane · about 30 meters apart · both in combat-ready stance · mirror symmetry"

# ══ 场景 · Scene ══
scene:
  location:      "generic fantasy MOBA middle lane · NOT any specific game's map"
  time:          "dusk · dramatic golden-hour sunset with storm clouds"
  environment:
    lane:        "wide stone-paved path cutting diagonally from lower-left to upper-right across the frame"
    sides:       "grass banks and low stone walls framing the lane · dark dense jungle visible on both sides"
    towers:      "one tall stone fantasy tower in far background behind each character · each emitting a soft magical energy beam into the sky (one warm red, one cool blue)"
    minions:     "6-8 small cartoon warrior minions (entirely generic fantasy footmen · NOT any copyrighted design) marching toward each other along the lane · red-team minions on character_A side (red tabards) · blue-team minions on character_B side (blue tabards)"
  sky:           "dramatic sunset with dark storm clouds · distant magical lightning"

# ══ 构图 · Composition ══
composition:
  framing:       "wide cinematic game-screenshot · slight 3/4 top-down camera angle · as if in-game spectator cam"
  placement:
    character_A: "lower-left third, facing right (toward opponent)"
    character_B: "upper-right third, facing left (toward opponent)"
    center_zone: "empty stone lane between them · visual tension · where the eye travels"
    minions:     "scattered in a line between the two heroes"
    towers:      "far background, one behind each character, providing symmetry"
  depth_planes:
    foreground:  "nearest minions, sharp"
    mid_ground:  "two main characters, sharpest"
    background:  "towers, jungle, sky, soft bokeh"
  balance:       "strong horizontal symmetry · classic duel framing"

# ══ 光照 · Lighting ══
lighting:
  primary:       "warm golden sunset backlight streaming from left · casts long dramatic shadows across the stone lane"
  accent_A:      "warm red-orange magical glow from character_A's tower"
  accent_B:      "cool blue-purple magical glow from character_B's tower"
  rim_light:     "both characters strongly rim-lit on their silhouettes to pop against background"
  shadow_quality: "dramatic but not too dark · cartoon-style clean shadows"

# ══ 色彩 · Color ══
color:
  palette:
    character_A_side:  "saturated red · gold · warm orange"
    character_B_side:  "deep green · black · cool blue"
    atmosphere:        "golden sunset · purple storm clouds · magical tower glows"
  grade:         "hyper-saturated meme vibrancy · high contrast · NOT muted"
  contrast:      "warm vs cool · the classic duel color aesthetic"

# ══ 镜头 · Camera ══
camera:
  perspective:   "elevated 3/4 top-down · in-game spectator view"
  lens_feel:     "wide angle · sharp from foreground to mid-ground"
  aspect:        "16:9 landscape · standard game screen ratio"

# ══ 情绪 · Mood ══
mood:
  primary:       "comedic epic confrontation"
  secondary:     "political satire humor · lighthearted parody"
  tone:          "clearly meme / parody · NOT serious propaganda · NOT reverent"
  avoid:         ["earnest", "dignified", "realistic geopolitical drama"]

# ══ 文字元素 · Text (严格按引号渲染) ══
text_elements:

  - id:          "meme_caption_top"
    location:    "top-center of frame · large bold outlined text in classic Impact-style meme font"
    content:     '"MID OR FEED"'
    color:       "white with black stroke outline"
    size:        "largest text in frame, clearly dominant"

  - id:          "hud_level_A"
    location:    "small HUD badge beneath character_A · left-lower third"
    content:     '"LVL 47"'
    style:       "stylized fantasy game UI number · red team color"

  - id:          "hud_level_B"
    location:    "small HUD badge beneath character_B · right-upper third"
    content:     '"LVL 47"'
    style:       "stylized fantasy game UI number · blue team color"

  - id:          "subtitle_bottom"
    location:    "bottom-center · subtle overlay · small"
    content:     '"MID LANE · 2026"'
    style:       "minimal game-title overlay"

# ══ 位置规则 · Placement ══
placement_rules:
  golden_ratio:      "two characters at opposite thirds intersections · classic confrontation rule"
  clear_sky_zone:    "upper 30% of frame reserved mostly clean for meme caption legibility"
  text_hierarchy:    "MID OR FEED (largest) > HUD levels (small) > MID LANE 2026 (subtle)"

# ══ 参考感觉 · References ══
references:
  aesthetic_mood:   "fantasy MOBA splash-art (generic) · political caricature editorial · meme screenshot culture"
  NOT_this:         "photorealistic portraits · serious propaganda · campaign poster · realistic geopolitical scene"

# ══ 禁用与约束 · Constraints (关键 · 防版权 & 防偏题) ══
constraints:

  preserve:
    - "clearly caricatured parody tone throughout (NOT photorealistic)"
    - "both characters in same matching cartoon style"
    - "MOBA screenshot cinematic 16:9 framing"
    - "all text rendered exactly as specified above · no typos"
    - "warm vs cool color duel"
    - "exactly ONE image output"

  exclude:
    - "any Riot Games / League of Legends specific UI elements · logos · champion model references · or copyrighted assets"
    - "any specific existing game's HUD, minimap, or icons"
    - "photorealistic likenesses of either political figure (keep cartoon caricature)"
    - "real-world national flags · political party symbols · religious sacred symbols"
    - "any text or lettering beyond the 4 text_elements explicitly specified"
    - "watermarks · signatures · copyright marks"
    - "blood · gore · violent injury (keep it comedic)"

# ══ 本 prompt 覆盖的分类 · 元数据 ══
categories_covered:
  subject:         "双人对决 · 政治人物漫画化"
  genre:           "政治讽刺 + 游戏 + meme"
  scene_type:      "MOBA 中路 · 奇幻场景"
  medium:          "游戏截屏 3D 渲染风"
  style:           "cartoon splash-art × 政治漫画 × 互联网 meme"
  composition:     "对称对决 · 游戏 3/4 顶视"
  lighting:        "金色逆光 + 双塔冷暖魔法光 + rim light"
  color:           "红金 vs 绿黑 阵营对比 · 高饱和"
  text:            "4 处文字 · meme 大字 + HUD 小字 + 标题"
  mood:            "喜剧 epic 对决"
  atoms_exercised: "Intent · Medium · Style · Subject × 2 · Scene · Composition · Lighting · Color · Camera · Mood · Text × 4 · Placement · References · Negative · Aspect · Quality (共 15+ 原子)"

# ══ 最终渲染指令 ══
render_instruction: |
  Execute all fields above as hard constraints.
  Treat both figures as clearly caricatured cartoon parody — NOT realistic portraits.
  Do NOT invent elements beyond the fields.
  Output ONE single 16:9 cinematic game-screenshot-style image.
```

---

## 产品形态启示

这个例子演示了 **Prompt Atlas 产品的核心价值链**:

| 阶段 | 用户输入 | 产品做什么 | 用户看到什么 |
|---|---|---|---|
| **输入** | 一句口头需求 · 20 字以内 | — | 输入框 |
| **解析** | — | LLM 拆解需求 · 识别场景类型(游戏截图 / 梗图 / 政治讽刺) | 一个确认卡片 "你要的是 MOBA 梗图是吗?" |
| **填骨架** | — | 产品按 20 原子骨架填默认值 | YAML 结构展开给用户浏览 |
| **微调** | 白话反馈("更夸张 / 再像漫画") | 产品改对应字段 | YAML 字段高亮改动 |
| **出图** | — | 产品把 YAML 折叠成 prompt · 调 Image 2 API | 成图 |
| **拆解教学** | 点任何字段 | 展示该字段对应图里哪块 | 带箭头的可视化拆解 |

**关键**: 用户**始终看到的是 YAML 结构化视图** · 不是一大段话 · 让他感觉产品"井井有条 · 很专业" · 但本质上每个 value 就是自然语言短句.

## 使用这条 prompt 的观察点

| 看 Image 2 能否 |
|---|
| ✅ 理解"caricature parody"保持卡通漫画风 · 不渲染写实人脸 |
| ✅ "MID OR FEED" 梗图大字精准 |
| ✅ 双 HUD "LVL 47" 一致渲染 |
| ✅ 对称构图执行 · 两人面对面 |
| ✅ 冷暖配色对比 · 两塔颜色不同 |
| ⚠️ 是否乱加未指定文字(游戏 UI / 战吼 / 符号) · 测 Negative 生效度 |
| ⚠️ 是否守住"NOT specific game"· 不自动复刻 LoL 专属资产 |

跑完截图发我 · 我帮你逐字段拆解 · 评分每个分类执行度.

---

## 记录 · 这条 prompt 作为 Prompt Atlas 首批示例的意义

1. **演示了"口头一句 → 结构化 20 字段"的拆解** · 产品核心动作
2. **展示了 YAML-style 结构对用户友好** · 不堆自然语言墙
3. **内置 Negative 防版权** · 是产品合规能力的真实示范
4. **涵盖 15+ 原子** · 单例覆盖面足够写进"能力地图"首页
