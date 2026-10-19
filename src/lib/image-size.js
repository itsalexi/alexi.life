import path from "node:path";
import sharp from "sharp";

// Real pixel size of an image in /public, so pages can frame it by its actual shape
// (portrait photos shouldn't be forced into a wide crop). Build-time only.
const cache = new Map();
export async function imageSize(src) {
  if (!src || !src.startsWith("/")) return null;
  const clean = src.split("?")[0];
  if (cache.has(clean)) return cache.get(clean);
  try {
    const { width, height } = await sharp(
      path.join(process.cwd(), "public", clean),
    ).metadata();
    const size = width && height ? { w: width, h: height } : null;
    cache.set(clean, size);
    return size;
  } catch {
    cache.set(clean, null);
    return null;
  }
}
