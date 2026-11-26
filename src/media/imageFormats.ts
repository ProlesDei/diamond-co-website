import { writeFile } from 'node:fs/promises'
import { FileUploadError, type CollectionBeforeOperationHook } from 'payload'
import sharp from 'sharp'

// These inputs use Payload's resize and JPEG conversion path.
export const mediaMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/tiff']
export const mediaJpegOptions = { quality: 95 }
const cropFormats = ['png', 'webp', 'gif', 'tiff']

export const prepareMediaImage: CollectionBeforeOperationHook = async ({ operation, overrideAccess, req }) => {
  const file = req.file
  if ((operation !== 'create' && operation !== 'update') || !(req.user || overrideAccess) ||
      !file || !mediaMimeTypes.includes(file.mimetype)) return

  try {
    const image = sharp(file.tempFilePath || file.data)
    const { format, compression, orientation, pages } = await image.metadata()
    const edits = req.query?.uploadEdits
    const hasCrop = edits && typeof edits === 'object' && 'crop' in edits && Boolean(edits.crop)
    const needsJpegCrop = hasCrop && (cropFormats.includes(format) || (format === 'heif' && compression === 'av1'))
    const needsOrientation = format === 'jpeg' && orientation !== undefined && orientation > 1
    const needsFirstFrame = pages && pages > 1 && (format === 'gif' || format === 'webp' || format === 'tiff')
    const prepareJpeg = needsOrientation || needsJpegCrop
    if (!prepareJpeg && !needsFirstFrame) return

    // The admin sends crop coordinates from the upright preview. Payload crops against
    // the input pixels, so apply EXIF orientation before it measures and crops the JPEG.
    // Payload retains the crop input's encoding even when it names the output as JPEG.
    // For multi-frame inputs, pass a single frame so Payload measures it as a still image.
    const upright = image.autoOrient()
    const bytes = await (prepareJpeg ? upright.jpeg(mediaJpegOptions) : upright.png()).toBuffer()
    if (file.tempFilePath) await writeFile(file.tempFilePath, bytes)
    req.file = {
      ...file,
      data: file.tempFilePath ? file.data : bytes,
      mimetype: prepareJpeg ? 'image/jpeg' : 'image/png',
      size: bytes.length,
    }
  } catch (error) {
    req.payload.logger.error(error)
    throw new FileUploadError(req.t)
  }
}
