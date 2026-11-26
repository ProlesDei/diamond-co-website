const LONG_EDGE = 2400
const JPEG_QUALITY = 0.85

export type Shrunk = { blob: Blob }

function canvas(width: number, height: number) {
  const element = document.createElement('canvas')
  element.width = width
  element.height = height
  const context = element.getContext('2d')
  if (!context) throw new Error('This browser has no 2D canvas.')
  // A JPEG has no transparency: paint white first, so a transparent PNG sketch doesn't turn black.
  context.fillStyle = '#fff'
  context.fillRect(0, 0, width, height)
  return { element, context }
}

function toJpeg(element: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    element.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('The photo could not be turned into a JPEG.'))),
      'image/jpeg',
      JPEG_QUALITY,
    )
  })
}

// Redrawing the photo on a canvas keeps only its pixels, so its EXIF and GPS tags never leave the phone.
export async function shrink(file: File): Promise<Shrunk | 'undecodable'> {
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    return 'undecodable'
  }
  try {
    const { width, height } = bitmap
    const scale = Math.min(1, LONG_EDGE / Math.max(width, height))
    const full = canvas(Math.round(width * scale), Math.round(height * scale))
    full.context.drawImage(bitmap, 0, 0, full.element.width, full.element.height)

    return { blob: await toJpeg(full.element) }
  } finally {
    bitmap.close()
  }
}
