# Frontier Challenge Atlas · 元规则

这个目录里的 `todo/atlas-todo.json` 不是普通 prompt 清单，而是 **GPT Image 2 能力上限调研库**。

核心判断只有一句:

> 只做很难、很复杂、以前人类做成本很高，别的模型通常做不好，而 GPT Image 2 可能一把打穿的炫技题。

## 1. 收录标准

一条 idea 必须至少满足以下 3 条，才应该进入 JSON:

- **人类制作复杂**: 过去通常需要摄影棚、3D、工程制图、排版、插画、后期、考据、数学几何或多工种协作。
- **模型能力边界强**: 明确考验文字渲染、多参考图一致性、复杂版式、极端画幅、物理材质、真实世界知识、几何错觉、局部编辑等能力。
- **别的模型不稳**: DALL-E 3 / Midjourney / Flux / SDXL 工作流往往要多轮抽卡、ControlNet、LoRA、PS 或人工拼接才能接近。
- **一眼炫技**: 结果不是普通审美图，而是让人感觉“这个以前不好做 / 做不出来 / 太麻烦”。
- **可验证**: 有明确成功标准，能判断这张图是否真的过了能力关。

不要收录:

- 普通电商海报、小说封面、泛游戏角色、泛赛博街景、泛梦幻少女。
- 只是风格好看，但不考验能力边界的题。
- 没有验收标准，只能靠“好不好看”判断的题。
- 人类很容易做，或者模板网站已经成熟解决的题。

## 2. JSON 生成逻辑

每条 item 要回答 6 个问题:

1. **这题考什么能力?**
   写入 `dimension` 和标准化 `capabilities`。

2. **为什么以前难?**
   写入 `frontier_claim.human_complexity`。

3. **为什么别的模型容易失败?**
   写入 `frontier_claim.model_gap`。

4. **为什么 GPT Image 2 值得试?**
   写入 `frontier_claim.why_gpt_image_2_may_solve`。

5. **成功长什么样?**
   写入 `success_criteria`，必须可检查。

6. **做完怎么判断?**
   跑图后填 `evaluation`，不能只凭“看起来不错”标 done。

## 3. 能力维度

`capabilities` 用标准标签，方便后面按能力边界统计:

- `text-rendering` · 图中文字、非拉丁文字、字体、标注、微缩字。
- `multi-image-reference` · 多参考图融合、身份一致性、多视角/系列一致性。
- `structured-layout` · UI、信息图、多面板、九宫格、漫画、海报层级。
- `extreme-aspect-ratio` · 1:3 / 3:1 / 360 全景等极端画幅。
- `photorealism` · 真实摄影、自然光、显微、天文、建筑、食物等。
- `physics-materials` · 流体、烟雾、爆炸、光学、材质、微距纹理。
- `technical-diagram` · 专利图、CAD、机械爆炸图、路线图、工程标注。
- `world-knowledge` · 真实文化、地点、历史、科学、品牌/界面常识。
- `reasoning-composition` · 复杂叙事、关系可视化、推理构图、元叙事。
- `style-transfer` · 艺术家、导演、时代、印刷工艺、品牌语言迁移。
- `optical-illusion-geometry` · 视觉错觉、几何悖论、双目视差、对称、镶嵌。
- `editing-workflow` · 免 mask、多轮、局部替换、保留不变项。
- `commercial-mockup` · 产品、广告、品牌、包装、珠宝、汽车、工业设计提案。

## 4. 打分规则

`research_value`:

- `5`: 直接打模型能力天花板，做成就是强证据。
- `4`: 明确考验某个能力，失败也有研究价值。
- `3`: 有价值但更偏风格/应用，不是核心边界。

`spectacle_score`:

- `5`: 一眼“这也能做?”，适合首页 hero / 社媒传播。
- `4`: 专业用户会惊艳，适合案例页。
- `3`: 有用但不够炸。

优先级:

1. `research_value=5` 且 `spectacle_score=5`
2. S tier
3. 明确考验 `text-rendering` / `multi-image-reference` / `extreme-aspect-ratio` / `optical-illusion-geometry` / `technical-diagram`
4. 有商业或传播落点

## 5. 跑图后的 done 标准

一条 item 不能只因为生成了图片就标 done。必须满足:

- `prompt.md` 已落盘。
- 图片已保存。
- `metadata.json` 已写。
- `evaluation` 至少填:
  - `visual_quality`
  - `instruction_following`
  - `text_accuracy`，如果涉及文字
  - `consistency`，如果涉及多图/系列/身份
  - `novelty`
  - `frontier_verdict`
- `frontier_verdict` 必须说明:
  - `pass`: 证明这个能力点值得收录。
  - `mixed`: 有亮点但还需要重跑或改 prompt。
  - `fail`: 没打穿能力边界，不能当 showcase。

## 6. 示例

```json
{
  "id": "S-09",
  "name": "1:3 超长竖卷画",
  "dimension": "1:3 极端画幅 + 叙事密度",
  "capabilities": ["extreme-aspect-ratio", "structured-layout", "reasoning-composition"],
  "frontier_claim": {
    "human_complexity": "人类制作需要长卷构图、连续叙事、局部细节绘制和后期拼接。",
    "model_gap": "多数模型在极端画幅下容易局部崩坏、叙事重复或只剩纹理。",
    "why_gpt_image_2_may_solve": "更灵活尺寸、复杂结构化视觉和叙事布局能力。"
  },
  "success_criteria": [
    "画幅稳定接近 1:3",
    "至少 6 个可读叙事区域",
    "局部细节不糊成纹理",
    "整体风格统一"
  ],
  "research_value": 5,
  "spectacle_score": 5
}
```
