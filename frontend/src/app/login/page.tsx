"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Container from "@/components/ui/Container";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearAuthError, login, selectAuthError, selectAuthStatus } from "@/store/slices/authSlice";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectAuthStatus);
  const error = useAppSelector(selectAuthError);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    dispatch(clearAuthError());
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      router.push("/");
    }
  };

  return (
    <>
      <Breadcrumb title="Login" items={[{ label: "Login" }]} />
      <Container className="pb-16">
        <div className="max-w-md mx-auto border border-bb-border rounded-xl p-8 bg-white">
          <h2 className="text-xl font-semibold text-center mb-6">Sign In</h2>
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <form className="space-y-4" onSubmit={onSubmit}>
            <input
              required
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-bb-border rounded-md px-3 py-2.5 text-sm outline-none focus:border-bb-primary"
            />
            <input
              required
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-bb-border rounded-md px-3 py-2.5 text-sm outline-none focus:border-bb-primary"
            />
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" />
                <span className="text-bb-muted">Remember me</span>
              </label>
              <Link href="#" className="text-bb-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <button type="submit" className="bb-btn bb-btn-1 w-full" disabled={status === "loading"}>
              {status === "loading" ? "Signing in..." : "Login"}
            </button>
          </form>
          <p className="text-sm text-center text-bb-muted mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-bb-primary font-medium hover:underline">
              Register
            </Link>
          </p>
        </div>
      </Container>
    </>
  );
}
