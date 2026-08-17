export async function compressImageFile(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Use a JPG, PNG, or WebP photo.");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Use a photo under 8 MB.");
  }

  const bitmap = await createImageBitmap(file);
  const max = 400;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not read that photo.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", 0.82);
}
