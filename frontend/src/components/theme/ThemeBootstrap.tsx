"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectAuthStatus } from "@/store/slices/authSlice";
import { clearCustomerTheme, fetchTheme } from "@/store/slices/themeSlice";

/**
 * Loads customer/default theme whenever auth settles.
 * On logout, clears customer theme then re-fetches the default.
 */
export default function ThemeBootstrap() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectAuthStatus);
  const prevStatus = useRef(status);

  useEffect(() => {
    if (status === "idle" || status === "loading") {
      prevStatus.current = status;
      return;
    }

    const loggedOut =
      prevStatus.current === "authenticated" && status === "anonymous";

    if (loggedOut) {
      dispatch(clearCustomerTheme());
    }
    dispatch(fetchTheme());
    prevStatus.current = status;
  }, [status, dispatch]);

  return null;
}
