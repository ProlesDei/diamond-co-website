const HEIC_BRANDS = new Set(['heic', 'heix'])

export type Kind = { mimetype: string; ext: string }

function startsWith(bytes: Buffer, prefix: number[]): boolean {
  return bytes.length >= prefix.length && prefix.every((byte, i) => bytes[i] === byte)
}

// Reads the type from the file's first bytes, never from its name or the type the browser sent.
export function sniff(bytes: Buffer): Kind | undefined {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return { mimetype: 'image/jpeg', ext: 'jpg' }
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { mimetype: 'image/png', ext: 'png' }
  if (
    bytes.length >= 12 &&
    bytes.toString('latin1', 4, 8) === 'ftyp' &&
    HEIC_BRANDS.has(bytes.toString('latin1', 8, 12))
  ) {
    return { mimetype: 'image/heic', ext: 'heic' }
  }
  return undefined
}
