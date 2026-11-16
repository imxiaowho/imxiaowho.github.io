# visual-0008: 文字对比度实验

Independent original use scene: COMMON GROUND. All brands, schedules, projects and content are fictional demonstration context. This implementation is not a reproduction of an external site's visible effect. Per-version Chen acceptance remains pending.

## Use and integrate

Open preview.html through the local dictionary or standalone. Use the actual controls to inspect the concept; retain native semantics, visible focus, responsive content and static/reduced-motion alternatives. Carry only the relevant scoped rules and handlers into an authorized target project. No external service or durable business operation is implied.

The current runtime paths are listed in element.json/code_paths. catalog/site-fonts.css embeds the official Noto Sans SC / Noto Serif SC subsets as shared data faces so opaque sandboxed previews work on plain static hosting. Carry both OFL-notosanssc.txt / OFL-notoserifsc.txt notices and official-fonts.provenance.json from catalog/assets/fonts/. The generated CSS is runtime; raw subset WOFF2 files and tools/subset_site_fonts.py are rebuild inputs, not required runtime companions. Each relevant original generated photo has a nearby provenance.json or .provenance.json and an embedded EXIF origin/prompt. Keep these records when copying an image. Paper-field reuse uses the same catalog/paper-field.js rather than a duplicated engine.

## Scene and controls

COMMON GROUND color specimen: foreground/background choices change a real heading, body and action while exposing opaque-sRGB contrast.

- Native controls: 只计算当前这对不透明sRGB颜色；不代表整页符合可访问性标准。

Integration guidance: 针对不透明sRGB色计算相对亮度；透明或图像背景需要先求实际显示结果。 检查文字与实际背景的对比；普通文字参考4.5:1，字号和其他可访问性条件仍需另外检查。

Scope shared body/heading styles to the destination component. The iframe height helper is dictionary infrastructure and can be omitted for standalone reuse. Validate the chosen component in its destination context.

## Review and version

Actual desktop/narrow raster and primary interaction evidence is recorded per item in reviews/2026-11-08-full-collection.md. Prior checks are historical after this material visible revision. A matching code fingerprint proves identity, not correctness, original-source fidelity or Chen acceptance. Physical-device/browser/OS coverage remains explicit in that review.

## Two-screen dictionary presentation

The dictionary embeds this candidate with `view=compact`, using `elements/compact.css` and `elements/compact.js` listed in its current runtime paths. The compact view replaces redundant promotional framing with direct mechanism labels and preserves the native controls. Full standalone authored composition remains a code artifact, outside the dictionary navigation hierarchy. Actual current checks and size limits are in reviews/2026-11-08-two-screen.md.

Carry only relevant rules/handlers when adapting the example. The local dialog-close bridge avoids form submission inside opaque preview frames; do not add sandbox permissions as a workaround. Current code identity and pending Chen acceptance remain separate from historical full-scene checks.
