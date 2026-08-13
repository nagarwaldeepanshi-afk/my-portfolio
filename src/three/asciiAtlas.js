// Builds a canvas texture atlas of monospace "code" glyphs.
// Each cell in the grid holds one character; instances pick a cell via UV offset.
import * as THREE from 'three'

const CHARS = '01{}[]()<>/\\;:=+*#%&$@ABCDEFGHIJKLMNOPQRSTUVWXYZ01010110'

export function buildAsciiAtlas(cell = 64) {
  const cols = 8
  const rows = Math.ceil(CHARS.length / cols)
  const canvas = document.createElement('canvas')
  canvas.width = cols * cell
  canvas.height = rows * cell
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `600 ${cell * 0.66}px "Space Grotesk", monospace`

  for (let i = 0; i < CHARS.length; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = col * cell + cell / 2
    const y = row * cell + cell / 2
    ctx.fillText(CHARS[i], x, y)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter

  return { texture, cols, rows, count: CHARS.length }
}
