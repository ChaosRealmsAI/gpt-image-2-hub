# Works Directory Structure

`new/works/` is the public display data layer. It uses a three-level model:

```text
topic 1 -> package N -> image N
```

Canonical path:

```text
new/works/{tier}/{topic_id}-{topic_slug}/
├── topic.json
└── packages/
    └── {package_type}-{package_slug}/
        ├── package.json
        └── images/
            └── {image_slug}/
                ├── image.png
                └── meta.json
```

Generated public index:

```text
new/works/index.json        # built by npm run new:index, do not hand-edit
new/works/locales.json      # locale policy
new/works/tags.json         # tag label dictionary
new/works/schema/*.json     # public schema contracts
```

Rules:

- `topic` is only the creative/research subject from the todo item.
- `package` is one deliverable under that topic. A topic can have many single packages and many series packages.
- `package.package_type` is `single` or `series`.
- `package.creative_direction` is required. It states what this package is doing and how it differs from existing packages under the same topic.
- `image` is the only layer that owns prompt and generation result.
- Every image directory must contain exactly one `image.png` and one `meta.json`.
- `meta.json.prompt` is the first field. Do not create `prompt.md`.
- Do not put `single/` or `series/` directly under tier. That belongs to package metadata and package slug.
- Public `meta.json` should only contain prompt, title, short description, image path, aspect ratio, tags, and refs. Do not put API task ids, temporary URLs, local absolute paths, scores, or internal evaluation notes in public works JSON.
- `title` and `description` are the English fallback. Every public `topic.json`, `package.json`, and `meta.json` also has `i18n` with at least `en` and `zh-CN`.
- `prompt` stays English only. Translate display copy, not the generation prompt.
- Every public object has `display.featured`, `display.sort_order`, and `display.audiences`.
- Every image `meta.json` has `display.alt.en` and `display.alt.zh-CN` for gallery cards, SEO, and accessibility.
- `tags` are stable English slugs. Human-readable labels live in `new/works/tags.json`.
- Frontends should read `new/works/index.json`, not recursively scan the directory at runtime.

Quality rule:

- A series package may keep the same subject and style internally.
- A different package under the same topic must change at least three of: subject, medium, composition, visual language, narrative angle.
- A single package is not just one extra image from an existing series.

Example in this directory:

```text
new/works/A/A-13-mirror-worlds/
├── topic.json
└── packages/
    └── series-three-eras/
        ├── package.json
        └── images/
            ├── 01-victorian-parlor/
            ├── 02-neon-apartment/
            └── 03-desert-observatory/
```

Commands:

```bash
npm run new:validate
npm run new:index
```
