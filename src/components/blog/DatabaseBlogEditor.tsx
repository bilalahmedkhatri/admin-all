"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { z } from "zod";
import ComponentCard from "@/components/common/ComponentCard";
import { FaEye, FaPaperPlane, FaPlus, FaSave } from "react-icons/fa";
import {
  ArticlePreview,
  CoverImageCard,
  EditorPanel,
  EditorStats,
  SearchPreview,
} from "./BlogEditorPanels";
import Button from "@/components/ui/button/Button";
import { Loading } from "@/components/gateway/loading";
import {
  blogImage,
  blogAudio,
  blogYoutube,
  standardBlogDocument,
  insertBlogMedia,
} from "./extensions/blogMedia";
import BlogMediaPicker from "./BlogMediaPicker";
import {
  attributedImageContent,
  savedCoverDetails,
  emptyAttribution,
  type CoverImageDetails,
} from "./imageAttribution";
import BlogPageHeader from "./BlogPageHeader";
import BlogAuthorCard from "./BlogAuthorCard";
import { Modal } from "@/components/ui/modal";
import { blogCatalogSchema, type BlogApp } from "@/lib/gateway/blog";
import BlogEditorToolbar from "./BlogEditorToolbar";
import { blogTables } from "./extensions/blogTables";
import {
  postSchema,
  categoryListSchema,
  assetSchema,
  authorProfileSchema,
  type AuthorProfile,
  blogRequest,
  type BlogPost,
  type BlogCategory,
  type BlogAsset,
  BlogRequestError,
  type BlogEditorInitialData,
} from "@/lib/gateway/blog-client";

const noop = () => { };
const empty: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };
const fieldClass =
  "mt-1 block w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100";
