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
1. Read private todo -> 2. Scaffold package -> 3. Write meta prompt -> 4. Generate image -> 5. Validate -> 6. Build index -> 7. Verify frontend
```

Use the private todo only as a planning source. The frontend must work from public `works/index.json` alone.

## Required Commands

Run from this `new/` directory:

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

## Metadata Rules

- Every image directory contains `image.png` and `meta.json`.
- `meta.json.prompt` is the first field.
- `meta.json.status` is required:
  - `prompted`: prompt is ready for the queue, image may not exist yet.
  - `running`: queue has claimed the image.
  - `done`: `image.png` exists and can be indexed by the frontend.
  - `failed`: previous run failed and can be retried.
  - `skipped`: intentionally not queued.
- `meta.json.generation` is required and must include `order`, `output.path`, `depends_on`, and `ref_urls`.
- Series references are declared in `generation.depends_on`; queues inject dependency result URLs into `generation.ref_urls` before calling `image2gen --ref`.
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
