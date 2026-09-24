# Austin Kovach — Industrial Design Portfolio

Editorial portfolio using Austin's original PDF artwork, four project stories, education/experience, contact links, and interactive component studies.

## Run and build

Requires Node.js 22+.

```sh
npm ci
npm run dev
npm run build
```

Deploy `dist/` as static files. See DEPLOY.md for free Cloudflare Pages hosting and GitHub integration. PDF and imagery are served locally; typography loads DM Sans and Space Grotesk from Google Fonts with system fallbacks.

## Implemented

- Original PDF artwork and large zoomable PhotoSwipe galleries.
- Lazy-loaded Three.js viewer: orbit, zoom, named component selection, framing, isolation, exploded slider, reset, optional rotation.
- Named, selectable components retained from Austin's original project assemblies.
- glTF Transform and meshopt delivery compression: the four 5–106 MB exports become 1.1–3.1 MB browser assets without geometry simplification.
- Vite build, Motion introduction, keyboard tabs and 3D controls, reduced-motion handling, responsive layout, and image fallback when WebGL is unavailable.
- Playwright regression suite, axe accessibility harness, Lighthouse CI configuration.

## Authoritative 3D exports

The featured viewer uses Austin Kovach's supplied GLB project exports. `scripts/process-authoritative-models.mjs` preserves their geometry, hierarchy, materials, and named assemblies; adds viewer metadata; and applies meshopt delivery compression. The source exports remain the authority and the optimized browser files are not fabrication deliverables.

Earlier [TripoSR](https://github.com/VAST-AI-Research/TripoSR) image-reconstruction trials are retained in `public/models/*-triposr.glb` for technical review, but are **not featured in the portfolio viewer**. Austin's supplied exports are now the visible 3D presentation.

Final trial counts: coffee 11,976 vertices / 23,948 faces; mobility 9,495 / 18,982; haven 8,032 / 16,072; wrench 5,034 / 10,064. See `research/` for diagnostic renderings, prepared inputs, results, and the working environment list. Diagnostic renderings are not portfolio artwork.

Blender 4.5 was tried but its binary could not run in this environment. No Blender processing is claimed. Original CAD or measured multi-view sources are required for precise geometry.

### Reproduce

1. Clone the official TripoSR repo into `$RECONSTRUCTION_ROOT/TripoSR`; obtain its official config.yaml and model.ckpt weights in `$RECONSTRUCTION_ROOT/weights`.
2. Install upstream dependencies and packages from `research/python-environment.txt` in a separate virtual environment. This records the working environment, not a universal lockfile.
3. Run `python scripts/triposr-cpu-adapter.py "$RECONSTRUCTION_ROOT/TripoSR"`.
4. Run `python scripts/extract-assets.py`, then `RECONSTRUCTION_ROOT=/absolute/path python scripts/reconstruct-triposr.py`.
5. Outputs appear in `reconstruction-work/inference`. Model weights and third-party source checkouts are not bundled.

`npm run models -- /path/to/source-exports` regenerates the web models. `public/models/manifest.json` records filenames, hashes, component names, and output sizes. `scripts/asset-provenance.json` records PDF page/crop/xref origins. Portfolio artwork, models, and branding remain Austin's or their respective owners'; open-source tool licenses do not grant rights to that work.

## Verification

- Production Vite build passed.
- All four authoritative assemblies load after meshopt compression and preserve selectable component metadata.
- Settled desktop (1265px content) and narrow-screen (375px content) axe audits: **zero WCAG 2 A/AA and 2.1 AA violations**, with 27 and 28 passing rules. Automated coverage is not full accessibility certification.
- Browser-checked project switching, arrow-key tabs, full-size gallery, next image, Escape dismissal, and WebGL fallback. No document overflow at the tested widths.
- Diagnostic mesh renderings reviewed. The available browser disables WebGL, so GPU rendering, dragging, mesh hit testing, exploded animation, and touch gestures are **not runtime-certified here**.
- Playwright and Lighthouse suites are included but were not executed in this environment. No Lighthouse score is claimed.

Run `npm test` and `npm run audit` on a machine with supported browsers installed. `qa.html` is a development-only iframe/axe harness, excluded from the production build; the production build also eliminates the QA module.

## Ten open-source integrations

Three.js (MIT), TripoSR (MIT), rembg (MIT), glTF Transform (MIT), Vite (MIT), Motion (MIT), PhotoSwipe (MIT), Playwright (Apache-2.0), axe-core (MPL-2.0), and Lighthouse CI (Apache-2.0). Processing tools are separate from runtime dependencies. See package licenses for full notices. The site requires no paid AI API or GPU service.
