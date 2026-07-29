"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/hooks/useTheme";
import {
  BLOG_LAYOUT_OPTIONS,
  HOME_THEMES,
  PAGE_VISIBILITY_OPTIONS,
  PRODUCT_LAYOUT_OPTIONS,
  SHOP_CATEGORIES,
  SHOP_LAYOUTS_BY_CATEGORY,
  type ShopCategory,
} from "@/lib/themeOptions";
import { resolveHomePath, resolveShopPath } from "@/lib/themeResolver";
import { cn } from "@/lib/utils";

function RadioGroup({
  legend,
  name,
  value,
  options,
  onChange,
}: {
  legend: string;
  name: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold text-bb-text">{legend}</legend>
      <div className="space-y-1.5">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition",
              value === opt.value
                ? "border-bb-primary bg-bb-primary/5 text-bb-primary"
                : "border-bb-border text-bb-muted hover:border-bb-primary/40"
            )}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="accent-bb-primary"
            />
            {opt.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function ThemeSettingsDrawer() {
  const router = useRouter();
  const {
    isAuthenticated,
    drawerOpen,
    draft,
    isSaving,
    error,
    successMessage,
    closeDrawer,
    updateDraft,
    save,
    applyLocally,
    clearMessage,
  } = useTheme();

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, closeDrawer]);

  if (!drawerOpen) return null;

  const shopLayouts =
    SHOP_LAYOUTS_BY_CATEGORY[draft.shop_category as ShopCategory] ?? [];

  const handleSave = () => {
    void (async () => {
      try {
        if (isAuthenticated) {
          const action = await save();
          if (action.meta.requestStatus !== "fulfilled") return;
          const theme = action.payload as typeof draft;
          closeDrawer();
          router.push(resolveHomePath(theme));
          return;
        }
        applyLocally();
        closeDrawer();
        router.push(resolveHomePath(draft));
      } catch {
        /* slice handles error */
      }
    })();
  };

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close theme settings"
        onClick={closeDrawer}
      />
      <aside
        className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="theme-settings-title"
      >
        <div className="flex items-center justify-between border-b border-bb-border px-5 py-4">
          <h2 id="theme-settings-title" className="text-lg font-semibold text-bb-text">
            Theme Settings
          </h2>
          <button
            type="button"
            onClick={closeDrawer}
            className="rounded-md p-1 text-bb-muted hover:bg-bb-soft hover:text-bb-text"
            aria-label="Close"
          >
            <i className="ri-close-line text-xl" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <RadioGroup
            legend="Home Theme"
            name="home_theme"
            value={draft.home_theme}
            options={HOME_THEMES}
            onChange={(home_theme) =>
              updateDraft({ home_theme: home_theme as typeof draft.home_theme })
            }
          />

          <RadioGroup
            legend="Shop Layout"
            name="shop_category"
            value={draft.shop_category}
            options={SHOP_CATEGORIES}
            onChange={(shop_category) =>
              updateDraft({
                shop_category: shop_category as ShopCategory,
              })
            }
          />

          <RadioGroup
            legend="Shop Variant"
            name="shop_layout"
            value={draft.shop_layout}
            options={shopLayouts}
            onChange={(shop_layout) => updateDraft({ shop_layout })}
          />

          <RadioGroup
            legend="Product Layout"
            name="product_layout"
            value={draft.product_layout}
            options={PRODUCT_LAYOUT_OPTIONS}
            onChange={(product_layout) => updateDraft({ product_layout })}
          />

          <RadioGroup
            legend="Blog Layout"
            name="blog_layout"
            value={draft.blog_layout}
            options={BLOG_LAYOUT_OPTIONS}
            onChange={(blog_layout) => updateDraft({ blog_layout })}
          />

          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold text-bb-text">
              Page Visibility
            </legend>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {PAGE_VISIBILITY_OPTIONS.map((page) => (
                <label
                  key={page.key}
                  className="flex items-center gap-2 rounded-lg border border-bb-border px-3 py-2 text-sm text-bb-muted"
                >
                  <input
                    type="checkbox"
                    checked={draft.page_visibility[page.key] !== false}
                    onChange={(e) =>
                      updateDraft({
                        page_visibility: {
                          ...draft.page_visibility,
                          [page.key]: e.target.checked,
                        },
                      })
                    }
                    className="accent-bb-primary"
                  />
                  {page.label}
                </label>
              ))}
            </div>
          </fieldset>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
          {successMessage && (
            <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
              {successMessage}
            </p>
          )}
        </div>

        <div className="border-t border-bb-border px-5 py-4">
          <button
            type="button"
            disabled={isSaving}
            onClick={() => {
              clearMessage();
              handleSave();
            }}
            className="w-full rounded-lg bg-bb-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-bb-primary/90 disabled:opacity-60"
          >
            {isSaving ? "Saving..." : isAuthenticated ? "Save Theme Settings" : "Apply Theme Settings"}
          </button>
          <p className="mt-2 text-center text-xs text-bb-muted">
            {isAuthenticated
              ? `Shop link uses ${resolveShopPath(draft)}`
              : "Sign in to persist theme across sessions."}
          </p>
        </div>
      </aside>
    </div>
  );
}
