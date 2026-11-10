"use client";

import Image from "next/image";
import { useActionState } from "react";
import {
  saveAppearance,
  type AppearanceFormState,
} from "@/actions/admin";
import {
  DEFAULT_SITE_APPEARANCE,
  type SiteAppearance,
} from "@/lib/appearance-defaults";

const IMAGE_FIELDS = [
  {
    name: "heroImage",
    label: "Homepage hero photo",
    description: "The main jewellery photo beside the homepage headline.",
    removeName: "removeHeroImage",
  },
  {
    name: "homeBackgroundImage",
    label: "Homepage hero background",
    description: "A background image behind the homepage headline section.",
    removeName: "removeHomeBackgroundImage",
  },
  {
    name: "siteBackgroundImage",
    label: "All-page background image",
    description: "A subtle background image behind the storefront pages.",
    removeName: "removeSiteBackgroundImage",
  },
] as const;

export function AppearanceForm({
  appearance,
}: {
  appearance: SiteAppearance;
}) {
  const [state, formAction, pending] = useActionState<
    AppearanceFormState,
    FormData
  >(saveAppearance, null);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <p
          role="alert"
          className="rounded-xl border border-maroon/30 bg-maroon/8 px-5 py-4 text-sm text-maroon-deep"
        >
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p
          role="status"
          className="rounded-xl border border-green-800/20 bg-green-50 px-5 py-4 text-sm text-green-900"
        >
          Website appearance saved.
        </p>
      )}

      <div className="rounded-2xl border border-sand bg-ivory p-6 sm:p-8">
        <h2 className="font-display text-2xl font-semibold text-maroon-deep">
          Website images
        </h2>
        <p className="mt-1 text-sm text-ash">
          Upload JPG, PNG, WebP or AVIF images up to 6 MB each.
        </p>

        <div className="mt-6 space-y-6">
          {IMAGE_FIELDS.map((field) => {
            const currentImage = appearance[field.name];
            const canRemove =
              field.name !== "heroImage" ||
              currentImage !== DEFAULT_SITE_APPEARANCE.heroImage;
            return (
              <div
                key={field.name}
                className="grid gap-4 border-t border-sand pt-6 sm:grid-cols-[112px_1fr]"
              >
                <div className="relative h-28 w-28 overflow-hidden rounded-xl border border-sand bg-cream">
                  {currentImage ? (
                    <Image
                      src={currentImage}
                      alt={field.label}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="grid h-full place-items-center text-xs text-ash">
                      No image
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <label className="block">
                    <span className="font-medium text-maroon-deep">
                      {field.label}
                    </span>
                    <span className="mt-1 block text-sm text-ash">
                      {field.description}
                    </span>
                    <input
                      type="file"
                      name={field.name}
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      className="mt-3 block w-full text-sm text-ash file:mr-4 file:rounded-full file:border-0 file:bg-cream file:px-4 file:py-2 file:font-medium file:text-maroon hover:file:bg-sand"
                    />
                  </label>
                  {currentImage && canRemove && (
                    <label className="mt-3 flex items-center gap-2 text-sm text-ash">
                      <input
                        type="checkbox"
                        name={field.removeName}
                        className="accent-maroon"
                      />
                      Remove this image
                    </label>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-sand bg-ivory p-6 sm:p-8">
        <h2 className="font-display text-2xl font-semibold text-maroon-deep">
          Storefront background color
        </h2>
        <p className="mt-1 text-sm text-ash">
          Choose the base color shown behind storefront sections.
        </p>
        <label className="mt-5 flex items-center gap-4">
          <input
            type="color"
            name="siteBackgroundColor"
            defaultValue={appearance.siteBackgroundColor}
            className="h-12 w-16 cursor-pointer rounded-lg border border-sand bg-ivory p-1"
          />
          <span className="text-sm text-ash">
            {appearance.siteBackgroundColor}
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="label-caps w-full rounded-full bg-maroon px-8 py-4 text-ivory transition hover:bg-maroon-deep disabled:cursor-wait disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Saving appearance…" : "Save appearance"}
      </button>
    </form>
  );
}
