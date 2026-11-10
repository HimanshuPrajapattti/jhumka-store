"use server";

import { redirect } from "next/navigation";
import { refresh, updateTag } from "next/cache";
import { getDb, ORDER_STATUSES, type OrderStatus } from "@/lib/db";
import {
  DEFAULT_SITE_APPEARANCE,
  readSiteAppearance,
  type SiteAppearance,
} from "@/lib/appearance";
import {
  APPEARANCE_IMAGE_TYPES,
  deleteUpload,
  saveUploads,
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

  if (name.length < 3) return { error: "Name must be at least 3 characters." };
  if (!Number.isFinite(price) || price < 1 || price > 1_000_000) {
    return { error: "Enter a valid price in rupees." };
  }
  if (!Number.isInteger(stock) || stock < 0 || stock > 100_000) {
    return { error: "Enter a valid stock quantity." };
  }

  try {
    const newImages = formData.getAll("newImages");
    const uploads = await saveUploads(
      newImages.filter((f): f is File => f instanceof File),
    );

    const kept = formData
      .getAll("kept")
      .map((v) => String(v))
      .filter((v) => v.startsWith("/"));
    const removed = formData
      .getAll("removed")
      .map((v) => String(v))
      .filter((v) => v.startsWith("/media/") || v.startsWith("/uploads/"));

    const images = [...kept, ...uploads];

    const db = getDb();

    if (id) {
      const existing = db
        .prepare("SELECT id, slug, images FROM products WHERE id = ?")
        .get(id) as { id: number; slug: string; images: string } | undefined;
      if (!existing) return { error: "Product not found." };

      const slug = existing.slug;
      db.prepare(
        `UPDATE products
         SET name = ?, slug = ?, description = ?, price = ?, category = ?,
             images = ?, stock = ?, featured = ?
         WHERE id = ?`,
      ).run(
        name,
        slug,
        description,
        Math.round(price),
        category,
        JSON.stringify(images),
        stock,
        featured ? 1 : 0,
        id,
      );

      for (const p of removed) await deleteUpload(p);
    } else {
      let slug = slugify(name);
      const slugExists = db.prepare(
        "SELECT 1 FROM products WHERE slug = ?",
      );
      let suffix = 2;
      let candidate = slug;
      while (slugExists.get(candidate)) {
        candidate = `${slug}-${suffix++}`;
      }
      slug = candidate;

      db.prepare(
        `INSERT INTO products (slug, name, description, price, category, images, stock, featured)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        slug,
        name,
        description,
        Math.round(price),
        category,
        JSON.stringify(images),
        stock,
        featured ? 1 : 0,
      );

      for (const p of removed) await deleteUpload(p);
    }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Could not save the product.",
    };
  }

  // Redirect lives outside the try/catch so NEXT_REDIRECT is never swallowed.
  updateTag("products");
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

const APPEARANCE_IMAGE_FIELDS = [
  ["heroImage", "heroImage", "removeHeroImage"],
  ["homeBackgroundImage", "homeBackgroundImage", "removeHomeBackgroundImage"],
  ["siteBackgroundImage", "siteBackgroundImage", "removeSiteBackgroundImage"],
] as const satisfies readonly [AppearanceImageKey, string, string][];

const APPEARANCE_SETTING_FIELDS = [
  ["heroImage", "appearance.heroImage"],
  ["homeBackgroundImage", "appearance.homeBackgroundImage"],
  ["siteBackgroundImage", "appearance.siteBackgroundImage"],
  ["siteBackgroundColor", "appearance.siteBackgroundColor"],
] as const satisfies readonly [keyof SiteAppearance, string][];

export async function saveAppearance(
  _prev: AppearanceFormState,
  formData: FormData,
): Promise<AppearanceFormState> {
  await requireAdminAction();

  const color = String(formData.get("siteBackgroundColor") ?? "");
  if (!/^#[\da-f]{6}$/i.test(color)) {
    return { error: "Choose a valid background color." };
  }

  const appearance = readSiteAppearance();
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
        const [url] = await saveUploads([file], APPEARANCE_IMAGE_TYPES);
        if (url) {
          next[key] = url;
          uploaded.push(url);
        }
      } else if (formData.get(removeField) === "on") {
        next[key] =
          key === "heroImage" ? DEFAULT_SITE_APPEARANCE.heroImage : "";
      }
    }

    const db = getDb();
    const upsert = db.prepare(
      `INSERT INTO site_settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    );
    db.transaction(() => {
      for (const [key, settingKey] of APPEARANCE_SETTING_FIELDS) {
        upsert.run(settingKey, next[key]);
      }
    })();
  } catch (error) {
    for (const url of uploaded) {
      try {
        await deleteUpload(url);
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

  for (const [key] of APPEARANCE_IMAGE_FIELDS) {
    if (appearance[key] !== next[key]) {
      try {
        await deleteUpload(appearance[key]);
      } catch (error) {
        console.error(`Could not remove the previous ${key} upload.`, error);
      }
    }
  }

  updateTag("appearance");
  return { ok: true };
}

export async function deleteProduct(formData: FormData): Promise<void> {
  await requireAdminAction();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;

  const db = getDb();
  const row = db
    .prepare("SELECT images FROM products WHERE id = ?")
    .get(id) as { images: string } | undefined;

  if (row) {
    db.prepare("DELETE FROM products WHERE id = ?").run(id);
    try {
      const images: unknown = JSON.parse(row.images);
      if (Array.isArray(images)) {
        for (const img of images) await deleteUpload(String(img));
      }
    } catch (error) {
      console.error("Could not remove product image uploads.", error);
    }
  }

  updateTag("products");
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
    return;
  }

  getDb()
    .prepare("UPDATE orders SET status = ? WHERE id = ?")
    .run(status, id);

  refresh();
}
