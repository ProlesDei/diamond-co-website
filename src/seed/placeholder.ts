import sharp from 'sharp'

const PLACEHOLDER_WIDTH = 3000
const PLACEHOLDER_HEIGHT = 3750

const escapeXml = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// A plain JPEG at the size a client photo is uploaded at: a soft backdrop, a ring outline and
// the sample piece's name. `view` shifts the colours so a piece's two images differ.
export const drawPlaceholder = async (title: string, view: number): Promise<Buffer> => {
  const hue = 30 + view * 14
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${PLACEHOLDER_WIDTH}" height="${PLACEHOLDER_HEIGHT}">
  <defs>
    <linearGradient id="backdrop" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="hsl(${hue}, 30%, 92%)"/>
      <stop offset="1" stop-color="hsl(${hue}, 22%, 74%)"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#backdrop)"/>
  <ellipse cx="1500" cy="1700" rx="620" ry="${560 - view * 120}" fill="none"
    stroke="hsl(${hue}, 45%, 48%)" stroke-width="110"/>
  <circle cx="1500" cy="${1080 + view * 60}" r="170" fill="hsl(200, 25%, 96%)"
    stroke="hsl(${hue}, 35%, 55%)" stroke-width="24"/>
  <text x="1500" y="3050" text-anchor="middle" font-family="serif" font-size="150"
    fill="hsl(${hue}, 25%, 30%)">${escapeXml(title)}</text>
  <text x="1500" y="3260" text-anchor="middle" font-family="sans-serif" font-size="90"
    letter-spacing="12" fill="hsl(${hue}, 20%, 38%)">SAMPLE PLACEHOLDER · VIEW ${view}</text>
</svg>`
  return sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toBuffer()
}
