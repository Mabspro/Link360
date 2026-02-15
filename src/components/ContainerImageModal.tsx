"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ContainerImageModalProps {
  imageUrl: string | null;
  poolTitle: string;
}

/** Thumbnail that opens a modal when clicked. Shows placeholder if no image.
 *  Modal is portaled to document.body so it escapes parent <Link> click handling. */
export function ContainerImageThumbnail({ imageUrl, poolTitle }: ContainerImageModalProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const modal = (
    <AnimatePresence>
      {open && imageUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false); }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false); }}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={imageUrl}
              alt={`Container for ${poolTitle}`}
              className="w-full rounded-2xl"
            />
            <div className="p-4 text-center">
              <p className="text-sm text-gray-600">{poolTitle}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => imageUrl && setOpen(true)}
        className={`aspect-square rounded-xl border border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-2 transition-all ${
          imageUrl
            ? "hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
            : "cursor-default"
        }`}
        aria-label={imageUrl ? "View container image" : "No container image yet"}
        disabled={!imageUrl}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Container for ${poolTitle}`}
            className="w-full h-full object-cover rounded-xl"
          />
        ) : (
          <>
            <Camera className="w-6 h-6 text-gray-300" />
            <span className="text-xs text-gray-400 text-center px-2">
              Container image will appear once staged
            </span>
          </>
        )}
      </button>
      {/* Portal modal to body so it escapes parent <Link> */}
      {mounted && createPortal(modal, document.body)}
    </>
  );
}

/** Standalone block for pool detail page header area */
export function ContainerImageBlock({ imageUrl, poolTitle }: ContainerImageModalProps) {
  const [open, setOpen] = useState(false);

  if (!imageUrl) {
    return (
      <div className="card p-6 flex items-center gap-4 bg-gray-50/50">
        <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
          <Camera className="w-6 h-6 text-gray-300" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Container image</p>
          <p className="text-xs text-gray-400">Will appear once the container is staged or being loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="card overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
      >
        <img
          src={imageUrl}
          alt={`Container for ${poolTitle}`}
          className="w-full h-48 object-cover group-hover:scale-[1.02] transition-transform duration-300"
        />
        <p className="p-3 text-xs text-gray-500 text-center">Click to enlarge</p>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
              <img
                src={imageUrl}
                alt={`Container for ${poolTitle}`}
                className="w-full rounded-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
