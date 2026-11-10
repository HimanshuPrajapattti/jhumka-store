"use server";

import { redirect } from "next/navigation";
import { refresh, updateTag } from "next/cache";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/order-statuses";
import {
  DEFAULT_SITE_APPEARANCE,
  readSiteAppearance,
  type SiteAppearance,
} from "@/lib/appearance";
import type { AppearanceImage } from "@/lib/appearance-defaults";
import { getInsforgeAdmin, throwInsforgeError } from "@/lib/insforge-admin";
import { parseProductImages, type ProductImageAsset } from "@/lib/product-images";
import {
  deleteStoredImages,
  uploadImages,
  type StoredImage,
} from "@/lib/uploads";
import {
  createSession,
  destroySession,
  requireAdminAction,
  verifyCredentials,
} from "@/lib/auth";

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

export type LoginState = { error?: string } | null;

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!verifyCredentials(email, password)) {
    return { error: "Invalid email or password." };
  }

  await createSession();
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */

export type ProductFormState = { error?: string; ok?: boolean } | null;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "piece";
}

function parseKeptImages(formData: FormData): ProductImageAsset[] {
  return formData.getAll("kept").flatMap((value): ProductImageAsset[] => {
    if (typeof value !== "string") return [];
    try {
      const parsed: unknown = JSON.parse(value);
      if (
        parsed &&
        typeof parsed === "object" &&
        "url" in parsed &&
        typeof parsed.url === "string" &&
        "key" in parsed &&
        (typeof parsed.key === "string" || parsed.key === null)
      ) {
        return [{ url: parsed.url, key: parsed.key }];
      }
    } catch {
      return [];
    }
    return [];
  });
}

export async function saveProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdminAction();

  const idRaw = String(formData.get("id") ?? "");
  const id = idRaw ? Number(idRaw) : null;
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim() || "Jhumka";
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const featured = formData.get("featured") === "on";

  if (idRaw && (!Number.isInteger(id) || (id ?? 0) <= 0)) {
    return { error: "Invalid product ID." };
  }
  if (name.length < 3) return { error: "Name must be at least 3 characters." };
  if (!Number.isFinite(price) || price < 1 || price > 1_000_000) {
    return { error: "Enter a valid price in rupees." };
  }
  if (!Number.isInteger(stock) || stock < 0 || stock > 100_000) {
    return { error: "Enter a valid stock quantity." };
  }

  let uploaded: StoredImage[] = [];
  let removedKeys: string[] = [];
  try {
    const admin = getInsforgeAdmin();
    const existing = id
      ? await admin.database
          .from("products")
          .select("id, slug, images")
          .eq("id", id)
          .maybeSingle()
      : null;
    if (existing && "error" in existing) throwInsforgeError(existing.error);
    if (id && !existing?.data) return { error: "Product not found." };

    const oldAssets = existing?.data
      ? parseProductImages(existing.data.images)
      : [];
    const requestedKept = parseKeptImages(formData);
    const kept = requestedKept.flatMap((requested) => {
      const original = oldAssets.find((asset) => asset.url === requested.url);
      return original ? [original] : [];
    });

    const newImages = formData.getAll("newImages");
    const newFiles = newImages.filter((file): file is File => file instanceof File);
    const uploadedImages = await uploadImages(newFiles, "products");
    uploaded = uploadedImages;
    const images = [...kept, ...uploadedImages];
    let slug = existing?.data?.slug;
    if (!slug) {
      const base = slugify(name);
      let candidate = base;
      let suffix = 2;
      for (;;) {
        const { data, error } = await admin.database
          .from("products")
          .select("id")
          .eq("slug", candidate)
          .maybeSingle();
        throwInsforgeError(error);
        if (!data) break;
        candidate = `${base}-${suffix++}`;
      }
      slug = candidate;
    }

    const values = {
      slug,
      name,
      description,
      price: Math.round(price),
      category,
      images,
      stock,
      featured,
    };
    const result = id
      ? await admin.database.from("products").update(values).eq("id", id)
      : await admin.database.from("products").insert([values]);
    throwInsforgeError(result.error);

    removedKeys = oldAssets.flatMap((asset) =>
      asset.key && !kept.some((item) => item.key === asset.key)
        ? [asset.key]
        : [],
    );
  } catch (err) {
    if (uploaded.length) {
      try {
        await deleteStoredImages(uploaded.map((image) => image.key));
      } catch (cleanupError) {
        console.error("Could not remove incomplete product image uploads.", cleanupError);
      }
    }
    return {
      error: err instanceof Error ? err.message : "Could not save the product.",
    };
  }

  updateTag("products");
  if (removedKeys.length) {
    try {
      await deleteStoredImages(removedKeys);
    } catch (error) {
      console.error("Product saved, but old product images could not be removed.", error);
      return {
        error: "Product saved, but one or more old photos could not be removed.",
      };
    }
  }

  // Redirect lives outside the try/catch so NEXT_REDIRECT is never swallowed.
  redirect("/admin/products");
}

