# Elastic drag · Pull Xiaowho

[Play the full example](https://imxiaowho.org/elements/motion/motion-0008/preview.html). The dictionary uses the same assets with the compact view and an opaque script-only iframe.

- preview.html supplies the responsive stage and the attributed prompt transcript.
- pull.js renders the original head on a UV mesh. Pointer capture keeps a grip active outside the head. The pull falls off around the grip and the released shape follows a damped spring.
- head-plate.js contains the original transparent PNG bytes as a data URL. The embedded image lets the alpha mask and WebGL work without opening the iframe's origin.
- Arrow keys and the bounce button provide alternate input. Reduced motion omits the automatic spring and retains the blush. A still portrait is visible without WebGL.
- cover.webp comes from the actual local desktop drag render. Xiaowho artwork belongs to its creator. The supplied prompt screenshot credits @气质花.

This is the head-only version Chen marked for publication.