export default function DatabaseBlogEditor({
  initialProfile,
  onUnsavedChange = noop,
  onBusyChange = noop,
  canCreate,
  canUpdate,
  canPublish,
  initialPost,
}: {
  initialProfile: { name: string; email: string };
  onUnsavedChange?: (dirty: boolean) => void;
  onBusyChange?: (busy: boolean) => void;
  canCreate: boolean;
  canUpdate: boolean;
  canPublish: boolean;
  initialPost?: BlogEditorInitialData;
}) {
  const t = useTranslations("blog");
  const router = useRouter();
  const [appKey, setAppKey] = useState(initialPost?.app.key ?? "");
  const [apps, setApps] = useState<BlogApp[]>(
    initialPost ? [initialPost.app] : [],
  );
  const [targetOpen, setTargetOpen] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [targetStatus, setTargetStatus] = useState<BlogPost["status"]>("draft");
  const [status, setStatus] = useState<BlogPost["status"]>(
    initialPost?.post.status ?? "draft",
  );
  const [newCategory, setNewCategory] = useState(false);
  const [preview, setPreview] = useState<JSONContent | null>(null);
  const [coverOpen, setCoverOpen] = useState(false);
  const refreshVersion = useRef(0);
  const profileRequest = useRef<{
    email: string;
    request: Promise<AuthorProfile>;
    loaded: boolean;
  } | null>(null);
  useEffect(
    () => () => {
      refreshVersion.current++;
    },
    [appKey],
  );
  const [post, setPost] = useState<BlogPost | null>(initialPost?.post ?? null);
  const [categories, setCategories] = useState<BlogCategory[]>(
    initialPost?.categories ?? [],
  );
  const [assets, setAssets] = useState<BlogAsset[]>(initialPost?.assets ?? []);
  const [title, setTitle] = useState(initialPost?.post.title ?? ""),
    [category, setCategory] = useState(
      initialPost?.categories.find(
        (item) => item.id === initialPost.post.category_id,
      )?.name ?? "",
    ),
    [excerpt, setExcerpt] = useState(initialPost?.post.excerpt ?? "");
  const [locale, setLocale] = useState(initialPost?.post.locale ?? "en"),
    [cover, setCover] = useState<number | null>(
      initialPost?.post.cover_asset_id ?? null,
    );
  const [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(false),
    [dirty, setDirty] = useState(false);
  const [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [profile, setProfile] = useState<AuthorProfile>({
    name: "",
    designation: null,
    avatar_url: null,
    description: null,
    complete: false,
    missing_fields: ["name", "avatar_url", "designation", "description"],
  });
  const [coverDetails, setCoverDetails] = useState<CoverImageDetails | null>(
    initialPost
      ? savedCoverDetails(
        initialPost.post.metadata_json,
        initialPost.post.cover_asset_id,
      )
      : null,
  );
  const [canonical, setCanonical] = useState<string | null>(
    initialPost?.publicBlogUrl ?? null,
  );
  const [categoryChanged, setCategoryChanged] = useState(false);
  const [uncertainCreate, setUncertainCreate] = useState(false);
  const writable = post
    ? canUpdate && (post.status !== "published" || canPublish)
    : canCreate;
  const [initialDocument] = useState(() =>
    initialPost?.post.content_json
      ? standardBlogDocument(initialPost.post.content_json as JSONContent)
      : empty,
  );
  const markDirty = useCallback(() => setDirty(true), []);
  const editor = useEditor({
    extensions: [StarterKit, blogTables, blogImage, blogAudio, blogYoutube],
    content: initialDocument,
    immediatelyRender: false,
    editable: false,
    onUpdate: markDirty,
    editorProps: {
      attributes: {
        class:
          "min-h-96 p-5 leading-relaxed text-gray-800 outline-none sm:p-6 dark:text-gray-100",
      },
    },
  });
  useEffect(() => {
    onBusyChange(
      busy ||
      loading ||
      mediaOpen ||
      dialogOpen ||
      coverOpen ||
      Boolean(preview),
    );
    return () => onBusyChange(false);
  }, [busy, loading, mediaOpen, dialogOpen, coverOpen, preview, onBusyChange]);
  useEffect(() => {
    onUnsavedChange(dirty);
  }, [dirty, onUnsavedChange]);
  useEffect(() => {
    editor?.setEditable(writable && !busy && !loading, false);
  }, [editor, writable, busy, loading]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    const guardNavigation = (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const anchor =
        event.target instanceof Element ? event.target.closest("a") : null;
      if (
        !anchor ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      )
        return;
      const next = new URL(anchor.href, window.location.href);
      if (
        next.origin !== window.location.origin ||
        next.pathname + next.search ===
        window.location.pathname + window.location.search
      )
        return;
      if (!window.confirm("Discard unsaved changes?")) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", warn);
    document.addEventListener("click", guardNavigation, true);
    return () => {
      window.removeEventListener("beforeunload", warn);
      document.removeEventListener("click", guardNavigation, true);
    };
  }, [dirty]);
  useEffect(() => {
    let active = true;
    const pending = profileRequest.current;
    // Keep this mount's loaded profile through Fast Refresh. Profile saves update
    // local state directly; replaying an old response must not overwrite them.
    if (pending?.email === initialProfile.email && pending.loaded) return;
    const entry =
      pending?.email === initialProfile.email
        ? pending
        : {
          email: initialProfile.email,
          request: blogRequest("", "profile", authorProfileSchema),
          loaded: false,
        };
    profileRequest.current = entry;
    entry.request
      .then((author) => {
        if (active && !entry.loaded) {
          entry.loaded = true;
          setProfile(author);
        }
      })
      .catch(() => {
        if (entry.loaded) return;
        if (profileRequest.current === entry) profileRequest.current = null;
        if (active)
          setError(
            "Your author profile could not be loaded. Retry by reloading the page.",
          );
      });
    return () => {
      active = false;
    };
  }, [initialProfile.email]);
  function updateProfile(author: AuthorProfile) {
    const entry = profileRequest.current;
    if (entry?.email === initialProfile.email) entry.loaded = true;
    setProfile(author);
  }
  async function prepareApp(key: string) {
    setLoading(true);
    setError("");
    try {
      const [cats, media, settings] = await Promise.all([
        blogRequest(key, "categories", categoryListSchema, undefined, {
          page_size: "100",
        }),
        blogRequest(
          key,
          "assets",
          z.object({ assets: z.array(assetSchema) }),
          undefined,
          { page_size: "100" },
        ),
        blogRequest(
          key,
          "settings",
          z.object({ public_blog_url: z.string().nullable() }),
        ),
      ]);
      setCategories(cats.items);
      setAssets(media.assets);
      setCanonical(settings.public_blog_url);
      if (key !== appKey) {
        setNewCategory(false);
        setCategory("");
        setCategoryChanged(true);
        setCover(null);
        setCoverDetails(null);
      }
      setAppKey(key);
      return cats.items;
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "The app could not be loaded.",
      );
      return false;
    } finally {
      setLoading(false);
    }
  }
  async function chooseTarget(nextStatus: BlogPost["status"]) {
    setTargetStatus(nextStatus);
    setTargetOpen(true);
    setCatalogLoading(true);
    setError("");
    try {
      setApps((await blogRequest("", "apps", blogCatalogSchema)).apps);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Blog apps could not be loaded.",
      );
    } finally {
      setCatalogLoading(false);
    }
  }
  function apply(saved: BlogPost, categoryOptions = categories) {
    setCategoryChanged(false);
    setNewCategory(false);
    setPost(saved);
    setStatus(saved.status);
    setTitle(saved.title);
    setExcerpt(saved.excerpt);
    setLocale(saved.locale);
    setCover(saved.cover_asset_id);
    setCoverDetails(
      savedCoverDetails(saved.metadata_json, saved.cover_asset_id),
    );
    setCategory(
      categoryOptions.find((item) => item.id === saved.category_id)?.name || "",
    );
    if (saved.content_json)
      editor?.commands.setContent(
        standardBlogDocument(saved.content_json as JSONContent),
        {
          emitUpdate: false,
        },
      );
    setDirty(false);
  }
  function newPost() {
    if (busy || (dirty && !window.confirm("Discard unsaved changes?"))) return;
    refreshVersion.current++;
    setCategoryChanged(false);
    setNewCategory(false);
    setPost(null);
    setStatus("draft");
    setAppKey("");
    setCategories([]);
    setAssets([]);
    setCategoryChanged(false);
    setTitle("");
    setExcerpt("");
    setCategory("");
    setCover(null);
    setCoverDetails(null);
    setLocale("en");
    setNotice("");
    setError("");
    setUncertainCreate(false);
    editor?.commands.setContent(empty, { emitUpdate: false });
    setDirty(false);
    if (initialPost) router.push("/blog-editor/new");
  }
  async function save(status: "draft" | "published" | "archived") {
    if (!editor || busy || loading || !writable || uncertainCreate) return;
    if (Array.from(title.trim()).length > 70) {
      setError("Title must be 70 characters or fewer.");
      return;
    }
    if (!appKey) {
      await chooseTarget(status);
      return;
    }
    if (status === "published" && !profile.complete) {
      setError(
        "Complete your name, avatar, designation and description before publishing.",
      );
      return;
    }
    if (status === "published" && !canonical) {
      setError("Publishing is not configured for this app.");
      return;
    }
    setTargetOpen(false);
    const version = ++refreshVersion.current;
    setBusy(true);
    setError("");
    setNotice("");
    const existing = categories.find(
      (item) =>
        item.name.trim().toLocaleLowerCase() ===
        category.trim().toLocaleLowerCase(),
    );
    const payload = {
      title,
      excerpt,
      locale,
      status,
      content_json: editor.getJSON(),
      cover_asset_id: cover,
      cover_image: cover ? coverDetails : null,
      ...(!categoryChanged && post
        ? { category_id: post.category_id }
        : existing
          ? { category_id: existing.id }
          : category.trim()
            ? { category_name: category.trim() }
            : { category_id: null }),
      ...(post ? { version: post.version } : {}),
    };
    try {
      const data = await blogRequest(
        appKey,
        "posts",
        z.object({ post: postSchema, audit_recorded: z.boolean() }),
        {
          method: post ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
        post ? { id: String(post.id) } : {},
      );
      apply(data.post);
      setCategory(category);
      setNotice(
        data.audit_recorded
          ? "Post saved."
          : "Post saved. The activity log could not be recorded.",
      );
      // Refresh categories without keeping the editor locked after saving.
      void blogRequest(appKey, "categories", categoryListSchema, undefined, {
        page_size: "100",
      })
        .then((cats) => {
          if (refreshVersion.current === version) setCategories(cats.items);
        })
        .catch(() => {
          if (refreshVersion.current === version)
            setNotice("Post saved. Categories could not be refreshed.");
        });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "The blog request could not be completed.",
      );
      if (
        !post &&
        (!(error instanceof BlogRequestError) || error.status >= 500)
      ) {
        setUncertainCreate(true);
        setNotice(
          "The save result is uncertain. Refresh and check the saved posts before starting another new post. Your editor content is preserved.",
        );
      }
    } finally {
      setBusy(false);
    }
  }
  function insert(asset: BlogAsset) {
    insertBlogMedia(editor, attributedImageContent(asset));
    setAssets((items) => [
      asset,
      ...items.filter((item) => item.id !== asset.id),
    ]);
    setDirty(true);
  }
  const coverAsset = assets.find((item) => item.id === cover);
  const storedCover = (
    post?.metadata_json.open_graph as { image?: unknown } | undefined
  )?.image;
  const coverSrc =
    coverAsset?.public_url ||
    (cover &&
      post?.cover_asset_id === cover &&
      typeof storedCover === "string" &&
      storedCover.startsWith("https://")
      ? storedCover
      : undefined);
  const saveDisabled =
    busy ||
    loading ||
    !writable ||
    !title.trim() ||
    Array.from(title.trim()).length > 70 ||
    uncertainCreate;
  return (
    <div
      lang="en"
      dir="ltr"
      className="min-w-0 [&_[role=group]_button]:p-0 [&_button]:px-3 [&_button]:py-2 [&_button]:text-xs [&_input]:py-2 [&_select]:py-2"
      aria-busy={busy || loading}
    >
      <BlogPageHeader
        title={post ? t("editPost") : t("newBlog")}
        breadcrumb={{ label: t("blogs"), href: "/blog-editor/posts" }}
        context={
          appKey
            ? apps.find((app) => app.key === appKey)?.label || appKey
            : undefined
        }
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              disabled={busy || !canCreate}
              onClick={newPost}
              startIcon={<FaPlus aria-hidden="true" />}
              className="cursor-pointer"
            >
              {"New blog"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={saveDisabled}
              onClick={() => save(status)}
              startIcon={<FaSave aria-hidden="true" />}
              className="cursor-pointer"
            >
              {"Save changes"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={busy || !editor}
              onClick={() => editor && setPreview(editor.getJSON())}
              startIcon={<FaEye aria-hidden="true" />}
              className="cursor-pointer"
            >
              {"Preview"}
            </Button>
            {canPublish && (
              <Button
                size="sm"
                disabled={
                  saveDisabled ||
                  !profile.complete ||
                  (Boolean(appKey) && !canonical)
                }
                onClick={() =>
                  save(post?.status === "published" ? "draft" : "published")
                }
                startIcon={<FaPaperPlane aria-hidden="true" />}
                className="cursor-pointer"
              >
                {post?.status === "published" ? "Move to draft" : "Publish"}
              </Button>
            )}
          </>
        }
      />
      {error && (
        <p
          role="alert"
          className="mb-4 rounded-xl bg-error-50 p-4 text-sm text-error-600 dark:bg-error-500/10 dark:text-error-400"
        >
          {error}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="mb-4 rounded-xl bg-success-50 p-4 text-sm wrap-anywhere text-success-700 dark:bg-success-500/10 dark:text-success-400"
        >
          {notice}
        </p>
      )}
      {busy && (
        <div className="mb-4">
          <Loading label={"Working…"} />
        </div>
      )}
      <div className="grid min-w-0 grid-cols-1 items-start gap-6 xl:grid-cols-3">
        <div className="min-w-0 space-y-6 xl:col-span-2">
          <ComponentCard unstyledContent className="p-5 shadow-theme-xs sm:p-6">
            <fieldset disabled={busy || !writable} className="space-y-4">
              <label className="relative block text-sm font-medium text-gray-700 dark:text-gray-300">
                <input
                  className={`peer ${fieldClass} pt-7 text-xl font-semibold sm:text-2xl`}
                  value={title}
                  maxLength={70}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    markDirty();
                  }}
                />
                <span className="pointer-events-none absolute start-3 top-2 font-semibold tracking-wider text-gray-400 uppercase transition-colors peer-focus:text-gray-600 dark:text-gray-500 dark:peer-focus:text-gray-300">
                  Title
                </span>
              </label>
            </fieldset>
          </ComponentCard>
          <ComponentCard
            unstyledContent
            className="min-w-0 overflow-hidden shadow-theme-xs"
          >
            <div className="border-b border-gray-200 bg-gray-50 p-2 dark:border-gray-800 dark:bg-gray-900 [&_[role=toolbar]]:border-0 [&_[role=toolbar]]:bg-transparent [&_[role=toolbar]]:shadow-none">
              {editor && (
                <BlogEditorToolbar
                  editor={editor}
                  disabled={!writable || busy}
                  onUpload={() =>
                    appKey
                      ? setMediaOpen(true)
                      : setError(
                        "Save a draft and choose an app before uploading media.",
                      )
                  }
                  onDialogChange={setDialogOpen}
                />
              )}
            </div>
            <div className="tiptap-editor-content min-w-0">
              <EditorContent editor={editor} />
            </div>
            {editor && <EditorStats editor={editor} dirty={dirty} />}
          </ComponentCard>
          {editor && (
            <SearchPreview
              editor={editor}
              title={title}
              excerpt={excerpt}
              canonical={canonical?.replace("{locale}", locale) ?? null}
              slug={post?.slug}
            />
          )}
          <EditorPanel title={"Article summary"}>
            <fieldset disabled={busy || !writable}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {"Excerpt"}
                <textarea
                  className={`${fieldClass} py-3`}
                  value={excerpt}
                  maxLength={1000}
                  onChange={(e) => {
                    setExcerpt(e.target.value);
                    markDirty();
                  }}
                />
              </label>
            </fieldset>
          </EditorPanel>
        </div>
        <aside className="min-w-0 space-y-6">
          <EditorPanel title={"Publishing status"}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
              <select
                value={status}
                disabled={busy || loading || !writable}
                onChange={(event) => {
                  setStatus(event.target.value as BlogPost["status"]);
                  markDirty();
                }}
                className={fieldClass}
              >
                <option value="draft">Draft</option>
                <option
                  value="published"
                  disabled={!canPublish || !profile.complete}
                >
                  Published
                </option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <fieldset disabled={busy || !writable} className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {"Content language code"}
                <input
                  className={fieldClass}
                  value={locale}
                  disabled={Boolean(post?.status === "published")}
                  maxLength={35}
                  onChange={(e) => {
                    setLocale(e.target.value);
                    markDirty();
                  }}
                />
              </label>
            </fieldset>
            <div className="grid gap-2">
              {canPublish && (
                <Button
                  disabled={
                    saveDisabled ||
                    !profile.complete ||
                    (Boolean(appKey) && !canonical)
                  }
                  onClick={() =>
                    save(post?.status === "published" ? "draft" : "published")
                  }
                  className="w-full cursor-pointer"
                >
                  {post?.status === "published"
                    ? "Move to draft"
                    : "Save & publish"}
                </Button>
              )}
              <Button
                variant="outline"
                disabled={saveDisabled}
                onClick={() => save(status)}
                className="w-full cursor-pointer"
              >
                {"Save changes"}
              </Button>
            </div>
          </EditorPanel>
          <EditorPanel title="Category">
            <fieldset
              disabled={busy || loading || !writable || !appKey}
              className="space-y-3"
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
                <select
                  value={newCategory ? "__new__" : category}
                  onChange={(event) => {
                    const value = event.target.value;
                    setNewCategory(value === "__new__");
                    setCategory(value === "__new__" ? "" : value);
                    setCategoryChanged(true);
                    markDirty();
                  }}
                  className={fieldClass}
                >
                  <option value="">None</option>
                  {category &&
                    !newCategory &&
                    !categories.some((item) => item.name === category) && (
                      <option value={category}>{category}</option>
                    )}
                  {categories.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                  <option value="__new__">Add new category...</option>
                </select>
              </label>
              {newCategory && (
                <label className="block text-sm text-gray-700 dark:text-gray-300">
                  New category
                  <input
                    maxLength={128}
                    value={category}
                    onChange={(event) => {
                      setCategory(event.target.value);
                      setCategoryChanged(true);
                      markDirty();
                    }}
                    className={fieldClass}
                  />
                </label>
              )}
            </fieldset>
            {!appKey && (
              <p className="text-xs text-gray-500">
                Choose an app when saving to load its categories.
              </p>
            )}
          </EditorPanel>
          <CoverImageCard
            src={coverSrc}
            alt={coverDetails?.alt_text}
            disabled={busy || !writable}
            onChoose={() =>
              appKey
                ? setCoverOpen(true)
                : setError(
                  "Save a draft and choose an app before uploading a cover.",
                )
            }
            onRemove={() => {
              setCover(null);
              setCoverDetails(null);
              markDirty();
            }}
          >
            <fieldset disabled={busy || !writable}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {"Cover image"}
                <select
                  className={fieldClass}
                  value={cover || ""}
                  onChange={(e) => {
                    setCover(e.target.value ? Number(e.target.value) : null);
                    setCoverDetails(null);
                    markDirty();
                  }}
                >
                  <option value="">{"None"}</option>
                  {cover && !assets.some((item) => item.id === cover) && (
                    <option value={cover}>{"Current cover"}</option>
                  )}
                  {assets
                    .filter((item) => item.media_type.startsWith("image/"))
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.original_filename}
                      </option>
                    ))}
                </select>
              </label>
            </fieldset>
          </CoverImageCard>
          <BlogAuthorCard profile={profile} onChange={updateProfile} />
        </aside>
      </div>
      {targetOpen && (
        <Modal
          isOpen
          onClose={() => {
            if (!busy && !loading) setTargetOpen(false);
          }}
          showCloseButton={false}
          className="mx-4 max-w-lg p-6"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="blog-save-target"
          >
            <h2
              id="blog-save-target"
              className="text-lg font-semibold text-gray-900 dark:text-white"
            >
              Save post to an app
            </h2>
            <label className="mt-4 block text-sm text-gray-700 dark:text-gray-300">
              Blog app
              <select
                value={appKey}
                disabled={catalogLoading || loading || busy}
                onChange={(event) => {
                  if (event.target.value) void prepareApp(event.target.value);
                }}
                className={fieldClass}
              >
                <option value="">Select an app</option>
                {apps.map((app) => (
                  <option
                    key={app.key}
                    value={app.key}
                    disabled={!app.configured}
                  >
                    {app.label}
                    {app.configured ? "" : " (not configured)"}
                  </option>
                ))}
              </select>
            </label>
            {(catalogLoading || loading) && (
              <Loading label="Loading app settings..." />
            )}
            {error && (
              <p role="alert" className="mt-3 text-sm text-error-600">
                {error}
              </p>
            )}
            {appKey && (
              <fieldset disabled={loading || busy} className="mt-3 space-y-3">
                <label className="block text-sm text-gray-700 dark:text-gray-300">
                  Category
                  <select
                    value={newCategory ? "__new__" : category}
                    onChange={(event) => {
                      const value = event.target.value;
                      setNewCategory(value === "__new__");
                      setCategory(value === "__new__" ? "" : value);
                      setCategoryChanged(true);
                    }}
                    className={fieldClass}
                  >
                    <option value="">None</option>
                    {categories.map((item) => (
                      <option key={item.id} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                    <option value="__new__">Add new category...</option>
                  </select>
                </label>
                {newCategory && (
                  <label className="block text-sm text-gray-700 dark:text-gray-300">
                    New category
                    <input
                      value={category}
                      maxLength={128}
                      onChange={(event) => {
                        setCategory(event.target.value);
                        setCategoryChanged(true);
                      }}
                      className={fieldClass}
                    />
                  </label>
                )}
              </fieldset>
            )}
            <div className="mt-5 flex gap-3">
              <Button
                disabled={!appKey || loading || catalogLoading || saveDisabled}
                onClick={() => void save(targetStatus)}
              >
                Save
              </Button>
              <Button
                variant="outline"
                disabled={busy || loading}
                onClick={() => setTargetOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
      {mediaOpen && (
        <BlogMediaPicker
          appKey={appKey}
          onInsert={insert}
          onClose={() => setMediaOpen(false)}
        />
      )}
      {coverOpen && (
        <BlogMediaPicker
          appKey={appKey}
          imagesOnly
          initialAsset={
            cover && coverSrc
              ? {
                id: cover,
                public_url: coverSrc,
                media_type: coverAsset?.media_type ?? "image/jpeg",
                original_filename:
                  coverAsset?.original_filename ?? "Current cover",
                size_bytes: coverAsset?.size_bytes ?? 0,
                alt_text: coverDetails?.alt_text ?? "",
                attribution: coverDetails?.attribution ?? emptyAttribution,
              }
              : undefined
          }
          onInsert={(asset) => {
            setAssets((items) => [
              asset,
              ...items.filter((item) => item.id !== asset.id),
            ]);
            setCover(asset.id);
            setCoverDetails({
              alt_text: asset.alt_text ?? "",
              attribution: asset.attribution ?? emptyAttribution,
            });
            markDirty();
          }}
          onClose={() => setCoverOpen(false)}
        />
      )}
      {preview && (
        <ArticlePreview
          document={preview}
          title={title}
          author={post?.author_name || profile.name}
          category={category}
          cover={coverSrc}
          coverDetails={coverDetails ?? undefined}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  );
}
