import "server-only";
import sharp from "sharp";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp"]);

export class ImageError extends Error {}

/**
 * Validates by real content (not the filename or the browser-supplied type), applies EXIF rotation,
 * then re-encodes to WebP. Re-encoding drops EXIF/GPS and any hidden payload. Output is always WebP.
 */
export async function processImage(file: File, opts: { maxSide: number; square?: boolean; quality?: number }) {
  if (file.size === 0) throw new ImageError("Empty file.");
  if (file.size > MAX_UPLOAD_BYTES) throw new ImageError("Each photo must be 5 MB or smaller.");
  const input = Buffer.from(await file.arrayBuffer());

  let meta;
  try {
    meta = await sharp(input, { failOn: "error" }).metadata();
  } catch {
    throw new ImageError("That file is not a valid image.");
  }
  if (!meta.format || !ALLOWED_FORMATS.has(meta.format)) throw new ImageError("Photos must be JPG, PNG or WebP.");
  if ((meta.width ?? 0) * (meta.height ?? 0) > 60_000_000) throw new ImageError("That image is too large to process.");

  let pipeline = sharp(input, { failOn: "error" }).rotate();
  pipeline = opts.square
    ? pipeline.resize(opts.maxSide, opts.maxSide, { fit: "cover", position: "attention" })
    : pipeline.resize({ width: opts.maxSide, height: opts.maxSide, fit: "inside", withoutEnlargement: true });
  const { data, info } = await pipeline.webp({ quality: opts.quality ?? 82 }).toBuffer({ resolveWithObject: true });
  return { buffer: data, width: info.width, height: info.height };
}
