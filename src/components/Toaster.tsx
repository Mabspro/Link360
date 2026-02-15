"use client";

import { Toaster as HotToaster } from "react-hot-toast";

export function Toaster() {
  return (
    <HotToaster
      position="top-center"
      toastOptions={{
        duration: 5000,
        style: { background: "#1f2937", color: "#f9fafb" },
        error: { style: { background: "#991b1b", color: "#fef2f2" } },
        success: { style: { background: "#065f46", color: "#ecfdf5" } },
      }}
    />
  );
}
