# visual-0003: 一套颜色，两种主题

Independent original semantic-color workbench. Task names and states are demonstration content; this is not a reproduction of an external site's visible effect. Per-version Chen acceptance remains pending.

## Use and integrate

Open preview.html through the local dictionary or standalone. Use the actual controls to inspect the concept; retain native semantics, visible focus, responsive content and static/reduced-motion alternatives. Carry only the relevant scoped rules and handlers into an authorized target project. No external service or durable business operation is implied.

The current runtime paths are listed in element.json/code_paths. catalog/site-fonts.css embeds the official Noto Sans SC / Noto Serif SC subsets as shared data faces so opaque sandboxed previews work on plain static hosting. Carry both OFL-notosanssc.txt / OFL-notoserifsc.txt notices and official-fonts.provenance.json from catalog/assets/fonts/. The generated CSS is runtime; raw subset WOFF2 files and tools/subset_site_fonts.py are rebuild inputs, not required runtime companions. Each relevant original generated photo has a nearby provenance.json or .provenance.json and an embedded EXIF origin/prompt. Keep these records when copying an image. Paper-field reuse uses the same catalog/paper-field.js rather than a duplicated engine.

## Scene and controls

The color picker updates the actual action background, active-state marker and live color readout. The theme control changes the surface/text/success/error roles as a group. The button chooses black or white text from the actual accent luminance and shows the resulting contrast ratio. State words remain readable and do not rely on color alone.

- Controls: 选择强调色，观察按钮、状态标记与色值一起变化；切换深浅主题，比较整组语义色。

The previous implementation changed `--accent` while the action background used `--text`. Its visible accent dot was also outside the compact view's useful focal area. That defect was reproduced with a red picker and unchanged green action, then repaired through actual rendered control checks. Keep the variable-to-element relationship when adapting this example.

Integration guidance: 按用途定义颜色，并让成功或错误同时带有明确文字；检查实际背景上的可读性。 将背景、正文、次要文字与操作色提取为CSS变量；成套切换主题。

Scope shared body/heading styles to the destination component. The iframe height helper is dictionary infrastructure and can be omitted for standalone reuse. Validate the chosen component in its destination context.

## Review and version

Current headless desktop/narrow raster and behavioral evidence is recorded in reviews/2026-11-08-functional-visual-audit.md. Prior checks are historical after this material visible revision. A matching code fingerprint proves identity, not correctness, original-source fidelity or Chen acceptance. The current audit uses one Chrome engine and does not verify the OS-native color-picker dialog or physical devices.

## Two-screen dictionary presentation

The dictionary embeds this candidate with `view=compact`, using `elements/compact.css` and `elements/compact.js` listed in its current runtime paths. The compact view replaces redundant promotional framing with direct mechanism labels and preserves the native controls. Full standalone authored composition remains a code artifact, outside the dictionary navigation hierarchy. Actual current checks and size limits are in reviews/2026-11-08-two-screen.md.

Carry only relevant rules/handlers when adapting the example. The local dialog-close bridge avoids form submission inside opaque preview frames; do not add sandbox permissions as a workaround. Current code identity and pending Chen acceptance remain separate from historical full-scene checks.
