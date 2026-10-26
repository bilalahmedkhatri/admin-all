"use client";

import React, { useState, useRef } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import {
  ImageIcon,
  VideoIcon,
  FileIcon,
  UploadIcon,
  CloseLineIcon,
} from "@/icons";

export type MediaModalType = "image" | "video" | "file";

interface MediaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: MediaModalType;
  onInsertImage: (data: { src: string; alt?: string; caption?: string }) => void;
  onInsertVideo: (data: { src: string; caption?: string }) => void;
  onInsertFile: (data: {
    src: string;
    fileName: string;
    fileSize?: string;
    fileType?: string;
  }) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function MediaUploadModal({
  isOpen,
  onClose,
  type,
  onInsertImage,
  onInsertVideo,
  onInsertFile,
}: MediaUploadModalProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "url">("upload");
  const [urlInput, setUrlInput] = useState("");
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [fileData, setFileData] = useState<{
    dataUrl: string;
    name: string;
    size: string;
    extension: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setUrlInput("");
    setAltText("");
    setCaption("");
    setFileData(null);
    setErrorMessage("");
    setActiveTab("upload");
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage("");
    // 6MB warning for localStorage budget
    if (file.size > 6 * 1024 * 1024) {
      setErrorMessage("File is larger than 6MB. For large media, consider pasting an external URL.");
    }

    const extension = file.name.split(".").pop()?.toUpperCase() || "FILE";
    const formattedSize = formatFileSize(file.size);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFileData({
        dataUrl: result,
        name: file.name,
        size: formattedSize,
        extension,
      });
      if (!altText) {
        setAltText(file.name.replace(/\.[^/.]+$/, ""));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleInsert = () => {
    if (type === "image") {
      const src = activeTab === "upload" ? fileData?.dataUrl : urlInput.trim();
      if (!src) {
        setErrorMessage("Please select an image file or enter an image URL.");
        return;
      }
      onInsertImage({
        src,
        alt: altText.trim(),
        caption: caption.trim(),
      });
    } else if (type === "video") {
      const src = activeTab === "upload" ? fileData?.dataUrl : urlInput.trim();
      if (!src) {
        setErrorMessage("Please select a video file or enter a YouTube/video URL.");
        return;
      }
      onInsertVideo({
        src,
        caption: caption.trim(),
      });
    } else if (type === "file") {
      const src = activeTab === "upload" ? fileData?.dataUrl : urlInput.trim();
      if (!src) {
        setErrorMessage("Please select a file to attach.");
        return;
      }
      onInsertFile({
        src,
        fileName: fileData?.name || altText || "Document Attachment",
        fileSize: fileData?.size || "",
        fileType: fileData?.extension || "FILE",
      });
    }

    handleClose();
  };

  const titles = {
    image: "Insert Image",
    video: "Insert Video",
    file: "Attach Downloadable File",
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} showCloseButton={false} className="max-w-xl p-0">
      <div className="overflow-hidden rounded-2xl bg-white dark:bg-gray-900">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4.5 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-brand-50 text-brand-500 dark:bg-brand-500/10">
              {type === "image" && <ImageIcon className="size-5" />}
              {type === "video" && <VideoIcon className="size-5" />}
              {type === "file" && <FileIcon className="size-5" />}
            </span>
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
              {titles[type]}
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            <CloseLineIcon className="size-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-4 px-6 py-5">
          {/* Tabs for Upload vs URL (Image & Video) */}
          {type !== "file" && (
            <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className={`flex-1 rounded-md py-1.5 text-xs font-medium transition ${
                  activeTab === "upload"
                    ? "bg-white text-gray-800 shadow-xs dark:bg-gray-900 dark:text-white"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("url")}
                className={`flex-1 rounded-md py-1.5 text-xs font-medium transition ${
                  activeTab === "url"
                    ? "bg-white text-gray-800 shadow-xs dark:bg-gray-900 dark:text-white"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                {type === "video" ? "YouTube / Web Video URL" : "Image URL"}
              </button>
            </div>
          )}

          {/* Upload File Input */}
          {(type === "file" || activeTab === "upload") && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={
                  type === "image"
                    ? "image/*"
                    : type === "video"
                      ? "video/mp4,video/webm,video/ogg"
                      : "*/*"
                }
                onChange={handleFileChange}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-6 text-center transition hover:border-brand-500 hover:bg-brand-50/20 dark:border-gray-700 dark:bg-gray-800/40 dark:hover:border-brand-400"
              >
                <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  <UploadIcon className="size-5" />
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {fileData ? fileData.name : "Click to select or upload a file"}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {type === "image"
                    ? "PNG, JPG, WebP, GIF, SVG"
                    : type === "video"
                      ? "MP4, WebM, OGG"
                      : "PDF, DOCX, ZIP, Audio, or any file"}
                </p>
                {fileData && (
                  <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                    Selected ({fileData.size})
                  </span>
                )}
              </div>
            </div>
          )}

          {/* URL Input */}
          {type !== "file" && activeTab === "url" && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                {type === "video" ? "YouTube or Video URL" : "Direct Image URL"}
              </label>
              <Input
                type="url"
                placeholder={
                  type === "video"
                    ? "https://www.youtube.com/watch?v=... or .mp4 link"
                    : "https://example.com/image.jpg"
                }
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setErrorMessage("");
                }}
              />
            </div>
          )}

          {/* Extra metadata fields */}
          {type === "image" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Alt Text (for accessibility)
                </label>
                <Input
                  type="text"
                  placeholder="e.g. AI voice synthesizer studio"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Caption (optional)
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Figure 1: Speech synthesis waveform"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
              </div>
            </div>
          )}

          {type === "video" && (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                Video Caption (optional)
              </label>
              <Input
                type="text"
                placeholder="e.g. Watch the live voice generation demo"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>
          )}

          {type === "file" && (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                Attachment Display Name
              </label>
              <Input
                type="text"
                placeholder="e.g. Complete Voice Guide (PDF)"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
              />
            </div>
          )}

          {errorMessage && (
            <p className="text-xs text-error-500 dark:text-error-400">{errorMessage}</p>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/20">
          <Button size="sm" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button size="sm" variant="primary" onClick={handleInsert}>
            Insert into Article
          </Button>
        </div>
      </div>
    </Modal>
  );
}
