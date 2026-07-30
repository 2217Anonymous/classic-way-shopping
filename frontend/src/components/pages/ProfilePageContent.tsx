"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Container from "@/components/ui/Container";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectAuthCustomer,
  selectIsAuthenticated,
  setCustomer,
} from "@/store/slices/authSlice";
import { changePassword, updateProfile } from "@/services/customers";
import { ApiError } from "@/lib/api";

export default function ProfilePageContent() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const authStatus = useAppSelector((state) => state.auth.status);
  const customer = useAppSelector(selectAuthCustomer);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    if (authStatus === "idle" || authStatus === "loading") return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
  }, [authStatus, isAuthenticated, router]);

  useEffect(() => {
    if (!customer) return;
    setFullName(customer.full_name ?? "");
    setPhone(customer.phone ?? "");
  }, [customer]);

  const onSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    setProfileError(null);
    setProfileSaving(true);
    try {
      const updated = await updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
      });
      dispatch(setCustomer(updated));
      setProfileMessage("Profile updated successfully.");
    } catch (err) {
      setProfileError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Unable to update profile"
      );
    } finally {
      setProfileSaving(false);
    }
  };

  const onChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    setPasswordSaving(true);
    try {
      const result = await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPasswordMessage(result.message || "Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Unable to change password"
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  if (authStatus === "idle" || authStatus === "loading" || !isAuthenticated || !customer) {
    return (
      <>
        <Breadcrumb title="My Profile" items={[{ label: "My Profile" }]} />
        <Container className="pb-16">
          <p className="text-center text-bb-muted py-16">Loading...</p>
        </Container>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title="My Profile" items={[{ label: "My Profile" }]} />
      <Container className="pb-16">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-bb-text">My Profile</h1>
            <p className="text-sm text-bb-muted mt-1">
              Manage your account details and password.
            </p>
          </div>
          <Link href="/orders" className="text-sm text-bb-primary hover:underline">
            View my orders
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <form
            onSubmit={onSaveProfile}
            className="border border-bb-border rounded-xl bg-white p-6 space-y-4"
          >
            <h2 className="text-lg font-semibold text-bb-text">Account details</h2>
            {profileMessage && (
              <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                {profileMessage}
              </div>
            )}
            {profileError && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {profileError}
              </div>
            )}
            <div>
              <label className="block text-sm text-bb-muted mb-1">Email</label>
              <input
                value={customer.email}
                disabled
                className="w-full border border-bb-border rounded-md px-3 py-2.5 text-sm bg-bb-soft text-bb-muted"
              />
            </div>
            <div>
              <label className="block text-sm text-bb-muted mb-1">Full name</label>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-bb-border rounded-md px-3 py-2.5 text-sm outline-none focus:border-bb-primary"
              />
            </div>
            <div>
              <label className="block text-sm text-bb-muted mb-1">Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Optional"
                className="w-full border border-bb-border rounded-md px-3 py-2.5 text-sm outline-none focus:border-bb-primary"
              />
            </div>
            <button type="submit" className="bb-btn bb-btn-1" disabled={profileSaving}>
              {profileSaving ? "Saving..." : "Save profile"}
            </button>
          </form>

          <form
            onSubmit={onChangePassword}
            className="border border-bb-border rounded-xl bg-white p-6 space-y-4"
          >
            <h2 className="text-lg font-semibold text-bb-text">Change password</h2>
            {passwordMessage && (
              <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                {passwordMessage}
              </div>
            )}
            {passwordError && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {passwordError}
              </div>
            )}
            <input
              required
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-bb-border rounded-md px-3 py-2.5 text-sm outline-none focus:border-bb-primary"
            />
            <input
              required
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-bb-border rounded-md px-3 py-2.5 text-sm outline-none focus:border-bb-primary"
            />
            <input
              required
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-bb-border rounded-md px-3 py-2.5 text-sm outline-none focus:border-bb-primary"
            />
            <button type="submit" className="bb-btn bb-btn-1" disabled={passwordSaving}>
              {passwordSaving ? "Updating..." : "Update password"}
            </button>
          </form>
        </div>
      </Container>
    </>
  );
}
