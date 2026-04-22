---
# ═══════════════════════════════════════════════════════════════
# LAYER 1 · META
# ═══════════════════════════════════════════════════════════════

id:            "04-cyberpunk-teahouse"
name:          "赛博茶馆 · Cyberpunk Teahouse"
version:       "1.0"
created:       "2026-04-22"
updated:       "2026-04-22"

category:      "poster"
sub_category:  "retrofuturist-environment"
intent:        "environment-poster"

model:         "gpt-image-2"
thinking:      "on"
aspect:        "3:4"
quality:       "high"
has_ref_image: false
has_text:      true

tags:          [cyberpunk, teahouse, neon, rain, jade-green, amber, gaiwan, volumetric, hong-kong, retrofuturist]
difficulty:    "medium"
rating:        "untested"
status:        "draft"

watermark:     "integrated"
watermark_text: "Prompt Atlas · 2026"

derived_from:  null
variants:      []
---

# 赛博茶馆 · Cyberpunk Teahouse

> **一句话定位**: 古法茶具 × 霓虹雨夜的电子茶馆(15 字)

---

## 🎯 LAYER 2 · PROMPT

### 原始需求(用户口语)

> 我想要一张赛博朋克风的中式茶馆 · 雨夜港岛 · 店里摆一盖碗 · 窗外是翠绿霓虹 · 店里一只橘猫在打盹 · 墙上霓虹灯招写一句中文 · 要有烟雾光束 · 复古绘本感不是 3D 游戏 CG 感

### 变量槽 (用户可改的)

| 槽位 | 默认 | 可选枚举 |
|---|---|---|
| `main_neon_color` | 翠玉绿 `#00b894` | 霓虹粉 `#e84393` / 冰蓝 `#0abde3` / 鎏金黄 `#ffa502` / 自定义 hex |
| `signature_text` | "碳基生命·限本店饮用" | "夜归人 请勿喧哗" / "免费续杯 到子时止" / 任意 ≤ 10 汉字自定义 |
| `companion_animal` | 橘猫(打盹) | 黑色比格 / 龟背竹(无动物) / 机械雀 / 自定义 |
| `foreground_prop` | 盖碗 + 90s 便携 CRT | 紫砂壶 + 算盘 / 搪瓷缸 + BP 机 / 茶饼 + 磁带 Walkman |
| `weather` | 雨夜 | 雾夜 / 雪夜 / 梅雨 / 酸雨(带绿色水洼) |
| `aspect` | 3:4 竖版 | 16:9 横版 / 9:16 手机竖屏 / 1:1 方图 |

> **Skill 化做法**: 整条 prompt 约 88% 固定 · 用户只改 6 个 chip · 即 "赛博中式环境生成器" skill.

### 自然语言 Prompt · 点这里复制

```
A poster-style environment illustration of a small cyberpunk teahouse tucked inside a rain-soaked Hong Kong back alley, rendered in hand-painted digital illustration with subtle analog film grain and visible CRT scanline artifacts on screen elements. Cinematic interior framing — viewer sits inside the shop looking diagonally past the foreground table toward the open front door and the neon alley beyond.

Foreground: a round dark-wood table holding a single small porcelain gaiwan (Chinese lidded teacup) with visible curling steam rising in thin vertical ribbons that catch the neon light from outside. Next to the gaiwan sits a vintage 1990s portable CRT television playing magnified scanline static in grayscale. A ginger tabby cat with a thin holographic collar dozes on a folded newspaper beside the table, tail curled around its paws.

Background (seen through the open doorway): a narrow alley with wet concrete ground that mirrors vertical neon signs stacked along the walls. A small plum-blossom branch in a matte celadon vase sits on the shopfront sill, silhouetted against the neon. A translucent holographic menu floats at eye level inside the shop, gently flickering. Incense smoke from a small brass burner near the door rises in a diagonal column, catching the neon beams as clearly visible volumetric light rays and soft dust motes.

Color palette anchors: deep near-black interior (#0d1b2a) as base, jade-green neon (#00b894) as the dominant accent glowing from the alley signage, warm amber lantern (#f39c12) as the counter-accent for interior warmth, electric pink neon (#e84393) as a secondary punctuation on one alley sign, muted steel-gray (#95a5a6) for the CRT casing and brass burner. Mood is warm-cool duality — the cold rainy alley outside pulls green, while the shop interior pulls amber. Overall contrast lifted ~8% by soft steam haze.

Key text rendering: a small neon-tube wall sign mounted on the inside shop wall exactly reads the quoted Chinese characters "碳基生命·限本店饮用" — glowing jade green, visible CRT-style bloom and soft halo around each stroke, perfectly legible at 100% zoom, rendered in a clean rounded sans-serif neon script. No other readable text anywhere in the frame.

Texture detail must be visible on: wet reflective concrete with fragmented neon mirror imagery, thin curling steam over the gaiwan lid, scanline interference and subtle chromatic aberration on the CRT screen, the volumetric smoke column from the incense burner, and the soft bloom halos around every neon element.

Composition: full-frame vertical poster, the open doorway forms a central framing device dividing warm interior (lower two thirds) from cool neon alley (upper third), subject cluster (gaiwan + CRT + cat) anchored in the lower left, balanced negative space on the right for the neon sign breathing room. Aspect ratio 3:4 vertical.

Watermark: in the lower-right corner, subtly integrate a small painted signature rendering exactly "Prompt Atlas · 2026" — painted in the same hand-illustrated medium as the scene, approximately 25% contrast, clearly readable at 100% zoom, never overlapping the gaiwan, cat, or neon sign.

Exclude: photo-realistic CGI surface finishes, any branded logos (Coca-Cola / Tsingtao / Pepsi / real retail chain signage), any additional Chinese or English text beyond the single specified neon wall quote, any real person likeness, cliché cyberpunk character tropes (mohawks, glowing eye implants, trench coats), any weapons or violence, oversaturated neon that blows out detail, any watermarks other than the one specified above.

Quality: high, 4K ultra-detailed, painterly hand-illustrated finish with light analog grain, cinematic color grading, soft bloom. Aspect ratio 3:4.
```

