# Politis Docs

User guide and administrator documentation for [Politis](https://clouway.com) — a platform for mobile sales and back-office management.

Built with [Docusaurus 3](https://docusaurus.io/), deployed to GitHub Pages.

- **BG** — default locale.
- **EN** — partial (being translated).

## Structure

```
docs/
├── get-started/       # Overview + quick start
├── mobile/            # Mobile app user guide
│   └── cash-session   # ← docs for a specific feature
└── backoffice/        # Web admin guide
i18n/en/…              # English translations
src/
├── pages/index.tsx    # Landing page (feature tiles)
└── css/custom.css     # Politis brand theme
static/img/            # Shared images (logo, favicon)
scripts/
└── migrate-from-gatsby.mjs   # One-off migration from the old site
```

## Local development

```bash
npm install
npm start              # http://localhost:3000
```

## Commands

| Command | Purpose |
|---|---|
| `npm start` | Dev server with hot reload |
| `npm run build` | Production build → `build/` |
| `npm run serve` | Serve the production build locally |
| `npm run typecheck` | Verify TypeScript |
| `npm run clear` | Clear the Docusaurus cache |

## Adding a new page

1. Create a `.md` file under `docs/mobile/...` or `docs/backoffice/...`.
2. Add frontmatter (`id`, `title`, `sidebar_position`).
3. Co-locate images next to the markdown and reference them with `./image.png`.
4. For a new folder, add `_category_.json`:
   ```json
   {"label": "🏷️ Моята категория", "position": 4}
   ```

The sidebar is auto-generated — no need to touch `sidebars.ts` for ordinary changes.

## Deployment

Every push to `main` triggers `.github/workflows/deploy.yml`, which builds the site and publishes to GitHub Pages.

For a custom domain (e.g. `docs.politis.clouway.com`):

1. Set `url` and keep `baseUrl: '/'` in `docusaurus.config.ts`.
2. Add a `CNAME` file under `static/` containing the domain.
3. Configure DNS to point at GitHub Pages.

## License

- Content (markdown, images): **CC BY 4.0** — see `LICENSE-docs`.
- Code (TypeScript, CSS, config): **MIT** — see `LICENSE`.

## Contributing

Pull requests welcome. For internal Politis team members, edit flow is:

1. Branch off `main`.
2. Make changes (add/edit docs).
3. Preview locally (`npm start`).
4. Open PR — CI will typecheck and build.
5. After merge, the site deploys automatically.
