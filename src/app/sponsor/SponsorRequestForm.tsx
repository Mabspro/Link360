"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { sponsorRequestSchema, type SponsorRequestBody } from "@/lib/validations";

export function SponsorRequestForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SponsorRequestBody>({
    resolver: zodResolver(sponsorRequestSchema) as Resolver<SponsorRequestBody>,
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      message: "",
    },
  });

  async function onSubmit(data: SponsorRequestBody) {
    setError("root", { message: "" });
    const res = await fetch("/api/sponsor-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        company: data.company || null,
        message: data.message || null,
      }),
    });

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      const msg = j.error ?? "Failed to submit request";
      setError("root", { message: msg });
      toast.error(msg);
      return;
    }
    setSubmitted(true);
    toast.success("Request received. We’ll be in touch soon.");
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="font-medium text-emerald-800">Thank you!</p>
        <p className="mt-1 text-sm text-emerald-700">
          We’ve received your request and will get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-label="Sponsor request form">
      {errors.root?.message && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {errors.root.message}
        </div>
      )}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Name *</label>
        <input
          type="text"
          {...register("name")}
          className="input"
          autoComplete="name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Email *</label>
        <input
          type="email"
          {...register("email")}
          className="input"
          autoComplete="email"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Company</label>
        <input
          type="text"
          {...register("company")}
          className="input"
          autoComplete="organization"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Phone</label>
        <input
          type="tel"
          {...register("phone")}
          className="input"
          autoComplete="tel"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Message</label>
        <textarea
          {...register("message")}
          className="input min-h-[120px]"
          rows={4}
          placeholder="How would you like to sponsor? Container size, destination, timeline..."
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {isSubmitting ? "Sending…" : "Submit request"}
      </button>
    </form>
  );
}
