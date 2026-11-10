"use client";

export function DeleteProductButton({
  id,
  name,
  action,
}: {
  id: number;
  name: string;
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (
          !window.confirm(
            `Delete "${name}"? This removes it from the shop permanently.`,
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="label-caps rounded-full border border-sand px-5 py-2.5 text-ash transition hover:border-maroon hover:text-maroon"
      >
        Delete
      </button>
    </form>
  );
}
