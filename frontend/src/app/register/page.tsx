"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Container from "@/components/ui/Container";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearAuthError,
  register,
  selectAuthError,
  selectAuthStatus,
} from "@/store/slices/authSlice";

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectAuthStatus);
  const error = useAppSelector(selectAuthError);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    dispatch(clearAuthError());
    if (password !== confirm) {
      setLocalError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setLocalError("Password must be at least 8 characters");
      return;
    }
    const result = await dispatch(
      register({ email, password, full_name: fullName })
    );
    if (register.fulfilled.match(result)) {
      router.push("/");
    }
  };

  return (
    <>
      <Breadcrumb title="Register" items={[{ label: "Register" }]} />
      <Container className="pb-16">
        <div className="max-w-md mx-auto border border-bb-border rounded-xl p-8 bg-white">
          <h2 className="text-xl font-semibold text-center mb-6">Create Account</h2>
          {(localError || error) && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {localError || error}
            </div>
          )}
          <form className="space-y-4" onSubmit={onSubmit}>
            <input
              required
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-bb-border rounded-md px-3 py-2.5 text-sm outline-none focus:border-bb-primary"
            />
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
            <input
              required
              type="password"
              placeholder="Confirm Password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full border border-bb-border rounded-md px-3 py-2.5 text-sm outline-none focus:border-bb-primary"
            />
            <label className="flex items-start gap-2 text-sm text-bb-muted cursor-pointer">
              <input type="checkbox" required className="mt-1" />
              <span>
                I agree to the{" "}
                <Link href="/terms" className="text-bb-primary hover:underline">
                  Terms & Conditions
                </Link>
              </span>
            </label>
            <button type="submit" className="bb-btn bb-btn-1 w-full" disabled={status === "loading"}>
              {status === "loading" ? "Creating account..." : "Register"}
            </button>
          </form>
          <p className="text-sm text-center text-bb-muted mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-bb-primary font-medium hover:underline">
              Login
            </Link>
          </p>
        </div>
      </Container>
    </>
  );
}
