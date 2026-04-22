# GPT Image 2 Hub · apimart 图像生成 CLI

用 `apimart.ai` 的 `gpt-image-2` 模型 · 全链路 **submit → poll → 自动下载** 一条命令搞定。

---

## 🚀 3 步上手

> ⚠️ **所有命令都必须在项目根目录运行**(即 `cd /path/to/prompt-atlas` 之后再跑)。CLI 会从**当前工作目录**读 `.env` · 跑错目录 = key 加载不到 = 401 报错。

### 1. 配 API Key

```bash
cp .env.example .env
# 编辑 .env · 把 APIMART_KEY 填成你的真 key
```

到 https://apimart.ai/keys 获取 key(形如 `sk-xxxxxxxx...`)。

### 2. 生一张图

**方式 A · npm 脚本**(注意 `--` 是**必须**的):

```bash
npm run gen -- "一只橘猫坐在窗台上看夕阳 水彩画风格" --size 16:9
#           ^^
#           双横线告诉 npm "后面全是传给脚本的参数"
#           漏了 --  会导致 --size 被 npm 吞掉 · 脚本收不到
```

**方式 B · 直接 node**(推荐 · 没有双横线陷阱):

```bash
node api/generate.js "a corgi astronaut on the moon, cinematic" --size 16:9
```

两种等价 · 选一个顺手的。

### 3. 看结果

生成的图自动下载到 `./assets/generated/` · 文件名是 task_id(或你指定的 `--name`)。

**一张图约等 30-60 秒**(GPT-Image-2 模型本身就这么慢 · 不是卡住) · 控制台会持续打进度:

```
🎨 prompt: ...
📐 size:   16:9
✓ submitted · task_id=task_01KPT...
⏳ [1] pending 0%      ← 第 1 次轮询(提交后 12 秒)
⏳ [2] pending 0%      ← 每 4 秒查一次
⏳ [3] processing 45%
⏳ [4] completed 100%
✅ 完成 · 用时 38.2s(API 30s)
   task_id: task_01KPT...
   URL (24h 过期): https://upload.apimart.ai/f/...
   本地: /path/to/assets/generated/xxx.png (0.77 MB)
   过期: 4/23/2026, 6:21:23 PM
```

看到 `⏳ [N]` 就是正常在跑 · 别 Ctrl+C。最多等 4 分钟会自己超时。

---

## 📐 13 种 size 比例

| 正方 | 横 | 竖 |
|---|---|---|
| `1:1`(默认) | `16:9` / `4:3` / `3:2` / `5:4` | `9:16` / `3:4` / `2:3` / `4:5` |
| - | `2:1` / `21:9` | `1:2` / `9:21` |

⚠️ **只支持比例写法** · 传 `1024x1024` 这种像素尺寸会直接报错 `invalid size`。

---

## 🎛️ CLI 完整参数

```
node api/generate.js "<prompt>" [options]

Options:
  --size <ratio>     图片比例(默认 1:1 · 13 种见上表)
  --ref  <url>       图生图参考图 · 可多次传 · 最多 16 · URL 或 base64 data URI
  --name <filename>  保存本地文件名(不带扩展名自动补 .png)
  --out  <dir>       输出目录(默认 ./assets/generated)
  --no-download      只返 URL 不下载(不推荐 · 24h 过期)
  -h, --help         帮助
```

### 例子

```bash
# 基础文生图
npm run gen -- "a cat sitting on a book, oil painting"

# 指定比例 + 文件名
npm run gen -- "minimal mountain landscape" --size 16:9 --name mountain-01

# 图生图 · 把照片改成水彩风
npm run gen -- "change to watercolor style" --ref https://example.com/photo.jpg

# 多参考图融合(最多 16)
npm run gen -- "merge these into a poster" \
  --ref https://example.com/a.jpg \
  --ref https://example.com/b.jpg \
  --size 4:3

# 自定义输出目录
npm run gen -- "panda on bamboo" --out ./my-output --name panda-01
```

---

## 📦 批量生成

写个 JSON:

