export interface ImageCompressionOptions {
  /** Bounds for the compressed candidate; aspect ratio is retained, never upscaled. */
  maxWidth?: number;
  maxHeight?: number;
  /** WebP quality between 0 and 1. Defaults to 0.82. */
  quality?: number;
}

// Animated PNG/WebP must not silently become a single still frame.
function hasAnimation(buffer: ArrayBuffer): boolean {
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  const tag = (offset: number) =>
    String.fromCharCode(...bytes.subarray(offset, offset + 4));
  const png =
    view.byteLength >= 8 &&
    view.getUint32(0) === 0x89504e47 &&
    view.getUint32(4) === 0x0d0a1a0a;
  const webp = view.byteLength >= 12 && tag(0) === "RIFF" && tag(8) === "WEBP";
  if (!png && !webp) return false;
  for (let offset = png ? 8 : 12; offset + (png ? 12 : 8) <= view.byteLength;) {
    const name = tag(offset + (png ? 4 : 0));
    if (name === "acTL" || name === "ANIM" || name === "ANMF") return true;
    const length = view.getUint32(offset + (png ? 0 : 4), webp);
    offset += png ? length + 12 : length + 8 + (length % 2);
  }
  return false;
}

/**
 * Standalone browser compressor; performs no upload, fetch or storage writes.
 * Accepts JPEG/PNG/WebP up to 32 MiB. Animated images pass through unchanged.
 * Returns a WebP File (or actual PNG browser fallback) only when it is smaller;
 * otherwise returns the original File. Transparency is retained with WebP/PNG.
 * Call from a browser event handler: await compressImage(file, { quality: 0.8 }).
 */
export async function compressImage(
  file: File,
  {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.82,
  }: ImageCompressionOptions = {},
): Promise<File> {
  if (
    !["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)
  )
    throw new Error("Choose a JPEG, PNG or WebP image.");
  if (!file.size || file.size > 32 * 1024 * 1024)
    throw new Error("Image must be nonempty and no larger than 32 MiB.");
  if (
    ![maxWidth, maxHeight].every(
      (value) => Number.isInteger(value) && value >= 1 && value <= 4096,
    ) ||
    !Number.isFinite(quality) ||
    quality < 0 ||
    quality > 1
  )
    throw new Error("Use dimensions from 1 to 4096 and quality from 0 to 1.");
  if (
    typeof document === "undefined" ||
    typeof createImageBitmap !== "function"
  )
    throw new Error(
      "Image compression requires a browser with Canvas and createImageBitmap support.",
    );
  if (hasAnimation(await file.arrayBuffer())) return file;

  const image = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });
  const canvas = document.createElement("canvas");
  try {
    if (!image.width || !image.height)
      throw new Error("Image has invalid dimensions.");
    const scale = Math.min(1, maxWidth / image.width, maxHeight / image.height);
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Image compression canvas is unavailable.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (value) => {
          if (value?.size) resolve(value);
          else reject(new Error("Image could not be compressed."));
        },
        "image/webp",
        quality,
      );
    });
    if (blob.size >= file.size) return file;
    const extension =
      blob.type === "image/webp"
        ? "webp"
        : blob.type === "image/png"
          ? "png"
          : null;
    if (!extension)
      throw new Error("Browser returned an unsupported image format.");
    const name = file.name.replace(/\.[^.]+$/u, "") || "image";
    return new File([blob], `${name}.${extension}`, {
      type: blob.type,
      lastModified: file.lastModified,
    });
  } finally {
    image.close();
    canvas.width = canvas.height = 0;
  }
}
