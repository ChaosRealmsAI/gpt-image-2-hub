# A-08 · Google Maps → 羊皮纸藏宝图 · 系列 3 shots

**类型**:series · 3 shots · 同一张藏宝图 3 个视角
**主体锁(每条 prompt 重复)**:同一张古老羊皮纸藏宝图 · 焦黄泛旧的纸面 · 墨色手绘等高线 · 岛屿轮廓 · 标志性的红色墨水 X 标记 · 棕色蜡封 · 烧焦边缘 · 古典制图师字体
**风格锚**:cinematic hyperreal parchment photography, warm candlelight rim, shallow depth of field, National Geographic / Indiana Jones editorial quality

## shot 01 · full-map · 4:3 · no ref

```
Scene:
A weathered ancient treasure parchment map spread flat on a dark wooden captain's desk, warm candlelight from upper left, 4:3 horizontal framing.

Subject:
An antique aged-parchment treasure map, yellowed and foxed, with hand-drawn contour lines in sepia ink, a mysterious single-island outline occupying the full page, a bold red-ink "X" marking the treasure, a brown wax seal in the lower corner, and singed burnt edges.

Important details:
Tiny classical cartographer handwriting labels scattered across the island — "Skull Bay", "Serpent's Pass", "Whispering Caves", "Ironwood Forest". Compass rose in the top-left with fleur-de-lis north arrow. Sea monster illustration in the ocean. Torn and softly crumpled edges, visible paper fiber. Cinematic hyperreal parchment photography, warm candlelight rim, shallow depth of field, National Geographic editorial quality.

Screens and text:
Title banner at top in decorated gothic calligraphy reads exactly: "CAPTAIN BLACKWATER'S SECRET MAP · ANNO 1723". All legend labels "Skull Bay" / "Serpent's Pass" / "Whispering Caves" / "Ironwood Forest" must be legible.

Use case:
Adventure editorial hero shot, 4:3 horizontal.

Constraints:
No watermark, no brand marks, no modern elements. Aspect ratio 4:3.
```

- task_id: (pending)
- url: (pending)
- local_path: /Users/Zhuanz/workspace/prompt-atlas/assets/A/A-08-treasure-map/01-full-map.png

## shot 02 · zoom-region · 1:1 · --ref 01

```
Scene:
Macro zoom into the Skull Bay region of the same ancient treasure parchment map (the very same map from shot 01), warm candlelight, 1:1 square framing.

Subject:
Close-up of the Skull Bay coastline area of the same parchment map — same yellowed paper fiber, same classical cartographer ink, same red "X" mark now more clearly visible. Curved shoreline contour lines, a small skull-shaped rock outcropping off the coast, an old fort ruin sketched inland.

Important details:
The red-ink "X" treasure mark is now center-focus and slightly larger due to the zoom. Fine ink cross-hatching on rocks and cliffs. Same paper aging, same burnt-edge feel clipping at the frame. Cinematic hyperreal parchment photography, warm candlelight rim, razor-thin depth of field on the X mark, editorial macro feel.

Screens and text:
Readable labels around the X: "Skull Bay", "X MARKS THE SPOT", "Old Fort Ruins" in classical cartographer handwriting.

Use case:
Detail zoom plate, 1:1 square.

Constraints:
No watermark, no modern markings. Aspect ratio 1:1.
```

- task_id: (pending)
- url: (pending)
- local_path: /Users/Zhuanz/workspace/prompt-atlas/assets/A/A-08-treasure-map/02-zoom-region.png

## shot 03 · treasure-spot · 3:2 · --ref 01

```
Scene:
Extreme macro on the red "X" mark on the same ancient treasure parchment map, warm candlelight from left, 3:2 horizontal framing.

Subject:
Ultra close-up of the very same red-ink "X" treasure-mark of the same parchment map from shots 01 and 02 — yellowed fibrous paper clearly visible underneath, texture of actual ink bleed into paper fibers, classical cartographer cross-hatching around the X.

Important details:
A drop of red wax right next to the X like a dripped seal. A tiny magnifying glass hovering slightly above the page, metal rim and wooden handle, reflecting candlelight. Hyperreal parchment macro photography, shallow depth of field blurring the rest of the map, warm golden key light, editorial magazine hero quality.

Screens and text:
Small handwritten annotation beneath the X reads exactly: "30 paces east of the old oak". Partial label "Skull Bay" visible at the edge.

Use case:
Cinematic final reveal shot for a treasure-hunt editorial, 3:2 horizontal.

Constraints:
No watermark. Aspect ratio 3:2.
```

- task_id: (pending)
- url: (pending)
- local_path: /Users/Zhuanz/workspace/prompt-atlas/assets/A/A-08-treasure-map/03-treasure-spot.png

---

## 跑法

1. shot 01 无 ref · 先跑 · 拿 URL1
2. shot 02 + 03 都 `--ref URL1`(anchor 策略 · 最稳)