**操作步骤**:
1. 打开 ChatGPT (Plus / Team / Enterprise)
2. 手动点 **Thinking** toggle(frontmatter `thinking:on`)
3. 粘贴 Prompt · 发送
4. 等 60–120s
5. 首次不过 → 只调 `main_neon_color` / `signature_text` / `foreground_prop` 3 个槽 · 不动其他

---

## 🔬 LAYER 3 · FEEDBACK

### Observation points (跑完自检)

- [ ] **Chinese neon text** "碳基生命·限本店饮用" 笔画完整可读 · bloom 光晕自然(Image 2 中文霓虹字 S 级考点)
- [ ] **Volumetric 光束 + 尘粒同屏**(烟 + 光 + 尘三位一体)
- [ ] **双色温对立**:外翠绿 / 内琥珀清晰分区 · 不互染
- [ ] **盖碗蒸汽**细丝可见 · 不糊成白团
- [ ] **湿地倒影**竖版霓虹可辨 · 不是一片绿色
- [ ] **CRT 扫描线 + 色散**可见(retrofuturist 锚)
- [ ] **橘猫**位置合理 · 不 crop 尾巴 · 不长 6 条腿
- [ ] **3:4 竖版**严格执行 · 不偷偷 16:9
- [ ] **右下角水印** "Prompt Atlas · 2026" 融入画风 · 不压主体
- [ ] Exclude 全守:无品牌 / 无额外文字 / 无真人相似 / 无赛博刻板印象

### Known issues / 已知软肋

- Image 2 **中文霓虹字 bloom** 偶尔描边不均 · 大概率 2-3 次重 roll 才极佳
- **湿地倒影 + 霓虹倒影同屏** 是 Image 2 v1 偶尔偷懒项 · prompt 必显式点出"mirror imagery"
- **扫描线 + 色散** 在低对比屏上不明显 · 需 100% 放大验
- **4-5 元素同构** (盖碗 + CRT + 猫 + 烟 + 霓虹) 偶尔丢 1 个 · 特别是小道具如 "algo 新闻报纸"

### Iteration log (版本迭代记录)

- **v1.0** (2026-04-22): 首发 · v0.2 meta-skill 盲测样本 · 主 agent 不加载 skill 纯凭方法论记忆写

### Variants / 衍生

- **v04.2 雾夜版**:`weather=雾夜` + 去雨保雾 · 湿地改石板
- **v04.3 粉色霓虹版**:`main_neon_color=#e84393` + `signature_text="夜归人·勿喧"`
- **v04.4 横版电影感**:`aspect=16:9` + 构图重定 · 做 banner

### Record / 对产品的贡献

本示例演示了哪些产品价值:
- **覆盖原子层**:L1 内容 / L2 表达(painterly 非 CGI)/ L3 氛围(warm-cool 对立)/ L4 叙事(古法 × 新物主题)/ L6 文字(中文霓虹)/ L8 位置(3:4 三分构图)/ L9 技术(volumetric + CRT artifacts)/ L10 品牌(integrated watermark)
- **Image 2 独家**:Thinking on · 中文引号文字渲染 · 长 prompt(~50 行)精准遵循 · 3:4 长宽比
- **Skill 模板方向**:"中式赛博环境生成器" — 6 个 chip 可变 · 其余固定 · 消费者级一键出图

### 方法论自检(v0.2 skill 盲测)

| 铁律 | 是否守住 | 证据 |
|---|---|---|
| ✅ style signatures > style nouns | ✅ | 用"painterly with analog grain + CRT scanlines + wet-concrete mirror reflections + jade neon bloom" · 不写"cyberpunk 风格" |
| ✅ hex codes > adjective palette | ✅ | 锁 #0d1b2a / #00b894 / #f39c12 / #e84393 / #95a5a6 · 不写"深蓝 + 绿色 + 金色" |
| ✅ Exclude > Preserve | ✅ | 7 条 Exclude(品牌 / 额外文字 / 真人 / 刻板印象 / 武器 / 过饱和 / 其他水印)· 0 条 Preserve 堆砌 |
| ✅ 密度 50-60 行 | ≈ | 约 52 行自然段(达 sweet spot · 下限) |
| ✅ Tier 1 必填齐 | ✅ | intent=poster / aspect=3:4 / watermark=integrated / quality=high / exclude 齐 |
| ✅ Tier 2 推荐齐 | ✅ | palette hex / lighting 方向 / texture list / composition 描述 齐 |
