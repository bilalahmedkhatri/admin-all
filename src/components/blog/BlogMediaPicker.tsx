"use client";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import Image from "next/image";
import { FaFolderOpen, FaUpload, FaTimes } from "react-icons/fa";
import BlogMediaLibrary from "./BlogMediaLibrary";
import { compressImage } from "@/utils/compressImage";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { Loading } from "@/components/gateway/loading";
import {
  assetSchema,
  blogRequest,
  type BlogAsset,
} from "@/lib/gateway/blog-client";

export default function BlogMediaPicker({
  appKey,
  onInsert,
  onClose,
  imagesOnly = false,
  initialAsset,
}: {
  appKey: string;
  imagesOnly?: boolean;
  initialAsset?: BlogAsset;
  onInsert: (asset: BlogAsset) => void;
  onClose: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<"upload" | "library">("upload");
  const [preview, setPreview] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const token = useRef("");
  const preparedFile = useRef<File | null>(null);
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );
  async function upload() {
    if (!file || busy) return;
    if (
      imagesOnly &&
      !["image/png", "image/jpg", "image/jpeg", "image/webp"].includes(
        file.type,
      )
    ) {
      setError("Choose a PNG, JPEG or WebP image for the cover.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      // Reuse identical compressed bytes with the same upload token on retries.
      const uploadFile = preparedFile.current ?? (
        file.type.startsWith("image/") ? await compressImage(file) : file
      );
      if (uploadFile.type.startsWith("image/") && uploadFile.size > 10 * 1024 * 1024)
        throw new Error("Compressed image must be no larger than 10 MiB.");
      preparedFile.current = uploadFile;
      const mime =
        (
          { "image/jpg": "image/jpeg", "audio/mp3": "audio/mpeg", "audio/x-wav": "audio/wav" } as Record<
            string,
            string
          >
        )[uploadFile.type] || uploadFile.type;
      const response = await blogRequest(
        appKey,
        "assets",
        z.object({ asset: assetSchema }),
        {
          method: "POST",
          headers: { "Content-Type": mime, "Idempotency-Key": token.current },
          body: uploadFile,
        },
        { filename: uploadFile.name },
      );
      if (response.asset.media_type.startsWith("image/")) {
        setFile(null);
        setPreview("");
        setTab("library");
      } else {
        onInsert(response.asset);
        onClose();
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "The blog request could not be completed.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      isOpen
      onClose={() => {
        if (!busy) onClose();
      }}
      showCloseButton={false}
      className="mx-4 max-h-full max-w-3xl overflow-y-auto p-6 sm:p-8"
    >
      <div
        // Browser translators must not replace React-owned text during upload transitions.
        translate="no"
        className="notranslate"
        role="dialog"
        aria-modal="true"
        aria-labelledby="blog-media-title"
        aria-busy={busy}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2
            id="blog-media-title"
            className="text-lg font-semibold text-gray-800 dark:text-white"
          >
            {imagesOnly ? "Choose cover image" : "Media for your post"}
          </h2>
          <Button
            size="sm"
            variant="outline"
            aria-label={"Close media picker"}
            disabled={busy}
            onClick={onClose}
            className="cursor-pointer disabled:cursor-not-allowed"
          >
            <FaTimes aria-hidden="true" />
          </Button>
        </div>
        <div
          role="group"
          aria-label={"Media source"}
          className="mb-5 flex gap-2 border-b border-gray-200 pb-4 dark:border-gray-700"
        >
          <Button
            size="sm"
            variant={tab === "upload" ? "primary" : "outline"}
            aria-pressed={tab === "upload"}
            disabled={busy}
            onClick={() => setTab("upload")}
            className="cursor-pointer disabled:cursor-not-allowed"
          >
            {"Upload new"}
          </Button>
          <Button
            size="sm"
            variant={tab === "library" ? "primary" : "outline"}
            aria-pressed={tab === "library"}
            disabled={busy}
            onClick={() => setTab("library")}
            className="cursor-pointer disabled:cursor-not-allowed"
          >
            {"My images"}
          </Button>
        </div>
        {tab === "library" ? (
          <BlogMediaLibrary
            selectLabel={imagesOnly ? "Use as cover" : undefined}
            initialAsset={initialAsset}
            appKey={appKey}
            onInsert={(asset) => {
              onInsert(asset);
              onClose();
            }}
          />
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              {imagesOnly
                ? "Images up to 10 MiB. Supported: PNG, JPEG and WebP."
                : "Images: 10 MiB. Audio: 25 MiB. Video: 64 MiB. Supported: PNG, JPEG, WebP, MP3, WAV, Ogg, MP4 and WebM."}
            </p>
            <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/50">
              <input
                ref={input}
                aria-label={"Choose a file"}
                type="file"
                disabled={busy}
                accept={
                  imagesOnly
                    ? "image/png,image/jpeg,image/webp"
                    : "image/png,image/jpeg,image/webp,video/mp4,video/webm,audio/mpeg,audio/wav,audio/ogg"
                }
                className="sr-only"
                onChange={(event) => {
                  const chosen = event.target.files?.[0] || null;
                  setFile(chosen);
                  preparedFile.current = null;
                  token.current = crypto.randomUUID();
                  setPreview(chosen ? URL.createObjectURL(chosen) : "");
                  setError("");
                }}
              />
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => input.current?.click()}
                className="cursor-pointer disabled:cursor-not-allowed"
                startIcon={<FaFolderOpen aria-hidden="true" />}
              >
                {file ? "Change file" : "Choose a file"}
              </Button>
              <p className="mt-3 text-sm break-all text-gray-700 dark:text-gray-200">
                {file
                  ? file.name
                  : "No file selected. Choose a file before uploading."}
              </p>
              {file && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MiB
                </p>
              )}
              {file &&
                preview &&
                (file.type.startsWith("image/") ? (
                  <Image
                    unoptimized
                    src={preview}
                    alt={file.name}
                    width={400}
                    height={220}
                    className="mt-4 max-h-48 w-full rounded-lg object-contain"
                  />
                ) : file.type.startsWith("video/") ? (
                  <video
                    src={preview}
                    controls
                    preload="metadata"
                    className="mt-4 max-h-48 w-full rounded-lg"
                  />
                ) : file.type.startsWith("audio/") ? (
                  <audio
                    src={preview}
                    controls
                    preload="metadata"
                    className="mt-4 w-full"
                  />
                ) : null)}
            </div>
            {error && (
              <p
                role="alert"
                className="mt-4 text-sm text-error-600 dark:text-error-400"
              >
                {error}
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                disabled={busy || !file}
                onClick={upload}
                className="cursor-pointer disabled:cursor-not-allowed [&_.animate-spin]:border-white/40 [&_.animate-spin]:border-t-white [&>span]:text-white"
                startIcon={busy ? undefined : <FaUpload aria-hidden="true" />}
              >
                {busy ? (
                  <Loading label="Processing & uploading..." />
                ) : (
                  <span>Upload</span>
                )}
              </Button>
              <Button
                variant="outline"
                disabled={busy}
                onClick={onClose}
                className="cursor-pointer disabled:cursor-not-allowed"
              >
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
