# Prompt Atlas

Prompt Atlas is a public gallery for GPT Image 2 works. The open-source surface is intentionally small:

- `src/` and `index.html` render the frontend gallery.
- `works/` stores public topic, package, image metadata, and real generated images.
- `tools/works.js` validates, indexes, scaffolds, and generates works.

Private planning, todo data, research notes, API keys, run logs, and temporary generation URLs do not belong in the public repository.

## Quick Start

```bash
npm install
npm run works:validate
npm run works:index
npm run dev
```

Build a static site:

```bash
npm run build
npm run preview
```

The Vite build copies `works/` into `dist/works/`, so the gallery can be deployed as static files.

## Data Flow

```text
private todo -> works topic -> package -> image/meta -> works/index.json -> frontend
```

The frontend never reads private todo data. It fetches `works/index.json`, then fetches each image `meta.json` only when a detail modal needs the full prompt.

## Public Metadata Rules

- `title` and `description` are English fallback fields.
- `i18n.en` and `i18n.zh-CN` are required on every topic, package, and image meta.
- `prompt` stays English and must be the first key in each image `meta.json`.
- `display.alt.en` and `display.alt.zh-CN` are required for every image.
- `tags` are stable English slugs; display labels live in `works/tags.json`.
- Do not put `task_id`, temporary `url`, `local_path`, internal scores, or evaluation notes in public works JSON.

## Commands

```bash
npm run works:validate
npm run works:index
npm run works:scaffold -- A-13 single object-memory --title "Object Memory" --image object-memory
npm run works:generate -- works/S/S-19-sem-microscopy/packages/single-pollen-micro-city/images/pollen-micro-city/meta.json
npm run works:sync -- A-13
npm run check:public
```

`works:scaffold`, `works:sync`, and private todo listing require a local `todo/atlas-todo.json`. That file is ignored and not part of the public repository.

## Frontend

The gallery supports:

- Real generated images from `works/**/image.png`.
- Localized titles, descriptions, tag labels, and image alt text.
- Search across titles, descriptions, topics, packages, and tags.
- Filters for all, featured, single, series, and every tag in `works/tags.json`.
- Detail modal with real image, metadata, prompt copy, original image open, and download.

## Release Checklist

```bash
npm run works:validate
npm run works:index
npm run build
npm run check:public
```
