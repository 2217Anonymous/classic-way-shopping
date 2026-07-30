import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as themeApi from "@/services/theme";
import {
  DEFAULT_THEME,
  SHOP_LAYOUTS_BY_CATEGORY,
  type ShopCategory,
  type ThemeConfig,
} from "@/lib/themeOptions";
import type { RootState } from "../index";

interface ThemeState {
  theme: ThemeConfig;
  draft: ThemeConfig;
  isLoading: boolean;
  isSaving: boolean;
  hydrated: boolean;
  drawerOpen: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: ThemeState = {
  theme: { ...DEFAULT_THEME, page_visibility: { ...DEFAULT_THEME.page_visibility } },
  draft: { ...DEFAULT_THEME, page_visibility: { ...DEFAULT_THEME.page_visibility } },
  isLoading: false,
  isSaving: false,
  hydrated: false,
  drawerOpen: false,
  error: null,
  successMessage: null,
};

function cloneTheme(theme: ThemeConfig): ThemeConfig {
  return {
    ...theme,
    page_visibility: { ...theme.page_visibility },
  };
}

export const fetchTheme = createAsyncThunk(
  "theme/fetch",
  async (_, { rejectWithValue }) => {
    try {
      return await themeApi.fetchTheme();
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to load theme"
      );
    }
  }
);

export const saveTheme = createAsyncThunk(
  "theme/save",
  async (_, { getState, rejectWithValue }) => {
    const draft = (getState() as RootState).theme.draft;
    try {
      return await themeApi.updateTheme({
        home_theme: draft.home_theme,
        shop_category: draft.shop_category,
        shop_layout: draft.shop_layout,
        product_layout: draft.product_layout,
        blog_layout: draft.blog_layout,
        page_visibility: draft.page_visibility,
        theme_config: draft.theme_config ?? null,
      });
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to save theme"
      );
    }
  }
);

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    openThemeDrawer(state) {
      state.drawerOpen = true;
      state.draft = cloneTheme(state.theme);
      state.error = null;
      state.successMessage = null;
    },
    closeThemeDrawer(state) {
      state.drawerOpen = false;
      state.draft = cloneTheme(state.theme);
      state.error = null;
    },
    patchDraft(state, action: PayloadAction<Partial<ThemeConfig>>) {
      const next = { ...state.draft, ...action.payload };
      if (action.payload.shop_category) {
        const category = action.payload.shop_category as ShopCategory;
        const options = SHOP_LAYOUTS_BY_CATEGORY[category] ?? [];
        const valid = options.some((o) => o.value === next.shop_layout);
        if (!valid && options[0]) {
          next.shop_layout = options[0].value;
        }
      }
      if (action.payload.page_visibility) {
        next.page_visibility = {
          ...state.draft.page_visibility,
          ...action.payload.page_visibility,
        };
      }
      state.draft = next;
      state.successMessage = null;
    },
    clearCustomerTheme(state) {
      state.theme = cloneTheme(DEFAULT_THEME);
      state.draft = cloneTheme(DEFAULT_THEME);
      state.error = null;
      state.successMessage = null;
    },
    applyDraftLocally(state) {
      state.theme = cloneTheme(state.draft);
      state.successMessage = "Theme settings applied.";
      state.error = null;
    },
    clearThemeMessage(state) {
      state.successMessage = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTheme.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTheme.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hydrated = true;
        const next = cloneTheme({
          ...DEFAULT_THEME,
          ...action.payload,
          page_visibility: {
            ...DEFAULT_THEME.page_visibility,
            ...(action.payload.page_visibility ?? {}),
          },
          home_theme: (action.payload.home_theme as ThemeConfig["home_theme"]) || "fashion",
          shop_category:
            (action.payload.shop_category as ThemeConfig["shop_category"]) ||
            "classic",
        });
        state.theme = next;
        state.draft = cloneTheme(next);
      })
      .addCase(fetchTheme.rejected, (state, action) => {
        state.isLoading = false;
        state.hydrated = true;
        // Keep fallback default theme on API failure
        state.theme = cloneTheme(DEFAULT_THEME);
        state.draft = cloneTheme(DEFAULT_THEME);
        state.error =
          typeof action.payload === "string" ? action.payload : "Failed to load theme";
      })
      .addCase(saveTheme.pending, (state) => {
        state.isSaving = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(saveTheme.fulfilled, (state, action) => {
        state.isSaving = false;
        const next = cloneTheme({
          ...DEFAULT_THEME,
          ...action.payload,
          page_visibility: {
            ...DEFAULT_THEME.page_visibility,
            ...(action.payload.page_visibility ?? {}),
          },
          home_theme: (action.payload.home_theme as ThemeConfig["home_theme"]) || "fashion",
          shop_category:
            (action.payload.shop_category as ThemeConfig["shop_category"]) ||
            "classic",
        });
        state.theme = next;
        state.draft = cloneTheme(next);
        state.successMessage = "Theme settings saved successfully.";
      })
      .addCase(saveTheme.rejected, (state, action) => {
        state.isSaving = false;
        state.error =
          typeof action.payload === "string" ? action.payload : "Failed to save theme";
      });
  },
});

export const {
  openThemeDrawer,
  closeThemeDrawer,
  patchDraft,
  clearCustomerTheme,
  applyDraftLocally,
  clearThemeMessage,
} = themeSlice.actions;

export const selectTheme = (state: RootState) => state.theme.theme;
export const selectThemeDraft = (state: RootState) => state.theme.draft;
export const selectThemeDrawerOpen = (state: RootState) => state.theme.drawerOpen;
export const selectThemeLoading = (state: RootState) => state.theme.isLoading;
export const selectThemeHydrated = (state: RootState) => state.theme.hydrated;
export const selectThemeSaving = (state: RootState) => state.theme.isSaving;
export const selectThemeError = (state: RootState) => state.theme.error;
export const selectThemeSuccess = (state: RootState) => state.theme.successMessage;

export default themeSlice.reducer;