```json
// prompts.json
[
  { "prompt": "a cat",       "size": "1:1",  "name": "cat-01" },
  { "prompt": "a dog",       "size": "16:9", "name": "dog-01" },
  { "prompt": "a panda",     "size": "4:3",  "name": "panda-01" }
]
```

跑:

```bash
npm run batch -- prompts.json
```

所有任务并行提交 · 全部跑完 & 下载 · 平均每张 ~40 秒。

---

## 🧩 代码里调用

```js
import { generate } from './api/apimart.js';

const result = await generate({
  prompt: '一只橘猫 水彩画',
  size: '16:9',
  outputDir: './my-out',
  filename: 'my-cat',
  onProgress: (e) => console.log(e),
});

console.log(result);
// {
//   task_id: 'task_xxx',
//   url: 'https://upload.apimart.ai/...',
//   expires_at: 1776939333,
//   expires_in_human: '4/23/2026, ...',
//   actual_time_sec: 44,
//   local_path: '/abs/path/my-out/my-cat.png',
//   size_bytes: 2834567
// }
```

### 更底层的三个函数

```js
import { submit, queryTask, queryTaskBatch, pollUntilDone, downloadImage } from './api/apimart.js';

const taskId = await submit({ prompt: 'cat', size: '1:1' });
const data   = await pollUntilDone(taskId);
const dl     = await downloadImage(data.result.images[0].url[0], './out', 'cat');
```

---

## ❌ 常见错误码

| HTTP | 含义 | 修 |
|---|---|---|
| **400** | `prompt is required` / 参数缺失 | 传 prompt |
| **401** | API key 错 | 查 `.env` · 重新复制 key |
| **402** | 余额不足 | 去 apimart 后台充值 |
| **403** | 无权限 | 确认账户状态 |
| **429** | 请求过频 | 放慢 · 加重试 |
| **500 invalid size** | size 不在 13 种里 | 只能传比例(`16:9`)· 不能 `1024x1024` |
| **500 content moderation failed** | prompt 命中敏感词 | 改 prompt · 敏感内容不扣费 |
| **502** | 网关错 | 重试 |

---

## ⚙️ 轮询策略(内置)

默认:
- **首次查询延迟** 12 秒(API 建议 10-20s · 避免无用 poll)
- **每次间隔** 4 秒(API 建议 3-5s)
- **超时** 4 分钟(单张图一般 30-60 秒完成)

改:

```js
import { pollUntilDone } from './api/apimart.js';
await pollUntilDone(taskId, { firstDelayMs: 20_000, intervalMs: 5_000, timeoutMs: 300_000 });
```

---

## 💰 计费 & 保留

- **按张计费** · 失败不扣 · 敏感词命中不扣
- **task_id 保留** 若干天(apimart 侧 `TASK_RETENTION_DAYS` 控制)· 过期查会返回 "任务不存在或已过期"
- **图 URL 24h 过期**(apimart 已经从上游镜像到自家 R2 · 但还是建议立刻下载存到自家 CDN)
- **本 CLI 默认 `download=true`** · 已经帮你做了 ✓

---

## 📁 生成的图去哪

```
prompt-atlas/
├── assets/
│   ├── generated/            ← 默认输出(已 .gitignore)
│   │   ├── task_xxxx.png
│   │   └── my-cat.png
│   └── samples/              ← 范例(跟 git 走)
└── ...
```

---

## 🔐 安全

- `.env` **已 .gitignore** · 不会被推到 git
- 不要把 API key 放前端代码 · 任何前端调用要走你的后端中转
- `.env.example` 是给合作者的模板 · 里面不带真 key

---

## 🧪 一键自测

```bash
npm test
```

跑一个橘猫 water color 的默认 prompt · 看有没有 ✅ 输出 + 本地新图文件。

---

## 🛠️ 技术栈

- **零依赖**(Node 18+ 自带 `fetch` · 自带 ESM)
- **文件**:
  - `api/apimart.js` · 核心封装(submit / queryTask / pollUntilDone / downloadImage / generate)
  - `api/generate.js` · CLI 入口
  - `api/batch.js` · 批量 CLI

