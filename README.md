# Portfolio — React + Three.js

A single-page portfolio where Hero, About, and Projects share one continuous
3D story:

1. **Hero** — an ascii-character particle field (1600 glyphs: `0 1 { } [ ]
   < > / \ + = # ...`) scattered across the screen, repelling from and
   flickering near your cursor.
2. **About** — as you scroll, the ascii dust accumulates into the outline of
   a circuit board, then crossfades into a solid, lit, realistic PCB model
   (dark FR4-style board, glowing copper traces, chip packages with pins,
   mounting holes) with your bio in a glass panel and your stats/skills
   labeled directly on the board's chips.
3. **Projects** *(desktop / fine-pointer devices)* — a USB cable draws
   itself from the PCB's edge connector to a 3D display, the screen powers
   on, and your project cards appear on it, mapped in real 3D via
   `@react-three/drei`'s `Html transform`. The camera pans to follow the
   story. On mobile, touch devices, or `prefers-reduced-motion`, this
   degrades gracefully to a plain, fully accessible project grid — same
   content, no extra WebGL cost.

## Stack
React 18 · Vite · Tailwind CSS · Three.js / React Three Fiber + drei · Framer Motion · lucide-react

## Run locally
```
npm install
npm run dev
```
Open the printed localhost URL. Scroll slowly through Hero → About →
Projects on a wide, mouse/trackpad-driven browser window to see the full
sequence (the cable/display scene only renders at `lg` breakpoints with a
fine pointer — see `src/hooks/useCanRender3DExtras.js`).

## Build for production
```
npm run build
npm run preview
```
Output goes to `dist/`.

## Structure
```
src/
  components/
    Experience.jsx          orchestrates Hero + About (+ Projects) scroll progress
    Hero.jsx                 intro copy, fades as the PCB starts forming
    About.jsx                  bio panel, reveals once the PCB is mostly formed
    Projects.jsx                fallback flat project grid (mobile / reduced motion)
    ProjectsScreenContent.jsx    compact project grid embedded on the 3D display
    Navbar.jsx, Contact.jsx, Footer.jsx
  three/
    CodeUniverse.jsx         the single fixed full-viewport R3F canvas
    AsciiField.jsx             ascii particle system (scatter <-> PCB blend, cursor FX)
    asciiAtlas.js               canvas-based glyph texture atlas
    pcbLayout.js                 procedural PCB point-cloud + shared layout constants
    PCBModel.jsx                  the solid, lit, realistic PCB (board/traces/chips/holes)
    PCBLabels.jsx                  drei <Html> stat/skill callouts anchored to PCB chips
    sceneLayout.js                 display position, cable curve, camera keyframes
    UsbCable.jsx                    animated tube cable, draws on as you scroll
    Display.jsx                      monitor mesh; powers on and mounts the screen content
    CameraRig.jsx                    scroll-driven camera dolly/pan across the whole journey
    timeline.js                      shared 0->1 progress thresholds for Hero/About
  hooks/
    useScrollProgress.js       rAF-driven 0->1 scroll progress for a wrapper element
    useCanRender3DExtras.js      gates the cable/display scene to capable devices
  data/projects.js            edit this to update your project cards (used by both
                                the fallback grid and the on-screen version)
  App.jsx, main.jsx, index.css
```

## How the scroll-driven story works
Everything is driven by two independent `progress` values (each 0 → 1,
computed by `useScrollProgress` from an element's position in the viewport):

- **`heroAboutProgress`** spans the Hero+About wrapper. It drives the ascii
  field's scatter → PCB-shape blend (`AsciiField.jsx`), the solid PCB's
  crossfade-in (`PCBModel.jsx`), the chip labels (`PCBLabels.jsx`), and the
  Hero/About content fades — see the thresholds in `three/timeline.js`.
- **`projectsProgress`** spans the Projects wrapper (only mounted when
  `useCanRender3DExtras` is true). It drives the camera pan, the cable
  draw-on animation, the display's power-on glow, and the project cards
  fading in — see the thresholds in `three/sceneLayout.js`
  (`PROJECTS_TIMELINE`).

`CameraRig.jsx` blends camera position/lookAt across both progress values so
the whole thing reads as one continuous camera move rather than three
separate scenes.

## Customize
- Board layout (chips, traces, board size): `src/three/pcbLayout.js` (point-cloud) and `src/three/PCBModel.jsx` (solid geometry — keep `TRACE_PATHS`/`HOLE_CORNERS` in sync with `pcbLayout.js` if you change the layout)
- Display position, cable path, camera keyframes: `src/three/sceneLayout.js`
- Which stats/skills are labeled on the board: `src/three/PCBLabels.jsx`
- What's shown on the powered-on display: `src/components/ProjectsScreenContent.jsx` (reads from `src/data/projects.js`)
- Particle count, colors, glyph set: `src/three/AsciiField.jsx` (`COUNT`) and `src/three/asciiAtlas.js` (`CHARS`)
- Timing of every fade/accumulate/reveal: `src/three/timeline.js` and `src/three/sceneLayout.js` (`PROJECTS_TIMELINE`)
- When the 3D Projects scene is enabled vs. the fallback grid: `src/hooks/useCanRender3DExtras.js`
- Name, title, copy: `Hero.jsx`, `About.jsx`, `Navbar.jsx`, `Footer.jsx`
- Colors/fonts: `tailwind.config.js`
- Contact form currently simulates a send client-side — wire `handleSubmit` in `Contact.jsx` to your backend/email service (e.g. Formspree, Resend) to make it functional.

## Recent tweaks
- Site background is now a grey-to-black vertical gradient (`src/index.css`,
  `body { background: linear-gradient(...) }`, fixed attachment so it reads
  as a constant vignette rather than repeating down a long page).
- The Projects camera now has two stages: a wide establishing shot while the
  cable draws in and the display powers on, then a tight push-in (dolly +
  narrower FOV) on the screen itself timed to arrive as the project cards
  reveal. Tune via `CAMERA_KEYFRAMES.projectsWide` / `.projectsZoom` and
  `PROJECTS_TIMELINE.zoomStart` / `.zoomEnd` in `src/three/sceneLayout.js`.

## Performance & accessibility notes
- The ascii field uses 1600 instanced particles with per-frame CPU position
  updates. Lower `COUNT` in `AsciiField.jsx` (try 800–1000) for lower-end
  hardware.
- The cable/display scene is gated to `lg`+ viewports with a fine pointer
  and no `prefers-reduced-motion` (`useCanRender3DExtras.js`). Everyone else
  gets `Projects.jsx`, a normal accessible grid with the same content and
  real links.
- The PCB/cable/display materials are hand-tuned `MeshStandardMaterial`
  (no baked textures or a bloom post-processing pass), so the look is
  "realistic-ish/stylized" rather than physically-based — deliberate, to
  keep the bundle light and avoid an extra postprocessing dependency. If
  you want real bloom on the glowing traces/screen, add
  `@react-three/postprocessing` and wrap `CodeUniverse`'s `<Canvas>` content
  in an `<EffectComposer><Bloom /></EffectComposer>`.
