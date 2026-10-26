// "use client";
// import { useState } from "react";
// import Image from "next/image";
// import { FaUser } from "react-icons/fa";
// import Button from "@/components/ui/button/Button";
// import { Modal } from "@/components/ui/modal";
// import { Loading } from "@/components/gateway/loading";
// import {
//   authorProfileSchema,
//   blogRequest,
//   type AuthorProfile,
// } from "@/lib/gateway/blog-client";
// import { EditorPanel } from "./BlogEditorPanels";

// export default function BlogAuthorCard({
//   profile,
//   onChange,
// }: {
//   profile: AuthorProfile;
//   onChange: (profile: AuthorProfile) => void;
// }) {
//   const [open, setOpen] = useState(false),
//     [busy, setBusy] = useState(false),
//     [error, setError] = useState("");
//   const [draft, setDraft] = useState({
//     name: "",
//     designation: "",
//     avatar_url: "",
//     description: "",
//   });
//   const inputClass =
//     "mt-1 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:text-gray-100";
//   async function save(event: React.FormEvent) {
//     event.preventDefault();
//     if (busy) return;
//     setBusy(true);
//     setError("");
//     try {
//       const saved = await blogRequest("", "profile", authorProfileSchema, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(draft),
//       });
//       onChange(saved);
//       setOpen(false);
//     } catch (error) {
//       setError(
//         error instanceof Error ? error.message : "Profile could not be saved.",
//       );
//     } finally {
//       setBusy(false);
//     }
//   }
//   return (
//     <EditorPanel title="Author">
//       <div className="flex items-center gap-3">
//         {profile.avatar_url ? (
//           <Image
//             unoptimized
//             src={profile.avatar_url}
//             alt={profile.name || "Author avatar"}
//             width={56}
//             height={56}
//             className="h-14 w-14 rounded-full object-cover"
//           />
//         ) : (
//           <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800">
//             <FaUser aria-hidden="true" />
//           </span>
//         )}
//         <div>
//           <p className="font-medium text-gray-800 dark:text-white">
//             {profile.name || "Your name"}
//           </p>
//           <p className="text-sm text-gray-500 dark:text-gray-400">
//             {profile.designation || "Designation missing"}
//           </p>
//         </div>
//       </div>
//       <div>
//         <p className="text-xs text-gray-500 dark:text-gray-400">Description</p>
//         <p className="mt-1 text-sm whitespace-pre-line text-gray-700 dark:text-gray-300">
//           {profile.description || "Add a short author description."}
//         </p>
//       </div>
//       {!profile.complete && (
//         <p
//           role="status"
//           className="text-xs text-warning-600 dark:text-warning-400"
//         >
//           Complete your name, avatar, designation and description before
//           publishing. Drafts can still be saved.
//         </p>
//       )}
//       <Button
//         size="sm"
//         variant="outline"
//         onClick={() => {
//           setDraft({
//             name: profile.name,
//             designation: profile.designation || "",
//             avatar_url: profile.avatar_url || "",
//             description: profile.description || "",
//           });
//           setError("");
//           setOpen(true);
//         }}
//         className="cursor-pointer"
//       >
//         {profile.complete ? "Edit profile" : "Complete profile"}
//       </Button>
//       {open && (
//         <Modal
//           isOpen
//           onClose={() => {
//             if (!busy) setOpen(false);
//           }}
//           showCloseButton={false}
//           className="mx-4 max-h-full max-w-lg overflow-y-auto p-6"
//         >
//           <div
//             role="dialog"
//             aria-modal="true"
//             aria-labelledby="blog-author-profile-title"
//           >
//             <h2
//               id="blog-author-profile-title"
//               className="mb-4 text-lg font-semibold text-gray-900 dark:text-white"
//             >
//               Author profile
//             </h2>
//             <form onSubmit={save}>
//               <fieldset
//                 disabled={busy}
//                 className="space-y-4 text-sm text-gray-700 dark:text-gray-300"
//               >
//                 <label className="block">
//                   Name
//                   <input
//                     required
//                     maxLength={80}
//                     value={draft.name}
//                     onChange={(event) =>
//                       setDraft({ ...draft, name: event.target.value })
//                     }
//                     className={inputClass}
//                   />
//                 </label>
//                 <label className="block">
//                   Avatar URL
//                   <input
//                     required
//                     type="url"
//                     maxLength={512}
//                     value={draft.avatar_url}
//                     onChange={(event) =>
//                       setDraft({ ...draft, avatar_url: event.target.value })
//                     }
//                     className={inputClass}
//                   />
//                 </label>
//                 <label className="block">
//                   Designation
//                   <input
//                     required
//                     maxLength={160}
//                     value={draft.designation}
//                     onChange={(event) =>
//                       setDraft({ ...draft, designation: event.target.value })
//                     }
//                     className={inputClass}
//                   />
//                 </label>
//                 <label className="block">
//                   Description
//                   <textarea
//                     required
//                     maxLength={2000}
//                     rows={4}
//                     value={draft.description}
//                     onChange={(event) =>
//                       setDraft({ ...draft, description: event.target.value })
//                     }
//                     className={inputClass}
//                   />
//                 </label>
//               </fieldset>
//               {error && (
//                 <p
//                   role="alert"
//                   className="mt-3 text-sm text-error-600 dark:text-error-400"
//                 >
//                   {error}
//                 </p>
//               )}
//               <div className="mt-5 flex gap-3">
//                 <Button type="submit" disabled={busy}>
//                   {busy ? (
//                     <Loading label="Saving profile..." />
//                   ) : (
//                     "Save profile"
//                   )}
//                 </Button>
//                 <Button
//                   variant="outline"
//                   disabled={busy}
//                   onClick={() => setOpen(false)}
//                 >
//                   Cancel
//                 </Button>
//               </div>
//             </form>
//           </div>
//         </Modal>
//       )}
//     </EditorPanel>
//   );
// }