export type AppearanceFormState = {
  error?: string;
  ok?: boolean;
} | null;

type AppearanceImageKey =
  | "heroImage"
  | "homeBackgroundImage"
  | "siteBackgroundImage";

function setAppearanceImage(
  appearance: SiteAppearance,
  key: AppearanceImageKey,
  image: AppearanceImage | null,
): void {
  if (key === "heroImage") {
    appearance.heroImage = image ?? DEFAULT_SITE_APPEARANCE.heroImage;
  } else {
    appearance[key] = image;
  }
}

const APPEARANCE_IMAGE_FIELDS = [
  ["heroImage", "heroImage", "removeHeroImage"],
  ["homeBackgroundImage", "homeBackgroundImage", "removeHomeBackgroundImage"],
  ["siteBackgroundImage", "siteBackgroundImage", "removeSiteBackgroundImage"],
] as const satisfies readonly [AppearanceImageKey, string, string][];

export async function saveAppearance(
  _prev: AppearanceFormState,
  formData: FormData,
): Promise<AppearanceFormState> {
  await requireAdminAction();

  const color = String(formData.get("siteBackgroundColor") ?? "");
  if (!/^#[\da-f]{6}$/i.test(color)) {
    return { error: "Choose a valid background color." };
  }

  const appearance = await readSiteAppearance();
  const next: SiteAppearance = { ...appearance, siteBackgroundColor: color };
  const uploaded: string[] = [];
  const imageFiles = new Map<AppearanceImageKey, File>();

  for (const [key, fieldName] of APPEARANCE_IMAGE_FIELDS) {
    const value = formData.get(fieldName);
    if (value !== null && typeof value !== "string" && !(value instanceof File)) {
      return { error: "Choose a valid image file." };
    }
    if (value instanceof File && value.size > 0) imageFiles.set(key, value);
  }

  try {
    for (const [key, , removeField] of APPEARANCE_IMAGE_FIELDS) {
      const file = imageFiles.get(key);
      if (file) {
        const [image] = await uploadImages([file], "appearance");
        if (image) {
          setAppearanceImage(next, key, image);
          uploaded.push(image.key);
        }
      } else if (formData.get(removeField) === "on") {
        setAppearanceImage(next, key, null);
      }
    }

    const settings = [
      {
        key: "appearance.heroImage",
        value: next.heroImage.url,
        asset_key: next.heroImage.key,
      },
      {
        key: "appearance.homeBackgroundImage",
        value: next.homeBackgroundImage?.url ?? "",
        asset_key: next.homeBackgroundImage?.key ?? null,
      },
      {
        key: "appearance.siteBackgroundImage",
        value: next.siteBackgroundImage?.url ?? "",
        asset_key: next.siteBackgroundImage?.key ?? null,
      },
      {
        key: "appearance.siteBackgroundColor",
        value: next.siteBackgroundColor,
        asset_key: null,
      },
    ];
    const { error } = await getInsforgeAdmin().database.rpc(
      "save_site_appearance",
      { p_settings: settings },
    );
    throwInsforgeError(error);
  } catch (error) {
    if (uploaded.length) {
      try {
        await deleteStoredImages(uploaded);
      } catch (cleanupError) {
        console.error("Could not remove an incomplete appearance upload.", cleanupError);
      }
    }
    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not save website appearance.",
    };
  }

  updateTag("appearance");
  for (const [key] of APPEARANCE_IMAGE_FIELDS) {
    const previous = appearance[key];
    const current = next[key];
    if (previous?.key && previous.key !== current?.key) {
      try {
        await deleteStoredImages([previous.key]);
      } catch (error) {
        console.error(`Appearance saved, but old ${key} could not be removed.`, error);
        return {
          error: "Appearance saved, but an old photo could not be removed.",
        };
      }
    }
  }

  return { ok: true };
}

export async function deleteProduct(formData: FormData): Promise<void> {
  await requireAdminAction();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) throw new Error("Invalid product ID.");

  const admin = getInsforgeAdmin();
  const { data, error } = await admin.database
    .from("products")
    .select("images")
    .eq("id", id)
    .maybeSingle();
  throwInsforgeError(error);
  if (!data) return;

  const { error: deleteError } = await admin.database
    .from("products")
    .delete()
    .eq("id", id);
  throwInsforgeError(deleteError);
  updateTag("products");
  const keys = parseProductImages(data.images)
    .map((image) => image.key)
    .filter((key): key is string => key !== null);
  await deleteStoredImages(keys);
}

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

export async function updateOrderStatus(formData: FormData): Promise<void> {
  await requireAdminAction();

  const id = Number(formData.get("id"));
  const status = String(formData.get("status"));

  if (
    !Number.isInteger(id) ||
    !ORDER_STATUSES.includes(status as OrderStatus)
  ) {
    throw new Error("Invalid order status update.");
  }

  const { error } = await getInsforgeAdmin()
    .database.from("orders")
    .update({ status })
    .eq("id", id);
  throwInsforgeError(error);

  refresh();
}
