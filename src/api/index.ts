import sharp, { ResizeOptions } from "sharp";

export const resizeImage = async (
  buffer: Buffer,
  uploadPath: string,
  dimensions: { picHeight?: number; picWidth?: number },
  options?: ResizeOptions
): Promise<{ height: number; width: number }> => {
  if (!dimensions.picHeight && !dimensions.picWidth) {
    throw new Error("either height or width is required for resizing");
  }
  const { height, width } = await sharp(buffer)
    .resize(dimensions.picWidth, dimensions.picHeight, options)
    .toFile(uploadPath);

  return { height, width };
};
