export type ProductImageAsset = {
  url: string;
  key: string | null;
};

export function parseProductImages(value: unknown): ProductImageAsset[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((image): ProductImageAsset[] => {
    if (typeof image === "string" && image.startsWith("/")) {
      return [{ url: image, key: null }];
    }
    if (
      image &&
      typeof image === "object" &&
      "url" in image &&
      typeof image.url === "string" &&
      "key" in image &&
      (typeof image.key === "string" || image.key === null)
    ) {
      return [{ url: image.url, key: image.key }];
    }
    return [];
  });
}
