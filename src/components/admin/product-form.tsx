"use client";

import Image from "next/image";
import { useActionState, useRef, useState } from "react";
import { saveProduct, type ProductFormState } from "@/actions/admin";
import type { Product } from "@/lib/data";

export function ProductForm({
  product,
  categories,
}: {
  product?: Product;
  categories: string[];
}) {
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(
    saveProduct,
    null,
  );

  const [removed, setRemoved] = useState<string[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const existing = (product?.images ?? [])
    .map((url, index) => ({ url, key: product?.imageKeys[index] ?? null }))
    .filter((image) => !removed.includes(image.url));

  function handleFiles(files: FileList | null) {
    setNewPreviews((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      if (!files) return [];
      return Array.from(files).map((file) => URL.createObjectURL(file));
    });
  }

  function clearNewFiles() {
    setNewPreviews((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return [];
    });
    if (fileRef.current) fileRef.current.value = "";
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-sand bg-cream/50 px-4 py-3.5 outline-none transition focus:border-maroon focus:bg-ivory";

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div
          role="alert"
          className="rounded-xl border border-maroon/30 bg-maroon/8 px-5 py-4 text-sm text-maroon-deep"
        >
          {state.error}
        </div>
      )}

      {product && <input type="hidden" name="id" value={product.id} />}
      {existing.map((image) => (
        <input
          key={image.url}
          type="hidden"
          name="kept"
          value={JSON.stringify(image)}
        />
      ))}
      {removed.map((img) => (
        <input key={img} type="hidden" name="removed" value={img} />
      ))}

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* -------- Details -------- */}
        <div className="space-y-6 rounded-2xl border border-sand bg-ivory p-6 sm:p-8">
          <p className="label-caps text-maroon">Details</p>

          <label className="block">
            <span className="label-caps text-ash">Name *</span>
            <input
              name="name"
              required
              minLength={3}
              defaultValue={product?.name ?? ""}
              placeholder="Royal Meenakari Jhumka"
              className={inputClass}
            />
          </label>

          {product && (
            <p className="-mt-2 text-xs text-ash">
              URL stays: <span className="text-maroon">/product/{product.slug}</span>
            </p>
          )}

          <div className="grid gap-5 sm:grid-cols-3">
            <label className="block">
              <span className="label-caps text-ash">Price ₹ *</span>
              <input
                name="price"
                type="number"
                required
                min={1}
                max={1000000}
                defaultValue={product?.price ?? ""}
                placeholder="1499"
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="label-caps text-ash">Category *</span>
              <input
                name="category"
                list="avrani-categories"
                defaultValue={product?.category ?? "Jhumka"}
                placeholder="Jhumka"
                className={inputClass}
              />
              <datalist id="avrani-categories">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </label>

            <label className="block">
              <span className="label-caps text-ash">Stock *</span>
              <input
                name="stock"
                type="number"
                required
                min={0}
                max={100000}
                defaultValue={product?.stock ?? 10}
                className={inputClass}
              />
            </label>
          </div>

          <label className="block">
            <span className="label-caps text-ash">Description</span>
            <textarea
              name="description"
              rows={5}
              maxLength={2000}
              defaultValue={product?.description ?? ""}
              placeholder="Materials, feel, styling notes — the story of this pair…"
              className={inputClass}
            />
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={product?.featured ?? false}
              className="h-5 w-5 accent-[#6d1a2e]"
            />
            <span className="text-sm text-ink">
              Feature on the homepage edit
            </span>
          </label>
        </div>

        {/* -------- Images -------- */}
        <div className="rounded-2xl border border-sand bg-ivory p-6 sm:p-8">
          <p className="label-caps mb-4 text-maroon">Photos</p>

          {existing.length > 0 && (
            <div className="mb-5">
              <p className="mb-2 text-xs text-ash">Current</p>
              <div className="grid grid-cols-3 gap-3">
                {existing.map((image) => (
                  <div
                    key={image.url}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-sand bg-cream"
                  >
                    <Image
                      src={image.url}
                      alt=""
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setRemoved((prev) => [...prev, image.url])
                      }
                      className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-maroon/90 text-ivory opacity-0 transition group-hover:opacity-100"
                      aria-label="Remove photo"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {newPreviews.length > 0 && (
            <div className="mb-5">
              <p className="mb-2 text-xs text-ash">New (not saved yet)</p>
              <div className="grid grid-cols-3 gap-3">
                {newPreviews.map((url) => (
                  <div
                    key={url}
                    className="relative aspect-square overflow-hidden rounded-lg border border-gold/60 bg-cream"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={clearNewFiles}
                className="mt-2 text-xs text-maroon underline underline-offset-4"
              >
                Clear new photos
              </button>
            </div>
          )}

          <label className="block rounded-xl border border-dashed border-gold/70 bg-cream/40 px-4 py-6 text-center transition hover:border-maroon">
            <span className="label-caps text-maroon">+ Add photos</span>
            <span className="mt-1 block text-xs text-ash">
              JPG / PNG / WebP · up to 6MB each
            </span>
            <input
              ref={fileRef}
              type="file"
              name="newImages"
              accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>

          {existing.length === 0 && newPreviews.length === 0 && (
            <p className="mt-3 text-xs text-ash">
              No photos yet — the shop will show a ✦ placeholder until you add
              some.
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="label-caps rounded-full bg-maroon px-10 py-4 text-ivory shadow-[0_12px_30px_-14px_rgba(109,26,46,0.8)] transition hover:bg-maroon-deep disabled:opacity-60"
        >
          {pending ? "Saving…" : product ? "Save changes" : "Publish product"}
        </button>
        <p className="text-xs text-ash">
          Saved pieces appear on the site instantly.
        </p>
      </div>
    </form>
  );
}
