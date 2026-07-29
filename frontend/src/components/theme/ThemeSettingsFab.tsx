"use client";

import { useTheme } from "@/hooks/useTheme";

export default function ThemeSettingsFab() {
  const { openDrawer } = useTheme();

  return (
    <button
      type="button"
      onClick={openDrawer}
      className="fixed bottom-6 right-6 z-[60] flex h-12 w-12 items-center justify-center rounded-full bg-bb-primary text-white shadow-lg transition hover:bg-bb-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-bb-primary focus-visible:ring-offset-2 md:bottom-8 md:right-8"
      aria-label="Open theme settings"
    >
      <i className="ri-settings-3-line text-2xl" aria-hidden />
    </button>
  );
}
