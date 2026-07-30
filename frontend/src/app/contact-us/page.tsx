"use client";

import { FormEvent, useState } from "react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Container from "@/components/ui/Container";
import { submitFeedback } from "@/services/feedback";

export default function ContactUsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      await submitFeedback({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim() || "Contact form",
        message: message.trim(),
      });
      setStatus("success");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not send message");
    }
  };

  return (
    <>
      <Breadcrumb title="Contact Us" items={[{ label: "Contact Us" }]} />
      <Container className="pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-bb-text">Get In Touch</h3>
            <p className="text-bb-muted">
              Have a question about your order or our products? We are here to help. Fill out the
              form or reach us using the details below.
            </p>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <i className="ri-map-pin-line text-bb-primary text-lg mt-0.5" />
                <span className="text-bb-muted">Classic Way, India</span>
              </li>
              <li className="flex items-center gap-3">
                <i className="ri-phone-line text-bb-primary text-lg" />
                <span className="text-bb-muted">+91 00000 00000</span>
              </li>
              <li className="flex items-center gap-3">
                <i className="ri-mail-line text-bb-primary text-lg" />
                <span className="text-bb-muted">support@valaiyagam.com</span>
              </li>
            </ul>
          </div>
          <form
            onSubmit={onSubmit}
            className="border border-bb-border rounded-xl p-6 bg-white space-y-4"
          >
            {status === "success" && (
              <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                Message sent. We will get back to you soon.
              </p>
            )}
            {error && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </p>
            )}
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className="w-full border border-bb-border rounded-md px-3 py-2 text-sm outline-none focus:border-bb-primary"
            />
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your Email"
              className="w-full border border-bb-border rounded-md px-3 py-2 text-sm outline-none focus:border-bb-primary"
            />
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="w-full border border-bb-border rounded-md px-3 py-2 text-sm outline-none focus:border-bb-primary"
            />
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your Message"
              className="w-full border border-bb-border rounded-md px-3 py-2 text-sm outline-none focus:border-bb-primary resize-none"
            />
            <button type="submit" className="bb-btn bb-btn-1 w-full" disabled={status === "loading"}>
              {status === "loading" ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </Container>
    </>
  );
}
