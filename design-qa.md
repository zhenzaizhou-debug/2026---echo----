# Design QA — interactive ripple loading and free-flight scene

- source visual truth: `C:\Users\29951\AppData\Local\Temp\codex-clipboard-b29ce394-c37c-4b02-a712-0a9e13277f4e.png` plus the user's black water-ripple / mouse-interaction / English loading brief
- implementation screenshots: `qa-ripple-loading-final.png`, `qa-free-fly-before.png`, `qa-free-fly-after.png`
- combined comparison: `qa-free-fly-comparison.png`
- source pixels: 2467 × 1357
- implementation pixels: 1280 × 720
- CSS viewport: 1280 × 720, device scale factor 1
- normalization: source and implementation were center-cropped to equal 1280 × 720 panels and joined into a 2560 × 720 comparison image
- state: loading after automatic droplets plus mouse movement/click; final scene before and after free-flight keyboard input

## Full-view comparison evidence

The source capture shows the camera beneath the intended visual surface, with a dark foreground and the environment compressed above it. The implementation comparison shows a stable elevated camera, upright horizon, clear sea/sunset, and readable foreground. The loading capture is full black with a centered English `LOADING` label and overlapping white water waves.

## Focused-region comparison evidence

The horizon and foreground were inspected in the combined image because they are the failure surface in the provided screenshot. The implementation no longer derives vertical position from collider raycasts, so the horizon remains stable during horizontal and vertical input. The loading state was inspected separately because it is a different interaction state; mouse movement and click both injected new wave energy without console errors.

## Required fidelity surfaces

- fonts and typography: `LOADING` uses a compact neutral sans-serif with wide tracking and clear contrast; existing bilingual scene UI remains unchanged except for updated flight instructions.
- spacing and layout rhythm: loading copy remains fixed at the viewport center while ripples move beneath it; final scene controls remain unobtrusive at the bottom.
- colors and visual tokens: loading is true black with soft white/cool-gray wave highlights; the beach keeps its warm sunset palette.
- image quality and asset fidelity: the supplied Gaussian splat is unchanged; the new loading visual is a live wave simulation rather than a static placeholder.
- copy and content: visible loading copy is English-only `LOADING`; help and settings now describe fly, height, and boost controls accurately.

## Primary interactions tested

- Enter from homepage into loading state
- autonomous ripple generation
- pointer movement and click ripple injection
- loading completion into the Gaussian scene
- repeated forward input and repeated rise input in free-flight mode
- console errors checked in a fresh browser tab: none

## Comparison history

1. Earlier finding [P1]: the physical-ground controller could place the camera below the usable Gaussian surface. Fix: removed ground raycast, height damping, slope rejection, and walking bob from camera movement; replaced them with an unconstrained three-axis flight controller. Post-fix evidence: `qa-free-fly-before.png`, `qa-free-fly-after.png`, and `qa-free-fly-comparison.png`.
2. Earlier finding [P2]: the first ripple tuning filled the screen with heavy high-energy wave bands. Fix: increased simulation resolution, reduced seed count and wave strength, and refined the centered label. Post-fix evidence: `qa-ripple-loading-final.png`.

## Findings

No actionable P0, P1, or P2 findings remain.

## Follow-up polish

- [P3] A future control overlay could visualize the vertical axis while flying, but the current text hint and settings panel already expose the complete control set.

## Implementation checklist

- [x] Black interactive water-ripple loading screen
- [x] Visible English `LOADING` label
- [x] Mouse movement and click affect the water simulation
- [x] Free three-axis movement replaces walkable-ground physics
- [x] Stable elevated initial camera and no automatic vertical drift
- [x] WASD fly, Space/Ctrl height, Shift boost, mouse look
- [x] Lint, production build, interaction flow, and console checks passed

final result: passed
