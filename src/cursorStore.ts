export const cursorStore = {
  x: -200,
  y: -200,
  path: '',
  baseR: 14,
  // When true, the mouse-following blob cursor fades itself out —
  // used by PCBReveal so the blob visually "dissolves" into the
  // burst of binary digits instead of the two effects overlapping.
  burstActive: false,
};
