"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  closeThemeDrawer,
  openThemeDrawer,
  patchDraft,
  saveTheme,
  selectTheme,
  selectThemeDraft,
  selectThemeDrawerOpen,
  selectThemeError,
  selectThemeHydrated,
  selectThemeLoading,
  selectThemeSaving,
  selectThemeSuccess,
  clearThemeMessage,
  fetchTheme,
  clearCustomerTheme,
  applyDraftLocally,
} from "@/store/slices/themeSlice";
import { selectIsAuthenticated } from "@/store/slices/authSlice";

export function useTheme() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);
  const draft = useAppSelector(selectThemeDraft);
  const drawerOpen = useAppSelector(selectThemeDrawerOpen);
  const isLoading = useAppSelector(selectThemeLoading);
  const hydrated = useAppSelector(selectThemeHydrated);
  const isSaving = useAppSelector(selectThemeSaving);
  const error = useAppSelector(selectThemeError);
  const successMessage = useAppSelector(selectThemeSuccess);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  return {
    theme,
    draft,
    drawerOpen,
    isLoading,
    hydrated,
    isSaving,
    error,
    successMessage,
    isAuthenticated,
    openDrawer: () => dispatch(openThemeDrawer()),
    closeDrawer: () => dispatch(closeThemeDrawer()),
    updateDraft: (patch: Parameters<typeof patchDraft>[0]) =>
      dispatch(patchDraft(patch)),
    save: () => dispatch(saveTheme()),
    applyLocally: () => dispatch(applyDraftLocally()),
    reload: () => dispatch(fetchTheme()),
    resetToDefaultLocal: () => dispatch(clearCustomerTheme()),
    clearMessage: () => dispatch(clearThemeMessage()),
  };
}
