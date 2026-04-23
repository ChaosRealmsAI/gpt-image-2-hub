# AGENTS.md · Prompt Atlas Public Workflow

This directory is the public project root. Keep code, open works data, and frontend assets here.

## Open / Closed Boundary

Open source:

- `index.html`
- `src/`
- `tools/`
- `works/`
- `README.md`
- `AGENTS.md`
- `package.json`, lockfile, and Vite config

Closed source:

- `todo/`
- `prototype/`
- `research-materials/`
- API keys, run logs, task ids, temporary URLs, absolute local paths, and evaluation notes

## Production Flow

```text
1. Read planning source -> 2. Create topic/package -> 3. Write meta.json tasks -> 4. Queue images -> 5. Validate -> 6. Build index -> 7. Verify frontend
```

Use the private todo only as a planning source. The frontend must work from public `works/index.json` alone.

## Agent Flow 1 · Write Meta

When asked to prepare work, create complete `meta.json` task files first; do not start by running image generation.

1. Choose whether the package is `single` or `series`.
   - Use `single` for independent images under one topic, even if there are many of them.
   - Use `series` only when images intentionally share continuity: same subject, same character, same object, same scene, or declared reference dependency.
2. Write or update `topic.json` and `package.json`.
3. For every image directory, write `meta.json` with `prompt` as the first key.
4. Set `status: prompted` unless the image already has a verified `image.png`, in which case use `done`.
5. Fill `generation.output.path` with the exact repo-relative image output path.
6. Fill `generation.depends_on`.
   - Independent single images use `[]`.
   - True series images declare prior reference images with `id`, `meta_path`, `image_path`, `ref_role`, and `required_status: done`.
7. Keep `generation.ref_urls: []` in committed files. The queue injects runtime URLs privately.
8. Run `npm run works:validate`.

## Agent Flow 2 · Run Queue

When asked to generate images, use the queue instead of hand-running one meta at a time.

1. Preview:

```bash
npm run works:queue -- --dry-run --concurrency 10
```

2. Run:

```bash
npm run works:queue -- --concurrency 10
```

The queue scans `works/**/meta.json`, starts up to 10 ready `image2gen` CLI jobs in parallel, respects `generation.depends_on`, passes runtime dependency URLs as `--ref`, writes each `image.png` to `generation.output.path`, marks success as `done`, marks failure as `failed`, writes private run logs under ignored `tmp/queue-runs/`, and rebuilds `works/index.json`.

## Required Commands

Run from this public project root:

```bash
npm run works:validate
npm run works:index
npm run build
npm run check:public
```

For image generation:

```bash
npm run works:generate -- works/{tier}/{topic}/packages/{package}/images/{image}/meta.json
```

The generator reads `meta.json.prompt`, writes `image.png` to the same image directory, and does not write internal API fields into public metadata.

For batch production, prefer:

```bash
npm run works:queue -- --concurrency 10
```

The queue scans prompted metadata, respects dependencies, writes images to `generation.output.path`, marks success as `done`, marks failure as `failed`, stores private logs in ignored `tmp/queue-runs/`, and rebuilds `works/index.json`.

## Metadata Rules

- Every image directory contains `meta.json`; `image.png` exists after generation succeeds.
- `meta.json.prompt` is the first field.
- `meta.json.status` is required:
  - `prompted`: prompt is ready for the queue, image may not exist yet.
  - `running`: queue has claimed the image.
  - `done`: `image.png` exists and can be indexed by the frontend.
  - `failed`: previous run failed and can be retried.
  - `skipped`: intentionally not queued.
- `meta.json.generation` is required and must include `order`, `output.path`, `depends_on`, and `ref_urls`.
- Series references are declared in `generation.depends_on`; queues inject dependency result URLs into `generation.ref_urls` at runtime before calling `image2gen --ref`. Do not commit temporary URLs.
- Prompt text remains English.
- Every public topic, package, and image has `i18n.en` and `i18n.zh-CN`.
- Every image has `display.alt.en` and `display.alt.zh-CN`.
- Tags are English slugs. Labels are centralized in `works/tags.json`.
- Frontend reads `works/index.json`; do not make the frontend depend on private todo.
- `works/index.json` includes only `status: done` images with existing `image.png`.

## Before Committing

```bash
npm run works:validate
npm run works:index
npm run build
npm run check:public
git status --short
```

Do not stage `todo/`, `prototype/`, `research-materials/`, private logs, or API output URLs.
