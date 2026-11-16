# motion-0007: 纸面点阵波纹

Independent original use scene: 纸面点阵波纹. All brands, schedules, projects and content are fictional demonstration context. This implementation is not a reproduction of an external site's visible effect. Per-version Chen acceptance remains pending.

## Use and integrate

Open preview.html through the local dictionary or standalone. Use the actual controls to inspect the concept; retain native semantics, visible focus, responsive content and static/reduced-motion alternatives. Carry only the relevant scoped rules and handlers into an authorized target project. No external service or durable business operation is implied.

The current runtime paths are listed in element.json/code_paths. catalog/site-fonts.css embeds the official Noto Sans SC / Noto Serif SC subsets as shared data faces so opaque sandboxed previews work on plain static hosting. Carry both OFL-notosanssc.txt / OFL-notoserifsc.txt notices and official-fonts.provenance.json from catalog/assets/fonts/. The generated CSS is runtime; raw subset WOFF2 files and tools/subset_site_fonts.py are rebuild inputs, not required runtime companions. Each relevant original generated photo has a nearby provenance.json or .provenance.json and an embedded EXIF origin/prompt. Keep these records when copying an image. Paper-field reuse uses the same catalog/paper-field.js rather than a duplicated engine.

## Minimal integration contract

Reuse `catalog/paper-field.js` and `catalog/assets/paper-fiber.png`, with the paper raster's provenance sidecar. The decorative engine requires the following existing IDs; it does not require scene typography, the iframe helper or photographic assets:

```html
<div class="paper-surface" data-paper-surface>
  <canvas id="paper-field" aria-hidden="true"></canvas>
</div>
<button id="paper-motion" type="button" aria-pressed="false" hidden>底纹动效</button>
<script src="paper-field.js" defer></script>
```

Carry the surface, canvas and `.paper-wave-ready` rules from `paper.css`, adjusting relative asset URLs for the authorized destination. The specimen uses an absolute, pointer-transparent canvas inside the isolated `data-paper-surface` container. The same engine automatically binds local input to that container. Without this wrapper, the dictionary's existing full-page canvas keeps its original viewport behavior. Static CSS dots and the original fiber image must remain visible when the canvas is unavailable, JavaScript is disabled, motion is opted out or the device reports a coarse pointer/reduced motion. The standalone artifact retains a details disclosure; the compact view keeps implementation notes in the parent dictionary's usage tab.

The existing engine uses 24px points, or28px below600px, a165px pointer radius and17px peak repulsion contribution. Ripple impulses are capped at7 and expire after1500ms. Spring movement stops repainting when settled; pointer leave releases the local displacement. This is a bounded decorative surface, not a full-page perpetual particle simulation. Constants currently live in the shared engine; adapting them changes that candidate version.

The toggle stores its preference in `vbc.paper-motion.v1` on the current origin when storage is available; opaque iframes may retain a session-only choice. Do not infer cross-device persistence. When embedding, keep body `min-height:0` so content height cannot grow with its own expanding iframe; standalone can retain `min-height:100vh`.

Chen's positive feedback and request to create the card apply to the existing background effect. The standalone composition is a new candidate version with its own scoped checks. Source `src-0037`, case `case-0027` and term `term-0053` preserve that distinction.

## Review and version

Actual desktop/narrow raster and primary interaction evidence is recorded per item in reviews/2026-11-08-full-collection.md. Prior checks are historical after this material visible revision. A matching code fingerprint proves identity, not correctness, original-source fidelity or Chen acceptance. Physical-device/browser/OS coverage remains explicit in that review.

## Two-screen dictionary presentation

The dictionary embeds this candidate with `view=compact`, using `elements/compact.css` and `elements/compact.js` listed in its current runtime paths. The compact view replaces redundant promotional framing with direct mechanism labels and preserves the native controls. Full standalone authored composition remains a code artifact, outside the dictionary navigation hierarchy. Actual current checks and size limits are in reviews/2026-11-08-two-screen.md.

Carry only relevant rules/handlers when adapting the example. The local dialog-close bridge avoids form submission inside opaque preview frames; do not add sandbox permissions as a workaround. Current code identity and pending Chen acceptance remain separate from historical full-scene checks.


## Scoped field reuse

The original acquired engine/hash remains historical source evidence in src-0037. The current catalog/paper-field.js refactors that spring/pulse model into window.VBCPaperField.create(canvas, options). The global wrapper preserves the IDs, default constants, persistence and fallbacks above. A local thumbnail can pass local:true, target:card, step:16, radius:90, push:13, limit:4 and duration:1100; keep the decorative canvas pointer-transparent. Destroy the returned instance before replacing the card. This is one engine, not a copied thumbnail implementation.

Shared catalog/pointer.css and pointer.js are now included in the full runtime manifest. When embedded, the source-validated parent handshake synchronizes the chosen cursor without broadening sandbox permissions. These UI-cursor additions do not establish a new per-item visual check; current static checks and preserved historical visual evidence are distinguished in element.json and reviews/2026-11-08-cards-motion.md.