"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { FaCamera, FaSpinner, FaUser } from "react-icons/fa";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { Loading } from "@/components/gateway/loading";
import {
  authorProfileSchema,
  avatarUploadSchema,
  blogRequest,
  type AuthorProfile,
} from "@/lib/gateway/blog-client";
import { EditorPanel } from "./BlogEditorPanels";
import { compressImage } from "@/utils/compressImage";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB

export default function BlogAuthorCard({
  profile,
  onChange,
}: {
  profile: AuthorProfile;
  onChange: (profile: AuthorProfile) => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [draft, setDraft] = useState({
    name: "",
    designation: "",
    avatar_url: "",
    description: "",
  });

  const inputBase =
    "w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:text-gray-100";
  const inputClass = `mt-1 ${inputBase}`;

  // ---- Avatar pe click -> file picker ----
  function openFilePicker() {
    if (busy || uploading) return;
    fileInputRef.current?.click();
  }

  // ---- File select hone ke baad upload ----
  async function handleAvatarFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // same file dobara select ho sake

    if (!file || busy || uploading) return;

    setUploading(true);
    setError("");

    try {
      const compressed = await compressImage(file, {
        maxWidth: 512,
        maxHeight: 512,
        quality: 0.82,
      });
      if (compressed.size > MAX_AVATAR_SIZE) {
        throw new Error(
          "Compressed avatar must be no larger than 2 MiB. Choose a smaller image.",
        );
      }
      const data = await blogRequest("", "avatar", avatarUploadSchema, {
        method: "POST",
        headers: {
          "Content-Type":
            compressed.type === "image/jpg" ? "image/jpeg" : compressed.type,
        },
        body: compressed,
      });
      setDraft((prev) => ({ ...prev, avatar_url: data.url }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Image upload nahi ho saki.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (busy || uploading) return;

    if (!draft.avatar_url.trim()) {
      setError("Pehle avatar upload karein.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const saved = await blogRequest("", "profile", authorProfileSchema, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      onChange(saved);
      setOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Profile could not be saved.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <EditorPanel title="Author">
      <div className="flex items-center gap-3">
        {profile.avatar_url ? (
          <Image
            unoptimized
            src={profile.avatar_url}
            alt={profile.name || "Author avatar"}
            width={56}
            height={56}
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800">
            <FaUser aria-hidden="true" />
          </span>
        )}
        <div>
          <p className="font-medium text-gray-800 dark:text-white">
            {profile.name || "Your name"}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {profile.designation || "Designation missing"}
          </p>
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">Description</p>
        <p className="mt-1 text-sm whitespace-pre-line text-gray-700 dark:text-gray-300">
          {profile.description || "Add a short author description."}
        </p>
      </div>

      {!profile.complete && (
        <p
          role="status"
          className="text-xs text-warning-600 dark:text-warning-400"
        >
          Complete your name, avatar, designation and description before
          publishing. Drafts can still be saved.
        </p>
      )}

      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          setDraft({
            name: profile.name,
            designation: profile.designation || "",
            avatar_url: profile.avatar_url || "",
            description: profile.description || "",
          });
          setError("");
          setOpen(true);
        }}
        className="cursor-pointer"
      >
        {profile.complete ? "Edit profile" : "Complete profile"}
      </Button>

      {open && (
        <Modal
          isOpen
          onClose={() => {
            if (!busy && !uploading) setOpen(false);
          }}
          showCloseButton={false}
          className="mx-4 max-h-full max-w-lg overflow-y-auto p-6"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="blog-author-profile-title"
          >
            <h2
              id="blog-author-profile-title"
              className="mb-4 text-lg font-semibold text-gray-900 dark:text-white"
            >
              Author profile
            </h2>

            <form onSubmit={save}>
              <fieldset
                disabled={busy}
                className="space-y-4 text-sm text-gray-700 dark:text-gray-300"
              >
                {/* ---- Avatar + Name side by side, vertically center ---- */}
                <div className="flex items-center gap-4">
                  {/* Avatar circle (click -> file picker) */}
                  <button
                    type="button"
                    onClick={openFilePicker}
                    disabled={busy || uploading}
                    title="Avatar change karne ke liye click karein"
                    className="group relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-gray-300 bg-gray-100 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800"
                  >
                    {draft.avatar_url ? (
                      <Image
                        unoptimized
                        src={draft.avatar_url}
                        alt="Avatar preview"
                        width={80}
                        height={80}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <FaUser
                        aria-hidden="true"
                        className="h-8 w-8 text-gray-400"
                      />
                    )}

                    {/* Hover overlay (camera icon) */}
                    <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <FaCamera
                        aria-hidden="true"
                        className="h-6 w-6 text-white"
                      />
                    </span>

                    {/* Uploading spinner */}
                    {uploading && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <FaSpinner
                          aria-hidden="true"
                          className="h-6 w-6 animate-spin text-white"
                        />
                      </span>
                    )}
                  </button>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarFile}
                  />

                  {/* Name input (avatar ke barabar, center aligned) */}
                  <label className="block flex-1">
                    <input
                      required
                      maxLength={80}
                      value={draft.name}
                      onChange={(event) =>
                        setDraft({ ...draft, name: event.target.value })
                      }
                      className={inputBase}
                    />
                  </label>
                </div>

                <label className="block">
                  Designation
                  <input
                    required
                    maxLength={160}
                    value={draft.designation}
                    onChange={(event) =>
                      setDraft({ ...draft, designation: event.target.value })
                    }
                    className={inputClass}
                  />
                </label>

                <label className="block">
                  Description
                  <textarea
                    required
                    maxLength={2000}
                    rows={4}
                    value={draft.description}
                    onChange={(event) =>
                      setDraft({ ...draft, description: event.target.value })
                    }
                    className={inputClass}
                  />
                </label>
              </fieldset>

              {error && (
                <p
                  role="alert"
                  className="mt-3 text-sm text-error-600 dark:text-error-400"
                >
                  {error}
                </p>
              )}

              {/* ---- Buttons: equal width, poori row ---- */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Button
                  type="submit"
                  disabled={busy || uploading}
                  className="w-full cursor-pointer"
                >
                  {busy ? (
                    <Loading label="Saving profile..." />
                  ) : (
                    "Save profile"
                  )}
                </Button>
                <Button
                  variant="outline"
                  disabled={busy || uploading}
                  onClick={() => setOpen(false)}
                  className="w-full cursor-pointer"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </EditorPanel>
  );
}
