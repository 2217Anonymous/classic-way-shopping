"use client";

import Image from "next/image";
import { FormEvent, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setNewsletterOpen } from "@/store/slices/uiSlice";

export default function NewsletterModal() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.ui.newsletterOpen);

  const close = () => dispatch(setNewsletterOpen(false));

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    close();
  };

  return (
    <>
      <div
        className={`bb-popnews-bg${open ? " active" : ""}`}
        onClick={close}
        aria-hidden={!open}
      />
      <div
        className={`bb-popnews-box${open ? " active" : ""}`}
        role="dialog"
        aria-modal={open}
        aria-labelledby="newsletter-title"
        aria-hidden={!open}
      >
        <button
          type="button"
          className="bb-popnews-close"
          title="Close"
          aria-label="Close"
          onClick={close}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-stretch">
          <div className="bb-popnews-image hidden md:block">
            <Image
              src="/newsletter.jpg"
              alt="newsletter"
              width={600}
              height={500}
              className="w-full h-full object-cover rounded-[15px]"
            />
          </div>
          <div className="bb-popnews-box-content">
            <h2 id="newsletter-title">Newsletter.</h2>
            <p>Subscribe to Classic Way for new arrivals, offers, and store updates.</p>
            <form className="bb-popnews-form" onSubmit={handleSubmit}>
              <input type="email" name="newsemail" placeholder="Email Address" required />
              <button type="submit" className="bb-btn-2" name="subscribe">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
